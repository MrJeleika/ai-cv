import { Profile, ProfilePersonalProject } from '../../lib/api';
import { Icon } from '../chrome/Icon';
import { inputCls } from './primitives';

interface PersonalProjectsSectionProps {
  data: Profile;
  onPatch: (patch: Partial<Profile>) => void;
}

const empty: ProfilePersonalProject = {
  name: '',
  url: '',
  description: '',
};

export function PersonalProjectsSection({
  data,
  onPatch,
}: PersonalProjectsSectionProps) {
  const projects = data.personal_projects ?? [];

  const update = (i: number, next: ProfilePersonalProject) => {
    const list = [...projects];
    list[i] = next;
    onPatch({ personal_projects: list });
  };
  const add = () => onPatch({ personal_projects: [...projects, { ...empty }] });
  const remove = (i: number) =>
    onPatch({ personal_projects: projects.filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      <div className="border border-[var(--ink)] p-4 bg-surface-container-low">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1">
          Optional — but a strong signal
        </div>
        <p className="text-[12px] text-secondary leading-relaxed">
          Side projects, open-source work, hackathon wins — anything you built
          on your own time. The AI weaves these into the résumé when they're
          relevant to the role.
        </p>
      </div>

      {projects.length === 0 && (
        <div className="border-2 border-dashed border-[var(--ink)] p-8 text-center text-[12px] mono uppercase tracking-[0.15em] text-secondary">
          No personal projects yet
        </div>
      )}

      {projects.map((project, i) => (
        <PersonalProjectCard
          key={i}
          value={project}
          onChange={(next) => update(i, next)}
          onRemove={() => remove(i)}
        />
      ))}

      <button
        type="button"
        onClick={add}
        className="border-2 border-[var(--ink)] px-4 py-3 text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-[var(--ink)] hover:text-[var(--paper)] inline-flex items-center gap-2 transition-colors duration-200"
      >
        <Icon name="add" size={14} /> Add personal project
      </button>
    </div>
  );
}

function PersonalProjectCard({
  value,
  onChange,
  onRemove,
}: {
  value: ProfilePersonalProject;
  onChange: (next: ProfilePersonalProject) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-[var(--ink)] bg-[var(--paper)] p-5 space-y-4 fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 flex-1">
          <div>
            <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
              Project name
            </label>
            <input
              className={inputCls}
              value={value.name}
              placeholder="e.g. Curriculum AI"
              onChange={(e) => onChange({ ...value, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
              Link · Optional
            </label>
            <input
              className={inputCls}
              value={value.url ?? ''}
              placeholder="https://…"
              onChange={(e) => onChange({ ...value, url: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
              Description
            </label>
            <textarea
              value={value.description ?? ''}
              onChange={(e) =>
                onChange({ ...value, description: e.target.value })
              }
              rows={3}
              placeholder="What it does, what you built, what tech stack."
              className="w-full bg-transparent border border-[var(--ink)] px-3 py-2 text-[13px] focus:outline-none leading-relaxed mono"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="border border-[var(--ink)] p-1.5 hover:bg-[var(--ink)] hover:text-[var(--paper)] shrink-0 transition-colors duration-200"
          title="Remove project"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
  );
}
