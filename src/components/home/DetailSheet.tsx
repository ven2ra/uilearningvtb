import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useApp } from "../../state/AppState";
import Icon from "../../ui/Icons";

export interface Detail {
  title: string;
  body: ReactNode;
}

export default function DetailSheet({
  detail,
  onClose,
}: {
  detail: Detail | null;
  onClose: () => void;
}) {
  const app = useApp();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (detail) dialog.current?.showModal();
    else dialog.current?.close();
  }, [detail]);
  if (!app.frameRef.current) return null;
  return createPortal(
    <dialog
      ref={dialog}
      className="reference-dialog"
      aria-label={detail?.title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {detail && (
        <div className="reference-dialog-body">
          <header>
            <h2>{detail.title}</h2>
            <button type="button" onClick={onClose} aria-label="Закрыть">
              <Icon name="x" />
            </button>
          </header>
          <div>{detail.body}</div>
        </div>
      )}
    </dialog>,
    app.frameRef.current,
  );
}
