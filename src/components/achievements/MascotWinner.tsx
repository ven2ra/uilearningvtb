import mascot from "../../assets/achievements/mascot-winner.png";
import CrystalParticles from "./CrystalParticles";
export default function MascotWinner({ celebrationKey = 0 }: { celebrationKey?: number }) {
  return <div className="achievement-winner" key={celebrationKey} aria-hidden="true">
    <div className="achievement-podium"><i/><i/><i/></div>
    <div className="achievement-winner-motion"><img className="achievement-mascot" src={mascot} alt=""/></div>
    <CrystalParticles/>
  </div>;
}
