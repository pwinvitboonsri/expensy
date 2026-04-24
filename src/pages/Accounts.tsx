import React from "react";
import { Landmark, Plus, ArrowRight } from "lucide-react";

const Accounts: React.FC = () => {
  return (
    <div className="max-w-[1400px] mx-auto space-y-10">
      <div className="flex justify-between items-center">
        <header>
          <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">Institutional Assets</h1>
          <p className="text-text-secondary mt-2 text-lg">Manage your linked banking institutions and digital ledgers</p>
        </header>
        <button className="flex items-center gap-2 px-6 py-3 bg-brand-emerald hover:bg-brand-emerald-dark text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/10 transition-all">
          <Plus className="w-4 h-4" />
          Link Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mock Account Card */}
        <div className="bg-bg-surface rounded-[32px] border border-border-subtle p-8 shadow-sm group hover:border-brand-emerald transition-all">
          <div className="flex justify-between items-start mb-8">
            <div className="w-14 h-14 bg-bg-main rounded-2xl flex items-center justify-center">
              <Landmark className="w-6 h-6 text-brand-emerald" />
            </div>
            <span className="px-3 py-1 bg-brand-emerald/10 text-brand-emerald text-[9px] font-bold uppercase tracking-wider rounded-lg">Active</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-1">Chase Platinum</h3>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-6">Checking •••• 8821</p>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">Balance</p>
                <p className="text-2xl font-extrabold text-text-primary">฿24,902.12</p>
              </div>
              <button className="p-3 bg-bg-main rounded-xl group-hover:bg-brand-emerald group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
