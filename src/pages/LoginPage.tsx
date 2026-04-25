import React, { useState } from "react";
import { supabase } from "../supabase";
import { ShieldCheck, Loader2, HelpCircle, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

// Social Icon Components
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.96.95-2.11 1.72-3.41 1.72-1.25 0-1.63-.74-3.16-.74-1.53 0-1.99.72-3.14.72-1.3 0-2.58-.87-3.64-1.97-2.15-2.22-2.73-6.42-1.12-8.58 1.05-1.4 2.51-2.28 3.8-2.28 1.14 0 1.93.63 2.7.63.74 0 1.34-.63 2.65-.63 1.12 0 2.21.5 3.03 1.41-2.66 1.42-2.21 5.36.49 6.7.01.01.01.02.01.02-.41 1.09-1.01 2.24-1.71 3zM12.03 7.25c-.21-2.02 1.6-3.87 3.52-4.04.19 2.16-2.09 4-3.52 4.04z" />
  </svg>
);

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
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      isSignIn ? "bg-bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => setIsSignIn(false)}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                      !isSignIn ? "bg-bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary"
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

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border-subtle opacity-50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-bg-surface px-4 text-[10px] font-bold text-text-muted tracking-[0.2em]">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center py-3.5 px-4 rounded-xl border border-border-subtle hover:bg-bg-main transition-all text-sm font-bold text-text-primary">
                    <GoogleIcon />
                    Google
                  </button>
                  <button className="flex items-center justify-center py-3.5 px-4 rounded-xl border border-border-subtle hover:bg-bg-main transition-all text-sm font-bold text-text-primary">
                    <AppleIcon />
                    Apple
                  </button>
                </div>
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
