# Box Builder Release Checklist

## Before Release

1. Confirm the working tree is clean on `main`.
2. Run:
   - `node test.js`
   - `node smoke.js`
3. Sanity-check the live workflow in a browser:
   - set trunk constraints
   - choose driver size/count
   - change target volume
   - apply suggested dimensions
   - switch `Sealed` / `Ported`
   - type into slot port width / height / length
   - confirm typing forces `Auto Port Mode` to `Manual`
   - switch `Rectangular` / `Wedge`
   - confirm top/bottom depth behavior updates correctly
4. Check advanced surfaces:
   - 2D layout views still render
   - 3D preview loads
   - `Lock 3D Zoom` + `Lock 3D View` gating still makes sense
   - `Reset View Tools` returns advanced view state to a sane default
   - `Reset App` restores the main calculator state
5. Review the `Status` panel and confirm:
   - warnings read like actual warnings
   - info notes are visually distinct
   - confidence chip matches the current state

## Publish

1. Update local `main`.
2. Re-run:
   - `node test.js`
   - `node smoke.js`
3. Push `main`.

## After Merge

1. Verify the deployed GitHub Pages build loads from the clean canonical URL.
2. Hard-refresh once and confirm the `Build:` label matches the expected release build id.
3. Re-test one ported slot workflow and one wedge workflow on the live site.

## Optional Cleanup

1. Confirm no stale release branches were recreated remotely.
