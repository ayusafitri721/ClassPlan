import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Button } from './Button.jsx';

const ToastContext = createContext(null);

const TONES = {
  info: 'border-line bg-surface text-ink',
  success: 'border-[#c4e3d0] bg-ok-soft text-[#14532d]',
  error: 'border-[#efc2c2] bg-danger-soft text-[#7f1d1d]',
};

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const dismiss = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = 'info') => {
      const id = crypto.randomUUID();
      setItems((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex w-full max-w-sm items-start justify-between gap-3 rounded-card border px-4 py-3 text-sm ${TONES[item.tone] ?? TONES.info}`}
          >
            <p>{item.message}</p>
            <Button
              variant="ghost"
              size="sm"
              className="-mr-2 -mt-1 shrink-0 px-2 text-current"
              onClick={() => dismiss(item.id)}
              aria-label="Tutup notifikasi"
            >
              Tutup
            </Button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast harus dipakai di dalam ToastProvider');
  return context;
}
