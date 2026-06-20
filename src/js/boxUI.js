/* eslint-disable no-restricted-globals */

function isCompactViewport() {
  return window.matchMedia('(max-width: 640px)').matches;
}

function getPortModeLabel(currentState) {
  if (currentState.enclosureType !== 'ported') return 'Sealed cabinet';
  const portKind = currentState.portType === 'round' ? 'Round port' : 'Slot port';
  return `${portKind} • ${currentState.autoPortMode === 'manual' ? 'manual sizing' : 'auto sizing'}`;
}

function updateAdvancedSummaryChips(currentState) {
  const enclosureSummary = document.getElementById('enclosureAdvancedSummary');
  if (enclosureSummary) {
    enclosureSummary.textContent = getPortModeLabel(currentState);
  }

  const threeSummary = document.getElementById('threeControlsSummary');
  if (threeSummary) {
    const mode = currentState.threeEditMode ? 'Edit mode' : 'Viewer mode';
    const locks = currentState.threeLockZoom && currentState.threeLockView ? 'locks on' : 'locks off';
    threeSummary.textContent = `${mode} • ${locks}`;
  }
}

function applyResponsivePanelDefaults(options) {
  const {
    responsivePanelsInitialized,
    compactViewport = isCompactViewport()
  } = options;
  const enclosurePanel = document.getElementById('enclosureAdvancedPanel');
  const threePanel = document.getElementById('threeControlsPanel');
  const designerPanel = document.getElementById('designerViewsPanel');

  if (!responsivePanelsInitialized) {
    if (compactViewport) {
      if (enclosurePanel) enclosurePanel.open = false;
      if (threePanel) threePanel.open = false;
      if (designerPanel) designerPanel.open = false;
    }
    return true;
  }

  if (!compactViewport) {
    if (enclosurePanel) enclosurePanel.open = true;
    if (threePanel) threePanel.open = true;
    if (designerPanel) designerPanel.open = true;
  }
  return responsivePanelsInitialized;
}

function renderWarnings(outputs, warnings) {
  outputs.warnings.innerHTML = '';
  outputs.warnings.classList.remove('has-errors', 'has-infos');
  if (warnings.length === 0) {
    outputs.warnings.classList.add('ok');
    const li = document.createElement('li');
    li.textContent = 'Design checks passed. Review cut sheet and vehicle fit before building.';
    outputs.warnings.append(li);
    return;
  }

  outputs.warnings.classList.remove('ok');
  const errorCount = warnings.filter((message) => /^⚠️/.test(message)).length;
  const infoCount = warnings.filter((message) => /^ℹ️/.test(message)).length;
  if (errorCount) outputs.warnings.classList.add('has-errors');
  if (infoCount) outputs.warnings.classList.add('has-infos');

  warnings.forEach((message) => {
    const li = document.createElement('li');
    if (/^⚠️/.test(message)) {
      li.className = 'warning-item warning-item-error';
    } else if (/^ℹ️/.test(message)) {
      li.className = 'warning-item warning-item-info';
    } else {
      li.className = 'warning-item warning-item-note';
    }
    li.textContent = message;
    outputs.warnings.append(li);
  });
}

function updateSpaceInfo(currentState) {
  const spaceInfoEl = document.getElementById('spaceInfo');
  if (!spaceInfoEl) return;

  if (!currentState.useMaxConstraints) {
    spaceInfoEl.textContent = 'Constraints disabled';
    return;
  }

  const maxIn3 = currentState.maxBoxWidth * currentState.maxBoxHeight * currentState.maxBoxDepth;
  const maxFt3 = maxIn3 / 1728;
  spaceInfoEl.textContent = `Available trunk space: ${maxFt3.toFixed(2)} ft³`;
}

function syncCabinetStyleUI(currentState, inputs, safeNumber) {
  const topField = document.getElementById('topDepthField');
  const bottomField = document.getElementById('bottomDepthField');
  const wedge = currentState.cabinetStyle === 'wedge';
  if (topField) topField.hidden = !wedge;
  if (bottomField) bottomField.hidden = !wedge;
  if (inputs.depth) {
    inputs.depth.disabled = wedge;
    if (!wedge) inputs.depth.value = safeNumber(currentState.depth).toFixed(2);
  }
}

