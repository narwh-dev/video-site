import { useEffect } from "react";

type UndoToastProps = {
  message: string;
  open: boolean;
  onUndo: () => void;
  onDismiss: () => void;
  durationMs?: number;
};

export function UndoToast({ message, open, onUndo, onDismiss, durationMs = 5000 }: UndoToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => onDismiss(), durationMs);
    return () => window.clearTimeout(timer);
  }, [open, durationMs, onDismiss]);

  if (!open) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{message}</span>
      <button className="toast-action" type="button" onClick={onUndo}>
        撤销
      </button>
    </div>
  );
}
