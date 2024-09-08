let prevActiveElement = null;
let originalText = '';
let rephrasedText = '';
let rephraseButton = null;
let isFetching = false;
let abortController = null;
let pillContainer = null;
let showRephraseButton = true;
let isCanceled = false;

const applyGradientAnimation = (textBox) => {
    textBox.classList.add('gradient-animation');
};

const removeGradientColor = (textBox) => {
    textBox.classList.remove('gradient-animation');
};

const createPillContainer = (textBox) => {
    if (pillContainer) {
        pillContainer.remove();
    }

    pillContainer = document.createElement('div');
    pillContainer.classList.add('pill-container');

    const leftImg = document.createElement('div');
    const leftImgIcon = document.createElement('img');
    leftImgIcon.src = chrome.runtime.getURL('extension/assets/back.svg');
    leftImgIcon.alt = 'Undo';
    leftImgIcon.classList.add('icon');
    leftImg.appendChild(leftImgIcon);

    const leftTooltip = document.createElement('span');
    leftTooltip.textContent = 'Undo';
    leftTooltip.classList.add('tooltip', 'left-tooltip');
    leftImg.appendChild(leftTooltip);
    pillContainer.appendChild(leftImg);

    leftImg.addEventListener('mouseover', () => {
        leftTooltip.style.visibility = 'visible';
        leftTooltip.style.opacity = '1';
    });

    leftImg.addEventListener('mouseout', () => {
        leftTooltip.style.visibility = 'hidden';
        leftTooltip.style.opacity = '0';
    });

    const separator = document.createElement('span');
    separator.textContent = '|';
    separator.classList.add('separator');
    pillContainer.appendChild(separator);

    const rightImg = document.createElement('div');
    const rightImgIcon = document.createElement('img');
    rightImgIcon.src = chrome.runtime.getURL('extension/assets/rewrite.svg');
    rightImgIcon.alt = 'Retry';
    rightImgIcon.classList.add('icon');
    rightImg.appendChild(rightImgIcon);

    const rightTooltip = document.createElement('span');
    rightTooltip.textContent = 'Retry';
    rightTooltip.classList.add('tooltip', 'right-tooltip');
    rightImg.appendChild(rightTooltip);
    pillContainer.appendChild(rightImg);

    rightImg.addEventListener('mouseover', () => {
        rightTooltip.style.visibility = 'visible';
        rightTooltip.style.opacity = '1';
    });

    rightImg.addEventListener('mouseout', () => {
        rightTooltip.style.visibility = 'hidden';
        rightTooltip.style.opacity = '0';
    });

    document.body.appendChild(pillContainer);

    // Adjust position based on scroll offsets
    const rect = textBox.getBoundingClientRect();
    pillContainer.style.left = `${rect.right - pillContainer.offsetWidth - 5 + window.scrollX}px`;
    pillContainer.style.top = `${rect.bottom - pillContainer.offsetHeight - 5 + window.scrollY}px`;

    leftImgIcon.addEventListener('click', () => {
        if (prevActiveElement) {
            undoRephraseText(textBox);
        }
    });

    rightImgIcon.addEventListener('click', () => {
        if (prevActiveElement) {
            rephraseText(textBox);
        }
    });
};

const rephraseText = async (textBox, img) => {
    originalText = textBox.value || textBox.innerText;
    applyGradientAnimation(textBox);
    if (img) img.src = chrome.runtime.getURL('extension/assets/cross.svg');
    isFetching = true;
    isCanceled = false;

    try {
        const response = await chrome.runtime.sendMessage({ action: 'rephrase', text: originalText });

        if (isCanceled) {
            return;
        }

        isFetching = false;
        removeGradientColor(prevActiveElement);

        if (rephraseButton) {
            rephraseButton.remove();
            rephraseButton = null;
        }
        showRephraseButton = false;

        if (prevActiveElement.tagName === 'INPUT' || prevActiveElement.tagName === 'TEXTAREA') {
            prevActiveElement.value = response.rephrase;
        } else if (prevActiveElement.isContentEditable) {
            prevActiveElement.innerText = response.rephrase;
        }

        createPillContainer(prevActiveElement);
    } catch (error) {
        console.error('Failed to send message:', error);
        isFetching = false;
        if (img) img.src = chrome.runtime.getURL('extension/assets/black-rephrase.svg');
        removeGradientColor(textBox);
    } finally {
        textBox.focus();
        if (textBox.tagName === 'INPUT' || textBox.tagName === 'TEXTAREA') {
            const length = textBox.value.length;
            textBox.setSelectionRange(length, length);
        } else if (textBox.isContentEditable) {
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(textBox);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
}

const undoRephraseText = (textBox, img) => {
    isFetching = false;
    isCanceled = true;
    removeGradientColor(textBox);
    if (img) img.src = chrome.runtime.getURL('extension/assets/black-rephrase.svg');
    if (prevActiveElement) {
        if (prevActiveElement.tagName === 'INPUT' || prevActiveElement.tagName === 'TEXTAREA') {
            prevActiveElement.value = originalText;
        } else if (prevActiveElement.isContentEditable) {
            prevActiveElement.innerText = originalText;
        }
    }
}

const addButtonToTextBox = (textBox) => {

    // Check if the input box is too small
    const rect = textBox.getBoundingClientRect();
    const minWidth = 500; 
    const minHeight = 40; 

    if (rect.width < minWidth && rect.height < minHeight) {
        return;
    }

    if (rephraseButton) {
        rephraseButton.remove();
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('rephrase-button-container');

    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('extension/assets/black-rephrase.svg');
    img.alt = 'Rephrase';
    img.style.width = '20px';
    img.style.height = '20px';
    img.style.objectFit = 'contain';

    buttonContainer.appendChild(img);

    const containerHeight = img.style.height;
    const containerWidth = img.style.width;

    buttonContainer.style.left = `${rect.right - parseInt(containerWidth) - 18 + window.scrollX}px`;
    buttonContainer.style.top = `${rect.bottom - parseInt(containerHeight) - 20 + window.scrollY}px`;

    document.body.appendChild(buttonContainer);

    rephraseButton = buttonContainer;

    buttonContainer.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isFetching) {
            // If fetching, stop the process and revert to original text
            undoRephraseText(textBox, img);
        } else {
            // Start rephrasing process
            rephraseText(textBox, img);
        }
    });

    // Observe changes to the DOM to detect when the text box is removed or hidden
    const observer = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                if (!document.body.contains(textBox) || textBox.offsetParent === null) {
                    buttonContainer.remove();
                    observer.disconnect();
                }
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
};

document.addEventListener('focusin', (event) => {
    const activeElement = event.target;

    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable) {

        if (showRephraseButton) {
            if (pillContainer) pillContainer.remove();
            addButtonToTextBox(activeElement);
        }
        else
            createPillContainer(activeElement);

        showRephraseButton = true;

        if (prevActiveElement) {
            removeGradientColor(prevActiveElement);
        }
        prevActiveElement = activeElement;
    }
});