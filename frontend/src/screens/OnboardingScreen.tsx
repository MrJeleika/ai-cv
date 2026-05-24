import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '../components/chrome/Icon';
import {
  ProfileSection,
  SECTION_META,
  SectionId,
} from '../components/profile/ProfileSection';
import { useProfileEditor } from '../lib/useProfileEditor';
import { completeOnboarding } from '../lib/api';
import { useAuth } from '../lib/auth';

const STEPS: SectionId[] = [
  'personal',
  'skills',
  'experience',
  'education',
  'projects',
  'review',
];

export function OnboardingScreen() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const qc = useQueryClient();
  const { loading, data, patch, flush, saveState } = useProfileEditor();
  const [stepIdx, setStepIdx] = useState(0);
  const stepId = STEPS[stepIdx];
  const meta = SECTION_META[stepId];

  const finish = useMutation({
    mutationFn: async () => {
      await flush();
      return completeOnboarding();
    },
    onSuccess: (profile) => {
      qc.setQueryData(['profile', session?.user.id], profile);
      navigate('/');
    },
  });

  const next = async () => {
    await flush();
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  };
  const back = () => setStepIdx((i) => Math.max(0, i - 1));

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-secondary text-sm mono">
        Loading profile…
      </div>
    );
  }

  const pct = Math.round((stepIdx / (STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)]">
      {/* Header */}
      <div className="border-b border-[var(--ink)] px-5 md:px-10 py-4 flex items-center justify-between gap-3 md:gap-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center shrink-0">
            <Icon name="architecture" size={20} fill={1} />
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-[10px] mono uppercase tracking-[0.18em] text-secondary">
              ONBOARDING / INTAKE FORM
            </div>
            <div className="text-[14px] font-semibold uppercase tracking-[-0.01em] truncate">
              Set up your profile
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 mono text-[10px] uppercase tracking-[0.15em] text-secondary">
          <span>
            STEP {String(stepIdx + 1).padStart(2, '0')} /{' '}
            {String(STEPS.length).padStart(2, '0')}
          </span>
          <span>·</span>
          <span>{pct}% COMPLETE</span>
        </div>
        <button
          onClick={() => finish.mutate()}
          disabled={finish.isPending}
          className="text-[10px] uppercase tracking-[0.15em] mono text-secondary hover:text-[var(--ink)] shrink-0 disabled:opacity-50"
        >
          Skip for now →
        </button>
      </div>

      {/* Stepper rail */}
      <div className="border-b border-[var(--ink)] px-5 md:px-10 flex items-stretch overflow-x-auto">
        {STEPS.map((id, i) => {
          const m = SECTION_META[id];
          const active = i === stepIdx;
          const done = i < stepIdx;
          return (
            <button
              key={id}
              onClick={() => setStepIdx(i)}
              className={`relative shrink-0 flex items-center gap-2 px-5 py-3 border-r border-[var(--ink)] ${
                active
                  ? 'bg-[var(--ink)] text-[var(--paper)]'
                  : done
                    ? 'bg-surface-container text-[var(--ink)]'
                    : 'text-secondary'
              }`}
            >
              <span
                className={`mono text-[10px] tracking-[0.15em] ${
                  active ? '' : 'text-secondary'
                }`}
              >
                0{i + 1}
              </span>
              <Icon
                name={done ? 'check' : m.icon}
                size={16}
                fill={active ? 1 : 0}
              />
              <span className="text-[11px] uppercase tracking-[0.12em] font-semibold whitespace-nowrap">
                {m.label}
              </span>
            </button>
          );
        })}
        <div className="flex-1 border-r border-[var(--ink)]" />
      </div>

      {/* Body */}
      <div className="flex-1 grid lg:grid-cols-[1fr_360px]">
        <div className="p-5 md:p-10 max-w-3xl w-full">
          <div className="text-[10px] mono uppercase tracking-[0.18em] text-secondary mb-2">
            SECTION {String(stepIdx + 1).padStart(2, '0')}
          </div>
          <h2 className="text-headline-lg uppercase tracking-[-0.02em] font-medium mb-2">
            {meta.title}
          </h2>
          <p className="text-sm text-secondary mb-8 max-w-xl leading-relaxed">
            {meta.description}
          </p>

          <div key={stepId} className="fade-in">
            <ProfileSection id={stepId} data={data} onPatch={patch} />
          </div>
        </div>

        <aside className="border-l border-[var(--ink)] bg-surface-container-low p-10 hidden lg:block">
          <div className="text-[10px] mono uppercase tracking-[0.18em] text-secondary mb-3">
            FIELD NOTES
          </div>
          <h3 className="text-lg uppercase tracking-[-0.01em] font-medium mb-4">
            On {meta.label.toLowerCase()}.
          </h3>
          <ul className="space-y-3 text-[13px] leading-relaxed text-secondary">
            {NOTES[stepId].map((n, i) => (
              <li key={i} className="flex gap-3">
                <span className="mono text-[10px] tracking-[0.15em] text-[var(--ink)] mt-1">
                  ·{String(i + 1).padStart(2, '0')}
                </span>
                <span>{n}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 border border-[var(--ink)] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] mono uppercase tracking-[0.15em] text-secondary">
                COMPLETION
              </span>
              <span className="text-[10px] mono uppercase tracking-[0.15em]">
                {pct}%
              </span>
            </div>
            <div className="h-2 bg-[var(--paper)] border border-[var(--ink)] relative">
              <div
                className="absolute inset-y-0 left-0 bg-[var(--ink)] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--ink)] px-5 md:px-10 py-4 flex items-center justify-between gap-3 bg-[var(--paper)] sticky bottom-0">
        <button
          onClick={back}
          disabled={stepIdx === 0}
          className="px-5 py-2.5 border border-[var(--ink)] text-[11px] uppercase tracking-[0.15em] font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container"
        >
          ← Back
        </button>
        <div className="flex-1 mono text-[10px] uppercase tracking-[0.15em] text-secondary text-center hidden md:block">
          {saveState === 'saving' && '↻ Saving…'}
          {saveState === 'saved' && '✓ Autosaved'}
          {saveState === 'pending' && '◇ Pending…'}
          {saveState === 'error' && '✗ Save failed — retrying'}
          {saveState === 'idle' && '↳ Autosave is on'}
        </div>
        {stepIdx < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="px-6 py-2.5 bg-[var(--ink)] text-[var(--paper)] text-[11px] uppercase tracking-[0.15em] font-bold"
          >
            Continue · {SECTION_META[STEPS[stepIdx + 1]].label} →
          </button>
        ) : (
          <button
            onClick={() => finish.mutate()}
            disabled={finish.isPending}
            className="px-6 py-2.5 bg-[var(--ink)] text-[var(--paper)] text-[11px] uppercase tracking-[0.15em] font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {finish.isPending ? (
              <>
                <span className="blink">█</span> Saving…
              </>
            ) : (
              <>
                <Icon name="verified" size={16} />
                Save & finish →
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

const NOTES: Record<SectionId, string[]> = {
  personal: [
    'Use the name and contact details you want printed on every résumé.',
    'Email here is what employers see — not necessarily your sign-in email.',
    'Add at least one link (GitHub, LinkedIn, or portfolio).',
  ],
  skills: [
    'A skill is anything worth surfacing on a tailored résumé.',
    'Include domain knowledge and methodologies — not just languages and frameworks.',
    'No order matters; the AI picks the relevant subset per posting.',
  ],
  experience: [
    'Bullets are starting material — the AI rewrites them per posting.',
    'Specificity beats reach. Numbers, scope, outcomes.',
    'Older / less relevant roles can be brief.',
  ],
  education: [
    'Optional, but useful for your first few jobs.',
    'Distinctions and thesis topics belong in the note field.',
  ],
  projects: [
    'Side projects, open-source contributions, hackathon wins.',
    'A link beats a paragraph — demos and repos do the talking.',
    'Skip if you don\'t have anything to show; entirely optional.',
  ],
  review: [
    'Anything missing? Click a section to jump back.',
    'After saving, edits remain available from the Profile screen.',
    'You can always re-generate documents with updated profile data.',
  ],
};
