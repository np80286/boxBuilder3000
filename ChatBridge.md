# Chat Bridge

This file is the shared handoff context between Codex and ChatGPT sessions for the Box Builder project.

## Project
- Name: Box Builder
- Directory: /Users/np303/dev/boxBuilder
- Stack: HTML, CSS, vanilla JavaScript

## Current State
- Initial single-page speaker box designer is implemented.
- Core calculation, validation, and live SVG rendering are active.
- Target-volume helper/presets are implemented.
- Cut-sheet output is implemented.
- localStorage persistence is implemented.
- Dimension input layout has been compacted for desktop density.

## Files in Scope
- /Users/np303/dev/boxBuilder/index.html
- /Users/np303/dev/boxBuilder/styles.css
- /Users/np303/dev/boxBuilder/app.js
- /Users/np303/dev/boxBuilder/readme.md
- /Users/np303/dev/boxBuilder/ChatBridge.md

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

## Known Issues / Notes
- No automated tests yet.
- No build tooling required; static app.

## Next Steps
1. Add unit switching (inches/feet/mm) with a global setting.
2. Add alternate cut-sheet construction styles.
3. Add print/export for cut sheet and current configuration.

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
