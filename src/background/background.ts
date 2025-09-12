// Background script - service worker
console.log('AI Document Agent background script loaded')

// Utility function to send messages with retry logic
async function sendMessageWithRetry(tabId: number, message: any, maxRetries = 3): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // First, check if the tab still exists and is loaded
      const tab = await chrome.tabs.get(tabId)
      if (!tab || tab.status !== 'complete') {
        throw new Error('Tab not ready')
      }

      // Try to inject content script if it's not already there
      if (attempt === 1) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
              // Check if content script is already loaded
              return typeof (window as any).AI_DOC_AGENT_LOADED !== 'undefined'
            }
          })
        } catch (error) {
          // Ignore injection errors, content script might already be loaded
          console.log('Content script check failed, proceeding with message')
        }
      }

      const response = await chrome.tabs.sendMessage(tabId, message)
      return response
    } catch (error) {
      console.log(`Message attempt ${attempt}/${maxRetries} failed:`, error)
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to communicate with content script after ${maxRetries} attempts. The page may not be fully loaded or the content script may not be available.`)
      }
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 200 * attempt))
    }
  }
}

// Context menu items
const contextMenuItems = [
  {
    id: 'summarize',
    title: 'Summarize Page',
    contexts: ['page', 'selection']
  },
  {
    id: 'extract-text',
    title: 'Extract Text',
    contexts: ['page']
  },
  {
    id: 'extract-images',
    title: 'Extract Images',
    contexts: ['page']
  },
  {
    id: 'separator1',
    type: 'separator',
    contexts: ['page']
  },
  {
    id: 'export-pdf',
    title: 'Export as PDF',
    contexts: ['page']
  },
  {
    id: 'export-markdown',
    title: 'Export as Markdown',
    contexts: ['page']
  },
  {
    id: 'separator2',
    type: 'separator',
    contexts: ['page']
  },
  {
    id: 'social-content',
    title: 'Generate Social Content',
    contexts: ['page']
  }
]

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Document Agent installed')
  
  // Create context menus
  contextMenuItems.forEach(item => {
    chrome.contextMenus.create({
      id: item.id,
      title: item.title,
      contexts: item.contexts as chrome.contextMenus.ContextType[],
      type: (item.type as 'normal' | 'separator') || 'normal'
    })
  })

  // Set default options
  chrome.storage.local.set({
    aiProvider: 'openai',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    summaryLength: 'medium',
    autoSave: true,
    showNotifications: true
  })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return

  const action = info.menuItemId as string
  if (contextMenuItems.some(item => item.id === action)) {
    try {
      const response = await sendMessageWithRetry(tab.id, { action })
      if (response?.success) {
        showNotification('Success', response.message || 'Action completed')
      } else {
        showNotification('Error', response?.error || 'Action failed')
      }
    } catch (error) {
      console.error('Context menu action failed:', error)
      showNotification('Error', 'Failed to execute action. Make sure the page is loaded.')
    }
  }
})

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (!tab?.id) return

  let action: string
  switch (command) {
    case '_execute_action':
      // This opens the popup, handled automatically by Chrome
      return
    case 'summarize':
      action = 'summarize'
      break
    case 'extract-text':
      action = 'extract-text'
      break
    default:
      console.log('Unknown command:', command)
      return
  }

  try {
    const response = await sendMessageWithRetry(tab.id, { action })
    if (response?.success) {
      showNotification('Success', response.message || 'Action completed')
    } else {
      showNotification('Error', response?.error || 'Action failed')
    }
  } catch (error) {
    console.error('Keyboard shortcut action failed:', error)
    showNotification('Error', 'Failed to execute action. Make sure the page is loaded.')
  }
})

// Handle messages from popup/content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Background received message:', message)

  if (message.action === 'getSettings') {
    chrome.storage.local.get()
      .then(settings => {
        sendResponse({ success: true, data: settings })
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  if (message.action === 'saveSettings') {
    chrome.storage.local.set(message.data)
      .then(() => {
        sendResponse({ success: true, message: 'Settings saved' })
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }

  // Default response for unknown actions
  sendResponse({ success: false, error: 'Unknown action' })
})

// Utility function to show notifications
function showNotification(title: string, message: string) {
  // Check if user wants notifications
  chrome.storage.local.get('showNotifications')
    .then(result => {
      if (result.showNotifications !== false) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-48.png',
          title: title,
          message: message
        })
      }
    })
    .catch(error => {
      console.error('Failed to show notification:', error)
    })
}

// Handle extension updates
chrome.runtime.onStartup.addListener(() => {
  console.log('AI Document Agent started')
})

// Clean up on extension unload
chrome.runtime.onSuspend.addListener(() => {
  console.log('AI Document Agent suspended')
})