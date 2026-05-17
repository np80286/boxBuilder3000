const BUILD_ID = 'dev-2026-05-17-04';
const STORAGE_KEY = 'boxBuilderState.v1';
const PARTS_SPEC_STORAGE_KEY = 'boxBuilderPartsSpec.v1';
const PARSED_STORAGE_KEY = 'boxBuilderParsedPreview.v1';

const DEFAULT_PARTS_SPEC = `Sealed Volume\t2.1ft³
Sealed F3\t42Hz
Vented Volume\t6ft³
Vented F3\t23Hz`;

const state = {
  dimensionMode: 'external',
  width: 30,
  height: 15,
  depth: 14,
  woodThickness: 0.75,
  driverSize: 15,
  driverCutout: 11.1,
  driverDepth: 6.5,
  mountingDepth: 6.5,
  driverDisplacement: 0.08,
  driverSensitivity: 88,
  voiceCoilDiameter: 2.0,
  enclosureType: 'sealed',
  tuningFrequency: 40,
  targetNetVolume: 1.25,
  suggestionMode: 'target',
  autoPriority1: 'height',
  autoPriority2: 'width',
  autoPriority3: 'depth',
  autoWeightWidth: 33,
  autoWeightHeight: 34,
  autoWeightDepth: 33,
  useMaxConstraints: true,
  maxBoxWidth: 38,
  maxBoxHeight: 16,
  maxBoxDepth: 22
};

let isSyncingLinkedControls = false;

const DRIVER_DEFAULTS = {
  8: { cutout: 7.25, depth: 4.5, displacement: 0.03, sensitivity: 84, voiceCoil: 1.0 },
  10: { cutout: 9.25, depth: 5.5, displacement: 0.05, sensitivity: 86, voiceCoil: 1.5 },
  12: { cutout: 11.1, depth: 6.5, displacement: 0.08, sensitivity: 88, voiceCoil: 2.0 },
  15: { cutout: 13.8, depth: 7.5, displacement: 0.14, sensitivity: 86, voiceCoil: 2.5 },
  18: { cutout: 16.6, depth: 9.0, displacement: 0.22, sensitivity: 88, voiceCoil: 3.0 }
};

const inputs = {
  width: document.getElementById('width'),
  height: document.getElementById('height'),
  depth: document.getElementById('depth'),
  woodThickness: document.getElementById('woodThickness'),
  driverSize: document.getElementById('driverSize'),
  driverCutout: document.getElementById('driverCutout'),
  driverDepth: document.getElementById('driverDepth'),
  mountingDepth: document.getElementById('mountingDepth'),
  driverDisplacement: document.getElementById('driverDisplacement'),
  driverSensitivity: document.getElementById('driverSensitivity'),
  voiceCoilDiameter: document.getElementById('voiceCoilDiameter'),
  enclosureType: document.getElementById('enclosureType'),
  tuningFrequency: document.getElementById('tuningFrequency'),
  autoPriority1: document.getElementById('autoPriority1'),
  autoPriority2: document.getElementById('autoPriority2'),
  autoPriority3: document.getElementById('autoPriority3'),
  autoWeightWidth: document.getElementById('autoWeightWidth'),
  autoWeightHeight: document.getElementById('autoWeightHeight'),
  autoWeightDepth: document.getElementById('autoWeightDepth'),
  quickSuggestionMode: document.getElementById('quickSuggestionMode'),
  quickAutoPriority1: document.getElementById('quickAutoPriority1'),
  quickAutoPriority2: document.getElementById('quickAutoPriority2'),
  quickAutoPriority3: document.getElementById('quickAutoPriority3'),
  quickAutoWeightWidth: document.getElementById('quickAutoWeightWidth'),
  quickAutoWeightHeight: document.getElementById('quickAutoWeightHeight'),
  quickAutoWeightDepth: document.getElementById('quickAutoWeightDepth'),
  partsSpecPaste: document.getElementById('partsSpecPaste'),
  parsePartsBtn: document.getElementById('parsePartsBtn'),
  clearPartsBtn: document.getElementById('clearPartsBtn'),
  parsedSealedVolume: document.getElementById('parsedSealedVolume'),
  parsedVentedVolume: document.getElementById('parsedVentedVolume'),
  parsedSealedF3: document.getElementById('parsedSealedF3'),
  parsedVentedF3: document.getElementById('parsedVentedF3'),
  applyParsedBtn: document.getElementById('applyParsedBtn'),
  resetParsedBtn: document.getElementById('resetParsedBtn'),
  targetNetVolume: document.getElementById('targetNetVolume'),
  suggestionMode: document.getElementById('suggestionMode'),
  useMaxConstraints: document.getElementById('useMaxConstraints'),
  maxBoxWidth: document.getElementById('maxBoxWidth'),
  maxBoxHeight: document.getElementById('maxBoxHeight'),
  maxBoxDepth: document.getElementById('maxBoxDepth'),
  quickWidth: document.getElementById('quickWidth'),
  quickHeight: document.getElementById('quickHeight'),
  quickDepth: document.getElementById('quickDepth')
};

const outputs = {
  internalDimensions: document.getElementById('internalDimensions'),
  externalDimensions: document.getElementById('externalDimensions'),
  grossVolume: document.getElementById('grossVolume'),
  netBefore: document.getElementById('netBefore'),
  netAfter: document.getElementById('netAfter'),
  warnings: document.getElementById('warnings'),
  diagram: document.getElementById('boxDiagram'),
  suggestedInternalDimensions: document.getElementById('suggestedInternalDimensions'),
  cutSheet: document.getElementById('cutSheet'),
  applySuggestedBtn: document.getElementById('applySuggestedBtn'),
  quickVolume: document.getElementById('quickVolume')
};

// Helps confirm you're running the latest JS (cache busting / hard refresh).
try {
  const buildEl = document.getElementById('buildId');
  if (buildEl) buildEl.textContent = `Build: ${BUILD_ID}`;
  // eslint-disable-next-line no-console
  console.log(`BoxBuilder loaded (${BUILD_ID})`);
} catch (_) {
  // ignore
}

function setActiveTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach((button) => {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });

  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.hidden = panel.dataset.panel !== tabName;
  });
}

