import React, { useState } from "react";
import { supabase } from "../supabase";
import { ShieldCheck, Loader2, HelpCircle, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Mail, ArrowLeft, ExternalLink } from "lucide-react";

const LoginPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isSignIn, setIsSignIn] = useState(true);
  const [isVerifyMode, setIsVerifyMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = isSignIn
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // If we have a session, navigate immediately
      if (data?.session) {
        navigate("/dashboard");
      } else if (data?.user && !isSignIn) {
        // Success but no session means email verification is required
        setIsVerifyMode(true);
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleOpenEmail = async () => {
    const domain = email.split('@')[1]?.toLowerCase();
    let url = "";

    if (domain?.includes('gmail')) url = 'https://mail.google.com';
    else if (domain?.includes('outlook') || domain?.includes('hotmail') || domain?.includes('live')) url = 'https://outlook.live.com';
    else if (domain?.includes('yahoo')) url = 'https://mail.yahoo.com';
    else if (domain?.includes('icloud')) url = 'https://www.icloud.com/mail';
    else url = `https://${domain || 'gmail.com'}`; // Generic fallback

    try {
      await openUrl(url);
    } catch (err) {
      console.error("Failed to open email:", err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-bg-main flex flex-col font-sans text-text-primary transition-colors duration-300">
      {/* Page Header */}
      <header className="px-8 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-brand-emerald">Expensy</div>
        <div className="flex items-center gap-6">
          <button
            onClick={toggleTheme}
            className="p-2 text-text-secondary hover:text-text-primary transition-all rounded-lg bg-bg-surface border border-border-subtle"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <div className="flex items-center text-sm text-text-secondary hover:text-brand-emerald cursor-pointer transition-colors">
            <HelpCircle className="w-4 h-4 mr-1.5" />
            Help
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center -mt-12 px-4">
        {/* Auth Card */}
        <div className="w-full max-w-[420px] bg-bg-surface rounded-3xl shadow-xl shadow-black/5 border border-border-subtle overflow-hidden mb-8 transition-colors">
          {isVerifyMode ? (
            <div className="px-8 py-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-brand-emerald/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                <Mail className="w-10 h-10 text-brand-emerald" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-brand-emerald text-white rounded-full flex items-center justify-center border-4 border-bg-surface">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                </div>
              </div>

              <h1 className="text-2xl font-extrabold mb-4 tracking-tight">Check your inbox</h1>
              <p className="text-text-secondary text-sm mb-10 leading-relaxed">
                We've sent a verification link to <span className="text-text-primary font-bold">{email}</span>.
                Please activate your ledger to proceed.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleOpenEmail}
                  className="w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Webmail
                </button>

                <button
                  onClick={() => {
                    setIsVerifyMode(false);
                    setIsSignIn(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-text-muted hover:text-text-primary py-2 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="p-4">
                <div className="bg-bg-main p-1 rounded-xl flex">
                  <button
                    onClick={() => setIsSignIn(true)}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isSignIn ? "bg-bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary"
                      }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setIsSignIn(false)}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isSignIn ? "bg-bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary"
                      }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              <div className="px-8 pb-12 pt-4">
                <h1 className="text-2xl font-extrabold mb-2 tracking-tight">
                  {isSignIn ? "Welcome back" : "Get started"}
                </h1>
                <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                  {isSignIn
                    ? "Enter your credentials to access your ledger."
                    : "Create a new ledger to track your financial precision."
                  }
                </p>

                <form onSubmit={handleAuth} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-bg-main border border-transparent rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand-emerald/10 focus:border-brand-emerald outline-none transition-all placeholder:text-text-muted text-text-primary"
                      placeholder="name@company.com"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2 ml-1">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        Password
                      </label>
                      {isSignIn && (
                        <a href="#" className="text-[10px] font-bold text-brand-emerald hover:underline uppercase tracking-wider">
                          Forgot?
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-bg-main border border-transparent rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand-emerald/10 focus:border-brand-emerald outline-none transition-all placeholder:text-text-muted text-text-primary pr-12"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 text-red-500 p-3.5 rounded-xl text-xs font-bold border border-red-500/10">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignIn ? "Sign In" : "Create Account")}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Security Info */}
        <div className="w-full max-w-[420px] bg-bg-surface border border-border-subtle p-6 rounded-3xl flex items-start gap-4 transition-colors">
          <div className="bg-brand-emerald/10 p-2.5 rounded-2xl mt-0.5">
            <ShieldCheck className="w-5 h-5 text-brand-emerald" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-text-primary mb-1">Architectural Security</h3>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Your financial data is encrypted with enterprise-grade AES-256 protocols and stored in geographically isolated vaults.
            </p>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="px-8 py-10 flex flex-col md:flex-row justify-between items-center bg-bg-main border-t border-border-subtle/30 transition-colors">
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 md:mb-0">
          © 2024 Expensy Financial Architectural Ledger. All rights reserved.
        </div>
        <div className="flex gap-8">
          {["Privacy Policy", "Terms of Service", "Security"].map((link) => (
            <a key={link} href="#" className="text-[10px] font-bold text-text-muted uppercase tracking-widest hover:text-brand-emerald transition-colors">
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
