import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { useAuth } from '../../lib/auth';
import { useMobileMenu } from './MobileMenuContext';

interface SidebarProps {
  fullName: string | null;
  title: string | null;
}

const items = [
  { to: '/', icon: 'folder_open', label: 'Documents' },
  { to: '/resume', icon: 'auto_awesome', label: 'Résumé' },
  { to: '/letter', icon: 'mail', label: 'Cover Letter' },
  { to: '/profile', icon: 'person', label: 'Profile' },
  { to: '/archive', icon: 'archive', label: 'Archive' },
];

export function Sidebar({ fullName, title }: SidebarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { open, setOpen } = useMobileMenu();
  const initials = (fullName || 'You')
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const closeOnMobile = () => setOpen(false);

  return (
    <>
      {/* Backdrop (mobile only, when open) */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 fade-in"
          onClick={closeOnMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-[var(--paper)] border-r border-[var(--ink)] z-50 flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="px-5 pt-5 pb-4 border-b border-[var(--ink)] flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center">
              <Icon name="architecture" size={18} fill={1} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em]">
                Curriculum
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-secondary mono">
                Resume Workspace
              </span>
            </div>
          </div>
          <button
            onClick={closeOnMobile}
            className="lg:hidden -mr-2 -mt-1 p-1.5 text-secondary hover:text-[var(--ink)]"
            aria-label="Close menu"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <NavLink
          to="/profile"
          onClick={closeOnMobile}
          className="text-left px-5 py-4 border-b border-[var(--ink)] hover:bg-surface-container transition-colors group block"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-[var(--ink)] bg-secondary-fixed flex items-center justify-center mono font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold truncate">
                {fullName || 'Set up your profile'}
              </div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-secondary mono truncate">
                {title || '—'}
              </div>
            </div>
            <Icon
              name="more_horiz"
              size={18}
              className="text-outline group-hover:text-[var(--ink)]"
            />
          </div>
        </NavLink>

        <nav className="flex-1 overflow-y-auto custom-scrollbar py-3">
          <div className="px-5 py-2">
            <div className="text-[10px] uppercase tracking-[0.18em] text-secondary mono">
              Workspace
            </div>
          </div>
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === '/'}
              onClick={closeOnMobile}
              className={({ isActive }) =>
                `w-full text-left flex items-center gap-3 px-5 py-2.5 relative transition-colors ${
                  isActive
                    ? 'bg-[var(--ink)] text-[var(--paper)]'
                    : 'text-[var(--ink)] hover:bg-surface-container'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={it.icon} size={20} fill={isActive ? 1 : 0} />
                  <span className="text-[14px] font-medium flex-1">
                    {it.label}
                  </span>
                  {isActive && (
                    <span className="absolute right-0 top-0 bottom-0 w-1 bg-[var(--paper)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--ink)] p-4 space-y-3">
          <button
            onClick={() => {
              closeOnMobile();
              navigate('/resume');
            }}
            className="w-full bg-[var(--ink)] text-[var(--paper)] py-3 px-4 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] hover:opacity-90 transition-opacity"
          >
            <Icon name="add" size={18} />
            New Document
          </button>
          <div className="flex items-center justify-end text-[10px] uppercase tracking-[0.12em] text-secondary mono">
            <button
              onClick={async () => {
                closeOnMobile();
                await signOut();
                navigate('/signin');
              }}
              className="hover:text-[var(--ink)] transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
