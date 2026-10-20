import { useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';

/** Native modal semantics keep the background inert and contain keyboard focus. */
export function Dialog({ children, label, labelledBy, onDismiss, contained = false }: { children: ReactNode; label?: string; labelledBy?: string; onDismiss: () => void; contained?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = ref.current!;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const siblings = contained ? [...(dialog.parentElement?.parentElement?.children || [])].filter(el => el !== dialog.parentElement) as HTMLElement[] : [];
    const previousInert = siblings.map(el => el.inert);
    if (contained) {
      siblings.forEach(el => { el.inert = true; });
      dialog.show();
      dialog.querySelector<HTMLElement>('button,select,input,[tabindex]')?.focus();
    } else {
      document.body.style.overflow = 'hidden';
      dialog.showModal();
    }
    return () => {
      dialog.close();
      if (contained) siblings.forEach((el, index) => { el.inert = previousInert[index]; });
      else document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus();
    };
  }, [contained]);
  const containTab = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (contained && event.key === 'Escape') { event.preventDefault(); onDismiss(); return; }
    if (event.key !== 'Tab') return;
    const dialog = ref.current!;
    const focusable = [...dialog.querySelectorAll<HTMLElement>('button, input, select, textarea, summary, a[href], [tabindex]')].filter(el => el.tabIndex >= 0 && !el.matches(':disabled') && el.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) { event.preventDefault(); dialog.focus(); return; }
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  };
  const dialog = <dialog ref={ref} className="modal-backdrop native-dialog" aria-modal={contained ? true : undefined} aria-label={label} aria-labelledby={labelledBy} onKeyDown={containTab} onCancel={event => { event.preventDefault(); onDismiss(); }}>{children}</dialog>;
  return contained ? <div className="patient-dialog-layer">{dialog}</div> : dialog;
}