function syncPortUI(currentState, inputs) {
  const ported = currentState.enclosureType === 'ported';
  const isRound = currentState.portType === 'round';
  const autoPortMode = ['manual', 'length', 'full'].includes(currentState.autoPortMode) ? currentState.autoPortMode : 'manual';
  [
    'slotPortWidth',
    'slotPortHeight',
    'slotPortLength',
    'slotPortCount',
    'slotPortChannelCount',
    'slotPortChannelGap',
    'slotPortFoldAxis',
    'slotPortFoldDirection',
    'slotPortLeadRunOffset'
  ].forEach((id) => {
    const el = inputs[id];
    if (!el || !el.parentElement) return;
    el.parentElement.hidden = !ported || isRound;
  });
  [
    'roundPortDiameter',
    'roundPortLength',
    'roundPortQuantity'
  ].forEach((id) => {
    const el = inputs[id];
    if (!el || !el.parentElement) return;
    el.parentElement.hidden = !ported || !isRound;
  });
  [
    'autoPortMode',
    'autoPortAreaPerFt3',
    'autoPortMinRoundDiameter',
    'autoPortSlotAspectRatio',
    'autoPortMinSlotHeight',
    'autoPortMinLength',
    'portTuningSpeedOfSound',
    'portTuningInsideEndCorrection',
    'portTuningOutsideEndCorrection',
    'portTuningLengthAdjustment'
  ].forEach((id) => {
    const el = inputs[id];
    if (!el || !el.parentElement) return;
    const isRoundOnly = id === 'autoPortMinRoundDiameter';
    const isSlotOnly = id === 'autoPortSlotAspectRatio' || id === 'autoPortMinSlotHeight';
    el.parentElement.hidden = !ported || (isRoundOnly && !isRound) || (isSlotOnly && isRound);
  });
  [
    'portMountFace',
    'portLayout',
    'portSpacing',
    'portExtensionMode',
    'portOffsetX',
    'portOffsetY',
    'portOffsetZ'
  ].forEach((id) => {
    const el = inputs[id];
    if (!el || !el.parentElement) return;
    el.parentElement.hidden = !ported;
  });

  // Keep port sizing fields editable so users can immediately take over manual sizing.
  // Controller logic will switch auto-port mode to manual when they edit these inputs.
  if (inputs.roundPortLength) inputs.roundPortLength.disabled = false;
  if (inputs.slotPortLength) inputs.slotPortLength.disabled = false;
  if (inputs.roundPortDiameter) inputs.roundPortDiameter.disabled = false;
  if (inputs.slotPortWidth) inputs.slotPortWidth.disabled = false;
  if (inputs.slotPortHeight) inputs.slotPortHeight.disabled = false;
}

function syncThreeModeUI(currentState, inputs) {
  const canEdit = !!currentState.threeLockZoom && !!currentState.threeLockView;
  if (!canEdit) currentState.threeEditMode = false;
  if (inputs.threeEditMode) {
    inputs.threeEditMode.disabled = !canEdit;
    inputs.threeEditMode.checked = !!currentState.threeEditMode && canEdit;
    if (inputs.threeEditMode.parentElement) {
      inputs.threeEditMode.parentElement.classList.toggle('is-disabled', !canEdit);
    }
  }
  if (inputs.threeLockZoom) inputs.threeLockZoom.checked = !!currentState.threeLockZoom;
  if (inputs.threeLockView) inputs.threeLockView.checked = !!currentState.threeLockView;
}

function syncAutoPortManagedInputs(currentState, inputs) {
  const autoPortMode = ['manual', 'length', 'full'].includes(currentState.autoPortMode) ? currentState.autoPortMode : 'manual';
  if (currentState.enclosureType !== 'ported' || autoPortMode === 'manual') return;

  if (currentState.portType === 'round') {
    if (inputs.roundPortLength) inputs.roundPortLength.value = currentState.roundPortLength;
    if (autoPortMode === 'full' && inputs.roundPortDiameter) inputs.roundPortDiameter.value = currentState.roundPortDiameter;
  } else {
    if (inputs.slotPortLength) inputs.slotPortLength.value = currentState.slotPortLength;
    if (autoPortMode === 'full') {
      if (inputs.slotPortWidth) inputs.slotPortWidth.value = currentState.slotPortWidth;
      if (inputs.slotPortHeight) inputs.slotPortHeight.value = currentState.slotPortHeight;
    }
  }
}

