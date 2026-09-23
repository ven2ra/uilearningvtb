const icons = import.meta.glob<string>("../../assets/reference/icons/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});
export type ReferenceIconName =
  | "stories"
  | "profile"
  | "notifications"
  | "eye-off"
  | "trend"
  | "actions"
  | "history"
  | "analysis"
  | "settings"
  | "info"
  | "chevron-down"
  | "sparkle"
  | "search"
  | "nav-home"
  | "nav-portfolio"
  | "nav-market"
  | "nav-more";

export default function ReferenceIcon({
  name,
  size = 24,
}: {
  name: ReferenceIconName;
  size?: number;
}) {
  return (
    <img
      src={icons[`../../assets/reference/icons/${name}.svg`]}
      alt=""
      width={size}
      height={size}
      className="reference-icon"
    />
  );
}

export { referenceImage } from "./referenceImages";
