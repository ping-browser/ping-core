import { signDocument } from './docSigner'
import { highContrast } from './highContrastBg'

// parent menu
chrome.contextMenus.create({
    title: 'Ping',
    id: 'ping',
    contexts: ['all']
  })
  chrome.contextMenus.create({
    title: 'Sign PDF',
    id: 'documentSigner',
    parentId: 'ping',
    contexts: ['all']
  })
  
  chrome.contextMenus.create({
    title: 'High contrast mode',
    id: 'highContrast',
    parentId: 'ping',
    contexts: ['all']
  })
  
  chrome.contextMenus.onClicked.addListener((info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => {
    onContextMenuClicked(info, tab)
  })
  
  export function onContextMenuClicked (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) {
    switch (info.menuItemId) {
      case 'documentSigner':
        signDocument();
        break
      case 'highContrast':
        highContrast();
        break
      default: {
        console.warn(`[contextMenu] invalid context menu option: ${info.menuItemId}`)
      }
    }
  }