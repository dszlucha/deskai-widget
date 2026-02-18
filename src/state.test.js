// src/state.test.js
const path = require("path");

// mock electron.app and fs BEFORE requiring the module
jest.mock("electron", () => ({
  app: {
    getPath: jest.fn(() => "/fake/user/data")
  }
}));

jest.mock("fs", () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
}));

const fs = require("fs");
const { app } = require("electron");
const state = require("./state"); // single import, no resetModules

const { loadWindowState, saveWindowState, getHomeUrl, setHomeUrl } = state;

beforeEach(() => {
  jest.clearAllMocks();
  // reset homeUrl to default for each test
  setHomeUrl("", "https://duck.ai");
});

describe("state.js", () => {
  test("loadWindowState returns {} when file read fails", () => {
    fs.readFileSync.mockImplementation(() => {
      throw new Error("no file");
    });

    const s = loadWindowState();
    expect(s).toEqual({});
    expect(getHomeUrl()).toBe("https://duck.ai");
  });

  test("loadWindowState reads valid coordinates and lastUrl", () => {
    const data = {
      x: 100,
      y: 200,
      lastUrl: "https://example.com"
    };
    fs.readFileSync.mockImplementation(() => JSON.stringify(data));

    const s = loadWindowState();
    expect(s).toEqual({ x: 100, y: 200 });
    expect(getHomeUrl()).toBe("https://example.com");
  });

  test("saveWindowState writes correct JSON with current homeUrl", () => {
    setHomeUrl("https://custom.com");

    const fakeWin = {
      getBounds: () => ({ x: 10, y: 20, width: 800, height: 600 })
    };

    saveWindowState(fakeWin);

    const expectedFile = path.join(
      app.getPath("userData"),
      "window-state.json"
    );

    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    const [filePath, json] = fs.writeFileSync.mock.calls[0];

    expect(filePath).toBe(expectedFile);
    expect(JSON.parse(json)).toEqual({
      x: 10,
      y: 20,
      lastUrl: "https://custom.com"
    });
  });

  test("setHomeUrl falls back to default and existing homeUrl correctly", () => {
    expect(getHomeUrl()).toBe("https://duck.ai");

    setHomeUrl("https://a.com");
    expect(getHomeUrl()).toBe("https://a.com");

    setHomeUrl("", "https://b.com");
    expect(getHomeUrl()).toBe("https://b.com");

    setHomeUrl("", "");
    expect(getHomeUrl()).toBe("https://b.com");
  });
});
