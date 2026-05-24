import { useState } from 'react';
import { TopAppBar } from '../components/chrome/TopAppBar';
import { Icon } from '../components/chrome/Icon';
import {
  ProfileSection,
  SECTION_META,
  SectionId,
} from '../components/profile/ProfileSection';
import { useProfileEditor } from '../lib/useProfileEditor';

const TABS: SectionId[] = [
  'personal',
  'skills',
  'experience',
  'education',
  'projects',
];

export function ProfileScreen() {
  const { loading, data, patch, flush, saveState } = useProfileEditor();
  const [active, setActive] = useState<SectionId>('personal');
  const meta = SECTION_META[active];

  if (loading || !data) {
    return (
      <>
        <TopAppBar title="Profile" breadcrumbs={['WORKSPACE', 'IDENTITY']} />
        <div className="flex-1 flex items-center justify-center text-secondary text-sm mono">
          Loading profile…
        </div>
      </>
    );
  }

  return (
    <>
      <TopAppBar
        title="Profile"
        breadcrumbs={['WORKSPACE', 'IDENTITY']}
        right={
          <div className="flex items-stretch">
            <div className="hidden lg:flex items-center px-4 border-r border-[var(--ink)] gap-3 text-[10px] mono uppercase tracking-[0.15em] text-secondary">
              {saveState === 'saving' && <>↻ SAVING…</>}
              {saveState === 'saved' && <>✓ AUTOSAVED</>}
              {saveState === 'pending' && <>◇ PENDING…</>}
              {saveState === 'error' && (
                <span className="text-red-700">✗ SAVE FAILED</span>
              )}
              {saveState === 'idle' && <>↳ AUTOSAVE ON</>}
            </div>
            <button
              onClick={() => flush()}
              className="px-5 bg-[var(--ink)] text-[var(--paper)] text-[11px] uppercase tracking-[0.15em] font-bold flex items-center gap-2"
            >
              <Icon name="save" size={16} />
              Save now
            </button>
          </div>
        }
      />

      <div className="flex-1 grid lg:grid-cols-[200px_1fr] min-h-0">
        {/* Side tabs — vertical on desktop, horizontal scroll on mobile */}
        <aside className="border-b lg:border-b-0 lg:border-r border-[var(--ink)] bg-surface-container-low flex lg:block overflow-x-auto lg:overflow-x-visible">
          <div className="hidden lg:block px-4 py-3 border-b border-[var(--ink)]">
            <div className="text-[10px] mono uppercase tracking-[0.18em] text-secondary">
              SECTIONS
            </div>
          </div>
          {TABS.map((id) => {
            const m = SECTION_META[id];
            const on = id === active;
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`shrink-0 w-auto lg:w-full text-left flex items-center gap-2 lg:gap-3 px-4 py-3 border-r lg:border-r-0 lg:border-b border-[var(--ink)] lg:border-outline-variant transition-colors whitespace-nowrap ${
                  on
                    ? 'bg-[var(--ink)] text-[var(--paper)]'
                    : 'hover:bg-surface-container'
                }`}
              >
                <Icon name={m.icon} size={18} fill={on ? 1 : 0} />
                <span className="text-[12px] uppercase tracking-[0.1em] font-semibold">
                  {m.label}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Section content */}
        <div className="overflow-y-auto custom-scrollbar p-5 md:p-10 max-w-3xl w-full">
          <div className="text-[10px] mono uppercase tracking-[0.18em] text-secondary mb-2">
            SECTION / {meta.label.toUpperCase()}
          </div>
          <h2 className="text-headline-lg uppercase tracking-[-0.02em] font-medium mb-2">
            {meta.title}
          </h2>
          <p className="text-sm text-secondary mb-8 max-w-xl leading-relaxed">
            {meta.description}
          </p>
          <div key={active} className="fade-in">
            <ProfileSection id={active} data={data} onPatch={patch} />
          </div>
        </div>
      </div>
    </>
  );
}
