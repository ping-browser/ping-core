import { translations } from "../constants/constants.js";
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    (async () => {
      try {
        let ln = chrome.i18n.getUILanguage();
        let headerText = 'Text summary';  
        const translation = translations.find(t => t.code === ln);
        if (translation) {
          headerText = translation.translation;
        }
        const response = await fetch('https://openai-text-summarizer.azurewebsites.net/summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: request.text, lang: ln }),
        });

        const data = await response.json();
        chrome.tabs.sendMessage(sender.tab.id, { action: 'displaySummary', summary: data.summary, headerText: headerText }, response => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          }
        });
      } catch (error) {
        chrome.tabs.sendMessage(sender.tab.id, { action: 'displaySummary', summary: 'An error occurred while summarizing the text' }, response => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          }
        });
      }
    })();
    return true; // Indicates that the response will be sent asynchronously
  }
  if (request.action === 'rephrase') {
    (async () => {
      try {
        let ln = chrome.i18n.getUILanguage();
        const response = await fetch('https://openai-text-summarizer.azurewebsites.net/rephrase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: request.text, lang: ln }),
        });

        const data = await response.json();
        sendResponse({ rephrase: data.rText })
      } catch (error) {
        sendResponse({ rephrase: "An error occurred while rephrasing the text" })
      }
    })();
    return true;
  }
});