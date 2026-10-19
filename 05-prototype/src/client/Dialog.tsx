import { useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';

/** Native modal semantics keep the background inert and contain keyboard focus. */
export function Dialog({ children, label, labelledBy, onDismiss }: { children: ReactNode; label?: string; labelledBy?: string; onDismiss: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = ref.current!;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus();
    };
  }, []);
  const containTab = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return;
    const dialog = ref.current!;
    const focusable = [...dialog.querySelectorAll<HTMLElement>('button, input, select, textarea, summary, a[href], [tabindex]')].filter(el => el.tabIndex >= 0 && !el.matches(':disabled') && el.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) { event.preventDefault(); dialog.focus(); return; }
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  };
  return <dialog ref={ref} className="modal-backdrop native-dialog" aria-label={label} aria-labelledby={labelledBy} onKeyDown={containTab} onCancel={event => { event.preventDefault(); onDismiss(); }}>{children}</dialog>;
}
