"use client";

import React from "react";
import Link from "next/link";
import { GitBranch, Zap } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground/80 max-w-7xl mx-auto px-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex gap-4">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <GitBranch className="w-5 h-5" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">LinkedIn</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <Zap className="w-5 h-5" />
          </a>
        </div>
        <span>© 2026 Scouter. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
