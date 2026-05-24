import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Profile, ProfileUpdate, fetchProfile, updateProfile } from './api';
import { useAuth } from './auth';

const AUTOSAVE_DELAY = 800;

type SaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

interface UseProfileEditorReturn {
  loading: boolean;
  data: Profile | null;
  patch: (changes: Partial<Profile>) => void;
  flush: () => Promise<void>;
  saveState: SaveState;
}

/**
 * Local-state profile editor with debounced autosave to PUT /api/profile.
 * - Loads via useQuery (cached).
 * - Mutations are local-first; queued patches flush after AUTOSAVE_DELAY of inactivity.
 * - Server response replaces local state on every save (so updated_at, etc. stay fresh).
 */
export function useProfileEditor(): UseProfileEditorReturn {
  const { session } = useAuth();
  const qc = useQueryClient();
  const { data: serverData, isLoading } = useQuery({
    queryKey: ['profile', session?.user.id],
    queryFn: fetchProfile,
    enabled: !!session,
    staleTime: 60_000,
  });

  const [local, setLocal] = useState<Profile | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const pendingPatchRef = useRef<ProfileUpdate>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate local state from server when it loads / refreshes (and we have no
  // unflushed local changes yet).
  useEffect(() => {
    if (serverData && !local) setLocal(serverData);
  }, [serverData, local]);

  const doSave = async () => {
    const patchToSend = pendingPatchRef.current;
    pendingPatchRef.current = {};
    if (Object.keys(patchToSend).length === 0) return;
    setSaveState('saving');
    try {
      const updated = await updateProfile(patchToSend);
      qc.setQueryData(['profile', session?.user.id], updated);
      setLocal((prev) => (prev ? { ...prev, ...updated } : updated));
      setSaveState('saved');
    } catch (err) {
      console.error('Profile autosave failed', err);
      setSaveState('error');
    }
  };

  const patch = (changes: Partial<Profile>) => {
    setLocal((prev) => (prev ? { ...prev, ...changes } : prev));
    // Filter out fields the server doesn't accept on the update
    const allowed = (
      [
        'full_name',
        'title',
        'email',
        'phone',
        'location',
        'links',
        'summary',
        'skills',
        'experience',
        'education',
        'personal_projects',
      ] as const
    ).reduce<ProfileUpdate>((acc, key) => {
      if (key in changes) {
        // typescript: we know key is part of ProfileUpdate
        (acc as Record<string, unknown>)[key] = (changes as Record<string, unknown>)[
          key
        ];
      }
      return acc;
    }, {});
    pendingPatchRef.current = { ...pendingPatchRef.current, ...allowed };
    setSaveState('pending');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(doSave, AUTOSAVE_DELAY);
  };

  const flush = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await doSave();
  };

  // Flush on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        // best-effort flush, fire-and-forget
        void doSave();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loading: isLoading || !local,
    data: local,
    patch,
    flush,
    saveState,
  };
}
