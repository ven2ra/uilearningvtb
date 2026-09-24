import { useState } from "react";
import { useApp } from "../state/AppState";
import "./SourceProfile.css";

const assets = import.meta.glob<string>("../assets/profile/*", { eager: true, query: "?url", import: "default" });
const asset = (file: string) => assets[`../assets/profile/${file}`];
function Glyph({ id, size = 24 }: { id: number; size?: number }) { return <img src={asset(`icon-0-${id}.svg`)} width={size} height={size} alt="" />; }
function Header({ title }: { title: string }) {
  const app = useApp();
  return <header className="snapshot-profile-header"><button aria-label="Назад" onClick={app.back}><Glyph id={0} /></button><h1>{title}</h1></header>;
}
function Agreement({ iis = false }: { iis?: boolean }) {
  const fields = iis ? [["Инвестиционное соглашение", "144IMP"], ["Оформлено", "23.07.2025"], ["Тариф", "Мой онлайн Привилегия: Рубин"], ["Основной счет", "144IMP"]] : [["Инвестиционное соглашение", "11MD3A"], ["Оформлено", "10.11.2021"], ["Тариф", "Мой онлайн группа ВТБ"], ["Основной счет", "11MD3A"], ["Инвесткопилка", "11MD3A/1CY8P"], ["Субсчет", "11MD3A/1SIMC"]];
  return <section className="snapshot-profile-card snapshot-agreement"><h2>{iis ? "ИИС" : "Брокерский счет"}</h2><dl>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
}
export function SourceProfile() {
  const app = useApp();
  const [tab, setTab] = useState("Профиль");
  return <div className="snapshot-profile"><Header title="Профиль" /><div className="snapshot-profile-body">
    <section className="snapshot-identity"><img src={asset("image-0-0.png")} width={56} height={56} alt="" /><h2>Королев К. В.</h2><div><span><Glyph id={1} size={14} />Квал.инвестор</span><span><Glyph id={2} size={14} />Привилегия</span></div></section>
    <div className="snapshot-ruby" style={{ backgroundImage: `url(${asset("image-0-1.png")})` }}><span className="snapshot-ruby-icon"><img src={asset("image-0-2.png")} width={32} height={32} alt="" /></span><div><span>Расти с ВТБ</span><strong>Ваш уровень: Рубин</strong></div><Glyph id={3} /></div>
    <div className="snapshot-profile-shortcuts">{["Конкурсы и акции", "Обучение", "Промокоды", "Мероприятия"].map((title, i) => <button key={title} onClick={title === "Обучение" ? () => app.go("profile-learning") : undefined}><Glyph id={i + 4} /><span>{title}</span></button>)}</div>
    <div className="snapshot-profile-tabs" role="tablist" aria-label="Разделы профиля">{["Профиль", "Настройки", "Услуги", "Документы"].map(t => <button role="tab" aria-selected={tab === t} key={t} onClick={() => setTab(t)}>{t}</button>)}</div>
    {tab === "Профиль" ? <><section className="snapshot-profile-card"><h2>Данные аккаунта</h2><dl className="snapshot-personal">{[["ФИО", "Королев К. В."], ["Телефон", "+7999*****57"], ["Электронная почта", "kirillkicked1@gmail.com"], ["Статус квал. инвестора", "Присвоен"]].map(([label, value], i) => <div key={label}><dt>{label}</dt><dd>{value}{i === 3 && <Glyph id={8} />}</dd></div>)}</dl><div className="snapshot-logout">Выйти из аккаунта<Glyph id={9} /></div></section><Agreement /><Agreement iis /></> : <section className="snapshot-profile-card snapshot-profile-list">
      {(tab === "Настройки" ? ["Безопасность", "Изменить пароль", "Скрывать баланс при входе", "О приложении", "Очередь заявок", "Нажатие на цену", "Оформление", "Тема интерфейса", "Мигание котировок", "Новый стиль интерфейса"] : tab === "Услуги" ? ["ИИС", "Новый субсчет", "Маржинальная торговля", "Инвестиционное консультирование", "Тестирование инвесторов", "Перевод ценных бумаг", "Голосования", "Счета для выплат по ценным бумагам", "Процент на остаток", "Терминалы Quik"] : ["Отчеты и справки", "Реквизиты для пополнения", "Смена типа ТКС"]).map(label => <div key={label}>{label}</div>)}
    </section>}
  </div></div>;
}
export function ProfileLearning() {
  return <div className="snapshot-learning"><Header title="Обучение" /><div className="snapshot-learning-body"><section className="snapshot-fincode" style={{ backgroundImage: `url(${asset("image-1-0.png")})` }}><div><h2>Финкод</h2><p>Все про финансы и инвестиции</p><span>Подробнее</span></div></section></div></div>;
}
