import { useLayoutEffect, useRef, useState } from "react";
import reference from "../lib/exchangeReference.json";
import stockReference from "../lib/exchangeStocks.json";
import "./SourceExchange.css";
import { useApp } from "../state/AppState";
import { exchangeInstruments, money, quoteChange, useExchangeQuotes } from "../lib/exchangeQuotes";

const savedView = { sorted: false, active: 0, scroll: [0, 0, 0] };

const categories = ["Облигации", "Фонды", "Валюта", "Драгметаллы", "Облигации в валюте", "Структурные продукты", "Фьючерсы", "Опционы", "Индексы", "Иностранные акции"];
const tabs = ["Избранное", "Размещения", "Акции"];

export default function SourceExchange() {
  const app = useApp();
  const quotes = useExchangeQuotes();
  const liveRows = (rows: typeof reference.favorites) => rows.map(row => {
    const item = exchangeInstruments.find(instrument => instrument.id === row.subtitle)!;
    return { ...row, value: money(quotes[item.id].price, item.decimals), change: quoteChange(item, quotes[item.id].price) };
  });
  const favorites = liveRows(reference.favorites);
  const stocks = liveRows(stockReference);
  const [active, setActive] = useState(savedView.active);
  const [sorted, updateSorted] = useState(savedView.sorted);
  const setSorted = (value: boolean) => { savedView.sorted = value; updateSorted(value); };
  const [settings, setSettings] = useState(false);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  useLayoutEffect(() => { panels.current.forEach((panel, index) => { if (panel) panel.scrollTop = savedView.scroll[index]; }); }, []);
  const touch = useRef<{ x: number; y: number } | null>(null);
  function select(index: number) {
    savedView.active = index;
    setActive(index);
    setSettings(false);
  }
  return <section className="exchange-screen" aria-label="Биржа">
    <header className="exchange-header">
      <h1>Биржа</h1>
      <button type="button" className="exchange-settings" aria-label="Настроить порядок" aria-expanded={settings} onClick={() => setSettings(!settings)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M3 6h10m4 0h4M3 12h3m4 0h11M3 18h10m4 0h4M13 3v6M6 9v6m7 0v6" /></svg>
      </button>
      {settings && <div className="exchange-settings-menu">
        <button type="button" onClick={() => { setSorted(false); setSettings(false); }}>Исходный порядок {!sorted && "✓"}</button>
        <button type="button" onClick={() => { setSorted(true); setSettings(false); }}>{active !== 1 ? "По названию" : "В обратном порядке"} {sorted && "✓"}</button>
      </div>}
    </header>
    <div className="exchange-categories" data-tour="exchange-categories">
      <div role="tablist" aria-label="Разделы биржи" className="exchange-tabs">
        {tabs.map((label, index) => <button key={label} id={`exchange-tab-${index}`} role="tab" aria-selected={active === index} aria-controls={`exchange-panel-${index}`} tabIndex={active === index ? 0 : -1} onClick={() => select(index)} onKeyDown={event => {
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (active + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
            select(next);
            document.getElementById(`exchange-tab-${next}`)?.focus();
          }
        }}>{label}</button>)}
      </div>
      {categories.map(label => <span className="exchange-category" key={label}>{label}</span>)}
    </div>
    <div className="exchange-viewport" onTouchStart={event => { const t = event.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; }} onTouchEnd={event => {
      const start = touch.current; touch.current = null;
      if (!start) return;
      const t = event.changedTouches[0]; const dx = t.clientX - start.x;
      if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(t.clientY - start.y) * 1.5) select(Math.max(0, Math.min(tabs.length - 1, active + (dx < 0 ? 1 : -1))));
    }}>
      <div className="exchange-track" style={{ transform: `translateX(-${active * 100 / tabs.length}%)` }}>
        {[favorites, reference.placements, stocks].map((items, index) => <div key={index} ref={element => { panels.current[index] = element; }} onScroll={event => { savedView.scroll[index] = event.currentTarget.scrollTop; }} id={`exchange-panel-${index}`} role="tabpanel" aria-labelledby={`exchange-tab-${index}`} aria-hidden={active !== index} inert={active !== index} className={`exchange-panel ${index === 1 ? "exchange-placements" : index === 2 ? "exchange-stocks" : ""}`}>
          {index === 2 && <div className="exchange-stock-highlights">
            <div><strong>Дивидендный календарь</strong><div className="exchange-mini-logos">{stockReference.slice(0, 4).map(item => <img key={item.subtitle} src={item.image} alt="" width={22} height={22}/>)}<span>+12</span></div></div>
            <div><strong>Картина дня</strong><span>МосБиржа</span><div className="exchange-market-bar"><i/><i/></div></div>
          </div>}
          <button type="button" className="exchange-sort" onClick={() => setSorted(!sorted)}>{index === 1 ? "По дате окончания размещения" : sorted ? "По названию" : index === 0 ? "Мой порядок" : "По торговому обороту за день"}{index !== 0 && <span aria-hidden="true"> {sorted ? "▴" : "▾"}</span>}</button>
          <ul className="exchange-list">
            {(sorted ? index !== 1 ? [...items].sort((a, b) => a.title.localeCompare(b.title, "ru")) : [...items].reverse() : items).map((item, i) => <li className={`exchange-row ${index !== 1 ? "exchange-row-clickable" : ""}`} key={item.title}>
              {index !== 1 && <button type="button" className="exchange-instrument-link" aria-label={`Открыть ${item.title}`} onClick={event => { savedView.scroll[index] = event.currentTarget.closest<HTMLElement>(".exchange-panel")?.scrollTop ?? savedView.scroll[index]; app.go("instrument", { id: item.subtitle, source: "exchange" }); }} />}
              <span className={`exchange-logo ${index === 1 && i < 7 && !sorted ? "exchange-logo-ring" : ""}`}><img src={item.image} alt="" width={40} height={40} loading={i < 10 ? "eager" : "lazy"} />{index === 2 && reference.favorites.some(favorite => favorite.subtitle === item.subtitle) && <span className="exchange-favorite-star" aria-label="В избранном">★</span>}</span>
              <div className="exchange-name"><div>{item.title}</div><span>{item.subtitle}</span></div>
              <div className="exchange-quote"><div>{item.value}</div><span className={index === 1 ? "exchange-deadline" : item.change.startsWith("+") ? "exchange-up" : /^[−-]/.test(item.change) ? "exchange-down" : ""}>{item.change}</span></div>
            </li>)}
          </ul>
        </div>)}
      </div>
    </div>
  </section>;
}
