# FakeNewsDetector (Scouter)

## Overview

Scouter is a next‑generation tool for detecting misinformation in online news articles. It combines:
- **Credibility scoring** based on bias detection, source reputation and language analysis.
- **Deep SHAP highlights** (planned) to visualise which sentences contributed most to the model's decision.
- **Chrome extension mock** that lets you evaluate articles on‑the‑fly.

The UI is built with **Next.js 16** and **Tailwind‑styled** components, delivering a premium glass‑morphic design. The backend runs a FastAPI service for PDF generation, text extraction and model inference.

## Features
- Real‑time article credibility score
- Visual bias level & diagnostics
- Mock Chrome extension UI with download button
- PDF generation with `jsPDF`
- Responsive, dark‑mode ready landing page

## Getting Started (Local Development)

1. **Clone the repo** (once we push it) – see *Installation* below.
2. **Install dependencies**
   ```bash
   cd Scouter/frontend   # front‑end code
   npm install
   cd ../backend        # optional FastAPI backend
   pip install -r requirements.txt
   ```
3. **Run the development server**
   ```bash
   # From the project root
   npm run dev   # Next.js dev server (default http://localhost:30001)
   ```
   The FastAPI server can be started with `uvicorn backend.main:app --reload`.
4. Open `http://localhost:30001` in your browser.  The landing page showcases the credibility UI and the mock Chrome extension.

## Installation (Production)

After the repo is pushed to GitHub you can clone it:
```bash
# Clone the repo
git clone https://github.com/arnablodh/FakeNewsDetector.git
cd FakeNewsDetector

# Front‑end
cd frontend
npm ci --production   # install only needed packages
npm run build          # generate static build

# (Optional) Backend
cd ../backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Deploy the `frontend/.next` build to any static host (Vercel, Netlify, etc.) and the FastAPI backend to a serverless platform or container.

## Contributing
- Fork the repository.
- Create a feature branch: `git checkout -b feature/my‑feature`.
- Follow the existing code style (Prettier + ESLint).
- Open a pull request with a clear description of the change.

## License
MIT – feel free to use, modify and distribute.

---
*Scouter – making the web a more trustworthy place.*
