import { Profile, ProfileEducation } from '../../lib/api';
import { Icon } from '../chrome/Icon';
import { inputCls } from './primitives';

interface EducationSectionProps {
  data: Profile;
  onPatch: (patch: Partial<Profile>) => void;
}

const empty: ProfileEducation = {
  school: '',
  degree: '',
  start: '',
  end: '',
  note: '',
};

export function EducationSection({ data, onPatch }: EducationSectionProps) {
  const update = (i: number, next: ProfileEducation) => {
    const list = [...data.education];
    list[i] = next;
    onPatch({ education: list });
  };
  const add = () => onPatch({ education: [...data.education, { ...empty }] });
  const remove = (i: number) =>
    onPatch({ education: data.education.filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      {data.education.length === 0 && (
        <div className="border-2 border-dashed border-[var(--ink)] p-8 text-center text-[12px] mono uppercase tracking-[0.15em] text-secondary">
          No education entries yet
        </div>
      )}

      {data.education.map((ed, i) => (
        <EducationCard
          key={i}
          value={ed}
          onChange={(next) => update(i, next)}
          onRemove={() => remove(i)}
        />
      ))}

      <button
        type="button"
        onClick={add}
        className="border-2 border-[var(--ink)] px-4 py-3 text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-[var(--ink)] hover:text-[var(--paper)] inline-flex items-center gap-2"
      >
        <Icon name="add" size={14} /> Add education entry
      </button>
    </div>
  );
}

function EducationCard({
  value,
  onChange,
  onRemove,
}: {
  value: ProfileEducation;
  onChange: (next: ProfileEducation) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-[var(--ink)] bg-[var(--paper)] p-5 space-y-4 fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 flex-1">
          <div>
            <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
              School / Institution
            </label>
            <input
              className={inputCls}
              value={value.school}
              onChange={(e) => onChange({ ...value, school: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
              Degree
            </label>
            <input
              className={inputCls}
              value={value.degree}
              placeholder="B.Sc. Computer Science"
              onChange={(e) => onChange({ ...value, degree: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
              Start year
            </label>
            <input
              className={inputCls}
              value={value.start}
              onChange={(e) => onChange({ ...value, start: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
              End year
            </label>
            <input
              className={inputCls}
              value={value.end}
              onChange={(e) => onChange({ ...value, end: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
              Note · Optional
            </label>
            <input
              className={inputCls}
              value={value.note ?? ''}
              placeholder="GPA, distinction, thesis title, etc."
              onChange={(e) => onChange({ ...value, note: e.target.value })}
            />
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
    </div>
  );
}
