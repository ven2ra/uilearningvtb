import { useId } from "react";

export default function TrainingLogo({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return <svg className={className} viewBox="0 0 300 270" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-learning-tile-face`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#41d9ff" /><stop offset=".3" stopColor="#0787ff" /><stop offset=".7" stopColor="#0060f6" /><stop offset="1" stopColor="#45dbf5" /></linearGradient>
        <linearGradient id={`${id}-learning-tile-edge`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#61eaff" /><stop offset=".55" stopColor="#0748e8" /><stop offset="1" stopColor="#97f2ff" /></linearGradient>
        <linearGradient id={`${id}-learning-tile-chart`} x2="0" y2="1"><stop stopColor="#d0ffff" /><stop offset="1" stopColor="#68d8ff" /></linearGradient>
        <filter id={`${id}-learning-tile-shadow`} x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="12" /></filter>
        <linearGradient id={`${id}-learning-tile-gloss`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#ffffff" stopOpacity=".55" /><stop offset=".38" stopColor="#ffffff" stopOpacity="0" /><stop offset=".8" stopColor="#003ab8" stopOpacity=".2" /><stop offset="1" stopColor="#003ab8" stopOpacity="0" /></linearGradient>
        <filter id={`${id}-learning-tile-depth`} x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="7" dy="12" stdDeviation="7" floodColor="#164fb1" floodOpacity=".4" /></filter>
        <filter id={`${id}-learning-chart-shadow`}><feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#003390" floodOpacity=".7" /></filter>
      </defs>
      <ellipse cx="157" cy="237" rx="99" ry="12" fill="#4c82e8" opacity=".6" filter={`url(#${id}-learning-tile-shadow)`} />
      <g filter={`url(#${id}-learning-tile-depth)`}><g transform="translate(62 18) rotate(7 105 100) skewX(-13)">
        <rect x="11" y="13" width="202" height="207" rx="27" fill={`url(#${id}-learning-tile-edge)`} />
        <rect width="202" height="207" rx="27" fill={`url(#${id}-learning-tile-face)`} stroke="#85e5ff" strokeWidth="1.5" />
        <rect x="1" y="1" width="200" height="205" rx="26" fill={`url(#${id}-learning-tile-gloss)`} />
        <path d="M27 3H175Q200 3 200 28" fill="none" stroke="#dcffff" strokeOpacity=".65" strokeWidth="2" />
        <g fill={`url(#${id}-learning-tile-chart)`} filter={`url(#${id}-learning-chart-shadow)`}>
          <path d="M45 114h18V92l-18 13zm30 0h18V83L75 97zm31 0h18V71l-18 15z" />
          <path d="m39 81 38-30 21 17 34-37-13-9h39l-4 38-12-12-42 44-23-17-30 23z" stroke="#96ecff" strokeLinejoin="round" strokeWidth="2" />
        </g>
        <text x="101" y="177" textAnchor="middle" fill="white" fontFamily="Arial,sans-serif" fontWeight="800" fontStyle="italic" fontSize="55">ВТБ</text>
      </g></g>
    </svg>;
}
