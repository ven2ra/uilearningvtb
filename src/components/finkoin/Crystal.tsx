import crystal from "../../assets/finkoin/crystal.png";
export function FinkoinCrystal({ className = "" }: { className?: string }) {
  return <img className={className} src={crystal} alt="" aria-hidden="true"/>;
}
export function FloatingCrystal({ className = "" }: { className?: string }) { return <FinkoinCrystal className={`shop-floating-crystal ${className}`} />; }
