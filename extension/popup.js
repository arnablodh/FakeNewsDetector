document.addEventListener("DOMContentLoaded", () => {
  const scanBtn = document.getElementById("scanBtn");
  const dashboardBtn = document.getElementById("dashboardBtn");
  const scannerLine = document.getElementById("scannerLine");
  const welcomeMsg = document.getElementById("welcomeMsg");
  const resultsArea = document.getElementById("resultsArea");
  const scoreGauge = document.getElementById("scoreGauge");
  const scoreNumber = document.getElementById("scoreNumber");
  const credibilityLabel = document.getElementById("credibilityLabel");
  const biasVal = document.getElementById("biasVal");
  const modelVal = document.getElementById("modelVal");
  const statusMessage = document.getElementById("statusMessage");

  let scanId = null;

  scanBtn.addEventListener("click", async () => {
    // Show scanning animation
    scannerLine.style.display = "block";
    scanBtn.disabled = true;
    scanBtn.innerText = "Scanning article...";
    statusMessage.innerText = "Extracting article text...";
    welcomeMsg.classList.add("hidden");
    resultsArea.classList.add("hidden");

    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        throw new Error("No active tab found.");
      }

      // Check if we can run script
      if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("about:")) {
        throw new Error("Cannot scan system or browser configuration pages.");
      }

      // Inject content script if not already loaded (failsafe)
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"]
        });
      } catch (e) {
        // Might already be injected, ignore
      }

      // Query content script
      chrome.tabs.sendMessage(tab.id, { action: "scrapeContent" }, async (response) => {
        if (!response || !response.success) {
          showError("Could not scrape page text. Try highlighting the text you want to analyze.");
          return;
        }

        const { title, content, url } = response;
        if (!content || content.trim().length < 100) {
          showError("Not enough text content found (needs at least 100 characters). Try selecting the text manually.");
          return;
        }

        statusMessage.innerText = "Analyzing credibility and style...";

        // Call FastAPI backend
        try {
          const scanResponse = await fetch("http://localhost:8000/api/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: title,
              text: content,
              url: url,
              model_type: "tfidf"
            })
          });

          if (scanResponse.ok) {
            const data = await scanResponse.json();
            displayResults(data, "FastAPI Backend");
          } else {
            throw new Error("Backend response error");
          }
        } catch (backendError) {
          console.warn("FastAPI backend connection failed. Trying Next.js frontend api...", backendError);
          
          // Try Next.js API route fallback
          try {
            const frontendScanResponse = await fetch("http://localhost:3001/api/scan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: title,
                text: content,
                url: url,
                model_type: "tfidf"
              })
            });

            if (frontendScanResponse.ok) {
              const data = await frontendScanResponse.json();
              displayResults(data, "Next.js API");
            } else {
              throw new Error("Next.js backend response error");
            }
          } catch (frontendError) {
            console.warn("All backend connections failed. Using browser client-side mock...", frontendError);
            // Instant Client-side local analyzer fallback
            const localResult = mockAnalyzeText(title, content, url);
            displayResults(localResult, "Client Engine (Fallback)");
          }
        }
      });
    } catch (err) {
      showError(err.message);
    }
  });

  dashboardBtn.addEventListener("click", () => {
    if (scanId) {
      // Deep link to Next.js dashboard
      chrome.tabs.create({ url: `http://localhost:3001/scan/${scanId}` });
    } else {
      chrome.tabs.create({ url: `http://localhost:3001/dashboard` });
    }
  });

  function displayResults(data, engine) {
    scannerLine.style.display = "none";
    scanBtn.disabled = false;
    scanBtn.innerText = "Scan Again";
    dashboardBtn.classList.remove("hidden");
    resultsArea.classList.remove("hidden");
    
    scanId = data.id || "temp";
    const score = Math.round(data.truth_score);
    
    // Update gauge colors
    let color = "var(--danger)";
    let label = "Unreliable / Fake";
    let badgeClass = "badge-danger";

    if (score >= 80) {
      color = "var(--success)";
      label = "Highly Credible";
      badgeClass = "badge-success";
    } else if (score >= 50) {
      color = "var(--warning)";
      label = "Mixed / Biased";
      badgeClass = "badge-warning";
    }

    scoreGauge.style.background = `conic-gradient(${color} ${score}%, var(--border) 0)`;
    scoreNumber.innerText = `${score}%`;
    scoreNumber.style.color = color;
    
    credibilityLabel.innerText = label;
    credibilityLabel.className = "score-label";
    
    // Bias details
    const biasPercentage = Math.round(data.bias_score || (100 - score));
    biasVal.innerHTML = `<span class="badge ${badgeClass}">${biasPercentage}% Bias</span>`;
    
    modelVal.innerText = data.model_type ? data.model_type.toUpperCase() : "TF-IDF + LR";
    statusMessage.innerHTML = `Scan completed via <strong style="color:var(--primary);">${engine}</strong>.`;
  }

  function showError(msg) {
    scannerLine.style.display = "none";
    scanBtn.disabled = false;
    scanBtn.innerText = "Try Scanning Again";
    statusMessage.innerHTML = `<span style="color:var(--danger); font-weight:600;">Error:</span> ${msg}`;
  }

  // Client-side NLP Approximation (so it works without any servers!)
  function mockAnalyzeText(title, text, url) {
    // Basic analysis on string keywords
    const lowerText = text.toLowerCase();
    const fakeKeywords = ["shocking", "conspiracy", "unbelievable", "secret", "exposed", "scandal", "miracle cure", "they don't want you to know", "aliens", "illuminati", "click here", "fake", "hoax"];
    const credibleKeywords = ["scientific", "according to researchers", "study published", "verified", "spokesperson", "announced", "official report", "reuters", "associated press", "journal of", "data shows"];
    
    let fakeScore = 0;
    let credibleScore = 0;

    fakeKeywords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerText.match(regex);
      if (matches) fakeScore += matches.length * 15;
    });

    credibleKeywords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerText.match(regex);
      if (matches) credibleScore += matches.length * 12;
    });

    // Default starting point is 70% credibility
    let baseScore = 70;
    baseScore = baseScore + (credibleScore - fakeScore);
    baseScore = Math.max(12, Math.min(98, baseScore)); // Clamp between 12 and 98

    // Generate random scan ID
    const randomId = "scan_" + Math.random().toString(36).substr(2, 9);

    return {
      id: randomId,
      truth_score: baseScore,
      bias_score: Math.round(100 - baseScore + (Math.random() * 15 - 7.5)),
      model_type: "Local JS NLP"
    };
  }
});
