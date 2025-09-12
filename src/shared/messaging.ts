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

// Send message to content script
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

    // Try multiple times with exponential backoff
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await chrome.tabs.sendMessage(tab.id, message)
        return response || { success: false, error: 'No response from content script' }
      } catch (error) {
        console.log(`Message attempt ${attempt}/3 failed:`, error)
        
        if (attempt < 3) {
          // Wait before retrying (100ms, then 300ms)
          await new Promise(resolve => setTimeout(resolve, 100 * attempt * attempt))
        } else {
          // Last attempt failed, will fall through to error handling
          console.error('All message attempts failed:', error)
        }
      }
    }

    // If all retries failed, return a user-friendly error
    return {
      success: false,
      error: 'Unable to connect to the page. Please refresh the page and try again.'
    }
  } catch (error) {
    console.error('Failed to send message to content script:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to communicate with page'
    }
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