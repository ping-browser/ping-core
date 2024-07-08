import "../ui/style.css"

let summarizer = null;
let summaryBox = null;

function initializeExtension() {
  document.removeEventListener('mouseup', handleTextSelection);
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('click', handleDocumentClick);
}

function handleTextSelection(event) {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  if (selectedText.length > 0 && !(summaryBox && summaryBox.contains(selection.anchorNode))) {
    showSummarizeIcon(selectedText, event);
  } else {
    hideSummarizeIcon();
  }
}

function handleDocumentClick(event) {
  if (summaryBox && !summaryBox.contains(event.target) && (!summarizer || !summarizer.contains(event.target))) {
    hideSummaryBox();
  }
}

function showSummarizeIcon(selectedText, event) {
  if (!summarizer) {
    summarizer = document.createElement('div');
    summarizer.id = 'summarizer-icon';
    summarizer.innerHTML = '📝';
    summarizer.addEventListener('click', (e) => {
      e.stopPropagation();
      sendTextToSummarize(selectedText);
    });
    document.body.appendChild(summarizer);
  }
  
  summarizer.style.top = `${event.pageY + 10}px`;
  summarizer.style.left = `${event.pageX + 10}px`;
  summarizer.style.display = 'block';
}

function hideSummarizeIcon() {
  if (summarizer) {
    summarizer.style.display = 'none';
  }
}

function sendTextToSummarize(text) {
  showSummaryBox(true);
  try {
    chrome.runtime.sendMessage({ action: 'summarize', text: text }, response => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        showSummaryBox(false, 'An error occurred. Please try again.');
      } else {
        // Handle the response here
      }
    });
  } catch (error) {
    console.error('Failed to send message:', error);
    showSummaryBox(false, 'An error occurred. Please refresh the page and try again.');
  }
}

function showSummaryBox(isLoading, summary = '') {
  if (!summaryBox) {
    summaryBox = document.createElement('div');
    summaryBox.id = 'summary-box';
    document.body.appendChild(summaryBox);
  }

  summaryBox.innerHTML = `
    <div class="summary-header">
      <h2 id="headingText">Text Summary</h2>
      ${isLoading ? '' : `<button id="copy-button"><img id="copy-image" src="${chrome.runtime.getURL('content_copy.svg')}" alt="Copy"/></button>`}
    </div>
    ${isLoading ? `
      <div class="loading-placeholder">
        <div class="loading-line"></div>
        <div class="loading-line"></div>
        <div class="loading-line"></div>
      </div>
    ` : `
      <ul class="summary-list">
        ${summary.split('\n').map((point, index) => `
          <li><span class="emoji">${getEmojiForIndex(index)}</span>${point}</li>
        `).join('')}
      </ul>
    `}
  `;

  if (!isLoading) {
    document.getElementById('copy-button').addEventListener('click', (e) => {
      e.stopPropagation();
      copyToClipboard(summary);
    });
  }

  // Reset animation
  summaryBox.style.animation = 'slideUp 0.3s ease-out';

  summaryBox.style.display = 'block';
}

function hideSummaryBox() {
  if (summaryBox) {
    summaryBox.style.animation = 'slideDown 0.3s ease-out';
    setTimeout(() => {
      summaryBox.style.display = 'none';
    }, 300); // Wait for animation to complete
  }
}

function getEmojiForIndex(index) {
  const emojis = ['😊', '🤔', '🎤', '💃', '🍎'];
  return emojis[index % emojis.length];
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const copyMessage = document.createElement('div');
    copyMessage.id = 'copy-message';
    copyMessage.textContent = 'Copied!';
    document.body.appendChild(copyMessage);
    setTimeout(() => copyMessage.remove(), 2000);
  });
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'displaySummary') {
    showSummaryBox(false, request.summary);
  }
});

// Initialize the extension
initializeExtension();
