/* eslint-disable react/prop-types */
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
export default function ContentDialog({
  title,
  onClose,
  busy = false,
  children
}) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);
  return <dialog ref={ref} className="ta-dialog content-dialog" aria-labelledby="content-dialog-title" onCancel={e => {
    e.preventDefault();
    if (!busy) onClose();
  }}>
    <div className="ta-dialog-heading"><h2 id="content-dialog-title">{title}</h2><button className="ta-icon" aria-label="Close dialog" disabled={busy} onClick={onClose}><X size={20} /></button></div>
    {children}
  </dialog>;
}
