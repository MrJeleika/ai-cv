import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

interface MobileMenuContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextValue | null>(null);

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  return (
    <MobileMenuContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu(): MobileMenuContextValue {
  const ctx = useContext(MobileMenuContext);
  if (!ctx)
    throw new Error('useMobileMenu must be used inside <MobileMenuProvider>');
  return ctx;
}
