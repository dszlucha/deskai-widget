// main.js
const { app, BrowserWindow } = require("electron");
const { createWindow, updateAlwaysOnTopState } = require("./window");
const { createMenu } = require("./menu");
const { registerShortcuts, unregisterShortcuts } = require("./shortcuts");
const { loadWindowState } = require("./state");

app.whenReady().then(() => {
  loadWindowState();
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
  unregisterShortcuts();
});
