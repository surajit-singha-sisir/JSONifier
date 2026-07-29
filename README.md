# JSONifier - EMIS School Info Converter & Visual Tree Explorer 🏫✨

A premium, client-side, zero-dependency Markdown-to-JSON converter and high-performance interactive diagrammatic visualizer designed specifically for school information files generated from [emis.gov.bd](http://emis.gov.bd). 

Designed to be hosted with **$0 overhead on GitHub Pages**, this application also exposes a fully functional **Serverless Web API** that parses and converts online school documents on-the-fly!

---

## 🚀 Live Links
* **Live Web Application:** [https://surajit-singha-sisir.github.io/JSONifier/](https://surajit-singha-sisir.github.io/JSONifier/)
* **GitHub Repository:** [https://github.com/surajit-singha-sisir/JSONifier](https://github.com/surajit-singha-sisir/JSONifier)

---

## 🌟 Key Features

### 1. Robust Markdown to JSON Parser (`converter.js`)
* **Bengali-to-English Mapping:** Auto-translates Bengali table headers and keys directly to their strict English template equivalent.
* **Strict Schema Compliance:** Extracts exactly and only the 17 top-level and nested properties specified in the target `school_new.json` schema. Any extra fields or columns are strictly ignored.
* **Consistent Type Safety:** Parses leading-zero strings into clean integers (phone, mobile, post code, serial numbers) and normalizes empty cells to native `null`.
* **Intelligent Date interpreter:** Emulates historical date parsing behavior. Correctly converts standard `DD/MM/YYYY` strings (where day `<= 12`) to standard `YYYY-MM-DD` and preserves raw strings when day `> 12`.

### 2. Immersive Diagrammatic Visual Tree Explorer
* **120 FPS In-Place DOM Renderer:** Drag cards and resize their width and height smoothly without awkward stutters, layout thrashing, or page lag.
* **Dotted Bezier Connector Lines:** Draws gorgeous, smooth curved connection paths equipped with parents exit ports and child entry dots.
* **Responsive Text Layout Scaling:** Card contents are designed in pure CSS flexbox (`min-w-0 flex-1 truncate`). Dragging a card wider **instantly reveals truncated text** and moves the ellipsis (`...`) in real-time.
* **Symmetrical Collapsible Nodes:** Click on any card body to expand or collapse sub-trees with beautiful layout sliding transitions. Fully inside-the-card badges show collapse states (`+` or `–`) and items count.
* **Camera Focus & Auto-Zoom:**
  * **On Expand:** Viewport camera smoothly glides and auto-adjusts scale (zooming in or out) to center and frame the parent and all newly visible child cards comfortably.
  * **On Collapse:** Viewport camera glides and zooms in smoothly to keep the current collapsed node focused and legible.

### 3. Real-Time JSON Node Sync-Editor
* Clicking a card's header slides open a side panel containing a live **`<textarea>` JSON Editor**.
* **Live Synchronization:** Editing the JSON inside the panel validates and updates the underlying data slice, re-constructing card properties and re-rendering the diagram **on-the-fly in real-time as you type!**
* **Syntax Diagnostics:** Real-time feedback warns you of JSON syntax errors (glowing red status indicator) without breaking the tree.

### 4. Interactive Action Suite
* **Field Hover Copying:** Hover over any key-value row inside a card to reveal a copy icon and click to copy only that field's value, accompanied by animated top toast notifications.
* **Pretty / Minified Selector:** View, copy, or download your formatted outputs in either multi-line indented pretty JSON or single-line minified JSON.
* **Multi-Format Input Support:** Directly drag-and-drop or browse standard `.md` or `.txt` school scrapings, or upload pre-converted `.json` files directly to visualize and edit!

---

## 🌐 Serverless Query Parameter API (GitHub Pages Natively)

Even though GitHub Pages is a static hosting platform, **JSONifier** includes a built-in **Serverless API wrapper** that processes online files on load using pure browser JavaScript.

### API 1: Fetch and View on Dashboard
Direct your users or link from an external page to load and visualize an online file immediately:
```
https://surajit-singha-sisir.github.io/JSONifier/?url=https://example.com/school.md
```
* **How it works:** The page fetches the online Markdown file, converts it on the fly, and loads the interactive draggable cards in the Tree View automatically.

### API 2: Pure JSON Response (For external fetch scripts)
If you want to query your GitHub Pages site programmatically from an external server (Python, Node.js, PHP, curl) and have it return **only the raw converted JSON string**:
```
https://surajit-singha-sisir.github.io/JSONifier/?url=https://example.com/school.md&format=json
```
* **How it works:** The site bypasses the dashboard interface entirely and outputs **only the raw, pretty-printed parsed JSON text string** as the full page content! Your external scripts can fetch this URL directly and run `json.loads()` or `JSON.parse()` on the response body!

> **CORS Notice:** Because fetching is performed client-side, the external server hosting the `.md` or `.json` file must allow CORS headers (like GitHub raw contents or Gists). If they are blocked, utilize a free CORS proxy inside your request (e.g. `https://api.allorigins.win/raw?url=`).

---

## 🛠️ How to Host on GitHub Pages

1. **Create a GitHub Repository:**
   * Log into GitHub and create a public repository named `JSONifier`.
2. **Commit Project Files:**
   * Commit the following files to your repository:
     * `index.html` (The dashboard interface)
     * `converter.js` (The parser)
     * `README.md`
     * `LICENSE`
3. **Enable GitHub Pages:**
   * Navigate to **Settings** ➔ **Pages** inside your repository.
   * Under **Build and deployment**, select **Deploy from a branch**.
   * Under **Branch**, select `main` (or `master`) and directory `/ (root)`.
   * Click **Save**.
4. **Deploy Complete:**
   * Your site will go live in less than 2 minutes at `https://surajit-singha-sisir.github.io/JSONifier/`!

---

## 📄 License
This project is open-source and licensed under the **MIT License**. Read the [LICENSE](./LICENSE) file for more details.
