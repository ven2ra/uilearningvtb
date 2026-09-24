import type { LearningAchievement } from "../../lib/achievements";
import { useId } from "react";
import learningAtlas from "../../assets/learning/illustrations.png";
import RewardArt from "../finkoin/RewardArt";
import book from "../../assets/achievements/book.png";
import calendar from "../../assets/achievements/calendar.png";
import target from "../../assets/achievements/target.png";
import shield from "../../assets/achievements/shield.png";
import star from "../../assets/achievements/star.png";
import bulb from "../../assets/achievements/bulb.png";
import diamond from "../../assets/achievements/diamond.png";

const images = { book, calendar, target, shield, star, bulb, diamond };
const cells = { pie: [39, 775, 314, 277], coins: [419, 468, 298, 282], chart: [50, 449, 293, 294], arrow: [407, 767, 313, 290] };
export default function AchievementIcon({ name }: { name: LearningAchievement["icon"] }) {
  const id = useId();
  if (name === "graduation") return <RewardArt name="course"/>;
  if (name === "pie" || name === "coins" || name === "chart" || name === "arrow") {
    const [x, y, width, height] = cells[name];
    return <svg viewBox={`${x} ${y} ${width} ${height}`} aria-hidden="true"><defs><clipPath id={id}><rect x={x} y={y} width={width} height={height}/></clipPath></defs><image href={learningAtlas} width="1448" height="1086" clipPath={`url(#${id})`}/></svg>;
  }
  return <img src={images[name]} alt="" loading="lazy"/>;
}
