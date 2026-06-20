/* eslint-disable no-restricted-globals */

function createValidator(deps) {
  const {
    safeNumber,
    isWedge,
    getExternalDimensions,
    getOccupiedEnvelope,
    getPortAreaPerInstanceSqIn
  } = deps;

  return function validateBox(currentState, internalDimensions) {
    const warnings = [];

    if (
      internalDimensions.width <= 0 ||
      internalDimensions.height <= 0 ||
      internalDimensions.depth <= 0
    ) {
      warnings.push('One or more internal dimensions are zero or negative. Increase width, height, depth, or reduce wood thickness.');
    }

    const minUsableDepth = Number.isFinite(internalDimensions.topDepth)
      ? Math.min(internalDimensions.topDepth, internalDimensions.bottomDepth)
      : internalDimensions.depth;

    if (currentState.mountingDepth > minUsableDepth) {
      warnings.push('Driver mounting depth is deeper than the usable box depth. Add depth, use a shallower driver, or switch to a wedge with a deeper bottom section.');
    }

    if (
      currentState.driverCutout > internalDimensions.width ||
      currentState.driverCutout > internalDimensions.height
    ) {
      warnings.push('Driver cutout is larger than the usable front baffle area. Increase width/height or reduce the cutout size.');
    }

    if (
      currentState.width <= 0 ||
      currentState.height <= 0 ||
      currentState.woodThickness < 0
    ) {
      warnings.push('Please enter positive dimensions and a non-negative wood thickness before trusting the volume results.');
    }

    if (isWedge(currentState)) {
      if (currentState.topDepth <= 0 || currentState.bottomDepth <= 0) {
        warnings.push('Wedge cabinets need both top depth and bottom depth to be positive values.');
      }
      if (currentState.bottomDepth + 0.01 < currentState.mountingDepth) {
        warnings.push('The wedge bottom depth is still shallower than the driver mounting depth. Increase bottom depth or use a shallower driver.');
      }
      if (currentState.topDepth > currentState.bottomDepth * 2.5 || currentState.bottomDepth > currentState.topDepth * 2.5) {
        warnings.push('This wedge is very aggressive. Double-check panel angles and physical fit before building.');
      }
    } else if (currentState.depth <= 0) {
      warnings.push('Depth must be positive.');
    }

    if (currentState.useMaxConstraints) {
      const externalDimensions = getExternalDimensions(currentState);
      const occupiedEnvelope = getOccupiedEnvelope(currentState, externalDimensions);
      if (
        occupiedEnvelope.width > currentState.maxBoxWidth ||
        occupiedEnvelope.height > currentState.maxBoxHeight ||
        occupiedEnvelope.depth > currentState.maxBoxDepth
      ) {
        warnings.push(`Current occupied envelope exceeds the available space (${occupiedEnvelope.width.toFixed(2)} × ${occupiedEnvelope.height.toFixed(2)} × ${occupiedEnvelope.depth.toFixed(2)} in). Reduce box size, shorten any external port extension, or loosen the space limits.`);
      }
    }

    if (currentState.enclosureType === 'sealed' && currentState.tuningFrequency > 0) {
      warnings.push('Sealed mode ignores port tuning. Leave the tuning value only as a reference, or switch to Ported to use it.');
    }

    if (currentState.enclosureType === 'ported') {
      const portArea = getPortAreaPerInstanceSqIn(currentState);
      const portLength = currentState.portType === 'round'
        ? safeNumber(currentState.roundPortLength)
        : safeNumber(currentState.slotPortLength);
      if (currentState.portType === 'round' && safeNumber(currentState.roundPortDiameter) < 2) {
        warnings.push('Round port diameter is extremely small for a subwoofer enclosure. Increase diameter or use slot mode.');
      }
      if (currentState.portType === 'slot') {
        if (safeNumber(currentState.slotPortHeight) < 1) {
          warnings.push('Slot port height is very small. Increase slot height or use full auto sizing to avoid a hard-to-build opening.');
        }
        if (safeNumber(currentState.slotPortWidth) > internalDimensions.width + 0.01) {
          warnings.push('Slot port width is wider than the usable box width. Reduce slot width, rotate the port face, or increase box width.');
        }
      }
      if (portLength > Math.max(internalDimensions.width, internalDimensions.height, internalDimensions.depth) * 3) {
        warnings.push('Requested port length is unusually long for this box. Consider a higher tuning frequency, more port area efficiency, or a different enclosure size.');
      }
      if (portArea > (internalDimensions.width * internalDimensions.height)) {
        warnings.push('Port opening area exceeds the front baffle working area. Reduce the opening size or move the port to a different face.');
      }
    }

    const driverCount = Math.max(1, Math.round(safeNumber(currentState.driverCount)));
    if (driverCount > 1) {
      const layout = currentState.threeDriverLayout || 'auto';
      const gap = 0.75;
      const run = (driverCount * currentState.driverSize) + ((driverCount - 1) * gap);
      if (layout === 'vertical' && run > currentState.height) {
        warnings.push('Driver stack may exceed baffle height. Reduce driver count, switch layout, or increase box height.');
      }
      if ((layout === 'horizontal' || layout === 'auto') && run > currentState.width) {
        warnings.push('Driver row may exceed baffle width. Reduce driver count, switch layout, or increase box width.');
      }
    }

    return warnings;
  };
}

const api = { createValidator };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else if (typeof window !== 'undefined') {
  window.BoxValidation = api;
}
