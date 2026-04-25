import { useState, useEffect, useCallback } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { getVersion } from '@tauri-apps/api/app';
import { relaunch } from '@tauri-apps/plugin-process';

export type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'error' | 'uptodate';

interface UpdateInfo {
  version: string;
  body?: string;
  date?: string;
}

export const useUpdater = () => {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manifest, setManifest] = useState<any>(null);

  const fetchVersion = useCallback(async () => {
    try {
      const v = await getVersion();
      setCurrentVersion(v);
    } catch (e) {
      console.error('Failed to get version:', e);
    }
  }, []);

  const checkForUpdates = useCallback(async (isManual = false) => {
    setStatus('checking');
    setError(null);
    try {
      const update = await check();
      if (update) {
        setManifest(update);
        setUpdateInfo({
          version: update.version,
          body: update.body,
          date: update.date,
        });
        setStatus('available');
        return true;
      } else {
        setStatus(isManual ? 'uptodate' : 'idle');
        return false;
      }
    } catch (e: any) {
      console.error('Update check failed:', e);
      setError(e.message || 'Failed to check for updates');
      setStatus('error');
      return false;
    }
  }, []);

  const installUpdate = useCallback(async () => {
    if (!manifest) return;
    setStatus('downloading');
    try {
      await manifest.downloadAndInstall();
      await relaunch();
    } catch (e: any) {
      console.error('Update installation failed:', e);
      setError(e.message || 'Failed to install update');
      setStatus('error');
    }
  }, [manifest]);

  useEffect(() => {
    fetchVersion();
    checkForUpdates(false);
  }, [fetchVersion, checkForUpdates]);

  return {
    status,
    currentVersion,
    updateInfo,
    error,
    checkForUpdates: () => checkForUpdates(true),
    installUpdate,
    resetStatus: () => setStatus('idle')
  };
};
