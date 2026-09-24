import Icon from "../../ui/Icons";
import StatIcon from "../learning/StatIcon";
import FinkoinIcon from "./FinkoinIcon";
export default function DayRewardCard({ day, reward, status }: { day: number; reward: number; status: "done" | "current" | "future" }) {
  return <div className={`shop-day shop-day-${status}`} aria-label={`День ${day}: ${status === "done" ? "завершён" : status === "current" ? "следующая награда" : "впереди"}, ${reward} финкоинов`}><span className="shop-day-status">{status === "current" ? <StatIcon index={0}/> : status === "done" ? <Icon name="check" size={16}/> : <span className="shop-day-pending"/>}</span><span>День {day}</span><strong><FinkoinIcon/>+{reward}</strong></div>;
}
