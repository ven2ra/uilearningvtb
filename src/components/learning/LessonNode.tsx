import { useId } from "react";

export default function LessonNode({ index, status }: { index: number; status: "active" | "locked" | "done" }) {
  const id = useId().replace(/:/g, "");
  const done = status === "done", active = status === "active";
  const available = done || active;
  return <svg className="lesson-node-art" viewBox="0 0 110 112" aria-hidden="true">
    <defs>
      <radialGradient id={`${id}-blue`} cx=".28" cy=".18" r=".95"><stop stopColor="#42c9ff" /><stop offset=".58" stopColor="#009aff" /><stop offset="1" stopColor="#006be9" /></radialGradient>
      <linearGradient id={`${id}-silver`} x2="1" y2="1"><stop stopColor="#aab8d0" /><stop offset="1" stopColor="#61779e" /></linearGradient>
      <linearGradient id={`${id}-white`} x2=".8" y2="1"><stop stopColor="#fff" /><stop offset="1" stopColor="#e4ebf5" /></linearGradient>
      <linearGradient id={`${id}-bars`} x2="0" y2="1"><stop stopColor="#79bdff" /><stop offset="1" stopColor="#0061e7" /></linearGradient>
      <filter id={`${id}-shadow`} x="-40%" y="-40%" width="180%" height="190%"><feDropShadow dy="3" stdDeviation={active ? 5 : 2} floodColor={active || done ? "#1685ee" : "#899bb8"} floodOpacity={active ? .5 : .25} /></filter>
    </defs>
    <g filter={`url(#${id}-shadow)`}>
      <circle cx="55" cy="56" r="38" fill={`url(#${id}-${available ? "blue" : "white"})`} stroke={available ? "#69ccff" : "#d6dfea"} strokeWidth={active ? 3 : 2} />
    </g>
    <g fill={available ? "white" : `url(#${id}-silver)`}>
      {index === 0 && <><path d="M39 43q9-3 14 1v26q-6-4-14-1zM57 44q5-4 14-1v26q-8-3-14 1z" /><path d="M55 44v27" stroke="#d0efff" /></>}
      {index === 1 && <g transform="translate(0 -6)" stroke={available ? "#159fff" : "#dce5f2"} strokeWidth="1.5"><path d="M52 48v19c0 8 24 8 24 0V48z" /><ellipse cx="64" cy="48" rx="12" ry="5" /><path d="M52 55c0 7 24 7 24 0M52 61c0 7 24 7 24 0" fill="none" /><path d="M35 63v8c0 7 25 7 25 0v-8z" /><ellipse cx="47.5" cy="63" rx="12.5" ry="5" /></g>}
      {index === 2 && <g fill={available ? "white" : `url(#${id}-silver)`} stroke="#8bc6ff" strokeWidth=".6"><rect x="35" y="60" width="10" height="19" rx="2" /><rect x="49" y="49" width="10" height="30" rx="2" /><rect x="63" y="38" width="10" height="41" rx="2" /></g>}
      {index === 3 && <><path d="M53 37A19 19 0 1 0 67 71L53 57Z" /><path d="M56 37v18h18A19 19 0 0 0 56 37M57 58l13 12a19 19 0 0 0 5-12Z" /></>}
      {index === 4 && <path d="M40 41q8 1 15-5 7 6 15 5v15q0 16-15 22-15-6-15-22z" />}
      {index === 5 && <g fill="none" stroke={available ? "white" : `url(#${id}-silver)`} strokeWidth="3"><circle cx="54" cy="58" r="17" /><circle cx="54" cy="58" r="11" /><circle cx="54" cy="58" r="5" /><path d="m54 58 23-25m-9 10 1-9 6-4v7l7 1-6 6z" fill={available ? "white" : `url(#${id}-silver)`} strokeWidth="2" /></g>}
      {index === 6 && <><path d="m29 49 26-12 26 12-26 12zM39 57v13q16 11 32 0V57L55 65z" /><path d="M79 51v18" stroke="#8496b6" strokeWidth="3" /></>}
    </g>
    {!active && <g><circle cx="94" cy="25" r="15" fill={done ? "#0084ff" : "#e4ebf6"} stroke="#f3f8ff" strokeWidth="2" />{done ? <path d="m88 25 4 4 8-9" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> : <g fill="#354563"><rect x="88" y="23" width="12" height="11" rx="2" /><path d="M90 24v-5a4 4 0 0 1 8 0v5" fill="none" stroke="#354563" strokeWidth="2.5" /><circle cx="94" cy="27" r="1.3" fill="#fff" /><path d="M94 28v3" stroke="white" /></g>}</g>}
  </svg>;
}
