// state.js
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

function writeState(patch) {
  let data = {};
  try { data = JSON.parse(fs.readFileSync(stateFile, "utf8")); } catch (_) {}
  const next = { ...data, ...patch };
  fs.writeFileSync(stateFile, JSON.stringify(next));
}

function saveWindowState(win) {
  if (!win) return;
  const { x, y } = win.getBounds();
  try {
    writeState({ x, y, lastUrl: homeUrl });
  } catch (e) {
    console.warn("Failed to save window state:", e);
  }
}

function saveHomeUrl() {
  try {
    writeState({ lastUrl: homeUrl });
  } catch (e) {
    console.warn("Failed to save home url:", e);
  }
}

function getHomeUrl() {
  return homeUrl;
}

function setHomeUrl(url, defaultUrl) {
  homeUrl = url || defaultUrl || homeUrl;
  saveHomeUrl(); // <-- persist immediately
}

module.exports = {
  loadWindowState,
  saveWindowState,
  getHomeUrl,
  setHomeUrl
};
