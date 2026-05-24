import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { TopAppBar } from '../components/chrome/TopAppBar';
import { Icon } from '../components/chrome/Icon';
import { useToast } from '../components/chrome/ToastStack';
import {
  CoverLetterRow,
  ResumeRow,
  deleteCoverLetter,
  deleteResume,
  downloadSavedCoverLetterPdf,
  downloadSavedResumePdf,
  fetchProfile,
  listCoverLetters,
  listResumes,
} from '../lib/api';

type Kind = 'all' | 'resume' | 'letter';

interface DocItem {
  id: string;
  kind: 'resume' | 'letter';
  title: string;
  company: string | null;
  createdAt: string;
}

export function HomeScreen() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Kind>('all');

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 60_000,
  });

  const queries = useQueries({
    queries: [
      {
        queryKey: ['resumes'],
        queryFn: () => listResumes(50),
        staleTime: 30_000,
      },
      {
        queryKey: ['cover-letters'],
        queryFn: () => listCoverLetters(50),
        staleTime: 30_000,
      },
    ],
  });
  const resumes: ResumeRow[] = queries[0].data ?? [];
  const letters: CoverLetterRow[] = queries[1].data ?? [];
  const loading = queries.some((q) => q.isLoading);

  const items: DocItem[] = [
    ...resumes.map((r) => ({
      id: r.id,
      kind: 'resume' as const,
      title: r.target_role ?? 'Untitled résumé',
      company: r.company,
      createdAt: r.created_at,
    })),
    ...letters.map((l) => ({
      id: l.id,
      kind: 'letter' as const,
      title: l.role ?? 'Untitled letter',
      company: l.company,
      createdAt: l.created_at,
    })),
  ]
    .filter((d) => filter === 'all' || d.kind === filter)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const firstName = (profile?.full_name ?? '').split(/\s+/)[0] || 'there';

  return (
    <>
      <TopAppBar
        title="Documents"
        breadcrumbs={['WORKSPACE', 'DRAFTS']}
        tabs={[
          { id: 'all', label: 'All', count: resumes.length + letters.length },
          { id: 'resume', label: 'Résumés', count: resumes.length },
          { id: 'letter', label: 'Cover Letters', count: letters.length },
        ]}
        activeTab={filter}
        onTab={(id) => setFilter(id as Kind)}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Greeting / CTAs — top-aligned text on the left */}
        <div className="border-b border-[var(--ink)] px-5 md:px-10 py-6 md:py-8 grid lg:grid-cols-[1fr_auto] gap-6 lg:gap-8 items-start bg-surface-container-low">
          <div>
            <div className="text-[10px] mono uppercase tracking-[0.18em] text-secondary mb-2">
              {greeting()} · {dateLine()}
            </div>
            <h1 className="text-headline-xl uppercase tracking-[-0.03em] leading-[1.05] font-medium max-w-2xl">
              Welcome back,{' '}
              <span className="italic font-normal">{firstName}.</span>
            </h1>
            <p className="mt-3 text-[14px] text-secondary max-w-xl leading-relaxed">
              Draft a new document, or pick up where you left off.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-[460px]">
            <button
              onClick={() => navigate('/resume')}
              className="group bg-[var(--ink)] text-[var(--paper)] p-5 text-left transition-all duration-200 border-2 border-[var(--ink)] hover:shadow-[6px_6px_0_var(--ink)] hover:-translate-x-1 hover:-translate-y-1"
            >
              <Icon name="auto_awesome" size={28} fill={1} className="mb-3" />
              <div className="text-[10px] mono uppercase tracking-[0.18em] opacity-70">
                01 / GENERATE
              </div>
              <div className="text-xl font-medium uppercase tracking-[-0.01em] mt-1">
                Résumé
              </div>
              <div className="mt-3 flex items-center gap-1 text-[10px] mono uppercase tracking-[0.15em] opacity-70 group-hover:opacity-100">
                From a job posting →
              </div>
            </button>
            <button
              onClick={() => navigate('/letter')}
              className="group bg-[var(--paper)] border-2 border-[var(--ink)] p-5 text-left transition-all duration-200 hover:shadow-[6px_6px_0_var(--ink)] hover:-translate-x-1 hover:-translate-y-1"
            >
              <Icon name="mail" size={28} className="mb-3" />
              <div className="text-[10px] mono uppercase tracking-[0.18em] text-secondary">
                02 / GENERATE
              </div>
              <div className="text-xl font-medium uppercase tracking-[-0.01em] mt-1">
                Cover Letter
              </div>
              <div className="mt-3 flex items-center gap-1 text-[10px] mono uppercase tracking-[0.15em] text-secondary group-hover:text-[var(--ink)]">
                For a company →
              </div>
            </button>
          </div>
        </div>

        {/* Document list */}
        <div className="px-5 md:px-10 py-6 md:py-8">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl uppercase tracking-[-0.01em] font-medium">
              Recent ·{' '}
              {filter === 'all'
                ? 'All documents'
                : filter === 'resume'
                  ? 'Résumés'
                  : 'Cover Letters'}
            </h2>
            <span className="mono text-[10px] uppercase tracking-[0.15em] text-secondary">
              {items.length}{' '}
              {filter !== 'all'
                ? 'of ' + (resumes.length + letters.length)
                : ''}{' '}
              FILED
            </span>
          </div>

          {loading && (
            <div className="border border-dashed border-[var(--ink)] p-8 text-center text-[12px] mono uppercase tracking-[0.15em] text-secondary">
              Loading documents…
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="border-2 border-dashed border-[var(--ink)] p-12 text-center">
              <Icon
                name="folder_open"
                size={32}
                className="mb-3 inline-block text-secondary"
              />
              <div className="text-[12px] mono uppercase tracking-[0.15em] text-secondary">
                Nothing here yet — draft a résumé or cover letter to get
                started.
              </div>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {items.map((d) => (
                <DocCard key={`${d.kind}-${d.id}`} doc={d} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function DocCard({ doc }: { doc: DocItem }) {
  const toast = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [downloading, setDownloading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const removeMutation = useMutation({
    mutationFn: () =>
      doc.kind === 'resume' ? deleteResume(doc.id) : deleteCoverLetter(doc.id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [doc.kind === 'resume' ? 'resumes' : 'cover-letters'],
      });
      toast.push({ title: 'Deleted', icon: 'delete' });
    },
    onError: () =>
      toast.push({ title: 'Delete failed', icon: 'error' }),
  });

  const download = async () => {
    setDownloading(true);
    try {
      if (doc.kind === 'resume') await downloadSavedResumePdf(doc.id);
      else await downloadSavedCoverLetterPdf(doc.id);
      toast.push({ title: 'PDF downloading', icon: 'picture_as_pdf' });
    } catch {
      toast.push({ title: 'Download failed', icon: 'error' });
    } finally {
      setDownloading(false);
    }
  };

  const redraft = () => {
    const path = doc.kind === 'resume' ? '/resume' : '/letter';
    navigate(`${path}?from=${doc.id}`);
  };

  return (
    <div className="border border-[var(--ink)] bg-[var(--paper)] transition-all duration-200 hover:shadow-[4px_4px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 flex flex-col">
      <div className="px-4 py-2 border-b border-[var(--ink)] flex items-center justify-between bg-surface-container-low">
        <span className="text-[10px] mono uppercase tracking-[0.15em] font-bold flex items-center gap-1.5">
          <Icon
            name={doc.kind === 'resume' ? 'description' : 'mail'}
            size={14}
          />
          {doc.kind === 'resume' ? 'RÉSUMÉ' : 'COVER LETTER'}
        </span>
        <span className="text-[10px] mono uppercase tracking-[0.12em] text-secondary">
          {formatRelative(doc.createdAt)}
        </span>
      </div>
      <div className="p-4 flex-1">
        <div className="text-[14px] font-semibold uppercase tracking-[-0.005em] leading-tight">
          {doc.title}
        </div>
        {doc.company && (
          <div className="text-[11px] mono uppercase tracking-[0.12em] text-secondary mt-1">
            FOR · {doc.company.toUpperCase()}
          </div>
        )}
      </div>

      {confirmDelete ? (
        <div className="border-t border-[var(--ink)] grid grid-cols-2 divide-x divide-[var(--ink)] text-[10px] uppercase tracking-[0.1em] font-semibold">
          <button
            onClick={() => setConfirmDelete(false)}
            disabled={removeMutation.isPending}
            className="py-2.5 hover:bg-surface-container transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => removeMutation.mutate()}
            disabled={removeMutation.isPending}
            className="py-2.5 bg-red-700 text-white hover:bg-red-800 transition-colors duration-200 disabled:opacity-60"
          >
            {removeMutation.isPending ? 'Deleting…' : 'Confirm delete'}
          </button>
        </div>
      ) : (
        <div className="border-t border-[var(--ink)] grid grid-cols-3 divide-x divide-[var(--ink)] text-[10px] uppercase tracking-[0.1em] font-semibold">
          <button
            onClick={download}
            disabled={downloading}
            className="py-2.5 hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors duration-200 flex items-center justify-center gap-1 disabled:opacity-50"
            title="Download PDF"
          >
            <Icon name="download" size={12} />
            PDF
          </button>
          <button
            onClick={redraft}
            className="py-2.5 hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors duration-200 flex items-center justify-center gap-1"
            title="Edit inputs and re-generate"
          >
            <Icon name="edit" size={12} />
            Re-draft
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="py-2.5 hover:bg-red-700 hover:text-white transition-colors duration-200 flex items-center justify-center gap-1"
            title="Delete"
          >
            <Icon name="delete" size={12} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'WORKING LATE';
  if (h < 12) return 'GOOD MORNING';
  if (h < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

function dateLine() {
  return new Date()
    .toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    .toUpperCase();
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w ago`;
  return new Date(iso).toLocaleDateString('en-GB');
}
