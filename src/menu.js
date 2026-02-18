const { Menu, app } = require("electron");
const { getHomeUrl, setHomeUrl } = require("./state");
const { getWindow, updateAlwaysOnTopState, setAlwaysOnTopMenuItem } = require("./window");
const { getPasteMenuItems } = require("./paste-templates");

const DEFAULT_SERVICE_URL = "https://duck.ai";

function setService(url) {
  const win = getWindow();
  setHomeUrl(url, DEFAULT_SERVICE_URL);
  if (win) {
    win.loadURL(getHomeUrl());
  }
  // you can still call saveWindowState(win) here if you want
  createMenu(); // refresh radio check
}

function createMenu() {
  const win = getWindow();
  const homeUrl = getHomeUrl();

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
            const w = getWindow();
            if (w) w.loadURL(getHomeUrl());
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
