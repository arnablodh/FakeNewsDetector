"use client";

import { useState } from "react";
import { X, Mail, Lock, User, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    // Simulate auth latency
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("scouter_user", JSON.stringify({ email, name: name || "User" }));
      onSuccess(email);
      onClose();
    }, 1000);
  };

  return (
    <div suppressHydrationWarning={true} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div suppressHydrationWarning={true} className="relative w-full max-w-md glass-card rounded-2xl border border-border overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Border Top highlight */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">

            <h3 className="text-2xl font-bold text-foreground">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin ? "Sign in to access your Scouter Dashboard" : "Unlock unlimited explainable scans and history logs"}
            </p>
            {isLogin && (<p className="text-xs text-muted-foreground mt-2">Demo account: <code>demo@scouter.com</code> / <code>demo123</code></p>)}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-center font-medium">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-input/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-input/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-input/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <a href="#" className="text-xs text-primary hover:underline font-medium">Forgot Password?</a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-750 text-white font-semibold rounded-xl py-3 text-sm shadow-lg hover:shadow-indigo-500/20 active:translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{isLogin ? "Sign In" : "Register Credentials"}</span>
              )}
            </button>
          </form>

          {/* Switch tabs */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            {isLogin ? "New to Scouter? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-primary hover:underline font-semibold"
            >
              {isLogin ? "Create an account" : "Sign In here"}
            </button>
            {isLogin && (
              <p className="mt-2 text-muted-foreground">
                Demo account: <code>demo@scouter.com</code> / <code>demo123</code>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
