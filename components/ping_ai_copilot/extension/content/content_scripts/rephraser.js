const TextRephraser = (() => {

    const state = {
        currActiveElement: null,
        prevActiveElement: null,
        originalText: '',
        rephrasedText: '',
        rephraseButton: null,
        isFetching: false,
        abortController: null,
        pillContainer: null,
        showRephraseButton: true,
        isCanceled: false,
        hasRephrasedBefore: false
    };

    // Constants
    const MIN_WORDS = 10;
    const MIN_WIDTH = 600;
    const MIN_HEIGHT = 50;
    const PILL_TIMEOUT = 800;

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

    const getAssetUrl = (name, color, hover = false) => {
        const hoverSuffix = hover ? '-hover' : '';
        return chrome.runtime.getURL(`extension/assets/${name}-${color}${hoverSuffix}.svg`);
    };

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    // Text styling functions
    const applyGradientAnimation = (textBox) => {
        const gradient = 'linear-gradient(270deg, #F100C1, #00CED1, #F100C1)';
        Object.assign(textBox.style, {
            backgroundImage: gradient,
            backgroundSize: '200% 200%',
            animation: 'gradientAnimation 5s ease infinite',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        });
    };

    const removeGradientColor = (textBox) => {
        Object.assign(textBox.style, {
            backgroundImage: 'none',
            animation: 'none',
            WebkitBackgroundClip: 'initial',
            WebkitTextFillColor: 'initial'
        });
    };

    // Text manipulation functions
    const typeText = async (textBox, text, delay = 16) => {
        let displayText = '';
        let currentWordBuffer = '';

        for (let i = 0; i < text.length && !state.isCanceled; i++) {
            const char = text[i];
            currentWordBuffer += char;
            if (char === ' ' || i === text.length - 1) {
                displayText += currentWordBuffer;
                currentWordBuffer = '';
            }
            if (textBox.tagName === 'INPUT' || textBox.tagName === 'TEXTAREA') {
                textBox.value = displayText + currentWordBuffer;
            } else if (textBox.isContentEditable) {
                textBox.innerText = displayText + currentWordBuffer;
            }
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    };

    const shouldShowRephraseButton = (text) => {
        const words = text.trim().split(/\s+/);
        return words.length >= MIN_WORDS;
    };

    // UI Component Creation
    const createPillContainer = (textBox, img) => {
        if (state.pillContainer) {
            state.pillContainer.remove();
        }

        const iconColor = getIconColor(textBox);
        const pillBgColor = iconColor === 'light' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        const container = document.createElement('div');
        container.classList.add('pill-container');
        container.style.backgroundColor = pillBgColor;
        container.classList.add(`pill-${iconColor}-shadow`);

        const leftButton = createPillButton('back', iconColor, 'Back', () => {
            if (state.prevActiveElement) {
                undoRephraseText(textBox, img);
            }
        });

        const separator = document.createElement('span');
        separator.textContent = '|';
        separator.style.color = iconColor === 'light' ? 'black' : 'white';
        separator.classList.add('separator');

        const rightButton = createPillButton('rewrite', iconColor, 'Retry', () => {
            if (state.prevActiveElement) {
                if (state.pillContainer) {
                    state.pillContainer.remove();
                    state.pillContainer = null;
                }
                
                if (state.rephraseButton) {
                    state.rephraseButton.style.display = 'flex';
                    updateButtonForFetching(textBox, img);
                }
                
                rephraseText(textBox, img);
            }
        });

        container.append(leftButton, separator, rightButton);
        document.body.appendChild(container);

        let rect;
        if(textBox.parentElement.querySelectorAll(':scope > div').length === 1) rect = textBox.parentElement.getBoundingClientRect();
        else rect = textBox.getBoundingClientRect();
        Object.assign(container.style, {
            left: `${rect.right - container.offsetWidth - 5 + window.scrollX}px`,
            top: `${rect.bottom - container.offsetHeight + window.scrollY}px`
        });

        state.pillContainer = container;
        setupPillContainerEvents(container, textBox, img);
    };

    const createPillButton = (iconName, iconColor, tooltipText, onClick) => {
        const button = document.createElement('div');
        button.classList.add('pill-img-container');

        const icon = document.createElement('img');
        icon.src = getAssetUrl(iconName, iconColor);
        icon.alt = tooltipText;
        icon.classList.add('icon');

        const tooltip = document.createElement('span');
        tooltip.textContent = tooltipText;
        tooltip.classList.add('tooltip', `${tooltipText.toLowerCase()}-tooltip`, `tooltip-hover-${iconColor}`);

        button.append(icon, tooltip);
        button.addEventListener('click', onClick);

        return button;
    };

    const setupPillContainerEvents = (container, textBox, img) => {
        container.addEventListener('mouseleave', (event) => {
            const buttonRect = state.rephraseButton?.getBoundingClientRect();
            if (!buttonRect ||
                event.clientX < buttonRect.left ||
                event.clientX > buttonRect.right ||
                event.clientY < buttonRect.top ||
                event.clientY > buttonRect.bottom) {
                container.remove();
                state.pillContainer = null;

                if (state.rephraseButton) {
                    state.rephraseButton.style.display = 'flex';
                    if (state.isFetching) {
                        img.src = getAssetUrl('cross', 'light');
                        state.rephraseButton.onClick = () => undoRephraseText(textBox, img);
                    }
                }
            }
        });
    };

    const rephraseText = async (textBox, img) => {
        state.originalText = textBox.value || textBox.innerText;
        state.isFetching = true;
        state.isCanceled = false;
        applyGradientAnimation(textBox);

        if (img) {
            updateButtonForFetching(textBox, img);
        }

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'rephrase',
                text: state.originalText
            });

            if (!state.isCanceled) {
                await handleSuccessfulRephrase(textBox, response.rephrase, img);
            }
        } catch (error) {
            console.error('Rephrase failed:', error);
            handleRephraseFailed(textBox, img);
        } finally {
            focusTextBox(textBox);
        }
    };

    const handleSuccessfulRephrase = async (textBox, rephrasedText, img) => {
        clearTextBox(state.prevActiveElement);
        removeGradientColor(textBox);
        await typeText(state.prevActiveElement, rephrasedText);

        state.isFetching = false;
        removeGradientColor(state.prevActiveElement);

        if (state.rephraseButton) {
            state.rephraseButton.remove();
            state.rephraseButton = null;
        }

        state.showRephraseButton = false;
        state.hasRephrasedBefore = true;

        createPillContainer(state.prevActiveElement, img);
        setTimeout(() => {
            if (state.pillContainer) {
                state.pillContainer.remove();
                state.pillContainer = null;
            }
            state.showRephraseButton = true;
            addButtonToTextBox(state.prevActiveElement);
        }, PILL_TIMEOUT);
    };

    const handleRephraseFailed = (textBox, img) => {
        state.isFetching = false;
        if (img) {
            img.src = getAssetUrl('rephrase', getIconColor(textBox));
        }
        removeGradientColor(textBox);
    };

    const undoRephraseText = (textBox, img) => {
        state.isFetching = false;
        state.isCanceled = true;
        removeGradientColor(textBox);

        const iconColor = getIconColor(textBox);
        img.src = getAssetUrl('rephrase', iconColor);
        img.alt = 'Rephrase';
        img.dataset.currentIcon = 'rephrase';
        Object.assign(img.style, {
            width: '17px',
            height: '17px'
        });

        if (state.prevActiveElement) {
            if (state.prevActiveElement.tagName === 'INPUT' || state.prevActiveElement.tagName === 'TEXTAREA') {
                state.prevActiveElement.value = state.originalText;
            } else if (state.prevActiveElement.isContentEditable) {
                state.prevActiveElement.innerText = state.originalText;
            }
        }
    };

    const addButtonToTextBox = (textBox) => {
        if (state.rephraseButton && textBox === state.prevActiveElement && shouldShowRephraseButton(textBox.value || textBox.textContent)) return;
        const rect = textBox.getBoundingClientRect();
        if (rect.width < MIN_WIDTH && rect.height < MIN_HEIGHT) {
            return;
        }
        textBox.setAttribute('spellcheck', 'false');
        let text = textBox.value || textBox.textContent;
        if (!shouldShowRephraseButton(text)) {
            if (state.rephraseButton) {
                state.rephraseButton.remove();
                state.rephraseButton = null;
            }
            return;
        }

        if (!state.rephraseButton) {
            createRephraseButton(textBox);
        } else {
            requestAnimationFrame(() => {
                positionButton(state.rephraseButton, textBox, state.rephraseButton.querySelector('img'));
            });
        }
    };
    const debouncedAddButtonToTextBox = debounce(addButtonToTextBox, 200);

    const createRephraseButton = (textBox) => {
        if (state.rephraseButton) {
            state.rephraseButton.remove();
        }

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('rephrase-button-container');

        const iconColor = getIconColor(textBox);
        buttonContainer.classList.add(`${iconColor}-shadow`);

        const img = createButtonImage(iconColor);
        buttonContainer.appendChild(img);

        positionButton(buttonContainer, textBox, img);
        setupButtonEvents(buttonContainer, textBox, img, iconColor);

        document.body.appendChild(buttonContainer);
        state.rephraseButton = buttonContainer;
    };

    const createButtonImage = (iconColor) => {
        const img = document.createElement('img');
        img.src = getAssetUrl('rephrase', iconColor);
        img.alt = 'Rephrase';
        img.dataset.currentIcon = 'rephrase'; 
        Object.assign(img.style, {
            width: '17px',
            height: '17px',
            objectFit: 'contain'
        });
        return img;
    };

    const positionButton = (buttonContainer, textBox, img) => {
        const containerHeight = img.style?.height || '17px';
        const containerWidth = img.style?.width || '17px';
        
        let rect = textBox.getBoundingClientRect();
        if (textBox.parentElement.querySelectorAll(':scope > div').length === 1 && textBox.style.resize !== 'none') {
            rect = textBox.parentElement.getBoundingClientRect();
        }
    
        buttonContainer.style.position = 'absolute';
        buttonContainer.style.left = `${rect.right - parseInt(containerWidth) - 30 + window.scrollX}px`;
        buttonContainer.style.top = `${rect.bottom - parseInt(containerHeight) - 10 + window.scrollY}px`;
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.alignItems = 'center';
    };

    const setupButtonEvents = (buttonContainer, textBox, img, iconColor) => {
        buttonContainer.addEventListener('mouseenter', () => {
            if (!state.isFetching) {
                if (state.hasRephrasedBefore) {
                    showPill(buttonContainer, textBox, img);
                } else {
                    if (img.dataset.currentIcon === 'rephrase') {
                        img.src = getAssetUrl('rephrase', iconColor, true);
                    }
                }
            }
        });

        buttonContainer.addEventListener('mouseleave', (event) => {
            if (!state.isFetching) {
                if (state.hasRephrasedBefore) {
                    handlePillMouseLeave(event, buttonContainer);
                } else {
                    if (img.dataset.currentIcon === 'rephrase') {
                        img.src = getAssetUrl('rephrase', iconColor);
                    }
                }
            }
        });

        buttonContainer.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (state.isFetching) {
                undoRephraseText(state.currActiveElement, img);
            } else {
                rephraseText(state.currActiveElement, img);
            }
        });
    };

    const showPill = (buttonContainer, textBox, img) => {
        buttonContainer.style.display = 'none';
        createPillContainer(textBox, img);
    };

    const handlePillMouseLeave = (event, buttonContainer) => {
        const pillRect = state.pillContainer ? state.pillContainer.getBoundingClientRect() : null;
        if (!pillRect ||
            event.clientX < pillRect.left ||
            event.clientX > pillRect.right ||
            event.clientY < pillRect.top ||
            event.clientY > pillRect.bottom) {
            hidePill(buttonContainer);
        }
    };

    const hidePill = (buttonContainer) => {
        if (state.pillContainer) {
            state.pillContainer.remove();
            state.pillContainer = null;
        }
        buttonContainer.style.display = 'flex';
    };

    const handleTextBoxFocus = (activeElement) => {
        if (state.showRephraseButton) {
            if (state.pillContainer) {
                state.pillContainer.remove();
            }
            addButtonToTextBox(activeElement);
        } else {
            createPillContainer(activeElement);
        }

        state.showRephraseButton = true;

        if (state.prevActiveElement) {
            removeGradientColor(state.prevActiveElement);
        }
        state.prevActiveElement = activeElement;
    };

    const updateButtonForFetching = (textBox, img) => {
        img.src = getAssetUrl('cross', 'light');
        img.alt = 'stop';
        img.dataset.currentIcon = 'cross';
        Object.assign(img.style, {
            width: '20px',
            height: '20px'
        });

        const buttonContainer = img.parentElement;
        const iconColor = getIconColor(textBox);
        buttonContainer.classList.remove('dark-shadow', 'light-shadow');
        buttonContainer.classList.add(`${iconColor}-shadow`);
    };

    const clearTextBox = (element) => {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = '';
        } else if (element.isContentEditable) {
            element.innerText = '';
        }
    };

    const focusTextBox = (textBox) => {
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
    };

    const isValidTextBox = (element) => {
        return element?.tagName === 'INPUT' ||
            element?.tagName === 'TEXTAREA' ||
            element?.isContentEditable;
    };

    const TextBoxAvalCheck = (textBox) => {
        if (state.checkInterval) {
            clearInterval(state.checkInterval);
        }

        state.checkInterval = setInterval(() => {
            if (textBox && state.rephraseButton) {
                const isVisible = textBox.offsetParent !== null;
                const isInDOM = document.body.contains(textBox);

                if (!isVisible || !isInDOM) {
                    if (state.rephraseButton) {
                        state.rephraseButton.remove();
                        state.rephraseButton = null;
                    }
                }
            }
        }, 200);
    };

    // Event handlers
    const focusinHandler = (event) => {
        state.currActiveElement = event.target;
        if (isValidTextBox(state.currActiveElement)) {
            handleTextBoxFocus(state.currActiveElement);
        }
        TextBoxAvalCheck(state.currActiveElement);
    };

    const inputHandler = debounce((event) => {
        const activeElement = event.target;
        if (isValidTextBox(activeElement)) {
            debouncedAddButtonToTextBox(activeElement);
        }
    }, 100);

    const pasteHandler = (event) => {
        if (isValidTextBox(document.activeElement)) {
            setTimeout(() => {
                debouncedAddButtonToTextBox(document.activeElement);
            }, 0);
        }
    };

    const handleTextChange = debounce((event) => {
        if (event.type === 'keydown') {
            const textBox = event.target;
            const text = textBox.value || textBox.textContent;
            const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
            if (wordCount < 10) {
                debouncedAddButtonToTextBox(textBox);
            }
        }
    }, 100);

    const initialize = () => {
        document.addEventListener('focusin', focusinHandler);
        document.addEventListener('input', inputHandler);
        document.addEventListener('paste', pasteHandler);
        document.addEventListener('keydown', handleTextChange);
        document.addEventListener('cut', handleTextChange);
    };

    return {
        initialize,
    };
})();

TextRephraser.initialize();