function safeNumber(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatInches(n) {
  return `${n.toFixed(2)} in`;
}

function formatDimensions(dim) {
  return `${dim.width.toFixed(2)} × ${dim.height.toFixed(2)} × ${dim.depth.toFixed(2)} in`;
}

function formatDimensionsLabeled(dim) {
  return `W: ${dim.width.toFixed(2)} in | H: ${dim.height.toFixed(2)} in | D: ${dim.depth.toFixed(2)} in`;
}

function getInternalDimensions(currentState) {
  if (currentState.dimensionMode === 'internal') {
    return {
      width: currentState.width,
      height: currentState.height,
      depth: currentState.depth
    };
  }

  const deduction = currentState.woodThickness * 2;
  return {
    width: currentState.width - deduction,
    height: currentState.height - deduction,
    depth: currentState.depth - deduction
  };
}

function getExternalDimensions(currentState) {
  if (currentState.dimensionMode === 'external') {
    return {
      width: currentState.width,
      height: currentState.height,
      depth: currentState.depth
    };
  }

  const addition = currentState.woodThickness * 2;
  return {
    width: currentState.width + addition,
    height: currentState.height + addition,
    depth: currentState.depth + addition
  };
}

function getVolume(dimensions) {
  const in3 = dimensions.width * dimensions.height * dimensions.depth;
  return {
    in3,
    ft3: in3 / 1728
  };
}

function getNetVolume(grossFt3, displacementFt3) {
  return grossFt3 - displacementFt3;
}

function validateBox(currentState, internalDimensions) {
  const warnings = [];

  if (
    internalDimensions.width <= 0 ||
    internalDimensions.height <= 0 ||
    internalDimensions.depth <= 0
  ) {
    warnings.push('One or more internal dimensions are zero or negative.');
  }

  if (currentState.mountingDepth > internalDimensions.depth) {
    warnings.push('Driver mounting depth exceeds internal depth.');
  }

  if (
    currentState.driverCutout > internalDimensions.width ||
    currentState.driverCutout > internalDimensions.height
  ) {
    warnings.push('Driver cutout is too large for the internal front baffle area.');
  }

  if (
    currentState.width <= 0 ||
    currentState.height <= 0 ||
    currentState.depth <= 0 ||
    currentState.woodThickness < 0
  ) {
    warnings.push('Please enter valid positive dimensions and non-negative wood thickness.');
  }

  if (currentState.useMaxConstraints) {
    const externalDimensions = getExternalDimensions(currentState);
    if (
      externalDimensions.width > currentState.maxBoxWidth ||
      externalDimensions.height > currentState.maxBoxHeight ||
      externalDimensions.depth > currentState.maxBoxDepth
    ) {
      warnings.push('Current box exceeds configured trunk maximum dimensions.');
    }
  }

  if (currentState.enclosureType === 'sealed' && currentState.tuningFrequency > 0) {
    warnings.push('ℹ️ Tuning frequency only applies to ported enclosures; sealed doesn\'t require port tuning.');
  }

  return warnings;
}

function getSuggestedInternalDimensions(currentState, internalDimensions) {
  const currentGross = getVolume(internalDimensions).ft3;
  const targetGross = currentState.targetNetVolume + currentState.driverDisplacement;

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

// Parse plaintext specs copied from vendor pages like Parts Express.
// Expected patterns (examples):
// Sealed Volume	2.1ft³
// Sealed F3	42Hz
// Vented Volume	6ft³
// Vented F3	23Hz
function parsePartsSpec(text) {
  if (!text || typeof text !== 'string') return null;
  const out = {};

  // Match volumes like 'Sealed Volume\t2.1ft³' or 'Sealed Volume: 2.1 ft^3' etc.
  const sealedVol = text.match(/(?:sealed)\s+volume[^0-9\n]*([0-9]+(?:\.[0-9]+)?)/i);
  const ventedVol = text.match(/(?:vented|ported)\s+volume[^0-9\n]*([0-9]+(?:\.[0-9]+)?)/i);
  const sealedF3 = text.match(/(?:sealed)\s+f3[^0-9\n]*([0-9]+(?:\.[0-9]+)?)/i);
  const ventedF3 = text.match(/(?:vented|ported)\s+f3[^0-9\n]*([0-9]+(?:\.[0-9]+)?)/i);

  if (sealedVol) out.sealedVolume = parseFloat(sealedVol[1]);
  if (ventedVol) out.ventedVolume = parseFloat(ventedVol[1]);
  if (sealedF3) out.sealedF3 = Math.round(parseFloat(sealedF3[1]));
  if (ventedF3) out.ventedF3 = Math.round(parseFloat(ventedF3[1]));

  // Try fallback patterns: lines with 'Sealed' or 'Vented' + number + 'ft' or 'Hz'
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const l of lines) {
    // more permissive: 'Sealed Volume   2.1ft³' or 'Sealed 2.1 ft3'
    const m1 = l.match(/sealed[^0-9\n]*([0-9]+(?:\.[0-9]+)?)(?:\s*ft|ft|ft\u00B3)?/i);
    if (m1 && !out.sealedVolume) out.sealedVolume = parseFloat(m1[1]);

    const m2 = l.match(/(?:vented|ported)[^0-9\n]*([0-9]+(?:\.[0-9]+)?)(?:\s*ft|ft|ft\u00B3)?/i);
    if (m2 && !out.ventedVolume) out.ventedVolume = parseFloat(m2[1]);

    const m3 = l.match(/sealed[^0-9\n]*f3[^0-9\n]*([0-9]+(?:\.[0-9]+)?)/i);
    if (m3 && !out.sealedF3) out.sealedF3 = Math.round(parseFloat(m3[1]));

    const m4 = l.match(/(?:vented|ported)[^0-9\n]*f3[^0-9\n]*([0-9]+(?:\.[0-9]+)?)/i);
    if (m4 && !out.ventedF3) out.ventedF3 = Math.round(parseFloat(m4[1]));
  }

  return Object.keys(out).length ? out : null;
}

// Track last parsed values to allow reset vs manual edits
let lastParsed = null;

function populateParsedPreview(parsed) {
  lastParsed = parsed ? { ...parsed } : null;
  if (!inputs.parsedSealedVolume) return;

  try {
    if (lastParsed) localStorage.setItem(PARSED_STORAGE_KEY, JSON.stringify(lastParsed));
    else localStorage.removeItem(PARSED_STORAGE_KEY);
  } catch (_) {
    // ignore
  }

  const setVal = (el, v) => {
    if (v === undefined || v === null) {
      el.value = '';
      el.dataset.original = '';
    } else {
      el.value = String(v);
      el.dataset.original = String(v);
    }
    el.classList.remove('modified');
  };

  setVal(inputs.parsedSealedVolume, parsed && parsed.sealedVolume ? parsed.sealedVolume.toFixed(2) : '');
  setVal(inputs.parsedVentedVolume, parsed && parsed.ventedVolume ? parsed.ventedVolume.toFixed(2) : '');
  setVal(inputs.parsedSealedF3, parsed && parsed.sealedF3 ? parsed.sealedF3 : '');
  setVal(inputs.parsedVentedF3, parsed && parsed.ventedF3 ? parsed.ventedF3 : '');
}

function loadPersistedPartsSpec() {
  try {
    const raw = localStorage.getItem(PARTS_SPEC_STORAGE_KEY);
    return typeof raw === 'string' ? raw : '';
  } catch (_) {
    return '';
  }
}

function persistPartsSpec(text) {
  try {
    localStorage.setItem(PARTS_SPEC_STORAGE_KEY, text);
  } catch (_) {
    // ignore
  }
}

function loadPersistedParsedPreview() {
  try {
    const raw = localStorage.getItem(PARSED_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (_) {
    // ignore
  }
  return null;
}

function markIfModified(el) {
  const orig = el.dataset.original || '';
  if (String(el.value) !== String(orig)) {
    el.classList.add('modified');
  } else {
    el.classList.remove('modified');
  }
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
    maxNet: maxGross - currentState.driverDisplacement,
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

  // If constrained, keep the limiting dimension at max and solve the other two
  // to meet the target gross volume while preserving their ratio.
  const targetGross = currentState.targetNetVolume + currentState.driverDisplacement;
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

  const internal = { ...suggestedInternal };
  internal[keep] = fixed;
  internal[a] = aNeeded;
  internal[b] = bNeeded;

  const clamped = {
    width: Math.min(internal.width, maxInternal.width),
    height: Math.min(internal.height, maxInternal.height),
    depth: Math.min(internal.depth, maxInternal.depth)
  };

  const constrained =
    clamped.width >= maxInternal.width - 1e-6 ||
    clamped.height >= maxInternal.height - 1e-6 ||
    clamped.depth >= maxInternal.depth - 1e-6;

  const reachable =
    internal.width <= maxInternal.width + 1e-6 &&
    internal.height <= maxInternal.height + 1e-6 &&
    internal.depth <= maxInternal.depth + 1e-6;

  return { internal: clamped, constrained: true, reachable };
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

function syncLinkedSuggestionControlsFromState() {
  if (isSyncingLinkedControls) return;
  isSyncingLinkedControls = true;
  try {
    if (inputs.suggestionMode) inputs.suggestionMode.value = state.suggestionMode;
    if (inputs.quickSuggestionMode) inputs.quickSuggestionMode.value = state.suggestionMode;

    if (inputs.autoPriority1) inputs.autoPriority1.value = state.autoPriority1;
    if (inputs.autoPriority2) inputs.autoPriority2.value = state.autoPriority2;
    if (inputs.autoPriority3) inputs.autoPriority3.value = state.autoPriority3;
    if (inputs.quickAutoPriority1) inputs.quickAutoPriority1.value = state.autoPriority1;
    if (inputs.quickAutoPriority2) inputs.quickAutoPriority2.value = state.autoPriority2;
    if (inputs.quickAutoPriority3) inputs.quickAutoPriority3.value = state.autoPriority3;

    if (inputs.autoWeightWidth) inputs.autoWeightWidth.value = state.autoWeightWidth;
    if (inputs.autoWeightHeight) inputs.autoWeightHeight.value = state.autoWeightHeight;
    if (inputs.autoWeightDepth) inputs.autoWeightDepth.value = state.autoWeightDepth;
    if (inputs.quickAutoWeightWidth) inputs.quickAutoWeightWidth.value = state.autoWeightWidth;
    if (inputs.quickAutoWeightHeight) inputs.quickAutoWeightHeight.value = state.autoWeightHeight;
    if (inputs.quickAutoWeightDepth) inputs.quickAutoWeightDepth.value = state.autoWeightDepth;
  } finally {
    isSyncingLinkedControls = false;
  }
}

function getAutoWeights(currentState) {
  const w = Math.max(0, safeNumber(currentState.autoWeightWidth));
  const h = Math.max(0, safeNumber(currentState.autoWeightHeight));
  const d = Math.max(0, safeNumber(currentState.autoWeightDepth));
  const sum = w + h + d;
  if (sum <= 0) {
    return { width: 1 / 3, height: 1 / 3, depth: 1 / 3 };
  }
  return { width: w / sum, height: h / sum, depth: d / sum };
}

function getTargetPrioritySuggestion(currentState, constraintData) {
  const minDim = 0.01;
  const minDepth = Math.max(minDim, safeNumber(currentState.mountingDepth) || 0);
  const targetGross = currentState.targetNetVolume + currentState.driverDisplacement;
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

function getMaximizeSuggestion(currentState, constraintData, startingInternal) {
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
  const targetGross = currentState.targetNetVolume + currentState.driverDisplacement;
  if (!(targetGross > 0)) {
    return { internal: null, maxed: { width: false, height: false, depth: false } };
  }

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  // Build from scratch (not from current dimensions) so this mode can both grow and shrink:
  // we "fill" height first, then width, then depth until the target gross volume is reached.
  // Respect a practical minimum depth so we don't suggest boxes shallower than the driver mounting depth.
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

  // Priority: height -> width -> depth. For each dimension, increase it just enough to hit target gross,
  // otherwise max it out and continue to the next dimension.
  if (grossFt3(internal) < targetGross) {
    const neededH = setToMeetTarget('height', maxInternal.height);
    if (neededH !== null) {
      if (neededH <= maxInternal.height + 1e-9) {
        if (neededH >= maxInternal.height - 1e-6) maxed.height = true;
        internal.height = neededH;
      }
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

function setConstraintMaxHighlights(maxed) {
  if (!inputs.maxBoxWidth || !inputs.maxBoxHeight || !inputs.maxBoxDepth) return;
  const toggle = (el, on) => {
    if (!el) return;
    el.classList.toggle('is-maxed', !!on);
  };
  toggle(inputs.maxBoxWidth, maxed && maxed.width);
  toggle(inputs.maxBoxHeight, maxed && maxed.height);
  toggle(inputs.maxBoxDepth, maxed && maxed.depth);
}

function setDriverDepthHighlight(internalDimensions) {
  if (!inputs.depth) return;
  const tooShallow = safeNumber(state.mountingDepth) > safeNumber(internalDimensions.depth);
  inputs.depth.classList.toggle('is-too-shallow', tooShallow);
}

function syncQuickInputs(force) {
  if (!inputs.quickWidth || !inputs.quickHeight || !inputs.quickDepth) return;
  const active = document.activeElement;
  const isEditingQuick =
    active === inputs.quickWidth ||
    active === inputs.quickHeight ||
    active === inputs.quickDepth;
  if (!force && isEditingQuick) return;

  const internalDimensions = getInternalDimensions(state);
  const externalDimensions = getExternalDimensions(state);
  const dim = state.dimensionMode === 'internal' ? internalDimensions : externalDimensions;
  inputs.quickWidth.value = dim.width.toFixed(2);
  inputs.quickHeight.value = dim.height.toFixed(2);
  inputs.quickDepth.value = dim.depth.toFixed(2);
}

function getTargetBaselineInternal(currentState, constraintData) {
  const minDim = 0.01;
  const minDepth = Math.max(minDim, safeNumber(currentState.mountingDepth) || 0);

  // Prefer using a constraint-based baseline so "Apply" rebuilds from a neutral,
  // repeatable shape rather than any manually-entered current dimensions.
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

  // Fallback baseline (no constraints): reasonable starting proportions.
  return {
    width: 18,
    height: 14,
    depth: Math.max(minDepth, 14)
  };
}

function getCutSheet(externalDimensions, woodThickness) {
  const panelHeight = externalDimensions.height - woodThickness * 2;
  const panelDepth = externalDimensions.depth - woodThickness * 2;

  return [
    { part: 'Top', qty: 1, width: externalDimensions.width, height: externalDimensions.depth },
    { part: 'Bottom', qty: 1, width: externalDimensions.width, height: externalDimensions.depth },
    { part: 'Front', qty: 1, width: externalDimensions.width, height: panelHeight },
    { part: 'Back', qty: 1, width: externalDimensions.width, height: panelHeight },
    { part: 'Left Side', qty: 1, width: panelDepth, height: panelHeight },
    { part: 'Right Side', qty: 1, width: panelDepth, height: panelHeight }
  ];
}

function renderWarnings(warnings) {
  outputs.warnings.innerHTML = '';
  if (warnings.length === 0) {
    outputs.warnings.classList.add('ok');
    const li = document.createElement('li');
    li.textContent = 'Design checks passed.';
    outputs.warnings.append(li);
    return;
  }

  outputs.warnings.classList.remove('ok');
  warnings.forEach((message) => {
    const li = document.createElement('li');
    li.textContent = message;
    outputs.warnings.append(li);
  });
}

function renderSVG(externalDimensions, internalDimensions) {
  const svg = outputs.diagram;
  const viewWidth = 420;
  const viewHeight = 260;
  const padding = 22;
  const offset = 56;

  const safeW = Math.max(externalDimensions.width, 0.01);
  const safeH = Math.max(externalDimensions.height, 0.01);
  const safeDepth = Math.max(externalDimensions.depth, 0.01);
  const availableW = viewWidth - padding * 2 - offset - 18;
  const availableH = viewHeight - padding * 2 - 30;
  const scale = Math.min(availableW / safeW, availableH / safeH);

  const w = safeW * scale;
  const h = safeH * scale;

  const fx = padding + (availableW - w) * 0.5;
  let fy = padding + (availableH - h) * 0.34;

  const backX = fx + offset;
  let backY = fy - offset * 0.42;
  if (backY < 10) {
    fy += 10 - backY;
    backY = 10;
  }

  const lines = [
    `<rect x="${fx}" y="${fy}" width="${w}" height="${h}" rx="4" fill="rgba(24,52,112,0.42)" stroke="#58d4ff" stroke-width="2" />`,
    `<rect x="${backX}" y="${backY}" width="${w}" height="${h}" rx="4" fill="rgba(14,31,65,0.35)" stroke="#4f8bff" stroke-width="1.4" />`,
    `<line x1="${fx}" y1="${fy}" x2="${backX}" y2="${backY}" stroke="#77c9ff" stroke-width="1.2" />`,
    `<line x1="${fx + w}" y1="${fy}" x2="${backX + w}" y2="${backY}" stroke="#77c9ff" stroke-width="1.2" />`,
    `<line x1="${fx}" y1="${fy + h}" x2="${backX}" y2="${backY + h}" stroke="#77c9ff" stroke-width="1.2" />`,
    `<line x1="${fx + w}" y1="${fy + h}" x2="${backX + w}" y2="${backY + h}" stroke="#77c9ff" stroke-width="1.2" />`
  ];

  const rightLimit = viewWidth - padding;
  const leftLimit = padding;
  const estimateLabelWidth = (text) => text.length * 7;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const widthText = `W: ${formatInches(externalDimensions.width)}`;
  const heightText = `H: ${formatInches(externalDimensions.height)}`;
  const depthText = `D: ${formatInches(safeDepth)}`;

  const widthLabelY = clamp(fy + h + 24, padding + 16, viewHeight - 28);
  const heightLabelY = clamp(fy + h / 2, padding + 16, viewHeight - 34);
  const heightLabelX = clamp(
    fx + w + 16,
    leftLimit,
    rightLimit - estimateLabelWidth(heightText)
  );
  const depthLabelX = clamp(
    backX + w + 8,
    leftLimit,
    rightLimit - estimateLabelWidth(depthText)
  );
  const depthLabelY = clamp(backY - 8, padding + 14, viewHeight - 40);

  lines.push(`<text x="${fx + w / 2}" y="${widthLabelY}" text-anchor="middle" fill="#bcd6ff" font-size="12">${widthText}</text>`);
  lines.push(`<text x="${heightLabelX}" y="${heightLabelY}" fill="#bcd6ff" font-size="12">${heightText}</text>`);
  lines.push(`<text x="${depthLabelX}" y="${depthLabelY}" fill="#7ae3ff" font-size="12">${depthText}</text>`);
  const internalVolume = getVolume(internalDimensions);
  const netAfter = getNetVolume(internalVolume.ft3, state.driverDisplacement);
  // Place spec text at the top-left so it doesn't overlap width label at the bottom.
  const specX = padding + 2;
  const specY1 = padding + 14;
  const specY2 = padding + 30;
  lines.push(`<text x="${specX}" y="${specY1}" fill="#8fb2f8" font-size="11">Internal: ${formatDimensions(internalDimensions)}</text>`);
  lines.push(`<text x="${specX}" y="${specY2}" fill="#bcd6ff" font-size="11">Gross: ${internalVolume.ft3.toFixed(3)} ft³ • Net: ${netAfter.toFixed(3)} ft³</text>`);

  svg.innerHTML = lines.join('');
}

function renderCutSheet(externalDimensions, woodThickness) {
  const rows = getCutSheet(externalDimensions, woodThickness);

  const invalidPanels = rows.some((row) => row.width <= 0 || row.height <= 0);
  if (invalidPanels) {
    outputs.cutSheet.innerHTML = '<p class="cut-sheet-message">Cut sheet unavailable: panel sizes became non-positive. Check dimensions and wood thickness.</p>';
    return;
  }

  const body = rows
    .map((row) => `<tr><td>${row.part}</td><td>${row.qty}</td><td>${row.width.toFixed(2)} in</td><td>${row.height.toFixed(2)} in</td></tr>`)
    .join('');

  outputs.cutSheet.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Panel</th>
          <th>Qty</th>
          <th>Width</th>
          <th>Height</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function renderPresetState() {
  const buttons = document.querySelectorAll('.preset-btn');
  buttons.forEach((button) => {
    const presetValue = safeNumber(button.dataset.preset);
    button.classList.toggle('active', Math.abs(presetValue - state.targetNetVolume) < 0.005);
  });
}

function updateSpaceInfo() {
  const spaceInfoEl = document.getElementById('spaceInfo');
  if (!spaceInfoEl) return;

  if (!state.useMaxConstraints) {
    spaceInfoEl.textContent = 'Constraints disabled';
    return;
  }

  const maxIn3 = state.maxBoxWidth * state.maxBoxHeight * state.maxBoxDepth;
  const maxFt3 = maxIn3 / 1728;
  spaceInfoEl.textContent = `Available trunk space: ${maxFt3.toFixed(2)} ft³`;
}

function renderUI() {
  const internalDimensions = getInternalDimensions(state);
  const externalDimensions = getExternalDimensions(state);

  const internalVolume = getVolume(internalDimensions);
  const netAfter = getNetVolume(internalVolume.ft3, state.driverDisplacement);
  const warnings = validateBox(state, internalDimensions);

  updateSpaceInfo();

  const constraintData = getConstraintData(state, externalDimensions);
  let suggestedInternal = null;
  let maxed = { width: false, height: false, depth: false };
  if (state.useMaxConstraints && state.suggestionMode === 'maximize') {
    const maximize = getMaximizeSuggestion(state, constraintData, internalDimensions);
    suggestedInternal = maximize.internal;
    maxed = maximize.maxed;
  } else {
    if (state.useMaxConstraints) {
      const target = getTargetPrioritySuggestion(state, constraintData);
      suggestedInternal = target.internal;
      maxed = target.maxed;
    } else {
      const baselineInternal = getTargetBaselineInternal(state, constraintData);
      const unconstrainedSuggested = getSuggestedInternalDimensions(state, baselineInternal);
      const suggestedResult = applyConstraintToSuggested(state, unconstrainedSuggested, constraintData);
      suggestedInternal = suggestedResult.internal;
    }
  }
  setConstraintMaxHighlights(state.useMaxConstraints ? maxed : null);
  setDriverDepthHighlight(internalDimensions);

  outputs.internalDimensions.textContent = formatDimensions(internalDimensions);
  outputs.externalDimensions.textContent = formatDimensions(externalDimensions);
  outputs.grossVolume.textContent = `${internalVolume.in3.toFixed(2)} in³ | ${internalVolume.ft3.toFixed(3)} ft³`;
  outputs.netBefore.textContent = `${internalVolume.ft3.toFixed(3)} ft³`;
  outputs.netAfter.textContent = `${netAfter.toFixed(3)} ft³`;
  if (outputs.quickVolume) {
    outputs.quickVolume.textContent = `Gross ${internalVolume.ft3.toFixed(3)} ft³ • Net ${netAfter.toFixed(3)} ft³`;
  }

  // Keep quick-adjust inputs in sync with current mode dimensions (unless user is typing).
  syncQuickInputs(false);

  if (suggestedInternal) {
    outputs.suggestedInternalDimensions.textContent = formatDimensionsLabeled(suggestedInternal);
    outputs.applySuggestedBtn.disabled = false;
  } else {
    outputs.suggestedInternalDimensions.textContent = '-';
    outputs.applySuggestedBtn.disabled = true;
  }

  renderWarnings(warnings);
  renderSVG(externalDimensions, internalDimensions);
  renderCutSheet(externalDimensions, state.woodThickness);
  renderPresetState();
}

function syncStateFromInputs(changedKey) {
  state.width = safeNumber(inputs.width.value);
  state.height = safeNumber(inputs.height.value);
  state.depth = safeNumber(inputs.depth.value);
  state.woodThickness = safeNumber(inputs.woodThickness.value);
  state.driverSize = Number.parseInt(inputs.driverSize.value, 10);
  state.driverCutout = safeNumber(inputs.driverCutout.value);
  state.driverDepth = safeNumber(inputs.driverDepth.value);
  state.mountingDepth = safeNumber(inputs.mountingDepth.value);
  state.driverDisplacement = safeNumber(inputs.driverDisplacement.value);
  if (inputs.driverSensitivity) state.driverSensitivity = safeNumber(inputs.driverSensitivity.value);
  if (inputs.voiceCoilDiameter) state.voiceCoilDiameter = safeNumber(inputs.voiceCoilDiameter.value);
  if (inputs.enclosureType) state.enclosureType = inputs.enclosureType.value === 'ported' ? 'ported' : 'sealed';
  if (inputs.tuningFrequency) state.tuningFrequency = safeNumber(inputs.tuningFrequency.value);
  state.targetNetVolume = safeNumber(inputs.targetNetVolume.value);
  const suggestionModeValue = (inputs.quickSuggestionMode && changedKey === 'quickSuggestionMode')
    ? inputs.quickSuggestionMode.value
    : (inputs.suggestionMode ? inputs.suggestionMode.value : state.suggestionMode);
  state.suggestionMode = suggestionModeValue === 'maximize' ? 'maximize' : 'target';

  const p1 = (changedKey === 'quickAutoPriority1' && inputs.quickAutoPriority1) ? inputs.quickAutoPriority1.value : (inputs.autoPriority1 ? inputs.autoPriority1.value : state.autoPriority1);
  const p2 = (changedKey === 'quickAutoPriority2' && inputs.quickAutoPriority2) ? inputs.quickAutoPriority2.value : (inputs.autoPriority2 ? inputs.autoPriority2.value : state.autoPriority2);
  const p3 = (changedKey === 'quickAutoPriority3' && inputs.quickAutoPriority3) ? inputs.quickAutoPriority3.value : (inputs.autoPriority3 ? inputs.autoPriority3.value : state.autoPriority3);
  state.autoPriority1 = p1;
  state.autoPriority2 = p2;
  state.autoPriority3 = p3;

  const ww = (changedKey === 'quickAutoWeightWidth' && inputs.quickAutoWeightWidth) ? inputs.quickAutoWeightWidth.value : (inputs.autoWeightWidth ? inputs.autoWeightWidth.value : state.autoWeightWidth);
  const wh = (changedKey === 'quickAutoWeightHeight' && inputs.quickAutoWeightHeight) ? inputs.quickAutoWeightHeight.value : (inputs.autoWeightHeight ? inputs.autoWeightHeight.value : state.autoWeightHeight);
  const wd = (changedKey === 'quickAutoWeightDepth' && inputs.quickAutoWeightDepth) ? inputs.quickAutoWeightDepth.value : (inputs.autoWeightDepth ? inputs.autoWeightDepth.value : state.autoWeightDepth);
  state.autoWeightWidth = safeNumber(ww);
  state.autoWeightHeight = safeNumber(wh);
  state.autoWeightDepth = safeNumber(wd);

  syncLinkedSuggestionControlsFromState();
  state.useMaxConstraints = inputs.useMaxConstraints.checked;
  state.maxBoxWidth = safeNumber(inputs.maxBoxWidth.value);
  state.maxBoxHeight = safeNumber(inputs.maxBoxHeight.value);
  state.maxBoxDepth = safeNumber(inputs.maxBoxDepth.value);

  const modeInput = document.querySelector('input[name="dimensionMode"]:checked');
  if (modeInput) {
    state.dimensionMode = modeInput.value;
  }

  if (changedKey === 'driverSize') {
    const defaults = DRIVER_DEFAULTS[state.driverSize];
    if (defaults) {
      state.driverCutout = defaults.cutout;
      state.driverDepth = defaults.depth;
      state.mountingDepth = defaults.depth;
      state.driverDisplacement = defaults.displacement;

      inputs.driverCutout.value = defaults.cutout;
      inputs.driverDepth.value = defaults.depth;
      inputs.mountingDepth.value = defaults.depth;
      inputs.driverDisplacement.value = defaults.displacement;
    }
  }

  persistState();
}

function applySuggestedDimensions() {
  // Ensure current UI selections (like suggestion mode) are reflected in state.
  syncStateFromInputs();

  const internalDimensions = getInternalDimensions(state);
  const constraintData = getConstraintData(state, getExternalDimensions(state));

  let suggestedInternal = null;
  if (state.useMaxConstraints && state.suggestionMode === 'maximize') {
    suggestedInternal = getMaximizeSuggestion(state, constraintData, internalDimensions).internal;
  } else {
    if (state.useMaxConstraints) {
      suggestedInternal = getTargetPrioritySuggestion(state, constraintData).internal;
    } else {
      const baselineInternal = getTargetBaselineInternal(state, constraintData);
      const unconstrainedSuggested = getSuggestedInternalDimensions(state, baselineInternal);
      suggestedInternal = applyConstraintToSuggested(state, unconstrainedSuggested, constraintData).internal;
    }

    // Fallback: if current internal dimensions are invalid (or suggestion failed),
    // still derive a cube that matches the target gross volume.
    if (!suggestedInternal) {
      const targetGross = state.targetNetVolume + state.driverDisplacement;
      if (targetGross > 0) {
        const cube = Math.cbrt(targetGross * 1728);
        suggestedInternal = { width: cube, height: cube, depth: cube };
      } else {
        return;
      }
    }
  }

  if (state.dimensionMode === 'internal') {
    state.width = suggestedInternal.width;
    state.height = suggestedInternal.height;
    state.depth = suggestedInternal.depth;
  } else {
    const t = state.woodThickness * 2;
    state.width = suggestedInternal.width + t;
    state.height = suggestedInternal.height + t;
    state.depth = suggestedInternal.depth + t;
  }

  if (inputs.width) inputs.width.value = state.width.toFixed(2);
  if (inputs.height) inputs.height.value = state.height.toFixed(2);
  if (inputs.depth) inputs.depth.value = state.depth.toFixed(2);

  persistState();
  renderUI();
  // Clicking apply should always "snap" quick inputs back to the applied values.
  syncQuickInputs(true);
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadPersistedState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const saved = JSON.parse(raw);
    const merged = { ...state, ...saved };

    state.dimensionMode = merged.dimensionMode === 'internal' ? 'internal' : 'external';
    state.width = safeNumber(merged.width);
    state.height = safeNumber(merged.height);
    state.depth = safeNumber(merged.depth);
    state.woodThickness = safeNumber(merged.woodThickness);
    state.driverSize = Number.parseInt(merged.driverSize, 10) || 12;
    state.driverCutout = safeNumber(merged.driverCutout);
    state.mountingDepth = safeNumber(merged.mountingDepth);
    state.driverDisplacement = safeNumber(merged.driverDisplacement);
    state.targetNetVolume = safeNumber(merged.targetNetVolume) || 1.25;
    state.suggestionMode = merged.suggestionMode === 'maximize' ? 'maximize' : 'target';
    state.autoPriority1 = ['width', 'height', 'depth'].includes(merged.autoPriority1) ? merged.autoPriority1 : 'height';
    state.autoPriority2 = ['width', 'height', 'depth'].includes(merged.autoPriority2) ? merged.autoPriority2 : 'width';
    state.autoPriority3 = ['width', 'height', 'depth'].includes(merged.autoPriority3) ? merged.autoPriority3 : 'depth';
    state.autoWeightWidth = safeNumber(merged.autoWeightWidth) || 33;
    state.autoWeightHeight = safeNumber(merged.autoWeightHeight) || 34;
    state.autoWeightDepth = safeNumber(merged.autoWeightDepth) || 33;
    state.useMaxConstraints = merged.useMaxConstraints !== false;
    state.maxBoxWidth = safeNumber(merged.maxBoxWidth) || 38;
    state.maxBoxHeight = safeNumber(merged.maxBoxHeight) || 16;
    state.maxBoxDepth = safeNumber(merged.maxBoxDepth) || 22;
  } catch (_) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function syncInputsFromState() {
  if (inputs.width) inputs.width.value = state.width;
  if (inputs.height) inputs.height.value = state.height;
  if (inputs.depth) inputs.depth.value = state.depth;
  if (inputs.woodThickness) inputs.woodThickness.value = state.woodThickness;
  if (inputs.driverSize) inputs.driverSize.value = String(state.driverSize);
  if (inputs.driverCutout) inputs.driverCutout.value = state.driverCutout;
  if (inputs.driverDepth) inputs.driverDepth.value = state.driverDepth;
  if (inputs.mountingDepth) inputs.mountingDepth.value = state.mountingDepth;
  if (inputs.driverDisplacement) inputs.driverDisplacement.value = state.driverDisplacement;
  if (inputs.driverSensitivity) inputs.driverSensitivity.value = state.driverSensitivity;
  if (inputs.voiceCoilDiameter) inputs.voiceCoilDiameter.value = state.voiceCoilDiameter;
  if (inputs.enclosureType) inputs.enclosureType.value = state.enclosureType;
  if (inputs.tuningFrequency) inputs.tuningFrequency.value = state.tuningFrequency;
  if (inputs.targetNetVolume) inputs.targetNetVolume.value = state.targetNetVolume;
  if (inputs.suggestionMode) inputs.suggestionMode.value = state.suggestionMode;
  if (inputs.autoPriority1) inputs.autoPriority1.value = state.autoPriority1;
  if (inputs.autoPriority2) inputs.autoPriority2.value = state.autoPriority2;
  if (inputs.autoPriority3) inputs.autoPriority3.value = state.autoPriority3;
  if (inputs.autoWeightWidth) inputs.autoWeightWidth.value = state.autoWeightWidth;
  if (inputs.autoWeightHeight) inputs.autoWeightHeight.value = state.autoWeightHeight;
  if (inputs.autoWeightDepth) inputs.autoWeightDepth.value = state.autoWeightDepth;
  // Also sync the duplicated controls inside Quick Volume Sizing.
  syncLinkedSuggestionControlsFromState();
  if (inputs.useMaxConstraints) inputs.useMaxConstraints.checked = state.useMaxConstraints;
  if (inputs.maxBoxWidth) inputs.maxBoxWidth.value = state.maxBoxWidth;
  if (inputs.maxBoxHeight) inputs.maxBoxHeight.value = state.maxBoxHeight;
  if (inputs.maxBoxDepth) inputs.maxBoxDepth.value = state.maxBoxDepth;

  const modeSelector = `input[name="dimensionMode"][value="${state.dimensionMode}"]`;
  const modeInput = document.querySelector(modeSelector);
  if (modeInput) {
    modeInput.checked = true;
  }
}

function bindEvents() {
  Object.entries(inputs).forEach(([key, element]) => {
    if (!element) return;
    if (key === 'quickWidth' || key === 'quickHeight' || key === 'quickDepth') return;
    element.addEventListener('input', () => {
      syncStateFromInputs(key);
      renderUI();
    });

    element.addEventListener('change', () => {
      syncStateFromInputs(key);
      renderUI();
    });
  });

  // Quick adjust controls inside the diagram card.
  const applyQuick = () => {
    if (!inputs.quickWidth || !inputs.quickHeight || !inputs.quickDepth) return;
    const w = safeNumber(inputs.quickWidth.value);
    const h = safeNumber(inputs.quickHeight.value);
    const d = safeNumber(inputs.quickDepth.value);
    state.width = w;
    state.height = h;
    state.depth = d;
    // Update main inputs, but don't fight the user while they're typing in quick fields.
    const active = document.activeElement;
    const isEditingQuick =
      active === inputs.quickWidth ||
      active === inputs.quickHeight ||
      active === inputs.quickDepth;
    // Keep the main dimension inputs in sync even while editing quick fields so any
    // subsequent "Apply" action reads the latest values.
    if (inputs.width) inputs.width.value = w.toFixed(2);
    if (inputs.height) inputs.height.value = h.toFixed(2);
    if (inputs.depth) inputs.depth.value = d.toFixed(2);
    if (!isEditingQuick) syncInputsFromState();
    persistState();
    renderUI();
  };

  ['quickWidth', 'quickHeight', 'quickDepth'].forEach((id) => {
    const el = inputs[id];
    if (!el) return;
    // input updates live, but renderUI won't overwrite the focused field
    el.addEventListener('input', applyQuick);
    el.addEventListener('change', applyQuick);
  });

  // When switching back to target mode after maximizing, recompute from a neutral baseline
  // so we don't "stick" on maxed width/height just because the current box already matches target volume.
  if (inputs.suggestionMode) {
    inputs.suggestionMode.addEventListener('change', () => {
      if (inputs.suggestionMode.value !== 'target') return;
      // Use a baseline internal shape that is smaller than max width/height and respects driver depth,
      // then scale it to the target volume.
      const constraintData = getConstraintData(state, getExternalDimensions(state));
      const maxInternal = constraintData.maxInternal || getInternalDimensions(state);
      const minDepth = Math.max(0.01, safeNumber(state.mountingDepth) || 0);
      const baseInternal = {
        width: Math.max(0.01, maxInternal.width * 0.75),
        height: Math.max(0.01, maxInternal.height * 0.75),
        depth: Math.max(0.01, Math.min(maxInternal.depth, Math.max(minDepth, maxInternal.depth * 0.6)))
      };
      const suggested = getSuggestedInternalDimensions(state, baseInternal);
      if (!suggested) return;
      if (state.dimensionMode === 'internal') {
        state.width = suggested.width;
        state.height = suggested.height;
        state.depth = suggested.depth;
      } else {
        const t = state.woodThickness * 2;
        state.width = suggested.width + t;
        state.height = suggested.height + t;
        state.depth = suggested.depth + t;
      }
      syncInputsFromState();
      persistState();
    });
  }

  // Ensure auto priority selectors remain unique (no duplicates).
  const sanitizeAutoPriority = () => {
    if (!inputs.autoPriority1 || !inputs.autoPriority2 || !inputs.autoPriority3) return;
    const vals = [inputs.autoPriority1.value, inputs.autoPriority2.value, inputs.autoPriority3.value];
    const all = ['height', 'width', 'depth'];
    const used = [];
    for (const v of vals) {
      if (all.includes(v) && !used.includes(v)) used.push(v);
    }
    for (const v of all) {
      if (!used.includes(v)) used.push(v);
    }
    inputs.autoPriority1.value = used[0];
    inputs.autoPriority2.value = used[1];
    inputs.autoPriority3.value = used[2];
    syncStateFromInputs();
    renderUI();
  };

  ['autoPriority1', 'autoPriority2', 'autoPriority3'].forEach((id) => {
    const el = inputs[id];
    if (!el) return;
    el.addEventListener('change', sanitizeAutoPriority);
  });

  const sanitizeQuickAutoPriority = () => {
    if (!inputs.quickAutoPriority1 || !inputs.quickAutoPriority2 || !inputs.quickAutoPriority3) return;
    const vals = [inputs.quickAutoPriority1.value, inputs.quickAutoPriority2.value, inputs.quickAutoPriority3.value];
    const all = ['height', 'width', 'depth'];
    const used = [];
    for (const v of vals) {
      if (all.includes(v) && !used.includes(v)) used.push(v);
    }
    for (const v of all) {
      if (!used.includes(v)) used.push(v);
    }
    inputs.quickAutoPriority1.value = used[0];
    inputs.quickAutoPriority2.value = used[1];
    inputs.quickAutoPriority3.value = used[2];
    syncStateFromInputs();
    renderUI();
  };

  ['quickAutoPriority1', 'quickAutoPriority2', 'quickAutoPriority3'].forEach((id) => {
    const el = inputs[id];
    if (!el) return;
    el.addEventListener('change', sanitizeQuickAutoPriority);
  });

  if (inputs.quickSuggestionMode) {
    inputs.quickSuggestionMode.addEventListener('change', () => {
      syncStateFromInputs('quickSuggestionMode');
      persistState();
      renderUI();
    });
  }
  ['quickAutoWeightWidth', 'quickAutoWeightHeight', 'quickAutoWeightDepth'].forEach((id) => {
    const el = inputs[id];
    if (!el) return;
    el.addEventListener('input', () => {
      syncStateFromInputs(id);
      persistState();
      renderUI();
    });
  });

  document.querySelectorAll('input[name="dimensionMode"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      syncStateFromInputs();
      renderUI();
    });
  });

  document.querySelectorAll('.preset-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const presetValue = safeNumber(button.dataset.preset);
      state.targetNetVolume = presetValue;
      inputs.targetNetVolume.value = presetValue.toFixed(2);
      persistState();
        renderUI();
        applySuggestedDimensions();
    });
  });

  // Parts Express spec parsing
  if (inputs.parsePartsBtn) {
    inputs.parsePartsBtn.addEventListener('click', () => {
      const text = inputs.partsSpecPaste.value || '';
      persistPartsSpec(text);
      const parsed = parsePartsSpec(text);
      if (parsed) {
        // Prefer sealed values if present and enclosure set to sealed, otherwise use ported
        if (parsed.sealedVolume && state.enclosureType === 'sealed') {
          state.targetNetVolume = parsed.sealedVolume;
          inputs.targetNetVolume.value = parsed.sealedVolume.toFixed(2);
          if (parsed.sealedF3) {
            state.tuningFrequency = parsed.sealedF3;
            inputs.tuningFrequency.value = parsed.sealedF3;
          }
        }
        if (parsed.ventedVolume && state.enclosureType === 'ported') {
          state.targetNetVolume = parsed.ventedVolume;
          inputs.targetNetVolume.value = parsed.ventedVolume.toFixed(2);
          if (parsed.ventedF3) {
            state.tuningFrequency = parsed.ventedF3;
            inputs.tuningFrequency.value = parsed.ventedF3;
          }
        }
        // If enclosureType not matched, set both as suggestions (choose sealed by default)
        if (!parsed.sealedVolume && !parsed.ventedVolume) {
          // nothing
        }
        persistState();
        // populate preview inputs and render
        populateParsedPreview(parsed);
        renderUI();
      }
    });

    inputs.clearPartsBtn.addEventListener('click', () => {
      inputs.partsSpecPaste.value = '';
      persistPartsSpec('');
      populateParsedPreview(null);
    });
  }
  if (inputs.partsSpecPaste) {
    inputs.partsSpecPaste.addEventListener('input', () => {
      persistPartsSpec(inputs.partsSpecPaste.value || '');
    });
  }

  // Preview apply/reset
  if (inputs.applyParsedBtn) {
    inputs.applyParsedBtn.addEventListener('click', () => {
      // Quick visual confirmation that the click handler is running.
      try {
        const originalLabel = inputs.applyParsedBtn.textContent;
        inputs.applyParsedBtn.textContent = 'Applied ✓';
        window.setTimeout(() => {
          inputs.applyParsedBtn.textContent = originalLabel;
        }, 650);
      } catch (_) {
        // ignore
      }
      // Apply preview values (favor vented if present), update enclosure type,
      // then compute & apply suggested internal dimensions immediately.
      let sv = safeNumber(inputs.parsedSealedVolume.value);
      let vv = safeNumber(inputs.parsedVentedVolume.value);
      const sf = Number.parseInt(inputs.parsedSealedF3.value, 10) || 0;
      const vf = Number.parseInt(inputs.parsedVentedF3.value, 10) || 0;

      if (sv <= 0 && vv <= 0) {
        const text = (inputs.partsSpecPaste && inputs.partsSpecPaste.value) ? inputs.partsSpecPaste.value : '';
        const parsed = parsePartsSpec(text);
        if (parsed) {
          populateParsedPreview(parsed);
          sv = parsed.sealedVolume || 0;
          vv = parsed.ventedVolume || 0;
        }
      }

      // Respect the currently selected enclosure type; only fall back to the other
      // volume if the selected one is missing.
      const selectedType = inputs.enclosureType ? inputs.enclosureType.value : state.enclosureType;
      const wantsPorted = selectedType === 'ported';

      const applyVolume = (volume, f3) => {
        state.targetNetVolume = volume;
        if (inputs.targetNetVolume) inputs.targetNetVolume.value = volume.toFixed(2);
        if (f3 > 0) {
          state.tuningFrequency = f3;
          if (inputs.tuningFrequency) inputs.tuningFrequency.value = f3;
        }
      };

      if (!wantsPorted && sv > 0) {
        state.enclosureType = 'sealed';
        applyVolume(sv, sf);
      } else if (wantsPorted && vv > 0) {
        state.enclosureType = 'ported';
        applyVolume(vv, vf);
      } else if (sv > 0) {
        // fallback if chosen type has no volume
        state.enclosureType = 'sealed';
        applyVolume(sv, sf);
      } else if (vv > 0) {
        state.enclosureType = 'ported';
        applyVolume(vv, vf);
      }

      persistState();
      applySuggestedDimensions();
      // Ensure form inputs mirror the current state before rendering outputs.
      syncInputsFromState();
      renderUI();
      // After applying, reset quick controls to match the applied dimensions.
      syncQuickInputs(true);
    });

    if (inputs.resetParsedBtn) {
      inputs.resetParsedBtn.addEventListener('click', () => {
        // reset preview to last parsed values from paste
        populateParsedPreview(lastParsed);
      });
    }

    // Track manual edits on preview fields
    ['parsedSealedVolume', 'parsedVentedVolume', 'parsedSealedF3', 'parsedVentedF3'].forEach((id) => {
      const el = inputs[id];
      if (!el) return;
      el.addEventListener('input', () => markIfModified(el));
    });
  }

  if (outputs.applySuggestedBtn) {
    outputs.applySuggestedBtn.addEventListener('click', () => {
      applySuggestedDimensions();
    });
  }

  document.querySelectorAll('.tab-btn').forEach((button) => {
    button.addEventListener('click', () => {
      setActiveTab(button.dataset.tab || 'design');
    });
  });
}

loadPersistedState();
syncInputsFromState();
bindEvents();
setActiveTab('design');

// Seed/persist Parts Express paste + preview defaults so Apply Preview works without re-pasting.
if (inputs.partsSpecPaste) {
  const savedSpec = loadPersistedPartsSpec();
  if (savedSpec) {
    inputs.partsSpecPaste.value = savedSpec;
  } else {
    inputs.partsSpecPaste.value = DEFAULT_PARTS_SPEC;
    persistPartsSpec(DEFAULT_PARTS_SPEC);
  }
}
const savedPreview = loadPersistedParsedPreview();
if (savedPreview) {
  populateParsedPreview(savedPreview);
} else if (inputs.partsSpecPaste && inputs.partsSpecPaste.value) {
  const parsed = parsePartsSpec(inputs.partsSpecPaste.value);
  if (parsed) populateParsedPreview(parsed);
}

renderUI();
