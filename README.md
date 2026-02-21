# deskai-widget

An Electron desktop application that brings an AI web interface to your desktop as an always-on-top productivity widget. Quickly analyze code, debug issues, refactor code, and get AI-powered insights using convenient keyboard shortcuts and clipboard integration.

## Features

- **Always-on-Top Widget**: Keep deskai-widget accessible above other windows while you work
- **Keyboard Shortcuts**: Trigger AI analysis directly with Cmd+Shift+[letter] shortcuts
- **Clipboard Integration**: Copy code to clipboard, use a shortcut to prepend context, and paste results
- **Multiple AI Providers**: Switch between Duck.ai, ChatGPT, Google Gemini, Microsoft Copilot, Claude AI, and Perplexity
- **Isolated Storage**: Each AI provider has its own isolated session and storage
- **Smart Link Handling**: Left-click links to navigate within the app, right-click to open in browser or copy
- **Navigation**: Use Cmd+Left to go back and Cmd+Shift+H to return home
- **Persistent Window Position**: Your window position is saved and restored between sessions
- **Context Menu Support**: Right-click to access analysis tools, link options, and spelling suggestions
- **macOS Native**: Built as a native macOS application with proper app menu and keyboard handling

## Disclaimer

This project is not affiliated with or endorsed by DuckDuckGo, Google, OpenAI, Anthropic, Microsoft, or any other provider. It simply opens their public web interfaces in an Electron window via an “AI Provider” menu.
## AI Providers

deskai-widget supports multiple AI providers, each with isolated storage and sessions:

- **Duck.ai**: Privacy-focused AI assistant
- **ChatGPT**: OpenAI's conversational AI
- **Google Gemini**: Google's multimodal AI
- **Microsoft Copilot**: AI-powered productivity assistant
- **Claude AI**: Anthropic's helpful AI
- **Perplexity**: AI-powered search and answers

Switch providers using the **AI Provider** menu. Each provider maintains its own login state and preferences.
## Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd deskai-widget

# Install dependencies
npm install

# Start the development application
npm start
```

The Electron app will launch with the deskai-widget interface loaded.

## Usage

### Keyboard Shortcuts

| Shortcut | Function |
|----------|----------|
| `Cmd+Shift+T` | Toggle "Always on Top" |
| `Cmd+Left` | Back |
| `Cmd+Shift+H` | Home  |
| `Cmd+Shift+A` | Paste (API Review) |
| `Cmd+Shift+D` | Paste (Debug) |
| `Cmd+Shift+C` | Paste (Doc Comment) |
| `Cmd+Shift+E` | Paste (Explain) |
| `Cmd+Shift+X` | Paste (Explain Diff) |
| `Cmd+Shift+O` | Paste (Optimize) |
| `Cmd+Shift+R` | Paste (Refactor) |
| `Cmd+Shift+S` | Paste (Security Review) |
| `Cmd+Shift+Y` | Paste (Tests) |

### Clipboard-Driven Analysis

1. **Copy** your code to the clipboard
2. **Press** a Cmd+Shift+[letter] shortcut
3. The code is automatically prepended with an analysis instruction
4. **Paste** into deskai-widget and get AI-powered feedback

Example: Copy a function, press `Cmd+Shift+D` to debug, then paste into deskai-widget.

### Context Menu

**Right-click options:**
- **In text fields**: Use analysis shortcuts (Paste Debug, Paste Optimize, etc.), standard edit options, and spelling suggestions
- **On links**: Open in external browser or copy the link address
- **Elsewhere**: Copy selected content

You can also access analysis tools from the **Edit** menu.

## Development

### Project Structure

```
deskai-widget/
├── assets/
│   └── icons/                   # Source icon files
├── scripts/
│   └── gen-mac-icon.sh          # Icon generation script
├── src/
│   ├── main.js                  # Electron application entry point
│   ├── menu.js                  # Application menu configuration
│   ├── paste-templates.js       # Paste analysis templates
│   ├── providers.js             # AI provider definitions
│   ├── shortcuts.js             # Keyboard shortcuts registration
│   ├── state.js                 # Application state management
│   └── window.js                # Window creation and management
├── package.json                 # Dependencies and build configuration
├── package-lock.json            # Dependency lock file
├── LICENSE                      # MIT License
└── README.md                    # This file
```

### Architecture

- **Modular Design**: Electron logic is split into multiple modules in the `src/` directory for better maintainability
- **Multi-Provider Support**: Switch between AI providers with isolated sessions and storage per provider
- **Per-Site Partitions**: Each provider uses a separate Electron session partition for complete isolation
- **Web-based UI**: Loads selected AI provider in a BrowserWindow; UI changes happen upstream
- **Smart Navigation**: Links open in-app by default; external options via right-click context menu
- **Clipboard Integration**: Avoids IPC by using clipboard + native paste
- **Window Persistence**: Saves position to `{userData}/window-pos.json`

### Common Tasks

#### Add a new AI provider

Add the provider to the `PROVIDERS` array in `src/providers.js`:

```javascript
{ label: "New Provider", url: "https://new-provider.com" }
```

The menu will automatically include the new provider as a radio option.

#### Add a New Analysis Shortcut

Edit the `getPasteMenuItems()` function in `src/paste-templates.js`:

```javascript
{
  label: "Paste (Your Feature)",
  accelerator: "CmdOrCtrl+Shift+Z",
  click: () =>
    pasteWithPrefix(
      "Your instruction here. Keep it under ~20 words, action-focused:"
    )
}
```

#### Modify Window Behavior

Update `createWindow()` in `src/window.js` to change size, resizable flag, web preferences, or startup position.

#### Update the Context Menu

Modify the `context-menu` event listener in `src/window.js` to add or remove right-click options.

### Building for Distribution

```bash
npm run dist
```

This uses `electron-builder` to create a macOS `.app` bundle configured in `package.json` under the `build` section.

## Contributing

When making changes:

- Keep related functionality co-located in appropriate modules in `src/`
- Follow the naming convention: `get*`, `load*`, `save*`, `update*`, `create*`, `register*`
- Test that window position persists across restarts
- Verify all keyboard shortcuts work without system conflicts

## Testing

Basic unit tests are available for state management. Run tests with:

```bash
npm test
```

Manual testing checklist:

- ✓ Window position persists across application restart
- ✓ All Cmd+Shift+[letter] shortcuts trigger the correct analysis
- ✓ "Always on Top" toggle works via menu and keyboard shortcut
- ✓ Left-click links navigate within the app window
- ✓ Right-click links allow opening in external browser or copying
- ✓ Back (Cmd+Left) and Home (Cmd+Shift+H) navigation work correctly
- ✓ Spell-check suggestions appear in right-click context menu
- ✓ AI Provider menu allows switching between providers
- ✓ Each provider maintains isolated storage and sessions

## License

MIT
