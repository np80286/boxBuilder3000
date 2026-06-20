# boxBuilder Upgrade Plan

## Current Product Snapshot

boxBuilder is no longer just a simple volume calculator. The current app is a static HTML/CSS/vanilla JavaScript enclosure designer with a separated math layer in `boxMath.js` and a large UI/rendering layer in `app.js`.

Implemented today:

- Rectangular and wedge/slanted cabinet support
- Internal and external dimension workflows
- Sealed and ported enclosure modes
- Slot and round port inputs
- Net volume calculations with driver, port, and bracing displacement
- Constraint-aware target sizing and maximize-within-space sizing
- Front, Side, and Top 2D designer views
- Live drag editing for box dimensions and port positioning/length
- Experimental Three.js preview with view presets, lock controls, and 3D edit mode
- Parts Express paste/parse helper for recommended enclosure volumes
- Cut sheet output
- Local storage persistence
- Node-based math tests

This document now tracks what is done, what is active-but-needs-hardening, and what remains ahead.

---

## Architecture Status

### Calculation Layer

Status: partially achieved

What is already true:

- Core dimension and volume math lives in `boxMath.js`
- Internal/external conversion is separated from DOM rendering
- Constraint sizing helpers exist for target and maximize flows
- Wedge depth handling is implemented in the math layer

What still needs work:

- Port tuning and advanced acoustics are still mixed into broader app logic instead of living in a clearly isolated math module
- More enclosure/port-specific calculations should be moved out of `app.js`
- The math layer needs broader test coverage for the newer port and wedge features

### Rendering Layer

Status: implemented, but too centralized

What is already true:

- 2D SVG rendering exists for the main diagram plus front/side/top designer views
- 3D preview exists and consumes calculated state
- Drag interactions exist for 2D and 3D editing
- Port placement, folded slot routing, and wedge visuals are rendered in the UI

What still needs work:

- `app.js` has grown very large and should be split once behavior stabilizes
- Interaction/rendering/debug responsibilities are still tightly coupled
- 3D editing needs more stabilization before deeper refactors

---

## Completed Upgrades

### Wedge Cabinet Support

Status: done

Completed:

- Added wedge/slanted cabinet mode
- Added top-depth and bottom-depth handling
- Added wedge-aware internal/external conversions
- Added wedge volume math using average depth
- Preserved the rectangular workflow

### 2D Designer Upgrade

Status: done

Completed:

- Live SVG box diagram
- Front view
- Side view
- Top view
- Dimension labels
- Driver and port visualization
- Port length and position drag handles
- Box W/H/D drag editing
- Folded slot channel rendering in orthographic views

### Driver Modeling Foundation

Status: partially done

Completed:

- Driver size selection
- Driver quantity
- Driver cutout diameter
- Driver depth and mounting depth inputs
- Driver displacement support
- Basic driver visualization
- Parts Express recommendation paste/parse helper

Still missing:

- Named driver library/database
- Saved custom driver presets
- T/S parameter modeling
- Collision/clearance validation beyond current basic sizing behavior

### Ported Enclosure Support

Status: done

Completed:

- Sealed and ported enclosure modes
- Slot and round port modes
- Slot width/height/length/count controls
- Round diameter/length/quantity controls
- Port displacement inclusion in net volume
- Port positioning on enclosure faces
- Port extension handling
- Port preview rendering in 2D and 3D

### Auto Port and Folded Slot Work

Status: implemented, still being hardened

Completed:

- Auto port mode controls
- Auto length and full-auto workflows
- Port area-per-volume heuristics
- Minimum size/length controls
- Folded slot routing support
- Slot channel count, gap, fold axis, fold direction, and lead-run offset controls
- Interactive folded-slot editing in designer surfaces

Still needs work:

- More validation around edge cases
- Clearer UX around folded slot editing
- More test coverage for routing and tuning outcomes

### Constraint-Aware Sizing

Status: done

Completed:

- Trunk/hatch max constraints
- Fit status messaging
- Constraint-aware target-volume suggestion
- Maximize-volume-within-constraints mode
- Dimension priority ordering
- Weight-based auto dimension biasing

### Persistence and Build Workflow

Status: done

Completed:

- Local storage persistence for primary state
- Persisted Parts Express paste and parsed preview values
- Static app workflow with no build tooling required
- Node math test harness

---

## Active Upgrade Priorities

## Top 5 Critical Fixes

These are the most important fixes now that boxBuilder is live on GitHub Pages and needs to be trustworthy for end users.

### 1. Stabilize 3D Editing

Why it matters:

- The 3D preview is one of the most visible features in the app
- Inconsistent drag behavior or confusing mode switching will make users distrust the whole design
- This is the highest-risk interaction surface today

Priority work:

- Make edit mode vs camera mode unmistakable
- Verify drag behavior across real browser sessions and mobile touch use
- Reduce accidental camera movement while editing
- Keep the current debug/diagnostic support until interaction behavior is reliable

### 2. Add Real Test Coverage For Port, Wedge, And Folded-Slot Logic

Why it matters:

