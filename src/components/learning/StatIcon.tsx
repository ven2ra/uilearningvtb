import icons from "../../assets/learning/stats-icons.png";
export default function StatIcon({ index }: { index: number }) {
 return <svg className="learning-stat-icon" viewBox={`${index * 724} 0 724 724`} aria-hidden="true"><image href={icons} width="2172" height="724" /></svg>;
}
