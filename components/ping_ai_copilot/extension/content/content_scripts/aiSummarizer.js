const TextSummarizer = (() => {

  let state = {
    summarizer: null,
    summaryBox: null,
    isSummarizerVisible: false,
    isTextSelected: false,
    currentSelectedText: '',
  };

  const COPIED_MESSAGE_TIMEOUT = 2000;

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showCopiedMessage();
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

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
    }, COPIED_MESSAGE_TIMEOUT);
  };

  const handleTextSelection = (event) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    const wordCount = selectedText.split(/\s+/).length;

    state.currentSelectedText = selectedText;

    if (wordCount >= 10 && wordCount <= 1000 && !(state.summaryBox && state.summaryBox.contains(selection.anchorNode))) {
      if (!state.isSummarizerVisible) {
        showSummarizeIcon(event);
        state.isTextSelected = true;
      }
    } else {
      hideSummarizeIcon();
      state.isTextSelected = false;
    }
  };

  const handleDocumentClick = (event) => {
    if (state.summaryBox && !state.summaryBox.contains(event.target)) {
      hideSummaryBox();
    }
    if (state.isTextSelected && state.summarizer) {
      if (state.summaryBox && !state.summaryBox.contains(event.target)) {
        hideSummarizeIcon();
        hideSummaryBox();
      } else if (!state.summaryBox) {
        hideSummarizeIcon();
        hideSummaryBox();
      }
    }
  };

  // UI Management
  const showSummarizeIcon = (event) => {
    if (!state.summarizer) {
      state.summarizer = document.createElement('div');
      state.summarizer.id = 'summarizer-icon';

      const iconImage = document.createElement('img');
      iconImage.src = chrome.runtime.getURL('extension/assets/aiSummarizerIcon.svg');
      iconImage.alt = 'Summarize Icon';
      iconImage.id = 'iconImage';

      state.summarizer.appendChild(iconImage);

      state.summarizer.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        sendTextToSummarize(state.currentSelectedText);
      });
      document.body.appendChild(state.summarizer);
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

    let top, left;
    if (event.detail === 3) {
      top = rect.bottom + scrollY + 1;
      left = rect.right + scrollX + 1;
    } else {
      top = rect.bottom + scrollY + 5;
      left = rect.right + scrollX + 5;
    }

    state.summarizer.style.top = `${top}px`;
    state.summarizer.style.left = `${left}px`;
    state.summarizer.style.display = 'inline-block';
    state.isSummarizerVisible = true;
  };

  const hideSummarizeIcon = () => {
    if (state.summarizer) {
      state.summarizer.style.display = 'none';
      state.isSummarizerVisible = false;
    }
  };

  const showSummaryBox = (isLoading, summary = '', headerText = '') => {
    if (!state.summaryBox) {
      state.summaryBox = document.createElement('div');
      state.summaryBox.id = 'summary-box';
      document.body.appendChild(state.summaryBox);
    }

    state.summaryBox.innerHTML = `
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
          ${summary.split('\n').map(point => `<li>${point}</li>`).join('')}
        </ul>
      `}
    `;

    if (!isLoading) {
      document.getElementById('copy-button').addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(summary);
      });
    }

    state.summaryBox.style.animation = 'slideUp 0.3s ease-out';
    state.summaryBox.style.display = 'block';
    setTimeout(() => {
      const height = state.summaryBox.scrollHeight;
      state.summaryBox.style.maxHeight = `${height}px`;
      state.summaryBox.style.opacity = '1';
    }, 10);
  };

  const hideSummaryBox = () => {
    if (state.summaryBox) {
      state.summaryBox.style.animation = 'slideDown 0.3s ease-out';
      setTimeout(() => {
        state.summaryBox.style.display = 'none';
      }, 300);
    }
  };

  const sendTextToSummarize = async(text) => {
    showSummaryBox(true);
    try {
      const response = await chrome.runtime.sendMessage({ action: 'summarize', text: text });
      if (response.success) {
        showSummaryBox(false, response.summary, response.headerText);
      } else 
        showSummaryBox(false, 'An error occurred. Please refresh the page and try again.');
    } catch (error) {
      console.error('Failed to send message:', error);
      showSummaryBox(false, 'An error occurred. Please refresh the page and try again.');
    }
  };

  const initialize = () => {
    document.removeEventListener('mouseup', handleTextSelection);
    document.addEventListener('mouseup', debounce(handleTextSelection, 190));
    document.addEventListener('click', handleDocumentClick);
  };

  return {
    initialize,
  };
})();

TextSummarizer.initialize();