- The app now includes much more than basic box math
- Port sizing, displacement, folded routing, and wedge depth handling are easy to regress silently
- Production changes need stronger protection before the feature set grows further

Priority work:

- Add wedge conversion and volume tests
- Add port displacement and tuning-related tests
- Add folded-slot route/profile normalization tests
- Expand regression coverage around suggestion and constraint logic

### 3. Add Browser/E2E Coverage Using A Local HTTP Workflow

Why it matters:

- Many important failures are visual or interaction-based, not pure math failures
- GitHub Pages users will experience the app in a browser, not through Node-only tests
- The current `file://` limitations make some verification paths weak

Priority work:

- Stand up a simple local HTTP validation flow
- Add smoke tests for load, sizing, port mode switching, and designer interactions
- Add targeted E2E coverage for the most fragile 2D/3D flows

### 4. Strengthen Validation And User-Facing Warnings

Why it matters:

- End users need guidance when a design is invalid, unrealistic, or physically awkward
- Silent failure or vague warnings can lead to bad builds
- Production UX needs actionable feedback, not just internal correctness

Priority work:

- Improve invalid port geometry detection
- Add better folded-slot feasibility warnings
- Improve clearance and fit warnings
- Rewrite warnings so they suggest fixes, not just report problems

### 5. Refactor `app.js` Before More Major Feature Growth

Why it matters:

- The current file is carrying too much state, rendering, parsing, and interaction logic
- Every production fix is riskier while the code remains this centralized
- End-user support will be easier if the codebase is simpler to reason about

Priority work:

- Split 2D rendering, 3D rendering, state sync, and interaction logic into smaller modules
- Move more reusable calculations into `boxMath.js`
- Isolate Parts Express parsing and preview behavior
- Refactor only after the current interaction behavior is stable enough to protect

### 1. Stabilize 3D Editing

Status: active

Why this remains a priority:

- 3D preview exists, but interaction reliability is still the biggest product risk
- Pointer-event fallback and debug messaging are present, but the UX is still experimental
- This is the area most likely to confuse users if behavior drifts

Remaining work:

- Verify drag/edit behavior thoroughly in a served browser session
- Reduce accidental conflicts between camera controls and edit controls
- Improve handle discoverability and edit affordances
- Keep debug instrumentation available until behavior is trustworthy

### 2. Expand Test Coverage

Status: active

Remaining work:

- Add wedge-specific unit tests for depth conversion and net/gross volume behavior
- Add tests for port displacement math
- Add tests for auto-port sizing and tuning helpers
- Add tests for folded slot routing/profile normalization
- Add browser or E2E coverage through a local HTTP flow instead of `file://`

### 3. Refactor `app.js`

Status: active

Remaining work:

- Extract rendering utilities from event handling
- Separate 2D designer logic from 3D preview logic
- Move more reusable calculation code into `boxMath.js`
- Isolate Parts Express parsing and preview state from the main app flow

### 4. Documentation Catch-Up

Status: in progress

Remaining work:

- Keep `readme.md`, `upgrades.md`, and `ChatBridge.md` synchronized
- Document current port/fold/designer workflows more clearly
- Add a short manual test checklist for 3D editing

---

## Remaining Roadmap

### Near-Term

- Harden 3D editing and camera/edit mode transitions
- Improve production-readiness for GitHub Pages end users
- Improve folded slot UX and validation messaging
- Add browser/E2E coverage
- Refactor the rendering and interaction code into smaller modules

### Mid-Term

- Driver preset library and custom saved drivers
- Better clearance/collision validation
- Port velocity/compression warnings
- Recommended tuning-range guidance
- Better build/cut-sheet detail for real construction workflows
- Named save/load presets for user projects
- Production-safe onboarding/help text for first-time users

### Long-Term

- Bracing generator
- Material optimizer
- Kerf and construction-method options
- Print/export for cut sheet and current configuration
- DXF/OpenSCAD/STL/CNC-oriented exports
- Response/graph tooling inspired by WinISD-style workflows

---

## Items No Longer Accurate In The Old Plan

The previous version of this file assumed these were future upgrades. They are now already present in the app:

- Wedge/slanted cabinet support
- Multiple 2D engineering/designer views
- Sealed and ported enclosure modes
- Driver displacement and bracing displacement handling
- Slot and round port modeling
- Experimental Three.js preview
- Interactive 3D controls and edit mode
- Basic cut sheet generation

The previous recommendation to keep Three.js on a separate branch is also outdated. The experimental 3D preview is already integrated into the main app.

---

## Recommended Development Order From Here

1. Stabilize and verify 3D editing behavior.
2. Add unit coverage for wedge, port, and folded-slot logic.
3. Add browser/E2E coverage via local HTTP serving.
4. Strengthen validation and user-facing warnings for production use.
5. Refactor `app.js` into clearer math/render/interaction modules.
6. Improve driver presets, onboarding, and save/load workflows.
7. Expand construction/export workflows.

---

## Long-Term Goal

boxBuilder should feel like a lightweight enclosure-planning tool that sits between a simple calculator and a full CAD workflow:

- fast to use
- visually clear
- mobile-friendly
- accurate enough for planning
- interactive enough to make enclosure layout intuitive
