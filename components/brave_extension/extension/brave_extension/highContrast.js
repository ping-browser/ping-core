document.addEventListener('DOMContentLoaded', () => {
    highContrast();
  });
  
  const highContrast = () => {
    const styleElement = document.createElement('style');
    // console.log('DOM fully loaded and parsed');
    // console.log(document.head, document);
    document.head.appendChild(styleElement);
  
    const isGoogleSearchPage = () => {
      return window.location.hostname === 'www.google.com' && window.location.pathname === '/search';
    };
  
    let contrastEnabled = false;
  
    // Function to apply contrast mode
    const applyContrast = () => {
      let css = '';
      // console.log("applyContrast called, contrastEnabled:", contrastEnabled);
      if (contrastEnabled) {
        css = `
          html {
            filter: contrast(150%) brightness(120%) !important;
            background: #12182B !important;
            color: #fff
          }
          input, textarea, select, button, main, nav, ul {
            color: #BFBFBF !important;
            background: #12182B !important;
            border: 1px solid #BFBFBF !important;
          }
          span, li, a, h2, p {
            color: #fff !important;
            background: #12182B !important;
          }
          ${isGoogleSearchPage() ? '' : `
          div {
            color: #fff !important;
            background: #12182B !important;
          }`}
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
          img[src=""], img[src="data:,"]) {
            opacity: 0 !important;
          }
          /* Target common image container elements */
          div:has(> img), figure, picture {
            background: none !important;
          }
        `;
      }
      // Apply the CSS
      styleElement.textContent = css;
    };
  
    const toggleContrast = () => {
      // console.log("toggleContrast called, contrastEnabled (before toggle):", contrastEnabled);
      contrastEnabled = !contrastEnabled;
      // console.log("contrastEnabled (after toggle):", contrastEnabled);
      applyContrast();
      chrome.storage.sync.set({ contrastEnabled: contrastEnabled });
    };
    //@ts-ignore
    const toggleContrastListener = (request, sender, sendResponse) => {
      // console.log("Message received:", request);
      if (request.action === "toggleContrast") {
        // console.log("toggleContrast action received");
        toggleContrast();
      }
    };
  
    // Ensure any existing listener is removed
    chrome.runtime.onMessage.removeListener(toggleContrastListener);
  
    // Add the new listener
    chrome.runtime.onMessage.addListener(toggleContrastListener);
  
    chrome.storage.sync.get('contrastEnabled', (data) => {
      // console.log("Initial storage fetch, data:", data);
      if (data.contrastEnabled) {
        contrastEnabled = true;
        applyContrast();
      }
    });
  }