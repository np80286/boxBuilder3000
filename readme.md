# Box Builder — Codex Build Prompt

You are building a **responsive web-based speaker box calculator**.

Your goal is to create a clean, fast, mobile-first single-page app using **HTML, CSS, and vanilla JavaScript**.

Do NOT over-engineer. Do NOT add frameworks unless absolutely necessary.

---

# CORE OBJECTIVE

Build a rectangular sealed subwoofer enclosure calculator that:

- accepts box dimensions
- supports internal/external dimension modes
- accounts for wood thickness
- calculates internal volume
- subtracts driver displacement
- displays results clearly
- updates instantly on input change

---

# FILE STRUCTURE

Create the following files:

- index.html
- styles.css
- app.js

Keep everything simple and readable.

---

# UI REQUIREMENTS

## Layout

- mobile-first
- centered content
- max-width container for desktop
- clean card-based layout

## Sections

### Header
- title: "Box Builder"
- subtitle: "Subwoofer enclosure calculator"

### Input Card
Include inputs for:

- width (number)
- height (number)
- depth (number)
- wood thickness (default 0.75)

### Dimension Mode Toggle
- radio or toggle:
  - external
  - internal

### Driver Section

- dropdown: 8, 10, 12, 15, 18
- "Advanced" collapsible section with:
  - driver cutout diameter
  - mounting depth
  - driver displacement

### Output Card
Display:

- internal dimensions
- external dimensions
- gross volume (in³ and ft³)
- net volume before driver
- net volume after driver

### Validation Area
Display warnings such as:

- invalid dimensions
- negative internal size
- driver doesn't fit

### Visualization

Render a simple **SVG box diagram** that updates live:

- label width, height, depth
- no real 3D engine

---

# DATA MODEL

Use a single state object:

```js
const state = {
  dimensionMode: 'external',
  width: 0,
  height: 0,
  depth: 0,
  woodThickness: 0.75,
  driverSize: 12,
  driverCutout: 11.1,
  mountingDepth: 6.5,
  driverDisplacement: 0.08
};
```

---

# DRIVER DEFAULTS

When driver size changes, auto-fill defaults:

```js
const DRIVER_DEFAULTS = {
  8:  { cutout: 7.25, depth: 4.5, displacement: 0.03 },
  10: { cutout: 9.25, depth: 5.5, displacement: 0.05 },
  12: { cutout: 11.1, depth: 6.5, displacement: 0.08 },
  15: { cutout: 13.8, depth: 7.5, displacement: 0.14 },
  18: { cutout: 16.6, depth: 9.0, displacement: 0.22 }
};
```

---

# CALCULATION RULES

## Internal Dimensions (from external)

internal = external - (2 × wood thickness)

## External Dimensions (from internal)

external = internal + (2 × wood thickness)

## Volume

- cubic inches = w × h × d
- cubic feet = cubic inches / 1728

## Net Volume

net = gross ft³ - driver displacement

---

# VALIDATION RULES

Show warnings if:

- any internal dimension <= 0
- mounting depth > internal depth
- cutout > internal width OR height

Do not crash on invalid input.

---

# FUNCTIONAL REQUIREMENTS

## JavaScript

- keep logic separate from DOM
- use pure helper functions for math
- update UI on every input change

## Required Functions

- getInternalDimensions()
- getExternalDimensions()
- getVolume()
- getNetVolume()
- validateBox()
- renderUI()
- renderSVG()

---

# STYLING

Aim for a UI that feels:

- techy
- modern
- polished
- slightly futuristic / space-age
- visually impressive without being cluttered

## Visual Direction

Use a look inspired by:

- dark dashboard interfaces
- neon-accented control panels
- subtle sci-fi / HUD-style design
- clean product UI, not gamer-chaos

## Design Inspiration Reference

Think:

- Tesla UI
- professional audio DSP software interfaces
- modern SaaS dashboards

In short:

"Think Tesla UI meets audio DSP software meets modern SaaS dashboard"

The app should feel like a premium box-design tool, not a plain form.

## Styling Requirements

- dark theme by default
- strong contrast
- rounded cards
- subtle glass / panel feel where appropriate
- soft glow accents used sparingly
- modern typography
- clear visual hierarchy
- generous spacing
- readable on mobile
- smooth hover/focus states
- polished input styling
- outputs should feel important and “instrument-like”

