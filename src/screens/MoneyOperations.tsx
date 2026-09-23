import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useApp } from "../state/AppState";
import "./MoneyOperations.css";

const assets = import.meta.glob<string>("../assets/operations/*", { eager: true, query: "?url", import: "default" });
const asset = (name: string) => assets[`../assets/operations/${name}`];
function Glyph({ name, size = 24 }: { name: string; size?: number }) {
  return <img src={asset(`${name}.svg`)} width={size} height={size} alt="" />;
}
function Overlay({ children, close, label, sheet = false }: { children: ReactNode; close: () => void; label: string; sheet?: boolean }) {
  const app = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const root = ref.current;
    root?.querySelector<HTMLElement>("input,button")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key !== "Tab" || !root) return;
      const nodes = [...root.querySelectorAll<HTMLElement>('button:not(:disabled),input,select,[tabindex="0"]')];
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); previous?.focus(); };
  }, []);
  return createPortal(<div className={`money-overlay ${sheet ? "money-sheet-overlay" : ""}`} onClick={close}>
    <div ref={ref} role="dialog" aria-modal="true" aria-label={label} className={sheet ? "money-sheet" : "money-sms"} onClick={e => e.stopPropagation()}>{children}</div>
  </div>, app.frameRef.current ?? document.body);
}
export function MoneyActionsSheet() {
  const app = useApp();
  const [methods, setMethods] = useState(false);
  useEffect(() => { if (app.current.name !== "topup" && !app.actionsOpen) setMethods(false); }, [app.current.name, app.actionsOpen]);
  const close = () => { app.setActionsOpen(false); setMethods(false); };
  if (!app.actionsOpen) return null;
  const row = (name: string, text: string, click?: () => void, tour?: string) => <button className="money-action-row" onClick={click} data-tour={tour}><Glyph name={name} /><span>{text}</span><Glyph name="chevron" size={16} /></button>;
  return <Overlay close={close} label={methods ? "Пополнить" : "Действия"} sheet>
    <div className="money-handle" />
    <button className="money-close" aria-label="Закрыть" onClick={close}><Glyph name="close" /></button>
    {methods ? <>
      <header className="money-method-header"><button aria-label="Назад" onClick={() => setMethods(false)}><Glyph name="back" /></button>Пополнить</header>
      {row("vtb", "Со счета в банке ВТБ", () => app.openFromActions("topup"))}
      <div className="money-card-strip">{["8119", "8293", "8610", "3493", "8240", "0908", "6972", "4046"].map(n => <button key={n} onClick={n === "8119" ? () => app.openFromActions("topup") : undefined}><span><Glyph name="card" size={16} /></span>*{n}</button>)}</div>
      {row("sbp", "С моего счета в другом банке")}
      <div className="money-bank-strip">{["Сбербанк", "Т-Банк", "АЛЬФА-БАНК", "Райффайзенбанк", "Газпромбанк", "Банк ПСБ", "Совкомбанк"].map((name, i) => <div key={name}><img src={asset(`bank-${i}.png`)} alt="" />{name}</div>)}</div>
      {row("bank", "По реквизитам")}
    </> : <div data-tour="actions-sheet" className="money-actions">
      <h2>Пополнения и выводы</h2>
      {row("plus", "Пополнить", () => setMethods(true), "action-topup")}
      {row("transfer", "Между счетами", () => app.openFromActions("transfer"))}
      {row("withdraw", "Вывести", () => app.openFromActions("withdraw"), "action-withdraw")}
      <h2>Услуги и действия со счетом</h2>
      {row("margin", "Маржинальная торговля")}
      {row("file", "Отчеты и справки", () => app.openFromActions("documents"), "action-docs")}
    </div>}
  </Overlay>;
}

