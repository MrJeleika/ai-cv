import { useEffect, useRef, useState } from 'react';

export interface PipelineStage {
  id: string;
  label: string;
  ms: number;
  sub: string[];
}

export interface LogLine {
  ts: string;
  stage: string;
  msg: string;
  done?: boolean;
}

interface UsePipelineRunOptions<T> {
  stages: PipelineStage[];
  apiCall: () => Promise<T>;
  onSettled: (result: { data: T | null; error: unknown | null }) => void;
}

interface UsePipelineRunReturn {
  activeStage: number;
  subProgress: number;
  log: LogLine[];
  done: boolean;
  apiState: 'pending' | 'success' | 'error';
}

/**
 * Drive the wizard's pipeline animation while the real API call runs in
 * parallel. Resolves to the API result via `onSettled` once both have completed.
 *
 * NOTE: We intentionally don't return a cleanup that aborts the animation —
 * StrictMode in dev would cancel the only run we get (the `startedRef` blocks
 * a re-start). Stale setState calls after unmount are a no-op in React 18.
 */
export function usePipelineRun<T>(
  options: UsePipelineRunOptions<T>,
): UsePipelineRunReturn {
  const { stages, apiCall, onSettled } = options;
  const [activeStage, setActiveStage] = useState(0);
  const [subProgress, setSubProgress] = useState(0);
  const [log, setLog] = useState<LogLine[]>([]);
  const [done, setDone] = useState(false);
  const [apiState, setApiState] = useState<'pending' | 'success' | 'error'>(
    'pending',
  );
  const apiResultRef = useRef<{ data: T | null; error: unknown | null }>({
    data: null,
    error: null,
  });
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    apiCall()
      .then((data) => {
        apiResultRef.current = { data, error: null };
        setApiState('success');
      })
      .catch((error) => {
        console.error('Pipeline API call failed:', error);
        apiResultRef.current = { data: null, error };
        setApiState('error');
      });

    let stageIdx = 0;

    const runStage = () => {
      if (stageIdx >= stages.length) {
        const settle = () => {
          setDone(true);
          onSettled(apiResultRef.current);
        };
        if (apiResultRef.current.data || apiResultRef.current.error) {
          settle();
        } else {
          const id = setInterval(() => {
            if (apiResultRef.current.data || apiResultRef.current.error) {
              clearInterval(id);
              settle();
            }
          }, 80);
        }
        return;
      }

      const stage = stages[stageIdx];
      setActiveStage(stageIdx);
      setSubProgress(0);
      let i = 0;

      const tick = () => {
        if (i < stage.sub.length) {
          setSubProgress(i + 1);
          setLog((prev) => [
            ...prev,
            { ts: timestamp(), stage: stage.id, msg: stage.sub[i] },
          ]);
          i++;
          setTimeout(tick, stage.ms / stage.sub.length);
        } else {
          setLog((prev) => [
            ...prev,
            {
              ts: timestamp(),
              stage: stage.id,
              msg: `${stage.label.toUpperCase()} → DONE`,
              done: true,
            },
          ]);
          stageIdx++;
          setTimeout(runStage, 200);
        }
      };
      setTimeout(tick, 150);
    };

    runStage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { activeStage, subProgress, log, done, apiState };
}

function timestamp(): string {
  const d = new Date();
  return (
    d.toLocaleTimeString('en-GB', { hour12: false }) +
    '.' +
    String(d.getMilliseconds()).padStart(3, '0')
  );
}
