import FinkoinIcon from "../finkoin/FinkoinIcon";
export default function AchievementReward({ amount }: { amount: number }) {
  return <span className="achievement-reward" aria-label={`Награда: ${amount} финкоинов`}><FinkoinIcon/><strong>+{amount}</strong></span>;
}
