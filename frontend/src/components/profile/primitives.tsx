import { KeyboardEvent, ReactNode, useState } from 'react';
import { Icon } from '../chrome/Icon';

export const inputCls =
  'w-full bg-transparent border border-[var(--ink)] px-3 py-2 text-[15px] focus:outline-none';

interface FieldRowProps {
  label: string;
  hint?: string;
  span?: 1 | 2;
  children: ReactNode;
}

export function FieldRow({ label, hint, span = 1, children }: FieldRowProps) {
  return (
    <div className={span === 2 ? 'md:col-span-2' : ''}>
      <div className="flex items-baseline justify-between mb-1">
        <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary">
          {label}
        </label>
        {hint && (
          <span className="text-[10px] mono uppercase tracking-[0.12em] text-secondary">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

interface ChipInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

export function ChipInput({
  value,
  onChange,
  placeholder = '+ add',
}: ChipInputProps) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!value.includes(trimmed)) onChange([...value, trimmed]);
    setDraft('');
  };
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      e.preventDefault();
      remove(value.length - 1);
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-2 border border-[var(--ink)] px-3 py-2 min-h-[44px]">
      {value.map((c, i) => (
        <span
          key={`${c}-${i}`}
          className="inline-flex items-center gap-1.5 border border-[var(--ink)] px-2 py-1 text-[11px] uppercase tracking-[0.08em] font-semibold"
        >
          {c}
          <button
            type="button"
            onClick={() => remove(i)}
            className="opacity-50 hover:opacity-100"
          >
            <Icon name="close" size={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={placeholder}
        className="flex-1 min-w-[100px] bg-transparent text-[14px] focus:outline-none"
      />
    </div>
  );
}
