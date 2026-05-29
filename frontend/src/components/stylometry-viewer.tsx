"use client";

import React from "react";
import { Stylometrics } from "@/lib/mock-ai";
import { 
  BookOpen, 
  Flame, 
  Sparkles, 
  Activity, 
  Info,
  HelpCircle
} from "lucide-react";

interface StylometryViewerProps {
  stylometrics?: Stylometrics;
}

export default function StylometryViewer({ stylometrics }: StylometryViewerProps) {
  if (!stylometrics) return null;

  return (
    <div className="glass-card border border-border rounded-3xl p-6 md:p-8 shadow-lg space-y-6">
      
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border/40 pb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Linguistic Stylometry &amp; Readability
          </h3>
          <p className="text-xs text-muted-foreground">
            Analyze the stylistic DNA, readability levels, and lexical complexity to examine write style.
          </p>
        </div>
      </div>

      {/* Grid of Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Flesch Readability Grade */}
        <div className="p-5 bg-muted/20 border border-border/40 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">Readability Grade</span>
                <span className="font-extrabold text-foreground text-sm leading-tight block">
                  {stylometrics.readability_grade}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-foreground block">
                {stylometrics.readability_score}
              </span>
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest block">Ease Index</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
              <div 
                style={{ width: `${stylometrics.readability_score}%` }} 
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
              />
            </div>
            <p className="text-[10px] text-muted-foreground/80 leading-relaxed pt-1.5 flex items-start gap-1">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>Calculated via Flesch Reading Ease. Higher index values point to clear, accessible standard sentences.</span>
            </p>
          </div>
        </div>

        {/* 2. Sensationalism Index */}
        <div className="p-5 bg-muted/20 border border-border/40 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                <Flame className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">Sensationalism Index</span>
                <span className="font-extrabold text-foreground text-sm leading-tight block">
                  {stylometrics.sensationalism_score >= 60 
                    ? "Highly Sensational ⚠️" 
                    : stylometrics.sensationalism_score >= 30 
                      ? "Moderate / Expressive" 
                      : "Low / Objective Standard"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-foreground block">
                {stylometrics.sensationalism_score}%
              </span>
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest block">Intensity</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
              <div 
                style={{ width: `${stylometrics.sensationalism_score}%` }} 
                className={`h-full rounded-full ${
                  stylometrics.sensationalism_score >= 60 
                    ? 'bg-destructive' 
                    : stylometrics.sensationalism_score >= 30 
                      ? 'bg-warning' 
                      : 'bg-success'
                }`}
              />
            </div>
            <p className="text-[10px] text-muted-foreground/80 leading-relaxed pt-1.5 flex items-start gap-1">
              <Info className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
              <span>Gauges emotional tone based on exclamation frequencies, intense trigger vocabulary, and capitalizations.</span>
            </p>
          </div>
        </div>

        {/* 3. Lexical Diversity (TTR) */}
        <div className="p-5 bg-muted/20 border border-border/40 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">Lexical Diversity</span>
                <span className="font-extrabold text-foreground text-sm leading-tight block">
                  {stylometrics.lexical_diversity >= 65 
                    ? "Rich Vocabulary" 
                    : stylometrics.lexical_diversity >= 45 
                      ? "Standard Variety" 
                      : "Repetitive / Simple Copy"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-foreground block">
                {stylometrics.lexical_diversity}%
              </span>
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest block">Type-Token Ratio</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
              <div 
                style={{ width: `${stylometrics.lexical_diversity}%` }} 
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
              />
            </div>
            <p className="text-[10px] text-muted-foreground/80 leading-relaxed pt-1.5 flex items-start gap-1">
              <Info className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
              <span>Percentage of unique vocabularies. High factual journals avoid word repetition, while spam articles repeat keyword keywords.</span>
            </p>
          </div>
        </div>

        {/* 4. Passive Voice Density */}
        <div className="p-5 bg-muted/20 border border-border/40 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <HelpCircle className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">Passive Voice Density</span>
                <span className="font-extrabold text-foreground text-sm leading-tight block">
                  {stylometrics.passive_voice_density >= 40 
                    ? "Heavy Obscurity" 
                    : stylometrics.passive_voice_density >= 15 
                      ? "Moderate Assertions" 
                      : "Active & Direct Narrative"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-foreground block">
                {stylometrics.passive_voice_density}%
              </span>
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest block">Sentence Ratio</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
              <div 
                style={{ width: `${stylometrics.passive_voice_density}%` }} 
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
              />
            </div>
            <p className="text-[10px] text-muted-foreground/80 leading-relaxed pt-1.5 flex items-start gap-1">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>Finds assertions (e.g. "was claimed"). High passive use points to non-attributed claims often found in subjective rumors.</span>
            </p>
          </div>
        </div>

      </div>
      
    </div>
  );
}
