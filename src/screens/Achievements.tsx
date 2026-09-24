import { useEffect, useState } from "react";
import { useApp } from "../state/AppState";
import { LEARNING_ACHIEVEMENTS } from "../lib/achievements";
import BackButton from "../components/achievements/BackButton";
import AchievementHero from "../components/achievements/AchievementHero";
import AchievementStats from "../components/achievements/AchievementStats";
import AchievementGrid from "../components/achievements/AchievementGrid";
import "./Achievements.css";

export default function Achievements() {
  const app = useApp();
  const [celebrating, setCelebrating] = useState<string[]>([]);
  useEffect(() => {
    const event = app.achievementCelebration;
    if (!event || Date.now() - event.timestamp > 30000) return;
    setCelebrating(event.ids);
    const timer = window.setTimeout(() => setCelebrating([]), 3500);
    return () => window.clearTimeout(timer);
  }, [app.achievementCelebration]);
  const completed = LEARNING_ACHIEVEMENTS.filter(item => app.course.achievementProgress?.[item.id]).length;
  return <div className="achievements-screen">
    <BackButton onClick={app.back}/>
    <AchievementHero celebrationKey={app.achievementCelebration?.timestamp}/>
    <AchievementStats completed={completed} total={LEARNING_ACHIEVEMENTS.length} coins={app.course.coins}/>
    <AchievementGrid progress={app.course.achievementProgress} celebrating={celebrating}/>
    <span className="achievement-live" role="status">{celebrating.length > 0 ? `Открыто достижений: ${celebrating.length}. Финкоины начислены.` : ""}</span>
  </div>;
}
