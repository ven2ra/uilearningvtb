import Icon from "../../ui/Icons";
import type { FinkoinReward } from "../../lib/finkoinRewards";
import RewardArt from "./RewardArt";
import FinkoinIcon from "./FinkoinIcon";
export default function RewardCard({ reward, onSelect }: { reward: FinkoinReward; onSelect: () => void }) {
  return <button className={`shop-reward ${reward.locked ? "shop-reward-dark" : ""}`} onClick={onSelect} aria-label={`${reward.title}, ${reward.cost} финкоинов${reward.locked ? ", заблокировано" : ""}`}>
    {reward.locked && <span className="shop-reward-lock"><Icon name="lock" size={19}/></span>}
    <div className={`shop-reward-art shop-art-${reward.icon}`}>
      <RewardArt name={reward.image}/>
    </div><h3>{reward.title}</h3><p>{reward.description}</p><div className="shop-reward-price"><FinkoinIcon/><strong>{reward.cost}</strong><span><Icon name="chevronRight" size={20}/></span></div>
  </button>;
}
