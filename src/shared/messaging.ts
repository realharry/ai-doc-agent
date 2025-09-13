// Types for messaging between different parts of the extension
export interface Message {
  action: string
  data?: any
}

export interface MessageResponse {
  success: boolean
  message?: string
  error?: string
  data?: any
}

// Send message to content script with proper injection and error handling
export async function sendMessageToContentScript(message: Message): Promise<MessageResponse> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) {
      throw new Error('No active tab found')
    }

    // Check if tab is ready
    if (tab.status !== 'complete') {
      throw new Error('Page is still loading. Please wait for the page to fully load.')
    }

    // Check for restricted pages that don't allow content scripts
    if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://') || 
        tab.url?.startsWith('moz-extension://') || tab.url?.startsWith('about:')) {
      return {
        success: false,
        error: 'This extension cannot run on system pages. Please navigate to a regular website.'
      }
    }

    // Try to ensure content script is loaded and ready
    const isContentScriptReady = await ensureContentScriptReady(tab.id)
    if (!isContentScriptReady) {
      return {
        success: false,
        error: 'Unable to initialize extension on this page. Please refresh and try again.'
      }
    }

    // Try multiple times with exponential backoff
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const response = await chrome.tabs.sendMessage(tab.id, message)
        return response || { success: false, error: 'No response from content script' }
      } catch (error) {
        console.log(`Message attempt ${attempt}/5 failed:`, error)
        
        if (attempt < 5) {
          // Wait before retrying with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.min(100 * Math.pow(2, attempt - 1), 2000)))
          
          // Try to re-inject content script on retry
          if (attempt === 2) {
            await ensureContentScriptReady(tab.id, true)
          }
        } else {
          // Last attempt failed
          console.error('All message attempts failed:', error)
        }
      }
    }

    // If all retries failed, return a user-friendly error
    return {
      success: false,
      error: 'Unable to connect to the page. The page may not support this extension or needs to be refreshed.'
    }
  } catch (error) {
    console.error('Failed to send message to content script:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to communicate with page'
    }
  }
}

// Ensure content script is ready and properly injected
async function ensureContentScriptReady(tabId: number, forceInject = false): Promise<boolean> {
  try {
    // First check if content script is already loaded
    if (!forceInject) {
      try {
        const [result] = await chrome.scripting.executeScript({
          target: { tabId },
          func: () => typeof (window as any).AI_DOC_AGENT_LOADED !== 'undefined'
        })
        
        if (result?.result === true) {
          console.log('Content script already loaded')
          return true
        }
      } catch (error) {
        console.log('Failed to check content script status:', error)
      }
    }

    // Try to inject content script
    console.log('Injecting content script...')
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    })

    // Wait a moment for content script to initialize
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify content script is ready
    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => typeof (window as any).AI_DOC_AGENT_LOADED !== 'undefined'
      })
      
      const isReady = result?.result === true
      console.log('Content script injection result:', isReady)
      return isReady
    } catch (error) {
      console.error('Failed to verify content script:', error)
      return false
    }
  } catch (error) {
    console.error('Failed to inject content script:', error)
    return false
  }
}

// Send message to background script
export async function sendMessageToBackground(message: Message): Promise<MessageResponse> {
  try {
    const response = await chrome.runtime.sendMessage(message)
    return response || { success: false, error: 'No response from background script' }
  } catch (error) {
    console.error('Failed to send message to background script:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to communicate with background'
    }
  }
}

// Storage utilities
export async function getStorageData(keys: string | string[]): Promise<any> {
  return chrome.storage.local.get(keys)
}

export async function setStorageData(data: Record<string, any>): Promise<void> {
  return chrome.storage.local.set(data)
}

export async function removeStorageData(keys: string | string[]): Promise<void> {
  return chrome.storage.local.remove(keys)
}