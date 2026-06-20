/* eslint-disable no-restricted-globals */
// Pure math helpers extracted for unit testing and reuse.

function safeNumber(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isWedge(currentState) {
  return currentState.cabinetStyle === 'wedge';
}

function getDepthPair(currentState, targetMode) {
  const wedge = isWedge(currentState);
  const baseTop = wedge ? safeNumber(currentState.topDepth) : safeNumber(currentState.depth);
  const baseBottom = wedge ? safeNumber(currentState.bottomDepth) : safeNumber(currentState.depth);
  const t2 = safeNumber(currentState.woodThickness) * 2;
  const sourceMode = currentState.dimensionMode === 'internal' ? 'internal' : 'external';
  const delta = sourceMode === targetMode ? 0 : (targetMode === 'internal' ? -t2 : t2);
  const topDepth = baseTop + delta;
  const bottomDepth = baseBottom + delta;
  const averageDepth = (topDepth + bottomDepth) / 2;
  return { topDepth, bottomDepth, averageDepth };
}

function getInternalDimensions(currentState) {
  const subtraction = currentState.dimensionMode === 'internal' ? 0 : currentState.woodThickness * 2;
  const depths = getDepthPair(currentState, 'internal');
  return {
    width: currentState.width - subtraction,
    height: currentState.height - subtraction,
    depth: depths.averageDepth,
    topDepth: depths.topDepth,
    bottomDepth: depths.bottomDepth
  };
}

function getExternalDimensions(currentState) {
  const addition = currentState.dimensionMode === 'external' ? 0 : currentState.woodThickness * 2;
  const depths = getDepthPair(currentState, 'external');
  return {
    width: currentState.width + addition,
    height: currentState.height + addition,
    depth: depths.averageDepth,
    topDepth: depths.topDepth,
    bottomDepth: depths.bottomDepth
  };
}

function getVolume(dimensions) {
  const topDepth = Number.isFinite(dimensions.topDepth) ? dimensions.topDepth : dimensions.depth;
  const bottomDepth = Number.isFinite(dimensions.bottomDepth) ? dimensions.bottomDepth : dimensions.depth;
  const averageDepth = (topDepth + bottomDepth) / 2;
  const in3 = dimensions.width * dimensions.height * averageDepth;
  return {
    in3,
    ft3: in3 / 1728
  };
}

function getNetVolume(grossFt3, displacementFt3) {
  return grossFt3 - displacementFt3;
}

function getPortQuantity(currentState) {
  return currentState.portType === 'round'
    ? Math.max(1, Math.round(safeNumber(currentState.roundPortQuantity)))
    : Math.max(1, Math.round(safeNumber(currentState.slotPortCount)));
}

function getPortAreaPerInstanceSqIn(currentState) {
  if (currentState.portType === 'round') {
    const diameter = Math.max(0.01, safeNumber(currentState.roundPortDiameter));
    return Math.PI * (diameter / 2) * (diameter / 2);
  }
  return Math.max(0.01, safeNumber(currentState.slotPortWidth)) * Math.max(0.01, safeNumber(currentState.slotPortHeight));
}

function getPortLengthDistribution(currentState, totalLength) {
  const safeLength = Math.max(0.01, safeNumber(totalLength));
  const mode = ['internal', 'external', 'split'].includes(currentState.portExtensionMode)
    ? currentState.portExtensionMode
    : 'internal';
  if (mode === 'external') {
    return { mode, internalLength: 0, externalLength: safeLength };
  }
  if (mode === 'split') {
    return { mode, internalLength: safeLength * 0.5, externalLength: safeLength * 0.5 };
  }
  return { mode, internalLength: safeLength, externalLength: 0 };
}

function getPortDisplacementFt3(currentState) {
  if (currentState.enclosureType !== 'ported') return 0;
  const totalLength = currentState.portType === 'round'
    ? safeNumber(currentState.roundPortLength)
    : safeNumber(currentState.slotPortLength);
  const internalLength = getPortLengthDistribution(currentState, totalLength).internalLength;
  if (currentState.portType === 'round') {
    const radius = safeNumber(currentState.roundPortDiameter) / 2;
    const quantity = getPortQuantity(currentState);
    return ((Math.PI * radius * radius * internalLength) * quantity) / 1728;
  }
  const width = safeNumber(currentState.slotPortWidth);
  const height = safeNumber(currentState.slotPortHeight);
  const quantity = getPortQuantity(currentState);
  return (width * height * internalLength * quantity) / 1728;
}

function getTotalDisplacementFt3(currentState) {
  const driver = safeNumber(currentState.driverDisplacement) * Math.max(1, Math.round(safeNumber(currentState.driverCount) || 1));
  const bracing = Math.max(0, safeNumber(currentState.bracingDisplacement));
  const port = getPortDisplacementFt3(currentState);
  return driver + bracing + port;
}

function buildSlotRunLengths(totalRunLength, channelCount, minRunLength, leadOffset) {
  const runs = new Array(channelCount).fill(Math.max(minRunLength, totalRunLength / Math.max(1, channelCount)));
  if (channelCount <= 1) {
    runs[0] = Math.max(minRunLength, totalRunLength);
    return runs;
  }
  const safeTotal = Math.max(minRunLength * channelCount, totalRunLength);
  const baseRun = safeTotal / channelCount;
  const maxLead = safeTotal - (minRunLength * (channelCount - 1));
  const firstRun = Math.max(minRunLength, Math.min(maxLead, baseRun + leadOffset));
  const remainingTotal = safeTotal - firstRun;
  const otherRun = Math.max(minRunLength, remainingTotal / (channelCount - 1));
  runs[0] = firstRun;
  for (let i = 1; i < channelCount; i += 1) runs[i] = otherRun;
  const sum = runs.reduce((acc, value) => acc + value, 0);
  const correction = safeTotal - sum;
  runs[runs.length - 1] += correction;
  return runs;
}

function normalizeSlotRunProfile(profile, channelCount, totalRunLength, minRunLength, leadOffset) {
  const desired = Array.isArray(profile) ? profile.slice(0, channelCount) : [];
  while (desired.length < channelCount) desired.push(minRunLength);
  const base = desired.some((value) => Number.isFinite(value) && value > 0)
    ? desired.map((value) => Math.max(minRunLength, safeNumber(value)))
    : buildSlotRunLengths(totalRunLength, channelCount, minRunLength, leadOffset);
  let runs = base.slice();
  let sum = runs.reduce((acc, value) => acc + value, 0);
  if (sum < totalRunLength) {
    const add = (totalRunLength - sum) / Math.max(1, runs.length);
    runs = runs.map((value) => value + add);
    sum = totalRunLength;
  }
  let overflow = sum - totalRunLength;
  while (overflow > 0.0001) {
    const adjustable = runs.map((value) => Math.max(0, value - minRunLength));
    const adjustableTotal = adjustable.reduce((acc, value) => acc + value, 0);
    if (adjustableTotal <= 0.0001) break;
    runs = runs.map((value, index) => value - ((adjustable[index] / adjustableTotal) * overflow));
    runs = runs.map((value) => Math.max(minRunLength, value));
    sum = runs.reduce((acc, value) => acc + value, 0);
    overflow = sum - totalRunLength;
  }
  const correction = totalRunLength - runs.reduce((acc, value) => acc + value, 0);
  runs[runs.length - 1] = Math.max(minRunLength, runs[runs.length - 1] + correction);
  return runs;
}

function getFoldedSlotOverflow(currentState, instance, enclosureHalf) {
  const requestedChannels = Math.max(1, Math.round(safeNumber(currentState.slotPortChannelCount)));
  const gap = Math.max(0, safeNumber(currentState.slotPortChannelGap));
  const foldAxis = instance.foldAxis || instance.tangentA;
  const foldThickness = foldAxis === instance.tangentA ? instance.openingA : instance.openingB;
  const step = foldThickness + gap;
  const minRunLength = Math.max(0.01, safeNumber(currentState.designerSnapIncrement) || 0.25);
  let effectiveChannels = requestedChannels;
  while (
    effectiveChannels > 1 &&
    (instance.internalLength - ((effectiveChannels - 1) * step)) < (effectiveChannels * minRunLength)
  ) {
    effectiveChannels -= 1;
  }
  const half = enclosureHalf[foldAxis];
  const laneLimit = half - (foldThickness * 0.5);
  const totalRunLength = Math.max(0.01, instance.internalLength - ((effectiveChannels - 1) * step));
  const runLengths = normalizeSlotRunProfile(
    currentState.slotPortRunProfile,
    effectiveChannels,
    totalRunLength,
    minRunLength,
    safeNumber(currentState.slotPortLeadRunOffset)
  );
  const overflows = [];
  for (let channelIndex = 0; channelIndex < effectiveChannels; channelIndex += 1) {
    const laneOffset = channelIndex * step * (instance.directionSign || 1);
    const laneCenter = safeNumber(instance.center && instance.center[foldAxis]) + laneOffset;
    if (Math.abs(laneCenter) > laneLimit + 0.001) {
      overflows.push({
        channelIndex,
        axis: foldAxis,
        laneCenter,
        laneLimit
      });
    }
  }
  return {
    effectiveChannels,
    runLengths,
    overflows
  };
}

function getSuggestedInternalDimensions(currentState, internalDimensions) {
  const currentGross = getVolume(internalDimensions).ft3;
  const targetGross = currentState.targetNetVolume + getTotalDisplacementFt3(currentState);

  if (
    currentGross <= 0 ||
    targetGross <= 0 ||
    internalDimensions.width <= 0 ||
    internalDimensions.height <= 0 ||
    internalDimensions.depth <= 0
  ) {
    return null;
  }

  const scale = Math.cbrt(targetGross / currentGross);
  return {
    width: internalDimensions.width * scale,
    height: internalDimensions.height * scale,
    depth: internalDimensions.depth * scale
  };
}

function getConstraintData(currentState, externalDimensions) {
  if (!currentState.useMaxConstraints) {
    return {
      enabled: false,
      fitsCurrent: true,
      maxInternal: null,
      maxNet: null,
      overBy: null
    };
  }

  const overBy = {
    width: Math.max(0, externalDimensions.width - currentState.maxBoxWidth),
    height: Math.max(0, externalDimensions.height - currentState.maxBoxHeight),
    depth: Math.max(0, externalDimensions.depth - currentState.maxBoxDepth)
  };

  const fitsCurrent = overBy.width <= 0 && overBy.height <= 0 && overBy.depth <= 0;
  const t2 = currentState.woodThickness * 2;
  const maxInternal = {
    width: currentState.maxBoxWidth - t2,
    height: currentState.maxBoxHeight - t2,
    depth: currentState.maxBoxDepth - t2
  };

  const hasPositiveInternal = maxInternal.width > 0 && maxInternal.height > 0 && maxInternal.depth > 0;
  if (!hasPositiveInternal) {
    return {
      enabled: true,
      fitsCurrent,
      maxInternal,
      maxNet: null,
      overBy
    };
  }

  const maxGross = getVolume(maxInternal).ft3;
  return {
    enabled: true,
    fitsCurrent,
    maxInternal,
    maxNet: maxGross - getTotalDisplacementFt3(currentState),
    overBy
  };
}

function applyConstraintToSuggested(currentState, suggestedInternal, constraintData) {
  if (!suggestedInternal || !constraintData.enabled || !constraintData.maxInternal) {
    return {
      internal: suggestedInternal,
      constrained: false,
      reachable: !!suggestedInternal
    };
  }

  const maxInternal = constraintData.maxInternal;
  const ratio = {
    width: maxInternal.width / suggestedInternal.width,
    height: maxInternal.height / suggestedInternal.height,
    depth: maxInternal.depth / suggestedInternal.depth
  };

  const candidates = [
    { key: 'width', r: ratio.width },
    { key: 'height', r: ratio.height },
    { key: 'depth', r: ratio.depth }
  ].filter((c) => Number.isFinite(c.r) && c.r > 0);

  const limiting = candidates.reduce((min, c) => (c.r < min.r ? c : min), candidates[0] || null);
  if (!limiting) {
    return { internal: null, constrained: true, reachable: false };
  }

  // If the unconstrained suggestion fits, accept it.
  if (limiting.r >= 1) {
    return { internal: suggestedInternal, constrained: false, reachable: true };
  }

  // If we're constrained, prefer keeping the limiting dimension at its max and
  // scaling the other two to hit the target gross volume while preserving their ratio.
  const targetGross = currentState.targetNetVolume + getTotalDisplacementFt3(currentState);
  if (!(targetGross > 0)) {
    return { internal: null, constrained: true, reachable: false };
  }

  const keep = limiting.key;
  const fixed = maxInternal[keep];
  const keys = ['width', 'height', 'depth'].filter((k) => k !== keep);
  const a = keys[0];
  const b = keys[1];

  const ratioAB = suggestedInternal[a] / suggestedInternal[b];
  const denom = fixed * ratioAB;
  if (!(denom > 0)) {
    // fallback: uniform scale to fit
    const scale = Math.min(limiting.r, 1);
    return {
      internal: {
        width: suggestedInternal.width * scale,
        height: suggestedInternal.height * scale,
        depth: suggestedInternal.depth * scale
      },
      constrained: true,
      reachable: false
    };
  }

  const bNeeded = Math.sqrt((targetGross * 1728) / denom);
  const aNeeded = bNeeded * ratioAB;

  const internal = {
    width: suggestedInternal.width,
    height: suggestedInternal.height,
    depth: suggestedInternal.depth
  };
  internal[keep] = fixed;
  internal[a] = aNeeded;
  internal[b] = bNeeded;

  const constrained = internal.width > maxInternal.width || internal.height > maxInternal.height || internal.depth > maxInternal.depth;
  const reachable = !constrained;

  // Clamp to max if still over, but keep the attempted direction.
  const clamped = {
    width: Math.min(internal.width, maxInternal.width),
    height: Math.min(internal.height, maxInternal.height),
    depth: Math.min(internal.depth, maxInternal.depth)
  };

  return { internal: clamped, constrained: true, reachable };
}

function getMaximizeSuggestion(currentState, constraintData) {
  if (!currentState.useMaxConstraints || !constraintData.enabled || !constraintData.maxInternal) {
    return { internal: null, maxed: { width: false, height: false, depth: false } };
  }

  const minDim = 0.01;
  const rawMaxInternal = constraintData.maxInternal;
  const maxInternal = {
    width: Math.max(minDim, rawMaxInternal.width || 0),
    height: Math.max(minDim, rawMaxInternal.height || 0),
    depth: Math.max(minDim, rawMaxInternal.depth || 0)
  };

  const targetGross = currentState.targetNetVolume + getTotalDisplacementFt3(currentState);
  if (!(targetGross > 0)) {
    return { internal: null, maxed: { width: false, height: false, depth: false } };
  }

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const minDepth = Math.max(minDim, safeNumber(currentState.mountingDepth) || 0);
  const internal = { width: minDim, height: minDim, depth: clamp(minDepth, minDim, maxInternal.depth) };

  const maxed = {
    width: rawMaxInternal.width <= minDim,
    height: rawMaxInternal.height <= minDim,
    depth: rawMaxInternal.depth <= minDim
  };

  const grossFt3 = (d) => getVolume(d).ft3;
  const setToMeetTarget = (key, maxValue) => {
    const otherA = key === 'width' ? internal.height : internal.width;
    const otherB = key === 'depth' ? internal.height : internal.depth;
    const denom = otherA * otherB;
    if (!(denom > 0)) return null;
    const needed = (targetGross * 1728) / denom;
    return clamp(needed, minDim, maxValue);
  };

  if (grossFt3(internal) < targetGross) {
    const neededH = setToMeetTarget('height', maxInternal.height);
    if (neededH !== null) {
      if (neededH >= maxInternal.height - 1e-6) maxed.height = true;
      internal.height = neededH;
    }
  }

  if (grossFt3(internal) < targetGross) {
    internal.height = maxInternal.height;
    maxed.height = true;
    const neededW = setToMeetTarget('width', maxInternal.width);
    if (neededW !== null) {
      if (neededW >= maxInternal.width - 1e-6) maxed.width = true;
      internal.width = neededW;
    }
  }

  if (grossFt3(internal) < targetGross) {
    internal.width = maxInternal.width;
    maxed.width = true;
    const neededD = setToMeetTarget('depth', maxInternal.depth);
    if (neededD !== null) {
      if (neededD >= maxInternal.depth - 1e-6) maxed.depth = true;
      internal.depth = neededD;
    }
  }

  if (grossFt3(internal) < targetGross) {
    internal.depth = maxInternal.depth;
    maxed.depth = true;
  }

  return { internal, maxed };
}

function getTargetBaselineInternal(currentState, constraintData) {
  const minDim = 0.01;
  const minDepth = Math.max(minDim, safeNumber(currentState.mountingDepth) || 0);
  const maxInternal = constraintData && constraintData.enabled && constraintData.maxInternal
    ? constraintData.maxInternal
    : null;

  if (maxInternal) {
    return {
      width: Math.max(minDim, maxInternal.width * 0.6),
      height: Math.max(minDim, maxInternal.height * 0.6),
      depth: Math.max(minDepth, maxInternal.depth * 0.6)
    };
  }

  return {
    width: 18,
    height: 14,
    depth: Math.max(minDepth, 14)
  };
}

function getAutoPriorityList(currentState) {
  const raw = [
    currentState.autoPriority1,
    currentState.autoPriority2,
    currentState.autoPriority3
  ].filter(Boolean);

  const allowed = new Set(['width', 'height', 'depth']);
  const out = [];
  for (const item of raw) {
    if (!allowed.has(item)) continue;
    if (out.includes(item)) continue;
    out.push(item);
  }
  for (const item of ['height', 'width', 'depth']) {
    if (!out.includes(item)) out.push(item);
  }
  return out.slice(0, 3);
}

function getAutoWeights(currentState) {
  const w = Math.max(0, safeNumber(currentState.autoWeightWidth));
  const h = Math.max(0, safeNumber(currentState.autoWeightHeight));
  const d = Math.max(0, safeNumber(currentState.autoWeightDepth));
  const sum = w + h + d;
  if (sum <= 0) return { width: 1 / 3, height: 1 / 3, depth: 1 / 3 };
  return { width: w / sum, height: h / sum, depth: d / sum };
}

function getTargetPrioritySuggestion(currentState, constraintData) {
  const minDim = 0.01;
  const minDepth = Math.max(minDim, safeNumber(currentState.mountingDepth) || 0);
  const targetGross = currentState.targetNetVolume + getTotalDisplacementFt3(currentState);
  if (!(targetGross > 0)) return { internal: null, maxed: { width: false, height: false, depth: false } };

  const maxInternal = constraintData && constraintData.enabled && constraintData.maxInternal
    ? constraintData.maxInternal
    : { width: 10_000, height: 10_000, depth: 10_000 };

  const weights = getAutoWeights(currentState);
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const internal = {
    width: clamp(maxInternal.width * weights.width, minDim, maxInternal.width),
    height: clamp(maxInternal.height * weights.height, minDim, maxInternal.height),
    depth: clamp(maxInternal.depth * weights.depth, minDepth, maxInternal.depth)
  };

  const maxed = { width: false, height: false, depth: false };
  const volumeNow = () => getVolume(internal).ft3;
  const priorities = getAutoPriorityList(currentState);

  for (const dim of priorities) {
    if (volumeNow() >= targetGross) break;
    const other = ['width', 'height', 'depth'].filter((k) => k !== dim);
    const denom = internal[other[0]] * internal[other[1]];
    if (!(denom > 0)) return { internal: null, maxed };
    const needed = (targetGross * 1728) / denom;
    if (needed >= maxInternal[dim] - 1e-6) {
      internal[dim] = maxInternal[dim];
      maxed[dim] = true;
    } else {
      internal[dim] = clamp(needed, minDim, maxInternal[dim]);
    }
  }

  return { internal, maxed };
}

const api = {
  safeNumber,
  getDepthPair,
  getInternalDimensions,
  getExternalDimensions,
  getVolume,
  getNetVolume,
  getPortQuantity,
  getPortAreaPerInstanceSqIn,
  getPortLengthDistribution,
  getPortDisplacementFt3,
  getTotalDisplacementFt3,
  buildSlotRunLengths,
  normalizeSlotRunProfile,
  getFoldedSlotOverflow,
  getSuggestedInternalDimensions,
  getConstraintData,
  applyConstraintToSuggested,
  getMaximizeSuggestion,
  getTargetBaselineInternal,
  getAutoPriorityList,
  getAutoWeights,
  getTargetPrioritySuggestion
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else if (typeof window !== 'undefined') {
  window.BoxMath = api;
}
