import { KeyboardEvent, useEffect, useRef } from 'react';
import { Profile, ProfileExperience } from '../../lib/api';
import { Icon } from '../chrome/Icon';
import { inputCls } from './primitives';

interface ExperienceSectionProps {
  data: Profile;
  onPatch: (patch: Partial<Profile>) => void;
}

const empty: ProfileExperience = {
  company: '',
  role: '',
  start: '',
  end: '',
  current: false,
  bullets: [],
};

export function ExperienceSection({ data, onPatch }: ExperienceSectionProps) {
  const update = (i: number, next: ProfileExperience) => {
    const list = [...data.experience];
    list[i] = next;
    onPatch({ experience: list });
  };
  const add = () => onPatch({ experience: [...data.experience, { ...empty }] });
  const remove = (i: number) =>
    onPatch({ experience: data.experience.filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      {data.experience.length === 0 && (
        <div className="border-2 border-dashed border-[var(--ink)] p-8 text-center text-[12px] mono uppercase tracking-[0.15em] text-secondary">
          No experience entries yet
        </div>
      )}

      {data.experience.map((exp, i) => (
        <ExperienceCard
          key={i}
          value={exp}
          onChange={(next) => update(i, next)}
          onRemove={() => remove(i)}
        />
      ))}

      <button
        type="button"
        onClick={add}
        className="border-2 border-[var(--ink)] px-4 py-3 text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-[var(--ink)] hover:text-[var(--paper)] inline-flex items-center gap-2"
      >
        <Icon name="add" size={14} /> Add experience entry
      </button>
    </div>
  );
}

function ExperienceCard({
  value,
  onChange,
  onRemove,
}: {
  value: ProfileExperience;
  onChange: (next: ProfileExperience) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-[var(--ink)] bg-[var(--paper)] p-5 space-y-4 fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 flex-1">
          <div>
            <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
              Company
            </label>
            <input
              className={inputCls}
              value={value.company}
              onChange={(e) => onChange({ ...value, company: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
              Role
            </label>
            <input
              className={inputCls}
              value={value.role}
              onChange={(e) => onChange({ ...value, role: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
              Start · e.g. "Mar 2022"
            </label>
            <input
              className={inputCls}
              value={value.start}
              onChange={(e) => onChange({ ...value, start: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
              End · "Present" if current
            </label>
            <input
              className={inputCls}
              value={value.end}
              disabled={value.current}
              onChange={(e) => onChange({ ...value, end: e.target.value })}
            />
            <label className="mt-2 inline-flex items-center gap-2 text-[11px] mono uppercase tracking-[0.12em] text-secondary">
              <input
                type="checkbox"
                checked={!!value.current}
                onChange={(e) =>
                  onChange({
                    ...value,
                    current: e.target.checked,
                    end: e.target.checked ? 'Present' : value.end,
                  })
                }
                className="appearance-none w-4 h-4 border-2 border-[var(--ink)] checked:bg-[var(--ink)] relative after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-[var(--paper)] after:text-[10px] after:font-bold"
              />
              Currently here
            </label>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="border border-[var(--ink)] p-1.5 hover:bg-[var(--ink)] hover:text-[var(--paper)] shrink-0"
          title="Remove entry"
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary">
            Bullets
          </label>
          <span className="text-[10px] mono uppercase tracking-[0.12em] text-secondary">
            {value.bullets.length} ENTR
            {value.bullets.length === 1 ? 'Y' : 'IES'}
          </span>
        </div>

        <div className="space-y-2">
          {value.bullets.map((b, i) => (
            <BulletRow
              key={i}
              value={b}
              autoFocus={b === '' && i === value.bullets.length - 1}
              onChange={(next) => {
                const list = [...value.bullets];
                list[i] = next;
                onChange({ ...value, bullets: list });
              }}
              onRemove={() =>
                onChange({
                  ...value,
                  bullets: value.bullets.filter((_, j) => j !== i),
                })
              }
              onEnter={() =>
                onChange({ ...value, bullets: [...value.bullets, ''] })
              }
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            onChange({ ...value, bullets: [...value.bullets, ''] })
          }
          className="mt-2 border border-[var(--ink)] px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] font-semibold hover:bg-[var(--ink)] hover:text-[var(--paper)] inline-flex items-center gap-1.5 transition-colors duration-200"
        >
          <Icon name="add" size={12} /> Add bullet
        </button>
      </div>
    </div>
  );
}

function BulletRow({
  value,
  autoFocus,
  onChange,
  onRemove,
  onEnter,
}: {
  value: string;
  autoFocus?: boolean;
  onChange: (next: string) => void;
  onRemove: () => void;
  onEnter: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter();
    } else if (e.key === 'Backspace' && value === '') {
      e.preventDefault();
      onRemove();
    }
  };

  return (
    <div className="flex items-center gap-2 group">
      <span
        className="text-secondary text-[14px] leading-none shrink-0 pt-0.5"
        aria-hidden
      >
        •
      </span>
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKey}
        placeholder="Shipped a thing that did a thing"
        className="flex-1 bg-transparent border border-[var(--ink)] px-3 py-2 text-[13px] focus:outline-none mono"
      />
      <button
        type="button"
        onClick={onRemove}
        className="border border-[var(--ink)] p-1.5 text-secondary hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors duration-200 shrink-0"
        title="Remove bullet"
      >
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}
