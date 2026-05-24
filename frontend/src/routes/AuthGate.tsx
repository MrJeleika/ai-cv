import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../lib/auth';
import { fetchProfile } from '../lib/api';

interface AuthGateProps {
  /**
   * `'authed'` — must be signed in AND onboarding_complete to render children.
   *   Unauth → /signin. Authed but onboarding incomplete → /onboarding.
   *
   * `'authed-any'` — signed in only; used by the onboarding route itself so it
   *   doesn't redirect to itself.
   *
   * `'guest'` — must be signed OUT; used by /signin to bounce already-signed-in
   *   users to the home page.
   */
  mode?: 'authed' | 'authed-any' | 'guest';
  children: ReactNode;
}

export function AuthGate({ mode = 'authed', children }: AuthGateProps) {
  const { loading, session } = useAuth();
  const location = useLocation();

  // While the initial session load is happening, render a minimal loader.
  if (loading) return <BootLoader />;

  if (mode === 'guest') {
    if (session) return <Navigate to="/" replace />;
    return <>{children}</>;
  }

  if (!session) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (mode === 'authed-any') return <>{children}</>;

  // mode === 'authed' — gate on onboarding completion
  return <OnboardingGate>{children}</OnboardingGate>;
}

function OnboardingGate({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile', session?.user.id],
    queryFn: fetchProfile,
    enabled: !!session,
    staleTime: 60_000,
  });

  if (isLoading) return <BootLoader />;
  if (isError) return <BootLoader message="Couldn't load profile." />;
  if (data && !data.onboarding_complete) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

function BootLoader({ message }: { message?: string } = {}) {
  // The initial flash of a blank screen is unavoidable while supabase reads its
  // session from storage — keep this lightweight + on-theme.
  const [showSlow, setShowSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowSlow(true), 600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[var(--paper)] text-[var(--ink)]">
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-secondary">
        Loading workspace
      </div>
      {showSlow && message && (
        <div className="text-[12px] text-secondary fade-in">{message}</div>
      )}
    </div>
  );
}
