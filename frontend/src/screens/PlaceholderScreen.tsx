import { TopAppBar } from '../components/chrome/TopAppBar';
import { Icon } from '../components/chrome/Icon';

interface PlaceholderScreenProps {
  title: string;
  subtitle: string;
  icon: string;
}

export function PlaceholderScreen({
  title,
  subtitle,
  icon,
}: PlaceholderScreenProps) {
  return (
    <>
      <TopAppBar
        title={title}
        breadcrumbs={['WORKSPACE', title.toUpperCase()]}
      />
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="max-w-md text-center border-2 border-[var(--ink)] p-12 bg-[var(--paper)] shadow-[8px_8px_0_var(--ink)]">
          <Icon name={icon} size={48} className="mb-4 inline-block" />
          <div className="text-[10px] uppercase tracking-[0.18em] mono text-secondary mb-2">
            SECTION / {subtitle.toUpperCase()}
          </div>
          <h2 className="text-2xl font-medium tracking-[-0.02em] uppercase mb-3">
            {title}
          </h2>
          <p className="text-sm text-secondary leading-relaxed">
            Reserved for a future release.
          </p>
        </div>
      </div>
    </>
  );
}
