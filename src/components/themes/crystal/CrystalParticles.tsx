import type { CSSProperties } from "react";
import crystal from "../../../assets/themes/crystal/crystal-small.png";

export default function CrystalParticles({ burst = false }: { burst?: boolean }) {
  return <span className={`crystal-particles${burst ? " is-burst" : ""}`} aria-hidden="true">
    {Array.from({ length: burst ? 16 : 5 }, (_, index) => {
      const angle = index * 2.399;
      return <img key={index} src={crystal} alt="" style={{
        "--x": `${Math.cos(angle) * (90 + index * 5)}px`,
        "--y": `${Math.sin(angle) * (80 + index * 5) - 35}px`,
        "--turn": `${angle * 100}deg`,
        "--delay": `${index * .055}s`,
        "--size": `${12 + index % 4 * 5}px`,
      } as CSSProperties}/>;
    })}
  </span>;
}
