import { useState, useEffect } from 'react'
import { Settings, Save, RotateCcw } from 'lucide-react'
import { sendMessageToBackground } from '../shared/messaging'

interface OptionsData {
  aiProvider: string
  apiKey: string
  model: string
  summaryLength: string
  autoSave: boolean
  showNotifications: boolean
}

const defaultOptions: OptionsData = {
  aiProvider: 'openai',
  apiKey: '',
  model: 'gpt-3.5-turbo',
  summaryLength: 'medium',
  autoSave: true,
  showNotifications: true
}

function OptionsApp() {
  const [options, setOptions] = useState<OptionsData>(defaultOptions)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const response = await sendMessageToBackground({ action: 'getSettings' })
      if (response.success) {
        setOptions({ ...defaultOptions, ...response.data })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      showMessage('error', 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await sendMessageToBackground({
        action: 'saveSettings',
        data: options
      })
      
      if (response.success) {
        showMessage('success', 'Settings saved successfully!')
      } else {
        showMessage('error', response.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      showMessage('error', 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const resetSettings = () => {
    setOptions(defaultOptions)
    showMessage('success', 'Settings reset to defaults')
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const updateOption = (key: keyof OptionsData, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="options-app">
        <div className="header">
          <Settings size={32} />
          <h1>AI Document Agent Settings</h1>
        </div>
        <div className="content">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Loading settings...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="options-app">
      <div className="header">
        <Settings size={32} />
        <h1>AI Document Agent Settings</h1>
      </div>

      <div className="content">
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="section">
          <h2 className="section-title">AI Configuration</h2>
          
          <div className="grid">
            <div className="form-group">
              <label className="form-label">AI Provider</label>
              <select 
                className="form-select"
                value={options.aiProvider}
                onChange={(e) => updateOption('aiProvider', e.target.value)}
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="google">Google (Gemini)</option>
                <option value="ollama">Ollama (Local)</option>
              </select>
              <div className="form-help">Choose your preferred AI service</div>
            </div>

            <div className="form-group">
              <label className="form-label">Model</label>
              <select 
                className="form-select"
                value={options.model}
                onChange={(e) => updateOption('model', e.target.value)}
              >
                {options.aiProvider === 'openai' && (
                  <>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  </>
                )}
                {options.aiProvider === 'anthropic' && (
                  <>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    <option value="claude-3-haiku">Claude 3 Haiku</option>
                  </>
                )}
                {options.aiProvider === 'google' && (
                  <>
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="gemini-pro-vision">Gemini Pro Vision</option>
                  </>
                )}
                {options.aiProvider === 'ollama' && (
                  <>
                    <option value="llama2">Llama 2</option>
                    <option value="mistral">Mistral</option>
                    <option value="codellama">Code Llama</option>
                  </>
                )}
              </select>
              <div className="form-help">Select the specific model to use</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">API Key</label>
            <input 
              type="password"
              className="form-input"
              placeholder="Enter your API key"
              value={options.apiKey}
              onChange={(e) => updateOption('apiKey', e.target.value)}
            />
            <div className="form-help">
              {options.aiProvider === 'ollama' 
                ? 'No API key needed for local Ollama setup'
                : 'Your API key will be stored locally and never shared'
              }
            </div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Processing Options</h2>
          
          <div className="form-group">
            <label className="form-label">Summary Length</label>
            <select 
              className="form-select"
              value={options.summaryLength}
              onChange={(e) => updateOption('summaryLength', e.target.value)}
            >
              <option value="short">Short (1-2 sentences)</option>
              <option value="medium">Medium (1 paragraph)</option>
              <option value="long">Long (Multiple paragraphs)</option>
            </select>
            <div className="form-help">Default length for document summaries</div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">General Settings</h2>
          
          <div className="form-group">
            <div className="checkbox-group">
              <input 
                type="checkbox"
                id="autoSave"
                className="checkbox-input"
                checked={options.autoSave}
                onChange={(e) => updateOption('autoSave', e.target.checked)}
              />
              <label htmlFor="autoSave" className="form-label">Auto-save processed content</label>
            </div>
            <div className="form-help">Automatically save extracted text and generated content</div>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input 
                type="checkbox"
                id="showNotifications"
                className="checkbox-input"
                checked={options.showNotifications}
                onChange={(e) => updateOption('showNotifications', e.target.checked)}
              />
              <label htmlFor="showNotifications" className="form-label">Show notifications</label>
            </div>
            <div className="form-help">Display notifications when actions complete</div>
          </div>
        </div>

        <div className="button-group">
          <button 
            className="btn btn-secondary"
            onClick={resetSettings}
            disabled={saving}
          >
            <RotateCcw size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Reset to Defaults
          </button>
          <button 
            className="btn btn-primary"
            onClick={saveSettings}
            disabled={saving}
          >
            <Save size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OptionsApp