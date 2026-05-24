import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TopAppBar } from '../components/chrome/TopAppBar';
import { Icon } from '../components/chrome/Icon';
import { useToast } from '../components/chrome/ToastStack';
import { PipelineView } from '../components/wizard/PipelineView';
import { PipelineStage, usePipelineRun } from '../lib/usePipelineRun';
import {
  downloadCoverLetterPdf,
  downloadCustomCoverLetterPdf,
  fetchProfile,
  getCoverLetter,
  previewCoverLetterText,
  saveCoverLetter,
} from '../lib/api';
import { clearSessionState, useSessionState } from '../lib/useSessionState';
import { creativityHint, creativityLabel } from '../lib/creativity';

const STAGES: PipelineStage[] = [
  {
    id: 'research',
    label: 'Researching the company',
    ms: 1100,
    sub: [
      'Reading the job description',
      'Identifying tone signals',
      'Inferring company voice',
    ],
  },
  {
    id: 'match',
    label: 'Matching your profile',
    ms: 1000,
    sub: ['Picking relevant experience', 'Surfacing strongest match'],
  },
  {
    id: 'draft',
    label: 'Drafting prose',
    ms: 2400,
    sub: [
      'Composing salutation',
      'Drafting opening',
      'Drafting middle',
      'Drafting close',
    ],
  },
  {
    id: 'polish',
    label: 'Polishing',
    ms: 1000,
    sub: ['Tightening register', 'Removing filler', 'Final pass'],
  },
];

type Step = 'brief' | 'pipeline' | 'proof';
type Recipient = 'Hiring Manager' | 'Recruiter' | 'Named contact' | 'Team';

const SS = {
  step: 'letter.step',
  company: 'letter.company',
  role: 'letter.role',
  recipient: 'letter.recipient',
  contactName: 'letter.contactName',
  jobDescription: 'letter.jobDescription',
  creativity: 'letter.creativity',
  letterText: 'letter.letterText',
};

