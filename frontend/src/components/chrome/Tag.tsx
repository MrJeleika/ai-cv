import { ReactNode } from 'react';

type Variant = 'outline' | 'solid' | 'ghost' | 'accent';

const styles: Record<Variant, string> = {
  outline: 'border border-[var(--ink)] text-[var(--ink)] bg-transparent',
  solid: 'bg-[var(--ink)] text-[var(--paper)]',
  ghost: 'bg-surface-container-highest text-secondary',
  accent: 'accent-bg text-white',
};

interface TagProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

export function Tag({ children, variant = 'outline', className = '' }: TagProps) {
  return (
    <span
      className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
