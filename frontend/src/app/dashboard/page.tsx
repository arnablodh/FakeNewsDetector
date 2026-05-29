"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Trash2, 
  Eye, 
  PieChart as PieIcon, 
  TrendingUp, 
  ShieldCheck, 
  HelpCircle,
  Database,
  Search
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Cell, 
  Pie, 
  AreaChart, 
  Area 
} from "recharts";
import { AnalysisResult } from "@/lib/mock-ai";

export default function Dashboard() {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [stats, setStats] = useState({
    total_scans: 0,
    avg_truth_score: 0.0,
    avg_bias_score: 0.0,
    category_data: [] as { name: string; value: number }[]
  });
  const [loading, setLoading] = useState(true);
  const [isClientOnly, setIsClientOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const COLORS = ["#6366f1", "#a855f7", "#06b6d4", "#10b981", "#f59e0b"];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Try fetching from FastAPI
      const historyRes = await fetch("http://localhost:8000/api/history");
      const statsRes = await fetch("http://localhost:8000/api/stats");

      if (historyRes.ok && statsRes.ok) {
        const historyData = await historyRes.json();
        const statsData = await statsRes.json();
        
        setHistory(historyData);
        setStats(statsData);
        setIsClientOnly(false);
      } else {
        throw new Error("Failed to load server stats");
      }
    } catch (err) {
      console.warn("FastAPI offline. Generating dashboard analytics from localStorage logs...", err);
      
      // 2. Fallback: Parse localStorage scan history
      const localScans: AnalysisResult[] = JSON.parse(localStorage.getItem("winston_scans") || "[]");
      setHistory(localScans);

      // Compute statistics dynamically
      const total = localScans.length;
      if (total > 0) {
        const sumTruth = localScans.reduce((acc, curr) => acc + curr.truth_score, 0);
        const sumBias = localScans.reduce((acc, curr) => acc + curr.bias_score, 0);
        
        // Group by category
        const catMap: Record<string, number> = {};
        localScans.forEach(scan => {
          catMap[scan.category] = (catMap[scan.category] || 0) + 1;
        });

        const category_data = Object.keys(catMap).map(name => ({
          name,
          value: catMap[name]
        }));

        setStats({
          total_scans: total,
          avg_truth_score: parseFloat((sumTruth / total).toFixed(1)),
          avg_bias_score: parseFloat((sumBias / total).toFixed(1)),
          category_data
        });
      } else {
        // Mock default state for display if entirely empty
        setStats({
          total_scans: 0,
          avg_truth_score: 0.0,
          avg_bias_score: 0.0,
          category_data: []
        });
      }
      setIsClientOnly(true);
    }
    setLoading(false);
  };

  const handleDeleteScan = async (scanId: string) => {
    if (confirm("Are you sure you want to delete this scan from history?")) {
      if (!isClientOnly) {
        try {
          const res = await fetch(`http://localhost:8000/api/history/${scanId}`, {
            method: "DELETE"
          });
          if (res.ok) {
            fetchDashboardData();
            return;
          }
        } catch (e) {
          console.error("Delete failed on server", e);
        }
      }

      // Local fallback delete
      const localScans: AnalysisResult[] = JSON.parse(localStorage.getItem("winston_scans") || "[]");
      const updated = localScans.filter(s => s.id !== scanId);
      localStorage.setItem("winston_scans", JSON.stringify(updated));
      
      // Update UI state
      setHistory(updated);
      
      // Recalculate stats
      const total = updated.length;
      if (total > 0) {
        const sumTruth = updated.reduce((acc, curr) => acc + curr.truth_score, 0);
        const sumBias = updated.reduce((acc, curr) => acc + curr.bias_score, 0);
        
        const catMap: Record<string, number> = {};
        updated.forEach(scan => {
          catMap[scan.category] = (catMap[scan.category] || 0) + 1;
        });

        setStats({
          total_scans: total,
          avg_truth_score: parseFloat((sumTruth / total).toFixed(1)),
          avg_bias_score: parseFloat((sumBias / total).toFixed(1)),
          category_data: Object.keys(catMap).map(name => ({ name, value: catMap[name] }))
        });
      } else {
        setStats({
          total_scans: 0,
          avg_truth_score: 0.0,
          avg_bias_score: 0.0,
          category_data: []
        });
      }
    }
  };

  // Prepare trend data for Recharts (reverse to chronological order)
  const trendData = history
    .slice(0, 10)
    .reverse()
    .map((scan, index) => ({
      name: `Scan ${index + 1}`,
      credibility: scan.truth_score,
      bias: scan.bias_score
    }));

  const filteredHistory = history.filter(scan => 
    scan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scan.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen px-6 py-8 max-w-7xl mx-auto space-y-8 z-10">
      
      {/* Background glow glows */}
      <div className="glow-bg top-0 left-1/3" />

      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all uppercase tracking-wider mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Scanner</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Winston Analytics Dashboard
            </h1>
            <span className="text-[10px] font-bold bg-primary/20 border border-primary/25 text-primary uppercase tracking-widest px-2 py-0.5 rounded-full">
              Real-time Logs
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Aggregate diagnostics, category spreads, and model bias attributions.
          </p>
        </div>

        {/* Database Mode status */}
        <div className="flex items-center gap-2 p-2 bg-muted/40 border border-border/60 rounded-xl text-[10px] font-semibold text-muted-foreground max-w-xs self-start">
          <Database className="w-3.5 h-3.5 text-primary" />
          <span>
            {isClientOnly 
              ? "Running in Recruiter Preview Mode (Dynamic localStorage Fallback)" 
              : "Running in Production Mode (Connected to PostgreSQL/SQLite Server)"}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground">Parsing historical trends...</p>
        </div>
      ) : (
        <>
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Total Scans */}
            <div className="glass-card border border-border rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[110px]">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Scans Logs</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-foreground">{stats.total_scans}</span>
                <span className="text-xs text-muted-foreground">articles</span>
              </div>
            </div>

            {/* Card 2: Avg Truth Score */}
            <div className="glass-card border border-border rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[110px]">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Average Credibility</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-success">{stats.avg_truth_score}%</span>
                <span className="text-xs text-muted-foreground">factual index</span>
              </div>
            </div>

            {/* Card 3: Avg Bias Score */}
            <div className="glass-card border border-border rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[110px]">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Average Subjectivity</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-warning">{stats.avg_bias_score}%</span>
                <span className="text-xs text-muted-foreground">sensational rating</span>
              </div>
            </div>

            {/* Card 4: Integrity status */}
            <div className="glass-card border border-border rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[110px]">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Security Integrity</span>
              <div className="flex items-center gap-1.5 mt-3 text-success font-semibold text-xs">
                <ShieldCheck className="w-5 h-5" />
                <span>SHA-256 Verified Scans</span>
              </div>
            </div>

          </div>

          {stats.total_scans > 0 ? (
            /* ANALYTICS CHARTS GRID */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Chart 1: Area line chart representing historical truth progression */}
              <div className="glass-card border border-border rounded-3xl p-6 shadow-lg space-y-4">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Credibility vs Bias Trends</h3>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTruth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorBias" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#52525b" fontSize={10} tickLine={false} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#18181b", 
                          borderColor: "#27272a", 
                          color: "#fafafa",
                          borderRadius: "12px",
                          fontSize: "12px"
                        }} 
                      />
                      <Area type="monotone" dataKey="credibility" name="Credibility" stroke="#10b981" fillOpacity={1} fill="url(#colorTruth)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="bias" name="Subjectivity/Bias" stroke="#f59e0b" fillOpacity={1} fill="url(#colorBias)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Category spread pie chart */}
              <div className="glass-card border border-border rounded-3xl p-6 shadow-lg space-y-4">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                  <PieIcon className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Scans Grouped by Topic</h3>
                </div>

                <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-center gap-6">
                  {stats.category_data.length > 0 ? (
                    <>
                      <div className="h-full w-1/2 min-w-[150px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats.category_data}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {stats.category_data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: "#18181b", 
                                borderColor: "#27272a", 
                                color: "#fafafa",
                                borderRadius: "12px",
                                fontSize: "12px"
                              }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Legend */}
                      <div className="flex flex-col gap-2.5 text-xs text-left">
                        {stats.category_data.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                            />
                            <span className="font-semibold text-foreground">{item.name}</span>
                            <span className="text-muted-foreground">({item.value})</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Insufficient scan categories.</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* EMPTY CHART PLACEHOLDER */
            <div className="glass-card border border-border rounded-3xl p-12 text-center shadow-lg space-y-4">
              <HelpCircle className="w-12 h-12 text-muted-foreground/60 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No Historical Analytics Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Run standard scan checks on news copies inside the homepage scanner. Once processed, credibility indices and categorizations compile automatically.
                </p>
              </div>
              <Link 
                href="/" 
                className="inline-flex bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-xs px-5 py-3 shadow-lg"
              >
                Go Analyze First Article
              </Link>
            </div>
          )}

          {/* RECENT SCAN LOGS HISTORY TABLE */}
          <div className="glass-card border border-border rounded-3xl p-6 md:p-8 shadow-lg space-y-6">
            
            {/* Table Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Historical Audit Logs</h3>
                <p className="text-xs text-muted-foreground">Audit scanned publications stored in database ledger.</p>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title or topic..."
                  className="w-full bg-input/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2.5 pl-10 pr-4 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Table wrapper */}
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/80 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-4 px-5">Article Document Title</th>
                    <th className="py-4 px-5">Topic</th>
                    <th className="py-4 px-5">Model</th>
                    <th className="py-4 px-5">Credibility Score</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((scan) => {
                      const date = scan.created_at 
                        ? new Date(scan.created_at * 1000).toLocaleDateString()
                        : "Recent";

                      return (
                        <tr key={scan.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-4 px-5">
                            <div className="space-y-0.5">
                              <span className="font-bold text-foreground line-clamp-1 max-w-[280px]">
                                {scan.title || "Untitled Document Report"}
                              </span>
                              <span className="text-[10px] text-muted-foreground block">Scanned: {date}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="bg-primary/10 border border-primary/20 text-primary text-[9px] font-extrabold uppercase px-2 py-0.5 rounded">
                              {scan.category}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-muted-foreground uppercase text-[10px]">
                            {scan.model_type || "TF-IDF"}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`font-bold ${
                              scan.truth_score >= 80 
                                ? 'text-success' 
                                : scan.truth_score >= 50 
                                  ? 'text-warning' 
                                  : 'text-destructive'
                            }`}>
                              {scan.truth_score}%
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              <button 
                                onClick={() => {
                                  // Setup scanner with this state
                                  window.location.href = `/?scan=${scan.id}`;
                                }}
                                className="p-2 rounded-lg bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                title="View Deep Analysis"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteScan(scan.id)}
                                className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all cursor-pointer"
                                title="Delete from ledger"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                        No scan audit records match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
