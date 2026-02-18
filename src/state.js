const { app } = require("electron");
const fs = require("fs");
const path = require("path");

const stateFile = path.join(app.getPath("userData"), "window-state.json");

let homeUrl = "https://duck.ai";

function loadWindowState() {
  try {
    const data = JSON.parse(fs.readFileSync(stateFile, "utf8"));
    const state = {};

    if (typeof data.x === "number") state.x = data.x;
    if (typeof data.y === "number") state.y = data.y;
    if (typeof data.lastUrl === "string") homeUrl = data.lastUrl;

    return state;
  } catch (_) {
    return {};
  }
}

function saveWindowState(win) {
  if (!win) return;
  const { x, y } = win.getBounds();
  const state = { x, y, lastUrl: homeUrl };

  try {
    fs.writeFileSync(stateFile, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save window state:", e);
  }
}

function getHomeUrl() {
  return homeUrl;
}

function setHomeUrl(url, defaultUrl) {
  homeUrl = url || defaultUrl || homeUrl;
}

module.exports = { loadWindowState, saveWindowState, getHomeUrl, setHomeUrl };
