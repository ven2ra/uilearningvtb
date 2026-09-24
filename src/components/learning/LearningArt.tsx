import sheet from "../../assets/learning/illustrations.png";
const cells = { robot: [22, 40, 374, 370], blink: [399, 40, 374, 370], panel: [776, 57, 294, 356], stars: [1095, 36, 328, 361], bars: [50, 449, 293, 294], coins: [419, 468, 298, 282], cards: [744, 448, 330, 306], umbrella: [1108, 443, 301, 310], pie: [39, 775, 314, 277], trend: [407, 767, 313, 290], file: [767, 765, 300, 295], trophy: [1118, 773, 286, 274] };
export type LearningArtName = keyof typeof cells;
export default function LearningArt({ name, className = "" }: { name: LearningArtName; className?: string }) {
  return <svg className={className} viewBox={cells[name].join(" ")} aria-hidden="true"><image href={sheet} width="1448" height="1086" /></svg>;
}
