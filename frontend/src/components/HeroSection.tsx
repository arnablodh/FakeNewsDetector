import React from "react";
import NextImage from "next/image";
import { ShieldCheck } from "lucide-react";
import dynamic from "next/dynamic";

const Scanner = dynamic(() => import("@/components/scanner"), { ssr: false });

interface HeroSectionProps {
  isDark: boolean;
  user: { email: string; name: string } | null;
  setIsAuthOpen: (open: boolean) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ isDark, user, setIsAuthOpen }) => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 md:pt-32 pb-24 px-6 max-w-screen-2xl mx-auto text-center space-y-12 z-10">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Stunning 3D space mesh gradient overlays matching page.tsx */}
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

      {/* Trust Badge */}
      <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-indigo-500/5 border border-indigo-500/15 rounded-full text-indigo-400 text-sm font-semibold tracking-wider uppercase animate-bounce duration-1000">
        <ShieldCheck className="w-5 h-5" />
        <span>Industry-Leading Explainable News NLP</span>
      </div>

      {/* Headlines */}
      <div className="space-y-4 max-w-3xl mx-auto z-20 relative">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] gradient-text animate-in fade-in slide-in-from-top-4 duration-300">
          Verify News Credibility Sentence by Sentence
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground/80 font-medium max-w-2xl mx-auto leading-relaxed">
          Scouter — Explainable Fake News &amp; Bias Detector. Real‑time credibility scoring, stylometric bias graphs, and word‑level SHAP highlights.
        </p>
      </div>

      {/* Conditional content based on login status */}
      <div className="w-full max-w-5xl mx-auto z-20">
        {user ? (
          <Scanner />
        ) : (
          <div className="flex flex-col items-center space-y-8 max-w-2xl mx-auto p-12 glass-card border border-border rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-500">
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground/95 leading-relaxed font-semibold">
              Unlock our state-of-the-art closed-form SHAP attributions, real-time credibility index, and comprehensive stylometric analyzers by logging into your account.
            </p>
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white text-sm font-bold px-12 py-5 rounded-xl shadow-xl shadow-indigo-500/25 transition-all cursor-pointer uppercase tracking-wider min-w-[320px]"
            >
              Sign In / Register to Start Scanning
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
