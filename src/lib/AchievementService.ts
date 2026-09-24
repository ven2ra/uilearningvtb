import { COURSE } from "./course";
import { LEARNING_ACHIEVEMENTS, type LearningAchievementCondition } from "./achievements";

export interface LearningRewardProgress {
  completed: number;
  coins: number;
  days: string[];
  achievementProgress?: Record<string, { receivedAt: number; reward: number }>;
  quizAttempts?: Record<number, number>;
  quizResults?: Record<number, { score: number; attempts: number; completedAt: number }>;
  completedTasks?: number;
}

const topics: Record<string, number[]> = {
  basics: [0, 1], instruments: [2], risk: [3], portfolio: [4], strategies: [5], taxes: [6],
};

export function longestStudyStreak(days: string[]): number {
  const dates = [...new Set(days)].filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day))
    .map(day => Date.parse(`${day}T00:00:00Z`)).filter(Number.isFinite).sort((a, b) => a - b);
  let longest = 0, streak = 0;
  dates.forEach((date, i) => { streak = i > 0 && date - dates[i - 1] === 86400000 ? streak + 1 : 1; longest = Math.max(longest, streak); });
  return longest;
}

export function meetsAchievementCondition(condition: LearningAchievementCondition, progress: LearningRewardProgress): boolean {
  const completed = Math.max(0, Math.min(progress.completed, COURSE.length));
  const topicComplete = (id: string) => !!topics[id]?.length && topics[id].every(index => index < completed);
  switch (condition.type) {
    case "lesson_completed": return completed >= condition.minimum;
    case "study_streak": return longestStudyStreak(progress.days) >= condition.minimum;
    case "topic_completed": return topicComplete(condition.topic);
    case "topics_completed": return Object.keys(topics).filter(topicComplete).length >= condition.minimum;
    case "portfolio_lessons": return topics.portfolio.filter(index => index < completed).length >= condition.minimum;
    case "coins": return progress.coins >= condition.minimum;
    case "tasks_completed": return (progress.completedTasks ?? 0) >= condition.minimum;
    case "all_lessons": return COURSE.length > 0 && completed === COURSE.length;
    case "quiz_score": return completed === COURSE.length && COURSE.every((_, i) => (progress.quizResults?.[i]?.score ?? -1) >= condition.minimum);
    case "perfect_lessons": {
      let run = 0;
      for (let index = 0; index < completed; index++) {
        run = progress.quizResults?.[index]?.attempts === 1 ? run + 1 : 0;
        if (run >= condition.minimum) return true;
      }
      return false;
    }
  }
}

/** Pure, idempotent transaction: the award record and its coins are saved together. */
export function settleAchievements<T extends LearningRewardProgress>(progress: T, now = Date.now()): T {
  let next = progress;
  // Repeat to allow a coin-based achievement to depend on another earned reward.
  for (let pass = 0; pass < LEARNING_ACHIEVEMENTS.length; pass++) {
    const fresh = LEARNING_ACHIEVEMENTS.filter(item => !next.achievementProgress?.[item.id] && meetsAchievementCondition(item.condition, next));
    if (!fresh.length) break;
    next = { ...next, coins: next.coins + fresh.reduce((sum, item) => sum + item.reward, 0),
      achievementProgress: { ...next.achievementProgress, ...Object.fromEntries(fresh.map(item => [item.id, { receivedAt: now, reward: item.reward }])) } };
  }
  return next;
}
