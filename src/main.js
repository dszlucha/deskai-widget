const { app, BrowserWindow } = require("electron");
const { createWindow, updateAlwaysOnTopState } = require("./window");
const { createMenu } = require("./menu");
const { registerShortcuts, unregisterShortcuts } = require("./shortcuts");

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
  unregisterShortcuts();
});
