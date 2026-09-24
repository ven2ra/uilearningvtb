import { LEARNING_ACHIEVEMENTS } from "../../lib/achievements";
import type { LearningRewardProgress } from "../../lib/AchievementService";
import AchievementCard from "./AchievementCard";
export default function AchievementGrid({ progress, celebrating }: { progress: LearningRewardProgress["achievementProgress"]; celebrating: string[] }) {
  return <section className="achievement-grid" aria-label="Достижения обучения" data-tour="ach-grid">{LEARNING_ACHIEVEMENTS.map(achievement =>
    <AchievementCard key={achievement.id} achievement={achievement} receivedAt={progress?.[achievement.id]?.receivedAt} celebrating={celebrating.includes(achievement.id)}/>
  )}</section>;
}
