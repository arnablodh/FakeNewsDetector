"use client";
import React from "react";
import Link from "next/link";
import AuthModal from "@/components/auth-modal";
import { ShieldCheck, Globe, LayoutDashboard, LogOut, X } from "lucide-react";

export default function ExtensionPage() {
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const [user, setUser] = React.useState<{ email: string; name: string } | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem("scouter_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("scouter_user");
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/scouter_logo.png" alt="Scouter logo" className="w-9 h-9 rounded-xl object-cover" />
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-foreground to-muted-foreground/75 bg-clip-text text-transparent group-hover:text-foreground transition-all">
              Scouter
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <Link href="/features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="/extension" className="hover:text-foreground transition-colors">Chrome Extension</Link>
            <Link href="/architecture" className="hover:text-foreground transition-colors">Architecture</Link>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-foreground">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground">{user.email}</p>
                </div>
                <Link href="/dashboard" className="bg-muted/50 border border-border hover:bg-muted text-foreground text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="p-2 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive transition-all cursor-pointer" title="Sign Out">
                  Sign Out
                </button>
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg cursor-pointer transition-all">
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Extension Showcase */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-border/40 relative z-10 bg-muted/15 rounded-3xl mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/5 border border-cyan-500/15 rounded-full text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              <span>Scrape &amp; Scan Instantly</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
              Get the Chrome Extension
            </h2>
            <p className="text-sm text-muted-foreground/90 leading-relaxed">
              Integrate Scouter directly into your web browser. When reading an article, open the extension in your toolbar to scrape the body text, calculate a quick credibility score, and link directly to deep SHAP charts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a href="/scouter-extension.zip" download="scouter-extension.zip" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-95 text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-cyan-500/10 cursor-pointer transition-all">
                <Globe className="w-4 h-4" />
                <span>Download Chrome Extension</span>
              </a>
              <a href="https://github.com" target="_blank" className="inline-flex items-center justify-center gap-2 bg-muted/40 border border-border/80 hover:bg-muted/80 text-foreground text-xs font-bold px-6 py-3.5 rounded-xl transition-all">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                <span>Inspect Extension Source</span>
              </a>
            </div>
          </div>

          {/* Mock Chrome window */}
          <div className="relative flex justify-center">
            <div className="w-full max-w-sm glass-card border border-border rounded-2xl p-5 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
                  <span className="w-2.5 h-2.5 rounded-full bg-warning" />
                  <span className="w-2.5 h-2.5 rounded-full bg-success" />
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Active Tab Extension</span>
              </div>
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-foreground">Scouter</span>
                  <span className="text-[9px] bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded">V1.0</span>
                </div>
                <div className="p-4 bg-muted/30 border border-border/40 rounded-xl space-y-3 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-success flex items-center justify-center bg-success/5">
                    <span className="text-xl font-bold text-success">86%</span>
                  </div>
                  <span className="text-xs font-bold text-success uppercase tracking-wider block">Highly Credible</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-left text-[10px]">
                  <div className="bg-muted/20 border border-border/40 p-2 rounded-lg">
                    <span className="text-muted-foreground block">Bias Level</span>
                    <span className="font-bold text-foreground">14% Bias</span>
                  </div>
                  <div className="bg-muted/20 border border-border/40 p-2 rounded-lg">
                    <span className="text-muted-foreground block">Diagnostics</span>
                    <span className="font-bold text-foreground">TF-IDF Model</span>
                  </div>
                </div>
                <button className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-2.5 text-xs rounded-xl shadow-md transition-all">
                  Deep SHAP Highlights
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={(email) => setUser({ email, name: email.split("@")[0] })} />
    </div>
  );
}
