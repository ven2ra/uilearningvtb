import { useEffect, useState } from "react";

const MESSAGES = ["Загрузка может занять некоторое время...\nБлагодарим за ваше терпение", "Ещё чуть-чуть..."];

export default function Splash({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const [msg, setMsg] = useState(0);

  useEffect(() => {
    const leave = setTimeout(() => setLeaving(true), 1400);
    const gone = setTimeout(onDone, 1700);
    const cycle = setInterval(() => setMsg((i) => (i + 1) % MESSAGES.length), 5000);
    return () => {
      clearTimeout(leave);
      clearTimeout(gone);
      clearInterval(cycle);
    };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[900] flex flex-col items-center justify-center bg-white transition-opacity duration-300"
      style={{ opacity: leaving ? 0 : 1 }}
    >
      <div className="flex h-12 items-center px-6 text-[22px] font-extrabold tracking-tight text-ink">ВТБ Мои Инвестиции</div>
      <div className="mt-10 h-10 w-10 text-brand">
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full animate-spin" style={{ animationDuration: "1s" }}>
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeOpacity="0.12" strokeWidth="4" />
          <path d="M24 4a20 20 0 0 1 19.8 17" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
      <div className="relative mt-6 w-full px-6 text-center text-[13px] leading-5 whitespace-pre-wrap text-ink-2">{MESSAGES[msg]}</div>
    </div>
  );
}
