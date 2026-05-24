import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TopAppBar } from '../components/chrome/TopAppBar';
import { Icon } from '../components/chrome/Icon';
import { useToast } from '../components/chrome/ToastStack';
import { PipelineView } from '../components/wizard/PipelineView';
import { PipelineStage, usePipelineRun } from '../lib/usePipelineRun';
import {
  CvJson,
  downloadCvPdf,
  fetchProfile,
  getResume,
  previewCv,
  saveResume,
} from '../lib/api';
import { clearSessionState, useSessionState } from '../lib/useSessionState';
import { creativityHint, creativityLabel } from '../lib/creativity';

const SS = {
  step: 'resume.step',
  targetRole: 'resume.targetRole',
  company: 'resume.company',
  jobDescription: 'resume.jobDescription',
  creativity: 'resume.creativity',
  cv: 'resume.cv',
};

const STAGES: PipelineStage[] = [
  {
    id: 'analyze',
    label: 'Analyzing posting',
    ms: 1200,
    sub: [
      'Tokenizing job description',
      'Extracting requirements',
      'Cross-referencing profile',
    ],
  },
  {
    id: 'match',
    label: 'Matching profile',
    ms: 1100,
    sub: ['Scoring experience entries', 'Selecting relevant projects', 'Ranking skills'],
  },
  {
    id: 'draft',
    label: 'Drafting prose',
    ms: 2200,
    sub: ['Generating summary', 'Rewriting bullets', 'Adjusting register'],
  },
  {
    id: 'polish',
    label: 'Polishing',
    ms: 1100,
    sub: ['Tightening verbs', 'Removing filler', 'Final pass'],
  },
  {
    id: 'render',
    label: 'Rendering vector',
    ms: 700,
    sub: ['Compositing layout', 'Embedding fonts'],
  },
];

type Step = 'brief' | 'pipeline' | 'proof';

