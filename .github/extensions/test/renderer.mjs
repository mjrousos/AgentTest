function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character]);
}

export function renderHtml(instanceId, message) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Test</title>
    <script>
      (() => {
        const param = new URLSearchParams(window.location.search).get("scoutTheme");
        const theme =
          param || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        document.documentElement.setAttribute("data-theme", theme);
      })();
    </script>
    <style>
      :root {
        color-scheme: light;
        --cp-bg: #f7f4ef;
        --cp-bg-elevated: #fcfbf8;
        --cp-surface: #ffffff;
        --cp-surface-soft: #f5f5f5;
        --cp-border: #dedede;
        --cp-border-strong: #919191;
        --cp-text: #242424;
        --cp-text-muted: #5c5c5c;
        --cp-text-soft: #6f6f6f;
        --cp-accent: #b11f4b;
        --cp-accent-hover: #9a1a41;
        --cp-accent-soft: rgba(177, 31, 75, 0.08);
        --cp-accent-fg: #ffffff;
        --cp-success: #16a34a;
        --cp-danger: #dc2626;
        --cp-warning: #f59e0b;
        --cp-link: #0078d4;
        --cp-shadow: 0 18px 48px rgba(0, 0, 0, 0.12);
        --cp-overlay: rgba(255, 255, 255, 0.8);
        --cp-panel: rgba(255, 255, 255, 0.86);
        --cp-panel-strong: rgba(255, 255, 255, 0.96);
        --cp-sheen: rgba(255, 255, 255, 0.55);
        --cp-highlight: rgba(177, 31, 75, 0.12);
      }
      html[data-theme="dark"] {
        color-scheme: dark;
        --cp-bg: #3d3b3a;
        --cp-bg-elevated: #343231;
        --cp-surface: #292929;
        --cp-surface-soft: #2e2e2e;
        --cp-border: #474747;
        --cp-border-strong: #5f5f5f;
        --cp-text: #dedede;
        --cp-text-muted: #919191;
        --cp-text-soft: #b0b0b0;
        --cp-accent: #fd8ea1;
        --cp-accent-hover: #fb7b91;
        --cp-accent-soft: rgba(253, 142, 161, 0.14);
        --cp-accent-fg: #1a1a1a;
        --cp-success: #4ade80;
        --cp-danger: #f87171;
        --cp-warning: #fbbf24;
        --cp-link: #4da6ff;
        --cp-shadow: 0 18px 48px rgba(0, 0, 0, 0.32);
        --cp-overlay: rgba(41, 41, 41, 0.88);
        --cp-panel: rgba(41, 41, 41, 0.72);
        --cp-panel-strong: rgba(41, 41, 41, 0.96);
        --cp-sheen: rgba(255, 255, 255, 0.04);
        --cp-highlight: rgba(253, 142, 161, 0.12);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 24px;
        background: var(--cp-bg);
        color: var(--cp-text);
        font-family: "Segoe UI", Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: var(--text-body-medium, 14px);
        line-height: var(--leading-body-medium, 20px);
      }
      main {
        max-width: 640px;
        margin: 0 auto;
        padding: 24px;
        border: 1px solid var(--cp-border);
        border-radius: 16px;
        background: var(--cp-surface);
        overflow-wrap: anywhere;
      }
      h1 { margin: 16px 0; font-size: var(--text-title-large, 26px); line-height: 1.25; }
      p { margin: 16px 0; }
      .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 0.625rem;
        background: var(--cp-accent-soft);
        color: var(--cp-accent);
      }
      .muted { color: var(--cp-text-muted); }
      code { font-family: Consolas, "Courier New", Courier, monospace; }
      button {
        padding: 12px 16px;
        border: 0;
        border-radius: 0.625rem;
        background: var(--cp-accent);
        color: var(--cp-accent-fg);
        font: inherit;
        cursor: pointer;
      }
      button:hover { background: var(--cp-accent-hover); }
      button:focus-visible { outline: 2px solid var(--cp-accent); outline-offset: 4px; }
      #result { min-height: 24px; }
    </style>
  </head>
  <body>
    <main>
      <span class="badge">Repo-local sample</span>
      <h1>Test</h1>
      <p>${escapeHtml(message)}</p>
      <button id="test-button" type="button">Test interaction</button>
      <p id="result" role="status" aria-live="polite">Ready when you are.</p>
      <p class="muted">The agent can inspect this panel using the <code>get_info</code> action.
        This demo does not save button state.</p>
      <p class="muted">Instance: <code>${escapeHtml(instanceId)}</code></p>
    </main>
    <script>
      document.getElementById("test-button").addEventListener("click", () => {
        document.getElementById("result").textContent = "Hello! The Test canvas is working.";
      });
    </script>
  </body>
</html>`;
}
