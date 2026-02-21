// providers.js
const PROVIDERS = [
  { label: "Duck.ai", url: "https://duck.ai" },
  { label: "ChatGPT", url: "https://chatgpt.com" },
  { label: "Google Gemini", url: "https://gemini.google.com" },
  { label: "Microsoft Copilot", url: "https://copilot.microsoft.com" },
  { label: "Claude AI", url: "https://claude.ai" },
  { label: "Perplexity", url: "https://www.perplexity.ai" }
];

function providerOrigins() {
  return new Set(PROVIDERS.map(p => new URL(p.url).origin));
}

module.exports = { PROVIDERS, providerOrigins };
