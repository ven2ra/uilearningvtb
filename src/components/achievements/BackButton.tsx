import Icon from "../../ui/Icons";
export default function BackButton({ onClick }: { onClick: () => void }) {
  return <button type="button" className="achievement-back" aria-label="Назад" onClick={onClick}><Icon name="chevronLeft" size={22}/></button>;
}
