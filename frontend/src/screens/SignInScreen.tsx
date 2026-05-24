import { FormEvent, ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Icon } from '../components/chrome/Icon';

type Mode = 'signin' | 'signup';

export function SignInScreen() {
  const navigate = useNavigate();
  const { signInWithPassword, signUpWithPassword, signInWithGoogle } =
    useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithPassword(email, password);
        navigate('/');
      } else {
        const { session } = await signUpWithPassword(email, password);
        if (session) {
          // Email confirmation is OFF in Supabase — user is logged in.
          navigate('/onboarding');
        } else {
          // Email confirmation is ON — show a friendly hint.
          setPendingConfirmation(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      // OAuth redirect handles the rest; control returns here only if it fails.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)]">
      <div className="flex items-center justify-between border-b border-[var(--ink)] px-10 h-9 mono text-[10px] uppercase tracking-[0.18em] text-secondary">
        <div className="flex items-center gap-4">
          <span>◆ CURRICULUM</span>
          <span className="hidden md:inline">Resume Workspace</span>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-[1fr_560px]">
        {/* LEFT — editorial */}
        <div className="relative hidden lg:flex flex-col border-r border-[var(--ink)] grid-paper p-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center">
                <Icon name="architecture" size={22} fill={1} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[12px] font-bold uppercase tracking-[0.18em]">
                  Curriculum
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-secondary mono">
                  Resume Workspace
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center -mt-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-6">
                <span className="stamp">AUTH · GATE</span>
                <span className="text-[10px] mono uppercase tracking-[0.18em] text-secondary">
                  SECTION / IDENTITY
                </span>
              </div>
              <h1 className="text-headline-xl uppercase tracking-[-0.03em] leading-[1] font-medium">
                Build your career,
                <br />
                <span className="italic font-normal">on</span> your terms.
                <br />
                Draft{' '}
                <span className="border-2 border-[var(--ink)] px-3 py-0.5 inline-block">
                  precisely.
                </span>
              </h1>
              <p className="mt-8 text-body-md max-w-md text-secondary leading-relaxed">
                Curriculum is a workspace for the considered career — résumés
                and cover letters, drafted with the care of a working document.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="flex flex-col p-10">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center">
              <Icon name="architecture" size={22} fill={1} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[12px] font-bold uppercase tracking-[0.18em]">
                Curriculum
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-secondary mono">
                Resume Workspace
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
            <div className="mb-8">
              <h2 className="text-headline-lg uppercase tracking-[-0.02em] font-medium">
                {mode === 'signup' ? 'Create your account' : 'Sign in'}
              </h2>
              <p className="text-sm text-secondary mt-2">
                {mode === 'signup'
                  ? 'Start a new workspace. You can configure your profile next.'
                  : 'Pick up where you left off, or create a new account.'}
              </p>
            </div>

            <div className="flex gap-px bg-[var(--ink)] border border-[var(--ink)] mb-6">
              <TabButton
                active={mode === 'signin'}
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
              >
                Sign in
              </TabButton>
              <TabButton
                active={mode === 'signup'}
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
              >
                Sign up
              </TabButton>
            </div>

            {pendingConfirmation && (
              <div className="mb-6 border-2 border-[var(--ink)] p-4 fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="mark_email_read" size={20} />
                  <span className="stamp">DISPATCHED</span>
                </div>
                <h3 className="text-lg font-medium uppercase tracking-[-0.01em] mb-1">
                  Check your inbox.
                </h3>
                <p className="text-[12px] text-secondary leading-relaxed">
                  Confirm your address from the email we just sent to{' '}
                  <span className="mono">{email}</span>, then come back and sign
                  in. (Or disable email confirmation in your Supabase project
                  for a one-click demo flow.)
                </p>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4 fade-in">
              <Field label="Email · Identifier">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-2 border-[var(--ink)] px-3 py-2 text-[15px] focus:outline-none mono"
                />
              </Field>
              <Field label="Password · Encrypted">
                <div className="flex items-center gap-2 border-2 border-[var(--ink)] px-3 py-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete={
                      mode === 'signup' ? 'new-password' : 'current-password'
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-transparent text-[15px] focus:outline-none mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-secondary"
                  >
                    <Icon
                      name={showPassword ? 'visibility' : 'visibility_off'}
                      size={18}
                    />
                  </button>
                </div>
              </Field>
              {mode === 'signup' && (
                <Field label="Confirm password">
                  <div className="flex items-center gap-2 border-2 border-[var(--ink)] px-3 py-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="flex-1 bg-transparent text-[15px] focus:outline-none mono"
                    />
                  </div>
                </Field>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--ink)] text-[var(--paper)] py-3.5 text-[11px] uppercase tracking-[0.18em] font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="blink">█</span>{' '}
                    {mode === 'signup' ? 'Creating account…' : 'Signing in…'}
                  </>
                ) : (
                  <>
                    {mode === 'signup'
                      ? 'Create account →'
                      : 'Sign in & resume →'}
                  </>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-[10px] mono uppercase tracking-[0.18em] text-secondary">
              <span className="flex-1 border-t border-[var(--ink)]" />
              <span>or</span>
              <span className="flex-1 border-t border-[var(--ink)]" />
            </div>

            <button
              onClick={google}
              disabled={loading}
              className="w-full border-2 border-[var(--ink)] py-3 text-[12px] uppercase tracking-[0.12em] font-semibold flex items-center justify-center gap-3 transition-colors duration-200 hover:bg-[var(--ink)] hover:text-[var(--paper)] disabled:opacity-50"
            >
              <Icon name="public" size={16} />
              Continue with Google
            </button>

            {error && (
              <div className="mt-4 border border-red-700 text-red-800 px-3 py-2 text-[12px] fade-in">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label className="text-[10px] mono uppercase tracking-[0.18em] text-secondary">
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2.5 text-[11px] uppercase tracking-[0.12em] font-semibold transition-colors ${
        active
          ? 'bg-[var(--ink)] text-[var(--paper)]'
          : 'bg-[var(--paper)] text-secondary hover:text-[var(--ink)]'
      }`}
    >
      {children}
    </button>
  );
}
