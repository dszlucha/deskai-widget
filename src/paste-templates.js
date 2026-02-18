const { clipboard } = require("electron");

function pasteWithPrefix(win, prefix) {
  if (!win || win.isDestroyed()) return;

  const code = clipboard.readText();
  if (!code) return;

  const text = `${prefix}\n\n${code}`;

  // Ensure the target window has focus
  if (typeof win.focus === "function") {
    win.focus();
  }

  // Directly insert into the focused editable element
  if (win.webContents && typeof win.webContents.insertText === "function") {
    win.webContents.insertText(text);
  }
}

function getPasteMenuItems() {
  // Electron passes (menuItem, browserWindow, event) to click
  const wrap = (prompt) => (_menuItem, browserWindow) =>
    pasteWithPrefix(browserWindow, prompt);

  return [
    {
      label: "Paste (API Review)",
      accelerator: "CmdOrCtrl+Shift+A",
      click: wrap(
        "Review this API design: naming, exported types, error handling, and package structure. Suggest improvements and explain why:"
      )
    },
    {
      label: "Paste (Debug)",
      accelerator: "CmdOrCtrl+Shift+D",
      click: wrap(
        "Help debug this code. Identify likely bugs or edge cases, and explain how to fix them:"
      )
    },
    {
      label: "Paste (Doc Comment)",
      accelerator: "CmdOrCtrl+Shift+C",
      click: wrap(
        "Write idiomatic doc comments for this code, including a short summary and any important caveats:"
      )
    },
    {
      label: "Paste (Explain)",
      accelerator: "CmdOrCtrl+Shift+E",
      click: wrap(
        "Explain this code in clear terms and suggest improvements:"
      )
    },
    {
      label: "Paste (Explain Diff)",
      accelerator: "CmdOrCtrl+Shift+X",
      click: wrap(
        "Explain the changes in this code (or diff), focusing on behavior changes, risks, and any potential regressions:"
      )
    },
    {
      label: "Paste (Optimize)",
      accelerator: "CmdOrCtrl+Shift+O",
      click: wrap(
        "Analyze this code for performance, allocations, and concurrency issues. Suggest concrete optimizations and explain the tradeoffs:"
      )
    },
    {
      label: "Paste (Refactor)",
      accelerator: "CmdOrCtrl+Shift+R",
      click: wrap(
        "Refactor this code to be more idiomatic, readable, and better structured. Keep behavior the same and explain the changes:"
      )
    },
    {
      label: "Paste (Security Review)",
      accelerator: "CmdOrCtrl+Shift+S",
      click: wrap(
        "Review this code for security issues (input validation, auth, authz, injections, secret handling). Point out concrete risks and suggest fixes:"
      )
    },
    {
      label: "Paste (Tests)",
      accelerator: "CmdOrCtrl+Shift+Y",
      click: wrap(
        "Write table-driven unit tests for this code. Use the testing package, good test names, and cover edge/error cases:"
      )
    }
  ];
}

module.exports = { pasteWithPrefix, getPasteMenuItems };