export function LetterScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const fromId = searchParams.get('from');

  const [step, setStep] = useSessionState<Step>(SS.step, 'brief');
  const [company, setCompany] = useSessionState<string>(SS.company, '');
  const [role, setRole] = useSessionState<string>(SS.role, '');
  const [recipient, setRecipient] = useSessionState<Recipient>(
    SS.recipient,
    'Hiring Manager',
  );
  const [contactName, setContactName] = useSessionState<string>(
    SS.contactName,
    '',
  );
  const [jobDescription, setJobDescription] = useSessionState<string>(
    SS.jobDescription,
    '',
  );
  const [creativity, setCreativity] = useSessionState<number>(SS.creativity, 50);
  const [letterText, setLetterText] = useSessionState<string>(SS.letterText, '');
  const [error, setError] = useState<string | null>(null);

  // Prefill from a saved cover letter when ?from=<id> is present — overrides
  // any persisted session state and resets the wizard to step 1.
  useEffect(() => {
    if (!fromId) return;
    let cancelled = false;
    getCoverLetter(fromId)
      .then((row) => {
        if (cancelled) return;
        setCompany(row.company ?? '');
        setRole(row.role ?? '');
        setJobDescription(row.job_description ?? '');
        setLetterText('');
        setStep('brief');
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load cover letter for re-draft', err);
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
    setLetterText('');
    setError(null);
  };

  const startOver = () => {
    setStep('brief');
    setCompany('');
    setRole('');
    setRecipient('Hiring Manager');
    setContactName('');
    setJobDescription('');
    setLetterText('');
    setError(null);
    clearSessionState(
      SS.step,
      SS.company,
      SS.role,
      SS.recipient,
      SS.contactName,
      SS.jobDescription,
      SS.letterText,
    );
  };

  const start = () => {
    if (!company.trim() || !role.trim() || !jobDescription.trim()) return;
    setError(null);
    setStep('pipeline');
  };

  return (
    <>
      <TopAppBar
        title="Cover Letter"
        breadcrumbs={['WORKSPACE', 'DRAFT / CORRESPONDENCE']}
        right={
          <button
            onClick={restart}
            className="px-4 border-r border-[var(--ink)] text-[11px] uppercase tracking-[0.12em] font-semibold text-secondary hover:text-[var(--ink)] flex items-center gap-1.5"
          >
            <Icon name="restart_alt" size={16} /> Reset
          </button>
        }
      />

      <div className="border-b border-[var(--ink)] grid grid-cols-3 bg-surface-container-low">
        {(['BRIEF', 'DRAFTING', 'PROOF'] as const).map((s, i) => {
          const order = (['brief', 'pipeline', 'proof'] as const).indexOf(step);
          const active = i === order;
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
                    : (['assignment', 'draw', 'verified'] as const)[i]
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
            company={company}
            setCompany={setCompany}
            role={role}
            setRole={setRole}
            recipient={recipient}
            setRecipient={setRecipient}
            contactName={contactName}
            setContactName={setContactName}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            creativity={creativity}
            setCreativity={setCreativity}
            onStart={start}
          />
        )}
        {step === 'pipeline' && (
          <PipelineRunner
            company={company}
            role={role}
            recipient={recipient}
            contactName={contactName}
            jobDescription={jobDescription}
            creativity={creativity}
            onComplete={(result) => {
              if (result.data) {
                setLetterText(result.data);
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
        {step === 'proof' && letterText && (
          <ProofStep
            company={company}
            role={role}
            jobDescription={jobDescription}
            initialText={letterText}
            onStartOver={startOver}
          />
        )}
      </div>
    </>
  );
}

// =========================================================================

interface BriefStepProps {
  company: string;
  setCompany: (v: string) => void;
  role: string;
  setRole: (v: string) => void;
  recipient: Recipient;
  setRecipient: (v: Recipient) => void;
  contactName: string;
  setContactName: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  creativity: number;
  setCreativity: (v: number) => void;
  onStart: () => void;
}

function BriefStep(props: BriefStepProps) {
  const ready =
    props.company.trim() && props.role.trim() && props.jobDescription.trim();
  return (
    <div className="overflow-y-auto p-5 md:p-10 space-y-6 md:space-y-8 custom-scrollbar h-full">
      <div className="max-w-3xl">
        <div className="text-[10px] mono uppercase tracking-[0.18em] text-secondary mb-2">
          STEP 01 · BRIEF
        </div>
        <h2 className="text-headline-lg uppercase tracking-[-0.02em] font-medium mb-2">
          Address the company.
        </h2>
        <p className="text-sm text-secondary max-w-xl leading-relaxed">
          Company name + posting. We'll match it against your profile and draft
          a letter in your voice.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 max-w-3xl">
        <div>
          <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
            Company · Required
          </label>
          <input
            value={props.company}
            onChange={(e) => props.setCompany(e.target.value)}
            placeholder="e.g. Anthropic"
            className="w-full bg-transparent border border-[var(--ink)] px-3 py-2 text-[15px] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
            Role · Required
          </label>
          <input
            value={props.role}
            onChange={(e) => props.setRole(e.target.value)}
            placeholder="Senior Software Engineer"
            className="w-full bg-transparent border border-[var(--ink)] px-3 py-2 text-[15px] focus:outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
            Salutation
          </label>
          <div className="flex gap-px bg-[var(--ink)] border border-[var(--ink)] mt-1">
            {(
              ['Hiring Manager', 'Recruiter', 'Named contact', 'Team'] as const
            ).map((r) => (
              <button
                key={r}
                onClick={() => props.setRecipient(r)}
                className={`flex-1 py-2 text-[11px] uppercase tracking-[0.1em] font-semibold transition-colors duration-150 ${
                  props.recipient === r
                    ? 'bg-[var(--ink)] text-[var(--paper)]'
                    : 'bg-[var(--paper)] text-secondary hover:text-[var(--ink)]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {props.recipient === 'Named contact' && (
          <div className="md:col-span-2 fade-in">
            <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary block mb-1">
              Contact name
            </label>
            <input
              value={props.contactName}
              onChange={(e) => props.setContactName(e.target.value)}
              placeholder="e.g. Dario Amodei"
              className="w-full bg-transparent border border-[var(--ink)] px-3 py-2 text-[15px] focus:outline-none mono"
            />
          </div>
        )}
      </div>

      <div className="max-w-3xl">
        <div className="flex items-baseline justify-between mb-2">
          <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary">
            Job description · Required
          </label>
          <span className="text-[10px] mono uppercase tracking-[0.12em] text-secondary">
            {props.jobDescription.length} CHARS
          </span>
        </div>
        <textarea
          value={props.jobDescription}
          onChange={(e) => props.setJobDescription(e.target.value)}
          rows={8}
          placeholder="Paste the full job posting…"
          className="w-full bg-transparent border border-[var(--ink)] p-4 text-[14px] focus:outline-none leading-relaxed mono"
        />
      </div>

      <div className="max-w-3xl">
        <div className="flex items-baseline justify-between mb-2">
          <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary">
            AI tone
          </label>
          <span className="text-[10px] mono uppercase tracking-[0.12em] text-secondary">
            {creativityLabel(props.creativity)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={props.creativity}
          onChange={(e) => props.setCreativity(+e.target.value)}
          className="w-full accent-[var(--ink)]"
        />
        <div className="mt-1 flex justify-between text-[10px] mono uppercase tracking-[0.12em] text-secondary">
          <span>Strict</span>
          <span>Balanced</span>
          <span>Creative</span>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-[var(--ink)] max-w-3xl">
        <button
          onClick={props.onStart}
          disabled={!ready}
          className="bg-[var(--ink)] text-[var(--paper)] px-6 py-3 text-[11px] uppercase tracking-[0.18em] font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Icon name="auto_awesome" size={16} fill={1} />
          Draft letter →
        </button>
        {!ready && (
          <span className="text-[11px] mono uppercase tracking-[0.12em] text-secondary">
            Company, role, and description required
          </span>
        )}
      </div>
    </div>
  );
}

// =========================================================================

interface PipelineRunnerProps {
  company: string;
  role: string;
  recipient: Recipient;
  contactName: string;
  jobDescription: string;
  creativity: number;
  onComplete: (result: { data: string | null; error: unknown | null }) => void;
}

function PipelineRunner(props: PipelineRunnerProps) {
  const { activeStage, subProgress, log, apiState } = usePipelineRun<string>({
    stages: STAGES,
    apiCall: () =>
      previewCoverLetterText({
        jobTitle: props.role,
        companyName: props.company,
        jobDescription: props.jobDescription,
        additionalComments: combineLetterHint(
          props.creativity,
          props.recipient,
          props.contactName,
        ),
      }),
    onSettled: props.onComplete,
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
  company: string;
  role: string;
  jobDescription: string;
  initialText: string;
  onStartOver: () => void;
}

function ProofStep({
  company,
  role,
  jobDescription,
  initialText,
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

  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    // Stream the letter in
    let i = 0;
    const id = setInterval(() => {
      i += Math.max(2, Math.floor(Math.random() * 5));
      setText(initialText.slice(0, i));
      if (i >= initialText.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [initialText]);

  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const save = async () => {
    setSaving(true);
    try {
      const row = await saveCoverLetter({
        company,
        role,
        job_description: jobDescription,
        body_text: initialText,
        edited_text: editing && text !== initialText ? text : undefined,
      });
      setSavedId(row.id);
      qc.invalidateQueries({ queryKey: ['cover-letters'] });
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
      if (editing && text !== initialText) {
        await downloadCustomCoverLetterPdf(text, company);
      } else {
        await downloadCoverLetterPdf({
          jobTitle: role,
          companyName: company,
          jobDescription,
        });
      }
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

  return (
    <div className="grid lg:grid-cols-[1fr_360px] h-full overflow-hidden">
      <div className="overflow-y-auto custom-scrollbar p-4 md:p-10 bg-surface-container-low">
        <div className="max-w-3xl mx-auto bg-[var(--paper)] border-2 border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] md:shadow-[8px_8px_0_var(--ink)] p-5 md:p-12 fade-in">
          {/* Letterhead */}
          <div className="flex items-start justify-between border-b-2 border-[var(--ink)] pb-5 mb-6">
            <div>
              <h1 className="text-2xl uppercase tracking-[-0.02em] font-medium">
                {profile?.full_name ?? 'Your Name'}
              </h1>
              <div className="mt-1 text-[12px] mono uppercase tracking-[0.15em] text-secondary">
                {[profile?.email, profile?.phone, profile?.location]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            </div>
            <div className="text-right mono text-[10px] uppercase tracking-[0.15em] text-secondary leading-tight">
              <div>COVER LETTER</div>
              <div>FOR / {company.toUpperCase()}</div>
              <div>{role.toUpperCase()}</div>
            </div>
          </div>

          {editing ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={20}
              className="w-full bg-transparent border border-[var(--ink)] p-4 text-[14px] focus:outline-none leading-relaxed"
            />
          ) : (
            <div className="text-[14px] leading-relaxed whitespace-pre-line">
              {text}
              {text.length < initialText.length && (
                <span className="blink">█</span>
              )}
            </div>
          )}
        </div>
      </div>

      <aside className="border-t lg:border-t-0 lg:border-l border-[var(--ink)] bg-[var(--paper)] flex flex-col">
        <div className="border-b border-[var(--ink)] px-5 py-3 flex items-center justify-between">
          <span className="text-[10px] mono uppercase tracking-[0.18em] text-secondary">
            PROOF · CONTROLS
          </span>
          <span className="stamp">{savedId ? 'SAVED' : 'UNSAVED'}</span>
        </div>

        <div className="p-5 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          <div>
            <div className="text-[10px] mono uppercase tracking-[0.18em] text-secondary mb-2">
              EDIT
            </div>
            <button
              onClick={() => setEditing((v) => !v)}
              className="w-full border border-[var(--ink)] py-2 text-[11px] uppercase tracking-[0.12em] font-semibold hover:bg-surface-container flex items-center justify-center gap-1.5"
            >
              <Icon name={editing ? 'check' : 'edit'} size={14} />
              {editing ? 'Done editing' : 'Edit text'}
            </button>
          </div>

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
                {savedId ? 'Saved' : saving ? 'Saving…' : 'Save to documents'}
              </button>
              <button
                onClick={() => navigate('/resume')}
                className="w-full border border-[var(--ink)] py-2 text-[11px] uppercase tracking-[0.12em] font-semibold hover:bg-surface-container flex items-center justify-center gap-1.5 transition-colors duration-200"
              >
                <Icon name="description" size={14} /> Draft a résumé
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

function combineLetterHint(
  creativity: number,
  recipient: Recipient,
  contactName: string,
): string {
  const salutation =
    recipient === 'Named contact' && contactName.trim()
      ? `Address it to "Dear ${contactName.trim()}".`
      : `Open with "Dear ${recipient}".`;
  return `${salutation} ${creativityHint(creativity)}`;
}
