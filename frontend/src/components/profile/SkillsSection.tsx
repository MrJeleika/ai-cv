import { Profile } from '../../lib/api';
import { ChipInput, FieldRow } from './primitives';

interface SkillsSectionProps {
  data: Profile;
  onPatch: (patch: Partial<Profile>) => void;
}

export function SkillsSection({ data, onPatch }: SkillsSectionProps) {
  return (
    <div className="space-y-6">
      <FieldRow
        label="Skills · Languages, frameworks, tools"
        hint={`${data.skills.length} ENTRIES`}
        span={2}
      >
        <ChipInput
          value={data.skills}
          onChange={(skills) => onPatch({ skills })}
          placeholder="+ add a skill (press enter)"
        />
      </FieldRow>

      <div className="border border-[var(--ink)] p-4 bg-surface-container-low">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1">
          How this is used
        </div>
        <p className="text-[12px] text-secondary leading-relaxed">
          When you generate a tailored résumé, the AI picks the most relevant
          subset of your skills for the job posting. Add anything that might be
          worth surfacing — including soft skills, methodologies, and domain
          knowledge.
        </p>
      </div>
    </div>
  );
}
