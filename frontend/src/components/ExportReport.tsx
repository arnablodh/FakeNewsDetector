"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button";

interface ExportReportProps {
  targetId: string;
}

export default function ExportReport({ targetId }: ExportReportProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    const element = document.getElementById(targetId);
    if (!element) {
      console.warn(`ExportReport: element with id "${targetId}" not found`);
      return;
    }

    setExporting(true);

    // Create a temporary clone of the element to clean it up before printing
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = element.innerHTML;

    // Find and completely remove all elements with the 'no-print' class from the cloned DOM
    const elementsToRemove = tempContainer.querySelectorAll(".no-print");
    elementsToRemove.forEach((el) => {
      el.parentNode?.removeChild(el);
    });

    const cleanHtml = tempContainer.innerHTML;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      alert("Please allow pop-ups to export the report.");
      setExporting(false);
      return;
    }

    // Get all stylesheets from the current page to preserve UI styles in printed layout
    const styles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
      .map((node) => node.outerHTML)
      .join("\n");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Scouter Report</title>
          ${styles}
          <style>
            /* Extra print styling safeguards */
            .no-print {
              display: none !important;
            }

            @media print {
              .no-print {
                display: none !important;
              }
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
        setExporting(false);
      }, 600);
    };

    // Fallback if onload doesn't fire
    setTimeout(() => {
      try {
        printWindow.print();
        printWindow.close();
      } catch {
        // Window may already be closed
      }
      setExporting(false);
    }, 3500);
  };

  return (
    // Wrap button in the 'no-print' class so it is also completely excluded
    <div className="no-print">
      <Button
        id="export-btn"
        onClick={handleExport}
        disabled={exporting}
        className="mt-4 w-full"
      >
        {exporting ? "Preparing Report..." : "Export Report as PDF"}
      </Button>
    </div>
  );
}
