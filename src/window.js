const { BrowserWindow, Menu, shell, clipboard, session } = require("electron");
const { loadWindowState, saveWindowState, getHomeUrl } = require("./state");
const { getPasteMenuItems } = require("./paste-templates");

let win;
let alwaysOnTopMenuItem;

function updateAlwaysOnTopState(on) {
  if (!win) return;
  win.setAlwaysOnTop(on);
  win.setTitle(`deskai-widget ${on ? "(Always on Top)" : ""}`);
  if (alwaysOnTopMenuItem) {
    alwaysOnTopMenuItem.checked = on;
  }
}

function createWindow() {
  const state = loadWindowState();

  const defaultUA = session.defaultSession.getUserAgent();
  const cleanedUA = defaultUA
    .replace(/Electron\/[\d.]+\s*/i, "")
    .replace(/deskai-widget\/[\d.]+\s*/i, "");
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
  win.loadURL(getHomeUrl());

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

  win.on("move", () => saveWindowState(win));
  win.on("close", () => saveWindowState(win));

  return win;
}

function getWindow() {
  return win;
}

function setAlwaysOnTopMenuItem(item) {
  alwaysOnTopMenuItem = item;
}

module.exports = { createWindow, getWindow, updateAlwaysOnTopState, setAlwaysOnTopMenuItem };
