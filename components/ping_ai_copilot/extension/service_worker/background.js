import { translations } from "../constants/constants.js";
const API_ENDPOINT = "https://openai-text-summarizer.azurewebsites.net";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'summarize':
      handleSummarizeMessage(request, sendResponse);
      break;
    case 'rephrase':
      handleRephraseMessage(request, sendResponse);
      break;
    default:
      console.warn('Unknown action:', request.action);
      sendResponse({ error: 'Unknown action' });
  }

  return true;
});

const handleSummarizeMessage = async (request, sendResponse) => {
  try {
    const ln = chrome.i18n.getUILanguage();
    let headerText = 'Text summary';

    const translation = translations.find(t => t.code === ln);
    if (translation) {
      headerText = translation.translation;
    }

    const response = await fetch(`${API_ENDPOINT}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: request.text, lang: ln }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    sendResponse({ success: true, summary: data.summary, headerText: headerText });
  } catch (error) {
    console.error('Summarize error:', error);
    sendResponse({
      success: false,
      error: error.message,
      summary: "An error occurred while summarizing the text"
    });
  }
}

const handleRephraseMessage = async (request, sendResponse) => {
  try {
    const ln = chrome.i18n.getUILanguage();
    const response = await fetch(`${API_ENDPOINT}/rephrase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: request.text, lang: ln }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.rText) {
      throw new Error('Response missing rText property');
    }

    sendResponse({ success: true, rephrase: data.rText });
  } catch (error) {
    console.error('Rephrase error:', error);
    sendResponse({
      success: false,
      error: error.message,
      rephrase: "An error occurred while rephrasing the text"
    });
  }
}