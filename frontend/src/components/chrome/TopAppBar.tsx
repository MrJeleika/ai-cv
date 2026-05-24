import { Fragment, ReactNode } from 'react';
import { Icon } from './Icon';
import { useMobileMenu } from './MobileMenuContext';

export interface TabSpec {
  id: string;
  label: string;
  count?: number;
}

interface TopAppBarProps {
  title: string;
  breadcrumbs?: string[];
  tabs?: TabSpec[];
  activeTab?: string;
  onTab?: (id: string) => void;
  right?: ReactNode;
}

export function TopAppBar({
  title,
  breadcrumbs = [],
  tabs = [],
  activeTab,
  onTab,
  right,
}: TopAppBarProps) {
  const { setOpen } = useMobileMenu();

  return (
    <header className="sticky top-0 z-30 bg-[var(--paper)] border-b border-[var(--ink)]">
      <div className="flex items-stretch h-14 md:h-16">
        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="lg:hidden shrink-0 border-r border-[var(--ink)] w-14 flex items-center justify-center hover:bg-surface-container transition-colors"
        >
          <Icon name="menu" size={22} />
        </button>

        <div className="flex-1 flex items-center px-4 md:px-10 gap-6 min-w-0">
          <div className="flex flex-col leading-tight min-w-0">
            {breadcrumbs.length > 0 && (
              <div className="hidden md:flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-secondary mono mb-0.5">
                {breadcrumbs.map((b, i) => (
                  <Fragment key={i}>
                    <span>{b}</span>
                    {i < breadcrumbs.length - 1 && <span>/</span>}
                  </Fragment>
                ))}
              </div>
            )}
            <h1 className="text-[18px] md:text-[22px] font-medium tracking-[-0.02em] uppercase truncate">
              {title}
            </h1>
          </div>
          {tabs.length > 0 && (
            <div className="hidden lg:flex items-stretch h-full ml-4 -mb-px">
              {tabs.map((t) => {
                const active = t.id === activeTab;
                return (
                  <button
                    key={t.id}
                    onClick={() => onTab?.(t.id)}
                    className={`relative px-5 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                      active
                        ? 'text-[var(--ink)]'
                        : 'text-secondary hover:text-[var(--ink)]'
                    }`}
                  >
                    {t.label}
                    {t.count != null && (
                      <span className="ml-2 mono text-[10px] opacity-60">
                        {String(t.count).padStart(2, '0')}
                      </span>
                    )}
                    {active && (
                      <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[var(--ink)]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {right && (
          <div className="flex items-stretch border-l border-[var(--ink)]">
            {right}
          </div>
        )}
      </div>

      {/* Mobile tabs row (under the bar) */}
      {tabs.length > 0 && (
        <div className="lg:hidden flex items-stretch overflow-x-auto border-t border-[var(--ink)]">
          {tabs.map((t) => {
            const active = t.id === activeTab;
            return (
              <button
                key={t.id}
                onClick={() => onTab?.(t.id)}
                className={`relative shrink-0 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] border-r border-[var(--ink)] transition-colors ${
                  active
                    ? 'bg-[var(--ink)] text-[var(--paper)]'
                    : 'text-secondary hover:text-[var(--ink)]'
                }`}
              >
                {t.label}
                {t.count != null && (
                  <span className="ml-1.5 mono text-[10px] opacity-60">
                    {String(t.count).padStart(2, '0')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
