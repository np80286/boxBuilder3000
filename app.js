const state = {
  dimensionMode: 'external',
  width: 30,
  height: 15,
  depth: 14,
  woodThickness: 0.75,
  driverSize: 12,
  driverCutout: 11.1,
  mountingDepth: 6.5,
  driverDisplacement: 0.08
};

const DRIVER_DEFAULTS = {
  8: { cutout: 7.25, depth: 4.5, displacement: 0.03 },
  10: { cutout: 9.25, depth: 5.5, displacement: 0.05 },
  12: { cutout: 11.1, depth: 6.5, displacement: 0.08 },
  15: { cutout: 13.8, depth: 7.5, displacement: 0.14 },
  18: { cutout: 16.6, depth: 9.0, displacement: 0.22 }
};

const inputs = {
  width: document.getElementById('width'),
  height: document.getElementById('height'),
  depth: document.getElementById('depth'),
  woodThickness: document.getElementById('woodThickness'),
  driverSize: document.getElementById('driverSize'),
  driverCutout: document.getElementById('driverCutout'),
  mountingDepth: document.getElementById('mountingDepth'),
  driverDisplacement: document.getElementById('driverDisplacement')
};

const outputs = {
  internalDimensions: document.getElementById('internalDimensions'),
  externalDimensions: document.getElementById('externalDimensions'),
  grossVolume: document.getElementById('grossVolume'),
  netBefore: document.getElementById('netBefore'),
  netAfter: document.getElementById('netAfter'),
  warnings: document.getElementById('warnings'),
  diagram: document.getElementById('boxDiagram')
};

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

  return warnings;
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
  const frontX = 62;
  const frontY = 58;
  const maxW = 180;
  const maxH = 130;
  const offset = 44;

  const safeW = Math.max(externalDimensions.width, 0.01);
  const safeH = Math.max(externalDimensions.height, 0.01);
  const safeD = Math.max(externalDimensions.depth, 0.01);
  const scale = Math.min(maxW / safeW, maxH / safeH, 1);

  const w = safeW * scale;
  const h = safeH * scale;

  const fx = frontX;
  const fy = frontY;

  const backX = fx + offset;
  const backY = fy - offset * 0.48;

  const lines = [
    `<rect x="${fx}" y="${fy}" width="${w}" height="${h}" rx="4" fill="rgba(24,52,112,0.42)" stroke="#58d4ff" stroke-width="2" />`,
    `<rect x="${backX}" y="${backY}" width="${w}" height="${h}" rx="4" fill="rgba(14,31,65,0.35)" stroke="#4f8bff" stroke-width="1.4" />`,
    `<line x1="${fx}" y1="${fy}" x2="${backX}" y2="${backY}" stroke="#77c9ff" stroke-width="1.2" />`,
    `<line x1="${fx + w}" y1="${fy}" x2="${backX + w}" y2="${backY}" stroke="#77c9ff" stroke-width="1.2" />`,
    `<line x1="${fx}" y1="${fy + h}" x2="${backX}" y2="${backY + h}" stroke="#77c9ff" stroke-width="1.2" />`,
    `<line x1="${fx + w}" y1="${fy + h}" x2="${backX + w}" y2="${backY + h}" stroke="#77c9ff" stroke-width="1.2" />`
  ];

  const labelX = fx + w + 16;
  const labelY = fy + h / 2;

  lines.push(`<text x="${fx + w / 2}" y="${fy + h + 23}" text-anchor="middle" fill="#bcd6ff" font-size="12">W: ${formatInches(externalDimensions.width)}</text>`);
  lines.push(`<text x="${labelX}" y="${labelY}" fill="#bcd6ff" font-size="12">H: ${formatInches(externalDimensions.height)}</text>`);
  lines.push(`<text x="${backX + w + 10}" y="${backY - 8}" fill="#7ae3ff" font-size="12">D: ${formatInches(externalDimensions.depth)}</text>`);
  lines.push(`<text x="24" y="236" fill="#8fb2f8" font-size="11">Internal: ${formatDimensions(internalDimensions)}</text>`);

  svg.innerHTML = lines.join('');
}

function renderUI() {
  const internalDimensions = getInternalDimensions(state);
  const externalDimensions = getExternalDimensions(state);

  const internalVolume = getVolume(internalDimensions);
  const netAfter = getNetVolume(internalVolume.ft3, state.driverDisplacement);
  const warnings = validateBox(state, internalDimensions);

  outputs.internalDimensions.textContent = formatDimensions(internalDimensions);
  outputs.externalDimensions.textContent = formatDimensions(externalDimensions);
  outputs.grossVolume.textContent = `${internalVolume.in3.toFixed(2)} in³ | ${internalVolume.ft3.toFixed(3)} ft³`;
  outputs.netBefore.textContent = `${internalVolume.ft3.toFixed(3)} ft³`;
  outputs.netAfter.textContent = `${netAfter.toFixed(3)} ft³`;

  renderWarnings(warnings);
  renderSVG(externalDimensions, internalDimensions);
}

function syncStateFromInputs(changedKey) {
  state.width = safeNumber(inputs.width.value);
  state.height = safeNumber(inputs.height.value);
  state.depth = safeNumber(inputs.depth.value);
  state.woodThickness = safeNumber(inputs.woodThickness.value);
  state.driverSize = Number.parseInt(inputs.driverSize.value, 10);
  state.driverCutout = safeNumber(inputs.driverCutout.value);
  state.mountingDepth = safeNumber(inputs.mountingDepth.value);
  state.driverDisplacement = safeNumber(inputs.driverDisplacement.value);

  const modeInput = document.querySelector('input[name="dimensionMode"]:checked');
  if (modeInput) {
    state.dimensionMode = modeInput.value;
  }

  if (changedKey === 'driverSize') {
    const defaults = DRIVER_DEFAULTS[state.driverSize];
    if (defaults) {
      state.driverCutout = defaults.cutout;
      state.mountingDepth = defaults.depth;
      state.driverDisplacement = defaults.displacement;

      inputs.driverCutout.value = defaults.cutout;
      inputs.mountingDepth.value = defaults.depth;
      inputs.driverDisplacement.value = defaults.displacement;
    }
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
}

bindEvents();
renderUI();
