import os
import time
from sqlalchemy import create_engine, Column, String, Float, Text, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load env variables from root or local dir
load_dotenv()

# Determine DB URL
# Supabase provides PostgreSQL. If SUPABASE_DB_URL is available, use it, otherwise fallback to local SQLite
DATABASE_URL = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")

if DATABASE_URL:
    print(f"[Winston DB] Using cloud database connection: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
    # Enable connection pooling and pre-ping to keep cloud DB connection alive
    engine = create_engine(
        DATABASE_URL, 
        pool_size=10, 
        max_overflow=20, 
        pool_recycle=1800,
        pool_pre_ping=True
    )
else:
    DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "winston_ai.db")
    print(f"[Winston DB] Environment variables not set. Falling back to local SQLite at: {DB_FILE}")
    DATABASE_URL = f"sqlite:///{DB_FILE}"
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ScanRecord(Base):
    __tablename__ = "scans"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=True)
    text = Column(Text, nullable=False)
    url = Column(String(500), nullable=True)
    category = Column(String(100), default="General")
    truth_score = Column(Float, nullable=False)
    bias_score = Column(Float, nullable=False)
    explanation = Column(Text, nullable=False) # JSON-serialized SHAP weights list
    model_type = Column(String(50), default="tfidf")
    created_at = Column(Integer, default=lambda: int(time.time()))

# Create tables automatically on startup
def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("[Winston DB] Database tables initialized successfully.")
    except Exception as e:
        print(f"[Winston DB] Error initializing database tables: {e}")

# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
