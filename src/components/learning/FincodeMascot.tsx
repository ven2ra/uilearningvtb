import LearningArt from "./LearningArt";
export default function FincodeMascot() {
  return <div className="fincode-mascot" role="img" aria-label="Маскот Финкод">
    <LearningArt name="panel" className="fincode-panel fincode-panel-left" />
    <LearningArt name="panel" className="fincode-panel fincode-panel-right" />
    <LearningArt name="stars" className="fincode-stars" />
    <LearningArt name="stars" className="fincode-stars-small" />
    <div className="fincode-floating"><LearningArt name="robot" className="fincode-open" /><svg className="fincode-closed" viewBox="22 40 374 370" aria-hidden="true">
      <g transform="rotate(-18 202 204)"><ellipse cx="202" cy="204" rx="30" ry="22" fill="#06112a" /><path d="M187 207h30" stroke="#00cfff" strokeWidth="5" strokeLinecap="round" /></g>
      <g transform="rotate(-18 279 177)"><ellipse cx="279" cy="177" rx="29" ry="22" fill="#040d22" /><path d="M264 180h30" stroke="#00cfff" strokeWidth="5" strokeLinecap="round" /></g>
    </svg></div>
  </div>;
}
