# deskai-widget

An Electron desktop application that brings an AI web interface to your desktop as an always-on-top productivity widget. Quickly analyze code, debug issues, refactor code, and get AI-powered insights using convenient keyboard shortcuts and clipboard integration.

## Features

- **Always-on-Top Widget**: Keep deskai-widget accessible above other windows while you work
- **Keyboard Shortcuts**: Trigger AI analysis directly with Cmd+Shift+[letter] shortcuts
- **Clipboard Integration**: Copy code to clipboard, use a shortcut to prepend context, and paste results
- **Smart Link Handling**: Left-click links to navigate within the app, right-click to open in browser or copy
- **Navigation**: Use Cmd+Left to go back and Cmd+Shift+H to return home
- **Persistent Window Position**: Your window position is saved and restored between sessions
- **Context Menu Support**: Right-click to access analysis tools, link options, and spelling suggestions
- **macOS Native**: Built as a native macOS application with proper app menu and keyboard handling

## Disclaimer

This project is not affiliated with or endorsed by DuckDuckGo, Google, OpenAI, Anthropic, Microsoft, or any other provider. It simply opens their public web interfaces in an Electron window via an “AI Provider” menu.

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
├── .github/
│   └── copilot-instructions.md  # Copilot context guidelines
├── assets/
│   └── icons/                   # Source icon files
├── build/
│   └── icons/
│       └── macos.iconset/       # macOS icon assets for app packaging
├── scripts/
│   └── gen-mac-icon.sh          # Icon generation script
├── dist/                        # Build output (created by npm run dist)
├── main.js                      # Electron application entry point (~383 lines)
├── package.json                 # Dependencies and build configuration
├── package-lock.json            # Dependency lock file
├── LICENSE                      # MIT License
└── README.md                    # This file
```

### Architecture

- **Single-file Monolith**: All Electron logic lives in `main.js` for simplicity
- **Web-based UI**: Loads selected AI provider in a BrowserWindow; UI changes happen upstream
- **Smart Navigation**: Links open in-app by default; external options via right-click context menu
- **Clipboard Integration**: Avoids IPC by using clipboard + native paste
- **Window Persistence**: Saves position to `{userData}/window-pos.json`

### Common Tasks

#### Add a new AI provider

Edit the AI Provider menu:

```javascript
{
  label: "Provider",
  type: "radio",
  checked: homeUrl === "https://provider_url",
  click: () => setService("https://provider_url")
},
```

#### Add a New Analysis Shortcut

Edit the `getPasteMenuItems()` function in `main.js`:

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

Update `createWindow()` in `main.js` to change size, resizable flag, web preferences, or startup position.

#### Update the Context Menu

Modify the `context-menu` event listener in `createWindow()` to add or remove right-click options.

### Building for Distribution

```bash
npm run dist
```

This uses `electron-builder` to create a macOS `.app` bundle configured in `package.json` under the `build` section.

## Contributing

When making changes:

- Keep related functionality co-located in `main.js`
- Follow the naming convention: `get*`, `load*`, `save*`, `update*`, `create*`, `register*`
- Test that window position persists across restarts
- Verify all keyboard shortcuts work without system conflicts

## Testing

No automated tests are currently configured. Manual testing checklist:

- ✓ Window position persists across application restart
- ✓ All Cmd+Shift+[letter] shortcuts trigger the correct analysis
- ✓ "Always on Top" toggle works via menu and keyboard shortcut
- ✓ Left-click links navigate within the app window
- ✓ Right-click links allow opening in external browser or copying
- ✓ Back (Cmd+Left) and Home (Cmd+Shift+H) navigation work correctly
- ✓ Spell-check suggestions appear in right-click context menu

## License

MIT
