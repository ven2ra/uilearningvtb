import type { CSSProperties } from "react";
import crystal from "../../assets/finkoin/crystal.png";
export default function CrystalParticles() {
  return <span className="achievement-particles" aria-hidden="true">{Array.from({ length: 7 }, (_, i) =>
    <img key={i} src={crystal} alt="" style={{ "--i": i, "--x": `${[9, 25, 64, 86, 94, 13, 80][i]}%`, "--y": `${[48, 17, 3, 21, 66, 86, 90][i]}%`, "--size": `${[14, 18, 24, 36, 28, 12, 15][i]}px` } as CSSProperties}/>
  )}</span>;
}
