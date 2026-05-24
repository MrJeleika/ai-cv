import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import { Icon } from './Icon';

export interface Toast {
  id: string;
  title: string;
  body?: string;
  icon?: string;
}

interface ToastContextValue {
  push: (t: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((x) => x.id !== id)),
      4500,
    );
  }, []);

  const dismiss = (id: string) =>
    setToasts((prev) => prev.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-[var(--paper)] border border-[var(--ink)] px-4 py-3 flex items-start gap-3 fade-in shadow-[4px_4px_0_var(--ink)]"
          >
            <Icon
              name={t.icon || 'check_circle'}
              size={18}
              className="text-[var(--ink)] mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-[0.12em]">
                {t.title}
              </div>
              {t.body && (
                <div className="text-[12px] text-secondary mt-0.5">
                  {t.body}
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-secondary hover:text-[var(--ink)]"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
