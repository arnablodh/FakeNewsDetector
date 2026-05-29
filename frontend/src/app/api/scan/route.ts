import { NextRequest, NextResponse } from "next/server";
import { analyzeArticleClient } from "@/lib/mock-ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, text, url, model_type } = body;
    
    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Text length must be at least 50 characters" },
        { status: 400 }
      );
    }

    // Process scanning through internal client NLP engine
    const analysis = analyzeArticleClient(title || "API Scanned Report", text, url || "");
    
    // Add custom identifier so user knows it went through Next.js fallback API
    analysis.model_type = model_type === "bert" ? "Neural Mock" : "TF-IDF + LR";
    
    // Return structured response matching FastAPI schema
    return NextResponse.json(analysis);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
