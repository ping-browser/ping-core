//@ts-nocheck
chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-contrast") {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs:any) => {
            console.log("msg from bg")
            chrome.tabs.sendMessage(tabs[0].id, {action: "toggleContrast"});
        });
    }
});

let ttsQueue = [];
let isSpeaking = false;

const processQueue = () => {
  if (isSpeaking || ttsQueue.length === 0) return;
  
  const { text, sender } = ttsQueue.shift();
  isSpeaking = true;
  let ln = chrome.i18n.getUILanguage();
  chrome.tts.speak(text, {
    lang: ln,
    onEvent: (event) => {
      if (event.type === 'end' || event.type === 'interrupted' || event.type === 'cancelled') {
        isSpeaking = false;
        if (sender) {
          chrome.tabs.sendMessage(sender.tab.id, { action: "ttsStatus", status: event.type });
        }
        processQueue();
      }
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "speak") {
    const chunks = splitText(request.text, 200); // Adjust the chunk size as needed
    chunks.forEach(chunk => {
      ttsQueue.push({ text: chunk, sender: sender });
    });
    processQueue();
    sendResponse({ status: "queued" });
    return true;  // Keeps the message channel open for asynchronous response
  } else if (request.action === "stop") {
    chrome.tts.stop();
    ttsQueue = [];
    isSpeaking = false;
    sendResponse({ status: "stopped" });
  }
});

// Utility function to split text into chunks
const splitText = (text, maxLength) => {
  const words = text.split(' ');
  const chunks = [];
  let chunk = '';
  
  words.forEach(word => {
    if (chunk.length + word.length + 1 <= maxLength) {
      chunk += (chunk.length ? ' ' : '') + word;
    } else {
      chunks.push(chunk);
      chunk = word;
    }
  });
  
  if (chunk.length) {
    chunks.push(chunk);
  }
  
  return chunks;
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-screen-reader") {
    chrome.storage.sync.get('isActive', (data) => {
      const newState = !data.isActive;
      chrome.storage.sync.set({ isActive: newState }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs:any) =>{
          chrome.tabs.sendMessage(tabs[0].id, { action: "toggle", state: newState });
        });
      });
    });
  }
  else if (command === "toggle-contrast") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs:any) => {
        console.log("msg from bg")
        chrome.tabs.sendMessage(tabs[0].id, {action: "toggleContrast"});
    });
}
});