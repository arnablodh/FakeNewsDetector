"use client";
import React from "react";
import { Brain, Sliders, Zap, FileCheck2 } from "lucide-react";

const FeaturesGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card 1 */}
      <div className="glass-card border border-border rounded-2xl p-6 space-y-4 hover:border-primary/30 transition-all group">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-all">
          <Brain className="w-5 h-5" />
        </div>
        <h4 className="text-base font-bold text-foreground">Token-Level SHAP Values</h4>
        <p className="text-sm text-muted-foreground/80 leading-relaxed">
          Examine the exact mathematical influence of every single token. Positive values indicate factual style; negative values show sensational bias.
        </p>
      </div>
      {/* Card 2 */}
      <div className="glass-card border border-border rounded-2xl p-6 space-y-4 hover:border-primary/30 transition-all group">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-all">
          <Sliders className="w-5 h-5" />
        </div>
        <h4 className="text-base font-bold text-foreground">Dual AI Ensembles</h4>
        <p className="text-sm text-muted-foreground/80 leading-relaxed">
          Toggle between TF-IDF + Logistic Regression for fast, highly explainable analysis, or a robust neural DistilBERT transformer check.
        </p>
      </div>
      {/* Card 3 */}
      <div className="glass-card border border-border rounded-2xl p-6 space-y-4 hover:border-primary/30 transition-all group">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-all">
          <Zap className="w-5 h-5" />
        </div>
        <h4 className="text-base font-bold text-foreground">Hybrid Caching layer</h4>
        <p className="text-sm text-muted-foreground/80 leading-relaxed">
          Integrated Redis caching saves server workloads. Repeated news scans are retrieved from the cache in less than 2 milliseconds.
        </p>
      </div>
      {/* Card 4 */}
      <div className="glass-card border border-border rounded-2xl p-6 space-y-4 hover:border-primary/30 transition-all group">
        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success group-hover:scale-105 transition-all">
          <FileCheck2 className="w-5 h-5" />
        </div>
        <h4 className="text-base font-bold text-foreground">Dual DB Integration</h4>
        <p className="text-sm text-muted-foreground/80 leading-relaxed">
          Uses standard SQLite locally for zero-friction setup, ready to upscale directly to PostgreSQL (Supabase) via unified environment triggers.
        </p>
      </div>
    </div>
  );
};
export default FeaturesGrid;
