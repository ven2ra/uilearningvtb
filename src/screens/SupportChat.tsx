import { useLayoutEffect, useRef, useState } from "react";
import { useApp } from "../state/AppState";
import "./ConnectedScreens.css";

type Message = { text: string; own: boolean; time: string };
const sessionMessages: Message[] = [{ text: "Здравствуйте! Вы в демонстрационном чате поддержки. Выберите тему или напишите сообщение.", own: false, time: "" }];
const topics = ["Тестирование", "Комиссии", "Маржинальная торговля", "Налоги", "Пополнения", "Оставить отзыв", "Конвертировать ИИС", "Вывод денег"];
export default function SupportChat() {
  const app = useApp();
  const [messages, setMessages] = useState([...sessionMessages]);
  const [draft, setDraft] = useState("");
  const list = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight }); }, [messages]);
  function send(text: string) {
    const value = text.trim(); if (!value) return;
    const time = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    const additions = [{ text: value, own: true, time }, { text: "Сообщение добавлено в демо-чат. В этом прототипе оператор не подключён.", own: false, time }];
    sessionMessages.push(...additions); setMessages([...sessionMessages]); setDraft("");
  }
  return <section className="support-screen"><header className="connected-header"><button aria-label="Назад на главную" onClick={() => app.tab("home")}>←</button><div><h1>Служба поддержки</h1><span>Демо-чат</span></div></header><div className="support-messages" ref={list}><div className="support-date">Сегодня</div>{messages.map((message, index) => <div className={`support-message ${message.own ? "support-own" : ""}`} key={index}>{!message.own && <img src="/exchange/a-1.png" alt="" width={40} height={40}/>}<div>{!message.own && <span className="support-sender">Служба поддержки</span>}<div className="support-bubble"><p>{message.text}</p><time>{message.time}{message.own && " ✓✓"}</time></div></div></div>)}<div className="support-topics">{topics.map(topic => <button key={topic} onClick={() => send(topic)}>{topic}</button>)}</div></div><form data-tour="support-compose" className="support-compose" onSubmit={event => { event.preventDefault(); send(draft); }}><input aria-label="Ваше сообщение" placeholder="Ваше сообщение" value={draft} maxLength={2000} onChange={event => setDraft(event.target.value)}/><button type="submit" disabled={!draft.trim()} aria-label="Отправить сообщение">➤</button></form></section>;
}