## Preferred Color Approach

Use a dark base with 1–2 bright accent colors such as:

- electric blue
- cyan
- violet
- subtle teal

Avoid rainbow overload or cheesy “gaming” aesthetics.

## Specific UI Suggestions

- cards should feel like control modules
- result values should be bold and prominent
- labels should be clean and slightly muted
- toggles should feel modern
- the SVG visualization should look integrated into the design, not like a raw developer placeholder
- validation/warning states should still look polished

## Important

Make it look cool.

Do not make it tacky.

Favor tasteful futuristic UI over gimmicks.

---

# NON-GOALS

Do NOT implement:

- ported box math
- sloped boxes
- multiple drivers
- advanced acoustics
- saving/loading

---

# OUTPUT EXPECTATION

When complete, the app should:

- instantly update calculations as user types
- clearly show all values
- handle bad input gracefully
- visually represent the box

---

# IMPORTANT

Prioritize:

1. correctness of math
2. simplicity of architecture
3. responsiveness
4. polished visual design

Avoid:

- over-abstracting
- unnecessary dependencies

---

# SHARING WITH CLOUDFLARE TUNNEL

To share Box Builder with others (test on phone, share with teammates, etc.):

## 1. Start the local web server

```bash
cd /Users/np303/dev/boxBuilder
python3 -m http.server 8080
```

This serves the app on `localhost:8080`.

## 2. In a new terminal, create a Cloudflare tunnel

```bash
cloudflared tunnel --url localhost:8080
```

This generates a temporary public URL like:
```
https://climb-median-recovered-helpful.trycloudflare.com
```

## 3. Share the URL

Send the public URL to anyone you want to share with. They can visit it on any device (phone, tablet, etc.) from anywhere with internet.

## 4. Keep both terminals running

- Terminal 1: Python HTTP server (stays running)
- Terminal 2: Cloudflare tunnel (stays running)

Changes to files are reflected immediately when visitors refresh.

## Notes

- This uses Cloudflare's free quick tunnel (no account needed)
- The URL is temporary and changes each time you restart the tunnel
- For a permanent setup, create a named tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps

---

# TESTING

## Run Math Tests

Test the calculation functions against known values from the screenshot (4.0 ft³ box):

```bash
cd /Users/np303/dev/boxBuilder
node test.js
```

Or in browser console (after loading `app.js` then `test.js`):

```javascript
runAllTests()
```

Tests verify:
- Volume conversions (in³ to ft³)
- Internal/external dimension calculations
- Net volume after driver displacement
- Known values from the design
- complicated architecture

## UI Quality Bar

The interface should feel intentionally designed.

Not just “functional.”

Codex should spend real effort on:

- layout polish
- spacing consistency
- attractive color usage
- modern controls
- a visually cohesive card system
- making the calculator feel like a real product

---

# NEXT STEP

Build the full working app.

Do not ask questions. Make reasonable assumptions where needed.

---

# PROJECT STATUS (March 29, 2026)

Current version is implemented with:

- `index.html`
- `styles.css`
- `app.js`

Includes:

- external/internal dimension mode
- wood thickness handling
- gross and net volume calculations
- driver defaults and advanced controls
- live validation warnings
- live SVG visualization
- target-volume helper with quick presets
- suggested dimension apply flow
- cut-sheet output (panel list with dimensions/qty)
- localStorage persistence for last-used settings
- trunk/vehicle max-dimension constraints for fit checks
- max constrained net-volume estimate
- compact desktop input sizing for numeric fields
- SVG scaling and label bounds handling

Trunk baseline defaults (current test vehicle):

- max height: `16 in`
- max width: `38 in`
- max depth: `22 in`

---

# LOCAL RUN

From the project directory:

```bash
python3 -m http.server 8080
```

Then open: <http://localhost:8080>

Stop server: `Ctrl + C`

---

# CHAT CONTINUITY WORKFLOW

Use `ChatBridge.md` as the shared handoff log between Codex and ChatGPT conversations.

When making changes, update `ChatBridge.md` with:

1. what changed
2. files touched
3. current known issues
4. next suggested steps

---

# KNOWN LIMITATIONS

- No automated test suite yet.
- Static app only (no backend/build step required).
- Box math is for sealed rectangular enclosures only.
