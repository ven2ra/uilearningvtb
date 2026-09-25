import { useState } from "react";
import { useApp } from "../state/AppState";
import { exchangeInstruments, money, quoteChange, useExchangeQuotes } from "../lib/exchangeQuotes";
import "./ExchangeInstrument.css";
import reference from "../lib/exchangeReference.json";

const periods = ["Д", "Н", "М", "Г", "5Л", "Все"];
export default function ExchangeInstrument({ id }: { id: string }) {
  const app = useApp();
  const quotes = useExchangeQuotes();
  const item = exchangeInstruments.find(instrument => instrument.id === id);
  const [period, setPeriod] = useState(0);
  const [tab, setTab] = useState("Торги");
  if (!item) return <div className="exchange-instrument"><button onClick={app.back}>Назад в Биржу</button><p>Инструмент не найден</p></div>;
  const quote = quotes[id];
  const values = period === 0 ? quote.points : quote.points.map((value, index) => value + item.initial * period * .025 * (index / 95 - 1) + Math.sin(index / 8) * item.initial * period * .004 * Math.sin(Math.PI * index / 95));
  const low = Math.min(...values) * .999;
  const high = Math.max(...values) * 1.001;
  const y = (value: number) => 18 + (high - value) / (high - low) * 285;
  const line = values.map((value, index) => `${index / 95 * 550},${y(value)}`).join(" ");
  const stats = [["Цена открытия", money(item.open, item.decimals)], ["Минимальная цена", money(Math.min(...quote.points), item.decimals)], ["Максимальная цена", money(Math.max(...quote.points), item.decimals)], ["Тип инструмента", item.currency ? "Валюта" : "Акции"], ["Тикер", item.id]];
  const openOrder = (side: "buy" | "sell") => app.go("trade", { id, side, source: "exchange" });
  return <section className="exchange-instrument">
    <header className="ei-header"><button type="button" aria-label="Назад в Биржу" onClick={app.back}>←</button><div><h1>{item.title}</h1><span>{item.id}</span></div><span className="ei-star" aria-label={reference.favorites.some(favorite => favorite.subtitle === id) ? "В избранном" : "Не в избранном"}>{reference.favorites.some(favorite => favorite.subtitle === id) ? "★" : "☆"}</span></header>
    <nav className="ei-tabs" aria-label="Информация об инструменте">{["Торги", "Показатели", "Обзор"].map(label => <button key={label} aria-pressed={tab === label} onClick={() => setTab(label)}>{label}</button>)}</nav>
    <div className="ei-market"><span>Мосбиржа · Демо-котировки</span><time>{new Date(quote.updated).toLocaleTimeString("ru-RU")}</time></div>
    <div className="ei-price"><img src={item.image} width={40} height={40} alt=""/><div><strong data-testid="instrument-price">{money(quote.price, item.decimals)}</strong><p><span className={quote.price >= item.open ? "ei-positive" : "ei-negative"}>{quoteChange(item, quote.price)}</span> <small>за сегодня</small></p></div></div>
    {tab === "Торги" && <>
      <div className="ei-chart"><svg viewBox="0 0 625 345" role="img" aria-label={`График ${item.title}, период ${periods[period]}`}>
        {[0, 1, 2, 3, 4].map(index => { const value = high - (high - low) * index / 4; return <g key={index}><path d={`M0 ${y(value)} H550`} stroke="#e8e9ee"/><text x="560" y={y(value) + 4} fill="#75767f" fontSize="11">{value.toFixed(item.decimals)}</text></g>; })}
        {[0, 1, 2, 3, 4, 5, 6].map(index => <path key={index} d={`M${index * 91.7} 8 V315`} stroke="#f1f2f5"/>)}
        <polyline points={line} fill="none" stroke="#007aff" strokeWidth="1.6" vectorEffect="non-scaling-stroke"/>
        <path d={`M0 ${y(quote.price)} H550`} stroke="#999" strokeDasharray="2 3"/><circle cx="550" cy={y(quote.price)} r="3" fill="#007aff"/>
        {values.map((value, index) => <rect key={index} x={index / 95 * 550} y={318 - Math.abs(value - (values[index - 1] ?? value)) / item.initial * 6000} width="2" height={Math.max(1, Math.abs(value - (values[index - 1] ?? value)) / item.initial * 6000)} fill={value >= (values[index - 1] ?? value) ? "#8dd4a6" : "#f39a9a"}/>)}
        {(period === 0 ? ["10:00", "12:00", "14:00", "16:00", "18:00"] : ["Начало периода", "", "", "", "Сейчас"]).map((label, index) => <text key={index} x={index * 112 + 4} y="340" fontSize="10" fill="#75767f">{label}</text>)}
      </svg></div>
      <div className="ei-periods" aria-label="Период графика">{periods.map((label, index) => <button key={label} aria-pressed={period === index} onClick={() => setPeriod(index)}>{label}</button>)}</div>
      <section className="ei-demand"><h2>Предложение и спрос</h2><div className="ei-demand-bar"><span style={{ width: `${100 - quote.demand}%` }}/></div><div><span>{(100 - quote.demand).toFixed(2)}%</span><span>{quote.demand.toFixed(2)}%</span></div></section>
    </>}
    {tab === "Обзор" ? <section className="ei-statistics"><h2>Об инструменте</h2><p>{item.title} · {item.currency ? "Валютная пара к российскому рублю" : "Акции на Московской бирже"}.</p><p>Котировки и график моделируются для демонстрации интерфейса.</p></section> : <section className="ei-statistics"><h2>Статистика за день</h2>{stats.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>}
    <footer className="ei-actions"><button onClick={() => openOrder("sell")}>Продать<span>{money(Math.max(0, quote.price - 10 ** -item.decimals), item.decimals)}</span></button><button onClick={() => openOrder("buy")}>Купить<span>{money(quote.price, item.decimals)}</span></button></footer>
  </section>;
}
