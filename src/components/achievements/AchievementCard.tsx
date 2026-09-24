import type { LearningAchievement } from "../../lib/achievements";
import Icon from "../../ui/Icons";
import AchievementIcon from "./AchievementIcon";
import AchievementReward from "./AchievementReward";
export default function AchievementCard({ achievement, receivedAt, celebrating }: { achievement: LearningAchievement; receivedAt?: number; celebrating: boolean }) {
  const completed = receivedAt !== undefined;
  return <article className={`achievement-card ${completed ? "is-completed" : "is-locked"}${celebrating ? " is-celebrating" : ""}`} data-achievement={achievement.id} data-status={completed ? "COMPLETED" : "LOCKED"}>
    <span className="achievement-status" role="img" aria-label={completed ? "Получено" : "Заблокировано"}><Icon name={completed ? "check" : "lock"} size={14}/></span>
    <div className="achievement-art" aria-hidden="true"><AchievementIcon name={achievement.icon}/></div>
    <h2>{achievement.title}</h2><p>{achievement.description}</p>
    <footer><AchievementReward amount={achievement.reward}/>{completed && <time dateTime={new Date(receivedAt).toISOString()}>{new Date(receivedAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" })}</time>}</footer>
  </article>;
}
