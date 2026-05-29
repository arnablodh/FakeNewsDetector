'use client';
import Link from 'next/link';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Sun, Moon } from 'lucide-react';

export default function Header() {
  const [isDark, toggleDark] = useDarkMode();
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/help', label: 'Help' },
  ];

  return (
    <header suppressHydrationWarning className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
        <nav className="flex space-x-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={toggleDark}
          className="p-2 rounded-full hover:bg-muted"
          aria-label="Toggle theme"
          suppressHydrationWarning
        >
          {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
