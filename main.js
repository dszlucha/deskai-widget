// Copyright (c) 2026 dszlucha. Licensed under MIT License.

const {
  app,
  BrowserWindow,
  globalShortcut,
  shell,
  Menu,
  clipboard
} = require("electron");
const fs = require("fs");
const path = require("path");

// Configure the About panel (macOS)
if (process.platform === "darwin") {
  app.setAboutPanelOptions({
    applicationName: app.getName(),
    applicationVersion: app.getVersion(),
    copyright:
      `© ${new Date().getFullYear()} dszlucha. MIT License.`,
    version: [
      `Electron: ${process.versions.electron}`,
      `Node: ${process.versions.node}`,
      `Chromium: ${process.versions.chrome}`,
      `V8: ${process.versions.v8}`,
      `OS: ${process.platform} ${process.arch}`
    ].join("\n")
  });
}

// Default service URL if nothing stored yet
const DEFAULT_SERVICE_URL = "https://duck.ai";

let win;
let alwaysOnTopMenuItem;
const stateFile = path.join(app.getPath("userData"), "window-pos.json");

// This holds the "home" / base service URL (Duck.ai, Gemini, ChatGPT, etc.)
let homeUrl = DEFAULT_SERVICE_URL;

function loadWindowState() {
  try {
    const data = JSON.parse(fs.readFileSync(stateFile, "utf8"));
    const state = {};

    if (typeof data.x === "number") state.x = data.x;
    if (typeof data.y === "number") state.y = data.y;
    if (typeof data.lastUrl === "string") homeUrl = data.lastUrl;

    return state;
  } catch (_) {}
  return {};
}

