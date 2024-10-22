export const highContrast = () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs:any) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: "toggleContrast"});
  });
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-contrast") {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs:any) => {
          console.log("msg from bg")
          chrome.tabs.sendMessage(tabs[0].id, {action: "toggleContrast"});
      });
  }
});