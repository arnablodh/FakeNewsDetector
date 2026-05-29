"use client";
import React, { useState, useEffect } from "react";
import NextImage from "next/image";
import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import Footer from "@/components/Footer";
import AuthModal from "@/components/auth-modal";
import { Globe } from "lucide-react";


export default function LandingPage() {
  const [isDark, setIsDark] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  // Check login state
  useEffect(() => {
    const savedUser = localStorage.getItem("scouter_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const toggleTheme = () => {
    const body = document.documentElement;
    if (isDark) {
      body.classList.remove("dark");
      body.classList.add("light-theme");
      setIsDark(false);
    } else {
      body.classList.remove("light-theme");
      body.classList.add("dark");
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("scouter_user");
    setUser(null);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Stunning 3D space mesh gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-background/60 to-background z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_50%)] z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.2),transparent_50%)] z-10" />
        <NextImage
          src="/landing_bg.png"
          alt="Scouter landing background"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
          unoptimized
        />
      </div>

      {/* Header Navigation */}
      <NavBar
        isDark={isDark}
        toggleTheme={toggleTheme}
        user={user}
        setIsAuthOpen={setIsAuthOpen}
        handleLogout={handleLogout}
      />

      {/* Hero Section */}
      <HeroSection 
        isDark={isDark} 
        user={user}
        setIsAuthOpen={setIsAuthOpen}
      />

      {/* Features Section */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-border/40 relative z-10">
        <FeaturesGrid />
      </section>

      {/* Chrome Extension Showcase */}
      <section id="extension" className="py-20 px-6 max-w-7xl mx-auto border-t border-border/40 relative z-10 bg-muted/15 rounded-3xl mb-16">
        {/* Existing extension markup retained */}
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
                <button className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-2.5 text-xs rounded-xl shadow-md transition-all">Deep SHAP Highlights</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Layer */}
      <section id="stack" className="py-20 px-6 max-w-7xl mx-auto border-t border-border/40 relative z-10 text-center">
        <div className="space-y-3 mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Technical Stack Architecture</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">A resume-perfect pipeline engineered for optimal inference latency and clear interpretability.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card border border-border rounded-2xl p-6 text-left space-y-3">
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest">🎨 Frontend Architecture</h4>
            <ul className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <li>• <strong>Next.js (React)</strong> - Single Page Application utilizing App Router and client transitions.</li>
              <li>• <strong>Tailwind CSS</strong> - Custom styles matching premium SaaS aesthetic.</li>
              <li>• <strong>Recharts</strong> - Dynamic, responsive SVG graphing of historic scan distributions.</li>
              <li>• <strong>Lucide Icons</strong> - Modern vector iconography.</li>
            </ul>
          </div>
          <div className="glass-card border border-border rounded-2xl p-6 text-left space-y-3">
            <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest">⚙️ Explainable AI Backend</h4>
            <ul className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <li>• <strong>FastAPI</strong> - High-performance Python gateway supporting asynchronous execution.</li>
              <li>• <strong>Scikit-Learn Pipeline</strong> - Balanced TF-IDF fit with Logistic Regression coefficient tuning.</li>
              <li>• <strong>Closed-Form SHAP Explainer</strong> - Custom optimized linear shap calculations in micro‑seconds.</li>
              <li>• <strong>Transformers (DistilBERT)</strong> - Sequence classification checks for deep contextual sentiment.</li>
            </ul>
          </div>
          <div className="glass-card border border-border rounded-2xl p-6 text-left space-y-3">
            <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">🗄️ Caching &amp; Database</h4>
            <ul className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <li>• <strong>Redis Caching</strong> - MD5 hash-key lookup reducing database query costs.</li>
              <li>• <strong>PostgreSQL (Supabase)</strong> - Scalable cloud relational schema with connection pools.</li>
              <li>• <strong>Local SQLite Adapter</strong> - Seamless local mock backup creating schemas on startup.</li>
              <li>• <strong>Dual Adapter Pattern</strong> - Auto‑configured environments checking variables.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={(email) => setUser({ email, name: email.split('@')[0] })} />
    </div>
  );
}
