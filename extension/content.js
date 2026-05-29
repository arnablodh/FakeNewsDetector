// Content script to extract page content for analysis

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapeContent") {
    try {
      // Get selected text first
      let selectedText = window.getSelection().toString().trim();
      
      // If no text is selected, scrape the main article content
      let content = "";
      let title = document.title || "";
      
      if (selectedText.length > 0) {
        content = selectedText;
      } else {
        // Find article body paragraphs
        const paragraphs = Array.from(document.querySelectorAll('article p, main p, p'));
        content = paragraphs
          .map(p => p.innerText.trim())
          .filter(text => text.length > 30) // Filter out short snippets
          .slice(0, 15) // Limit to first 15 paragraphs to avoid overloading
          .join("\n\n");
      }

      sendResponse({
        success: true,
        title: title,
        content: content,
        url: window.location.href
      });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Keep message channel open for async response
});