function saveWindowState() {
  if (!win) return;
  const { x, y } = win.getBounds();
  const state = {
    x,
    y,
    lastUrl: homeUrl
  };
  try {
    fs.writeFileSync(stateFile, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save window state:", e);
  }
}

function updateAlwaysOnTopState(on) {
  if (!win) return;
  win.setAlwaysOnTop(on);
  win.setTitle(`deskai-widget ${on ? "(Always on Top)" : ""}`);
  if (alwaysOnTopMenuItem) {
    alwaysOnTopMenuItem.checked = on;
  }
}

// Change the current service (Duck.ai, Gemini, ChatGPT)
// Loads it immediately, persists it, and refreshes the menu so the checkmark updates.
function setService(url) {
  homeUrl = url || DEFAULT_SERVICE_URL;
  if (win) {
    win.loadURL(homeUrl);
  }
  saveWindowState();
  createMenu(); // rebuild menu so radio check follows homeUrl
}

// Build "prefix + code", put it on clipboard, then paste into focused field
function pasteWithPrefix(prefix) {
  if (!win) return;
  const code = clipboard.readText();
  if (!code) return;

  const text = `${prefix}\n\n${code}`;

  clipboard.writeText(text);
  win.focus();
  win.webContents.paste();
}

function getPasteMenuItems() {
  return [
    {
      label: "Paste (API Review)",
      accelerator: "CmdOrCtrl+Shift+A",
      click: () =>
        pasteWithPrefix(
          "Review this API design: naming, exported types, error handling, and package structure. Suggest improvements and explain why:"
        )
    },
    {
      label: "Paste (Debug)",
      accelerator: "CmdOrCtrl+Shift+D",
      click: () =>
        pasteWithPrefix(
          "Help debug this code. Identify likely bugs or edge cases, and explain how to fix them:"
        )
    },
    {
      label: "Paste (Doc Comment)",
      accelerator: "CmdOrCtrl+Shift+C",
      click: () =>
        pasteWithPrefix(
          "Write idiomatic doc comments for this code, including a short summary and any important caveats:"
        )
    },
    {
      label: "Paste (Explain)",
      accelerator: "CmdOrCtrl+Shift+E",
      click: () =>
        pasteWithPrefix(
          "Explain this code in clear terms and suggest improvements:"
        )
    },
    {
      label: "Paste (Explain Diff)",
      accelerator: "CmdOrCtrl+Shift+X",
      click: () =>
        pasteWithPrefix(
          "Explain the changes in this code (or diff), focusing on behavior changes, risks, and any potential regressions:"
        )
    },
    {
      label: "Paste (Optimize)",
      accelerator: "CmdOrCtrl+Shift+O",
      click: () =>
        pasteWithPrefix(
          "Analyze this code for performance, allocations, and concurrency issues. Suggest concrete optimizations and explain the tradeoffs:"
        )
    },
    {
      label: "Paste (Refactor)",
      accelerator: "CmdOrCtrl+Shift+R",
      click: () =>
        pasteWithPrefix(
          "Refactor this code to be more idiomatic, readable, and better structured. Keep behavior the same and explain the changes:"
        )
    },
    {
      label: "Paste (Security Review)",
      accelerator: "CmdOrCtrl+Shift+S",
      click: () =>
        pasteWithPrefix(
          "Review this code for security issues (input validation, auth, authz, injections, secret handling). Point out concrete risks and suggest fixes:"
        )
    },
    {
      label: "Paste (Tests)",
      accelerator: "CmdOrCtrl+Shift+Y",
      click: () =>
        pasteWithPrefix(
          "Write table-driven unit tests for this code. Use the testing package, good test names, and cover edge/error cases:"
        )
    }
  ];
}

function createMenu() {
  const template = [
    ...(process.platform === "darwin"
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" }
            ]
          }
        ]
      : []),

    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteAndMatchStyle" },
        { role: "delete" },
        { role: "selectAll" },
        { type: "separator" },
        ...getPasteMenuItems()
      ]
    },

    // Service menu with radio items and checkmark on current service
    {
      label: "AI Provider",
      submenu: [
        {
          label: "Duck.ai",
          type: "radio",
          checked: homeUrl === "https://duck.ai",
          click: () => setService("https://duck.ai")
        },
        {
          label: "ChatGPT",
          type: "radio",
          checked: homeUrl === "https://chatgpt.com",
          click: () => setService("https://chatgpt.com")
        },        
        {
          label: "Google Gemini",
          type: "radio",
          checked: homeUrl === "https://gemini.google.com",
          click: () => setService("https://gemini.google.com")
        },
        {
          label: "Microsoft Copilot",
          type: "radio",
          checked: homeUrl === "https://copilot.microsoft.com",
          click: () => setService("https://copilot.microsoft.com")
        },           
        {
          label: "Claude AI",
          type: "radio",
          checked: homeUrl === "https://claude.ai",
          click: () => setService("https://claude.ai")
        },  
        {
          label: "Perplexity",
          type: "radio",
          checked: homeUrl === "https://www.perplexity.ai",
          click: () => setService("https://www.perplexity.ai")
        },          
      ]
    },

    {
      label: "Window",
      role: "windowMenu",
      submenu: [
        {
          label: "Always on Top",
          type: "checkbox",
          checked: true,
          click: (menuItem) => {
            updateAlwaysOnTopState(menuItem.checked);
          }
        },
        { type: "separator" },
        {
          label: "Back",
          accelerator: "CmdOrCtrl+Left",
          click: () => {
            if (win && win.webContents.canGoBack()) {
              win.webContents.goBack();
            }
          }
        },
        {
          label: "Home",
          accelerator: "CmdOrCtrl+Shift+H",
          click: () => {
            if (win) {
              win.loadURL(homeUrl);
            }
          }
        },
        { type: "separator" },
        { role: "minimize" },
        { role: "close" }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);

  const windowMenu = menu.items.find(
    (i) => i.role === "windowMenu" || i.label === "Window"
  );
  if (windowMenu) {
    alwaysOnTopMenuItem = windowMenu.submenu.items.find(
      (i) => i.label === "Always on Top"
    );
  }

  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const state = loadWindowState();

  const defaultUA = require('electron').session.defaultSession.getUserAgent();
  const cleanedUA = defaultUA
    .replace(/Electron\/[\d.]+\s*/i, '')        // remove Electron version
    .replace(/deskai-widget\/[\d.]+\s*/i, '');  // remove old token if present
  const customUA = `${cleanedUA.trim()} deskai`; 

  win = new BrowserWindow({
    width: 480,
    height: 720,
    x: state.x,
    y: state.y,
    alwaysOnTop: true,
    resizable: true,
    title: "deskai-widget (Always on Top)",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      spellcheck: true
    }
  });

  win.webContents.setUserAgent(customUA);

  win.loadURL(homeUrl);
  
  win.webContents.on("context-menu", (event, params) => {
    const template = [];

    if (params.isEditable) {
      if (params.misspelledWord && params.misspelledWord.length) {
        const suggestions = params.dictionarySuggestions || [];

        if (suggestions.length) {
          suggestions.slice(0, 5).forEach((suggestion) => {
            template.push({
              label: suggestion,
              click: () => {
                win.webContents.replaceMisspelling(suggestion);
              }
            });
          });
        } else {
          template.push({
            label: "No Spelling Suggestions",
            enabled: false
          });
        }

        template.push({ type: "separator" });
      }

      template.push(
        { role: "cut", enabled: params.editFlags.canCut },
        { role: "copy", enabled: params.editFlags.canCopy },
        { role: "paste", enabled: params.editFlags.canPaste },
        { type: "separator" },
        ...getPasteMenuItems()
      );
    } else if (params.linkURL) {
      template.push(
        {
          label: "Open Link in Browser",
          click: () => {
            shell.openExternal(params.linkURL);
          }
        },
        {
          label: "Copy Link Address",
          click: () => {
            clipboard.writeText(params.linkURL);
          }
        }
      );
    } else {
      template.push(
        { role: "copy", enabled: params.editFlags.canCopy }
      );
    }

    const contextMenu = Menu.buildFromTemplate(template);
    contextMenu.popup({ window: win });
  });

  win.on("move", saveWindowState);
  win.on("close", saveWindowState);

  win.on("page-title-updated", (event) => {
    event.preventDefault();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    win.loadURL(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    // Allow navigation inside the Electron window
  });
}

function registerShortcuts() {
  const success = globalShortcut.register("CommandOrControl+Shift+T", () => {
    if (!win) return;
    const next = !win.isAlwaysOnTop();
    updateAlwaysOnTopState(next);
  });

  if (!success) {
    console.warn("Failed to register global shortcut");
  }
}

app.whenReady().then(() => {
  createWindow();
  createMenu();
  updateAlwaysOnTopState(true);
  registerShortcuts();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      createMenu();
    }
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
