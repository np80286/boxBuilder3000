# Box Builder

Box Builder is a browser-based speaker enclosure designer for planning subwoofer boxes.

It helps you enter driver information, choose a sealed or ported enclosure, set available space limits, and see the box update with live volume calculations and diagrams.

The app is intentionally simple to run: it is a static HTML/CSS/JavaScript project. No account, backend, or build step is required.

## What It Does

- Calculates internal and external box dimensions.
- Supports sealed and ported enclosure planning.
- Accounts for wood thickness, driver displacement, port displacement, and bracing displacement.
- Shows gross and net airspace in cubic feet.
- Suggests box dimensions from a target volume.
- Lets you set maximum trunk or hatch space limits.
- Draws a live box diagram with width, height, and depth labels.
- Includes Front, Side, and Top designer views.
- Includes an experimental 3D preview.
- Generates a basic cut sheet for panel dimensions.

## Who This Is For

Box Builder is for people designing subwoofer enclosures who want a visual helper before cutting wood.

You can use it to answer questions like:

- Will this box fit in my available space?
- What is the internal air volume?
- How much volume is left after driver and port displacement?
- What dimensions get me close to my target net volume?
- Where does the driver or port sit on the box?

This tool is a design aid. Always double-check final dimensions, driver requirements, port tuning, and vehicle fit before building.

## How To Use It

### 1. Open The App

Open `index.html` in a browser, or serve the folder with a local web server.

Example local server:

```bash
python3 -m http.server 5500
```

Then open:

```text
http://127.0.0.1:5500/
```

You can also open the file directly:

```text
file:///path/to/boxBuilder/index.html
```

Run the repository tests with:

```bash
npm test
```

Using a local server is recommended for the experimental 3D preview.

### 2. Set Your Maximum Space

Use **Maximum Trunk / Hatch Area** to enter the largest box that can physically fit.

Typical values:

- Width: left-to-right available space.
- Height: floor-to-top available space.
- Depth: front-to-back available space.

If **Use max space constraints** is enabled, suggestions and fit warnings will respect these limits.

### 3. Choose Your Driver

Use **Driver Selection** to enter:

- Driver size.
- Driver displacement.
- Driver depth.
- Driver quantity.
- Cutout diameter.
- Mounting depth.

The cutout is the speaker hole size. The designer should not resize the speaker cutout when you resize the box.

### 4. Choose Sealed Or Ported

Use **Enclosure Type** to choose:

- **Sealed** for a closed box.
- **Ported** for a box with a slot or round port.

For ported boxes, you can set:

- Port type: slot or round.
- Port size.
- Port length.
- Port count.
- Tuning frequency.
- Port face and offset.
- Internal/external port extension.

Some port tools are still experimental, especially folded slot routing and 3D interaction.

### 5. Enter Box Dimensions

Use **Manual Box Calculator** to enter the box size.

You can choose:

- Rectangular cabinet.
- Wedge / slanted cabinet.
- External dimensions.
- Internal dimensions.

Wood thickness is used to convert between internal and external dimensions.

### 6. Use Target Volume Suggestions

Use **Quick Volume Sizing** to enter a target net volume.

The app can suggest dimensions based on:

- Target net airspace.
- Maximum available space.
- Dimension priority.
- Width/height/depth weighting.

Click **Apply Suggested Dimensions** when you want to use the suggested size.

### 7. Read The Output

The **Calculated Output** section shows:

- Internal dimensions.
- External dimensions.
- Gross volume.
- Net volume before driver.
- Net volume after driver, ports, and bracing.

The **Status** section shows warnings and notes.

## Diagrams And Designer Views

### Live Box Diagram

The live diagram gives a visual overview of the enclosure.

When Designer Mode is enabled, drag handles can adjust:

- Box width.
- Box height.
- Box depth.
- Port position.
- Port length.

The driver cutout is intended to remain fixed-size unless you edit the driver/cutout input directly.

### Front, Side, And Top Views

The designer views show orthographic views of the box:

- **Front**: width and height.
- **Side**: depth and height.
- **Top**: width and depth.

These views are useful for understanding where the box, driver, and port sit in space.

### Experimental 3D Preview

The 3D preview is experimental.

It can show:

- Box shape.
- Max available space.
- Driver location.
- Port pieces.
- Interior/cutaway view.

For editing in 3D:

1. Enable **Lock 3D Zoom**.
2. Enable **Lock 3D View**.
3. Enable **Enable 3D Editing**.
4. Drag the visible W/H/D labels or handles.

If 3D editing does not respond, check the **3D debug** line. It reports whether pointer events and drag actions are being detected.

## Cut Sheet

The **Cut Sheet** section lists basic panel sizes for the current box.

Use this as a starting point only. Real-world building may require adjustments for:

- Assembly method.
- Kerf.
- Double baffles.
- Bracing.
- Rabbets, dados, or overlaps.
- Carpet, vinyl, or finish thickness.

## Important Notes

- Measurements are currently inch-based.
- Port calculations are a planning aid and should be checked before building.
- 3D editing is still experimental.
- The app stores settings in browser local storage.
- If the app acts strange after an update, reload with the current version query string or clear local storage.

## Project Files

- `index.html`: app layout and controls.
- `styles.css`: visual styling.
- `app.js`: UI behavior, rendering, and interactive designer logic.
- `boxMath.js`: reusable math helpers.
- `test.js`: Node-based math tests.
- `ChatBridge.md`: working handoff notes and current TODOs.
- `upgrades.md`: larger roadmap and future planning notes.

## Running Tests

Run the math tests with:

```bash
node test.js
```

Check JavaScript syntax with:

```bash
node --check app.js
```

## Current Development Status

Box Builder is actively evolving from a calculator into an interactive enclosure designer.

Stable areas:

- Basic dimension math.
- Volume calculations.
- Target volume suggestions.
- Live 2D diagram.
- Cut sheet output.

In-progress areas:

- Wedge cabinet support.
- Ported enclosure routing.
- Folded slot port visualization.
- 3D editing.
- Automated browser testing.

## Disclaimer

This software helps with planning speaker enclosures, but it does not replace careful design review.

Before cutting material, verify:

- Driver manufacturer recommendations.
- Net volume target.
- Port area and port length.
- Mounting depth and cutout diameter.
- Vehicle or room fit.
- Material thickness and construction method.
