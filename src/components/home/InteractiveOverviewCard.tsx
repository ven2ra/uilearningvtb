import { useRef, useState } from "react";
import trophy from "../../assets/overview/trophy.webp";
import "./InteractiveOverviewCard.css";

let dismissedForLaunch = false;

interface InteractiveOverviewCardProps {
  currentStep: number;
  totalSteps: number;
  onClick: () => void;
  highlight?: boolean;
}

export default function InteractiveOverviewCard({ currentStep, totalSteps, onClick, highlight = true }: InteractiveOverviewCardProps) {
  const [dismissed, setDismissed] = useState(dismissedForLaunch);
  const [offset, setOffset] = useState(0);
  const gesture = useRef<{ x: number; y: number; horizontal: boolean } | null>(null);
  const suppressClick = useRef(false);
  const total = Math.max(1, Math.floor(totalSteps) || 1);
  const current = Math.min(total, Math.max(0, Math.floor(currentStep) || 0));
  const filled = Math.ceil(current / total * 4);
  if (dismissed) return null;
  return <div className="overview-card-container" style={{ transform: `translateX(${offset}px)`, opacity: Math.max(.15, 1 - offset / 300) }}>
    <button type="button" className={`overview-card${highlight ? " overview-card-highlight" : ""}`} data-tour="home-tour-start"
      onPointerDown={event => { if (!event.isPrimary || event.button !== 0) return; suppressClick.current = false; gesture.current = { x: event.clientX, y: event.clientY, horizontal: false }; event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerMove={event => { const start = gesture.current; if (!start) return; const dx = event.clientX - start.x; const dy = event.clientY - start.y; if (!start.horizontal && Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { gesture.current = null; return; } if (dx > 10 && dx > Math.abs(dy) * 1.3) start.horizontal = true; if (start.horizontal) { suppressClick.current = true; setOffset(Math.max(0, dx)); } }}
      onPointerUp={event => { const start = gesture.current; if (start?.horizontal && event.clientX - start.x >= 80) { dismissedForLaunch = true; setDismissed(true); } gesture.current = null; setOffset(0); }}
      onPointerCancel={() => { gesture.current = null; setOffset(0); }}
      onClick={() => { if (!suppressClick.current) onClick(); suppressClick.current = false; }} aria-label={`Освойтесь в приложении. Короткий интерактивный обзор. ${current} из ${total}`}>
      <span className="overview-decoration" aria-hidden="true"><i/><i/><i/></span>
      <span className="overview-trophy"><img src={trophy} alt="" width={80} height={80} decoding="async"/></span>
      <span className="overview-copy"><strong>Освойтесь в приложении</strong><span className="overview-subtitle">Короткий интерактивный обзор</span><span className="overview-progress-row"><span className="overview-progress" role="progressbar" aria-label="Прогресс обзора" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current}>{Array.from({ length: 4 }, (_, index) => <span key={index} className={index < filled ? "is-filled" : ""}/>)}</span><span className="overview-count">{current} из {total}</span></span></span>
      <span className="overview-arrow" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
    </button>
  </div>;
}