type Kind = "topup" | "transfer" | "withdraw";
const accounts = ["11MD3A • Основной", "11MD3A • Внебиржевой"];
function AccountCard({ bank, balance, account, onSelect, label, children }: { bank?: boolean; balance: string; account: string; onSelect?: (value: string) => void; label: string; children?: ReactNode }) {
  return <div className="money-account"><div className="money-account-main">
    <Glyph name={bank ? "master" : "broker"} size={40} />
    <div><strong>{balance} ₽</strong><span>{bank ? "Мастер-счет в рублях" : "Брокерский счет"}</span><span>{account}</span></div>
    <Glyph name="down" />
    {onSelect && <select aria-label={label} value={account} onChange={e => onSelect(e.target.value)}>{accounts.map(a => <option key={a}>{a}</option>)}</select>}
  </div>{children && <div className="money-account-details">{children}</div>}</div>;
}
function Field({ label, children }: { label: string; children: ReactNode }) { return <div className="money-detail"><dt>{label}</dt><dd>{children}</dd></div>; }
function Notice({ children }: { children: ReactNode }) { return <div className="money-notice"><Glyph name="notice" size={16} /><span>{children}</span></div>; }
export default function MoneyOperations({ kind }: { kind: Kind }) {
  const app = useApp();
  const [stage, setStage] = useState<"form" | "confirm" | "sms" | "success">("form");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState(accounts[0]);
  const [destination, setDestination] = useState(accounts[1]);
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(53);
  const [error, setError] = useState("");
  const completed = useRef(false);
  const balances = app.moneyBalances;
  const money = (n: number) => n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const available = kind === "topup" ? balances.master : kind === "withdraw" ? balances.main : source === accounts[0] ? balances.main : balances.otc;
  const complete = () => {
    if (completed.current) return;
    const result = app.simulateMoney(kind, Number(amount.replace(",", ".")), source === accounts[0] ? "main" : "otc");
    if (result) { setError(result); setStage("form"); return; }
    completed.current = true;
    setStage("success");
  };
  const topup = kind === "topup", transfer = kind === "transfer";
  const title = topup ? "Пополнение со счета ВТБ" : transfer ? "Перевод денег" : "Вывод денег";
  const action = topup ? "Пополнить" : transfer ? "Перевести" : "Вывести";
  const amountLabel = topup ? "Сумма пополнения" : transfer ? "Сумма перевода" : "Сумма вывода";
  const value = Number(amount.replace(",", "."));
  const valid = /^\d+([.,]\d{0,2})?$/.test(amount) && Number.isFinite(value) && value > 0 && Math.round(value * 100) <= Math.round(available * 100);
  const formatted = `${value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`;
  const back = () => { if (stage !== "form") setStage("form"); else { app.back(); app.setActionsOpen(true); } };
  const done = () => app.tab("home");
  useEffect(() => {
    if (stage !== "sms") return;
    const timer = window.setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [stage]);
  const selectSource = (v: string) => { setSource(v); if (v === destination) setDestination(source); };
  const selectDestination = (v: string) => { setDestination(v); if (v === source) setSource(destination); };
  return <section className={`money-flow money-${kind} ${stage === "success" ? "money-success" : ""}`}>
    {stage === "success" ? <>
      <div className="money-success-content"><img src={asset("success.png")} alt="" />
        {topup ? <><h2>Пополнение счета</h2><div className="money-success-amount">+{formatted}</div><p>деньги зачислены на Брокерский счет 11MD3A • Основной</p><span className="money-processing"><Glyph name="clock" size={16} />Выполнено</span></> : <h2>Деньги переведены</h2>}
      </div><footer><button className="money-primary" onClick={done}>{topup ? "Готово" : "Хорошо"}</button></footer>
    </> : <>
      <header className="money-header"><button aria-label="Назад" onClick={back}><Glyph name="back" /></button><h1>{title}</h1>{kind === "withdraw" && <Glyph name="help" />}</header>
      <div className="money-body" key={stage === "form" ? "form" : "confirm"}>
        {stage === "form" ? <>
          <AccountCard label="Счет списания" bank={topup} balance={money(available)} account={topup ? "• 8119" : source} onSelect={transfer ? selectSource : undefined}>
            {!topup && <><div><span>Доступно для {transfer ? "перевода" : "вывода"} <Glyph name="info" size={16} /></span><span>{money(available)} ₽</span></div><div><span>С учетом заемных</span><span>{money(available)} ₽</span></div>{!transfer && <div><span>Налог</span><span>1,00 ₽</span></div>}</>}
          </AccountCard>
          <div className="money-between">{transfer ? <button aria-label="Поменять счета местами" onClick={() => { setSource(destination); setDestination(source); }}><Glyph name="swap" /></button> : <span><Glyph name="arrow" /></span>}</div>
          <AccountCard label="Счет зачисления" bank={kind === "withdraw"} balance={money(topup ? balances.main : transfer ? (destination === accounts[0] ? balances.main : balances.otc) : balances.master)} account={topup ? accounts[0] : transfer ? destination : "• 8119"} onSelect={transfer ? selectDestination : undefined} />
          <input className="money-amount-input" aria-label={amountLabel} placeholder={amountLabel} inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value.replace(/[^\d.,]/g, ""))} />
          {(error || value > available) && <p role="alert" className="money-error">{error || "Недостаточно средств на счете списания"}</p>}
        </> : <div className="money-confirm">
          <div className="money-total"><span>{transfer ? "Сумма списания" : "Сумма вывода"}</span><strong>{formatted}</strong></div>
          {transfer ? <><h2>Информация о переводе</h2><dl><Field label="Списать со счета">Брокерский счет {source}</Field><Field label="Зачислить на счет">Брокерский счет {destination}</Field><Field label="Сумма списания">{formatted}</Field></dl>
            <Notice>Деньги переводятся между вашими субсчетами и/или площадками. Перевод доступен круглосуточно в любой день, кроме срочного рынка. При переводах на срочном рынке учитывайте его график работы.</Notice>
            <Notice>Нажимая «Подтвердить», вы соглашаетесь, что данные введены корректно. Деньги будут переведены после подтверждения.</Notice>
          </> : <><h2>Списание</h2><dl><Field label="Списать со счета">11MD3A (основной)</Field><Field label="Сумма вывода">{formatted}</Field></dl>
            <p className="money-explanation">Если вы выводите на счет в банке ВТБ деньги от сделок, по которым еще не прошли расчеты, то вывод будет осуществлен по услуге «<span>Вывод Онлайн</span>» — это бесплатно. ВТБ вправе отказать в услуге.</p>
            <h2>Зачисление</h2><dl><Field label="Банк">Филиал № 7701 Банка ВТБ (ПАО)</Field><Field label="БИК">044525745</Field><Field label="Номер банковского счёта">•8119</Field><Field label="Получатель">Королев К.В.</Field></dl>
            <h2>Комиссии</h2><dl><Field label="Удержание налога">1,00 ₽</Field></dl><Notice>Вывод денег на счет в банке ВТБ доступен круглосуточно в любой день</Notice>
          </>}
        </div>}
      </div>
      <footer className={transfer && stage !== "form" ? "money-confirm-footer" : ""}><button className="money-primary" disabled={stage === "form" && !valid} onClick={() => { if (stage === "form") { if (topup) complete(); else setStage("confirm"); } else if (transfer) complete(); else { setCode(""); setSeconds(53); setStage("sms"); } }}>{stage === "form" ? action : "Подтвердить"}</button></footer>
    </>}
    {stage === "sms" && <Overlay label="Введите код из СМС" close={() => setStage("confirm")}>
      <button className="money-close" aria-label="Закрыть" onClick={() => setStage("confirm")}><Glyph name="close" /></button>
      <h2>Введите код из СМС</h2><p>Код отправлен на номер +79********57</p>
      <label className="money-code"><span>Код подтверждения</span><input aria-label="Код подтверждения" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} /></label>
      <div className="money-sms-buttons"><button onClick={() => setStage("confirm")}>Отменить</button><button className="money-primary" disabled={code.length !== 6} onClick={complete}>Подтвердить</button></div>
      <p className="money-resend">{seconds > 0 ? <>Отправить код повторно можно<br />через {seconds} секунды</> : <button onClick={() => setSeconds(53)}>Отправить код повторно</button>}</p>
    </Overlay>}
  </section>;
}
