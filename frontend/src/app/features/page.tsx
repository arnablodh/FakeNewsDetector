"use client";
import React from "react";
import Link from "next/link";
import AuthModal from "@/components/auth-modal";
import { X } from "lucide-react";

export default function FeaturesPage() {
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const [user, setUser] = React.useState<{ email: string; name: string } | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem("scouter_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header (same as landing) */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/scouter_logo.png" alt="Scouter logo" className="w-9 h-9 rounded-xl object-cover" />
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-foreground to-muted-foreground/75 bg-clip-text text-transparent group-hover:text-foreground transition-all">
              Scouter
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <Link href="/features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/extension" className="hover:text-foreground transition-colors">
              Chrome Extension
            </Link>
            <Link href="/architecture" className="hover:text-foreground transition-colors">
              Architecture
            </Link>
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
                <button onClick={() => { localStorage.removeItem("scouter_user"); setUser(null); }} className="p-2 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive transition-all cursor-pointer" title="Sign Out">
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

      {/* Close button */}
      <div className="flex justify-end p-4">
        <Link href="/" className="p-2 rounded-full bg-muted/20 hover:bg-muted/40 transition">
          <X className="w-5 h-5" />
        </Link>
      </div>

      <main className="py-20 px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold mb-4">Features</h1>
        <p className="text-lg text-muted-foreground/80">Explore the powerful capabilities of Scouter.</p>
        {/* You can copy the feature cards from the landing page here if desired. */}
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={(email) => setUser({ email, name: email.split("@")[0] })} />
    </div>
  );
}
