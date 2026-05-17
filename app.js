const STORAGE_KEY = 'boxBuilderState.v1';

const state = {
  dimensionMode: 'external',
  width: 30,
  height: 15,
  depth: 14,
  woodThickness: 0.75,
  driverSize: 12,
  driverCutout: 11.1,
  driverDepth: 6.5,
  mountingDepth: 6.5,
  driverDisplacement: 0.08,
  driverSensitivity: 88,
  voiceCoilDiameter: 2.0,
  enclosureType: 'sealed',
  tuningFrequency: 40,
  targetNetVolume: 1.25,
  useMaxConstraints: true,
  maxBoxWidth: 38,
  maxBoxHeight: 16,
  maxBoxDepth: 22
};

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
  targetNetVolume: document.getElementById('targetNetVolume'),
  useMaxConstraints: document.getElementById('useMaxConstraints'),
  maxBoxWidth: document.getElementById('maxBoxWidth'),
  maxBoxHeight: document.getElementById('maxBoxHeight'),
  maxBoxDepth: document.getElementById('maxBoxDepth')
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
  applySuggestedBtn: document.getElementById('applySuggestedBtn')
};

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
  const scale = Math.min(
    maxInternal.width / suggestedInternal.width,
    maxInternal.height / suggestedInternal.height,
    maxInternal.depth / suggestedInternal.depth,
    1
  );

  if (!Number.isFinite(scale) || scale <= 0) {
    return {
      internal: null,
      constrained: true,
      reachable: false
    };
  }

  const constrained = scale < 0.999;
  return {
    internal: {
      width: suggestedInternal.width * scale,
      height: suggestedInternal.height * scale,
      depth: suggestedInternal.depth * scale
    },
    constrained,
    reachable: !constrained
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
  lines.push(`<text x="24" y="236" fill="#8fb2f8" font-size="11">Internal: ${formatDimensions(internalDimensions)}</text>`);

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

  const unconstrainedSuggested = getSuggestedInternalDimensions(state, internalDimensions);
  const constraintData = getConstraintData(state, externalDimensions);
  const suggestedResult = applyConstraintToSuggested(state, unconstrainedSuggested, constraintData);
  const suggestedInternal = suggestedResult.internal;

  outputs.internalDimensions.textContent = formatDimensions(internalDimensions);
  outputs.externalDimensions.textContent = formatDimensions(externalDimensions);
  outputs.grossVolume.textContent = `${internalVolume.in3.toFixed(2)} in³ | ${internalVolume.ft3.toFixed(3)} ft³`;
  outputs.netBefore.textContent = `${internalVolume.ft3.toFixed(3)} ft³`;
  outputs.netAfter.textContent = `${netAfter.toFixed(3)} ft³`;

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
  state.targetNetVolume = safeNumber(inputs.targetNetVolume.value);
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
  const internalDimensions = getInternalDimensions(state);
  const unconstrainedSuggested = getSuggestedInternalDimensions(state, internalDimensions);
  const constraintData = getConstraintData(state, getExternalDimensions(state));
  const suggestedInternal = applyConstraintToSuggested(state, unconstrainedSuggested, constraintData).internal;
  if (!suggestedInternal) {
    return;
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

  inputs.width.value = state.width.toFixed(2);
  inputs.height.value = state.height.toFixed(2);
  inputs.depth.value = state.depth.toFixed(2);

  persistState();
  renderUI();
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
    state.useMaxConstraints = merged.useMaxConstraints !== false;
    state.maxBoxWidth = safeNumber(merged.maxBoxWidth) || 38;
    state.maxBoxHeight = safeNumber(merged.maxBoxHeight) || 16;
    state.maxBoxDepth = safeNumber(merged.maxBoxDepth) || 22;
  } catch (_) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function syncInputsFromState() {
  inputs.width.value = state.width;
  inputs.height.value = state.height;
  inputs.depth.value = state.depth;
  inputs.woodThickness.value = state.woodThickness;
  inputs.driverSize.value = String(state.driverSize);
  inputs.driverCutout.value = state.driverCutout;
  inputs.driverDepth.value = state.driverDepth;
  inputs.mountingDepth.value = state.mountingDepth;
  inputs.driverDisplacement.value = state.driverDisplacement;
  inputs.driverSensitivity.value = state.driverSensitivity;
  inputs.voiceCoilDiameter.value = state.voiceCoilDiameter;
  inputs.enclosureType.value = state.enclosureType;
  inputs.tuningFrequency.value = state.tuningFrequency;
  inputs.targetNetVolume.value = state.targetNetVolume;
  inputs.useMaxConstraints.checked = state.useMaxConstraints;
  inputs.maxBoxWidth.value = state.maxBoxWidth;
  inputs.maxBoxHeight.value = state.maxBoxHeight;
  inputs.maxBoxDepth.value = state.maxBoxDepth;

  const modeSelector = `input[name="dimensionMode"][value="${state.dimensionMode}"]`;
  const modeInput = document.querySelector(modeSelector);
  if (modeInput) {
    modeInput.checked = true;
  }
}

function bindEvents() {
  Object.entries(inputs).forEach(([key, element]) => {
    element.addEventListener('input', () => {
      syncStateFromInputs(key);
      renderUI();
    });

    element.addEventListener('change', () => {
      syncStateFromInputs(key);
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
    });
  });

  outputs.applySuggestedBtn.addEventListener('click', () => {
    applySuggestedDimensions();
  });

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
renderUI();
