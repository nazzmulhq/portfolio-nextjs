## 🖥️ Desktop App

A standalone client for **Windows, macOS, and Linux**, built on Electron and reusing the same UI and database core as the extension.

- **Single window, tabbed workspace** — left **sidebar** (connections tree + grouped tool catalog), a **tab bar** on top, with close / close-others / close-all.
- **Own visual identity** — indigo-slate theme, teal accent, native typography, smooth animations.
- **Sidebar groups** — Connections (per-connection New Query / Builder / ERD / Edit / Remove), Visualize (Dashboards, Data Visualization), Compare & Move, Performance & Health, Generate, Admin, AI & MCP.
- **AI runs on Ollama**; connections, saved queries, dashboards and charts persist as JSON in the OS user-data dir.

## 🧩 Command Reference

Open the Command Palette (`Ctrl/Cmd+Shift+P`) and type **QuickDB**. Highlights:

- **Connections & schema** — Add / Edit / Remove Connection · Refresh · Create Table · Edit Table · Drop Table · Empty Table · Move Table · Create/Delete Index · Empty Database · Drop All Tables · Create Sample Database
- **Query & data** — New SQL Query · Open Query Builder · View Table Data · Browse Query History · Open Visualization · Pivot Table · Aggregation Builder · SQL Snippets
- **Compare / move** — Compare Data · Compare Schema · Generate Seed Data · Import/Export Database · Import/Export Table · Backup / Restore Database
- **Insights** — Database Health · Index Analysis · Profile Table Data · Query Profiler · Server Monitor · Dashboards · Query History Dashboard
- **Design / generate** — Generate Code from Schema · Generate Schema Docs · Generate Migration · Browse Database Objects · Find in Database
- **Security** — Users & Privileges
- **AI** — AI SQL Assistant · AI Chat · AI Advisor · AI Data Quality · AI Settings · Set AI API Key
- **MCP** — MCP Tools · Auto-Configure MCP for Detected Clients · Start/Stop MCP Server · Generate Cursor Rules
- **Local** — Local Data (Saved Queries / Notes / Activity) · Show Local Activity Database

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Context |
| --- | --- | --- |
| `Ctrl/Cmd+Enter` | Run current statement | Query Console |
| `Ctrl/Cmd+F` | Speed Search (filter tree) | Connections view |
| `Esc` | Clear tree filter | Connections view |
| `Ctrl/Cmd+Alt+E` | Browse history | Active panel |
| `Ctrl/Cmd+G` | Go to row | Table Viewer |
| `Ctrl/Cmd+Alt+N` | Set cell to NULL | Table Viewer |
| `Ctrl/Cmd+Alt+D` | Set cell to DEFAULT | Table Viewer |
| `Ctrl/Cmd+Alt+Z` | Revert cell | Table Viewer |
| `F2` | Rename alias/identifier | Query Console |

## ⚙️ Settings

| Setting | Description |
| --- | --- |
| `quickdb.maxRowsPerPage` | Rows fetched per page in the table viewer |
| `quickdb.autoConnect` | Auto-connect saved connections on startup |
| `quickdb.saveHistory` | Keep executed queries in local history |
| `quickdb.backupDir` | Default folder for backups |
| `quickdb.ai.provider` | AI provider: editor model · Ollama · cloud |
| `quickdb.ai.cloudProvider` | Cloud AI vendor (when provider = cloud) |
| `quickdb.ai.model` | Model name (e.g. an Ollama model) |
| `quickdb.ai.ollamaUrl` | Ollama server URL (default `http://localhost:11434`) |
| `quickdb.apiUrl` | Optional backend API URL |
| `quickdb.scheduledJobs.enabled` | Enable scheduled jobs |

## 🔐 Security

- **No hardcoded secrets** anywhere in source, fixtures, or docs.
- **Credential encryption** — passwords and SSH secrets embedded in exported MCP client configs are encrypted with **AES-256-GCM** using a machine-derived key (`hostname + platform + arch`); no key is stored, and a copied config is useless on another machine.
- **Query-safety model** — the visual builder validates table/column names against the live schema before generating SQL.
- **Write confirmations** — destructive operations (drop, truncate, privilege grants, migrations, AI-suggested writes) require confirmation.
- **MCP default-deny** — mutating MCP tools require approval.
- **Read-only mode** in the console blocks non-SELECT statements at the source.

## 🩺 Troubleshooting

- **"Test connection" says unsupported** — update QuickDB; all 85 engines support Test. If it still fails, the message is the driver's real error (check host/port/credentials, or SSL/SSH settings).
- **A panel looks stale after an update** — reload the window (`Developer: Reload Window`) so the latest webview bundle loads.
- **Chart text is invisible / axes missing** — the chart theme follows the app (light text on dark). Re-open the panel if it was cached.
- **AI panel just shows a hint** — AI isn't configured. Click **Open AI Settings**, start Ollama (`ollama serve`), and select an installed model.
- **MCP tools don't appear in the AI client** — restart the client after Setup and confirm the connection was ticked for that client.
- **SSH tunnel fails** — verify the SSH host is reachable, the key path is readable, and the database host/port are what the bastion sees.
- **Desktop app won't start** — from `desktop/`, delete `node_modules`, run `npm install`, then `npm start`.
