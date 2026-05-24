import { Icon } from '../chrome/Icon';
import { LogLine, PipelineStage } from '../../lib/usePipelineRun';

interface PipelineViewProps {
  stages: PipelineStage[];
  activeStage: number;
  subProgress: number;
  log: LogLine[];
  apiState: 'pending' | 'success' | 'error';
}

const ICONS: Record<string, string> = {
  analyze: 'psychology',
  match: 'compare_arrows',
  draft: 'edit_note',
  polish: 'auto_fix_high',
  render: 'draft',
  research: 'travel_explore',
};

export function PipelineView({
  stages,
  activeStage,
  subProgress,
  log,
  apiState,
}: PipelineViewProps) {
  return (
    <div className="grid lg:grid-cols-[1fr_500px] h-full">
      <div className="p-6 md:p-10 flex flex-col items-center justify-center">
        <div className="text-[10px] mono uppercase tracking-[0.18em] text-secondary mb-3">
          PIPELINE / IN PROGRESS
        </div>
        <h2 className="text-[24px] md:text-headline-lg uppercase tracking-[-0.02em] font-medium mb-6 md:mb-12 text-center">
          Drafting your document…
        </h2>

        <div className="w-full max-w-md space-y-3">
          {stages.map((s, i) => {
            const active = i === activeStage;
            const done = i < activeStage;
            return (
              <div
                key={s.id}
                className={`border p-4 transition-all duration-300 ease-out ${
                  active
                    ? 'border-[var(--ink)] bg-[var(--paper)] shadow-[4px_4px_0_var(--ink)] -translate-x-1 -translate-y-1'
                    : done
                      ? 'border-[var(--ink)] opacity-90'
                      : 'border-outline-variant opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-9 h-9 flex items-center justify-center border-2 border-[var(--ink)] transition-all duration-300 ease-out ${
                      done
                        ? 'bg-[var(--ink)] text-[var(--paper)] scale-100'
                        : active
                          ? ''
                          : 'text-secondary border-outline-variant'
                    }`}
                  >
                    {done ? (
                      <span className="check-pop">
                        <Icon name="check" size={22} />
                      </span>
                    ) : active ? (
                      <Icon
                        name={ICONS[s.id] || 'auto_awesome'}
                        size={18}
                        className="animate-pulse"
                      />
                    ) : (
                      <span className="mono text-[11px]">0{i + 1}</span>
                    )}
                  </span>
                  <div className="flex-1">
                    <div
                      className={`text-[13px] font-semibold uppercase tracking-[0.05em] ${
                        done || active ? '' : 'text-secondary'
                      }`}
                    >
                      {s.label}
                    </div>
                    {active && (
                      <div className="mt-1.5 h-1 bg-surface-container border border-[var(--ink)] relative overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-[var(--ink)] transition-all"
                          style={{
                            width: `${(subProgress / s.sub.length) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {active && (
                    <span className="mono text-[10px] uppercase tracking-[0.12em] tabular-nums">
                      {subProgress}/{s.sub.length}
                    </span>
                  )}
                  {done && (
                    <span className="mono text-[10px] uppercase tracking-[0.12em] text-secondary">
                      ✓
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <aside className="border-t lg:border-t-0 lg:border-l border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] flex flex-col min-h-0 max-h-[40vh] lg:max-h-none">
        <div className="border-b border-[var(--paper)] border-opacity-30 px-6 py-4 flex items-center justify-between">
          <span className="text-[10px] mono uppercase tracking-[0.18em] opacity-70">
            Drafting log
          </span>
          <span className="flex items-center gap-1.5 text-[10px] mono uppercase tracking-[0.12em] opacity-70">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                apiState === 'error'
                  ? 'bg-red-400'
                  : 'bg-emerald-400 animate-pulse'
              }`}
            />
            {apiState === 'error' ? 'ERROR' : 'LIVE'}
          </span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 mono text-[11px] leading-relaxed space-y-1">
          {log.map((l, i) => (
            <div
              key={i}
              className={`flex gap-3 ${
                l.done ? 'text-emerald-400' : 'opacity-90'
              }`}
            >
              <span className="opacity-50 shrink-0">{l.ts}</span>
              <span className="opacity-60 shrink-0">
                [{l.stage.toUpperCase().padEnd(7)}]
              </span>
              <span className="flex-1">{l.msg}</span>
            </div>
          ))}
          <div className="flex gap-3 opacity-90">
            <span className="blink">█</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
