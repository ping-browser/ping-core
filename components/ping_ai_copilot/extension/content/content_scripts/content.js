import "../ui/style.css"
let summarizer = null;
let summaryBox = null;
let isTextSelected = false;

const initializeExtension = () => {
  document.removeEventListener('mouseup', handleTextSelection);
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('click', handleDocumentClick);
}

const handleTextSelection = (event) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  if (selectedText.length > 0 && !(summaryBox && summaryBox.contains(selection.anchorNode))) {
    isTextSelected = true
    showSummarizeIcon(selectedText, event);
  } else {
    hideSummarizeIcon();
  }
}

const handleDocumentClick = (event) => {
  if (
    summaryBox &&
    !summaryBox.contains(event.target) &&
    (!summarizer || !summarizer.contains(event.target))
  ) {
    hideSummaryBox();
  }
}

const showSummarizeIcon = (selectedText, event) => {
  if (!summarizer) {
    summarizer = document.createElement('div');
    summarizer.id = 'summarizer-icon';
    
    const iconImage = document.createElement('img');
    iconImage.src = chrome.runtime.getURL('extension/content/content_scripts/aiSummarizerIcon.svg');
    iconImage.alt = 'Summarize Icon';
    iconImage.id = 'iconImage';
    
    summarizer.appendChild(iconImage);

    summarizer.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      sendTextToSummarize(selectedText);
    });
    document.body.appendChild(summarizer);
  }

  if (isTextSelected) {
    summarizer.style.top = `${event.clientY}px`;
    summarizer.style.left = `${event.clientX}px`;
  }

  summarizer.style.display = 'inline-block';
}

const hideSummarizeIcon = () => {
  if (summarizer) {
    summarizer.style.display = 'none';
  }
}

const sendTextToSummarize = (text) => {
  showSummaryBox(true);
  try {
    chrome.runtime.sendMessage({ action: 'summarize', text: text });
  } catch (error) {
    console.error('Failed to send message:', error);
    showSummaryBox(false, 'An error occurred. Please refresh the page and try again.');
  }
}

const showSummaryBox = (isLoading, summary = '', headerText = '') => {
  if (!summaryBox) {
    summaryBox = document.createElement('div');
    summaryBox.id = 'summary-box';
    document.body.appendChild(summaryBox);
  }
  summaryBox.innerHTML = `
    <div class="summary-header">
      ${isLoading ? '' : `<h2 id="headingText">${headerText}</h2>`}
      ${isLoading ? '' : `<button id="copy-button"><img id="copy-image" src="${chrome.runtime.getURL('extension/content/content_scripts/content_copy.svg')}" alt="Copy"/></button>`}
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
          <li>${point}</li>
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

  summaryBox.style.animation = 'slideUp 0.3s ease-out';
  summaryBox.style.display = 'block';
}

const hideSummaryBox = () => {
  if (summaryBox) {
    summaryBox.style.animation = 'slideDown 0.3s ease-out';
    setTimeout(() => {
      summaryBox.style.display = 'none';
    }, 300);
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    showCopiedMessage();
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

const showCopiedMessage = () => {
  const copyButton = document.getElementById('copy-button');
  if (!copyButton) return; 

  copyButton.style.display = 'none';

  const copiedMessage = document.createElement('div');
  copiedMessage.id = 'copiedMessage';
  copiedMessage.textContent = 'Copied!';

  copyButton.parentNode.insertBefore(copiedMessage, copyButton);

  setTimeout(() => {
    copiedMessage.remove();
    copyButton.style.display = 'block';
  }, 2000);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'displaySummary') {
    showSummaryBox(false, request.summary, request.headerText);
  }
});

initializeExtension();
