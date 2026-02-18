const { globalShortcut } = require("electron");
const { getWindow, updateAlwaysOnTopState } = require("./window");

function registerShortcuts() {
  const success = globalShortcut.register("CommandOrControl+Shift+T", () => {
    const win = getWindow();
    if (!win) return;
    const next = !win.isAlwaysOnTop();
    updateAlwaysOnTopState(next);
  });

  if (!success) {
    console.warn("Failed to register global shortcut");
  }
}

function unregisterShortcuts() {
  globalShortcut.unregisterAll();
}

module.exports = { registerShortcuts, unregisterShortcuts };