function parsePartsSpec(text) {
  if (!text || typeof text !== 'string') return null;
  const out = {};

  const sealedVol = text.match(/(?:sealed)\s+volume[^0-9\n]*([0-9]+(?:\.[0-9]+)?)/i);
  const ventedVol = text.match(/(?:vented|ported)\s+volume[^0-9\n]*([0-9]+(?:\.[0-9]+)?)/i);
  const sealedF3 = text.match(/(?:sealed)\s+f3[^0-9\n]*([0-9]+(?:\.[0-9]+)?)/i);
  const ventedF3 = text.match(/(?:vented|ported)\s+f3[^0-9\n]*([0-9]+(?:\.[0-9]+)?)/i);

  if (sealedVol) out.sealedVolume = parseFloat(sealedVol[1]);
  if (ventedVol) out.ventedVolume = parseFloat(ventedVol[1]);
  if (sealedF3) out.sealedF3 = Math.round(parseFloat(sealedF3[1]));
  if (ventedF3) out.ventedF3 = Math.round(parseFloat(ventedF3[1]));

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    const m1 = line.match(/sealed[^0-9\n]*([0-9]+(?:\.[0-9]+)?)(?:\s*ft|ft|ft\u00B3)?/i);
    if (m1 && !out.sealedVolume) out.sealedVolume = parseFloat(m1[1]);

    const m2 = line.match(/(?:vented|ported)[^0-9\n]*([0-9]+(?:\.[0-9]+)?)(?:\s*ft|ft|ft\u00B3)?/i);
    if (m2 && !out.ventedVolume) out.ventedVolume = parseFloat(m2[1]);

    const m3 = line.match(/sealed[^0-9\n]*f3[^0-9\n]*([0-9]+(?:\.[0-9]+)?)/i);
    if (m3 && !out.sealedF3) out.sealedF3 = Math.round(parseFloat(m3[1]));

    const m4 = line.match(/(?:vented|ported)[^0-9\n]*f3[^0-9\n]*([0-9]+(?:\.[0-9]+)?)/i);
    if (m4 && !out.ventedF3) out.ventedF3 = Math.round(parseFloat(m4[1]));
  }

  return Object.keys(out).length ? out : null;
}

function populateParsedPreview(inputs, parsedStorageKey, parsed) {
  if (!inputs.parsedSealedVolume) return;

  try {
    if (parsed) localStorage.setItem(parsedStorageKey, JSON.stringify(parsed));
    else localStorage.removeItem(parsedStorageKey);
  } catch (_) {
    // ignore
  }

  const setVal = (el, value) => {
    if (value === undefined || value === null) {
      el.value = '';
      el.dataset.original = '';
    } else {
      el.value = String(value);
      el.dataset.original = String(value);
    }
    el.classList.remove('modified');
  };

  setVal(inputs.parsedSealedVolume, parsed && parsed.sealedVolume ? parsed.sealedVolume.toFixed(2) : '');
  setVal(inputs.parsedVentedVolume, parsed && parsed.ventedVolume ? parsed.ventedVolume.toFixed(2) : '');
  setVal(inputs.parsedSealedF3, parsed && parsed.sealedF3 ? parsed.sealedF3 : '');
  setVal(inputs.parsedVentedF3, parsed && parsed.ventedF3 ? parsed.ventedF3 : '');
}

function loadPersistedPartsSpec(partsSpecStorageKey) {
  try {
    const raw = localStorage.getItem(partsSpecStorageKey);
    return typeof raw === 'string' ? raw : '';
  } catch (_) {
    return '';
  }
}

function persistPartsSpec(partsSpecStorageKey, text) {
  try {
    localStorage.setItem(partsSpecStorageKey, text);
  } catch (_) {
    // ignore
  }
}

function loadPersistedParsedPreview(parsedStorageKey) {
  try {
    const raw = localStorage.getItem(parsedStorageKey);
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

const api = {
  isCompactViewport,
  getPortModeLabel,
  updateAdvancedSummaryChips,
  applyResponsivePanelDefaults,
  renderWarnings,
  updateSpaceInfo,
  syncCabinetStyleUI,
  syncPortUI,
  syncThreeModeUI,
  syncAutoPortManagedInputs,
  parsePartsSpec,
  populateParsedPreview,
  loadPersistedPartsSpec,
  persistPartsSpec,
  loadPersistedParsedPreview,
  markIfModified
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else if (typeof window !== 'undefined') {
  window.BoxUI = api;
}
