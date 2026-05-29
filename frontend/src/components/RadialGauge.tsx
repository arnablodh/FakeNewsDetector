import React from "react";

type RadialGaugeProps = {
  score: number; // 0‑100
  size?: number; // diameter in pixels
};

export default function RadialGauge({ score, size = 120 }: RadialGaugeProps) {
  const radius = size / 2 - 8; // 8px padding for stroke width
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return "#10b981"; // success green
    if (score >= 50) return "#f59e0b"; // warning orange
    return "#ef4444"; // destructive red
  };

  return (
    <svg width={size} height={size} className="radial-gauge">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth="8"
        className="opacity-30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={getColor()}
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="text-sm font-bold fill-foreground"
      >
        {score}%
      </text>
    </svg>
  );
}
