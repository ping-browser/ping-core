let summarizer = null;
let summaryBox = null;

const initializeExtension = () => {
  injectStyles();
  document.removeEventListener('mouseup', handleTextSelection);
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('click', handleDocumentClick);
}

const handleTextSelection = (event) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  if (selectedText.length > 0 && !(summaryBox && summaryBox.contains(selection.anchorNode))) {
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
    iconImage.src = chrome.runtime.getURL('./aiSummarizerIcon.svg');
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
  summarizer.style.top = `${event.clientY}px`;
  summarizer.style.left = `${event.clientX}px`;
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
      ${isLoading ? '' : `<button id="copy-button"><img id="copy-image" src="${chrome.runtime.getURL('./content_copy.svg')}" alt="Copy"/></button>`}
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

  // Append the copied message above the copy button
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

const injectStyles = () => {
  const style = `
    @keyframes slideUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes slideDown {
      from {
        transform: translateY(0);
        opacity: 1;
      }
      to {
        transform: translateY(100%);
        opacity: 0;
      }
    }

    #summarizer-icon {
      position: absolute;
      z-index: 1e5;
      background-color: #112130;
      color: white;
      padding: 5px;
      border-radius: 50%;
      cursor: pointer;
    }

    #summary-box {
      z-index: 1e5;
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 360px;
      border-radius: 24px;
      border-top: 7px solid #2BB563;
      border-bottom: 7px solid #2BB563;
      border-left: 4px solid #2BB563; 
      border-right: 4px solid #2BB563; 
      background: linear-gradient(153deg, #3674AD -39.05%, #112130 99.39%);   border-radius: 24px;
      padding: 24px;
      color: white;
      font-family: Arial, sans-serif;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .summary-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: bold;
      color: #fff;
      text-decoration: none;
    }

    #copy-button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 20px;
    }

    .loading-placeholder {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .loading-line {
      height: 16px;
      background-color: #2c5282;
      border-radius: 4px;
      animation: pulse 1.5s infinite;
    }

    .loading-line:nth-child(1) { width: 75%; }
    .loading-line:nth-child(2) { width: 83%; }
    .loading-line:nth-child(3) { width: 66%; }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .summary-list {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }

    .summary-list li {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .emoji {
      margin-right: 8px;
      font-size: 20px;
    }

    #copy-message {
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #4caf50;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
    }
  `;

  const styleElement = document.createElement('style');
  styleElement.innerHTML = style;
  document.head.appendChild(styleElement);
}

initializeExtension();
