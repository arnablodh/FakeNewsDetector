"use client";

import { useState } from "react";
import { WordAttribution } from "@/lib/mock-ai";
import { Info, HelpCircle } from "lucide-react";

interface ShapViewerProps {
  attributions: WordAttribution[];
}

export default function ShapViewer({ attributions }: ShapViewerProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPos({
      x: e.clientX,
      y: e.clientY - 75 // Position above cursor
    });
  };

  return (
    <div className="relative space-y-6">
      
      {/* Legend Block */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 border border-border/60 rounded-xl text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          <span>Hover highlighted words to inspect the AI model's mathematical decision weights.</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-success/20 border-b-2 border-success" />
            <span>Factual / Credible (Positive weight)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-destructive/20 border-b-2 border-destructive" />
            <span>Sensational / Biased (Negative weight)</span>
          </div>
        </div>
      </div>

      {/* Reader Panel */}
      <div className="relative min-h-[250px] p-6 md:p-8 bg-card border border-border rounded-2xl shadow-inner font-sans leading-relaxed text-base md:text-lg select-text overflow-y-auto max-h-[500px]">
        {attributions.map((item, idx) => {
          // Preserve spaces and linebreaks
          if (/^\s+$/.test(item.word)) {
            // Check if it has newlines
            if (item.word.includes('\n')) {
              return <br key={idx} />;
            }
            return <span key={idx}>{item.word}</span>;
          }

          const isCredible = item.weight > 0;
          const isSuspicious = item.weight < 0;
          
          if (!isCredible && !isSuspicious) {
            return <span key={idx} className="text-foreground/90">{item.word}</span>;
          }

          // Compute custom color opacity based on weight magnitude
          const weightMagnitude = Math.abs(item.weight);
          const opacity = Math.min(0.65, Math.max(0.12, weightMagnitude * 0.7));
          
          const highlightStyle = {
            backgroundColor: isCredible 
              ? `rgba(16, 185, 129, ${opacity})` 
              : `rgba(239, 68, 68, ${opacity})`,
            borderBottom: isCredible 
              ? `2.5px solid rgba(16, 185, 129, 0.8)` 
              : `2.5px solid rgba(239, 68, 68, 0.8)`,
          };

          return (
            <span
              key={idx}
              style={highlightStyle}
              className={`inline-block px-[2px] py-[1px] mx-[0.5px] rounded-[3px] font-medium cursor-help transition-all duration-150`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onMouseMove={handleMouseMove}
            >
              {item.word}
            </span>
          );
        })}
      </div>

      {/* Floating Tooltip Portal (only rendered during hover) */}
      {hoveredIndex !== null && attributions[hoveredIndex] && (
        <div
          style={{
            position: "fixed",
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: "translateX(-50%)",
          }}
          className="z-50 w-64 glass-card border border-border rounded-xl p-3 shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-start gap-2.5">
            <div className={`mt-0.5 p-1 rounded-lg ${attributions[hoveredIndex].weight > 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              <Info className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-foreground uppercase tracking-wider">Word Attribution</span>
                <span className={`text-xs font-bold ${attributions[hoveredIndex].weight > 0 ? 'text-success' : 'text-destructive'}`}>
                  {attributions[hoveredIndex].weight > 0 ? '+' : ''}
                  {attributions[hoveredIndex].weight.toFixed(3)}
                </span>
              </div>
              <p className="text-[11px] font-medium text-foreground italic">
                "{attributions[hoveredIndex].word.replace(/[^\w]/g, "")}"
              </p>
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                {attributions[hoveredIndex].explanation || "Influenced local model boundary alignment."}
              </p>
              {/* Attribution weight slider bar */}
              <div className="w-full h-1 bg-border rounded-full overflow-hidden mt-1.5">
                <div 
                  style={{ 
                    width: `${Math.min(100, Math.abs(attributions[hoveredIndex].weight) * 100)}%`,
                    marginLeft: attributions[hoveredIndex].weight > 0 ? '0' : 'auto' 
                  }}
                  className={`h-full rounded-full ${attributions[hoveredIndex].weight > 0 ? 'bg-success' : 'bg-destructive'}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
