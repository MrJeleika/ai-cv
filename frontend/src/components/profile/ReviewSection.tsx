import { Profile } from '../../lib/api';

interface ReviewSectionProps {
  data: Profile;
}

export function ReviewSection({ data }: ReviewSectionProps) {
  const counts = {
    skills: data.skills.length,
    experience: data.experience.length,
    education: data.education.length,
    projects: data.personal_projects?.length ?? 0,
    links: data.links.length,
  };
  return (
    <div className="space-y-6">
      <div className="border-2 border-[var(--ink)] bg-[var(--paper)] shadow-[6px_6px_0_var(--ink)] p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--ink)]">
          <div>
            <div className="text-[10px] mono uppercase tracking-[0.18em] text-secondary">
              PROFILE / PROOF
            </div>
            <div className="text-lg font-medium uppercase tracking-[-0.01em]">
              {data.full_name || '—'}
            </div>
          </div>
          <span className="stamp">PROOF · UNSAVED</span>
        </div>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
          {[
            ['Title', data.title],
            ['Email', data.email],
            ['Phone', data.phone],
            ['Location', data.location],
            ['Skills', `${counts.skills} listed`],
            ['Experience', `${counts.experience} entries`],
            ['Education', `${counts.education} entries`],
            ['Projects', `${counts.projects} entries`],
            ['Links', `${counts.links} listed`],
          ].map(([k, v]) => (
            <div key={k as string} className="flex items-baseline gap-3 py-1">
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-secondary w-24 shrink-0">
                {k}
              </span>
              <span className="text-[13px] truncate">{v || '—'}</span>
            </div>
          ))}
        </div>
        {data.summary && (
          <div className="mt-4 pt-4 border-t border-[var(--ink)]">
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-secondary block mb-1">
              SUMMARY
            </span>
            <p className="text-[13px] leading-relaxed">{data.summary}</p>
          </div>
        )}
      </div>
      <p className="text-[12px] text-secondary leading-relaxed mono">
        Hit "Save & finish" to mark onboarding complete. You can come back and
        edit any time from the Profile screen.
      </p>
    </div>
  );
}
