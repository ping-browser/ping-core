let prevActiveElement = null;
let originalText = '';
let rephrasedText = '';
let rephraseButton = null;
let isFetching = false;
let abortController = null;
let pillContainer = null;
let showRephraseButton = true;
let isCanceled = false;
let hasRephrasedBefore = false; 

const isDarkBackground = (color) => {
    const rgb = color.match(/\d+/g);
    if (rgb) {
        const [r, g, b] = rgb.map(Number);
        return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
    }
    return false;
};

const getIconColor = (textBox) => {
    const bgColor = window.getComputedStyle(textBox).backgroundColor;
    return isDarkBackground(bgColor) ? 'dark' : 'light';
};

const applyGradientAnimation = (textBox) => {
    const gradient = 'linear-gradient(270deg, #F100C1, #00CED1, #F100C1)';
    const animation = 'gradientAnimation 5s ease infinite';

    textBox.style.backgroundImage = gradient;
    textBox.style.backgroundSize = '200% 200%';
    textBox.style.animation = animation;
    textBox.style.WebkitBackgroundClip = 'text';
    textBox.style.WebkitTextFillColor = 'transparent';
}

const removeGradientColor = (textBox) => {
    textBox.style.backgroundImage = 'none';
    textBox.style.animation = 'none';
    textBox.style.WebkitBackgroundClip = 'initial';
    textBox.style.WebkitTextFillColor = 'initial';
}

const createPillContainer = (textBox, img) => {
    if (pillContainer) {
        pillContainer.remove();
    }

    const iconColor = getIconColor(textBox);
    const pillBgColor = iconColor === 'light' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = iconColor === 'light' ? 'black' : 'white';

    pillContainer = document.createElement('div');
    pillContainer.classList.add('pill-container');
    pillContainer.style.backgroundColor = pillBgColor;
    if (iconColor === 'light') {
        pillContainer.classList.remove('pill-dark-shadow')
        pillContainer.classList.add('pill-light-shadow')
    }
    else {
        pillContainer.classList.remove('pill-light-shadow');
        pillContainer.classList.add('pill-dark-shadow');
    }

    const leftImg = document.createElement('div');
    leftImg.classList.add('pill-img-container');
    const leftImgIcon = document.createElement('img');
    leftImgIcon.src = chrome.runtime.getURL(`extension/assets/back-${iconColor}.svg`);
    leftImgIcon.alt = 'Back';
    leftImgIcon.classList.add('icon');
    leftImg.appendChild(leftImgIcon);

    const leftTooltip = document.createElement('span');
    leftTooltip.textContent = 'Back';
    leftTooltip.classList.add('tooltip', 'left-tooltip', `tooltip-hover-${iconColor}`);
    leftImg.appendChild(leftTooltip);
    pillContainer.appendChild(leftImg);

    const separator = document.createElement('span');
    separator.textContent = '|';
    separator.style.color = iconColor === 'light' ? 'black' : 'white';
    separator.classList.add('separator');
    pillContainer.appendChild(separator);

    const rightImg = document.createElement('div');
    rightImg.classList.add('pill-img-container');
    const rightImgIcon = document.createElement('img');
    rightImgIcon.src = chrome.runtime.getURL(`extension/assets/rewrite-${iconColor}.svg`);
    rightImgIcon.alt = 'Retry';
    rightImgIcon.classList.add('icon');
    rightImg.appendChild(rightImgIcon);

    const rightTooltip = document.createElement('span');
    rightTooltip.textContent = 'Retry';
    rightTooltip.classList.add('tooltip', 'right-tooltip', `tooltip-hover-${iconColor}`);
    rightImg.appendChild(rightTooltip);
    pillContainer.appendChild(rightImg);

    document.body.appendChild(pillContainer);

    // Adjust position based on scroll offsets
    const rect = textBox.getBoundingClientRect();
    pillContainer.style.left = `${rect.right - pillContainer.offsetWidth - 5 + window.scrollX}px`;
    pillContainer.style.top = `${rect.bottom - pillContainer.offsetHeight + window.scrollY}px`;

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

    pillContainer.addEventListener('mouseleave', (event) => {
        // Check if the mouse is moving back to the rephrase button
        const buttonRect = rephraseButton ? rephraseButton.getBoundingClientRect() : null;
        if (!buttonRect || 
            event.clientX < buttonRect.left || 
            event.clientX > buttonRect.right || 
            event.clientY < buttonRect.top || 
            event.clientY > buttonRect.bottom) {
            pillContainer.remove();
            pillContainer = null;
            if (isFetching && rephraseButton) {
                img.src = chrome.runtime.getURL(`extension/assets/cross-light.svg`);
                rephraseButton.style.display = 'flex';
                rephraseButton.style.justifyContent = 'center';
                rephraseButton.style.alignItems = 'center';
                rephraseButton.onClick = () => {
                    undoRephraseText(textBox, img);
                }
            }
            else if (rephraseButton) {
                rephraseButton.style.display = 'flex';
                rephraseButton.style.justifyContent = 'center';
                rephraseButton.style.alignItems = 'center';
            }
        }
    });
};

