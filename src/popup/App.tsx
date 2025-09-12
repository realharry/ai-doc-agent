import { useState } from 'react'
import { 
  FileText, 
  Image, 
  Download, 
  Sparkles, 
  Share2, 
  Settings,
  Brain 
} from 'lucide-react'
import { sendMessageToContentScript } from '../shared/messaging'

interface Status {
  type: 'success' | 'error' | 'processing' | null
  message: string
}

function App() {
  const [status, setStatus] = useState<Status>({ type: null, message: '' })
  const [processing, setProcessing] = useState<string | null>(null)

  const handleFunction = async (action: string, title: string) => {
    if (processing) return
    
    setProcessing(action)
    setStatus({ type: 'processing', message: `${title}...` })
    
    try {
      const response = await sendMessageToContentScript({ action })
      
      if (response.success) {
        setStatus({ type: 'success', message: response.message || `${title} completed!` })
      } else {
        setStatus({ type: 'error', message: response.error || `Failed to ${title.toLowerCase()}` })
      }
    } catch (error) {
      setStatus({ type: 'error', message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` })
    } finally {
      setProcessing(null)
      setTimeout(() => setStatus({ type: null, message: '' }), 3000)
    }
  }

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  const functions = [
    {
      id: 'summarize',
      title: 'Summarize',
      subtitle: 'Get AI summary',
      icon: Brain,
      action: () => handleFunction('summarize', 'Summarizing document')
    },
    {
      id: 'extract-text',
      title: 'Extract Text',
      subtitle: 'Copy all text',
      icon: FileText,
      action: () => handleFunction('extract-text', 'Extracting text')
    },
    {
      id: 'extract-images',
      title: 'Extract Images',
      subtitle: 'Download all images',
      icon: Image,
      action: () => handleFunction('extract-images', 'Extracting images')
    },
    {
      id: 'export-pdf',
      title: 'Export PDF',
      subtitle: 'Save as PDF',
      icon: Download,
      action: () => handleFunction('export-pdf', 'Exporting to PDF')
    },
    {
      id: 'export-markdown',
      title: 'Export MD',
      subtitle: 'Save as Markdown',
      icon: FileText,
      action: () => handleFunction('export-markdown', 'Exporting to Markdown')
    },
    {
      id: 'social-content',
      title: 'Social Content',
      subtitle: 'Generate posts',
      icon: Share2,
      action: () => handleFunction('social-content', 'Generating social content')
    }
  ]

  return (
    <div className="app">
      <div className="header">
        <Sparkles size={24} color="#007bff" />
        <h1>AI Document Agent</h1>
      </div>

      {status.type && (
        <div className={`status ${status.type}`}>
          {status.message}
        </div>
      )}

      <div className="function-grid">
        {functions.map((func) => {
          const Icon = func.icon
          return (
            <button
              key={func.id}
              className={`function-btn ${processing === func.id ? 'processing' : ''}`}
              onClick={func.action}
              disabled={processing === func.id}
            >
              <Icon className="icon" size={24} />
              <div className="title">{func.title}</div>
              <div className="subtitle">{func.subtitle}</div>
            </button>
          )
        })}
      </div>

      <button className="settings-btn" onClick={openOptions}>
        <Settings size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
        Settings
      </button>
    </div>
  )
}

export default App