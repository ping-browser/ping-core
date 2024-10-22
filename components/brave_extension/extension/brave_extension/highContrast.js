const styleElement = document.createElement('style');
document.head.appendChild(styleElement);

let contrastEnabled = false;

// Function to apply contrast mode
const applyContrast = () => {
    let css = '';
    contrastEnabled ?
    css =
        `
            html {
                filter: contrast(150%) brightness(120%) !important;
                background: #12182B !important;
                color: #fff
            }
            body{ background: #12182B !important;}
            header, footer, input, textarea, select, button, main, nav, ul {
                color: #BFBFBF !important;
                background: #12182B !important;
                border: 1px solid #BFBFBF !important;
            }
            span, div li, a, h2, p {
                color: #fff !important;
                background: #12182B !important;
            }
            input[type="submit"], input[type="button"], button {
                background: #4a4a4a !important;
                color: #BFBFBF !important;
                border: 1px solid #BFBFBF !important;
            }
            a {
                color: #8ab4f8 !important;
            }
            img, img:not([src=""]), img:not([src="data:,"]) {
                background: none !important;
                filter: contrast(150%) brightness(120%) !important;
            }
            img[src=""], img[src="data:,"] {
                opacity: 0 !important;
            }
            /* Target common image container elements */
            div:has(> img), figure, picture {
                background: none !important;
            }
        ` : css = ''
        styleElement.textContent = css;
}

const toggleContrast = () => {
    contrastEnabled = !contrastEnabled;
    applyContrast();
    chrome.storage.sync.set({contrastEnabled: contrastEnabled});
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleContrast") {
        toggleContrast();
    }
});

chrome.storage.sync.get('contrastEnabled', (data) => {
    if (data.contrastEnabled) {
        contrastEnabled = true;
        applyContrast();
    }
});