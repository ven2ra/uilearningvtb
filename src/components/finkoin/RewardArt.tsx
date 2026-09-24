import atlas from "../../assets/finkoin/rewards.png";
import { useId } from "react";
import type { FinkoinReward } from "../../lib/finkoinRewards";

const positions = { book: [0, 0], percent: [1, 0], strategy: [2, 0], theme: [0, 1], gift: [1, 1], course: [2, 1] } as const;
export default function RewardArt({ name }: { name: FinkoinReward["icon"] }) {
  const [x, y] = positions[name];
  const id = useId();
  return <svg viewBox={`${x * 512} ${y * 512} 512 512`} aria-hidden="true"><defs><clipPath id={id}><rect x={x * 512} y={y * 512} width="512" height="512"/></clipPath></defs><image href={atlas} width="1536" height="1024" clipPath={`url(#${id})`} /></svg>;
}
