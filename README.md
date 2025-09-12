# AI Document Agent

A Chrome extension built with TypeScript, React, and Vite that provides AI-powered document processing capabilities for web pages.

## Features

- **Document Summarization**: Generate AI-powered summaries of web page content
- **Text Extraction**: Extract and copy all text content from web pages
- **Image Extraction**: Find and list all images with their URLs
- **PDF Export**: Convert web pages to PDF using browser's print function
- **Markdown Export**: Export page content as Markdown files
- **Social Media Content**: Generate social media posts based on page content
- **Multiple Interfaces**: Popup, context menus, and keyboard shortcuts
- **Configurable AI Models**: Support for OpenAI, Anthropic, Google, and local Ollama

## Installation

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/realharry/ai-doc-agent.git
cd ai-doc-agent
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

### Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist` folder
4. The AI Document Agent extension should now appear in your extensions

## Usage

### Popup Interface
- Click the extension icon in the toolbar to open the popup
- Use the function buttons to process the current page:
  - **Summarize**: Generate an AI summary of the page
  - **Extract Text**: Copy all text content to clipboard
  - **Extract Images**: List and copy image URLs to clipboard
  - **Export PDF**: Open print dialog for PDF export
  - **Export MD**: Download page content as Markdown
  - **Social Content**: Generate social media post content

### Context Menus
- Right-click on any page to access AI Document Agent functions
- Available options appear in the context menu

### Keyboard Shortcuts
- `Ctrl+Shift+A` (Mac: `Cmd+Shift+A`): Open extension popup
- `Ctrl+Shift+S` (Mac: `Cmd+Shift+S`): Summarize document
- `Ctrl+Shift+T` (Mac: `Cmd+Shift+T`): Extract text

### Configuration
- Click the "Settings" button in the popup to configure:
  - AI provider (OpenAI, Anthropic, Google, Ollama)
  - API keys
  - Model selection
  - Summary length preferences
  - Notification settings

## AI Configuration

### OpenAI
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Enter it in the extension settings

### Anthropic (Claude)
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Generate an API key
3. Enter it in the extension settings

### Google (Gemini)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Enter it in the extension settings

### Ollama (Local)
1. Install [Ollama](https://ollama.ai/) on your machine
2. Pull a model (e.g., `ollama pull llama2`)
3. Select "Ollama" in extension settings (no API key needed)

## Development

### Project Structure
```
src/
├── background/     # Service worker for context menus and shortcuts
├── content/        # Content script for page interaction
├── popup/          # Extension popup interface
├── options/        # Settings/configuration page
└── shared/         # Shared utilities and messaging
```

### Build Commands
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint

### Architecture
- **Background Script**: Handles context menus, keyboard shortcuts, and notifications
- **Content Script**: Processes web page content and handles extraction/export
- **Popup**: React-based UI for main functionality
- **Options**: React-based settings page
- **Messaging**: Chrome extension messaging API for communication

## Current Limitations

- AI summarization uses placeholder logic (integrate with actual AI APIs)
- PDF export uses browser's print function
- Image extraction provides URLs but doesn't download files directly
- No offline functionality (requires internet for AI features)

## Future Enhancements

- [ ] Real AI API integration
- [ ] Bulk image download
- [ ] Custom summary templates
- [ ] Local content caching
- [ ] Advanced export formats
- [ ] Content scheduling for social media
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

### Common Issues

**Extension won't load:**
- Ensure you selected the `dist` folder, not the root directory
- Check that the build completed successfully
- Verify manifest.json is valid

**Functions not working:**
- Check that you're on a webpage (not chrome:// pages)
- Ensure content script permissions are granted
- Check browser console for errors

**AI features not working:**
- Verify API key is correctly entered
- Check internet connection
- Ensure selected AI provider is available

### Support

For issues and questions, please open an issue on GitHub or contact the maintainers.
AI Doc Agent is a Chrome extension that lets the user to perform various document-related tasks using AI, including summarizing documents, extracting text, exporting to PDF, and more. The extension provides a user-friendly interface and integrates with user-selected AI models.
