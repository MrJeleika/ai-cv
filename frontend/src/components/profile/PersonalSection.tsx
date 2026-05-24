import { Profile, ProfileLink } from '../../lib/api';
import { Icon } from '../chrome/Icon';
import { FieldRow, inputCls } from './primitives';

interface PersonalSectionProps {
  data: Profile;
  onPatch: (patch: Partial<Profile>) => void;
}

export function PersonalSection({ data, onPatch }: PersonalSectionProps) {
  const updateLink = (i: number, link: ProfileLink) => {
    const next = [...data.links];
    next[i] = link;
    onPatch({ links: next });
  };
  const addLink = () =>
    onPatch({ links: [...data.links, { label: '', url: '' }] });
  const removeLink = (i: number) =>
    onPatch({ links: data.links.filter((_, j) => j !== i) });

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
        <FieldRow label="Full name · As filed" hint="REQUIRED">
          <input
            className={inputCls}
            value={data.full_name ?? ''}
            onChange={(e) => onPatch({ full_name: e.target.value })}
          />
        </FieldRow>
        <FieldRow label="Current title">
          <input
            className={inputCls}
            value={data.title ?? ''}
            placeholder="Senior Software Engineer"
            onChange={(e) => onPatch({ title: e.target.value })}
          />
        </FieldRow>
        <FieldRow label="Email">
          <input
            className={inputCls}
            type="email"
            value={data.email ?? ''}
            onChange={(e) => onPatch({ email: e.target.value })}
          />
        </FieldRow>
        <FieldRow label="Phone">
          <input
            className={inputCls}
            value={data.phone ?? ''}
            placeholder="+1 555 0000"
            onChange={(e) => onPatch({ phone: e.target.value })}
          />
        </FieldRow>
        <FieldRow label="Location · City, Country" span={2}>
          <input
            className={inputCls}
            value={data.location ?? ''}
            placeholder="Berlin, Germany"
            onChange={(e) => onPatch({ location: e.target.value })}
          />
        </FieldRow>
        <FieldRow label="Summary · Short bio" span={2}>
          <textarea
            value={data.summary ?? ''}
            onChange={(e) => onPatch({ summary: e.target.value })}
            rows={5}
            placeholder="Two or three sentences in your own voice. The AI rewrites this per application — but starts from here."
            className="w-full bg-transparent border border-[var(--ink)] p-3 text-[14px] focus:outline-none leading-relaxed mono"
          />
        </FieldRow>
      </div>

      <FieldRow label="Links · Portfolio, LinkedIn, GitHub" span={2}>
        <div className="space-y-2 pt-2">
          {data.links.map((link, i) => (
            <div
              key={i}
              className="grid grid-cols-[150px_1fr_auto] gap-3 items-center"
            >
              <input
                value={link.label}
                placeholder="Label"
                onChange={(e) => updateLink(i, { ...link, label: e.target.value })}
                className="bg-transparent px-3 py-2 text-[14px] focus:outline-none mono border border-[var(--ink)]"
              />
              <input
                value={link.url}
                placeholder="https://…"
                onChange={(e) => updateLink(i, { ...link, url: e.target.value })}
                className="bg-transparent px-3 py-2 text-[14px] focus:outline-none mono border border-[var(--ink)]"
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="text-secondary hover:text-[var(--ink)] p-1"
                title="Remove link"
              >
                <Icon name="close" size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLink}
            className="border border-[var(--ink)] px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] font-semibold hover:bg-[var(--ink)] hover:text-[var(--paper)] inline-flex items-center gap-1.5"
          >
            <Icon name="add" size={12} /> Add link
          </button>
        </div>
      </FieldRow>
    </div>
  );
}
