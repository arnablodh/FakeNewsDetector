/* src/app/about/page.tsx */
"use client";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-extrabold mb-4">About Scouter</h1>
      <p className="text-lg text-muted-foreground mb-6 max-w-2xl text-center">
        Scouter is an explainable fake‑news detection platform that uses advanced NLP models to analyze articles sentence by sentence, visualizing bias and credibility with SHAP explanations.
      </p>
      <div className="flex gap-4">
        <Link href="/" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            Home
          </Link>
      </div>
    </div>
  );
}
