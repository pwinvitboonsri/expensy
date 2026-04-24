import React, { useState } from "react";
import { X, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { supabase } from "../supabase";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: "Passwords do not match", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: "Password must be at least 6 characters", type: "error" });
      return;
    }

    setIsUpdating(true);
    setMessage({ text: "", type: "" });

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      
      setMessage({ text: "Password updated successfully", type: "success" });
      setTimeout(() => {
        onClose();
        setNewPassword("");
        setConfirmPassword("");
        setMessage({ text: "", type: "" });
      }, 2000);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update password", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-bg-main/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-bg-surface border border-border-subtle rounded-[32px] shadow-2xl shadow-black/20 overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
        <div className="p-6 md:p-8 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-text-primary tracking-tight">Security Protocol</h3>
              <p className="text-xs text-text-secondary">Update your architectural access credentials</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-bg-main rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-emerald transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full bg-bg-main border-none rounded-2xl py-3.5 pl-12 pr-12 text-sm font-bold text-text-primary focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all placeholder:text-text-muted"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] ml-1">Confirm Protocol</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-emerald transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-bg-main border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-text-primary focus:ring-2 focus:ring-brand-emerald/10 outline-none transition-all placeholder:text-text-muted"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {message.text && (
              <div className={`p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center ${
                message.type === 'success' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-red-500/10 text-red-500'
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-4 bg-brand-emerald text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 hover:bg-brand-emerald-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? "Synchronizing..." : "Update Security Protocol"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
