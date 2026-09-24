import { useState } from "react";
import { useApp } from "../state/AppState";
import Icon from "../ui/Icons";
import FincodeMascot from "../components/finkoin/FincodeMascot";
import GiftBox from "../components/finkoin/GiftBox";
import FinkoinIcon from "../components/finkoin/FinkoinIcon";
import { FloatingCrystal } from "../components/finkoin/Crystal";
import DayRewardCard from "../components/finkoin/DayRewardCard";
import GiftModal from "../components/finkoin/GiftModal";
import type { FinkoinReward } from "../lib/finkoinRewards";
import RewardCard from "../components/finkoin/RewardCard";
import StatIcon from "../components/learning/StatIcon";
import { dayRewards, finkoinRewards } from "../lib/finkoinRewards";
import "./FinkoinShop.css";
import bannerGifts from "../assets/finkoin/banner-gifts.png";

function ShopArtwork() {
  return <div className="shop-artwork"><GiftBox/><FincodeMascot/><FloatingCrystal className="shop-crystal-one"/><FloatingCrystal className="shop-crystal-two"/><FloatingCrystal className="shop-crystal-three"/></div>;
}
export default function FinkoinShop() {
  const app = useApp();
  const [selectedReward, setSelectedReward] = useState<FinkoinReward | null>(null);
  const [category, setCategory] = useState("Все");
  const [showEarningInfo, setShowEarningInfo] = useState(false);
  const date = new Date();
  let streak = 0;
  if (!app.course.days.includes(date.toLocaleDateString("en-CA"))) date.setDate(date.getDate() - 1);
  while (app.course.days.includes(date.toLocaleDateString("en-CA"))) { streak++; date.setDate(date.getDate() - 1); }
  const lessons = () => app.back();
  return <div className="finkoin-shop">
    <button className="shop-back" aria-label="Назад" onClick={app.back}><Icon name="chevronLeft"/></button>
    <header className="shop-hero"><div className="shop-hero-copy"><span className="shop-eyebrow">ФИНКОИНЫ</span><h1>Ваш баланс</h1><div className="shop-balance"><FinkoinIcon/><strong>{app.course.coins}</strong></div><div className="shop-earning"><button className="shop-soft-button" aria-expanded={showEarningInfo} aria-controls="shop-earning-info" onClick={() => setShowEarningInfo(value => !value)}><span>Как получить финкоины?</span><Icon name="chevronRight" size={18}/></button>{showEarningInfo && <p id="shop-earning-info">Проходите уроки, выполняйте задания и получайте финкоины. Обменивайте их на полезные подарки.</p>}</div></div><ShopArtwork/></header>
    <section className="shop-streak" aria-label="Серия обучения"><div className="shop-streak-copy"><div><StatIcon index={0}/><strong>{streak}</strong><span>дней подряд</span></div><p>Проходите уроки каждый день<br/>и получайте больше финкоинов</p></div><div className="shop-days">{dayRewards.map((reward, i) => <DayRewardCard key={i} day={i + 1} reward={reward} status={i < Math.min(streak, 5) ? "done" : i === Math.min(streak, 4) ? "current" : "future"}/>)}</div></section>
    <section aria-labelledby="shop-title"><div className="shop-catalog-header"><h2 id="shop-title">Магазин подарков</h2><div className="shop-tabs" aria-label="Категории подарков">{["Все", "Обучение", "Бонусы", "Дизайн"].map(tab => <button key={tab} aria-pressed={category === tab} onClick={() => setCategory(tab)}>{tab}</button>)}</div></div><div className="shop-grid">{finkoinRewards.filter(reward => category === "Все" || reward.category === category).map(reward => <RewardCard key={reward.icon} reward={reward} onSelect={() => setSelectedReward(reward)}/>)}</div></section>
    <section className="shop-banner"><div><h2>Учитесь и открывайте подарки</h2><p>Копите финкоины за уроки и задания. Выбирайте награды, которые вам нравятся.</p><button className="shop-primary-button" onClick={lessons}>Смотреть задания <Icon name="chevronRight" size={20}/></button></div><img className="shop-banner-illustration" src={bannerGifts} alt="ФинКод с подарками и финкоинами"/></section>
    <GiftModal reward={selectedReward} open={Boolean(selectedReward)} onClose={() => setSelectedReward(null)}/>
  </div>;
}
