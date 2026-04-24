import React, { useState } from "react";
import { 
  ShieldCheck, 
  Key, 
  Smartphone, 
  Globe, 
  Sun, 
  Moon, 
  Archive, 
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Pencil,
  Laptop,
  LogOut
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabase";
import PasswordModal from "../components/PasswordModal";
import UpdateAction from "../components/UpdateAction";

const Settings: React.FC = () => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ text: "", type: "" });

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    setUpdateMessage({ text: "", type: "" });
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });
      if (error) throw error;
      setUpdateMessage({ text: "Profile updated successfully", type: "success" });
      setTimeout(() => setUpdateMessage({ text: "", type: "" }), 3000);
    } catch (err: any) {
      setUpdateMessage({ text: err.message || "Failed to update profile", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-10 md:space-y-12 pb-20 px-1 md:px-0">
      {/* 1. Profile Settings */}
      <section className="space-y-6">
        <div className="flex justify-between items-end px-1 md:px-0">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Profile Settings</h2>
            <p className="text-sm text-text-secondary mt-1">Manage your public identity and core account details.</p>
          </div>
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
        
        <div className="bg-bg-surface rounded-[32px] p-6 md:p-8 border border-border-subtle shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-bg-main overflow-hidden border border-border-subtle flex items-center justify-center">
              {user?.email ? (
                <div className="w-full h-full bg-brand-emerald/10 flex items-center justify-center text-brand-emerald text-3xl font-black">
                  {(displayName || user.email)[0].toUpperCase()}
                </div>
              ) : (
                <div className="w-full h-full bg-bg-main animate-pulse" />
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-brand-emerald text-white rounded-xl shadow-lg border-2 border-bg-surface hover:bg-brand-emerald-dark transition-all">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Full Name (Display Name)</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-bg-main border-none rounded-xl py-3 px-4 text-sm font-bold text-text-primary focus:ring-2 focus:ring-brand-emerald/10 outline-none placeholder:text-text-muted"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ""}
                  readOnly
                  className="w-full bg-bg-main border-none rounded-xl py-3 px-4 text-sm font-bold text-text-primary focus:ring-2 focus:ring-brand-emerald/10 outline-none cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="min-h-[20px]">
                {updateMessage.text && (
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${updateMessage.type === 'success' ? 'text-brand-emerald' : 'text-red-500'}`}>
                    {updateMessage.text}
                  </p>
                )}
              </div>
              <button
                onClick={handleUpdateProfile}
                disabled={isUpdating || displayName === (user?.user_metadata?.display_name || "")}
                className="px-8 py-3 bg-brand-emerald text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 hover:bg-brand-emerald-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-emerald"
              >
                {isUpdating ? "Optimizing..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Security */}
      <section className="space-y-6">
        <div className="px-1 md:px-0">
          <h2 className="text-2xl font-bold text-text-primary">Security</h2>
          <p className="text-sm text-text-secondary mt-1">Control access and protect your financial integrity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Password Management */}
          <div className="bg-bg-surface rounded-[32px] p-6 md:p-8 border border-border-subtle shadow-sm space-y-6">
            <div className="w-10 h-10 rounded-xl bg-brand-emerald/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-brand-emerald" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Password Management</h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Regularly updating your password ensures your ledger remains inaccessible to unauthorized entities.
              </p>
            </div>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center gap-2 text-xs font-bold text-brand-emerald group"
            >
              Update Password
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* 2FA (Coming Soon) */}
          <div className="bg-bg-surface rounded-[32px] p-6 md:p-8 border border-border-subtle shadow-sm space-y-6 opacity-70">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-bg-main flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-text-muted" />
              </div>
              <span className="px-3 py-1 rounded-lg bg-bg-main text-text-muted text-[8px] font-black uppercase tracking-[0.2em]">Future Protocol</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Two-Factor Authentication</h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Add an extra layer of protection. This advanced security protocol will be available in a future architectural update.
              </p>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-bg-surface rounded-[24px] md:rounded-[32px] border border-border-subtle shadow-sm overflow-hidden">
          <div className="px-6 md:px-8 py-4 border-b border-border-subtle bg-bg-main/10">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Active Sessions</h4>
          </div>
          <div className="divide-y divide-border-subtle">
            <div className="px-6 md:px-8 py-6 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <Laptop className="w-5 h-5 text-text-secondary" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">Primary Device — Current Session</p>
                  <p className="text-[10px] text-text-muted mt-1 font-medium">Last active: Just now • Dynamic Link Active</p>
                </div>
              </div>
              <span className="shrink-0 px-3 py-1 rounded-lg bg-brand-emerald/10 text-brand-emerald text-[9px] font-bold uppercase tracking-wider">Current</span>
            </div>
            <div className="px-6 md:px-8 py-6 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <Smartphone className="w-5 h-5 text-text-secondary" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">Mobile Interface — Authenticated</p>
                  <p className="text-[10px] text-text-muted mt-1 font-medium">Ready for real-time synchronization</p>
                </div>
              </div>
              <button className="shrink-0 text-[9px] font-bold text-red-500 uppercase tracking-wider md:opacity-0 group-hover:opacity-100 transition-opacity">Terminate</button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Preferences */}
      <section className="space-y-6">
        <div className="px-1 md:px-0">
          <h2 className="text-2xl font-bold text-text-primary">Preferences</h2>
          <p className="text-sm text-text-secondary mt-1">Customize the interface to suit your editorial flow.</p>
        </div>

        <div className="bg-bg-surface rounded-[32px] p-6 md:p-8 border border-border-subtle shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Primary Currency</label>
              <div className="relative">
                <select className="w-full bg-bg-main border-none rounded-xl py-3.5 pl-4 pr-4 text-sm font-bold text-text-primary appearance-none focus:ring-2 focus:ring-brand-emerald/10 outline-none">
                  <option className="bg-bg-surface">THB — ฿ Baht</option>
                  <option className="bg-bg-surface">USD — $ Dollars</option>
                  <option className="bg-bg-surface">EUR — € Euros</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted rotate-90" />
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] ml-1">System Language</label>
              <div className="relative">
                <select className="w-full bg-bg-main border-none rounded-xl py-3.5 pl-4 pr-4 text-sm font-bold text-text-primary appearance-none focus:ring-2 focus:ring-brand-emerald/10 outline-none">
                  <option className="bg-bg-surface">English (US)</option>
                  <option className="bg-bg-surface">Deutsch (DE)</option>
                  <option className="bg-bg-surface">Thai (TH)</option>
                </select>
                <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              </div>
            </div>

            <div className="space-y-4 md:col-span-2 lg:col-span-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Visual Theme</label>
              <div className="flex bg-bg-main p-1 rounded-xl">
                <button 
                  onClick={() => theme !== "light" && toggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    theme === "light" ? "bg-bg-surface text-text-primary shadow-sm" : "text-text-muted"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Light
                </button>
                <button 
                  onClick={() => theme !== "dark" && toggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    theme === "dark" ? "bg-bg-surface text-text-primary shadow-sm" : "text-text-muted"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Software Infrastructure */}
      <section className="space-y-6">
        <div className="px-1 md:px-0">
          <h2 className="text-2xl font-bold text-text-primary">Software Infrastructure</h2>
          <p className="text-sm text-text-secondary mt-1">Manage system updates and architectural versioning.</p>
        </div>
        <UpdateAction />
      </section>

      {/* 5. Data Management */}
      <section className="space-y-6">
        <div className="px-1 md:px-0">
          <h2 className="text-2xl font-bold text-text-primary">Data Management</h2>
          <p className="text-sm text-text-secondary mt-1">Export, archive, or permanently remove your financial history.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-bg-surface rounded-[32px] p-6 md:p-8 border border-border-subtle shadow-sm space-y-8 flex flex-col justify-between transition-colors">
            <div>
              <h3 className="text-lg font-bold text-text-primary">Export Data Ledger</h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Download a comprehensive record of all transactions, categories, and wallet balances in your choice of format.
              </p>
            </div>
            <div className="flex gap-4">
              {['.CSV', '.JSON', '.PDF'].map(fmt => (
                <button key={fmt} className="flex-1 py-3 bg-bg-main rounded-xl text-[10px] font-extrabold text-text-primary hover:bg-bg-main/80 transition-all">
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-bg-surface rounded-[32px] p-6 md:p-8 border border-border-subtle shadow-sm space-y-8 flex flex-col justify-between transition-colors">
            <div>
              <h3 className="text-lg font-bold text-text-primary">Archive Financial Year</h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Move completed fiscal years into long-term storage to keep your main dashboard clean and focused on current goals.
              </p>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-extrabold text-brand-emerald uppercase tracking-wider">
              <div className="p-1.5 bg-brand-emerald rounded text-white"><Archive className="w-3 h-3" /></div>
              Open Archive Manager
            </button>
          </div>
        </div>

        {/* Destructive Action */}
        <div className="bg-red-500/5 dark:bg-red-500/10 rounded-[32px] p-6 md:p-8 border border-red-500/10 flex flex-col xl:flex-row items-center xl:items-start justify-between gap-8 transition-colors">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-500">Destructive Actions</h3>
              <p className="text-xs text-red-500/60 mt-1 leading-relaxed max-w-lg">
                Deleting your account is irreversible. All transaction history, ledger entries, and architectural reports will be permanently purged from our servers.
              </p>
            </div>
          </div>
          <button className="w-full xl:w-auto px-8 py-4 bg-red-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-red-500/10 hover:bg-red-600 transition-all flex items-center justify-center gap-2">
            Delete Account
          </button>
        </div>
      </section>
      <PasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default Settings;
