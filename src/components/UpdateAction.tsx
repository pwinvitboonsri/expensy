import React from 'react';
import { RefreshCcw, CheckCircle2, AlertCircle, Loader2, Download, History } from 'lucide-react';
import { useUpdater } from '../hooks/useUpdater';

const UpdateAction: React.FC = () => {
  const { status, currentVersion, updateInfo, error, checkForUpdates, installUpdate } = useUpdater();

  return (
    <div className="bg-bg-surface rounded-[32px] p-6 md:p-8 border border-border-subtle shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-bg-main flex items-center justify-center border border-border-subtle">
            <History className="w-6 h-6 text-text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary tracking-tight">Software Versioning</h3>
            <p className="text-xs text-text-secondary mt-1">Current Protocol: <span className="text-brand-emerald font-black">v{currentVersion || '0.0.0'}</span></p>
          </div>
        </div>

        <button
          onClick={status === 'available' ? installUpdate : checkForUpdates}
          disabled={status === 'checking' || status === 'downloading'}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            status === 'available' 
              ? "bg-brand-emerald text-white shadow-xl shadow-emerald-500/20 hover:bg-brand-emerald-dark"
              : "bg-bg-main text-text-primary hover:bg-bg-main/80 border border-border-subtle"
          } disabled:opacity-50`}
        >
          {status === 'checking' ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Scanning Registry
            </>
          ) : status === 'downloading' ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Downloading
            </>
          ) : status === 'available' ? (
            <>
              <Download className="w-3.5 h-3.5" />
              Upgrade to v{updateInfo?.version}
            </>
          ) : (
            <>
              <RefreshCcw className="w-3.5 h-3.5" />
              Check for Updates
            </>
          )}
        </button>
      </div>

      {/* Dynamic Status Feedback */}
      <div className="pt-2">
        {status === 'uptodate' && (
          <div className="flex items-center gap-2 text-brand-emerald bg-brand-emerald/5 p-4 rounded-2xl border border-brand-emerald/10 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-4 h-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Architectural Integrity Confirmed — You are on the latest version.</p>
          </div>
        )}

        {status === 'available' && (
          <div className="bg-bg-main/50 p-4 rounded-2xl border border-border-subtle space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 text-text-primary">
              <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Expansion Available: v{updateInfo?.version}</p>
            </div>
            {updateInfo?.body && (
              <p className="text-[10px] text-text-secondary leading-relaxed font-medium italic">
                "{updateInfo.body.slice(0, 100)}{updateInfo.body.length > 100 ? '...' : ''}"
              </p>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-500 bg-red-500/5 p-4 rounded-2xl border border-red-500/10 animate-in shake duration-500">
            <AlertCircle className="w-4 h-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Registry Ping Failed: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateAction;
