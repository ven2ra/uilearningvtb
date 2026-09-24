import { useEffect, useRef } from "react";
import giftSuccess from "../../../assets/themes/crystal/gift-success.png";
import crystal from "../../../assets/themes/crystal/crystal-small.png";
import FinkoinIcon from "../../finkoin/FinkoinIcon";
import RewardArt from "../../finkoin/RewardArt";
import CrystalParticles from "./CrystalParticles";
import "./CrystalTheme.css";

interface Props {
  titleId: string;
  descriptionId: string;
  onClose: () => void;
  onHome: () => void;
}

export default function GiftReceivedModal({ titleId, descriptionId, onClose, onHome }: Props) {
  const home = useRef<HTMLButtonElement>(null);
  useEffect(() => { home.current?.focus({ preventScroll: true }); }, []);
  return <div className="gift-modal-card crystal-received">
    <button type="button" className="gift-modal-close" aria-label="Закрыть" onClick={onClose}>×</button>
    <div className="crystal-received-art" aria-hidden="true">
      <img src={giftSuccess} alt=""/>
      <CrystalParticles burst/>
    </div>
    <h2 id={titleId}>Подарок получен!</h2>
    <p id={descriptionId} className="crystal-received-subtitle">Премиум-тема Crystal<br/>активирована</p>
    <div className="crystal-benefits">
      <div><FinkoinIcon/><p><strong>Обновлённый внешний вид</strong><span>Новый стиль и уникальные элементы</span></p></div>
      <div><img src={crystal} alt=""/><p><strong>Кристальные эффекты</strong><span>Особая атмосфера инвестиций</span></p></div>
      <div><RewardArt name="theme"/><p><strong>Больше вдохновения</strong><span>Приятнее следить за результатами</span></p></div>
    </div>
    <button ref={home} type="button" className="gift-modal-exchange crystal-home-button" onClick={onHome}>Перейти на главную <span aria-hidden="true">›</span></button>
  </div>;
}
