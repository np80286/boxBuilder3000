# Box Builder Release Summary

## Version

- **v1.0.0**
- **Release date:** 2026-06-20
- **Branch:** `main`

## Summary

This release ships a stable Box Builder UI and workflow update from `main`.

Key improvements:

- Stabilized the box builder UX and modularized core app logic.
- Enabled and improved 2D/3D editing workflows.
- Added better target volume suggestion behavior with manual override support.
- Improved sealed and ported enclosure support, including slot port workflows.
- Added wedge cabinet dimension handling and driver/port displacement math updates.
- Enhanced the status panel, warning/info messaging, and confidence indicators.
- Verified the site with `node test.js` and `node smoke.js`.

## Deployment notes

- `main` has been verified clean and current with `origin/main`.
- A GitHub release has been created for this tag.
- The public app now keeps a clean canonical page URL and uses versioned asset URLs for cache busting.

## Verification checklist

- [x] `node test.js` passed
- [x] `node smoke.js` passed
- [x] 2D layout views render
- [x] 3D preview loads
- [x] Sealed / Ported workflows work
- [x] Wedge workflow works
- [x] Release branch cleanup completed
