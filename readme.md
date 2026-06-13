# SafeKeep Checkroom
> **Convention Bag & Lunch Token System**
> 
> A local-first, offline-ready Progressive Web App (PWA) built specifically for JW Convention Checkrooms to manage bags, lunch boxes, and personal items.

---

## 📖 Table of Contents
1. [Key Features](#-key-features)
2. [Folder Structure](#-folder-structure)
3. [How it Works](#%EF%B8%8F-how-it-works)
4. [Deployment & Run Options](#-deployment--run-options)
   - [Option A: Standalone File (Simplest)](#option-a-standalone-file-simplest)
   - [Option B: Local Web Server (For PWA Install)](#option-b-local-web-server-for-pwa-install)
5. [User Workflow Guide](#-user-workflow-guide)
   - [1. Setup & Session Select](#1-setup--session-select)
   - [2. Checking In](#2-checking-in)
   - [3. Checking Out](#3-checking-out)
   - [4. Re-Checking In (Repeat Cycle)](#4-re-checking-in-repeat-cycle)
   - [5. Backup & Recovery](#5-backup--recovery)
6. [Hardware & Thermal Printing](#-hardware--thermal-printing)
7. [Technical Details](#%EF%B8%8F-technical-details)

---

## 🌟 Key Features

* **Zero Costs & Offline First:** Runs entirely inside the browser. No server connection, databases, or API keys required. It functions perfectly in airplane mode.
* **Persistent Local Storage:** Auto-saves every entry instantly to the browser's `localStorage`. Survive refreshes, crashes, and accidental shutdowns.
* **Double Session Sequencing:** Generates tokens in the format `[Day][Session]-[Sequence]` (e.g., `F1-001`, `S2-047`, `U1-012`) to prevent duplicate physical tags across shifts.
* **Repeat Check-In linking:** Easily re-registers a lunch bag for the afternoon session after a visitor returns it at lunch, maintaining a linked trail.
* **Compact Slip Printing:** Custom CSS styles strip down everything except a clean receipt slip when triggers invoke the browser's print dialog, optimized for 80mm thermal receipt printers.
* **Excel / JSON Backups:** Export full database logs to CSV (for Excel analysis) or raw JSON backups (to migrate to a new station or restore data).

---

## 📂 Folder Structure

The project has been constructed as a lightweight, clean vanilla stack:

* [index.html](file:///D:/My%20projects/safeKeep-checkroom/index.html) — Single Page App (SPA) structure, layouts, and inline SVGs.
* [index.css](file:///D:/My%20projects/safeKeep-checkroom/index.css) — Theme systems (Light/Dark), responsive grids, print overrides, and transitions.
* [app.js](file:///D:/My%20projects/safeKeep-checkroom/app.js) — Application controllers, state syncing, CSV generators, and event handlers.
* [manifest.json](file:///D:/My%20projects/safeKeep-checkroom/manifest.json) — Web app manifest defining installation parameters for PWA.
* [sw.js](file:///D:/My%20projects/safeKeep-checkroom/sw.js) — Service worker to cache assets offline.
* [icon.svg](file:///D:/My%20projects/safeKeep-checkroom/icon.svg) — Premium vector logo used for branding and PWA app icons.

---

## 🕹️ How it Works

The app operates on a clean state lifecycle:

```
[User Forms] ──► [JS App Controllers (app.js)] ──► [LocalStorage State]
                       │                     │
                       ▼                     ▼
             [Print Ticket CSS]     [CSV/JSON Exports]
```

All data is structured according to the following layout:
```json
{
  "settings": {
    "conventionName": "2026 'Declare the Good News!' Regional Convention",
    "conventionSubtitle": "Checkroom Department — Assembly Hall",
    "activeDay": "F",
    "activeSession": "1",
    "theme": "dark"
  },
  "counters": {
    "F1": 12, "F2": 5, "S1": 0, "S2": 0, "U1": 0, "U2": 0
  },
  "items": [
    {
      "id": "uuid",
      "token": "F1-012",
      "day": "F",
      "session": 1,
      "type": "Lunch Box",
      "ownerName": "Brother John Doe",
      "notes": "Red steel hotbox in yellow plastic bag",
      "checkedInAt": "2026-06-13T07:45:00.000Z",
      "checkedOutAt": "2026-06-13T12:15:00.000Z",
      "status": "returned",
      "reCheckins": ["F2-003"],
      "previousToken": null
    }
  ]
}
```

---

## 🚀 Deployment & Run Options

### Option A: Standalone File (Simplest)
1. Double-click the [index.html](file:///D:/My%20projects/safeKeep-checkroom/index.html) file to open it in Google Chrome, Microsoft Edge, or Safari.
2. The application works instantly. 
3. *Note: Browser service workers are disabled when running via `file://` protocols, so local storage works, but you cannot install it as a standalone app icon on your desktop.*

### Option B: Local Web Server (For PWA Install)
To utilize the full service-worker caching and install the app as a standalone window (with no address bar):
1. **Using Python:** Open terminal in the directory and run:
   ```bash
   python -m http.server 8000
   ```
2. **Using Node.js:** Install a tiny server like `http-server`:
   ```bash
   npx http-server -p 8000
   ```
3. Open `http://localhost:8000` in Google Chrome or Edge.
4. Click the **"Install App"** icon in the browser address bar to install it as a desktop utility.

---

## 👤 User Workflow Guide

### 1. Setup & Session Select
1. Navigate to the **Settings** view.
2. Fill out the **Convention Name** (e.g. *2026 Regional Convention*) and **Subtitle/Venue**.
3. Choose the active context (e.g. *Day: Friday, Session: 1*).
4. Tap **Save Active Context**. The header badge will update.

### 2. Checking In
1. Go to the **Check In** view. The system displays the next token code (e.g., `F1-001`).
2. Click the visual item category: **Lunch Box** 🍱, **Bag** 🎒, **Luggage** 🧳, or **Other** 📦.
3. Type the **Owner Name** (optional) and **Notes** (e.g. *"Tupperware box"*).
4. Click **Confirm & Generate Token**.
5. A popup card will overlay displaying the token code in **GIANT TEXT**. 
6. Handwrite this code onto a paper tag, or tap **Print Slip** to print a receipt tag.

### 3. Checking Out
1. Go to the **Check Out** view.
2. Type the owner's token code (e.g., `f1-001`) into the search bar.
3. The detail card instantly loads. Verify that the description matches the physical item.
4. Tap **Confirm Return to Owner**. The item marks as returned.
5. *Tip: You can also tap on any item from the **"Currently Held Items"** quick-list to load it without typing.*

### 4. Re-Checking In (Repeat Cycle)
If a visitor returns their lunch bag at lunchtime (Checking Out) and wishes to hand it back for the afternoon session:
1. Load the item details under **Check Out**.
2. Tap **Re-Check In (Generate New Token)**.
3. The app automatically navigates to **Check In**, pre-filling category, owner name, and references the old token code inside the notes.
4. Click **Confirm** to generate the session 2 token (e.g. `F2-003`).

### 5. Backup & Recovery
1. It is recommended to download a JSON database backup at the end of every morning and evening shift.
2. Go to **Settings** or the **Log / History** tab.
3. Tap **Export Backup (.json)**.
4. In case of browser clearing, select the JSON file inside the **Database Backup & Restore** panel to restore all entries.

---

## 🖨️ Hardware & Thermal Printing

SafeKeep uses standard CSS print queries, meaning it requires no drivers or libraries. 
* **Receipt Width:** Optimized for standard **80mm (3-inch)** thermal receipt printers.
* **Setup:**
  1. Trigger print on any item (via Check-In modal or Check-Out card).
  2. In the browser print dialog, select your thermal printer.
  3. Under **More Settings**, set **Margins** to `None` or `Minimum`, and **uncheck** `Headers and footers`.
  4. Save settings. Future prints will trigger with one tap.

---

## 🛠️ Technical Details

* **CSS Variables:** The visual theme utilizes custom properties (`--bg-primary`, `--text-primary`, `--accent-primary`) that instantly swap values when the `data-theme` attribute on the `<html>` root switches between `light` and `dark`.
* **Dynamic Search:** Input event listeners process searches in O(1) time by targeting items list lookups.
* **PWA Caching:** `sw.js` uses a Cache-First strategy. Updates to HTML/CSS/JS will be processed by incrementing the `CACHE_NAME` version string inside `sw.js`.
