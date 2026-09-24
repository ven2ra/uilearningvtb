import { useId, useState } from "react";
import { useApp } from "../state/AppState";
import { useTour } from "../tour/Tour";
import { Overlay } from "../screens/MoneyOperations";
import Icon from "./Icons";
import "./HelpPanel.css";
import fincodeImage from "../assets/profile/image-1-0.png";

function ReliefIcon({ kind }: { kind: "compass" | "chat" }) {
  const id = useId().replace(/:/g, "");
  return <svg viewBox="0 0 100 100" aria-hidden="true"><defs>
    <linearGradient id={`${id}-silver`} x2="1" y2="1"><stop stopColor="#fff" /><stop offset=".35" stopColor="#bfc4d2" /><stop offset=".65" stopColor="#777f96" /><stop offset="1" stopColor="#e7e9f2" /></linearGradient>
    <linearGradient id={`${id}-blue`} x2=".7" y2="1"><stop stopColor="#cce3ff" /><stop offset="1" stopColor="#3375ee" /></linearGradient>
    <filter id={`${id}-shadow`} x="-40%" y="-40%" width="190%" height="190%"><feDropShadow dx="1" dy="4" stdDeviation="2.5" floodColor="#4d5773" floodOpacity=".3" /></filter>
  </defs><g filter={`url(#${id}-shadow)`} fill={`url(#${id}-silver)`} stroke={`url(#${id}-silver)`} strokeWidth="4">
    {kind === "compass" && <><circle cx="50" cy="48" r="34" /><circle cx="50" cy="48" r="29" fill="#fafbff" stroke="#dde0e9" strokeWidth="2" /><path d="m69 29-13 27-27 13 13-27z" fill="#596174" strokeWidth="1" /><path d="m69 29-19 19-21 21 13-27z" fill="#8b92a4" stroke="none" /><circle cx="50" cy="48" r="3" fill="white" stroke="none" /></>}
    {kind === "chat" && <>
      <path d="M50 17c-18.2 0-33 13.4-33 30 0 8.2 3.6 15.7 9.5 21.1L21 82l17-6.8c3.7 1.2 7.8 1.8 12 1.8 18.2 0 33-13.4 33-30S68.2 17 50 17z" fill="#fbfcff" strokeWidth="5" strokeLinejoin="round" />
      <path d="M24 44c1.4-12.1 12.5-21 26-21 10 0 18.7 4.8 23 12" fill="none" stroke="#edf0f7" strokeWidth="2" strokeLinecap="round" />
      {[36,50,64].map(x => <circle key={x} cx={x} cy="47" r="4" fill="#858ca0" stroke="none" />)}
    </>}
  </g></svg>;
}

export default function HelpPanel() {
  const app = useApp();
  const tour = useTour();
  const [support, setSupport] = useState(false);
  if (!app.helpOpen) return null;
  const close = () => { setSupport(false); app.setHelpOpen(false); };
  return <Overlay sheet label={support ? "Поддержка" : "Помощь"} close={close}>
    <div className="help-reference">
      <div className="help-reference-handle" />
      <button className="help-reference-close" aria-label="Закрыть" onClick={close}><Icon name="x" size={24} /></button>
      {support ? <><button className="help-support-back" onClick={() => setSupport(false)}>← Назад</button><h2>Чат поддержки / Горячая линия</h2><p>В этом прототипе чат и звонки в поддержку не подключены.</p></> : <>
        <header><h2>Помощь</h2><p>Быстрые ответы и подсказки<br />по работе с приложением</p></header>
        <div className="help-reference-options">
          <button data-tour="help-screen" onClick={() => { close(); tour.startHelp(); }}><span className="help-reference-icon"><ReliefIcon kind="compass" /></span><span><strong>Навигация по текущей странице</strong><small>Покажем, что здесь находится<br />и как пользоваться основными функциями</small></span><i><Icon name="chevronRight" size={20} /></i></button>
          <button onClick={() => { close(); app.go("learning-path"); }}><span className="help-reference-icon"><img className="help-fincode" src={fincodeImage} alt="" /></span><span><strong>Обучение инвестициям</strong><small>Ваш прогресс в обучении<br />и полезные материалы</small></span><i><Icon name="chevronRight" size={20} /></i></button>
          <button onClick={() => setSupport(true)}><span className="help-reference-icon"><ReliefIcon kind="chat" /></span><span><strong>Чат поддержки / Горячая линия</strong><small>Ответим на вопросы в чате 24/7<br />или по телефону</small></span><i><Icon name="chevronRight" size={20} /></i></button>
        </div>
      </>}
    </div>
  </Overlay>;
}
