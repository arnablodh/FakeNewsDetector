import json
import hashlib
import uuid
import time
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

# Import local components
from db import init_db, get_db, ScanRecord
from cache import winston_cache
from ai_engine import ai_engine

app = FastAPI(
    title="Winston News AI - Explainable Fake News Gateway",
    description="FastAPI gateway with hybrid caching, dual-database integration, and token-level SHAP explanation highlights.",
    version="1.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"], # Support extension and local client
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to initialize DB
@app.on_event("startup")
def startup_event():
    init_db()

# Request schemas
class ScanRequest(BaseModel):
    title: Optional[str] = ""
    text: str = Field(..., min_length=50, description="Article body text to analyze (minimum 50 chars)")
    url: Optional[str] = ""
    model_type: Optional[str] = "tfidf" # 'tfidf' or 'bert'

# Response schemas
class ScanResponse(BaseModel):
    id: str
    title: str
    text: str
    url: str
    category: str
    truth_score: float
    bias_score: float
    explanation: List[Dict[str, Any]]
    model_type: str
    created_at: int
    cached: bool

# Endpoints
@app.post("/api/scan", response_model=ScanResponse)
def scan_article(request: ScanRequest, db: Session = Depends(get_db)):
    # 1. Generate unique cache key using MD5 of text
    text_hash = hashlib.md5(request.text.strip().encode("utf-8")).hexdigest()
    cache_key = f"scan:{request.model_type}:{text_hash}"
    
    # 2. Check Cache
    cached_result = winston_cache.get(cache_key)
    if cached_result:
        print(f"[Winston Cache] Cache HIT for article hash: {text_hash}")
        # Add a flag to indicate it came from cache
        cached_result["cached"] = True
        return cached_result
    
    print(f"[Winston Cache] Cache MISS for article hash: {text_hash}. Analyzing via AI Model...")

    # 3. Analyze using chosen model
    start_time = time.time()
    if request.model_type == "bert":
        analysis = ai_engine.analyze_deep_bert(request.text)
    else:
        analysis = ai_engine.analyze_article(request.text)
    
    execution_time = time.time() - start_time
    print(f"[Winston AI] Article scanned in {execution_time * 1000:.1f}ms using {request.model_type} model.")

    # 4. Generate record details
    scan_id = f"scan_{uuid.uuid4().hex[:12]}"
    
    # Serialize word attributions list to string for database storage
    explanation_json = json.dumps(analysis["word_attributions"])
    
    # 5. Save to database
    db_record = ScanRecord(
        id=scan_id,
        title=request.title or "Untitled Scan",
        text=request.text,
        url=request.url or "",
        category=analysis["category"],
        truth_score=analysis["truth_score"],
        bias_score=analysis["bias_score"],
        explanation=explanation_json,
        model_type=analysis["model_type"]
    )
    
    try:
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
    except Exception as e:
        db.rollback()
        print(f"[Winston DB] Error saving record to database: {e}")
        # Fallback to local variables if DB fails
    
    # 6. Construct response structure
    response_data = {
        "id": scan_id,
        "title": request.title or "Untitled Scan",
        "text": request.text,
        "url": request.url or "",
        "category": analysis["category"],
        "truth_score": analysis["truth_score"],
        "bias_score": analysis["bias_score"],
        "explanation": analysis["word_attributions"], # Return as list of dicts directly
        "model_type": analysis["model_type"],
        "created_at": int(db_record.created_at if hasattr(db_record, "created_at") else time.time()),
        "cached": False
    }
    
    # 7. Set Cache (TTL 1 hour)
    winston_cache.set(cache_key, response_data, expire_seconds=3600)
    
    return response_data

@app.get("/api/history", response_model=List[Dict[str, Any]])
def get_history(limit: int = 20, db: Session = Depends(get_db)):
    try:
        records = db.query(ScanRecord).order_by(ScanRecord.created_at.desc()).limit(limit).all()
        history = []
        for r in records:
            history.append({
                "id": r.id,
                "title": r.title,
                "text": r.text[:200] + "..." if len(r.text) > 200 else r.text,
                "url": r.url,
                "category": r.category,
                "truth_score": r.truth_score,
                "bias_score": r.bias_score,
                "model_type": r.model_type,
                "created_at": r.created_at
            })
        return history
    except Exception as e:
        print(f"[Winston API] Error fetching history: {e}")
        return []

@app.get("/api/scan/{scan_id}", response_model=ScanResponse)
def get_scan_by_id(scan_id: str, db: Session = Depends(get_db)):
    record = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Scan record not found")
        
    try:
        explanation = json.loads(record.explanation)
    except Exception:
        explanation = []
        
    return {
        "id": record.id,
        "title": record.title,
        "text": record.text,
        "url": record.url,
        "category": record.category,
        "truth_score": record.truth_score,
        "bias_score": record.bias_score,
        "explanation": explanation,
        "model_type": record.model_type,
        "created_at": record.created_at,
        "cached": False
    }

@app.delete("/api/history/{scan_id}")
def delete_scan(scan_id: str, db: Session = Depends(get_db)):
    record = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Scan record not found")
    
    try:
        db.delete(record)
        db.commit()
        # Note: We don't necessarily have the cache key here because we don't have the text hash,
        # but cache will naturally expire. That is acceptable.
        return {"success": True, "message": "Scan deleted from history."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@app.get("/api/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    try:
        records = db.query(ScanRecord).all()
        if not records:
            return {
                "total_scans": 0,
                "avg_truth_score": 0.0,
                "avg_bias_score": 0.0,
                "category_data": [],
                "recent_scans": []
            }
            
        total_scans = len(records)
        avg_truth = sum(r.truth_score for r in records) / total_scans
        avg_bias = sum(r.bias_score for r in records) / total_scans
        
        # Categorize
        category_counts = {}
        for r in records:
            category_counts[r.category] = category_counts.get(r.category, 0) + 1
            
        category_data = [
            {"name": cat, "value": count} for cat, count in category_counts.items()
        ]
        
        return {
            "total_scans": total_scans,
            "avg_truth_score": round(avg_truth, 1),
            "avg_bias_score": round(avg_bias, 1),
            "category_data": category_data
        }
    except Exception as e:
        print(f"[Winston API] Stats calculation failed: {e}")
        return {
            "total_scans": 0,
            "avg_truth_score": 0.0,
            "avg_bias_score": 0.0,
            "category_data": []
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
