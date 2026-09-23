import { useState } from "react";
import Icon from "../ui/Icons";
import { TopBar, cx } from "../ui/kit";

interface ChatMsg {
  id: number;
  from: "support" | "me";
  text: string;
}

const INTRO: ChatMsg[] = [
  { id: 1, from: "support", text: "Здравствуйте! Это чат поддержки ВТБ Мои Инвестиции. Чем можем помочь?" },
];

const REPLIES = [
  "Спасибо, что написали! Уточняю детали — обычно это занимает пару минут.",
  "Передал ваш вопрос специалисту, он скоро подключится к диалогу.",
  "Это учебный прототип: реальная поддержка здесь не отвечает, но интерфейс работает как настоящий.",
];

let uid = 100;

export default function Chat() {
  const [msgs, setMsgs] = useState<ChatMsg[]>(INTRO);
  const [value, setValue] = useState("");
  const [typing, setTyping] = useState(false);

  const send = () => {
    const text = value.trim();
    if (!text) return;
    setValue("");
    setMsgs((m) => [...m, { id: ++uid, from: "me", text }]);
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
      setMsgs((m) => [...m, { id: ++uid, from: "support", text: reply }]);
    }, 900 + Math.random() * 700);
  };

  return (
    <div className="flex min-h-full flex-col">
      <TopBar back title="Чат с поддержкой" subtitle="Обычно отвечаем за 2–3 минуты" />
      <div className="flex-1 px-4 py-3">
        <div className="flex flex-col gap-2">
          {msgs.map((m) => (
            <div key={m.id} className={cx("flex", m.from === "me" ? "justify-end" : "justify-start")}>
              <div
                className={cx(
                  "max-w-[78%] rounded-l px-3 py-2 text-[14px] leading-5",
                  m.from === "me" ? "bg-accent text-white" : "border border-line-subtle bg-surface",
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-l border border-line-subtle bg-surface px-3 py-2.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-ink-3 anim-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="sticky bottom-0 flex items-center gap-2 border-t border-line-subtle bg-surface px-3 py-2.5">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Напишите сообщение…"
          className="h-11 min-w-0 flex-1 rounded-m border border-line bg-page px-3 text-[14px] outline-none focus:border-accent"
        />
        <button type="button" onClick={send} disabled={!value.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-m bg-accent text-white disabled:bg-muted disabled:text-ink-4 cursor-pointer disabled:cursor-not-allowed" aria-label="Отправить">
          <Icon name="arrowUp" size={20} style={{ transform: "rotate(90deg)" }} />
        </button>
      </div>
      <p className="px-4 pb-3 pt-1 text-[11px] leading-4 text-ink-3">Учебный чат прототипа: ответы генерируются локально, реальная поддержка недоступна.</p>
    </div>
  );
}
