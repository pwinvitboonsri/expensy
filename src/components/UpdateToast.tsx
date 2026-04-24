import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Loader2 } from 'lucide-react';
import { useUpdater } from '../hooks/useUpdater';

const UpdateToast: React.FC = () => {
  const { status, updateInfo, installUpdate, resetStatus } = useUpdater();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (status === 'available' && !isDismissed) {
      setIsVisible(true);
    } else if (status !== 'available' && status !== 'downloading') {
      setIsVisible(false);
    }
  }, [status, isDismissed]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-10 fade-in duration-500">
      <div className="w-[320px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
        {/* Progress Bar for Downloading state */}
        {status === 'downloading' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
            <div className="h-full bg-emerald-500 animate-pulse w-full" />
          </div>
        )}

        <div className="p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Update Available</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Version {updateInfo?.version} is ready.</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setIsVisible(false);
                setIsDismissed(true);
              }}
              className="p-1 hover:bg-white/5 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={installUpdate}
              disabled={status === 'downloading'}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
            >
              {status === 'downloading' ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Installing
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" />
                  Install Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateToast;
