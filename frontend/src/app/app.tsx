import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../lib/auth';
import { AuthGate } from '../routes/AuthGate';
import { SignInScreen } from '../screens/SignInScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ResumeScreen } from '../screens/ResumeScreen';
import { LetterScreen } from '../screens/LetterScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';
import { WorkspaceShell } from '../components/chrome/WorkspaceShell';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/signin"
              element={
                <AuthGate mode="guest">
                  <SignInScreen />
                </AuthGate>
              }
            />
            <Route
              path="/onboarding"
              element={
                <AuthGate mode="authed-any">
                  <OnboardingScreen />
                </AuthGate>
              }
            />

            <Route
              element={
                <AuthGate mode="authed">
                  <WorkspaceShell />
                </AuthGate>
              }
            >
              <Route path="/" element={<HomeScreen />} />
              <Route path="/resume" element={<ResumeScreen />} />
              <Route path="/letter" element={<LetterScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route
                path="/archive"
                element={
                  <PlaceholderScreen
                    title="Archive"
                    subtitle="Reserved"
                    icon="archive"
                  />
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
