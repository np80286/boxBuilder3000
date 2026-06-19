

# boxBuilder Upgrade Plan

## Vision

Transform boxBuilder from a simple box volume calculator into a modern interactive speaker enclosure designer.

Target direction:

- Tesla-style modern UI
- Audio DSP / WinISD inspired workflows
- Real-time visual feedback
- Mobile-friendly
- 2D SVG engineering views
- Experimental 3D visualization using Three.js
- Support for sealed and ported enclosures
- Driver and port modeling
- Future export possibilities (OpenSCAD/STL/CNC)

---

# Core Architecture Direction

The app should evolve into two major layers:

## 1. Calculation Engine

Responsible for:

- Gross volume
- Net volume
- Material thickness
- Driver displacement
- Port displacement
- Slot port calculations
- Round port calculations
- Tuning frequency
- Air velocity warnings
- Port fit validation
- Internal clearance validation

This layer should remain pure JavaScript math logic.

No rendering logic should exist here.

---

## 2. Rendering Engine

Responsible for:

- SVG 2D previews
- Three.js 3D previews
- Dimension labels
- Driver placement
- Port placement
- Slanted cabinet rendering
- Internal panel visualization
- Warnings/highlights
- Camera interaction

The renderer should consume calculated state from the calculation engine.

---

# Immediate Upgrade Priorities

## Phase 1 — Slanted/Wedge Cabinet Support

Add support for wedge-style enclosures.

New dimensions:

```js
{
  width,
  height,
  topDepth,
  bottomDepth
}
```

Volume calculation:

```js
averageDepth = (topDepth + bottomDepth) / 2
volume = width * height * averageDepth
```

Goals:

- Slanted side profile
- Mobile-friendly dimension entry
- SVG wedge rendering
- Internal/net volume support
- Preserve existing rectangular workflow

---

## Phase 2 — Better 2D SVG Designer

Current SVG system should evolve into a true design preview.

Views:

- Front view
- Side view
- Top view
- Combined engineering view

Support rendering:

- Driver cutout
- Driver placement
- Slot ports
- Round ports
- Dual round ports
- Dimension labels
- Slanted cabinets
- Internal port walls

Suggested renderer structure:

```js
box
 ├── front panel
 ├── side panels
 ├── top panel
 ├── bottom panel
 ├── driver objects
 └── port objects
```

SVG remains ideal for:

- crisp labels
- lightweight rendering
- responsive layouts
- engineering-style previews
- mobile performance

---

## Phase 3 — Driver Modeling

Add real driver definitions.

Driver data structure:

```js
{
  name,
  size,
  cutoutDiameter,
  mountingDepth,
  displacement,
  recommendedSealed,
  recommendedPorted
}
```

Future possibilities:

- Driver database
- Dayton Audio presets
- JL Audio presets
- Custom driver save/load
- T/S parameter support later

Visual support:

- Driver circle rendering
- Mounting depth visualization
- Collision warnings
- Multiple drivers

---

# Port System Roadmap

## Phase 4 — Ported Enclosure Support

Add enclosure modes:

```js
sealed
ported
```

Port types:

```js
slot
round
```

---

## Slot Port Modeling

Inputs:

```js
{
  width,
  height,
  length
}
```

Capabilities:

- Front slot ports
- Bottom slot ports
- Side slot ports
- Internal wall visualization
- Port displacement calculation
- Folded port support later

---

## Round Port Modeling

Inputs:

```js
{
  diameter,
  length,
  quantity
}
```

Capabilities:

- Single round port
- Dual round ports
- Aero ports later
- Precision flared ports later

---

## Net Volume System

Net volume must subtract:

```js
netVolume =
  grossVolume
  - driverDisplacement
  - portDisplacement
  - bracingDisplacement
```

Display:

- Gross volume
- Net volume
- Remaining airspace
- Port displacement
- Driver displacement

---

# Three.js Experimental Branch

## Goal

Add interactive 3D enclosure visualization.

This should initially exist on a separate branch.

Suggested branch:

```bash
git checkout -b threejs-preview
```

---

## Important Rule

Three.js should NOT become the calculation engine.

Three.js should ONLY visualize calculated state.

Math remains normal JS.

---

## Three.js Phase 1

Render:

- Basic rectangular cabinet
- Width/height/depth
- Camera orbit controls
- Mobile touch rotation

Goals:

- Verify performance
- Validate architecture
- Test responsiveness
- Test mobile rendering

---

## Three.js Phase 2

Add:

- Slanted cabinets
- Real panel geometry
- Front baffle rendering
- Driver cutout holes
- Port cutout holes

---

## Three.js Phase 3

Add:

- Driver meshes
- Slot port tunnels
- Round ports
- Internal walls
- Transparency mode
- Wireframe mode
- Exploded view

---

## Three.js Phase 4

Add interaction:

- Rotate
- Zoom
- Pan
- Reset camera
- Toggle views
- Section cut views

---

# Potential Future Features

## Acoustic Features

Possible future calculations:

- Port tuning frequency
- Port velocity
- Compression warnings
- Recommended tuning ranges
- Sealed Qtc estimates
- Group delay graphs
- Excursion estimates

Potential future integrations:

- WinISD-style graphs
- Frequency response simulation
- Cabin gain simulation

---

## Box Construction Features

Potential additions:

- Bracing generator
- Cut sheet generation
- Material optimizer
- Kerf compensation
- CNC export
- OpenSCAD export
- STL export
- DXF export

---

## Visual Features

Ideas:

- Realistic textures
- Carpet/vinyl preview
- Transparent panels
- Neon UI effects
- Animated lighting
- Internal airflow visualization

---

# Recommended Development Order

## Stable Path

1. Slanted cabinet math
2. SVG wedge rendering
3. Driver modeling
4. Port displacement math
5. Slot/round port rendering
6. Net volume system
7. Port tuning calculations
8. Three.js preview branch
9. Interactive 3D features
10. Export systems

---

# Important Architectural Notes

## Keep Math Separate From Rendering

The rendering engine should never calculate enclosure logic.

Everything should come from a shared enclosure state.

---

## Avoid Overengineering Early

Do NOT immediately build:

- full CAD
- physics simulation
- mesh editing
- complex collision systems
- procedural geometry engines

First goal:

Create a fast, intuitive enclosure designer.

---

# Long-Term Goal

boxBuilder should eventually feel like:

- WinISD + modern SaaS UI
- audio DSP software
- lightweight CAD preview
- mobile-friendly speaker enclosure designer
- enthusiast-grade enclosure planning tool