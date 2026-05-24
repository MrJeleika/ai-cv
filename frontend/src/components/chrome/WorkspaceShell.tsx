import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from './Sidebar';
import { FooterBar } from './FooterBar';
import { ToastProvider } from './ToastStack';
import { MobileMenuProvider } from './MobileMenuContext';
import { MobileBottomNav } from './MobileBottomNav';
import { fetchProfile } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export function WorkspaceShell() {
  const { session } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user.id],
    queryFn: fetchProfile,
    enabled: !!session,
    staleTime: 60_000,
  });

  return (
    <MobileMenuProvider>
      <ToastProvider>
        <div className="min-h-screen flex">
          <Sidebar
            fullName={profile?.full_name ?? null}
            title={profile?.title ?? null}
          />
          <main className="flex-1 min-w-0 lg:pl-64 flex flex-col min-h-screen overflow-x-hidden pb-16 lg:pb-0">
            <Outlet />
            <div className="hidden lg:block">
              <FooterBar />
            </div>
          </main>
        </div>
        <MobileBottomNav />
      </ToastProvider>
    </MobileMenuProvider>
  );
}
