"use client";

import { useState, useEffect } from "react";
import { 
  analyzeArticleClient, 
  sampleArticles, 
  AnalysisResult 
} from "@/lib/mock-ai";
import ShapViewer from "./shap-viewer";
import StylometryViewer from "./stylometry-viewer";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { 
  Scan, 
  Sparkles, 
  ChevronRight, 
  ShieldAlert, 
  Activity, 
  RotateCcw, 
  Clock, 
  Brain, 
  Share2, 
  FileText,
  Bookmark,
  ShieldCheck,
  Loader2
} from "lucide-react";

interface ScannerProps {
  onScanComplete?: (result: AnalysisResult) => void;
}

export default function Scanner({ onScanComplete }: ScannerProps) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [modelType, setModelType] = useState("tfidf");
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [shareDestModalOpen, setShareDestModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareType, setShareType] = useState<"link" | "pdf">("link");
  const [generatedPdfFile, setGeneratedPdfFile] = useState<File | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Auto-dismiss toast notification
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const tfidfSteps = [
    "Scraping document semantic vocabulary...",
    "Parsing TF-IDF matrix values...",
    "Executing local model decision boundaries...",
    "Evaluating word-level SHAP attributions...",
    "Assembling detailed credibility analytics..."
  ];
  const bertSteps = [
    "Loading DistilBERT model...",
    "Running semantic similarity analysis...",
    "Computing deep‑network inference...",
    "Generating explanation vectors...",
    "Finalizing credibility report..."
  ];
  const scanStepsMessages = modelType === "bert" ? bertSteps : tfidfSteps;

  // Rotate messages during loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setScanStep((prev) => {
          if (prev < scanStepsMessages.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 500);
    } else {
      setScanStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Check for deep-linked query parameters on startup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const scanId = params.get("scan");
      if (scanId) {
        loadScanFromHistory(scanId);
      }
    }
  }, []);

  const loadScanFromHistory = async (scanId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/scan/${scanId}`);
      if (res.ok) {
        const data = await res.json();
        setResult({
          ...data,
          model_type: `${data.model_type.toUpperCase()} (Loaded)`
        });
      } else {
        throw new Error("Backend query failed");
      }
    } catch (e) {
      const localScans: AnalysisResult[] = JSON.parse(localStorage.getItem("winston_scans") || "[]");
      const savedBookmarks: AnalysisResult[] = JSON.parse(localStorage.getItem("scouter_saved_scans") || "[]");
      const matched = localScans.find(s => s.id === scanId) || savedBookmarks.find(s => s.id === scanId);
      if (matched) {
        setResult(matched);
      }
    }
    setLoading(false);
  };

  const handleSampleClick = (sampleIdx: number) => {
    const sample = sampleArticles[sampleIdx];
    setTitle(sample.title);
    setText(sample.text);
    setIsSaved(false);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 50) return;

    setLoading(true);
    setResult(null);

    // Dynamic execution delays so the user appreciates the parsing steps
    setTimeout(async () => {
      let scanResult: AnalysisResult;
      
      try {
        // 1. Try FastAPI Python Server first
        const response = await fetch("http://localhost:8000/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || "Scanned Article Report",
            text: text,
            model_type: modelType
          })
        });

        if (response.ok) {
          const data = await response.json();
          scanResult = {
            ...data,
            model_type: `${data.model_type.toUpperCase()} (FastAPI)`
          };
        } else {
          throw new Error("Local FastAPI server failed.");
        }
      } catch (backendErr) {
        console.warn("FastAPI backend offline, trying Next.js internal api or local mock...", backendErr);
        
        try {
          const response = await fetch("/api/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, text, model_type: modelType })
          });
          
          if (response.ok) {
            const data = await response.json();
            scanResult = {
              ...data,
              model_type: `${data.model_type.toUpperCase()} (Next.js API)`
            };
          } else {
            throw new Error("Next.js internal API failed.");
          }
        } catch (frontendErr) {
          console.warn("Next.js API offline. Falling back to local JS NLP engine.", frontendErr);
          
          // 3. Fallback to Local client NLP engine (100% reliable)
          scanResult = analyzeArticleClient(
            title || "Scanned Article Report", 
            text, 
            "http://localhost:3001/local-scan",
            modelType
          );
        }
      } finally {
        // Ensure loading state is reset regardless of outcome
        setLoading(false);
      }

      setResult(scanResult);
      
      // Save locally to simulate scan logs
      const savedLogs = JSON.parse(localStorage.getItem("winston_scans") || "[]");
      localStorage.setItem("winston_scans", JSON.stringify([scanResult, ...savedLogs].slice(0, 30)));

      if (onScanComplete) {
        onScanComplete(scanResult);
      }
    }, 2500); // Gives ample time for scanning loader animation
  };

  // Share handlers
  const generatePdfFile = async (): Promise<File | null> => {
    if (!result) {
      console.warn("No result available to generate PDF");
      return null;
    }

    setToastMessage("Generating premium PDF Report...");

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;

      // Helper function to draw standard header on a page
      const drawHeader = () => {
        // Top accent line
        pdf.setFillColor(79, 70, 229); // Indigo
        pdf.rect(0, 0, pageWidth, 4, "F");

        // Logo
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(20);
        pdf.setTextColor(79, 70, 229); // Indigo
        pdf.text("SCOUTER", margin, 18);

        // Subtitle
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139); // Slate 500
        pdf.text("AI CREDIBILITY SCAN REPORT", pageWidth - margin - 52, 16);

        // Divider
        pdf.setDrawColor(226, 232, 240); // Slate 200
        pdf.setLineWidth(0.5);
        pdf.line(margin, 22, pageWidth - margin, 22);
      };

      // Helper function to draw standard footer on a page
      const drawFooter = (pageNum: number, totalPages: number) => {
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184); // Slate 400
        pdf.text("https://scouter.ai | Truth & Credibility Intelligence", margin, pageHeight - 10);
        pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
      };

      // Let's create page 1
      drawHeader();

      let currentY = 32;

      // Document Category badge
      pdf.setFillColor(243, 244, 246); // Gray 100
      pdf.roundedRect(margin, currentY, 35, 6, 1.5, 1.5, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(107, 114, 128); // Gray 500
      pdf.text((result.category || "GENERAL NEWS").toUpperCase(), margin + 3, currentY + 4.2);

      // Model type badge
      pdf.setFillColor(239, 246, 255); // Blue 50
      pdf.roundedRect(margin + 40, currentY, 48, 6, 1.5, 1.5, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(37, 99, 235); // Blue 600
      pdf.text(`MODEL: ${result.model_type || "TF-IDF CPU"}`.toUpperCase(), margin + 43, currentY + 4.2);

      currentY += 12;

      // Title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(15, 23, 42); // Slate 900
      
      const wrappedTitle = pdf.splitTextToSize(result.title || "Scan Report", contentWidth);
      pdf.text(wrappedTitle, margin, currentY);
      currentY += (wrappedTitle.length * 6) + 4;

      // Metadata line (Scan ID & Timestamp)
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139); // Slate 500
      const dateString = new Date(result.created_at * 1000).toLocaleString();
      pdf.text(`Scan ID: ${result.id || "N/A"}   |   Date: ${dateString}`, margin, currentY);

      currentY += 12;

      // SCORE DASHBOARD CARD
      pdf.setFillColor(248, 250, 252); // Slate 50
      pdf.setDrawColor(241, 245, 249); // Slate 100
      pdf.setLineWidth(1);
      pdf.roundedRect(margin, currentY, contentWidth, 54, 3, 3, "FD");

      // Card title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(79, 70, 229); // Indigo
      pdf.text("Credibility & Sentiment Dashboard", margin + 8, currentY + 9);

      // Divider inside card
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin + 8, currentY + 13, margin + contentWidth - 8, currentY + 13);

      // Truth Score Column
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text("TRUTH ACCURACY SCORE", margin + 12, currentY + 22);

      const truthScore = result.truth_score || 50;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      // Pick color based on score
      if (truthScore >= 70) {
        pdf.setTextColor(13, 148, 136); // Teal 600 (High Credibility)
      } else if (truthScore >= 45) {
        pdf.setTextColor(217, 119, 6); // Amber 600 (Medium/Suspicious)
      } else {
        pdf.setTextColor(225, 29, 72); // Rose 600 (Low Credibility/Fake)
      }
      pdf.text(`${truthScore}%`, margin + 12, currentY + 31);

      // Draw Truth Score Progress Bar
      pdf.setFillColor(226, 232, 240); // Track color (Gray 200)
      pdf.roundedRect(margin + 12, currentY + 34, 60, 4, 2, 2, "F");
      
      if (truthScore >= 70) {
        pdf.setFillColor(13, 148, 136);
      } else if (truthScore >= 45) {
        pdf.setFillColor(217, 119, 6);
      } else {
        pdf.setFillColor(225, 29, 72);
      }
      pdf.roundedRect(margin + 12, currentY + 34, (truthScore / 100) * 60, 4, 2, 2, "F");

      // Score status description text
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(100, 116, 139);
      let statusDesc = "Low credibility indicators detected.";
      if (truthScore >= 70) statusDesc = "Highly credible reporting standard.";
      else if (truthScore >= 45) statusDesc = "Moderate risk bias/subjectivity flagged.";
      pdf.text(statusDesc, margin + 12, currentY + 43);


      // Bias Score Column (drawn on the right half of the card)
      const rightColOffset = 88;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text("SUBJECTIVE BIAS INDEX", margin + rightColOffset, currentY + 22);

      const biasScore = result.bias_score || 50;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      if (biasScore >= 50) {
        pdf.setTextColor(225, 29, 72); // Rose 600 (High Bias)
      } else if (biasScore >= 30) {
        pdf.setTextColor(217, 119, 6); // Amber 600 (Moderate Bias)
      } else {
        pdf.setTextColor(13, 148, 136); // Teal 600 (Low Bias)
      }
      pdf.text(`${biasScore}%`, margin + rightColOffset, currentY + 31);

      // Draw Bias Score Progress Bar
      pdf.setFillColor(226, 232, 240);
      pdf.roundedRect(margin + rightColOffset, currentY + 34, 60, 4, 2, 2, "F");

      if (biasScore >= 50) {
        pdf.setFillColor(225, 29, 72);
      } else if (biasScore >= 30) {
        pdf.setFillColor(217, 119, 6);
      } else {
        pdf.setFillColor(13, 148, 136);
      }
      pdf.roundedRect(margin + rightColOffset, currentY + 34, (biasScore / 100) * 60, 4, 2, 2, "F");

      // Bias status description
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(100, 116, 139);
      let biasDesc = "Factual, balanced representation.";
      if (biasScore >= 50) biasDesc = "High emotional/opinionated payload.";
      else if (biasScore >= 30) biasDesc = "Mild partisan framing observed.";
      pdf.text(biasDesc, margin + rightColOffset, currentY + 43);

      currentY += 66;

      // STYLOMETRICS CARD
      pdf.setFillColor(248, 250, 252); // Slate 50
      pdf.setDrawColor(241, 245, 249);
      pdf.setLineWidth(1);
      pdf.roundedRect(margin, currentY, contentWidth, 75, 3, 3, "FD");

      // Card Title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(79, 70, 229);
      pdf.text("Stylometric & Forensic Insights", margin + 8, currentY + 9);

      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin + 8, currentY + 13, margin + contentWidth - 8, currentY + 13);

      // Grid items inside the stylometrics card
      const sty = result.stylometrics || {
        readability_score: 65,
        readability_grade: "10th-12th Grade",
        sensationalism_score: 22,
        lexical_diversity: 45,
        passive_voice_density: 12
      };

      const row1Y = currentY + 24;
      const row2Y = currentY + 49;

      // Item 1: Readability Index
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text("READABILITY GRADE", margin + 12, row1Y);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(79, 70, 229);
      pdf.text(sty.readability_grade || "College Level", margin + 12, row1Y + 7);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Flesch Reading Ease: ${sty.readability_score || 0}/100`, margin + 12, row1Y + 12);

      // Item 2: Sensationalism Score
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text("SENSATIONALISM INDEX", margin + rightColOffset, row1Y);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      const sens = sty.sensationalism_score || 0;
      if (sens >= 40) pdf.setTextColor(225, 29, 72);
      else if (sens >= 20) pdf.setTextColor(217, 119, 6);
      else pdf.setTextColor(13, 148, 136);
      pdf.text(`${sens}%`, margin + rightColOffset, row1Y + 7);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text("Measures emotionally charged adjectives", margin + rightColOffset, row1Y + 12);

      // Item 3: Lexical Diversity
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text("LEXICAL DIVERSITY", margin + 12, row2Y);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${sty.lexical_diversity || 0}%`, margin + 12, row2Y + 7);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text("Unique vocabulary distribution ratio", margin + 12, row2Y + 12);

      // Item 4: Passive Voice Density
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text("PASSIVE VOICE DENSITY", margin + rightColOffset, row2Y);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${sty.passive_voice_density || 0}%`, margin + rightColOffset, row2Y + 7);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text("Frequency of indirect statement construction", margin + rightColOffset, row2Y + 12);

      // Draw standard footer on page 1
      drawFooter(1, 2);

      // Now create Page 2: Word attribution list
      pdf.addPage();
      drawHeader();

      currentY = 32;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(15, 23, 42);
      pdf.text("Linguistic Attribution & Feature Weights", margin, currentY);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text("Key semantic tokens identified by Scouter's AI engine as strongest contributors to credibility rating:", margin, currentY + 5);

      currentY += 12;

      // Filter and list top word attributions (non-zero weight) sorted by absolute impact
      const attributions = (result.explanation || [])
        .filter((w: any) => w.weight !== 0)
        .sort((a: any, b: any) => Math.abs(b.weight) - Math.abs(a.weight))
        .slice(0, 10); // Display top 10

      if (attributions.length === 0) {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128);
        pdf.text("No high-impact styling or bias tokens identified in this article scan.", margin, currentY + 10);
      } else {
        // Table Header
        pdf.setFillColor(243, 244, 246);
        pdf.rect(margin, currentY, contentWidth, 8, "F");
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8.5);
        pdf.setTextColor(75, 85, 99);
        pdf.text("IDENTIFIED TOKEN", margin + 4, currentY + 5.5);
        pdf.text("ATTRIBUTION IMPACT WEIGHT", margin + 45, currentY + 5.5);
        pdf.text("CLASSIFIER SIGNIFICANCE / EXPLANATION", margin + 95, currentY + 5.5);

        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.5);
        pdf.line(margin, currentY + 8, margin + contentWidth, currentY + 8);

        currentY += 8;

        attributions.forEach((attr: any, idx: number) => {
          // Zebra striping
          if (idx % 2 === 1) {
            pdf.setFillColor(249, 250, 251);
            pdf.rect(margin, currentY, contentWidth, 9, "F");
          }

          // Draw token word
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(9);
          pdf.setTextColor(17, 24, 39);
          pdf.text(`"${attr.word}"`, margin + 4, currentY + 6);

          // Draw impact badge / text
          const w = attr.weight || 0;
          pdf.setFont("helvetica", "bold");
          if (w > 0) {
            pdf.setFillColor(204, 251, 241); // Light teal badge
            pdf.roundedRect(margin + 45, currentY + 2, 28, 5, 1, 1, "F");
            pdf.setTextColor(13, 148, 136); // Teal 600
            pdf.setFontSize(8);
            pdf.text(`+${w.toFixed(2)} (Credible)`, margin + 47, currentY + 5.5);
          } else {
            pdf.setFillColor(254, 226, 226); // Light red badge
            pdf.roundedRect(margin + 45, currentY + 2, 28, 5, 1, 1, "F");
            pdf.setTextColor(220, 38, 38); // Red 600
            pdf.setFontSize(8);
            pdf.text(`${w.toFixed(2)} (Biased)`, margin + 47, currentY + 5.5);
          }

          // Draw explanation text
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8.5);
          pdf.setTextColor(75, 85, 99);
          const expText = pdf.splitTextToSize(attr.explanation || "Neutral distribution value", contentWidth - 100);
          pdf.text(expText, margin + 95, currentY + 5.5);

          // Border line
          pdf.setDrawColor(243, 244, 246);
          pdf.line(margin, currentY + 9, margin + contentWidth, currentY + 9);
          
          currentY += 9;
        });
      }

      // Draw standard footer on page 2
      drawFooter(2, 2);

      // Convert to File object
      const pdfBlob = pdf.output("blob");
      return new File([pdfBlob], `Scouter-Report-${result.id || "Scan"}.pdf`, {
        type: "application/pdf",
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
      return null;
    }
  };

  const handleCopyLink = () => {
    if (!result) return;
    setShareType("link");
    const url = `${window.location.origin}/?scan=${result.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setToastMessage("Shareable URL copied to clipboard!");
      setShareUrl(url);
      setShareDestModalOpen(true);
    }, () => {
      setToastMessage("Failed to copy link to clipboard.");
    });
  };

  const handleShareAsPdf = async () => {
    if (!result) return;
    setShareType("pdf");
    setGeneratedPdfFile(null);
    setIsGeneratingPdf(true);
    setShareDestModalOpen(true);

    const pdfFile = await generatePdfFile();
    if (pdfFile) {
      setGeneratedPdfFile(pdfFile);
      setToastMessage("Premium PDF compiled and ready to share!");
    } else {
      setToastMessage("Failed to build PDF. Desktop fallback print active.");
    }
    setIsGeneratingPdf(false);
  };

  const handleShareAsDocx = () => {
    if (!result) return;
    setShareType("link"); // Fallback to link
    const url = `${window.location.origin}/?scan=${result.id}`;
    setShareUrl(url);
    setShareDestModalOpen(true);
    setToastMessage("DOCX share not implemented – link copied.");
    navigator.clipboard.writeText(url);
  };

  const handleWhatsAppShare = async () => {
    if (!result) return;

    if (shareType === "pdf") {
      const pdfFile = generatedPdfFile;
      if (!pdfFile) {
        setToastMessage("PDF is still compiling, please wait a moment...");
        return;
      }

      // Use navigator.share() to open the native OS share sheet.
      // The user picks WhatsApp from the list and the PDF file is sent directly.
      if (navigator.share) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: `Scouter Report: ${result.title}`,
            text: "Scouter Credibility Analysis Report",
          });
          setToastMessage("PDF sent successfully!");
          setShareDestModalOpen(false);
          return;
        } catch (err: any) {
          // User cancelled the share sheet — that's fine
          if (err?.name === "AbortError") {
            return;
          }
          console.warn("Share failed:", err);
        }
      }

      // If navigator.share is not available at all (very old browser), 
      // open the PDF in a new tab so the user can save/share it manually.
      const pdfUrl = URL.createObjectURL(pdfFile);
      window.open(pdfUrl, "_blank");
      setToastMessage("PDF opened in new tab — save it and share via WhatsApp.");
      setShareDestModalOpen(false);
    } else {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(
          `Scouter Analysis Report: ${shareUrl || ""}`
        )}`,
        "_blank"
      );
      setShareDestModalOpen(false);
    }
  };

  const handleEmailShare = async () => {
    if (!result) return;

    if (shareType === "pdf") {
      const pdfFile = generatedPdfFile;
      if (!pdfFile) {
        setToastMessage("PDF is still compiling, please wait a moment...");
        return;
      }

      if (navigator.share) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: `Scouter Report: ${result.title}`,
            text: "Scouter Credibility Analysis Report",
          });
          setToastMessage("PDF sent successfully!");
          setShareDestModalOpen(false);
          return;
        } catch (err: any) {
          if (err?.name === "AbortError") {
            return;
          }
          console.warn("Share failed:", err);
        }
      }

      const pdfUrl = URL.createObjectURL(pdfFile);
      window.open(pdfUrl, "_blank");
      setToastMessage("PDF opened in new tab — save it and attach to your email.");
      setShareDestModalOpen(false);
    } else {
      window.open(
        `mailto:?subject=${encodeURIComponent(
          `Scouter Analysis Report: ${result.title}`
        )}&body=${encodeURIComponent(
          `Hi, check out this Scouter report: ${shareUrl || ""}`
        )}`
      );
      setShareDestModalOpen(false);
    }
  };

  const handleSaveScan = () => {
    if (!result) return;
    setIsSaved(true);
    
    // Save to special "Saved Bookmarks" ledger in localStorage
    const savedBookmarks = JSON.parse(localStorage.getItem("scouter_saved_scans") || "[]");
    if (!savedBookmarks.some((b: any) => b.id === result.id)) {
      localStorage.setItem("scouter_saved_scans", JSON.stringify([result, ...savedBookmarks]));
    }
    
    // Set document tab title so Chrome names the bookmark perfectly
    document.title = `Scouter Report: ${result.title}`;
    
    // Update the browser URL without reloading so the Chrome bookmark references the deep-link scan
    const newUrl = `${window.location.origin}/?scan=${result.id}`;
    window.history.pushState(null, "", newUrl);

    // Open premium instructional modal to guide browser bookmarking
    setIsBookmarkModalOpen(true);
    setToastMessage("Report saved! Creating Chrome Bookmark deep-link...");
  };

  const handleExportPdf = () => {
    const element = document.getElementById("report");
    if (!element) {
      console.warn("Export target #report not found");
      return;
    }

    setToastMessage("Preparing clean PDF Report...");

    // Create temporary clone to purge action buttons
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = element.innerHTML;

    // Physically remove any elements with .no-print class
    const elementsToRemove = tempContainer.querySelectorAll(".no-print");
    elementsToRemove.forEach((el) => el.parentNode?.removeChild(el));

    const cleanHtml = tempContainer.innerHTML;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      setToastMessage("Failed: Please allow pop-ups to print.");
      return;
    }

    // Get all page stylesheets to preserve styled visual gauges
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join("\n");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Scouter Report</title>
          ${styles}
          <style>
            .no-print { display: none !important; }
            @media print {
              .no-print { display: none !important; }
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background: #0a0a0f !important;
                color: #e2e2e8 !important;
              }
            }
            body {
              background: #0a0a0f;
              color: #e2e2e8;
              padding: 32px;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .report-header {
              text-align: center;
              margin-bottom: 28px;
              padding-bottom: 16px;
              border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .report-header h1 {
              font-size: 22px;
              font-weight: 800;
              background: linear-gradient(to right, #818cf8, #a78bfa);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin: 0;
            }
            .report-header p {
              font-size: 11px;
              color: #888;
              margin-top: 6px;
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h1>Scouter Analysis Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          ${cleanHtml}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 600);
    };
  };

  const handleShare = () => {
    if (!result) return;
    const shareUrl = `${window.location.origin}/?scan=${result.id}`;
    
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        setToastMessage("Shareable URL copied to clipboard!");
      },
      () => {
        setToastMessage("Failed to copy link to clipboard.");
      }
    );
  };

  const handleReset = () => {
    setResult(null);
    setTitle("");
    setText("");
    setIsSaved(false);
  };

  return (
    <div suppressHydrationWarning={true} className="w-full max-w-5xl mx-auto space-y-8 relative">
      
      {/* Background glow behind scanner */}
      <div className="glow-bg top-10 left-10" />

      {!result && !loading ? (
        /* SCAN INPUT VIEW */
        <div className="glass-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <form onSubmit={handleScan} className="space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Scan className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Advanced Article Analyzer</h2>
                  <p className="text-xs text-muted-foreground">Submit body copy or full paragraphs for precision scanning.</p>
                </div>
              </div>
              
              {/* Model Select */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:block">AI Engine:</label>
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="bg-muted/50 border border-border/80 text-foreground text-xs rounded-xl px-3 py-2 outline-none focus:border-primary transition-all font-medium"
                >
                  <option value="tfidf">TF-IDF + Logistic Regression (SHAP Explanations)</option>
                  <option value="bert">DistilBERT Deep Neural Ensemble (Semantic check)</option>
                </select>
              </div>
            </div>

            {/* Document Details */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Article Title (Optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Landmark Climate Science Study Published"
                  className="w-full bg-input/40 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/45"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Article Text (Minimum 50 chars)</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  placeholder="Paste the news copy or text paragraphs here. Our AI will compute absolute credibility scores, highlight stylometrics, and map token attributions..."
                  className="w-full bg-input/40 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl py-4 px-4 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground/45 resize-y font-sans leading-relaxed"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground/60 px-1 mt-1">
                  <span>Characters: {text.length}</span>
                  <span>{text.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            </div>

            {/* Quick Sample Trigger */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest block">Or Quick-Fill with Samples:</span>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSampleClick(0)}
                  className="text-xs px-3.5 py-2 rounded-xl bg-success/5 border border-success/15 hover:bg-success/10 text-success/90 font-medium transition-all"
                >
                  Factual Health Study
                </button>
                <button
                  type="button"
                  onClick={() => handleSampleClick(1)}
                  className="text-xs px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/15 hover:bg-primary/10 text-primary/90 font-medium transition-all"
                >
                  Factual Space Mission
                </button>
                <button
                  type="button"
                  onClick={() => handleSampleClick(2)}
                  className="text-xs px-3.5 py-2 rounded-xl bg-destructive/5 border border-destructive/15 hover:bg-destructive/10 text-destructive/90 font-medium transition-all"
                >
                  Clickbait Diabetes Miracle
                </button>
                <button
                  type="button"
                  onClick={() => handleSampleClick(3)}
                  className="text-xs px-3.5 py-2 rounded-xl bg-warning/5 border border-warning/15 hover:bg-warning/10 text-warning/90 font-medium transition-all"
                >
                  Conspiratorial Mind Control
                </button>
              </div>
            </div>

            {/* Trigger Button */}
            <button
              type="submit"
              disabled={text.trim().length < 50}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-semibold rounded-2xl py-4 shadow-xl hover:shadow-indigo-500/10 active:translate-y-px transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
            >
              <Sparkles className="w-5 h-5" />
              <span>Initiate Credibility Scan</span>
            </button>
          </form>
        </div>
      ) : loading ? (
        /* SCAN LOADER ANINMATION */
        <div className="glass-card border border-border rounded-3xl p-12 text-center shadow-2xl relative z-10 flex flex-col items-center justify-center min-h-[400px] animate-in fade-in zoom-in-95 duration-200">
          
          {/* Animated radar sonar circles */}
          <div className="relative w-28 h-28 flex items-center justify-center mb-8">
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-60" />
            <div className="absolute inset-4 rounded-full border border-purple-500/30 animate-pulse" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-xl animate-spin duration-3000">
              <Brain className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-foreground">Computing Lexical SHAP Bounds</h3>
          
          {/* Dynamic rotating steps logs */}
          <div className="h-6 overflow-hidden mt-2 mb-6">
            <p className="text-sm text-primary font-medium transition-all duration-300 animate-bounce">
              {scanStepsMessages[scanStep]}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-md h-1.5 bg-border rounded-full overflow-hidden">
            <div 
              style={{ width: `${((scanStep + 1) / scanStepsMessages.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
            />
          </div>
          
          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mt-3 font-semibold">
            Parsing linear coefficients & expected values
          </span>
        </div>
      ) : (
        /* RESULTS INTERFACE */
        <div id="report" className="space-y-8 animate-in fade-in slide-in-from-top-6 duration-300 relative z-10">
          
          {/* Action Row */}
          <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60 border border-border/80 px-4 py-2.5 rounded-xl transition-all self-start"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Scan Another Article</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveScan}
                disabled={isSaved}
                className={`inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl border transition-all ${
                  isSaved 
                    ? 'bg-success/5 border-success/20 text-success cursor-default' 
                    : 'bg-muted/30 border-border/80 hover:bg-muted/60 text-foreground'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isSaved ? "Scan Saved" : "Save Report"}</span>
              </button>
              
              <button 
                onClick={handleExportPdf}
                className="inline-flex items-center gap-2 text-xs font-semibold bg-muted/30 hover:bg-muted/60 border border-border/80 px-4 py-2.5 rounded-xl text-foreground transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>PDF Report</span>
              </button>
              
              {/* Primary Share Menu */}
              <div className="relative">
                <button
                  onClick={() => setShareMenuOpen(!shareMenuOpen)}
                  className="inline-flex items-center gap-2 text-xs font-semibold bg-primary hover:bg-primary/95 text-white px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                {shareMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border/80 rounded-xl shadow-lg z-20">
                    <button
                      onClick={handleCopyLink}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted/20"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={handleShareAsPdf}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted/20"
                    >
                      Share as PDF
                    </button>
                    <button
                      onClick={handleShareAsDocx}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted/20"
                    >
                      Share as DOCX
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Credibility radial gauge */}
            <div className="glass-card border border-border rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg min-h-[220px]">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Credibility Score</span>
              
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="40" 
                    fill="transparent" 
                    stroke="var(--border)" 
                    strokeWidth="8"
                  />
                  <circle 
                    cx="50" cy="50" r="40" 
                    fill="transparent" 
                    stroke={
                      result!.truth_score >= 80 
                        ? 'var(--success)' 
                        : result!.truth_score >= 50 
                          ? 'var(--warning)' 
                          : 'var(--destructive)'
                    } 
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - result!.truth_score / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-foreground tracking-tight">
                    {result!.truth_score}%
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                    Accuracy
                  </span>
                </div>
              </div>

              <span className={`text-sm font-bold mt-4 uppercase tracking-wider ${
                result!.truth_score >= 80 
                  ? 'text-success' 
                  : 'text-destructive'
              }`}>
                {result!.truth_score >= 80 ? "Real" : "Fake"}
              </span>
            </div>

            {/* 2. Bias indicator */}
            <div className="glass-card border border-border rounded-3xl p-6 flex flex-col justify-between shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bias Analysis</span>
                  <ShieldAlert className={`w-4 h-4 ${result!.bias_score > 40 ? 'text-warning' : 'text-success'}`} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Subjectivity Score</span>
                    <span className="text-foreground">{result!.bias_score}%</span>
                  </div>
                  <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${result!.bias_score}%` }} 
                      className={`h-full rounded-full ${
                        result!.bias_score >= 60 
                          ? 'bg-destructive' 
                          : result!.bias_score >= 35 
                            ? 'bg-warning' 
                            : 'bg-success'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Objectivity Index</span>
                    <span className="text-foreground">{result!.truth_score}%</span>
                  </div>
                  <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${result!.truth_score}%` }} 
                      className="h-full rounded-full bg-success"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed mt-4">
                {result!.bias_score >= 60 
                  ? "Highly polarized style characterized by strong emotive adverbs and attention-seeking capitalization."
                  : result!.bias_score >= 35 
                    ? "Moderate bias. Features neutral paragraphs interspersed with subjective adjectives or leading phrasing."
                    : "Objective, fact-driven reporting style aligning with authoritative source attributes."}
              </p>
            </div>

            {/* 3. Article Metadata */}
            <div className="glass-card border border-border rounded-3xl p-6 flex flex-col justify-between shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Model Diagnostics</span>
                  <Activity className="w-4 h-4 text-primary" />
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Topic Category</span>
                    <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                      {result!.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Decision Model</span>
                    <span className="text-foreground font-semibold uppercase text-[10px]">{result!.model_type}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Text Length</span>
                    <span className="text-foreground font-semibold">{result!.text.length} characters</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Word Count</span>
                    <span className="text-foreground font-semibold">
                      {result!.text.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                </div>
              </div>

              {/* Cache hit indicator */}
              <div className="flex items-center gap-1.5 p-2 bg-muted/40 border border-border/50 rounded-xl mt-4 text-[10px] font-semibold text-muted-foreground justify-center">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>
                  {result!.cached 
                    ? "CACHE HIT (Retrieved in 1ms via Redis/Memory)" 
                    : "SCAN GENERATED (Computed in 18ms & Cached)"}
                </span>
              </div>
            </div>

          </div>

          {/* Stylometry & Readability Panel */}
          <StylometryViewer stylometrics={result!.stylometrics} />

          {/* SHAP Highlighting Panel */}
          <div className="glass-card border border-border rounded-3xl p-6 md:p-8 shadow-lg space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Explainable AI Word-Attribution</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                The visual representation below details the specific tokens that drove the model's credibility scoring.
              </p>
            </div>
            
            <ShapViewer attributions={result!.explanation} />
          </div>

        </div>
      )}

      {/* Chrome Bookmark Guidance Modal */}
      {isBookmarkModalOpen && result && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md mx-4 glass-card border border-border/80 rounded-3xl p-7 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">

            {/* Icon */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Bookmark className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-foreground">Bookmark This Scan Report</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Browsers block websites from adding entries to your bookmark folder directly (it's a security rule). 
                To save this report in Chrome, press the keyboard shortcut below:
              </p>
            </div>

            {/* Shortcut block */}
            <div className="p-5 bg-muted/30 border border-border/50 rounded-2xl space-y-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Press This on Your Keyboard</p>
              <div className="flex items-center justify-center gap-2 font-mono">
                <kbd className="px-3 py-1.5 bg-background border border-border/80 rounded-lg shadow-sm text-sm font-bold text-foreground">Ctrl</kbd>
                <span className="text-muted-foreground font-bold">+</span>
                <kbd className="px-3 py-1.5 bg-background border border-border/80 rounded-lg shadow-sm text-sm font-bold text-foreground">D</kbd>
              </div>
              <p className="text-[10px] text-muted-foreground/60 italic">
                Mac users: press <kbd className="px-1.5 py-0.5 bg-background border border-border/60 rounded text-[10px]">⌘ Cmd</kbd> + <kbd className="px-1.5 py-0.5 bg-background border border-border/60 rounded text-[10px]">D</kbd>
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Chrome will save the bookmark as:<br />
              <span className="text-foreground font-semibold mt-1 block">"{`Scouter Report: ${result.title}`}"</span>
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setIsBookmarkModalOpen(false);
                  setToastMessage("Bookmark saved! You can re-open this scan anytime from Chrome.");
                }}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white font-bold py-3 text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                ✓ Done, I pressed Ctrl+D!
              </button>
              <button
                onClick={() => setIsBookmarkModalOpen(false)}
                className="w-full bg-muted/40 hover:bg-muted/60 border border-border/60 text-muted-foreground font-semibold py-2.5 text-xs rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Share Destination Modal */}
      {shareDestModalOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm mx-4 glass-card border border-border/80 rounded-3xl p-6 shadow-2xl space-y-5 text-center animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-foreground">
              {shareType === "pdf" && isGeneratingPdf ? "Preparing Document" : "Share Report To"}
            </h3>
            
            {shareType === "pdf" && isGeneratingPdf ? (
              <div className="py-6 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-xs font-bold text-foreground">Assembling Premium PDF...</p>
                <p className="text-[10px] text-muted-foreground/75 leading-relaxed">
                  Capturing credibility indicators, SHAP attributions, and stylometrics layout...
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full bg-success/10 hover:bg-success/20 border border-success/30 text-success font-semibold py-3 rounded-xl transition-all cursor-pointer text-xs"
                >
                  WhatsApp
                </button>
                <button
                  onClick={handleEmailShare}
                  className="w-full bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-semibold py-3 rounded-xl transition-all cursor-pointer text-xs"
                >
                  Email
                </button>
                <button
                  onClick={() => window.open('https://drive.google.com/drive/my-drive', '_blank')}
                  className="w-full bg-muted/10 hover:bg-muted/20 border border-muted/30 text-muted-foreground font-semibold py-3 rounded-xl transition-all cursor-pointer text-xs"
                >
                  Google Drive
                </button>
                <button
                  onClick={() => window.open(`https://github.com/new?filename=${encodeURIComponent(result?.title || 'report')}.txt&value=${encodeURIComponent(shareUrl || '')}`, '_blank')}
                  className="w-full bg-muted/10 hover:bg-muted/20 border border-muted/30 text-muted-foreground font-semibold py-3 rounded-xl transition-all cursor-pointer text-xs"
                >
                  GitHub
                </button>
                <button
                  onClick={() => setShareDestModalOpen(false)}
                  className="w-full bg-muted/25 hover:bg-muted/40 text-muted-foreground font-semibold py-2.5 rounded-xl transition-all cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}



    </div>
  );
}
