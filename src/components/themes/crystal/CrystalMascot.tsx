import mascot from "../../../assets/themes/crystal/mascot-happy.png";
import { useId } from "react";
import CrystalParticles from "./CrystalParticles";

export default function CrystalMascot({ state = "happy" }: { state?: "happy" | "idle" }) {
  const id = useId();
  const hand = "M74 47 L80 36 L100 36 L100 67 L82 66 L77 59 Z";
  return <span className={`crystal-mascot is-${state}`} aria-hidden="true">
    <span className="crystal-mascot-motion"><svg viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <mask id={`${id}-body`}><rect width="100" height="100" fill="white"/><path d={hand} fill="black"/></mask>
        <clipPath id={`${id}-hand`}><path d={hand}/></clipPath>
      </defs>
      <image href={mascot} width="100" height="100" mask={`url(#${id}-body)`}/>
      <g className={state === "happy" ? "crystal-mascot-hand" : undefined}><image href={mascot} width="100" height="100" clipPath={`url(#${id}-hand)`}/></g>
    </svg></span>
    {state === "happy" && <CrystalParticles/>}
  </span>;
}
