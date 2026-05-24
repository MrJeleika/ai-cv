import { useLocation } from 'react-router-dom';

const stamps = [
  'Drafted with care',
  'Your dossier stays yours',
  'No tracking',
  'Vector PDFs',
  'Single-user mode',
];

export function FooterBar() {
  const { pathname } = useLocation();
  const routeLabel = (pathname === '/' ? 'home' : pathname.replace('/', '')).toUpperCase();
  return (
    <footer className="border-t border-[var(--ink)] bg-[var(--paper)]">
      <div className="flex items-center h-9 overflow-hidden">
        <div className="shrink-0 px-4 h-full flex items-center border-r border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] text-[10px] uppercase tracking-[0.15em] mono">
          ROUTE / {routeLabel}
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="marquee flex gap-12 whitespace-nowrap py-2 text-[10px] uppercase tracking-[0.18em] text-secondary mono">
            {[...stamps, ...stamps, ...stamps, ...stamps].map((s, i) => (
              <span key={i}>◇ {s}</span>
            ))}
          </div>
        </div>
        <div className="shrink-0 px-4 h-full flex items-center border-l border-[var(--ink)] text-[10px] uppercase tracking-[0.15em] mono text-secondary">
          Autosaved
        </div>
      </div>
    </footer>
  );
}
