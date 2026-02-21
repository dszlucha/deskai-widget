// menu.js
const { Menu, app } = require("electron");
const { getHomeUrl, setHomeUrl } = require("./state");
const {
  getWindow,
  switchToUrl,
  updateAlwaysOnTopState,
  setAlwaysOnTopMenuItem
} = require("./window");
const { getPasteMenuItems } = require("./paste-templates");
const { PROVIDERS } = require("./providers");

const DEFAULT_SERVICE_URL = "https://duck.ai";

// Normalize URL for comparison (ignore trailing slashes, query params, etc.)
function norm(u) {
  try {
    return new URL(u).origin;
  } catch {
    return u;
  }
}

function setService(url) {
  setHomeUrl(url, DEFAULT_SERVICE_URL);

  // Recreate window into per-site partition instead of reusing the same session
  switchToUrl(getHomeUrl());

  createMenu(); // refresh radio check
}

function createMenu() {
  const win = getWindow();
  const homeUrl = norm(getHomeUrl());
  console.log("getHomeUrl() =", getHomeUrl());

  const template = [
    ...(process.platform === "darwin"
      ? [{
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
        }]
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
        ...getPasteMenuItems(win)
      ]
    },
    {
      label: "View",
      submenu: [
        {
          label: "Toggle Developer Tools",
          accelerator: process.platform === "darwin" ? "Alt+Command+I" : "Ctrl+Shift+I",
          click: () => {
            const w = getWindow();
            if (w) w.webContents.toggleDevTools();
          }
        },
        { role: "reload" },
        { role: "forceReload" }
      ]
    },
    {
      label: "AI Provider",
      submenu: PROVIDERS.map(p => ({
        label: p.label,
        type: "radio",
        checked: new URL(getHomeUrl()).origin === new URL(p.url).origin,
        click: () => setService(p.url)
      }))
    },      
    {
      label: "Window",
      role: "windowMenu",
      submenu: [
        {
          label: "Always on Top",
          type: "checkbox",
          checked: true,
          click: (menuItem) => updateAlwaysOnTopState(menuItem.checked)
        },
        { type: "separator" },
        {
          label: "Back",
          accelerator: "CmdOrCtrl+Left",
          click: () => {
            const w = getWindow();
            if (w && w.webContents.canGoBack()) {
              w.webContents.goBack();
            }
          }
        },
        {
          label: "Home",
          accelerator: "CmdOrCtrl+Shift+H",
          click: () => {
            switchToUrl(getHomeUrl());
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
    const item = windowMenu.submenu.items.find(
      (i) => i.label === "Always on Top"
    );
    setAlwaysOnTopMenuItem(item);
  }

  Menu.setApplicationMenu(menu);
}

module.exports = { createMenu, setService };
