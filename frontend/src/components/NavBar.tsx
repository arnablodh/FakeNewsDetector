"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, LogOut, Moon, Sun } from "lucide-react";

const NavBar: React.FC<{ isDark: boolean; toggleTheme: () => void; user: { email: string; name: string } | null; setIsAuthOpen: (open: boolean) => void; handleLogout: () => void; }> = ({ isDark, toggleTheme, user, setIsAuthOpen, handleLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on navigation
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img src="/scouter_logo.png" alt="Scouter logo" className="w-9 h-9 rounded-xl object-cover" />
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent group-hover:text-foreground transition-all">
            Scouter
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-muted-foreground uppercase tracking-widest">
          <Link href="/" className="hover:text-foreground transition-colors" title="Home – Dashboard, Start">Home</Link>
          <Link href="/#features" className="hover:text-foreground transition-colors" title="Features – Tech, Metrics">Features</Link>
          <Link href="/extension" className="hover:text-foreground transition-colors" title="Extension – Chrome, Browser">Chrome Extension</Link>
          {user && (
            <Link href="/dashboard" className="text-primary hover:text-primary-hover flex items-center gap-1.5 transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-xl bg-muted/40 border border-border/60 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile panel */}
        <div
          className={`fixed inset-0 z-50 bg-background/95 backdrop-blur-md transform transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
          style={{ pointerEvents: mobileMenuOpen ? "auto" : "none" }}
        >
          <div className="flex flex-col h-full p-6 space-y-6">
            <button
              className="self-end p-2 rounded-xl bg-muted/40 border border-border/60 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
            <nav className="flex flex-col gap-4 text-lg font-medium text-foreground">
              <Link href="/" className="hover:text-primary transition-colors" onClick={closeMenu}>Home</Link>
              <Link href="/#features" className="hover:text-primary transition-colors" onClick={closeMenu}>Features</Link>
              <Link href="/extension" className="hover:text-primary transition-colors" onClick={closeMenu}>Chrome Extension</Link>
              {user && (
                <Link href="/dashboard" className="flex items-center gap-2 hover:text-primary transition-colors" onClick={closeMenu}>
                  <LayoutDashboard className="w-5 h-5" /> Dashboard
                </Link>
              )}
            </nav>
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-muted/40 border border-border/60 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all"
            title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-foreground">{user.name}</p>
                <p className="text-[10px] text-muted-foreground">{user.email}</p>
              </div>
              <Link href="/dashboard" className="bg-muted/50 border border-border hover:bg-muted text-foreground text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden xs:inline">Dashboard</span>
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive" title="Sign Out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/10">
              Sign In / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
export default NavBar;
