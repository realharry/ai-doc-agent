import { Message, MessageResponse } from '../shared/messaging'

// Content script - runs on all web pages
console.log('AI Document Agent content script loaded')

// Document processing functions
class DocumentProcessor {
  
  async summarizeDocument(): Promise<MessageResponse> {
    try {
      const text = this.extractMainText()
      if (!text || text.length < 100) {
        return { success: false, error: 'No sufficient text found to summarize' }
      }

      // For now, return a simple summary. In production, this would call an AI API
      const summary = `Document Summary:\n\nThis page contains approximately ${text.length} characters of text. The main content appears to be about "${document.title}".`
      
      // Copy to clipboard
      await navigator.clipboard.writeText(summary)
      
      return { 
        success: true, 
        message: 'Summary copied to clipboard!',
        data: { summary, wordCount: text.split(/\s+/).length }
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to summarize: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }

  async extractText(): Promise<MessageResponse> {
    try {
      const text = this.extractMainText()
      if (!text) {
        return { success: false, error: 'No text content found on this page' }
      }

      await navigator.clipboard.writeText(text)
      
      return { 
        success: true, 
        message: `Text extracted! ${text.length} characters copied to clipboard.`,
        data: { text, length: text.length, wordCount: text.split(/\s+/).length }
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }

  async extractImages(): Promise<MessageResponse> {
    try {
      const images = Array.from(document.querySelectorAll('img'))
        .map(img => ({
          src: img.src,
          alt: img.alt || '',
          width: img.naturalWidth,
          height: img.naturalHeight
        }))
        .filter(img => img.src && !img.src.startsWith('data:') && img.width > 50 && img.height > 50)

      if (images.length === 0) {
        return { success: false, error: 'No images found on this page' }
      }

      // Create download links for images
      const imagesList = images.map((img, index) => 
        `${index + 1}. ${img.alt || 'Image'} (${img.width}x${img.height})\n   ${img.src}`
      ).join('\n\n')

      await navigator.clipboard.writeText(imagesList)

      return { 
        success: true, 
        message: `Found ${images.length} images! URLs copied to clipboard.`,
        data: { images, count: images.length }
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to extract images: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }

  async exportToPDF(): Promise<MessageResponse> {
    try {
      // Trigger browser's print dialog which can save as PDF
      window.print()
      
      return { 
        success: true, 
        message: 'Print dialog opened. You can save as PDF from there.',
        data: { action: 'print_triggered' }
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }

  async exportToMarkdown(): Promise<MessageResponse> {
    try {
      const markdown = this.convertToMarkdown()
      
      // Create downloadable file
      const blob = new Blob([markdown], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${document.title.replace(/[^\w\s-]/g, '').trim()}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      return { 
        success: true, 
        message: 'Markdown file downloaded!',
        data: { markdown, length: markdown.length }
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to export markdown: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }

  async generateSocialContent(): Promise<MessageResponse> {
    try {
      const text = this.extractMainText()
      const title = document.title
      const url = window.location.href

      // Generate simple social media content
      const socialContent = `📄 Just read: "${title}"\n\nKey insights from this article:\n• ${text.substring(0, 100)}...\n\n🔗 ${url}\n\n#AI #DocumentProcessing #Productivity`

      await navigator.clipboard.writeText(socialContent)

      return { 
        success: true, 
        message: 'Social media content copied to clipboard!',
        data: { content: socialContent, length: socialContent.length }
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to generate social content: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }

  private extractMainText(): string {
    // Remove script and style elements
    const clonedDoc = document.cloneNode(true) as Document
    const scripts = clonedDoc.querySelectorAll('script, style, nav, footer, header, aside, .ads, .advertisement')
    scripts.forEach(el => el.remove())

    // Try to find main content
    const mainContent = 
      clonedDoc.querySelector('main') ||
      clonedDoc.querySelector('article') ||
      clonedDoc.querySelector('[role="main"]') ||
      clonedDoc.querySelector('.content') ||
      clonedDoc.querySelector('.post-content') ||
      clonedDoc.querySelector('.entry-content') ||
      clonedDoc.body

    if (!mainContent) return ''

    // Extract text content
    const text = mainContent.textContent || ''
    return text.replace(/\s+/g, ' ').trim()
  }

  private convertToMarkdown(): string {
    const title = document.title
    const url = window.location.href
    const date = new Date().toISOString().split('T')[0]
    const text = this.extractMainText()

    // Simple markdown conversion
    let markdown = `# ${title}\n\n`
    markdown += `**Source:** ${url}\n`
    markdown += `**Date:** ${date}\n\n`
    markdown += `---\n\n`

    // Add headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    if (headings.length > 0) {
      markdown += `## Table of Contents\n\n`
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1))
        const indent = '  '.repeat(level - 1)
        markdown += `${indent}- ${heading.textContent?.trim()}\n`
      })
      markdown += `\n---\n\n`
    }

    // Add main content
    markdown += `## Content\n\n${text}\n`

    return markdown
  }
}

// Initialize processor
const processor = new DocumentProcessor()

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    console.log('Content script received message:', message)
    
    const handleAsync = async () => {
      try {
        let response: MessageResponse

        switch (message.action) {
          case 'summarize':
            response = await processor.summarizeDocument()
            break
          case 'extract-text':
            response = await processor.extractText()
            break
          case 'extract-images':
            response = await processor.extractImages()
            break
          case 'export-pdf':
            response = await processor.exportToPDF()
            break
          case 'export-markdown':
            response = await processor.exportToMarkdown()
            break
          case 'social-content':
            response = await processor.generateSocialContent()
            break
          default:
            response = { 
              success: false, 
              error: `Unknown action: ${message.action}` 
            }
        }

        sendResponse(response)
      } catch (error) {
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        })
      }
    }

    handleAsync()
    return true // Keep message channel open for async response
  }
)