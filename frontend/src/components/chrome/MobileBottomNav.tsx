import { NavLink } from 'react-router-dom';
import { Icon } from './Icon';
import { useMobileMenu } from './MobileMenuContext';

const items = [
  { to: '/', icon: 'folder_open', label: 'Docs', end: true },
  { to: '/resume', icon: 'auto_awesome', label: 'Résumé' },
  { to: '/letter', icon: 'mail', label: 'Letter' },
  { to: '/profile', icon: 'person', label: 'Profile' },
];

export function MobileBottomNav() {
  const { setOpen } = useMobileMenu();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--paper)] border-t-2 border-[var(--ink)] grid grid-cols-5">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={!!it.end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-2 border-r border-[var(--ink)] transition-colors ${
              isActive
                ? 'bg-[var(--ink)] text-[var(--paper)]'
                : 'text-[var(--ink)] hover:bg-surface-container'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon name={it.icon} size={20} fill={isActive ? 1 : 0} />
              <span className="text-[9px] uppercase tracking-[0.1em] font-semibold">
                {it.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-0.5 py-2 text-[var(--ink)] hover:bg-surface-container transition-colors"
      >
        <Icon name="menu" size={20} />
        <span className="text-[9px] uppercase tracking-[0.1em] font-semibold">
          More
        </span>
      </button>
    </nav>
  );
}
