// window.js
const { BrowserWindow, Menu, shell, clipboard, session } = require("electron");
const { loadWindowState, saveWindowState, getHomeUrl } = require("./state");
const { getPasteMenuItems } = require("./paste-templates");
const { providerOrigins } = require("./providers");

let win;
let alwaysOnTopMenuItem;

function updateAlwaysOnTopState(on) {
  if (!win) return;
  win.setAlwaysOnTop(on);
  win.setTitle(`deskai-widget ${on ? "(Always on Top)" : ""}`);
  if (alwaysOnTopMenuItem) alwaysOnTopMenuItem.checked = on;
}

function partitionForUrl(url) {
  const origin = new URL(url).origin;
  const safe = origin.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  return `persist:deskai_${safe}`;
}

function attachContextMenuHandlers(targetWin) {
  targetWin.webContents.on("context-menu", (event, params) => {
    const template = [];

    if (params.isEditable) {
      if (params.misspelledWord && params.misspelledWord.length) {
        const suggestions = params.dictionarySuggestions || [];

        if (suggestions.length) {
          suggestions.slice(0, 5).forEach((suggestion) => {
            template.push({
              label: suggestion,
              click: () => {
                targetWin.webContents.replaceMisspelling(suggestion);
              }
            });
          });
        } else {
          template.push({ label: "No Spelling Suggestions", enabled: false });
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
          click: () => shell.openExternal(params.linkURL)
        },
        {
          label: "Copy Link Address",
          click: () => clipboard.writeText(params.linkURL)
        }
      );
    } else {
      template.push({ role: "copy", enabled: params.editFlags.canCopy });
    }

    Menu.buildFromTemplate(template).popup({ window: targetWin });
  });
}

function createWindowForUrl(url, bounds) {
  const partition = partitionForUrl(url);
  const siteSession = session.fromPartition(partition);
  console.log(`Creating window for ${url} with partition ${partition}`);

  const state = loadWindowState();

  const w = new BrowserWindow({
    show: false, // create hidden to avoid flicker during URL switch
    width: bounds?.width ?? 480,
    height: bounds?.height ?? 720,    
    x: bounds?.x ?? state.x,
    y: bounds?.y ?? state.y,
    alwaysOnTop: true,
    resizable: true,
    title: "deskai-widget (Always on Top)",
    webPreferences: {
      partition,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      spellcheck: true
    }
  });

  const allowed = providerOrigins();
  const primaryOrigin = new URL(url).origin;

  function logCleanup({ partition, origin, reason }) {
    console.log(`[cleanup] partition=${partition} origin=${origin} reason=${reason}`);
  }

  w.webContents.on("did-navigate", async (_, toUrl) => {
    const origin = new URL(toUrl).origin;
    if (allowed.has(origin)) return; // keep provider storage
    logCleanup({ partition, origin, reason: "navigated-to-non-provider" });
    try {
      await siteSession.clearStorageData({ origin });
    } catch (e) {
      console.warn(`[cleanup] failed partition=${partition} origin=${origin}`, e);
    }
  });

  const ua = siteSession.getUserAgent();

  const cleanedUA = ua
    .replace(/\bElectron\/[\d.]+\b/gi, "")
    .replace(/\bdeskai-widget\/[\d.]+\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\)/g, ")")
    .replace(/\(\s+/g, "(")
    .trim();

  w.webContents.setUserAgent(cleanedUA);  

  // Keep links/popups in the same window
  w.webContents.setWindowOpenHandler(({ url }) => {
    w.loadURL(url);
    return { action: "deny" };
  });

  attachContextMenuHandlers(w);

  w.loadURL(url);
  w.once("ready-to-show", () => w.show());

  w.on("move", () => saveWindowState(w));
  w.on("close", () => saveWindowState(w));

  console.log("UA in use:", w.webContents.getUserAgent());  

  return w;
}

function createWindow() {
  // initial boot uses whatever getHomeUrl() currently returns
  win = createWindowForUrl(getHomeUrl());
  return win;
}

function switchToUrl(url) {
  const old = win;
  const bounds = old && !old.isDestroyed() ? old.getBounds() : undefined;

  // Create new first so we never hit "0 windows" in-between
  const next = createWindowForUrl(url, bounds);

  // Optional: preserve always-on-top checkbox state
  const desiredAOT = alwaysOnTopMenuItem ? alwaysOnTopMenuItem.checked : true;

  // Once the new window is ready, destroy the old one
  next.once("ready-to-show", () => {
    win = next;
    updateAlwaysOnTopState(desiredAOT);

    if (old && !old.isDestroyed()) old.destroy();
  });

  // Fallback: if ready-to-show doesn't fire (some pages), swap on first paint
  next.webContents.once("did-finish-load", () => {
    if (win !== next) {
      win = next;
      updateAlwaysOnTopState(desiredAOT);
      if (old && !old.isDestroyed()) old.destroy();
    }
  });

  return next;
}

function getWindow() {
  return win;
}

function setAlwaysOnTopMenuItem(item) {
  alwaysOnTopMenuItem = item;
}

module.exports = {
  createWindow,
  switchToUrl,
  getWindow,
  updateAlwaysOnTopState,
  setAlwaysOnTopMenuItem
};
