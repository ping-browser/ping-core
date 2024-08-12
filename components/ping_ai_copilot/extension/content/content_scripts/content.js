let summarizer = null;
let summaryBox = null;
let isSummarizerVisible = false;
let isTextSelected = false;

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const initializeExtension = () => {
  document.removeEventListener('mouseup', handleTextSelection);
  document.addEventListener('mouseup', debounce(handleTextSelection, 190));
  document.addEventListener('click', handleDocumentClick);
}

const handleTextSelection = (event) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  const wordCount = selectedText.split(/\s+/).length;
  if (wordCount >= 10 && wordCount <= 1000 && !(summaryBox && summaryBox.contains(selection.anchorNode))) {
    if (!isSummarizerVisible) {
      showSummarizeIcon(selectedText, event);
      isTextSelected = true; 
    }
  } else {
    hideSummarizeIcon();
    isTextSelected = false; 
  }
}

const handleDocumentClick = (event) => {
  if(summaryBox && !summaryBox.contains(event.target)){
    hideSummaryBox();
  }
  if(isTextSelected && summarizer){
    if(summaryBox && !summaryBox.contains(event.target)){
      hideSummarizeIcon()
      hideSummaryBox();
    }
    else if(!summaryBox){
      hideSummarizeIcon()
      hideSummaryBox();
    }    
  }
}

const showSummarizeIcon = (selectedText, event) => {
  if (!summarizer) {
    summarizer = document.createElement('div');
    summarizer.id = 'summarizer-icon';
    
    const iconImage = document.createElement('img');
    iconImage.src = chrome.runtime.getURL('extension/assets/aiSummarizerIcon.svg');
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

  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const endRange = document.createRange();
  endRange.setStart(range.endContainer, range.endOffset);
  endRange.setEnd(range.endContainer, range.endOffset);

  let rect;
  if (range.endContainer.nodeType === Node.TEXT_NODE) {
    const text = range.endContainer.textContent;
    let wordStart = range.endOffset;

    while (wordStart > 0 && /\S/.test(text[wordStart - 1])) {
      wordStart--;
    }
    endRange.setStart(range.endContainer, wordStart);
    rect = endRange.getBoundingClientRect();
  } else {
    rect = range.getBoundingClientRect();
  }

  const scrollX = window.scrollX || document.documentElement.scrollLeft;
  const scrollY = window.scrollY || document.documentElement.scrollTop;
 
  let top; let left;
  if(event.detail === 3){
    top = rect.bottom + scrollY + 1;
    left = rect.right + scrollX + 1
  }
  top = rect.bottom + scrollY + 5;
  left = rect.right + scrollX + 5;

  summarizer.style.top = `${top}px`;
  summarizer.style.left = `${left}px`;
  summarizer.style.display = 'inline-block';
  isSummarizerVisible = true;
};

const hideSummarizeIcon = () => {
  if (summarizer) {
    summarizer.style.display = 'none';
    isSummarizerVisible = false;  
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
      ${isLoading ? '' : `<button id="copy-button"><img id="copy-image" src="${chrome.runtime.getURL('extension/assets/content_copy.svg')}" alt="Copy"/></button>`}
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
  setTimeout(() => {
    const height = summaryBox.scrollHeight;
    summaryBox.style.maxHeight = `${height}px`;
    summaryBox.style.opacity = '1';
  }, 10);
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
