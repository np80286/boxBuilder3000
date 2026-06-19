# Chat Bridge

This file is the shared handoff context between Codex and ChatGPT sessions for the Box Builder project.

## Project
- Name: Box Builder
- Directory: /Users/np303/dev/boxBuilder
- Stack: HTML, CSS, vanilla JavaScript

## Current State
- Single-page speaker enclosure designer is implemented in static HTML/CSS/vanilla JS.
- Core calculation, validation, target-volume helper, presets, cut-sheet output, and localStorage persistence are active.
- Pure math helpers live in `boxMath.js`; Node-based math tests live in `test.js`.
- Rectangular and wedge cabinet math are in progress, including top/bottom depth handling.
- Sealed and ported enclosure controls exist, including slot/round ports, bracing displacement, port offsets, port extension modes, and auto port sizing controls.
- Live box diagram supports designer handles for box W/H/D plus port position/length without resizing the driver cutout.
- Front/Side/Top designer views are implemented and synchronized with the live diagram.
- Experimental Three.js preview is implemented with lock zoom, lock view, and 3D edit mode controls.
- 3D editing is still the active trouble spot; pointer-event fallback was added, but rendered validation in the in-app browser was blocked by `file://` browser automation policy.
- Trunk/max constraint defaults are set for test Scion: H 16 in, W 38 in, D 22 in.

## Files in Scope
- /Users/np303/dev/boxBuilder/index.html
- /Users/np303/dev/boxBuilder/styles.css
- /Users/np303/dev/boxBuilder/app.js
- /Users/np303/dev/boxBuilder/boxMath.js
- /Users/np303/dev/boxBuilder/test.js
- /Users/np303/dev/boxBuilder/readme.md
- /Users/np303/dev/boxBuilder/ChatBridge.md
- /Users/np303/dev/boxBuilder/upgrades.md
- /Users/np303/dev/boxBuilder/src/wedge_cabinet.py

## Change Log

### 2026-03-29
- Bootstrapped app structure and implemented calculator UI/logic.
- Added polished dark dashboard styling and responsive layout.
- Added README project status and local run instructions.
- Initialized Git repository and created first collaboration bridge file.
- Added target-volume helper with presets and suggested-dimension apply flow.
- Added cut-sheet panel with live dimensions.
- Added localStorage state persistence.
- Refined dimension input layout to a compact desktop grid with constrained control widths.
- Added trunk-constraint inputs (max width/height/depth) in target helper.
- Added constraint-aware target suggestions and constrained max-net readout.
- Added fit status messaging and validation warning when current box exceeds trunk limits.
- Tightened desktop numeric input width further for compact value-focused controls.
- Increased SVG scale utilization and fixed off-screen dimension label clipping.

### 2026-06-17
- Added/continued wedge cabinet support in math and UI.
- Added/continued ported enclosure modeling controls and 2D/3D preview rendering.
- Added Front/Side/Top designer views with synchronized drag handles.
- Corrected live diagram design behavior so box W/H/D handles resize the cabinet, while the speaker cutout remains fixed-size.
- Added 3D lock zoom, lock view, and edit mode controls.
- Added pointer-event based 3D drag fallback and 3D edit status messaging.
- Verified `node --check app.js` and `node test.js` pass.

## Known Issues / Notes
- No build tooling required; static app.
- Automated math tests exist, but there is no browser/E2E test coverage yet.
- Browser automation cannot directly validate the current `file://` app because the in-app Browser tool blocks direct `file://` navigation.
- 3D editing remains unverified by automation and should be manually tested first after each interaction change.
- Current worktree is dirty with large changes in `app.js`, `boxMath.js`, `index.html`, `styles.css`, and an untracked `src/` folder.

## Next Steps
1. Verify 3D edit mode manually on `file:///Users/np303/dev/boxBuilder/index.html?v=2026-06-12-14`: lock zoom, lock view, enable editing, then confirm W/H/D drag changes the box.
2. If 3D editing still does not respond, add an on-screen event diagnostic panel showing pointerdown/pointermove target, edit-mode state, selected drag action, and dimension deltas.
3. Stabilize the 3D UX: reduce visual clutter, make W/H/D handles obvious, and separate camera controls from edit controls cleanly.
4. Add browser/E2E coverage through a local HTTP dev server or other approved non-`file://` validation route.
5. Add unit tests for wedge cabinet depth conversion and volume math.
6. Add unit tests for port displacement, auto port sizing, and port tuning calculations.
7. Refactor large rendering/event code out of `app.js` once behavior is stable.
8. Update `readme.md` to reflect the current designer/ported/3D capabilities.
9. Later backlog: unit switching, alternate cut-sheet construction styles, print/export for cut sheet and current configuration.

## Handoff Instructions
- Keep this file updated after each meaningful change.
- Include date and concise bullet points for modifications.
- List exact file paths touched.

## UI Refinement Directive (2026-03-29)

Refine the dimension input layout to improve density and visual quality.

### Problem

Current numeric input fields (width, height, depth, wood thickness) stretch full-width on desktop, creating excessive empty space and reducing the “instrument panel” feel.

### Requirements

- Do NOT use full-width inputs for short numeric values on desktop
- Group dimension inputs into a tighter grid layout
- Inputs should only be as wide as they need to be
- Maintain good touch usability on mobile (stacking is fine)

### Desired Behavior

- Desktop: compact multi-column layout (2–4 columns depending on viewport)
- Mobile: stacked layout
- Use sensible max-widths for numeric inputs
- Keep labels aligned and visually clean

### Design Intent

The UI should feel like a **precision tool / control panel**, not a generic stretched form.

Think:
- tight
- deliberate
- efficient

NOT:
- oversized
- airy
- form-builder default layouts

### Implementation Guidance

- Use CSS grid or flexbox for layout control
- Apply max-width constraints to numeric inputs
- Avoid forcing inputs to fill full card width
- Maintain spacing consistency with existing design system

Update `styles.css` and `index.html` as needed.
