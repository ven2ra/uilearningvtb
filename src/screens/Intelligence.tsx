import { useApp } from "../state/AppState";
import "./ConnectedScreens.css";

const benefits = ["Лучший сервис инвестконсультирования по версии Frank Investment Award 2025", "Сделки по инвестрекомендациям совершаются без вашего участия", "Вы всегда видите, что происходит. Отключить можно в любой момент", "Чтобы инвестировать, не нужно разбираться в фондовом рынке, достаточно просто подключить услугу"];
export default function Intelligence() {
  const app = useApp();
  return <section className="intelligence-screen">
    <div className="intelligence-hero"><span className="intelligence-tag">Инвестируйте легко</span><h1 data-tour="intelligence-heading">Интеллект</h1><p>Подберет стратегию,<br/>автоматически совершит сделки.<br/>В основе — технологии и опыт команды ВТБ</p><img className="intelligence-crystal" src="/intelligence/image-18.png" alt="Кристалл Интеллект"/><div className="intelligence-facts"><div><strong>До 39,88%</strong><span>Потенциальная<br/>доходность за год</span></div><div><strong>От 10 000 ₽</strong><span>Можно начать</span></div></div></div>
    <div className="intelligence-content"><h2>Почему это выгодно</h2>{benefits.map((benefit, index) => <article className="intelligence-benefit" key={benefit}><img src={`/intelligence/image-${19 + index}.png`} width={72} height={72} alt=""/><p>{benefit}</p></article>)}<h2>Начать легко</h2>{[["Заполните анкету", "Определим инвестпрофиль и подберем стратегию"], ["Пополните счет", "Подключим услугу для автоматического совершения сделок"], ["Следите за комментариями", "Всё объясним и погрузим в мир инвестиций"]].map(([title, text], index) => <div className="intelligence-step" key={title}><b>{index + 1}</b><div><strong>{title}</strong><p>{text}</p></div></div>)}<p className="connected-muted">Демонстрационный экран. Показатели из макета, не прогноз доходности.</p></div>
    <div className="intelligence-cta"><button className="connected-primary" onClick={() => app.toast({ kind: "info", title: "Демонстрационный режим", text: "Подключение стратегии доступно в ВТБ Онлайн" })}>Подобрать стратегию в ВТБ Онлайн</button></div>
  </section>;
}
