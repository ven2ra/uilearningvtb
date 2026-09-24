import { useEffect, useId, useRef, useState } from "react";
import GiftReceivedModal from "../themes/crystal/GiftReceivedModal";
import type { FinkoinReward as Reward } from "../../lib/finkoinRewards";
import { useApp } from "../../state/AppState";
import RewardArt from "./RewardArt";
import FinkoinIcon from "./FinkoinIcon";
import { FinkoinCrystal } from "./Crystal";
import "./GiftModal.css";

interface GiftModalProps {
  reward: Reward | null;
  open: boolean;
  onClose: () => void;
}

export default function GiftModal({ reward, open, onClose }: GiftModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const app = useApp();
  const [received, setReceived] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { setReceived(false); setError(null); }, [open, reward]);

  useEffect(() => {
    const element = dialog.current;
    if (!element || !open || !reward) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    element.showModal();
    const preventScroll = (event: Event) => {
      if (!element.contains(event.target as Node)) event.preventDefault();
    };
    document.addEventListener("wheel", preventScroll, { passive: false });
    document.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      element.close();
      document.removeEventListener("wheel", preventScroll);
      document.removeEventListener("touchmove", preventScroll);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [open, reward]);

  if (!open || !reward) return null;

  return <dialog ref={dialog} className="gift-modal" aria-labelledby={titleId} aria-describedby={descriptionId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    {received ? <GiftReceivedModal titleId={titleId} descriptionId={descriptionId} onClose={onClose} onHome={() => { onClose(); app.tab("home"); }}/>
    : <div className="gift-modal-card">
      <button type="button" className="gift-modal-close" aria-label="Закрыть" onClick={onClose} autoFocus>×</button>
      <div className="gift-modal-art"><RewardArt name={reward.image}/><FinkoinCrystal className="gift-modal-crystal-left"/><FinkoinCrystal className="gift-modal-crystal-right"/></div>
      <h2 id={titleId}>{reward.title}</h2>
      <p id={descriptionId} className="gift-modal-description">{reward.description}</p>
      <div className="gift-modal-price"><FinkoinIcon/><div><strong>{reward.cost}</strong><span>финкоинов</span></div></div>
      {error && <p role="alert" className="gift-modal-error">{error}</p>}
      <button type="button" className="gift-modal-exchange" onClick={() => {
        if (reward.icon !== "theme") { app.toast({ kind: "info", title: reward.title, text: "Обмен подарков пока недоступен" }); return; }
        const reason = app.exchangeCrystal();
        if (reason) { setError(reason); return; }
        setReceived(true);
        dialog.current?.scrollTo(0, 0);
      }}>{reward.icon === "theme" && app.activeTheme === "crystal" ? "Тема уже получена" : `Обменять за ${reward.cost} финкоинов`}</button>
      <button type="button" className="gift-modal-cancel" onClick={onClose}>Отмена</button>
    </div>}
  </dialog>;
}
