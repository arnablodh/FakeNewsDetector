import React from "react";

type ResultCardProps = {
  children: React.ReactNode;
};

export default function ResultCard({ children }: ResultCardProps) {
  return (
    <section suppressHydrationWarning={true} className="glass-card border border-border rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 hover:-translate-y-1">
      {children}
    </section>
  );
}