const typeText = async (textBox, text, delay = 16) => {
    let index = 0;
    while (index < text.length) {
        if (isCanceled) return;
        if (textBox.tagName === 'INPUT' || textBox.tagName === 'TEXTAREA') {
            text[index] == ' ' ? textBox.value += '\u00A0' : textBox.value += text[index];
        } else if (textBox.isContentEditable) {
            text[index] == ' ' ? textBox.innerText += '\u00A0' : textBox.innerText += text[index];
        }
        index++;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

const rephraseText = async (textBox, img) => {
    originalText = textBox.value || textBox.innerText;
    applyGradientAnimation(textBox);
    if (img) {
        const iconColor = getIconColor(textBox);
        img.src = chrome.runtime.getURL(`extension/assets/cross-light.svg`);
        img.alt = "stop"
        img.style.width = '20px';
        img.style.height = '20px';
        const buttonContainer = img.parentElement;

        if (iconColor === 'light') {
            buttonContainer.classList.remove('dark-shadow')
            buttonContainer.classList.add('light-shadow')
        }
        else {
            buttonContainer.classList.remove('light-shadow');
            buttonContainer.classList.add('dark-shadow');
        }
    }
    isFetching = true;
    isCanceled = false;

    try {
        const response = await chrome.runtime.sendMessage({ action: 'rephrase', text: originalText });

        if (isCanceled) {
            return;
        }

        // Clear the textBox before typing the new text
        if (prevActiveElement.tagName === 'INPUT' || prevActiveElement.tagName === 'TEXTAREA') {
            prevActiveElement.value = '';
        } else if (prevActiveElement.isContentEditable) {
            prevActiveElement.innerText = '';
        }

        removeGradientColor(textBox);
        // Type the rephrased text with a smooth effect
        await typeText(prevActiveElement, response.rephrase);

        isFetching = false;
        removeGradientColor(prevActiveElement);

        if (rephraseButton) {
            rephraseButton.remove();
            rephraseButton = null;
        }
        showRephraseButton = false;
        hasRephrasedBefore = true;

        // Show pill for 3 seconds
        createPillContainer(prevActiveElement, img);
        setTimeout(() => {
            if (pillContainer) {
                pillContainer.remove();
                pillContainer = null;
            }
            showRephraseButton = true;
            addButtonToTextBox(prevActiveElement);
        }, 2000);
    } catch (error) {
        console.error('Failed to send message:', error);
        isFetching = false;
        if (img) {
            const iconColor = getIconColor(textBox);
            img.src = chrome.runtime.getURL(`extension/assets/rephrase-${iconColor}.svg`);
        }
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
    if (img) {
        const iconColor = getIconColor(textBox);
        img.src = chrome.runtime.getURL(`extension/assets/rephrase-${iconColor}.svg`);
    }
    if (prevActiveElement) {
        if (prevActiveElement.tagName === 'INPUT' || prevActiveElement.tagName === 'TEXTAREA') {
            prevActiveElement.value = originalText;
        } else if (prevActiveElement.isContentEditable) {
            prevActiveElement.innerText = originalText;
        }
    }
}

const shouldShowRephraseButton = (text) => {
    const words = text.trim().split(/\s+/);
    return words.length >= 10;
};

const addButtonToTextBox = (textBox) => {

    // Check if the input box is too small
    const rect = textBox.getBoundingClientRect();
    const minWidth = 600;
    const minHeight = 50;

    if (rect.width < minWidth && rect.height < minHeight) {
        return;
    }

    const text = textBox.value || textBox.innerText;
    if (!shouldShowRephraseButton(text)) {
        if (rephraseButton) {
            rephraseButton.remove();
            rephraseButton = null;
        }
        return;
    }
    if (rephraseButton) {
        rephraseButton.remove();
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('rephrase-button-container');
    const iconColor = getIconColor(textBox);
    if (iconColor === 'light') {
        buttonContainer.classList.remove('dark-shadow')
        buttonContainer.classList.add('light-shadow')
    }
    else {
        buttonContainer.classList.remove('light-shadow');
        buttonContainer.classList.add('dark-shadow');
    }
    const img = document.createElement('img');
    img.src = chrome.runtime.getURL(`extension/assets/rephrase-${iconColor}.svg`);
    img.alt = 'Rephrase';
    img.style.width = '17px';
    img.style.height = '17px';
    img.style.objectFit = 'contain';

    buttonContainer.appendChild(img);

    const showPill = () => {
        if (hasRephrasedBefore) {
            buttonContainer.style.display = 'none';
            createPillContainer(textBox, img);
        }
    };

    const hidePill = () => {
        if (pillContainer) {
            pillContainer.remove();
            pillContainer = null;
        }
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.alignItems = 'center';
    };

    buttonContainer.addEventListener('mouseenter', () => {
        if (!isFetching) {
            if (hasRephrasedBefore) {
                showPill();
            } else {
                img.src = chrome.runtime.getURL(`extension/assets/rephrase-${iconColor}-hover.svg`);
            }
        }
    });

    buttonContainer.addEventListener('mouseleave', (event) => {
        if (!isFetching) {
            if (hasRephrasedBefore) {
                // Check if the mouse is moving to the pill
                const pillRect = pillContainer ? pillContainer.getBoundingClientRect() : null;
                if (!pillRect || 
                    event.clientX < pillRect.left || 
                    event.clientX > pillRect.right || 
                    event.clientY < pillRect.top || 
                    event.clientY > pillRect.bottom) {
                    hidePill();
                }
            } else {
                img.src = chrome.runtime.getURL(`extension/assets/rephrase-${iconColor}.svg`);
            }
        }
    });

    const containerHeight = img.style.height;
    const containerWidth = img.style.width;

    buttonContainer.style.left = `${rect.right - parseInt(containerWidth) - 30 + window.scrollX}px`;
    buttonContainer.style.top = `${rect.bottom - parseInt(containerHeight) - 10 + window.scrollY}px`;

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

document.addEventListener('input', (event) => {
    const activeElement = event.target;
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable) {
        addButtonToTextBox(activeElement);
    }
});