export function ResumeScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const fromId = searchParams.get('from');

  const [step, setStep] = useSessionState<Step>(SS.step, 'brief');
  const [targetRole, setTargetRole] = useSessionState<string>(SS.targetRole, '');
  const [company, setCompany] = useSessionState<string>(SS.company, '');
  const [jobDescription, setJobDescription] = useSessionState<string>(
    SS.jobDescription,
    '',
  );
  const [creativity, setCreativity] = useSessionState<number>(SS.creativity, 50);
  const [cv, setCv] = useSessionState<CvJson | null>(SS.cv, null);
  const [error, setError] = useState<string | null>(null);

  // Prefill from a saved résumé when ?from=<id> is present — overrides any
  // persisted session state and resets the wizard to step 1.
  useEffect(() => {
    if (!fromId) return;
    let cancelled = false;
    getResume(fromId)
      .then((row) => {
        if (cancelled) return;
        setTargetRole(row.target_role ?? '');
        setCompany(row.company ?? '');
        setJobDescription(row.job_description ?? '');
        setCv(null);
        setStep('brief');
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load résumé for re-draft', err);
      })
      .finally(() => {
        if (!cancelled) {
          const next = new URLSearchParams(searchParams);
          next.delete('from');
          setSearchParams(next, { replace: true });
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromId]);

  const restart = () => {
    setStep('brief');
    setCv(null);
    setError(null);
  };

  const startOver = () => {
    setStep('brief');
    setTargetRole('');
    setCompany('');
    setJobDescription('');
    setCv(null);
    setError(null);
    clearSessionState(
      SS.step,
      SS.targetRole,
      SS.company,
      SS.jobDescription,
      SS.cv,
    );
  };

  const start = () => {
    if (!targetRole.trim() || !jobDescription.trim()) return;
    setError(null);
    setStep('pipeline');
  };

  return (
    <>
      <TopAppBar
        title="Résumé"
        breadcrumbs={['WORKSPACE', 'DRAFT / NEW DOCUMENT']}
        right={
          <>
            <button
              onClick={restart}
              className="px-4 border-r border-[var(--ink)] text-[11px] uppercase tracking-[0.12em] font-semibold text-secondary hover:text-[var(--ink)] flex items-center gap-1.5"
            >
              <Icon name="restart_alt" size={16} /> Reset
            </button>
            <button
              onClick={startOver}
              className="px-4 border-r border-[var(--ink)] text-[11px] uppercase tracking-[0.12em] font-semibold text-secondary hover:text-[var(--ink)] flex items-center gap-1.5"
            >
              <Icon name="ink_eraser" size={16} /> Clear
            </button>
          </>
        }
      />

      {/* Step header */}
      <div className="border-b border-[var(--ink)] grid grid-cols-3 bg-surface-container-low">
        {(['BRIEF', 'PIPELINE', 'PROOF'] as const).map((s, i) => {
          const id: Step = (['brief', 'pipeline', 'proof'] as const)[i];
          const active = id === step;
          const order = (['brief', 'pipeline', 'proof'] as const).indexOf(step);
          const done = i < order;
          return (
            <div
              key={s}
              className={`px-5 py-3 border-r border-[var(--ink)] flex items-center gap-3 ${
                active ? 'bg-[var(--ink)] text-[var(--paper)]' : ''
              }`}
            >
              <span
                className={`mono text-[10px] tracking-[0.18em] ${
                  active ? '' : 'text-secondary'
                }`}
              >
                0{i + 1}
              </span>
              <Icon
                name={
                  done
                    ? 'check'
                    : (['assignment', 'settings', 'verified'] as const)[i]
                }
                size={16}
              />
              <span className="text-[11px] uppercase tracking-[0.15em] font-bold">
                {s}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="border-b border-red-700 bg-red-50 px-10 py-3 text-[12px] text-red-800 mono">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {step === 'brief' && (
          <BriefStep
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            company={company}
            setCompany={setCompany}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            creativity={creativity}
            setCreativity={setCreativity}
            onStart={start}
          />
        )}
        {step === 'pipeline' && (
          <PipelineRunner
            targetRole={targetRole}
            jobDescription={jobDescription}
            creativity={creativity}
            onComplete={(result) => {
              if (result.data) {
                setCv(result.data);
                setStep('proof');
              } else {
                setError(
                  result.error instanceof Error
                    ? result.error.message
                    : 'Generation failed',
                );
                setStep('brief');
              }
            }}
          />
        )}
        {step === 'proof' && cv && (
          <ProofStep
            cv={cv}
            targetRole={targetRole}
            company={company}
            jobDescription={jobDescription}
            additionalComments={creativityHint(creativity)}
            onStartOver={startOver}
          />
        )}
      </div>
    </>
  );
}

// =========================================================================

interface BriefStepProps {
  targetRole: string;
  setTargetRole: (v: string) => void;
  company: string;
  setCompany: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  creativity: number;
  setCreativity: (v: number) => void;
  onStart: () => void;
}

function BriefStep({
  targetRole,
  setTargetRole,
  company,
  setCompany,
  jobDescription,
  setJobDescription,
  creativity,
  setCreativity,
  onStart,
}: BriefStepProps) {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 60_000,
  });
  const ready = targetRole.trim() && jobDescription.trim();

  return (
    <div className="grid lg:grid-cols-[1fr_360px] h-full overflow-hidden">
      <div className="overflow-y-auto p-5 md:p-10 space-y-6 md:space-y-8 custom-scrollbar">
        <div>
          <div className="text-[10px] mono uppercase tracking-[0.18em] text-secondary mb-2">
            STEP 01 · BRIEF
          </div>
          <h2 className="text-headline-lg uppercase tracking-[-0.02em] font-medium mb-2">
            Paste the posting.
          </h2>
          <p className="text-sm text-secondary max-w-xl leading-relaxed">
            We'll extract requirements, infer tone, and surface relevant
            experience from your profile before drafting.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
              Target role · Required
            </label>
            <input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Senior Backend Engineer"
              className="w-full bg-transparent border border-[var(--ink)] px-3 py-2 text-[15px] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
              Company · Optional
            </label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="ACME Corp"
              className="w-full bg-transparent border border-[var(--ink)] px-3 py-2 text-[15px] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary">
              Job description · Required
            </label>
            <span className="text-[10px] mono uppercase tracking-[0.12em] text-secondary">
              {jobDescription.length} CHARS
            </span>
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            placeholder="Paste the full job posting…"
            className="w-full bg-transparent border border-[var(--ink)] p-4 text-[14px] focus:outline-none leading-relaxed mono"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary">
              AI tone
            </label>
            <span className="text-[10px] mono uppercase tracking-[0.12em] text-secondary">
              {creativityLabel(creativity)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={creativity}
            onChange={(e) => setCreativity(+e.target.value)}
            className="w-full accent-[var(--ink)]"
          />
          <div className="mt-1 flex justify-between text-[10px] mono uppercase tracking-[0.12em] text-secondary">
            <span>Strict</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-[var(--ink)]">
          <button
            onClick={onStart}
            disabled={!ready}
            className="bg-[var(--ink)] text-[var(--paper)] px-6 py-3 text-[11px] uppercase tracking-[0.18em] font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Icon name="auto_awesome" size={16} fill={1} />
            Generate résumé →
          </button>
          {!ready && (
            <span className="text-[11px] mono uppercase tracking-[0.12em] text-secondary">
              Add target role and job description
            </span>
          )}
        </div>
      </div>

      <aside className="hidden lg:block border-l border-[var(--ink)] bg-surface-container-low p-10 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] mono uppercase tracking-[0.18em] text-secondary mb-3">
          USING · PROFILE
        </div>
        <div className="border border-[var(--ink)] p-4 bg-[var(--paper)]">
          <div className="text-[13px] font-semibold">
            {profile?.full_name ?? '—'}
          </div>
          <div className="text-[11px] text-secondary mt-1">
            {profile?.title ?? '—'}
          </div>
          <div className="mt-3 text-[11px] text-secondary mono">
            {profile?.skills.length ?? 0} skills · {profile?.experience.length ?? 0}{' '}
            entries · {profile?.education.length ?? 0} education
          </div>
        </div>
      </aside>
    </div>
  );
}

// =========================================================================

interface PipelineRunnerProps {
  targetRole: string;
  jobDescription: string;
  creativity: number;
  onComplete: (result: { data: CvJson | null; error: unknown | null }) => void;
}

function PipelineRunner({
  targetRole,
  jobDescription,
  creativity,
  onComplete,
}: PipelineRunnerProps) {
  const { activeStage, subProgress, log, apiState } = usePipelineRun<CvJson>({
    stages: STAGES,
    apiCall: () =>
      previewCv({
        targetRole,
        jobDescription,
        additionalComments: creativityHint(creativity),
      }),
    onSettled: onComplete,
  });

  return (
    <PipelineView
      stages={STAGES}
      activeStage={activeStage}
      subProgress={subProgress}
      log={log}
      apiState={apiState}
    />
  );
}

// =========================================================================

interface ProofStepProps {
  cv: CvJson;
  targetRole: string;
  company: string;
  jobDescription: string;
  additionalComments: string;
  onStartOver: () => void;
}

function ProofStep({
  cv,
  targetRole,
  company,
  jobDescription,
  additionalComments: _additionalComments,
  onStartOver,
}: ProofStepProps) {
  const toast = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 60_000,
  });

  // Stream the summary and bullets into the document for that "live drafting" feel
  const [streamedSummary, setStreamedSummary] = useState('');
  const [streamedJobIdx, setStreamedJobIdx] = useState(0);
  useEffect(() => {
    if (!cv.summary) return;
    const full = cv.summary;
    let i = 0;
    const id = setInterval(() => {
      i += Math.max(2, Math.floor(Math.random() * 5));
      setStreamedSummary(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(id);
        // then stream experience entries
        let jobI = 0;
        const jobId = setInterval(() => {
          jobI++;
          setStreamedJobIdx(jobI);
          if (jobI >= cv.experience.length) clearInterval(jobId);
        }, 280);
      }
    }, 22);
    return () => clearInterval(id);
  }, [cv]);

  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const save = async () => {
    setSaving(true);
    try {
      const row = await saveResume({
        target_role: targetRole,
        company: company || undefined,
        job_description: jobDescription,
        cv_json: cv,
      });
      setSavedId(row.id);
      qc.invalidateQueries({ queryKey: ['resumes'] });
      toast.push({ title: 'Saved to documents', icon: 'check_circle' });
    } catch (err) {
      console.error(err);
      toast.push({
        title: 'Save failed',
        body: 'See the console for details',
        icon: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const [exporting, setExporting] = useState(false);
  const exportPdf = async () => {
    setExporting(true);
    try {
      await downloadCvPdf({
        targetRole,
        jobDescription,
        additionalComments: _additionalComments,
      });
      toast.push({ title: 'PDF downloading', icon: 'picture_as_pdf' });
    } catch (err) {
      console.error(err);
      toast.push({
        title: 'Export failed',
        body: 'See the console for details',
        icon: 'error',
      });
    } finally {
      setExporting(false);
    }
  };

  const contactBits = [
    profile?.email,
    profile?.location,
    profile?.phone,
    ...(profile?.links ?? []).map((l) => l.label),
  ].filter((s): s is string => !!s && s.length > 0);

  const summaryStreaming = streamedSummary.length < (cv.summary ?? '').length;

  return (
    <div className="grid lg:grid-cols-[1fr_360px] h-full overflow-hidden">
      <div className="overflow-y-auto custom-scrollbar p-4 md:p-10 bg-surface-container-low">
        <div
          className="max-w-3xl mx-auto bg-white text-black shadow-[4px_4px_0_var(--ink)] md:shadow-[8px_8px_0_var(--ink)] border border-[var(--ink)] px-5 py-6 md:px-12 md:py-10 fade-in"
          style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
        >
          {/* Header */}
          <h1 className="text-center text-[24px] font-bold uppercase tracking-[0.02em]">
            {profile?.full_name ?? 'Your Name'}
          </h1>
          <div className="mt-1 text-center text-[11px]">
            {contactBits.join(' • ')}
          </div>

          {/* Technical strengths */}
          {cv.technicalStrengths && cv.technicalStrengths.length > 0 && (
            <Section title="TECHNICAL STRENGTHS">
              <p className="text-[12px] leading-relaxed">
                {cv.technicalStrengths.join(', ')}
              </p>
            </Section>
          )}

          {/* Summary */}
          <Section title="SUMMARY">
            <p className="text-[12px] leading-relaxed">
              {streamedSummary}
              {summaryStreaming && <span className="blink">█</span>}
            </p>
          </Section>

          {/* Experience */}
          {cv.experience.length > 0 && (
            <Section title="WORK EXPERIENCE">
              <div className="space-y-4">
                {cv.experience.slice(0, streamedJobIdx).map((job, i) => (
                  <div key={i} className="fade-in">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="text-[12px]">
                        <span className="font-bold">{job.title}</span>
                        <span> | </span>
                        <span className="italic">{job.company}</span>
                      </div>
                      <span className="text-[11px] shrink-0">{job.period}</span>
                    </div>
                    {job.subtitle && (
                      <div className="italic text-[11px] mt-0.5">
                        {job.subtitle}
                      </div>
                    )}
                    {job.bullets && job.bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-1 text-[12px] leading-relaxed">
                        {job.bullets.map((b, j) => (
                          <li key={j} className="pl-3 -indent-3">
                            • {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                {streamedJobIdx > 0 &&
                  streamedJobIdx < cv.experience.length && (
                    <div className="text-[11px] italic text-secondary blink">
                      █ generating…
                    </div>
                  )}
              </div>
            </Section>
          )}

          {/* Projects */}
          {cv.projects && cv.projects.length > 0 && (
            <Section title="PROJECTS">
              <div className="space-y-3">
                {cv.projects.map((p, i) => (
                  <div key={i}>
                    <div className="text-[12px]">
                      <span className="font-bold">{p.name}</span>
                      {p.tech && p.tech.length > 0 && (
                        <>
                          <span> | </span>
                          <span className="italic">{p.tech.join(', ')}</span>
                        </>
                      )}
                    </div>
                    {p.bullets && p.bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-1 text-[12px] leading-relaxed">
                        {p.bullets.map((b, j) => (
                          <li key={j} className="pl-3 -indent-3">
                            • {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Education */}
          {cv.education && cv.education.length > 0 && (
            <Section title="EDUCATION">
              <div className="space-y-2">
                {cv.education.map((e, i) => (
                  <div key={i}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[12px] font-bold">{e.school}</span>
                      {e.location && (
                        <span className="text-[11px] shrink-0">
                          {e.location}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="italic text-[11px]">{e.degree}</span>
                      <span className="italic text-[11px] shrink-0">
                        {e.period}
                      </span>
                    </div>
                    {e.coursework && (
                      <div className="italic text-[11px] mt-0.5">
                        Coursework: {e.coursework}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>

      <aside className="border-t lg:border-t-0 lg:border-l border-[var(--ink)] bg-[var(--paper)] flex flex-col">
        <div className="border-b border-[var(--ink)] px-5 py-3 flex items-center justify-between">
          <span className="text-[10px] mono uppercase tracking-[0.18em] text-secondary">
            PROOF · CONTROLS
          </span>
          {savedId ? (
            <span className="stamp">SAVED</span>
          ) : (
            <span className="stamp">UNSAVED</span>
          )}
        </div>

        <div className="p-5 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          <div>
            <div className="text-[10px] mono uppercase tracking-[0.18em] text-secondary mb-2">
              ACTIONS
            </div>
            <div className="space-y-2">
              <button
                onClick={exportPdf}
                disabled={exporting}
                className="w-full bg-[var(--ink)] text-[var(--paper)] py-3 text-[11px] uppercase tracking-[0.18em] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Icon name="picture_as_pdf" size={16} />
                {exporting ? 'Exporting…' : 'Export PDF'}
              </button>
              <button
                onClick={save}
                disabled={saving || !!savedId}
                className="w-full border border-[var(--ink)] py-2 text-[11px] uppercase tracking-[0.12em] font-semibold disabled:opacity-50 hover:bg-surface-container flex items-center justify-center gap-1.5"
              >
                <Icon name="bookmark_add" size={14} />
                {savedId ? 'Saved to documents' : saving ? 'Saving…' : 'Save to documents'}
              </button>
              <button
                onClick={() => navigate('/letter')}
                className="w-full border border-[var(--ink)] py-2 text-[11px] uppercase tracking-[0.12em] font-semibold hover:bg-surface-container flex items-center justify-center gap-1.5 transition-colors duration-200"
              >
                <Icon name="mail" size={14} /> Draft a cover letter
              </button>
              <button
                onClick={onStartOver}
                className="w-full border border-[var(--ink)] py-2 text-[11px] uppercase tracking-[0.12em] font-semibold hover:bg-[var(--ink)] hover:text-[var(--paper)] flex items-center justify-center gap-1.5 transition-colors duration-200"
              >
                <Icon name="restart_alt" size={14} /> Generate new
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-4">
      <h2 className="text-[12px] font-bold uppercase tracking-[0.02em] border-b border-black pb-0.5 mb-1.5">
        {title}
      </h2>
      {children}
    </section>
  );
}

