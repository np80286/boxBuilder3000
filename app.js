const BUILD_ID = 'dev-2026-06-17-01';
const STORAGE_KEY = 'boxBuilderState.v2';
const PARTS_SPEC_STORAGE_KEY = 'boxBuilderPartsSpec.v1';
const PARSED_STORAGE_KEY = 'boxBuilderParsedPreview.v1';

const DEFAULT_PARTS_SPEC = `Sealed Volume\t2.1ft³
Sealed F3\t42Hz
Vented Volume\t6ft³
Vented F3\t23Hz`;

const state = {
  cabinetStyle: 'rectangular',
  dimensionMode: 'external',
  width: 30,
  height: 15,
  depth: 14,
  topDepth: 12,
  bottomDepth: 16,
  woodThickness: 0.75,
  driverSize: 15,
  driverCutout: 11.1,
  driverDepth: 6.5,
  mountingDepth: 6.5,
  driverDisplacement: 0.08,
  driverSensitivity: 88,
  voiceCoilDiameter: 2.0,
  enclosureType: 'sealed',
  driverCount: 1,
  bracingDisplacement: 0,
  portType: 'slot',
  slotPortWidth: 12,
  slotPortHeight: 1.5,
  slotPortLength: 18,
  slotPortCount: 1,
  slotPortChannelCount: 1,
  slotPortChannelGap: 0.75,
  slotPortFoldAxis: 'auto',
  slotPortFoldDirection: 'auto',
  slotPortLeadRunOffset: 0,
  slotPortRunProfile: [],
  roundPortDiameter: 4,
  roundPortLength: 12,
  roundPortQuantity: 1,
  portMountFace: 'front',
  portLayout: 'horizontal',
  portSpacing: 0,
  portExtensionMode: 'internal',
  portOffsetX: 0,
  portOffsetY: 0,
  portOffsetZ: 0,
  threeShellOpacity: 0.24,
  threePortOpacity: 0.82,
  threePortWallThickness: 0.25,
  threeDepthDirection: 'front_to_back',
  threeBoxAnchor: 'front',
  threeSubFacing: 'rear',
  threeCutaway: true,
  threeLockZoom: false,
  threeLockView: false,
  threeEditMode: false,
  threeDriverLayout: 'auto',
  designerMode: true,
  designerSnapIncrement: 0.25,
  designerSelectedSegment: '',
  tuningFrequency: 40,
  targetNetVolume: 1.25,
  autoPortMode: 'full',
  autoPortAreaPerFt3: 16,
  autoPortMinRoundDiameter: 4,
  autoPortSlotAspectRatio: 8,
  autoPortMinSlotHeight: 1.5,
  autoPortMinLength: 0.5,
  portTuningSpeedOfSound: 13503.9,
  portTuningInsideEndCorrection: 0.85,
  portTuningOutsideEndCorrection: 0.85,
  portTuningLengthAdjustment: 0,
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
  cabinetStyle: document.getElementById('cabinetStyle'),
  width: document.getElementById('width'),
  height: document.getElementById('height'),
  depth: document.getElementById('depth'),
  topDepth: document.getElementById('topDepth'),
  bottomDepth: document.getElementById('bottomDepth'),
  woodThickness: document.getElementById('woodThickness'),
  driverSize: document.getElementById('driverSize'),
  driverCutout: document.getElementById('driverCutout'),
  driverDepth: document.getElementById('driverDepth'),
  mountingDepth: document.getElementById('mountingDepth'),
  driverDisplacement: document.getElementById('driverDisplacement'),
  driverSensitivity: document.getElementById('driverSensitivity'),
  voiceCoilDiameter: document.getElementById('voiceCoilDiameter'),
  enclosureType: document.getElementById('enclosureType'),
  driverCount: document.getElementById('driverCount'),
  bracingDisplacement: document.getElementById('bracingDisplacement'),
  portType: document.getElementById('portType'),
  slotPortWidth: document.getElementById('slotPortWidth'),
  slotPortHeight: document.getElementById('slotPortHeight'),
  slotPortLength: document.getElementById('slotPortLength'),
  slotPortCount: document.getElementById('slotPortCount'),
  slotPortChannelCount: document.getElementById('slotPortChannelCount'),
  slotPortChannelGap: document.getElementById('slotPortChannelGap'),
  slotPortFoldAxis: document.getElementById('slotPortFoldAxis'),
  slotPortFoldDirection: document.getElementById('slotPortFoldDirection'),
  slotPortLeadRunOffset: document.getElementById('slotPortLeadRunOffset'),
  roundPortDiameter: document.getElementById('roundPortDiameter'),
  roundPortLength: document.getElementById('roundPortLength'),
  roundPortQuantity: document.getElementById('roundPortQuantity'),
  portMountFace: document.getElementById('portMountFace'),
  portLayout: document.getElementById('portLayout'),
  portSpacing: document.getElementById('portSpacing'),
  portExtensionMode: document.getElementById('portExtensionMode'),
  portOffsetX: document.getElementById('portOffsetX'),
  portOffsetY: document.getElementById('portOffsetY'),
  portOffsetZ: document.getElementById('portOffsetZ'),
  threeShellOpacity: document.getElementById('threeShellOpacity'),
  threePortOpacity: document.getElementById('threePortOpacity'),
  threePortWallThickness: document.getElementById('threePortWallThickness'),
  threeDepthDirection: document.getElementById('threeDepthDirection'),
  threeBoxAnchor: document.getElementById('threeBoxAnchor'),
  threeSubFacing: document.getElementById('threeSubFacing'),
  threeCutaway: document.getElementById('threeCutaway'),
  threeLockZoom: document.getElementById('threeLockZoom'),
  threeLockView: document.getElementById('threeLockView'),
  threeEditMode: document.getElementById('threeEditMode'),
  threeDriverLayout: document.getElementById('threeDriverLayout'),
  tuningFrequency: document.getElementById('tuningFrequency'),
  autoPortMode: document.getElementById('autoPortMode'),
  autoPortAreaPerFt3: document.getElementById('autoPortAreaPerFt3'),
  autoPortMinRoundDiameter: document.getElementById('autoPortMinRoundDiameter'),
  autoPortSlotAspectRatio: document.getElementById('autoPortSlotAspectRatio'),
  autoPortMinSlotHeight: document.getElementById('autoPortMinSlotHeight'),
  autoPortMinLength: document.getElementById('autoPortMinLength'),
  portTuningSpeedOfSound: document.getElementById('portTuningSpeedOfSound'),
  portTuningInsideEndCorrection: document.getElementById('portTuningInsideEndCorrection'),
  portTuningOutsideEndCorrection: document.getElementById('portTuningOutsideEndCorrection'),
  portTuningLengthAdjustment: document.getElementById('portTuningLengthAdjustment'),
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
  quickDepth: document.getElementById('quickDepth'),
  designerMode: document.getElementById('designerMode'),
  designerSnapIncrement: document.getElementById('designerSnapIncrement')
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
  quickVolume: document.getElementById('quickVolume'),
  autoPortSummary: document.getElementById('autoPortSummary'),
  threeInteractionHint: document.getElementById('threeInteractionHint'),
  threeDebug: document.getElementById('threeDebug'),
  designerFrontView: document.getElementById('designerFrontView'),
  designerSideView: document.getElementById('designerSideView'),
  designerTopView: document.getElementById('designerTopView')
};

let threeCtx = null;
let threeLoadStarted = false;
let diagramInteraction = {
  drag: null,
  context: null,
  snapState: null,
  activeSource: 'isometric'
};
let threeEditStatus = '';
let threeDebugState = {
  event: 'idle',
  editMode: false,
  action: '-',
  pointer: '-',
  delta: '-',
  dimensions: '-'
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

function setThreeDebug(update = {}) {
  threeDebugState = {
    ...threeDebugState,
    ...update,
    editMode: !!state.threeEditMode,
    dimensions: `W ${state.width.toFixed(2)} • H ${state.height.toFixed(2)} • D ${state.depth.toFixed(2)}`
  };
  renderThreeDebug();
}

function renderThreeDebug() {
  if (!outputs.threeDebug) return;
  outputs.threeDebug.textContent = [
    `3D debug: event=${threeDebugState.event}`,
    `edit=${threeDebugState.editMode ? 'on' : 'off'}`,
    `action=${threeDebugState.action}`,
    `pointer=${threeDebugState.pointer}`,
    `delta=${threeDebugState.delta}`,
    threeDebugState.dimensions
  ].join(' | ');
}

function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function snapToIncrement(value, increment) {
  const step = Math.max(0.0001, safeNumber(increment));
  return Math.round(value / step) * step;
}

function clamp01(value) {
  return clampValue(value, 0, 1);
}

function lerpNumber(a, b, t) {
  return a + (b - a) * t;
}

function lerpPoint(a, b, t) {
  return {
    x: lerpNumber(a.x, b.x, t),
    y: lerpNumber(a.y, b.y, t)
  };
}

function distanceBetweenPoints(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function getPortFaceAxes(face) {
  switch (face) {
    case 'rear':
      return { normal: 'z', normalSign: -1, tangentA: 'x', tangentB: 'y' };
    case 'left':
      return { normal: 'x', normalSign: -1, tangentA: 'z', tangentB: 'y' };
    case 'right':
      return { normal: 'x', normalSign: 1, tangentA: 'z', tangentB: 'y' };
    case 'top':
      return { normal: 'y', normalSign: 1, tangentA: 'x', tangentB: 'z' };
    case 'bottom':
      return { normal: 'y', normalSign: -1, tangentA: 'x', tangentB: 'z' };
    case 'front':
    default:
      return { normal: 'z', normalSign: 1, tangentA: 'x', tangentB: 'y' };
  }
}

function createAxisVector(axis, sign) {
  if (axis === 'x') return { x: sign, y: 0, z: 0 };
  if (axis === 'y') return { x: 0, y: sign, z: 0 };
  return { x: 0, y: 0, z: sign };
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

function getOccupiedEnvelope(currentState, externalDimensions) {
  const dims = {
    width: Math.max(0.01, safeNumber(externalDimensions.width)),
    height: Math.max(0.01, safeNumber(externalDimensions.height)),
    depth: Math.max(0.01, safeNumber(externalDimensions.depth))
  };
  if (currentState.enclosureType !== 'ported') return dims;

  const portLength = currentState.portType === 'round'
    ? safeNumber(currentState.roundPortLength)
    : safeNumber(currentState.slotPortLength);
  const lengths = getPortLengthDistribution(currentState, portLength);
  const protrusion = Math.max(0, lengths.externalLength);
  const face = ['front', 'rear', 'left', 'right', 'top', 'bottom'].includes(currentState.portMountFace)
    ? currentState.portMountFace
    : 'front';
  if (face === 'left' || face === 'right') dims.width += protrusion;
  if (face === 'top' || face === 'bottom') dims.height += protrusion;
  if (face === 'front' || face === 'rear') dims.depth += protrusion;
  return dims;
}

function getPortPreviewData(externalDimensions, currentState = state) {
  if (currentState.enclosureType !== 'ported') return null;

  const dims = {
    x: Math.max(0.01, safeNumber(externalDimensions.width)),
    y: Math.max(0.01, safeNumber(externalDimensions.height)),
    z: Math.max(0.01, safeNumber(externalDimensions.depth))
  };
  const half = {
    x: dims.x / 2,
    y: dims.y / 2,
    z: dims.z / 2
  };

  const face = ['front', 'rear', 'left', 'right', 'top', 'bottom'].includes(currentState.portMountFace)
    ? currentState.portMountFace
    : 'front';
  const layout = currentState.portLayout === 'vertical' ? 'vertical' : 'horizontal';
  const axes = getPortFaceAxes(face);
  const tangentA = axes.tangentA;
  const tangentB = axes.tangentB;
  const normal = axes.normal;
  const normalSign = axes.normalSign;
  const qty = currentState.portType === 'round'
    ? Math.max(1, Math.round(safeNumber(currentState.roundPortQuantity)))
    : Math.max(1, Math.round(safeNumber(currentState.slotPortCount)));

  const openingA = currentState.portType === 'round'
    ? Math.max(0.01, safeNumber(currentState.roundPortDiameter))
    : Math.max(0.01, safeNumber(currentState.slotPortWidth));
  const openingB = currentState.portType === 'round'
    ? Math.max(0.01, safeNumber(currentState.roundPortDiameter))
    : Math.max(0.01, safeNumber(currentState.slotPortHeight));
  const length = currentState.portType === 'round'
    ? Math.max(0.01, safeNumber(currentState.roundPortLength))
    : Math.max(0.01, safeNumber(currentState.slotPortLength));
  const spacing = Math.max(0, safeNumber(currentState.portSpacing));
  const lengthDistribution = getPortLengthDistribution(currentState, length);

  const primaryAxis = layout === 'vertical' ? tangentB : tangentA;
  const secondaryAxis = layout === 'vertical' ? tangentA : tangentB;
  const primarySize = primaryAxis === tangentA ? openingA : openingB;
  const secondarySize = secondaryAxis === tangentA ? openingA : openingB;
  const primaryBaseOffset = safeNumber(currentState[`portOffset${primaryAxis.toUpperCase()}`]);
  const secondaryBaseOffset = safeNumber(currentState[`portOffset${secondaryAxis.toUpperCase()}`]);
  const normalHalf = half[normal];
  const primaryHalf = half[primaryAxis];
  const secondaryHalf = half[secondaryAxis];
  const normalCenter = normalSign * (
    normalHalf + ((lengthDistribution.externalLength - lengthDistribution.internalLength) * 0.5)
  );
  const primaryStep = primarySize + spacing;

  const instances = [];
  const warnings = [];

  for (let i = 0; i < qty; i += 1) {
    const primaryShift = qty === 1 ? 0 : (i - (qty - 1) / 2) * primaryStep;
    const requestedPrimary = primaryBaseOffset + primaryShift;
    const requestedSecondary = secondaryBaseOffset;
    const maxPrimary = Math.max(0, primaryHalf - primarySize / 2);
    const maxSecondary = Math.max(0, secondaryHalf - secondarySize / 2);
    const centerPrimary = clampValue(requestedPrimary, -maxPrimary, maxPrimary);
    const centerSecondary = clampValue(requestedSecondary, -maxSecondary, maxSecondary);
    const center = { x: 0, y: 0, z: 0 };
    center[normal] = normalCenter;
    center[primaryAxis] = centerPrimary;
    center[secondaryAxis] = centerSecondary;
    instances.push({
      center,
      openingA,
      openingB,
      length,
      internalLength: lengthDistribution.internalLength,
      externalLength: lengthDistribution.externalLength,
      tangentA,
      tangentB,
      normal,
      normalSign,
      face,
      index: i
    });
    if (Math.abs(centerPrimary - requestedPrimary) > 0.001 || Math.abs(centerSecondary - requestedSecondary) > 0.001) {
      warnings.push(`Port ${i + 1} was clamped to stay on the ${face} face.`);
    }
  }

  const faceWidth = dims[tangentA];
  const faceHeight = dims[tangentB];
  return {
    type: currentState.portType,
    face,
    layout,
    qty,
    length,
    internalLength: lengthDistribution.internalLength,
    externalLength: lengthDistribution.externalLength,
    extensionMode: lengthDistribution.mode,
    openingA,
    openingB,
    faceWidth,
    faceHeight,
    tangentA,
    tangentB,
    normal,
    normalSign,
    instances,
    warnings
  };
}

function getPortSurfaceCenter(instance) {
  const axisVector = createAxisVector(instance.normal, instance.normalSign);
  return {
    x: instance.center.x + axisVector.x * ((instance.length * 0.5) - instance.externalLength),
    y: instance.center.y + axisVector.y * ((instance.length * 0.5) - instance.externalLength),
    z: instance.center.z + axisVector.z * ((instance.length * 0.5) - instance.externalLength)
  };
}

function createBoxSegment(axis, length, crossAxisA, crossSizeA, crossAxisB, crossSizeB, center, meta = {}) {
  const size = { x: 0.01, y: 0.01, z: 0.01 };
  size[axis] = Math.max(0.01, length);
  size[crossAxisA] = Math.max(0.01, crossSizeA);
  size[crossAxisB] = Math.max(0.01, crossSizeB);
  return {
    axis,
    center,
    size,
    ...meta
  };
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
  const firstRun = clampValue(baseRun + leadOffset, minRunLength, maxLead);
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

function createSegmentKey(instanceIndex, segment) {
  return `port-${instanceIndex}-${segment.kind}-${segment.channelIndex ?? 'main'}-${segment.axis}`;
}

function resolveSlotFoldAxis(instance, currentState) {
  const preferred = currentState.slotPortFoldAxis;
  if ([instance.tangentA, instance.tangentB].includes(preferred)) return preferred;
  if (preferred === 'width' && [instance.tangentA, instance.tangentB].includes('x')) return 'x';
  if (preferred === 'height' && [instance.tangentA, instance.tangentB].includes('y')) return 'y';
  if (preferred === 'depth' && [instance.tangentA, instance.tangentB].includes('z')) return 'z';
  return instance.tangentA;
}

function resolveSlotFoldDirection(instance, foldAxis, half, currentState) {
  if (currentState.slotPortFoldDirection === 'positive') return 1;
  if (currentState.slotPortFoldDirection === 'negative') return -1;
  const openingHalf = foldAxis === instance.tangentA ? (instance.openingA * 0.5) : (instance.openingB * 0.5);
  const center = instance.center[foldAxis];
  const positiveRoom = (half[foldAxis] - openingHalf) - center;
  const negativeRoom = center + (half[foldAxis] - openingHalf);
  return positiveRoom >= negativeRoom ? 1 : -1;
}

function getPortRouteData(externalDimensions, currentState = state) {
  const portPreview = getPortPreviewData(externalDimensions, currentState);
  if (!portPreview) return null;

  const half = {
    x: Math.max(0.01, safeNumber(externalDimensions.width)) * 0.5,
    y: Math.max(0.01, safeNumber(externalDimensions.height)) * 0.5,
    z: Math.max(0.01, safeNumber(externalDimensions.depth)) * 0.5
  };
  const warnings = [...portPreview.warnings];
  const instances = portPreview.instances.map((instance) => {
    const axisVector = createAxisVector(instance.normal, instance.normalSign);
    const surfaceCenter = getPortSurfaceCenter(instance);
    const innerEndCenter = {
      x: surfaceCenter.x - axisVector.x * instance.internalLength,
      y: surfaceCenter.y - axisVector.y * instance.internalLength,
      z: surfaceCenter.z - axisVector.z * instance.internalLength
    };
    const outerEndCenter = {
      x: surfaceCenter.x + axisVector.x * instance.externalLength,
      y: surfaceCenter.y + axisVector.y * instance.externalLength,
      z: surfaceCenter.z + axisVector.z * instance.externalLength
    };
    const segments = [];

    if (portPreview.type === 'round') {
      if (instance.internalLength > 0.001) {
        segments.push(createBoxSegment(
          instance.normal,
          instance.internalLength,
          instance.tangentA,
          instance.openingA,
          instance.tangentB,
          instance.openingB,
          {
            x: surfaceCenter.x - axisVector.x * (instance.internalLength * 0.5),
            y: surfaceCenter.y - axisVector.y * (instance.internalLength * 0.5),
            z: surfaceCenter.z - axisVector.z * (instance.internalLength * 0.5)
          },
          { kind: 'internal-run', shape: 'round' }
        ));
      }
      if (instance.externalLength > 0.001) {
        segments.push(createBoxSegment(
          instance.normal,
          instance.externalLength,
          instance.tangentA,
          instance.openingA,
          instance.tangentB,
          instance.openingB,
          {
            x: surfaceCenter.x + axisVector.x * (instance.externalLength * 0.5),
            y: surfaceCenter.y + axisVector.y * (instance.externalLength * 0.5),
            z: surfaceCenter.z + axisVector.z * (instance.externalLength * 0.5)
          },
          { kind: 'external-run', shape: 'round' }
        ));
      }
    } else {
      const requestedChannels = Math.max(1, Math.round(safeNumber(currentState.slotPortChannelCount)));
      const gap = Math.max(0, safeNumber(currentState.slotPortChannelGap));
      const foldAxis = resolveSlotFoldAxis(instance, currentState);
      const otherAxis = foldAxis === instance.tangentA ? instance.tangentB : instance.tangentA;
      const foldThickness = foldAxis === instance.tangentA ? instance.openingA : instance.openingB;
      const otherThickness = otherAxis === instance.tangentA ? instance.openingA : instance.openingB;
      const step = foldThickness + gap;
      const minRunLength = Math.max(0.01, safeNumber(currentState.designerSnapIncrement) || 0.25);
      let effectiveChannels = requestedChannels;
      while (
        effectiveChannels > 1 &&
        (instance.internalLength - ((effectiveChannels - 1) * step)) < (effectiveChannels * minRunLength)
      ) {
        effectiveChannels -= 1;
      }
      if (effectiveChannels < requestedChannels) {
        warnings.push(`Slot channel count reduced from ${requestedChannels} to ${effectiveChannels} to fit the requested port length.`);
      }
      const directionSign = resolveSlotFoldDirection(instance, foldAxis, half, currentState);
      const totalRunLength = Math.max(0.01, instance.internalLength - ((effectiveChannels - 1) * step));
      const runLengths = normalizeSlotRunProfile(
        currentState.slotPortRunProfile,
        effectiveChannels,
        totalRunLength,
        minRunLength,
        safeNumber(currentState.slotPortLeadRunOffset)
      );
      const inwardVector = { x: -axisVector.x, y: -axisVector.y, z: -axisVector.z };

      for (let channelIndex = 0; channelIndex < effectiveChannels; channelIndex += 1) {
        const laneOffset = channelIndex * step * directionSign;
        const laneCenter = {
          x: surfaceCenter.x,
          y: surfaceCenter.y,
          z: surfaceCenter.z
        };
        laneCenter[foldAxis] += laneOffset;
        const laneLimit = half[foldAxis] - (foldThickness * 0.5);
        if (Math.abs(laneCenter[foldAxis]) > laneLimit + 0.001) {
          warnings.push(`Folded slot channel ${channelIndex + 1} extends beyond the ${foldAxis.toUpperCase()} boundary of the box.`);
        }
        const runLength = runLengths[channelIndex];
        const directionMultiplier = channelIndex % 2 === 0 ? 1 : -1;
        const runDirection = {
          x: inwardVector.x * directionMultiplier,
          y: inwardVector.y * directionMultiplier,
          z: inwardVector.z * directionMultiplier
        };
        const runStart = channelIndex === 0
          ? laneCenter
          : {
            x: segments[segments.length - 1].center.x,
            y: segments[segments.length - 1].center.y,
            z: segments[segments.length - 1].center.z
          };
        if (channelIndex > 0) {
          runStart[foldAxis] = laneCenter[foldAxis];
        }
        const runCenter = {
          x: runStart.x + (runDirection.x * (runLength * 0.5)),
          y: runStart.y + (runDirection.y * (runLength * 0.5)),
          z: runStart.z + (runDirection.z * (runLength * 0.5))
        };
        const runEnd = {
          x: runStart.x + (runDirection.x * runLength),
          y: runStart.y + (runDirection.y * runLength),
          z: runStart.z + (runDirection.z * runLength)
        };
        if (runLength > 0.001) {
          segments.push(createBoxSegment(
            instance.normal,
            runLength,
            instance.tangentA,
            instance.openingA,
            instance.tangentB,
            instance.openingB,
            runCenter,
            { kind: 'internal-run', shape: 'slot', channelIndex, runLength, runStart, runEnd, segmentKey: createSegmentKey(instance.index, { kind: 'internal-run', channelIndex, axis: instance.normal }) }
          ));
        }
        if (channelIndex < effectiveChannels - 1) {
          const nextLaneOffset = (channelIndex + 0.5) * step * directionSign;
          const connectorCenter = { ...runEnd };
          connectorCenter[foldAxis] = surfaceCenter[foldAxis] + nextLaneOffset;
          segments.push(createBoxSegment(
            foldAxis,
            step,
            instance.normal,
            foldThickness,
            otherAxis,
            otherThickness,
            connectorCenter,
            { kind: 'fold-connector', shape: 'slot', channelIndex, runEnd, segmentKey: createSegmentKey(instance.index, { kind: 'fold-connector', channelIndex, axis: foldAxis }) }
          ));
        }
      }

      if (instance.externalLength > 0.001) {
        segments.push(createBoxSegment(
          instance.normal,
          instance.externalLength,
          instance.tangentA,
          instance.openingA,
          instance.tangentB,
          instance.openingB,
          {
            x: surfaceCenter.x + axisVector.x * (instance.externalLength * 0.5),
            y: surfaceCenter.y + axisVector.y * (instance.externalLength * 0.5),
            z: surfaceCenter.z + axisVector.z * (instance.externalLength * 0.5)
          },
          { kind: 'external-run', shape: 'slot', segmentKey: createSegmentKey(instance.index, { kind: 'external-run', channelIndex: 0, axis: instance.normal }) }
        ));
      }
    }

    return {
      ...instance,
      surfaceCenter,
      innerEndCenter,
      outerEndCenter,
      segments,
      runLengths: segments.filter((segment) => segment.kind === 'internal-run').map((segment) => segment.runLength || segment.size[instance.normal])
    };
  });

  return {
    ...portPreview,
    instances,
    warnings
  };
}

function axisValueToFaceNormalized(axis, value, span) {
  if (axis === 'y') return clamp01((span * 0.5 - value) / Math.max(0.01, span));
  return clamp01((value + span * 0.5) / Math.max(0.01, span));
}

function projectFacePoint(quad, u, v) {
  const top = lerpPoint(quad[0], quad[1], clamp01(u));
  const bottom = lerpPoint(quad[3], quad[2], clamp01(u));
  return lerpPoint(top, bottom, clamp01(v));
}

function getFaceBasis(quad, width, height) {
  const safeWidth = Math.max(0.01, width);
  const safeHeight = Math.max(0.01, height);
  return {
    scaleU: distanceBetweenPoints(quad[0], quad[1]) / safeWidth,
    scaleV: distanceBetweenPoints(quad[0], quad[3]) / safeHeight,
    angleDeg: Math.atan2(quad[1].y - quad[0].y, quad[1].x - quad[0].x) * (180 / Math.PI)
  };
}

function normalize2DVector(vector) {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return {
    x: vector.x / length,
    y: vector.y / length
  };
}

function createHandleBadge(x, y, label, dragAction, fill, stroke, radius = 11, extraAttrs = '') {
  return [
    `<circle class="diagram-handle" data-drag-action="${dragAction}" cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="2" ${extraAttrs}></circle>`,
    `<text x="${x}" y="${y + 4}" text-anchor="middle" fill="#06111e" font-size="9" font-weight="700" pointer-events="none">${label}</text>`
  ].join('');
}

function createHandleLabel(x, y, text, color, anchor = 'start') {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="10" font-weight="700" pointer-events="none">${text}</text>`;
}

function getProjectedAxisVectors(pxPerInX, pxPerInY, depthDx, depthDy, safeDepth) {
  return {
    x: { x: pxPerInX, y: 0 },
    y: { x: 0, y: -pxPerInY },
    z: {
      x: depthDx / Math.max(0.01, safeDepth),
      y: -depthDy / Math.max(0.01, safeDepth)
    }
  };
}

function applySnapCandidates(value, candidates, threshold) {
  let best = { value, snapped: false, label: '', guide: null, delta: Number.POSITIVE_INFINITY };
  for (const candidate of candidates) {
    if (!candidate || !Number.isFinite(candidate.value)) continue;
    const delta = Math.abs(value - candidate.value);
    if (delta <= threshold && delta < best.delta) {
      best = {
        value: candidate.value,
        snapped: true,
        label: candidate.label || '',
        guide: candidate.guide || null,
        delta
      };
    }
  }
  return best;
}

function getPortInteriorVector(face, axisVectors) {
  switch (face) {
    case 'rear':
      return { x: -axisVectors.z.x, y: -axisVectors.z.y };
    case 'left':
      return axisVectors.x;
    case 'right':
      return { x: -axisVectors.x.x, y: -axisVectors.x.y };
    case 'top':
      return { x: -axisVectors.y.x, y: -axisVectors.y.y };
    case 'bottom':
      return axisVectors.y;
    case 'front':
    default:
      return axisVectors.z;
  }
}

function getPortLengthHandleVector(portPreview, axisVectors) {
  const interiorVector = getPortInteriorVector(portPreview.face, axisVectors);
  if (portPreview.externalLength > portPreview.internalLength) {
    return {
      x: -interiorVector.x,
      y: -interiorVector.y
    };
  }
  return interiorVector;
}

function getPortFaceMoveAxes(portPreview) {
  return [portPreview.tangentA, portPreview.tangentB];
}

function axisToFoldSetting(axis) {
  if (axis === 'x') return 'width';
  if (axis === 'y') return 'height';
  return 'depth';
}

function getOrthographicLengthContext(view, portPreview, plot, scale) {
  if (!portPreview) return null;
  const normalAxis = portPreview.normal;
  if (![view.axisX, view.axisY].includes(normalAxis)) return null;
  const orientationSign = (portPreview.externalLength > portPreview.internalLength) ? 1 : -1;
  if (view.axisX === normalAxis) {
    return {
      axis: normalAxis,
      pxVector: { x: scale * orientationSign, y: 0 },
      inchesPerPx: 1 / Math.max(0.01, scale)
    };
  }
  return {
    axis: normalAxis,
    pxVector: { x: 0, y: -scale * orientationSign },
    inchesPerPx: 1 / Math.max(0.01, scale)
  };
}

function getDesignerStatusText() {
  if (!state.designerMode) return '';
  if (diagramInteraction.snapState && diagramInteraction.snapState.label) {
    return `Designer Mode: snapped to ${diagramInteraction.snapState.label}`;
  }
  const dragAction = diagramInteraction.drag && diagramInteraction.drag.action;
  if (dragAction === 'width') return `Designer Mode: width ${state.width.toFixed(2)} in`;
  if (dragAction === 'height') return `Designer Mode: height ${state.height.toFixed(2)} in`;
  if (dragAction === 'depth') return `Designer Mode: depth ${state.depth.toFixed(2)} in`;
  if (dragAction === 'port-position') {
    return `Designer Mode: port offsets X ${state.portOffsetX.toFixed(2)} in • Y ${state.portOffsetY.toFixed(2)} in • Z ${state.portOffsetZ.toFixed(2)} in`;
  }
  if (dragAction === 'port-length') {
    const length = state.portType === 'round' ? state.roundPortLength : state.slotPortLength;
    return `Designer Mode: port length ${length.toFixed(2)} in`;
  }
  if (dragAction === 'slot-fold-node') {
    return `Designer Mode: slot channel gap ${state.slotPortChannelGap.toFixed(2)} in • fold ${state.slotPortFoldDirection}`;
  }
  if (dragAction === 'slot-lead-run') {
    return `Designer Mode: slot lead run offset ${state.slotPortLeadRunOffset.toFixed(2)} in`;
  }
  if (dragAction === 'slot-run-length') {
    return 'Designer Mode: adjusting selected folded run length';
  }
  return 'Designer Mode: drag cyan handles for W/H/D. Green moves port center. Yellow changes port size. Orange changes port length.';
}

function formatDimensions(dim) {
  if (state.cabinetStyle === 'wedge' && Number.isFinite(dim.topDepth) && Number.isFinite(dim.bottomDepth)) {
    return `W: ${dim.width.toFixed(2)} × H: ${dim.height.toFixed(2)} × Td: ${dim.topDepth.toFixed(2)} × Bd: ${dim.bottomDepth.toFixed(2)} in`;
  }
  return `${dim.width.toFixed(2)} × ${dim.height.toFixed(2)} × ${dim.depth.toFixed(2)} in`;
}

function formatDimensionsLabeled(dim) {
  if (state.cabinetStyle === 'wedge' && Number.isFinite(dim.topDepth) && Number.isFinite(dim.bottomDepth)) {
    return `W: ${dim.width.toFixed(2)} in | H: ${dim.height.toFixed(2)} in | Top D: ${dim.topDepth.toFixed(2)} in | Bottom D: ${dim.bottomDepth.toFixed(2)} in`;
  }
  return `W: ${dim.width.toFixed(2)} in | H: ${dim.height.toFixed(2)} in | D: ${dim.depth.toFixed(2)} in`;
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
  const deduction = currentState.dimensionMode === 'internal' ? 0 : currentState.woodThickness * 2;
  const depths = getDepthPair(currentState, 'internal');
  return {
    width: currentState.width - deduction,
    height: currentState.height - deduction,
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

function getPortAreaPerInstanceSqIn(currentState) {
  if (currentState.portType === 'round') {
    const diameter = Math.max(0.01, safeNumber(currentState.roundPortDiameter));
    return Math.PI * (diameter / 2) * (diameter / 2);
  }
  return Math.max(0.01, safeNumber(currentState.slotPortWidth)) * Math.max(0.01, safeNumber(currentState.slotPortHeight));
}

function getPortQuantity(currentState) {
  return currentState.portType === 'round'
    ? Math.max(1, Math.round(safeNumber(currentState.roundPortQuantity)))
    : Math.max(1, Math.round(safeNumber(currentState.slotPortCount)));
}

function getPortEquivalentRadius(currentState) {
  if (currentState.portType === 'round') {
    return Math.max(0.01, safeNumber(currentState.roundPortDiameter) / 2);
  }
  const area = getPortAreaPerInstanceSqIn(currentState);
  return Math.sqrt(area / Math.PI);
}

function calculatePortPhysicalLength(currentState) {
  if (currentState.enclosureType !== 'ported') return 0;

  const tuningHz = Math.max(0, safeNumber(currentState.tuningFrequency));
  const targetNetVolumeFt3 = Math.max(0, safeNumber(currentState.targetNetVolume));
  const speedOfSound = Math.max(0.01, safeNumber(currentState.portTuningSpeedOfSound));
  const insideEndCorrection = Math.max(0, safeNumber(currentState.portTuningInsideEndCorrection));
  const outsideEndCorrection = Math.max(0, safeNumber(currentState.portTuningOutsideEndCorrection));
  const lengthAdjustment = safeNumber(currentState.portTuningLengthAdjustment);
  const minLength = Math.max(0.01, safeNumber(currentState.autoPortMinLength));

  if (!(tuningHz > 0 && targetNetVolumeFt3 > 0)) return minLength;

  const areaPerInstance = getPortAreaPerInstanceSqIn(currentState);
  const quantity = getPortQuantity(currentState);
  const totalAreaSqIn = Math.max(0.01, areaPerInstance * quantity);
  const volumeIn3 = targetNetVolumeFt3 * 1728;
  const angularTerm = (2 * Math.PI * tuningHz) / speedOfSound;

  if (!(volumeIn3 > 0 && angularTerm > 0)) return minLength;

  const effectiveLength = totalAreaSqIn / (volumeIn3 * angularTerm * angularTerm);
  const equivalentRadius = getPortEquivalentRadius(currentState);
  const endCorrection = (insideEndCorrection + outsideEndCorrection) * equivalentRadius;
  return Math.max(minLength, effectiveLength - endCorrection + lengthAdjustment);
}

function getAutoPortComputation(currentState) {
  const mode = ['manual', 'length', 'full'].includes(currentState.autoPortMode)
    ? currentState.autoPortMode
    : 'manual';
  if (currentState.enclosureType !== 'ported' || mode === 'manual') return null;

  const targetNetVolumeFt3 = Math.max(0, safeNumber(currentState.targetNetVolume));
  const tuningHz = Math.max(0, safeNumber(currentState.tuningFrequency));
  if (!(targetNetVolumeFt3 > 0 && tuningHz > 0)) return null;

  const quantity = getPortQuantity(currentState);
  const targetAreaSqIn = Math.max(0.01, safeNumber(currentState.autoPortAreaPerFt3) * targetNetVolumeFt3);
  const areaPerInstance = targetAreaSqIn / quantity;

  const result = {
    mode,
    targetAreaSqIn,
    quantity,
    lengthIn: 0
  };

  if (currentState.portType === 'round') {
    const minDiameter = Math.max(0.01, safeNumber(currentState.autoPortMinRoundDiameter));
    const autoDiameter = Math.max(minDiameter, Math.sqrt((4 * areaPerInstance) / Math.PI));
    result.roundPortDiameter = autoDiameter;
    result.areaPerInstanceSqIn = Math.PI * (autoDiameter / 2) * (autoDiameter / 2);
  } else {
    const aspectRatio = Math.max(0.01, safeNumber(currentState.autoPortSlotAspectRatio));
    const minHeight = Math.max(0.01, safeNumber(currentState.autoPortMinSlotHeight));
    const solvedHeight = Math.sqrt(areaPerInstance / aspectRatio);
    const slotHeight = Math.max(minHeight, solvedHeight);
    const slotWidth = areaPerInstance / slotHeight;
    result.slotPortHeight = slotHeight;
    result.slotPortWidth = slotWidth;
    result.areaPerInstanceSqIn = slotWidth * slotHeight;
  }

  const workingState = { ...currentState };
  if (mode === 'full') {
    if (currentState.portType === 'round') {
      workingState.roundPortDiameter = result.roundPortDiameter;
    } else {
      workingState.slotPortWidth = result.slotPortWidth;
      workingState.slotPortHeight = result.slotPortHeight;
    }
  }
  result.actualTotalAreaSqIn = getPortAreaPerInstanceSqIn(workingState) * quantity;
  result.lengthIn = calculatePortPhysicalLength(workingState);
  return result;
}

function applyAutoPortSizing(currentState) {
  const computed = getAutoPortComputation(currentState);
  if (!computed) return null;

  if (computed.mode === 'full') {
    if (currentState.portType === 'round' && Number.isFinite(computed.roundPortDiameter)) {
      currentState.roundPortDiameter = computed.roundPortDiameter;
    }
    if (currentState.portType === 'slot') {
      if (Number.isFinite(computed.slotPortWidth)) currentState.slotPortWidth = computed.slotPortWidth;
      if (Number.isFinite(computed.slotPortHeight)) currentState.slotPortHeight = computed.slotPortHeight;
    }
  }

  if (currentState.portType === 'round') {
    currentState.roundPortLength = computed.lengthIn;
  } else {
    currentState.slotPortLength = computed.lengthIn;
  }

  return computed;
}

function getPortDisplacementFt3(currentState) {
  if (currentState.enclosureType !== 'ported') return 0;
  const totalLength = currentState.portType === 'round'
    ? safeNumber(currentState.roundPortLength)
    : safeNumber(currentState.slotPortLength);
  const internalLength = getPortLengthDistribution(currentState, totalLength).internalLength;
  if (currentState.portType === 'round') {
    const r = safeNumber(currentState.roundPortDiameter) / 2;
    const qty = Math.max(1, Math.round(safeNumber(currentState.roundPortQuantity)));
    return ((Math.PI * r * r * internalLength) * qty) / 1728;
  }
  const w = safeNumber(currentState.slotPortWidth);
  const h = safeNumber(currentState.slotPortHeight);
  const qty = Math.max(1, Math.round(safeNumber(currentState.slotPortCount)));
  return (w * h * internalLength * qty) / 1728;
}

function getTotalDisplacementFt3(currentState) {
  const driver = safeNumber(currentState.driverDisplacement) * Math.max(1, Math.round(safeNumber(currentState.driverCount)));
  const bracing = Math.max(0, safeNumber(currentState.bracingDisplacement));
  const port = getPortDisplacementFt3(currentState);
  return driver + bracing + port;
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

  const minUsableDepth = Number.isFinite(internalDimensions.topDepth)
    ? Math.min(internalDimensions.topDepth, internalDimensions.bottomDepth)
    : internalDimensions.depth;

  if (currentState.mountingDepth > minUsableDepth) {
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
    currentState.woodThickness < 0
  ) {
    warnings.push('Please enter valid positive dimensions and non-negative wood thickness.');
  }
  if (isWedge(currentState)) {
    if (currentState.topDepth <= 0 || currentState.bottomDepth <= 0) {
      warnings.push('Top and bottom depth must be positive for wedge cabinets.');
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
      warnings.push(`Current occupied envelope exceeds trunk maximum dimensions (${occupiedEnvelope.width.toFixed(2)} × ${occupiedEnvelope.height.toFixed(2)} × ${occupiedEnvelope.depth.toFixed(2)} in).`);
    }
  }

  if (currentState.enclosureType === 'sealed' && currentState.tuningFrequency > 0) {
    warnings.push('ℹ️ Tuning frequency only applies to ported enclosures; sealed doesn\'t require port tuning.');
  }

  const driverCount = Math.max(1, Math.round(safeNumber(currentState.driverCount)));
  if (driverCount > 1) {
    const layout = currentState.threeDriverLayout || 'auto';
    const gap = 0.75;
    const run = layout === 'vertical'
      ? (driverCount * currentState.driverSize) + ((driverCount - 1) * gap)
      : (driverCount * currentState.driverSize) + ((driverCount - 1) * gap);
    if (layout === 'vertical' && run > currentState.height) {
      warnings.push('Driver stack may exceed baffle height; reduce driver count/size or switch layout.');
    }
    if ((layout === 'horizontal' || layout === 'auto') && run > currentState.width) {
      warnings.push('Driver row may exceed baffle width; reduce driver count/size or switch layout.');
    }
  }

  return warnings;
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
      occupiedEnvelope: getOccupiedEnvelope(currentState, externalDimensions),
      maxInternal: null,
      maxNet: null,
      overBy: null
    };
  }

  const occupiedEnvelope = getOccupiedEnvelope(currentState, externalDimensions);
  const overBy = {
    width: Math.max(0, occupiedEnvelope.width - currentState.maxBoxWidth),
    height: Math.max(0, occupiedEnvelope.height - currentState.maxBoxHeight),
    depth: Math.max(0, occupiedEnvelope.depth - currentState.maxBoxDepth)
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
      occupiedEnvelope,
      maxInternal,
      maxNet: null,
      overBy
    };
  }

  const maxGross = getVolume(maxInternal).ft3;
  return {
    enabled: true,
    fitsCurrent,
    occupiedEnvelope,
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

  // If constrained, keep the limiting dimension at max and solve the other two
  // to meet the target gross volume while preserving their ratio.
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
  const targetGross = currentState.targetNetVolume + getTotalDisplacementFt3(currentState);
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
  const topDepth = Number.isFinite(externalDimensions.topDepth) ? externalDimensions.topDepth : externalDimensions.depth;
  const bottomDepth = Number.isFinite(externalDimensions.bottomDepth) ? externalDimensions.bottomDepth : externalDimensions.depth;
  const panelDepth = externalDimensions.depth - woodThickness * 2;

  return [
    { part: 'Top', qty: 1, width: externalDimensions.width, height: topDepth },
    { part: 'Bottom', qty: 1, width: externalDimensions.width, height: bottomDepth },
    { part: 'Front', qty: 1, width: externalDimensions.width, height: panelHeight },
    { part: 'Back', qty: 1, width: externalDimensions.width, height: panelHeight },
    { part: state.cabinetStyle === 'wedge' ? 'Left Side (trapezoid blank)' : 'Left Side', qty: 1, width: panelDepth, height: panelHeight },
    { part: state.cabinetStyle === 'wedge' ? 'Right Side (trapezoid blank)' : 'Right Side', qty: 1, width: panelDepth, height: panelHeight }
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
  const lines = [];
  const safeW = Math.max(externalDimensions.width, 0.01);
  const safeH = Math.max(externalDimensions.height, 0.01);
  const topDepth = Number.isFinite(externalDimensions.topDepth) ? externalDimensions.topDepth : externalDimensions.depth;
  const bottomDepth = Number.isFinite(externalDimensions.bottomDepth) ? externalDimensions.bottomDepth : externalDimensions.depth;
  const safeDepth = Math.max(externalDimensions.depth, 0.01);
  const availableW = viewWidth - padding * 2 - 60;
  const availableH = viewHeight - padding * 2 - 58;
  const isLiveDiagramDrag = diagramInteraction.drag && diagramInteraction.activeSource === 'isometric';
  const dragStart = isLiveDiagramDrag ? diagramInteraction.drag.startState : null;
  const maxScaleWidth = safeNumber(state.maxBoxWidth) > 0 ? safeNumber(state.maxBoxWidth) : safeW;
  const maxScaleHeight = safeNumber(state.maxBoxHeight) > 0 ? safeNumber(state.maxBoxHeight) : safeH;
  const scaleBasisW = state.useMaxConstraints
    ? Math.max(0.01, maxScaleWidth)
    : Math.max(0.01, dragStart ? safeNumber(dragStart.width) : safeW);
  const scaleBasisH = state.useMaxConstraints
    ? Math.max(0.01, maxScaleHeight)
    : Math.max(0.01, dragStart ? safeNumber(dragStart.height) : safeH);
  const scale = Math.min(availableW / scaleBasisW, availableH / scaleBasisH);
  const w = safeW * scale;
  const h = safeH * scale;
  const fx = padding + (availableW - w) * 0.46;
  const fy = padding + 24;

  const depthScale = Math.min(70 / Math.max(safeDepth, 0.01), 0.95);
  const dx = safeDepth * depthScale;
  const dy = Math.max(16, dx * 0.45);
  const frontTL = { x: fx, y: fy };
  const frontTR = { x: fx + w, y: fy };
  const frontBR = { x: fx + w, y: fy + h };
  const frontBL = { x: fx, y: fy + h };
  let backTL;
  let backTR;
  let backBR;
  let backBL;

  // Front face
  lines.push(`<rect x="${fx}" y="${fy}" width="${w}" height="${h}" rx="4" fill="rgba(24,52,112,0.50)" stroke="#58d4ff" stroke-width="2" />`);

  if (state.cabinetStyle === 'wedge') {
    const maxDepth = Math.max(topDepth, bottomDepth, 0.01);
    const td = dx * (topDepth / maxDepth);
    const bd = dx * (bottomDepth / maxDepth);
    backTL = { x: fx + td, y: fy - dy };
    backTR = { x: fx + w + td, y: fy - dy };
    backBL = { x: fx + bd, y: fy + h - dy };
    backBR = { x: fx + w + bd, y: fy + h - dy };

    lines.push(`<polygon points="${backTL.x},${backTL.y} ${backTR.x},${backTR.y} ${backBR.x},${backBR.y} ${backBL.x},${backBL.y}" fill="rgba(20,39,82,0.46)" stroke="#4f8bff" stroke-width="1.2" />`);
    lines.push(`<polygon points="${frontTL.x},${frontTL.y} ${frontTR.x},${frontTR.y} ${backTR.x},${backTR.y} ${backTL.x},${backTL.y}" fill="rgba(16,30,62,0.45)" stroke="#77c9ff" stroke-width="1.1" />`);
    lines.push(`<polygon points="${frontTR.x},${frontTR.y} ${frontBR.x},${frontBR.y} ${backBR.x},${backBR.y} ${backTR.x},${backTR.y}" fill="rgba(14,27,56,0.48)" stroke="#77c9ff" stroke-width="1.1" />`);
    lines.push(`<line x1="${frontBL.x}" y1="${frontBL.y}" x2="${backBL.x}" y2="${backBL.y}" stroke="#77c9ff" stroke-width="1.1" />`);
  } else {
    const backX = fx + dx;
    const backY = fy - dy;
    backTL = { x: backX, y: backY };
    backTR = { x: backX + w, y: backY };
    backBR = { x: backX + w, y: backY + h };
    backBL = { x: backX, y: backY + h };
    lines.push(`<rect x="${backX}" y="${backY}" width="${w}" height="${h}" rx="4" fill="rgba(14,31,65,0.34)" stroke="#4f8bff" stroke-width="1.4" />`);
    lines.push(`<line x1="${fx}" y1="${fy}" x2="${backX}" y2="${backY}" stroke="#77c9ff" stroke-width="1.2" />`);
    lines.push(`<line x1="${fx + w}" y1="${fy}" x2="${backX + w}" y2="${backY}" stroke="#77c9ff" stroke-width="1.2" />`);
    lines.push(`<line x1="${fx}" y1="${fy + h}" x2="${backX}" y2="${backY + h}" stroke="#77c9ff" stroke-width="1.2" />`);
    lines.push(`<line x1="${fx + w}" y1="${fy + h}" x2="${backX + w}" y2="${backY + h}" stroke="#77c9ff" stroke-width="1.2" />`);
  }

  const pxPerInX = w / Math.max(0.01, externalDimensions.width);
  const pxPerInY = h / Math.max(0.01, externalDimensions.height);
  const axisVectors = getProjectedAxisVectors(pxPerInX, pxPerInY, dx, dy, safeDepth);
  const cutoutDiameterPx = state.driverCutout * scale;
  const circleR = Math.max(2, cutoutDiameterPx / 2);
  lines.push(`<circle cx="${fx + w / 2}" cy="${fy + h / 2}" r="${circleR}" fill="none" stroke="#9be3ff" stroke-width="1.6" stroke-dasharray="4 3" pointer-events="none" />`);

  // Optional outer driver ring uses nominal driver size so users can see basket-vs-cutout relationship.
  const driverOuterR = Math.max(circleR + 1.5, (state.driverSize * scale) / 2);
  lines.push(`<circle cx="${fx + w / 2}" cy="${fy + h / 2}" r="${driverOuterR}" fill="none" stroke="rgba(159,230,255,0.35)" stroke-width="1.2" pointer-events="none" />`);
  lines.push(`<text x="${fx + w - 4}" y="${fy + 14}" text-anchor="end" fill="#a8daff" font-size="9" pointer-events="none">Driver ${state.driverSize.toFixed(1)} in • Cutout ${state.driverCutout.toFixed(2)} in</text>`);
  const portPreview = getPortRouteData(externalDimensions);
  const faceQuads = {
    front: [frontTL, frontTR, frontBR, frontBL],
    rear: [backTL, backTR, backBR, backBL],
    right: [frontTR, backTR, backBR, frontBR],
    left: [frontTL, backTL, backBL, frontBL],
    top: [frontTL, frontTR, backTR, backTL],
    bottom: [frontBL, frontBR, backBR, backBL]
  };
  const handleLines = [];
  const snapGuideLines = [];
  let firstPortHandle = null;
  if (portPreview && faceQuads[portPreview.face]) {
    const faceQuad = faceQuads[portPreview.face];
    const faceBasis = getFaceBasis(faceQuad, portPreview.faceWidth, portPreview.faceHeight);
    const edgeUDirection = normalize2DVector({ x: faceQuad[1].x - faceQuad[0].x, y: faceQuad[1].y - faceQuad[0].y });
    const edgeVDirection = normalize2DVector({ x: faceQuad[3].x - faceQuad[0].x, y: faceQuad[3].y - faceQuad[0].y });
    const interiorVector = getPortInteriorVector(portPreview.face, axisVectors);
    const handleVector = getPortLengthHandleVector(portPreview, axisVectors);
    const visiblePortHandles = [];
    portPreview.instances.forEach((instance) => {
      const centerU = axisValueToFaceNormalized(portPreview.tangentA, instance.center[portPreview.tangentA], portPreview.faceWidth);
      const centerV = axisValueToFaceNormalized(portPreview.tangentB, instance.center[portPreview.tangentB], portPreview.faceHeight);
      const centerPoint = projectFacePoint(faceQuad, centerU, centerV);
      if (portPreview.type === 'round') {
        const rx = Math.max(2, (instance.openingA * faceBasis.scaleU) / 2);
        const ry = Math.max(2, (instance.openingB * faceBasis.scaleV) / 2);
        lines.push(`<ellipse cx="${centerPoint.x}" cy="${centerPoint.y}" rx="${rx}" ry="${ry}" transform="rotate(${faceBasis.angleDeg} ${centerPoint.x} ${centerPoint.y})" fill="rgba(87,240,209,0.22)" stroke="#57f0d1" stroke-width="1.6" />`);
      } else {
        const u0 = centerU - (instance.openingA * 0.5) / Math.max(0.01, portPreview.faceWidth);
        const u1 = centerU + (instance.openingA * 0.5) / Math.max(0.01, portPreview.faceWidth);
        const v0 = centerV - (instance.openingB * 0.5) / Math.max(0.01, portPreview.faceHeight);
        const v1 = centerV + (instance.openingB * 0.5) / Math.max(0.01, portPreview.faceHeight);
        const p0 = projectFacePoint(faceQuad, u0, v0);
        const p1 = projectFacePoint(faceQuad, u1, v0);
        const p2 = projectFacePoint(faceQuad, u1, v1);
        const p3 = projectFacePoint(faceQuad, u0, v1);
        lines.push(`<polygon points="${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}" fill="rgba(87,240,209,0.22)" stroke="#57f0d1" stroke-width="1.2" />`);
      }
      if (instance.index === 0) {
        visiblePortHandles.push(`<circle class="diagram-handle" data-drag-action="port-position" cx="${centerPoint.x}" cy="${centerPoint.y}" r="8" fill="#57f0d1" stroke="#e6fffb" stroke-width="2" />`);
        const lengthHandleX = centerPoint.x + (handleVector.x * instance.length);
        const lengthHandleY = centerPoint.y + (handleVector.y * instance.length);
        visiblePortHandles.push(`<line x1="${centerPoint.x}" y1="${centerPoint.y}" x2="${lengthHandleX}" y2="${lengthHandleY}" stroke="#ffb366" stroke-width="2" stroke-dasharray="4 3" />`);
        visiblePortHandles.push(`<circle class="diagram-handle" data-drag-action="port-length" cx="${lengthHandleX}" cy="${lengthHandleY}" r="7" fill="#ff9f4a" stroke="#fff2de" stroke-width="2" />`);
        if (portPreview.type === 'round') {
          // The port opening is fixed-size by design; only position and length stay draggable.
          const radiusPx = Math.max(6, (instance.openingA * faceBasis.scaleU) / 2);
          const diameterHandleX = centerPoint.x + (edgeUDirection.x * radiusPx);
          const diameterHandleY = centerPoint.y + (edgeUDirection.y * radiusPx);
          visiblePortHandles.push(`<line x1="${centerPoint.x}" y1="${centerPoint.y}" x2="${diameterHandleX}" y2="${diameterHandleY}" stroke="#ffd765" stroke-width="2" />`);
          visiblePortHandles.push(`<circle cx="${diameterHandleX}" cy="${diameterHandleY}" r="7" fill="#ffd765" stroke="#fff7db" stroke-width="2" pointer-events="none" opacity="0.95" />`);
        } else {
          const widthHandleX = centerPoint.x + (edgeUDirection.x * instance.openingA * faceBasis.scaleU * 0.5);
          const widthHandleY = centerPoint.y + (edgeUDirection.y * instance.openingA * faceBasis.scaleU * 0.5);
          const heightHandleX = centerPoint.x + (edgeVDirection.x * instance.openingB * faceBasis.scaleV * 0.5);
          const heightHandleY = centerPoint.y + (edgeVDirection.y * instance.openingB * faceBasis.scaleV * 0.5);
          visiblePortHandles.push(`<line x1="${centerPoint.x}" y1="${centerPoint.y}" x2="${widthHandleX}" y2="${widthHandleY}" stroke="#ffd765" stroke-width="2" />`);
          visiblePortHandles.push(`<circle cx="${widthHandleX}" cy="${widthHandleY}" r="7" fill="#ffd765" stroke="#fff7db" stroke-width="2" pointer-events="none" opacity="0.95" />`);
          visiblePortHandles.push(`<line x1="${centerPoint.x}" y1="${centerPoint.y}" x2="${heightHandleX}" y2="${heightHandleY}" stroke="#ff91de" stroke-width="2" />`);
          visiblePortHandles.push(`<circle cx="${heightHandleX}" cy="${heightHandleY}" r="7" fill="#ff91de" stroke="#fff0fb" stroke-width="2" pointer-events="none" opacity="0.95" />`);
        }
        firstPortHandle = {
          centerPoint,
          edgeUDirection,
          edgeVDirection,
          interiorVector: handleVector,
          faceBasis
        };
      }
    });
    handleLines.push(...visiblePortHandles);
  }

  // Dimension callouts (restored): width bottom, height right, depth on top isometric edge.
  const dimY = fy + h + 12;
  lines.push(`<line x1="${fx}" y1="${dimY}" x2="${fx + w}" y2="${dimY}" stroke="#9fc7ff" stroke-width="1" />`);
  lines.push(`<line x1="${fx}" y1="${dimY - 5}" x2="${fx}" y2="${dimY + 5}" stroke="#9fc7ff" stroke-width="1" />`);
  lines.push(`<line x1="${fx + w}" y1="${dimY - 5}" x2="${fx + w}" y2="${dimY + 5}" stroke="#9fc7ff" stroke-width="1" />`);
  lines.push(`<text x="${fx + w / 2}" y="${dimY - 6}" text-anchor="middle" fill="#bcd6ff" font-size="11">W ${externalDimensions.width.toFixed(2)} in</text>`);

  const dimX = fx + w + 10;
  lines.push(`<line x1="${dimX}" y1="${fy}" x2="${dimX}" y2="${fy + h}" stroke="#9fc7ff" stroke-width="1" />`);
  lines.push(`<line x1="${dimX - 5}" y1="${fy}" x2="${dimX + 5}" y2="${fy}" stroke="#9fc7ff" stroke-width="1" />`);
  lines.push(`<line x1="${dimX - 5}" y1="${fy + h}" x2="${dimX + 5}" y2="${fy + h}" stroke="#9fc7ff" stroke-width="1" />`);
  lines.push(`<text x="${dimX + 8}" y="${fy + h / 2}" fill="#bcd6ff" font-size="11">H ${externalDimensions.height.toFixed(2)} in</text>`);

  const depthLabel = state.cabinetStyle === 'wedge'
    ? `Top D ${topDepth.toFixed(2)} / Bottom D ${bottomDepth.toFixed(2)} in`
    : `D ${safeDepth.toFixed(2)} in`;
  lines.push(`<text x="${fx + 6}" y="${fy - 10}" fill="#9de4ff" font-size="11">${depthLabel}</text>`);

  lines.push(`<text x="${fx}" y="${fy + h + 20}" fill="#bcd6ff" font-size="12">W: ${formatInches(externalDimensions.width)} | H: ${formatInches(externalDimensions.height)}</text>`);
  lines.push(`<text x="${fx}" y="${fy + h + 36}" fill="#7ae3ff" font-size="12">${state.cabinetStyle === 'wedge' ? `Top D: ${formatInches(topDepth)} | Bottom D: ${formatInches(bottomDepth)}` : `D: ${formatInches(safeDepth)}`}</text>`);
  const internalVolume = getVolume(internalDimensions);
  const totalDisplacement = getTotalDisplacementFt3(state);
  const netAfter = getNetVolume(internalVolume.ft3, totalDisplacement);
  // Place spec text at the top-left so it doesn't overlap width label at the bottom.
  const specX = fx + 6;
  const specY1 = fy + 14;
  const specY2 = fy + 28;
  lines.push(`<text x="${specX}" y="${specY1}" fill="#8fb2f8" font-size="10">Internal: ${formatDimensions(internalDimensions)}</text>`);
  lines.push(`<text x="${specX}" y="${specY2}" fill="#bcd6ff" font-size="10">Gross: ${internalVolume.ft3.toFixed(3)} ft³ • Net: ${netAfter.toFixed(3)} ft³</text>`);
  if (portPreview) {
    const portSizeText = portPreview.type === 'round'
      ? `Dia ${portPreview.openingA.toFixed(2)} in`
      : `W ${portPreview.openingA.toFixed(2)} in • H ${portPreview.openingB.toFixed(2)} in`;
    const extensionText = portPreview.extensionMode === 'split'
      ? `In ${portPreview.internalLength.toFixed(2)} / Out ${portPreview.externalLength.toFixed(2)} in`
      : (portPreview.extensionMode === 'external'
        ? `Out ${portPreview.externalLength.toFixed(2)} in`
        : `In ${portPreview.internalLength.toFixed(2)} in`);
    lines.push(`<text x="${specX}" y="${specY2 + 14}" fill="#7ae3ff" font-size="10">Port: ${portPreview.face.toUpperCase()} • ${portSizeText} • L ${portPreview.length.toFixed(2)} in • ${extensionText} • Qty ${portPreview.qty}</text>`);
  }

  {
    if (diagramInteraction.snapState && Array.isArray(diagramInteraction.snapState.guides)) {
      diagramInteraction.snapState.guides.forEach((guide) => {
        if (!guide) return;
        if (guide.type === 'line') {
          snapGuideLines.push(`<line x1="${guide.x1}" y1="${guide.y1}" x2="${guide.x2}" y2="${guide.y2}" stroke="${guide.color || '#ffe27a'}" stroke-width="1.6" stroke-dasharray="5 4" />`);
        }
      });
    }
    handleLines.push(createHandleBadge(fx + (w * 0.5), fy + h - 18, 'W', 'width', '#30d5ff', '#e8efff', 12));
    handleLines.push(createHandleLabel(fx + (w * 0.5), fy + h + 40, 'BOX WIDTH drag left/right', '#7edfff', 'middle'));
    handleLines.push(createHandleBadge(fx + w - 18, fy + (h * 0.5), 'H', 'height', '#59b9ff', '#edf5ff', 12));
    handleLines.push(createHandleLabel(fx + w + 42, fy + (h * 0.5) + 4, 'BOX HEIGHT drag up/down', '#9fd2ff', 'start'));
    handleLines.push(createHandleBadge(backTL.x + 18, backTL.y + 18, 'D', 'depth', '#7cf5c8', '#effff8', 12));
    handleLines.push(createHandleBadge(backTR.x - 18, backTR.y + 18, 'D', 'depth', '#7cf5c8', '#effff8', 12));
    handleLines.push(createHandleLabel(backTR.x + 30, backTR.y - 10, 'BOX DEPTH drag diagonal', '#a5ffd8', 'start'));
    lines.push(`<text x="${fx + 6}" y="${fy + h - 8}" fill="#d8f9ff" font-size="10" pointer-events="none">Cabinet grips only resize the box. Driver cutout stays fixed.</text>`);
  }

  lines.push(...snapGuideLines);
  lines.push(...handleLines);

  svg.innerHTML = lines.join('');
  const isoContext = {
    kind: 'isometric',
    frontScaleX: pxPerInX,
    frontScaleY: pxPerInY,
    depthVector: { x: dx, y: -dy },
    safeDepth,
    axisVectors,
    portPreview,
    firstPortHandle,
    faceQuads,
    frontFrame: { fx, fy, w, h }
  };
  diagramInteraction.context = isoContext;
  svg.__dragContext = isoContext;
}

function renderOrthographicPortOverlay(lines, routeData, view, plot, scale) {
  if (!routeData) return;
  const axisX = view.axisX;
  const axisY = view.axisY;
  const viewNormal = view.normalAxis;
  const moveAxes = getPortFaceMoveAxes(routeData);
  const bodyDragAction = (segment) => {
    if (!segment || segment.kind !== 'external-run') return '';
    if (moveAxes.includes(axisX) && moveAxes.includes(axisY)) return 'port-position';
    if ([axisX, axisY].includes(routeData.normal)) return 'port-length';
    return '';
  };
  routeData.instances.forEach((instance) => {
    instance.segments.forEach((segment) => {
      const segWidth = segment.size[axisX] * scale;
      const segHeight = segment.size[axisY] * scale;
      const cx = plot.centerX + (segment.center[axisX] * scale);
      const cy = plot.centerY - (segment.center[axisY] * scale);
      const left = cx - (segWidth * 0.5);
      const top = cy - (segHeight * 0.5);
      const isRound = segment.shape === 'round';
      const isSelected = state.designerSelectedSegment === segment.segmentKey;
      const dragAction = bodyDragAction(segment);
      const dragAttrs = dragAction
        ? `class="diagram-handle" data-drag-action="${dragAction}" data-segment-key="${segment.segmentKey || ''}"`
        : `data-segment-key="${segment.segmentKey || ''}"`;
      const fill = isSelected
        ? 'rgba(255, 121, 170, 0.28)'
        : (segment.kind === 'external-run'
        ? 'rgba(116, 255, 225, 0.24)'
        : (segment.kind === 'fold-connector'
          ? 'rgba(255, 194, 109, 0.22)'
          : 'rgba(87, 240, 209, 0.24)'));
      const stroke = isSelected ? '#ff7fa8' : (segment.kind === 'fold-connector' ? '#ffbf66' : '#57f0d1');
      if (segment.axis === viewNormal && isRound) {
        lines.push(`<ellipse ${dragAttrs} cx="${cx}" cy="${cy}" rx="${Math.max(3, segWidth * 0.5)}" ry="${Math.max(3, segHeight * 0.5)}" fill="${fill}" stroke="${stroke}" stroke-width="${isSelected ? 2.2 : 1.5}" />`);
      } else {
        lines.push(`<rect ${dragAttrs} x="${left}" y="${top}" width="${Math.max(2, segWidth)}" height="${Math.max(2, segHeight)}" rx="${isRound ? 8 : 2}" fill="${fill}" stroke="${stroke}" stroke-width="${isSelected ? 2.1 : 1.4}" />`);
      }
    });
    if (instance.externalLength > 0.001) {
      const mouth = instance.outerEndCenter;
      const cx = plot.centerX + (mouth[axisX] * scale);
      const cy = plot.centerY - (mouth[axisY] * scale);
      lines.push(`<circle cx="${cx}" cy="${cy}" r="3.5" fill="#d7fff5" stroke="#57f0d1" stroke-width="1.2" />`);
    }
  });
}

function renderDesignerView(svg, view, externalDimensions, routeData) {
  if (!svg) return;
  const safeWidth = Math.max(0.01, view.spanX(externalDimensions));
  const safeHeight = Math.max(0.01, view.spanY(externalDimensions));
  const viewWidth = 420;
  const viewHeight = 240;
  const padding = 20;
  const plotWidth = viewWidth - (padding * 2);
  const plotHeight = viewHeight - (padding * 2) - 24;
  const maxByDimension = {
    width: safeNumber(state.maxBoxWidth) > 0 ? safeNumber(state.maxBoxWidth) : safeWidth,
    height: safeNumber(state.maxBoxHeight) > 0 ? safeNumber(state.maxBoxHeight) : safeHeight,
    depth: safeNumber(state.maxBoxDepth) > 0 ? safeNumber(state.maxBoxDepth) : safeWidth
  };
  const isThisViewDragging = diagramInteraction.drag && diagramInteraction.activeSource === view.name.toLowerCase();
  const dragStart = isThisViewDragging ? diagramInteraction.drag.startState : null;
  const scaleBasisX = state.useMaxConstraints
    ? Math.max(0.01, maxByDimension[view.dimensionX] || safeWidth)
    : Math.max(0.01, dragStart ? safeNumber(dragStart[view.dimensionX]) : safeWidth);
  const scaleBasisY = state.useMaxConstraints
    ? Math.max(0.01, maxByDimension[view.dimensionY] || safeHeight)
    : Math.max(0.01, dragStart ? safeNumber(dragStart[view.dimensionY]) : safeHeight);
  const scale = Math.min(plotWidth / scaleBasisX, plotHeight / scaleBasisY);
  const boxWidth = safeWidth * scale;
  const boxHeight = safeHeight * scale;
  const envelopeWidth = scaleBasisX * scale;
  const envelopeHeight = scaleBasisY * scale;
  const envelope = {
    left: padding + ((plotWidth - envelopeWidth) * 0.5),
    top: padding + 18 + ((plotHeight - envelopeHeight) * 0.5),
    width: envelopeWidth,
    height: envelopeHeight
  };
  envelope.centerX = envelope.left + (envelope.width * 0.5);
  envelope.centerY = envelope.top + (envelope.height * 0.5);
  const plot = {
    left: envelope.centerX - (boxWidth * 0.5),
    top: envelope.centerY - (boxHeight * 0.5),
    width: boxWidth,
    height: boxHeight
  };
  plot.centerX = plot.left + (plot.width * 0.5);
  plot.centerY = plot.top + (plot.height * 0.5);
  const lines = [];
  const handleLines = [];
  const dragContext = {
    kind: 'orthographic',
    viewName: view.name,
    view,
    scale,
    plot,
    foldHandles: {}
  };

  lines.push(`<rect x="1" y="1" width="${viewWidth - 2}" height="${viewHeight - 2}" rx="16" fill="rgba(5,11,22,0.18)" stroke="rgba(103,145,255,0.10)" />`);
  if (state.useMaxConstraints) {
    lines.push(`<rect x="${envelope.left}" y="${envelope.top}" width="${envelope.width}" height="${envelope.height}" rx="7" fill="rgba(116,255,225,0.04)" stroke="rgba(124,245,200,0.38)" stroke-width="1.4" stroke-dasharray="6 5" pointer-events="none" />`);
    lines.push(`<text x="${envelope.left + 6}" y="${envelope.top + 14}" fill="rgba(181,255,226,0.74)" font-size="9" pointer-events="none">MAX SPACE</text>`);
  }
  lines.push(`<rect x="${plot.left}" y="${plot.top}" width="${plot.width}" height="${plot.height}" rx="6" fill="rgba(23,46,89,0.42)" stroke="#6ad6ff" stroke-width="2" />`);

  const driverRadiusX = Math.max(3, (safeNumber(state.driverCutout) * 0.5) * scale);
  const driverRadiusY = Math.max(3, (safeNumber(state.driverCutout) * 0.5) * scale);
  const driverCenter = { x: plot.centerX, y: plot.centerY };
  if (view.name === 'Front') {
    lines.push(`<ellipse cx="${driverCenter.x}" cy="${driverCenter.y}" rx="${driverRadiusX}" ry="${driverRadiusY}" fill="none" stroke="#9be3ff" stroke-width="1.5" stroke-dasharray="4 3" pointer-events="none" />`);
  }

  renderOrthographicPortOverlay(lines, routeData, view, plot, scale);

  if (view.dimensionX === 'width') {
    handleLines.push(createHandleBadge(plot.centerX, plot.top + plot.height - 18, 'W', 'width', '#30d5ff', '#e8efff', 11));
    handleLines.push(createHandleLabel(plot.centerX, plot.top + plot.height + 36, 'BOX WIDTH left/right', '#7edfff', 'middle'));
  } else if (view.dimensionX === 'depth') {
    handleLines.push(createHandleBadge(plot.centerX, plot.top + plot.height - 18, 'D', 'depth', '#7cf5c8', '#effff8', 11));
    handleLines.push(createHandleLabel(plot.centerX, plot.top + plot.height + 36, 'BOX DEPTH', '#a5ffd8', 'middle'));
  }
  if (view.dimensionY === 'height') {
    handleLines.push(createHandleBadge(plot.left + plot.width - 18, plot.centerY, 'H', 'height', '#59b9ff', '#edf5ff', 11));
    handleLines.push(createHandleLabel(plot.left + plot.width + 34, plot.centerY + 4, 'BOX HEIGHT up/down', '#9fd2ff', 'start'));
  } else if (view.dimensionY === 'depth') {
    handleLines.push(createHandleBadge(plot.left + plot.width - 18, plot.centerY, 'D', 'depth', '#7cf5c8', '#effff8', 11));
    handleLines.push(createHandleLabel(plot.left + plot.width + 34, plot.centerY + 4, 'BOX DEPTH', '#a5ffd8', 'start'));
  }

  if (routeData && routeData.instances.length) {
    const instance = routeData.instances[0];
    const moveAxes = getPortFaceMoveAxes(routeData);
    const canMoveHere = moveAxes.includes(view.axisX) && moveAxes.includes(view.axisY);
    const portCenterX = plot.centerX + (instance.surfaceCenter[view.axisX] * scale);
    const portCenterY = plot.centerY - (instance.surfaceCenter[view.axisY] * scale);
    if (canMoveHere) {
      handleLines.push(`<circle class="diagram-handle" data-drag-action="port-position" cx="${portCenterX}" cy="${portCenterY}" r="8" fill="#57f0d1" stroke="#e6fffb" stroke-width="2" />`);
      dragContext.portMove = {
        axisA: view.axisX,
        axisB: view.axisY,
        spanA: view.spanX(externalDimensions),
        spanB: view.spanY(externalDimensions),
        centerX: plot.centerX,
        centerY: plot.centerY,
        openingA: (view.axisX === routeData.tangentA) ? routeData.openingA : routeData.openingB,
        openingB: (view.axisY === routeData.tangentB) ? routeData.openingB : routeData.openingA
      };
    }

    const lengthCtx = getOrthographicLengthContext(view, routeData, plot, scale);
    if (lengthCtx) {
      const lengthPx = routeData.length * scale;
      const lengthHandleX = portCenterX + (lengthCtx.pxVector.x * routeData.length);
      const lengthHandleY = portCenterY + (lengthCtx.pxVector.y * routeData.length);
      handleLines.push(`<line x1="${portCenterX}" y1="${portCenterY}" x2="${lengthHandleX}" y2="${lengthHandleY}" stroke="#ffb366" stroke-width="2" stroke-dasharray="4 3" />`);
      handleLines.push(`<circle class="diagram-handle" data-drag-action="port-length" cx="${lengthHandleX}" cy="${lengthHandleY}" r="7" fill="#ff9f4a" stroke="#fff2de" stroke-width="2" />`);
      dragContext.portLength = lengthCtx;
    }

    if (routeData.type === 'slot') {
      instance.segments
        .filter((segment) => segment.kind === 'fold-connector' && [view.axisX, view.axisY].includes(segment.axis))
        .forEach((segment) => {
          const handleKey = `fold-${segment.channelIndex}`;
          const hx = plot.centerX + (segment.center[view.axisX] * scale);
          const hy = plot.centerY - (segment.center[view.axisY] * scale);
          const foldAxis = segment.axis;
          const foldThickness = segment.size[foldAxis];
          const baseOffset = segment.center[foldAxis] - instance.surfaceCenter[foldAxis];
          dragContext.foldHandles[handleKey] = {
            channelIndex: segment.channelIndex,
            foldAxis,
            foldThickness,
            baseOffset,
            multiplier: (segment.channelIndex + 0.5)
          };
          handleLines.push(`<circle class="diagram-handle" data-drag-action="slot-fold-node" data-handle-key="${handleKey}" data-segment-key="${segment.segmentKey}" cx="${hx}" cy="${hy}" r="6.5" fill="#ffbf66" stroke="#fff3dc" stroke-width="2" />`);
        });

      const firstRun = instance.segments.find((segment) => segment.kind === 'internal-run' && segment.channelIndex === 0);
      if (firstRun && [view.axisX, view.axisY].includes(instance.normal)) {
        const turnX = plot.centerX + (firstRun.runEnd[view.axisX] * scale);
        const turnY = plot.centerY - (firstRun.runEnd[view.axisY] * scale);
        dragContext.leadRunHandle = {
          normalAxis: instance.normal
        };
        handleLines.push(`<circle class="diagram-handle" data-drag-action="slot-lead-run" data-segment-key="${firstRun.segmentKey}" cx="${turnX}" cy="${turnY}" r="6.5" fill="#ff7fa8" stroke="#fff1f6" stroke-width="2" />`);
      }

      instance.segments
        .filter((segment) => segment.kind === 'internal-run' && segment.channelIndex > 0 && [view.axisX, view.axisY].includes(instance.normal))
        .forEach((segment) => {
          const handleKey = `run-${segment.channelIndex}`;
          const hx = plot.centerX + (segment.runEnd[view.axisX] * scale);
          const hy = plot.centerY - (segment.runEnd[view.axisY] * scale);
          dragContext.runHandles = dragContext.runHandles || {};
          dragContext.runHandles[handleKey] = {
            channelIndex: segment.channelIndex,
            normalAxis: instance.normal,
            totalRunLength: instance.runLengths.reduce((acc, value) => acc + value, 0),
            runLengths: instance.runLengths.slice(),
            channelCount: instance.runLengths.length
          };
          handleLines.push(`<circle class="diagram-handle" data-drag-action="slot-run-length" data-handle-key="${handleKey}" data-segment-key="${segment.segmentKey}" cx="${hx}" cy="${hy}" r="6" fill="#b886ff" stroke="#f4ebff" stroke-width="2" />`);
        });
    }
  }

  lines.push(`<text x="${plot.left}" y="${plot.top - 6}" fill="#dbe7ff" font-size="11">${view.label(safeWidth, safeHeight)}</text>`);
  if (routeData) {
    const effectiveChannelCount = routeData.type === 'slot'
      ? Math.max(1, routeData.instances.reduce((maxCount, instance) => {
        const instanceMax = instance.segments.reduce((maxIndex, segment) => (
          Number.isInteger(segment.channelIndex) ? Math.max(maxIndex, segment.channelIndex + 1) : maxIndex
        ), 0);
        return Math.max(maxCount, instanceMax || 1);
      }, 1))
      : routeData.qty;
    const routeLabel = routeData.type === 'slot'
      ? `Slot route: ${effectiveChannelCount} channel${effectiveChannelCount === 1 ? '' : 's'}`
      : `Round route: ${routeData.qty} tube${routeData.qty === 1 ? '' : 's'}`;
    lines.push(`<text x="${plot.left}" y="${viewHeight - 16}" fill="#7ae3ff" font-size="11">${routeLabel}</text>`);
  }

  lines.push(...handleLines);
  svg.innerHTML = lines.join('');
  svg.__dragContext = dragContext;
}

function renderDesignerViews(externalDimensions, routeData) {
  renderDesignerView(outputs.designerFrontView, {
    name: 'Front',
    axisX: 'x',
    axisY: 'y',
    normalAxis: 'z',
    dimensionX: 'width',
    dimensionY: 'height',
    spanX: (dim) => dim.width,
    spanY: (dim) => dim.height,
    label: (w, h) => `W ${w.toFixed(2)} in • H ${h.toFixed(2)} in`
  }, externalDimensions, routeData);
  renderDesignerView(outputs.designerSideView, {
    name: 'Side',
    axisX: 'z',
    axisY: 'y',
    normalAxis: 'x',
    dimensionX: 'depth',
    dimensionY: 'height',
    spanX: (dim) => dim.depth,
    spanY: (dim) => dim.height,
    label: (d, h) => `D ${d.toFixed(2)} in • H ${h.toFixed(2)} in`
  }, externalDimensions, routeData);
  renderDesignerView(outputs.designerTopView, {
    name: 'Top',
    axisX: 'x',
    axisY: 'z',
    normalAxis: 'y',
    dimensionX: 'width',
    dimensionY: 'depth',
    spanX: (dim) => dim.width,
    spanY: (dim) => dim.depth,
    label: (w, d) => `W ${w.toFixed(2)} in • D ${d.toFixed(2)} in`
  }, externalDimensions, routeData);
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

function syncCabinetStyleUI() {
  const topField = document.getElementById('topDepthField');
  const bottomField = document.getElementById('bottomDepthField');
  const wedge = state.cabinetStyle === 'wedge';
  if (topField) topField.hidden = !wedge;
  if (bottomField) bottomField.hidden = !wedge;
  if (inputs.depth) {
    inputs.depth.disabled = wedge;
    if (!wedge) inputs.depth.value = safeNumber(state.depth).toFixed(2);
  }
}

function syncPortUI() {
  const ported = state.enclosureType === 'ported';
  const isRound = state.portType === 'round';
  const autoPortMode = ['manual', 'length', 'full'].includes(state.autoPortMode) ? state.autoPortMode : 'manual';
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

  const autoManagedLength = ported && autoPortMode !== 'manual';
  const autoManagedOpening = ported && autoPortMode === 'full';
  if (inputs.roundPortLength) inputs.roundPortLength.disabled = autoManagedLength;
  if (inputs.slotPortLength) inputs.slotPortLength.disabled = autoManagedLength;
  if (inputs.roundPortDiameter) inputs.roundPortDiameter.disabled = autoManagedOpening && isRound;
  if (inputs.slotPortWidth) inputs.slotPortWidth.disabled = autoManagedOpening && !isRound;
  if (inputs.slotPortHeight) inputs.slotPortHeight.disabled = autoManagedOpening && !isRound;
}

function syncThreeModeUI() {
  const canEdit = !!state.threeLockZoom && !!state.threeLockView;
  if (!canEdit) state.threeEditMode = false;
  if (inputs.threeEditMode) {
    inputs.threeEditMode.disabled = !canEdit;
    inputs.threeEditMode.checked = !!state.threeEditMode && canEdit;
    if (inputs.threeEditMode.parentElement) {
      inputs.threeEditMode.parentElement.classList.toggle('is-disabled', !canEdit);
    }
  }
  if (inputs.threeLockZoom) inputs.threeLockZoom.checked = !!state.threeLockZoom;
  if (inputs.threeLockView) inputs.threeLockView.checked = !!state.threeLockView;
}

function syncAutoPortManagedInputs() {
  const autoPortMode = ['manual', 'length', 'full'].includes(state.autoPortMode) ? state.autoPortMode : 'manual';
  if (state.enclosureType !== 'ported' || autoPortMode === 'manual') return;

  if (state.portType === 'round') {
    if (inputs.roundPortLength) inputs.roundPortLength.value = state.roundPortLength;
    if (autoPortMode === 'full' && inputs.roundPortDiameter) inputs.roundPortDiameter.value = state.roundPortDiameter;
  } else {
    if (inputs.slotPortLength) inputs.slotPortLength.value = state.slotPortLength;
    if (autoPortMode === 'full') {
      if (inputs.slotPortWidth) inputs.slotPortWidth.value = state.slotPortWidth;
      if (inputs.slotPortHeight) inputs.slotPortHeight.value = state.slotPortHeight;
    }
  }
}

function ensureThree() {
  const root = document.getElementById('threePreview');
  if (!window.THREE && !threeLoadStarted) {
    threeLoadStarted = true;
    if (root) root.textContent = '3D preview loading...';
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
    script.async = true;
    script.onload = () => renderUI();
    script.onerror = () => {
      if (root) root.textContent = '3D preview failed to load (library URL unavailable).';
    };
    document.head.appendChild(script);
    return null;
  }
  if (threeCtx) return threeCtx;
  if (!root || !window.THREE) return null;
  const scene = new window.THREE.Scene();
  scene.background = new window.THREE.Color(0x050b16);
  const camera = new window.THREE.PerspectiveCamera(55, root.clientWidth / Math.max(1, root.clientHeight), 0.1, 2000);
  camera.position.set(50, 40, 70);
  const renderer = new window.THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(root.clientWidth, root.clientHeight);
  renderer.domElement.style.touchAction = 'none';
  renderer.domElement.style.cursor = 'grab';
  root.innerHTML = '';
  root.appendChild(renderer.domElement);
  root.style.touchAction = 'none';
  const ambient = new window.THREE.AmbientLight(0xffffff, 0.6);
  const key = new window.THREE.DirectionalLight(0x8bd8ff, 1.1);
  key.position.set(50, 60, 40);
  const fill = new window.THREE.DirectionalLight(0x6ba7ff, 0.55);
  fill.position.set(-40, 22, -28);
  const rim = new window.THREE.DirectionalLight(0x9fffe7, 0.35);
  rim.position.set(0, 35, -55);
  scene.add(ambient, key, fill, rim);
  const controls = null;
  const group = new window.THREE.Group();
  scene.add(group);
  const floor = new window.THREE.Mesh(
    new window.THREE.PlaneGeometry(800, 800),
    new window.THREE.MeshStandardMaterial({ color: 0x071224, roughness: 0.95, metalness: 0.0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -18;
  scene.add(floor);

  const grid = new window.THREE.GridHelper(300, 30, 0x1f5376, 0x173a57);
  grid.position.y = -17.9;
  grid.material.transparent = true;
  grid.material.opacity = 0.25;
  scene.add(grid);
  const state3d = {
    yaw: -0.55,
    pitch: 0.35,
    distance: 95,
    dragging: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    target: new window.THREE.Vector3(0, 0, 0)
  };
  threeCtx = {
    root,
    scene,
    camera,
    renderer,
    controls,
    group,
    state3d,
    updateCamera: null,
    raycaster: new window.THREE.Raycaster(),
    pointerNdc: new window.THREE.Vector2()
  };

  const updateCamera = () => {
    if (!threeCtx) return;
    const s = threeCtx.state3d;
    const cp = Math.cos(s.pitch);
    const sp = Math.sin(s.pitch);
    const cy = Math.cos(s.yaw);
    const sy = Math.sin(s.yaw);
    const x = s.target.x + s.distance * cp * cy;
    const y = s.target.y + s.distance * sp;
    const z = s.target.z + s.distance * cp * sy;
    threeCtx.camera.position.set(x, y, z);
    threeCtx.camera.lookAt(s.target);
  };
  threeCtx.updateCamera = updateCamera;

  const getThreeEditHit = (eventLike) => {
    const handleHit = getThreeRaycastHit(eventLike, (data) => typeof data.dragAction === 'string' && data.dragAction.startsWith('three-'));
    return handleHit || getThreeNearestEditTarget(eventLike, 240) || getThreeFallbackBoxEditTarget(eventLike);
  };

  const beginThreeEditDrag = (eventLike, hit) => {
    if (!hit) {
      threeEditStatus = '3D edit status: no editable target under pointer.';
      setThreeDebug({
        event: 'miss',
        action: '-',
        pointer: `${Math.round(eventLike.clientX)},${Math.round(eventLike.clientY)}`,
        delta: '0,0'
      });
      syncThreeInteractionHint(getPortRouteData(getExternalDimensions(state)));
      return false;
    }
    const data = hit.userData || {};
    const dragContext = { kind: 'three', handleData: data };
    if (data.dragAction === 'three-port-length') {
      dragContext.portLength = {
        pxVector: getThreeProjectedWorldVector(threeCtx, data.worldCenter, data.axisVector)
      };
    } else if (data.dragAction === 'three-width' || data.dragAction === 'three-height' || data.dragAction === 'three-depth') {
      dragContext.boxResize = {
        pxVector: getThreeProjectedWorldVector(threeCtx, data.worldCenter, data.axisVector)
      };
    } else if (data.dragAction === 'three-port-position') {
      dragContext.portMove = {
        axisA: data.tangentA,
        axisB: data.tangentB,
        spanA: data.spanA,
        spanB: data.spanB,
        openingA: data.openingA,
        openingB: data.openingB,
        pxVectorA: getThreeProjectedWorldVector(threeCtx, data.worldCenter, data.axisVectorA),
        pxVectorB: getThreeProjectedWorldVector(threeCtx, data.worldCenter, data.axisVectorB)
      };
    } else if (data.dragAction === 'three-slot-run-length') {
      dragContext.slotRunHandle = {
        channelIndex: data.channelIndex,
        totalRunLength: data.totalRunLength,
        runLengths: Array.isArray(data.runLengths) ? data.runLengths.slice() : [],
        channelCount: data.channelCount,
        pxVector: getThreeProjectedWorldVector(threeCtx, data.worldCenter, data.axisVector)
      };
    } else if (data.dragAction === 'three-slot-fold-node') {
      dragContext.slotFoldHandle = {
        channelIndex: data.channelIndex,
        foldAxis: data.foldAxis,
        foldThickness: data.foldThickness,
        baseOffset: data.baseOffset,
        multiplier: data.multiplier,
        pxVector: getThreeProjectedWorldVector(threeCtx, data.worldCenter, data.axisVector)
      };
    } else {
      return false;
    }
    diagramInteraction.context = dragContext;
    diagramInteraction.activeSource = 'three';
    if (data.segmentKey) state.designerSelectedSegment = data.segmentKey;
    beginDiagramDrag(data.dragAction, eventLike, {});
    threeEditStatus = `3D edit status: dragging ${formatThreeDragAction(data.dragAction)}.`;
    setThreeDebug({
      event: 'drag-start',
      action: data.dragAction,
      pointer: `${Math.round(eventLike.clientX)},${Math.round(eventLike.clientY)}`,
      delta: '0,0'
    });
    syncThreeInteractionHint(getPortRouteData(getExternalDimensions(state)));
    return true;
  };

  root.addEventListener('pointerdown', (e) => {
    if (!threeCtx || e.button > 0) return;
    syncStateFromInputs();
    setThreeDebug({
      event: 'pointerdown',
      action: '-',
      pointer: `${Math.round(e.clientX)},${Math.round(e.clientY)}`,
      delta: '0,0'
    });
    if (state.threeEditMode) {
      const editHit = getThreeEditHit(e);
      if (beginThreeEditDrag(e, editHit)) {
        e.preventDefault();
        if (root.setPointerCapture && typeof e.pointerId === 'number') {
          try {
            root.setPointerCapture(e.pointerId);
          } catch (_) {
            // Ignore capture failures; global move handlers still cover mouse fallback.
          }
        }
        threeCtx.state3d.pointerId = e.pointerId;
        return;
      }
    }
    if (state.threeEditMode || state.threeLockView) {
      e.preventDefault();
      return;
    }
    threeCtx.state3d.dragging = true;
    threeCtx.state3d.pointerId = e.pointerId;
    threeCtx.state3d.lastX = e.clientX;
    threeCtx.state3d.lastY = e.clientY;
    if (root.setPointerCapture && typeof e.pointerId === 'number') {
      try {
        root.setPointerCapture(e.pointerId);
      } catch (_) {
        // Non-critical.
      }
    }
  });
  root.addEventListener('pointermove', (e) => {
    if (!threeCtx) return;
    if (diagramInteraction.drag && diagramInteraction.activeSource === 'three') {
      e.preventDefault();
      updateDiagramDrag(e);
      return;
    }
    if (!threeCtx.state3d.dragging) return;
    const s = threeCtx.state3d;
    const dx = e.clientX - s.lastX;
    const dy = e.clientY - s.lastY;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.yaw += dx * 0.01;
    s.pitch += dy * 0.01;
    s.pitch = Math.max(-1.2, Math.min(1.2, s.pitch));
    updateCamera();
  });
  root.addEventListener('pointerup', (e) => {
    if (!threeCtx) return;
    if (diagramInteraction.drag && diagramInteraction.activeSource === 'three') {
      e.preventDefault();
      endDiagramDrag();
    }
    threeCtx.state3d.dragging = false;
    threeCtx.state3d.pointerId = null;
    setThreeDebug({
      event: 'pointerup',
      pointer: `${Math.round(e.clientX)},${Math.round(e.clientY)}`
    });
    if (root.releasePointerCapture && typeof e.pointerId === 'number') {
      try {
        root.releasePointerCapture(e.pointerId);
      } catch (_) {
        // Non-critical.
      }
    }
  });
  root.addEventListener('pointercancel', () => {
    if (!threeCtx) return;
    if (diagramInteraction.drag && diagramInteraction.activeSource === 'three') endDiagramDrag();
    threeCtx.state3d.dragging = false;
    threeCtx.state3d.pointerId = null;
    setThreeDebug({ event: 'pointercancel' });
  });

  root.addEventListener('mousedown', (e) => {
    if (!threeCtx) return;
    if (window.PointerEvent) return;
    const handleHit = state.threeEditMode
      ? getThreeRaycastHit(e, (data) => typeof data.dragAction === 'string' && data.dragAction.startsWith('three-'))
      : null;
    const editHit = handleHit || (state.threeEditMode ? getThreeNearestEditTarget(e, 240) || getThreeFallbackBoxEditTarget(e) : null);
    if (state.threeEditMode && beginThreeEditDrag(e, editHit)) {
      e.preventDefault();
      return;
    }
    if (state.threeEditMode || state.threeLockView) {
      e.preventDefault();
      return;
    }
    threeCtx.state3d.dragging = true;
    threeCtx.state3d.lastX = e.clientX;
    threeCtx.state3d.lastY = e.clientY;
  });
  root.addEventListener('touchstart', (e) => {
    if (!threeCtx) return;
    if (window.PointerEvent) return;
    const t = e.touches && e.touches[0];
    if (!t) return;
    const handleHit = state.threeEditMode
      ? getThreeRaycastHit({ clientX: t.clientX, clientY: t.clientY }, (data) => typeof data.dragAction === 'string' && data.dragAction.startsWith('three-'))
      : null;
    const touchEvent = { clientX: t.clientX, clientY: t.clientY };
    const editHit = handleHit || (state.threeEditMode ? getThreeNearestEditTarget(touchEvent, 240) || getThreeFallbackBoxEditTarget(touchEvent) : null);
    if (state.threeEditMode && beginThreeEditDrag(touchEvent, editHit)) {
      e.preventDefault();
      return;
    }
    if (state.threeEditMode || state.threeLockView) {
      e.preventDefault();
      return;
    }
    threeCtx.state3d.dragging = true;
    threeCtx.state3d.lastX = t.clientX;
    threeCtx.state3d.lastY = t.clientY;
  }, { passive: false });
  window.addEventListener('mouseup', () => {
    if (!threeCtx) return;
    threeCtx.state3d.dragging = false;
  });
  window.addEventListener('mousemove', (e) => {
    if (!threeCtx || !threeCtx.state3d.dragging) return;
    const s = threeCtx.state3d;
    const dx = e.clientX - s.lastX;
    const dy = e.clientY - s.lastY;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    s.yaw += dx * 0.01;
    s.pitch += dy * 0.01;
    s.pitch = Math.max(-1.2, Math.min(1.2, s.pitch));
    updateCamera();
  });
  window.addEventListener('touchend', () => {
    if (!threeCtx) return;
    threeCtx.state3d.dragging = false;
  });
  window.addEventListener('touchmove', (e) => {
    if (!threeCtx || !threeCtx.state3d.dragging) return;
    const t = e.touches && e.touches[0];
    if (!t) return;
    const s = threeCtx.state3d;
    const dx = t.clientX - s.lastX;
    const dy = t.clientY - s.lastY;
    s.lastX = t.clientX;
    s.lastY = t.clientY;
    s.yaw += dx * 0.01;
    s.pitch += dy * 0.01;
    s.pitch = Math.max(-1.2, Math.min(1.2, s.pitch));
    updateCamera();
  }, { passive: false });
  root.addEventListener('wheel', (e) => {
    if (!threeCtx) return;
    e.preventDefault();
    if (state.threeLockZoom) return;
    const s = threeCtx.state3d;
    s.distance *= e.deltaY > 0 ? 1.08 : 0.92;
    s.distance = Math.max(20, Math.min(420, s.distance));
    updateCamera();
  }, { passive: false });

  window.addEventListener('resize', () => {
    if (!threeCtx || !threeCtx.root) return;
    const w = Math.max(1, threeCtx.root.clientWidth);
    const h = Math.max(1, threeCtx.root.clientHeight);
    threeCtx.camera.aspect = w / h;
    threeCtx.camera.updateProjectionMatrix();
    threeCtx.renderer.setSize(w, h);
  });
  const tick = () => {
    if (!threeCtx) return;
    if (threeCtx.controls) threeCtx.controls.update();
    threeCtx.renderer.render(threeCtx.scene, threeCtx.camera);
    requestAnimationFrame(tick);
  };
  updateCamera();
  requestAnimationFrame(tick);
  return threeCtx;
}

function getThreeSegmentSelectionFromEvent(event) {
  const ctx = ensureThree();
  if (!ctx || !ctx.renderer || !ctx.camera || !ctx.raycaster || !ctx.pointerNdc) return '';

  const rect = ctx.renderer.domElement.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  const pointerX = ((event.clientX - rect.left) / width) * 2 - 1;
  const pointerY = -(((event.clientY - rect.top) / height) * 2 - 1);
  ctx.pointerNdc.set(pointerX, pointerY);
  ctx.raycaster.setFromCamera(ctx.pointerNdc, ctx.camera);

  const intersections = ctx.raycaster.intersectObjects(ctx.group.children, true);
  for (let i = 0; i < intersections.length; i += 1) {
    let object = intersections[i].object;
    while (object) {
      if (object.userData && typeof object.userData.segmentKey === 'string' && object.userData.segmentKey) {
        return object.userData.segmentKey;
      }
      object = object.parent || null;
    }
  }
  return '';
}

function bindThreeSelection() {
  const ctx = ensureThree();
  if (!ctx || !ctx.root || ctx.root.__selectionBound) return;
  ctx.root.__selectionBound = true;
  ctx.root.addEventListener('click', (event) => {
    const segmentKey = getThreeSegmentSelectionFromEvent(event);
    if (!segmentKey) return;
    state.designerSelectedSegment = segmentKey;
    if (state.portType === 'slot' && (segmentKey.includes('internal-run') || segmentKey.includes('fold-connector'))) {
      state.threeCutaway = true;
      if (inputs.threeCutaway) inputs.threeCutaway.checked = true;
    }
    persistState();
    renderUI();
  });
}

function getThreeProjectedWorldVector(ctx, origin, axisVector) {
  if (!ctx || !ctx.camera || !ctx.renderer || !window.THREE) return { x: 1, y: 0 };
  const safeAxis = {
    x: safeNumber(axisVector && axisVector.x),
    y: safeNumber(axisVector && axisVector.y),
    z: safeNumber(axisVector && axisVector.z)
  };
  const axisLength = Math.hypot(safeAxis.x, safeAxis.y, safeAxis.z) || 1;
  const normalizedAxis = {
    x: safeAxis.x / axisLength,
    y: safeAxis.y / axisLength,
    z: safeAxis.z / axisLength
  };
  const cameraDistance = Math.max(1, ctx.camera.position.distanceTo(new window.THREE.Vector3(origin.x, origin.y, origin.z)));
  const sampleDistance = Math.max(0.5, cameraDistance * 0.06);
  const start = new window.THREE.Vector3(origin.x, origin.y, origin.z).project(ctx.camera);
  const end = new window.THREE.Vector3(
    origin.x + normalizedAxis.x * sampleDistance,
    origin.y + normalizedAxis.y * sampleDistance,
    origin.z + normalizedAxis.z * sampleDistance
  ).project(ctx.camera);
  const rect = ctx.renderer.domElement.getBoundingClientRect();
  return {
    x: (end.x - start.x) * rect.width * 0.5,
    y: -(end.y - start.y) * rect.height * 0.5
  };
}

function getThreeRaycastHit(event, predicate = null) {
  const ctx = ensureThree();
  if (!ctx || !ctx.renderer || !ctx.camera || !ctx.raycaster || !ctx.pointerNdc) return null;

  const rect = ctx.renderer.domElement.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  const pointerX = ((event.clientX - rect.left) / width) * 2 - 1;
  const pointerY = -(((event.clientY - rect.top) / height) * 2 - 1);
  ctx.pointerNdc.set(pointerX, pointerY);
  ctx.raycaster.setFromCamera(ctx.pointerNdc, ctx.camera);

  const intersections = ctx.raycaster.intersectObjects(ctx.group.children, true);
  for (let i = 0; i < intersections.length; i += 1) {
    let object = intersections[i].object;
    while (object) {
      const data = object.userData || {};
      if (!predicate || predicate(data, object, intersections[i])) {
        return { intersection: intersections[i], object, userData: data };
      }
      object = object.parent || null;
    }
  }
  return null;
}

function formatThreeDragAction(action) {
  const labels = {
    'three-width': 'box width',
    'three-height': 'box height',
    'three-depth': 'box depth',
    'three-port-position': 'port position',
    'three-port-length': 'port length',
    'three-slot-run-length': 'slot run length',
    'three-slot-fold-node': 'slot fold'
  };
  return labels[action] || String(action || '3D target').replace(/^three-/, '').replace(/-/g, ' ');
}

function getThreeNearestEditTarget(event, maxDistancePx = 120) {
  const ctx = ensureThree();
  if (!ctx || !ctx.renderer || !ctx.camera || !ctx.group || !window.THREE) return null;

  const rect = ctx.renderer.domElement.getBoundingClientRect();
  const pointer = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
  let best = null;
  ctx.camera.updateMatrixWorld(true);
  ctx.group.updateMatrixWorld(true);
  ctx.group.traverse((object) => {
    const data = object && object.userData;
    if (!data || typeof data.dragAction !== 'string' || !data.dragAction.startsWith('three-')) return;
    const center = data.worldCenter
      ? new window.THREE.Vector3(safeNumber(data.worldCenter.x), safeNumber(data.worldCenter.y), safeNumber(data.worldCenter.z))
      : object.getWorldPosition(new window.THREE.Vector3());
    const projected = center.clone().project(ctx.camera);
    if (projected.z < -1 || projected.z > 1) return;
    const screen = {
      x: ((projected.x + 1) * 0.5) * rect.width,
      y: ((1 - projected.y) * 0.5) * rect.height
    };
    const distance = Math.hypot(screen.x - pointer.x, screen.y - pointer.y);
    if (distance > maxDistancePx) return;
    if (!best || distance < best.distance) {
      best = { object, userData: data, distance };
    }
  });
  return best;
}

function getThreeFallbackBoxEditTarget(event) {
  const ctx = ensureThree();
  if (!ctx || !ctx.renderer || !ctx.camera || !ctx.group || !window.THREE) return null;

  const rect = ctx.renderer.domElement.getBoundingClientRect();
  const xNorm = clamp01((event.clientX - rect.left) / Math.max(1, rect.width));
  const yNorm = clamp01((event.clientY - rect.top) / Math.max(1, rect.height));
  let preferredAction = 'three-depth';
  if (yNorm < 0.42) preferredAction = 'three-height';
  if (yNorm > 0.58 || xNorm < 0.42) preferredAction = 'three-width';
  if (xNorm > 0.68 && yNorm >= 0.38 && yNorm <= 0.72) preferredAction = 'three-depth';

  let preferred = null;
  let firstBoxTarget = null;
  ctx.camera.updateMatrixWorld(true);
  ctx.group.updateMatrixWorld(true);
  ctx.group.traverse((object) => {
    const data = object && object.userData;
    if (!data || !['three-width', 'three-height', 'three-depth'].includes(data.dragAction)) return;
    if (!firstBoxTarget) firstBoxTarget = { object, userData: data, distance: Number.POSITIVE_INFINITY };
    if (data.dragAction === preferredAction && !preferred) {
      preferred = { object, userData: data, distance: Number.POSITIVE_INFINITY };
    }
  });
  return preferred || firstBoxTarget;
}

function createThreeHandleSphere(radius, color, emissive) {
  const handle = new window.THREE.Mesh(
    new window.THREE.SphereGeometry(radius, 18, 18),
    new window.THREE.MeshStandardMaterial({
      color,
      emissive,
      metalness: 0.22,
      roughness: 0.34
    })
  );
  const hitTarget = new window.THREE.Mesh(
    new window.THREE.SphereGeometry(Math.max(radius * 2.8, radius + 0.75), 16, 16),
    new window.THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.001,
      depthWrite: false
    })
  );
  hitTarget.userData.isHandleHitTarget = true;
  handle.add(hitTarget);
  return handle;
}

function addThreeHandleHitTarget(handle, radius, color = 0xffffff) {
  if (!handle || !window.THREE) return;
  const hitTarget = new window.THREE.Mesh(
    new window.THREE.SphereGeometry(Math.max(radius * 2.8, radius + 0.75), 16, 16),
    new window.THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.001,
      depthWrite: false
    })
  );
  hitTarget.userData.isHandleHitTarget = true;
  handle.add(hitTarget);
}

function setThreeViewPreset(name) {
  const ctx = ensureThree();
  if (!ctx) return;
  if (state.threeLockView) return;
  const s = ctx.state3d;
  const preset = String(name || 'iso');
  if (preset === 'hatch') {
    s.yaw = -0.15;
    s.pitch = 0.22;
  } else if (preset === 'front') {
    s.yaw = Math.PI;
    s.pitch = 0.08;
  } else if (preset === 'top') {
    s.yaw = -0.55;
    s.pitch = 1.12;
  } else {
    s.yaw = -0.55;
    s.pitch = 0.35;
  }
  if (ctx.updateCamera) ctx.updateCamera();
}

function addThreeLabel(ctx, text, x, y, z, colorHex, dragData = null) {
  if (!ctx || !window.THREE) return;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const c = canvas.getContext('2d');
  if (!c) return;
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = 'rgba(0, 0, 0, 0.35)';
  c.fillRect(8, 16, canvas.width - 16, canvas.height - 32);
  c.strokeStyle = `#${(colorHex || 0x9fd6ff).toString(16).padStart(6, '0')}`;
  c.lineWidth = 3;
  c.strokeRect(8, 16, canvas.width - 16, canvas.height - 32);
  c.fillStyle = '#d7eeff';
  c.font = '700 44px Space Grotesk, Arial, sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(text, canvas.width / 2, canvas.height / 2 + 2);

  const texture = new window.THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new window.THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new window.THREE.Sprite(material);
  sprite.scale.set(9, 2.25, 1);
  sprite.position.set(x, y, z);
  if (dragData && typeof dragData.dragAction === 'string') {
    sprite.userData = {
      ...dragData,
      worldCenter: { x, y, z }
    };
  }
  ctx.group.add(sprite);
}

function renderThreePreview(externalDimensions) {
  const ctx = ensureThree();
  if (!ctx) return;
  bindThreeSelection();
  if (ctx.root && ctx.root.dataset) {
    ctx.root.dataset.selectedSegment = state.designerSelectedSegment || '';
  }
  while (ctx.group.children.length) ctx.group.remove(ctx.group.children[0]);
  const width = Math.max(0.1, externalDimensions.width);
  const height = Math.max(0.1, externalDimensions.height);
  const topDepth = Number.isFinite(externalDimensions.topDepth) ? externalDimensions.topDepth : externalDimensions.depth;
  const bottomDepth = Number.isFinite(externalDimensions.bottomDepth) ? externalDimensions.bottomDepth : externalDimensions.depth;
  const depth = Math.max(0.1, externalDimensions.depth);
  const occupiedEnvelope = getOccupiedEnvelope(state, externalDimensions);
  let geometry;
  if (state.cabinetStyle === 'wedge') {
    const shape = new window.THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(topDepth, 0);
    shape.lineTo(bottomDepth, height);
    shape.lineTo(0, height);
    shape.lineTo(0, 0);
    geometry = new window.THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: false });
    geometry.rotateY(Math.PI / 2);
  } else {
    geometry = new window.THREE.BoxGeometry(width, height, depth);
  }
  const fitsConstraints = !state.useMaxConstraints || (
    occupiedEnvelope.width <= Math.max(0, safeNumber(state.maxBoxWidth)) &&
    occupiedEnvelope.height <= Math.max(0, safeNumber(state.maxBoxHeight)) &&
    occupiedEnvelope.depth <= Math.max(0, safeNumber(state.maxBoxDepth))
  );
  const showInterior = !!state.threeCutaway;
  const shellOpacity = clampValue(safeNumber(state.threeShellOpacity), 0.05, 1);
  const portOpacity = clampValue(safeNumber(state.threePortOpacity), 0.05, 1);
  const portWallThickness = Math.max(0.01, safeNumber(state.threePortWallThickness));
  const selectedRouteSegmentKey = state.designerSelectedSegment || '';
  const shellMat = new window.THREE.MeshStandardMaterial({
    color: fitsConstraints ? 0x2b3e5f : 0x6a2733,
    transparent: showInterior || shellOpacity < 0.999,
    opacity: showInterior ? shellOpacity : 1,
    metalness: 0.12,
    roughness: 0.65
  });
  const shell = new window.THREE.Mesh(geometry, shellMat);
  const enclosureGroup = new window.THREE.Group();
  enclosureGroup.add(shell);

  const edgeGeom = new window.THREE.EdgesGeometry(geometry, 25);
  const edgeLines = new window.THREE.LineSegments(
    edgeGeom,
    new window.THREE.LineBasicMaterial({ color: fitsConstraints ? 0x66d8ff : 0xff8392, transparent: true, opacity: 0.9 })
  );
  enclosureGroup.add(edgeLines);

  const baffleW = Math.max(0.01, width);
  const baffleH = Math.max(0.01, height);
  const baffle = new window.THREE.Mesh(
    new window.THREE.PlaneGeometry(baffleW, baffleH),
    new window.THREE.MeshStandardMaterial({
      color: 0x20304a,
      metalness: 0.08,
      roughness: 0.75,
      transparent: showInterior,
      opacity: showInterior ? Math.max(shellOpacity * 0.8, 0.08) : 1
    })
  );
  const frontZ = depth / 2 + 0.05;
  const driverCount = Math.max(1, Math.round(safeNumber(state.driverCount)));
  const layout = state.threeDriverLayout || 'auto';
  baffle.position.set(0, 0, frontZ);
  enclosureGroup.add(baffle);

  const cutR = Math.max(0.25, safeNumber(state.driverCutout) / 2);
  const basketR = Math.max(cutR + 0.35, safeNumber(state.driverSize) / 2);
  const basketDepth = Math.max(0.4, safeNumber(state.mountingDepth));
  const driverXs = [];
  const driverYs = [];
  if (driverCount === 1) {
    driverXs.push(0);
    driverYs.push(0);
  } else {
    const horizontalPreferred = layout === 'horizontal' || (layout === 'auto' && baffleW >= baffleH);
    const spanW = Math.min(baffleW * 0.72, Math.max(basketR * 2.8, (driverCount - 1) * basketR * 2.15));
    const spanH = Math.min(baffleH * 0.72, Math.max(basketR * 2.8, (driverCount - 1) * basketR * 2.15));
    for (let i = 0; i < driverCount; i += 1) {
      const t = driverCount === 1 ? 0.5 : i / (driverCount - 1);
      if (horizontalPreferred) {
        driverXs.push((t - 0.5) * spanW);
        driverYs.push(0);
      } else {
        driverXs.push(0);
        driverYs.push((0.5 - t) * spanH);
      }
    }
  }

  for (let i = 0; i < driverXs.length; i += 1) {
    const px = driverXs[i];
    const py = driverYs[i];
    const cutoutRing = new window.THREE.Mesh(
      new window.THREE.TorusGeometry(cutR, Math.max(0.08, cutR * 0.08), 12, 36),
      new window.THREE.MeshStandardMaterial({ color: 0x6fcfff, emissive: 0x0f2d45, metalness: 0.2, roughness: 0.4 })
    );
    cutoutRing.position.set(px, py, frontZ + 0.02);
    enclosureGroup.add(cutoutRing);

    const flange = new window.THREE.Mesh(
      new window.THREE.CylinderGeometry(basketR, basketR, 0.35, 36),
      new window.THREE.MeshStandardMaterial({ color: 0x8ea6bf, metalness: 0.55, roughness: 0.35 })
    );
    flange.rotation.x = Math.PI / 2;
    flange.position.set(px, py, frontZ + 0.2);
    enclosureGroup.add(flange);

    const basket = new window.THREE.Mesh(
      new window.THREE.CylinderGeometry(cutR * 0.86, cutR * 0.62, basketDepth, 28),
      new window.THREE.MeshStandardMaterial({ color: 0x1b2430, metalness: 0.25, roughness: 0.55 })
    );
    basket.rotation.x = Math.PI / 2;
    basket.position.set(px, py, frontZ - basketDepth * 0.5);
    enclosureGroup.add(basket);

    const motor = new window.THREE.Mesh(
      new window.THREE.CylinderGeometry(cutR * 0.4, cutR * 0.4, Math.max(0.45, basketDepth * 0.32), 24),
      new window.THREE.MeshStandardMaterial({ color: 0x2a2f38, metalness: 0.32, roughness: 0.5 })
    );
    motor.rotation.x = Math.PI / 2;
    motor.position.set(px, py, frontZ - basketDepth - Math.max(0.2, basketDepth * 0.16));
    enclosureGroup.add(motor);
  }

  const portPreview = getPortRouteData(externalDimensions);
  if (portPreview) {
    const portMaterial = new window.THREE.MeshStandardMaterial({
      color: 0x3cae9d,
      roughness: 0.42,
      metalness: 0.22,
      transparent: showInterior || portOpacity < 0.999,
      opacity: portOpacity
    });
    const voidMaterial = new window.THREE.MeshStandardMaterial({
      color: 0x07111b,
      roughness: 0.95,
      metalness: 0.02,
      transparent: true,
      opacity: showInterior ? Math.max(0.5, portOpacity * 0.8) : 0.92
    });
    const ringMaterial = new window.THREE.MeshStandardMaterial({
      color: 0x74ffe1,
      emissive: 0x10362d,
      roughness: 0.4,
      metalness: 0.18,
      transparent: true,
      opacity: Math.max(portOpacity, 0.4)
    });
    portPreview.instances.forEach((instance) => {
      const axisVector = createAxisVector(instance.normal, instance.normalSign);
      const axisThree = new window.THREE.Vector3(axisVector.x, axisVector.y, axisVector.z);
      const mountFacePoint = instance.surfaceCenter;
      const mouthFacePoint = instance.outerEndCenter;
      if (portPreview.type === 'round') {
        const segmentKey = createSegmentKey(instance.index, { kind: 'external-run', channelIndex: 0, axis: instance.normal });
        const isSelected = state.designerSelectedSegment === segmentKey;
        const portMesh = new window.THREE.Mesh(
          new window.THREE.CylinderGeometry(instance.openingA / 2, instance.openingA / 2, instance.length, 28),
          isSelected
            ? portMaterial.clone()
            : portMaterial
        );
        if (isSelected) portMesh.material.color.setHex(0xff7fa8);
        portMesh.userData.segmentKey = segmentKey;
        portMesh.userData.dragAction = 'three-port-length';
        portMesh.userData.worldCenter = { x: instance.center.x, y: instance.center.y, z: instance.center.z };
        portMesh.userData.axisVector = axisVector;
        portMesh.position.set(instance.center.x, instance.center.y, instance.center.z);
        portMesh.quaternion.setFromUnitVectors(
          new window.THREE.Vector3(0, 1, 0),
          axisThree
        );
        enclosureGroup.add(portMesh);

        const innerRadius = Math.max(0.05, (instance.openingA / 2) - portWallThickness);
        const innerTube = new window.THREE.Mesh(
          new window.THREE.CylinderGeometry(innerRadius, innerRadius, instance.length * 1.01, 24),
          voidMaterial
        );
        innerTube.userData.segmentKey = segmentKey;
        innerTube.position.copy(portMesh.position);
        innerTube.quaternion.copy(portMesh.quaternion);
        enclosureGroup.add(innerTube);

        const openingRing = new window.THREE.Mesh(
          new window.THREE.TorusGeometry((instance.openingA / 2) - (portWallThickness * 0.5), portWallThickness * 0.5, 12, 36),
          ringMaterial
        );
        openingRing.userData.segmentKey = segmentKey;
        openingRing.userData.dragAction = 'three-port-position';
        openingRing.userData.tangentA = instance.tangentA;
        openingRing.userData.tangentB = instance.tangentB;
        openingRing.userData.openingA = instance.openingA;
        openingRing.userData.openingB = instance.openingB;
        openingRing.userData.spanA = portPreview.faceWidth;
        openingRing.userData.spanB = portPreview.faceHeight;
        openingRing.userData.worldCenter = { x: mountFacePoint.x, y: mountFacePoint.y, z: mountFacePoint.z };
        openingRing.userData.axisVectorA = createAxisVector(instance.tangentA, 1);
        openingRing.userData.axisVectorB = createAxisVector(instance.tangentB, instance.tangentB === 'y' ? -1 : 1);
        openingRing.position.set(mountFacePoint.x, mountFacePoint.y, mountFacePoint.z);
        openingRing.quaternion.setFromUnitVectors(new window.THREE.Vector3(0, 0, 1), axisThree);
        enclosureGroup.add(openingRing);
        if (instance.externalLength > 0.001) {
          const outerRing = openingRing.clone();
          outerRing.userData.segmentKey = segmentKey;
          outerRing.position.set(mouthFacePoint.x, mouthFacePoint.y, mouthFacePoint.z);
          enclosureGroup.add(outerRing);
        }
      } else {
        instance.segments.forEach((segment) => {
          const segmentSelected = state.designerSelectedSegment === segment.segmentKey;
          const slotDims = {
            x: segment.size.x,
            y: segment.size.y,
            z: segment.size.z
          };
          const slotPort = new window.THREE.Mesh(
            new window.THREE.BoxGeometry(slotDims.x, slotDims.y, slotDims.z),
            segmentSelected ? portMaterial.clone() : portMaterial
          );
          if (segmentSelected) slotPort.material.color.setHex(0xff7fa8);
          slotPort.userData.segmentKey = segment.segmentKey;
          if (segment.kind === 'external-run') {
            slotPort.userData.dragAction = 'three-port-length';
            slotPort.userData.worldCenter = { x: segment.center.x, y: segment.center.y, z: segment.center.z };
            slotPort.userData.axisVector = createAxisVector(segment.axis, 1);
          }
          slotPort.position.set(segment.center.x, segment.center.y, segment.center.z);
          enclosureGroup.add(slotPort);

          const innerSlotDims = {
            x: Math.max(0.05, slotDims.x - (segment.axis === 'x' ? 0 : portWallThickness * 2)),
            y: Math.max(0.05, slotDims.y - (segment.axis === 'y' ? 0 : portWallThickness * 2)),
            z: Math.max(0.05, slotDims.z - (segment.axis === 'z' ? 0 : portWallThickness * 2))
          };
          innerSlotDims[segment.axis] = slotDims[segment.axis] * 1.01;
          const slotVoid = new window.THREE.Mesh(
            new window.THREE.BoxGeometry(innerSlotDims.x, innerSlotDims.y, innerSlotDims.z),
            voidMaterial
          );
          slotVoid.userData.segmentKey = segment.segmentKey;
          slotVoid.position.copy(slotPort.position);
          enclosureGroup.add(slotVoid);

          if (segmentSelected && segment.kind === 'internal-run' && Number.isInteger(segment.channelIndex)) {
            const runDirection = {
              x: safeNumber(segment.runEnd && segment.runStart ? segment.runEnd.x - segment.runStart.x : 0),
              y: safeNumber(segment.runEnd && segment.runStart ? segment.runEnd.y - segment.runStart.y : 0),
              z: safeNumber(segment.runEnd && segment.runStart ? segment.runEnd.z - segment.runStart.z : 0)
            };
            const handleRadius = Math.max(0.24, Math.min(width, height, depth) * 0.022);
            const runHandle = new window.THREE.Mesh(
              new window.THREE.SphereGeometry(handleRadius, 18, 18),
              new window.THREE.MeshStandardMaterial({ color: 0xb886ff, emissive: 0x2f1a52, metalness: 0.18, roughness: 0.34 })
            );
            addThreeHandleHitTarget(runHandle, handleRadius, 0xb886ff);
            runHandle.position.set(segment.runEnd.x, segment.runEnd.y, segment.runEnd.z);
            runHandle.userData.dragAction = 'three-slot-run-length';
            runHandle.userData.segmentKey = segment.segmentKey;
            runHandle.userData.channelIndex = segment.channelIndex;
            runHandle.userData.totalRunLength = instance.runLengths.reduce((acc, value) => acc + value, 0);
            runHandle.userData.runLengths = instance.runLengths.slice();
            runHandle.userData.channelCount = instance.runLengths.length;
            runHandle.userData.worldCenter = { x: segment.runEnd.x, y: segment.runEnd.y, z: segment.runEnd.z };
            runHandle.userData.axisVector = runDirection;
            enclosureGroup.add(runHandle);
          }

          if (segmentSelected && segment.kind === 'fold-connector') {
            const handleRadius = Math.max(0.24, Math.min(width, height, depth) * 0.022);
            const foldAxis = segment.axis;
            const baseOffset = segment.center[foldAxis] - instance.surfaceCenter[foldAxis];
            const foldHandle = new window.THREE.Mesh(
              new window.THREE.SphereGeometry(handleRadius, 18, 18),
              new window.THREE.MeshStandardMaterial({ color: 0xffbf66, emissive: 0x493107, metalness: 0.2, roughness: 0.34 })
            );
            addThreeHandleHitTarget(foldHandle, handleRadius, 0xffbf66);
            foldHandle.position.set(segment.center.x, segment.center.y, segment.center.z);
            foldHandle.userData.dragAction = 'three-slot-fold-node';
            foldHandle.userData.segmentKey = segment.segmentKey;
            foldHandle.userData.channelIndex = segment.channelIndex;
            foldHandle.userData.foldAxis = foldAxis;
            foldHandle.userData.foldThickness = segment.size[foldAxis];
            foldHandle.userData.baseOffset = baseOffset;
            foldHandle.userData.multiplier = segment.channelIndex + 0.5;
            foldHandle.userData.worldCenter = { x: segment.center.x, y: segment.center.y, z: segment.center.z };
            foldHandle.userData.axisVector = createAxisVector(foldAxis, baseOffset >= 0 ? 1 : -1);
            enclosureGroup.add(foldHandle);
          }
        });

        const faceSegmentKey = createSegmentKey(instance.index, { kind: 'external-run', channelIndex: 0, axis: instance.normal });
        const openingFrame = new window.THREE.Mesh(
          new window.THREE.PlaneGeometry(
            Math.max(0.05, instance.openingA),
            Math.max(0.05, instance.openingB)
          ),
          ringMaterial
        );
        openingFrame.userData.segmentKey = faceSegmentKey;
        openingFrame.userData.dragAction = 'three-port-position';
        openingFrame.userData.tangentA = instance.tangentA;
        openingFrame.userData.tangentB = instance.tangentB;
        openingFrame.userData.openingA = instance.openingA;
        openingFrame.userData.openingB = instance.openingB;
        openingFrame.userData.spanA = portPreview.faceWidth;
        openingFrame.userData.spanB = portPreview.faceHeight;
        openingFrame.userData.worldCenter = { x: mountFacePoint.x, y: mountFacePoint.y, z: mountFacePoint.z };
        openingFrame.userData.axisVectorA = createAxisVector(instance.tangentA, 1);
        openingFrame.userData.axisVectorB = createAxisVector(instance.tangentB, instance.tangentB === 'y' ? -1 : 1);
        openingFrame.position.set(mountFacePoint.x, mountFacePoint.y, mountFacePoint.z);
        openingFrame.quaternion.setFromUnitVectors(new window.THREE.Vector3(0, 0, 1), axisThree);
        enclosureGroup.add(openingFrame);
        if (instance.externalLength > 0.001) {
          const outerFrame = openingFrame.clone();
          outerFrame.userData.segmentKey = faceSegmentKey;
          outerFrame.position.set(mouthFacePoint.x, mouthFacePoint.y, mouthFacePoint.z);
          enclosureGroup.add(outerFrame);
        }
      }

      const faceSegmentKey = createSegmentKey(instance.index, { kind: 'external-run', channelIndex: 0, axis: instance.normal });
      const selectedOnInstance = selectedRouteSegmentKey === faceSegmentKey
        || instance.segments.some((segment) => segment.segmentKey === selectedRouteSegmentKey);
      {
        const handleRadius = Math.max(0.28, Math.min(width, height, depth) * 0.025);
        const moveHandle = new window.THREE.Mesh(
          new window.THREE.SphereGeometry(handleRadius, 18, 18),
          new window.THREE.MeshStandardMaterial({
            color: selectedOnInstance ? 0xffd36b : 0xd6a542,
            emissive: 0x493107,
            metalness: 0.22,
            roughness: 0.36,
            transparent: !selectedOnInstance,
            opacity: selectedOnInstance ? 1 : 0.72
          })
        );
        addThreeHandleHitTarget(moveHandle, handleRadius, 0xffd36b);
        moveHandle.position.set(mountFacePoint.x, mountFacePoint.y, mountFacePoint.z);
        moveHandle.userData.dragAction = 'three-port-position';
        moveHandle.userData.segmentKey = faceSegmentKey;
        moveHandle.userData.instanceIndex = instance.index;
        moveHandle.userData.worldCenter = { x: mountFacePoint.x, y: mountFacePoint.y, z: mountFacePoint.z };
        moveHandle.userData.tangentA = instance.tangentA;
        moveHandle.userData.tangentB = instance.tangentB;
        moveHandle.userData.openingA = instance.openingA;
        moveHandle.userData.openingB = instance.openingB;
        moveHandle.userData.spanA = portPreview.faceWidth;
        moveHandle.userData.spanB = portPreview.faceHeight;
        moveHandle.userData.axisVectorA = createAxisVector(instance.tangentA, 1);
        moveHandle.userData.axisVectorB = createAxisVector(instance.tangentB, instance.tangentB === 'y' ? -1 : 1);
        enclosureGroup.add(moveHandle);

        const lengthHandlePoint = instance.externalLength > 0.001
          ? mouthFacePoint
          : {
            x: mountFacePoint.x + axisVector.x * handleRadius * 3,
            y: mountFacePoint.y + axisVector.y * handleRadius * 3,
            z: mountFacePoint.z + axisVector.z * handleRadius * 3
          };
        const lengthHandle = new window.THREE.Mesh(
          new window.THREE.SphereGeometry(handleRadius * 0.9, 18, 18),
          new window.THREE.MeshStandardMaterial({
            color: selectedOnInstance ? 0xff7fa8 : 0xdd6d91,
            emissive: 0x4b1323,
            metalness: 0.18,
            roughness: 0.36,
            transparent: !selectedOnInstance,
            opacity: selectedOnInstance ? 1 : 0.72
          })
        );
        addThreeHandleHitTarget(lengthHandle, handleRadius * 0.9, 0xff7fa8);
        lengthHandle.position.set(lengthHandlePoint.x, lengthHandlePoint.y, lengthHandlePoint.z);
        lengthHandle.userData.dragAction = 'three-port-length';
        lengthHandle.userData.segmentKey = faceSegmentKey;
        lengthHandle.userData.instanceIndex = instance.index;
        lengthHandle.userData.worldCenter = { x: lengthHandlePoint.x, y: lengthHandlePoint.y, z: lengthHandlePoint.z };
        lengthHandle.userData.axisVector = axisVector;
        enclosureGroup.add(lengthHandle);
      }
    });
  }

  let trunkW = Math.max(width * 1.2, width + 2);
  let trunkH = Math.max(height * 1.2, height + 2);
  let trunkD = Math.max(depth * 1.2, depth + 2);
  if (state.useMaxConstraints) {
    trunkW = Math.max(1, safeNumber(state.maxBoxWidth));
    trunkH = Math.max(1, safeNumber(state.maxBoxHeight));
    trunkD = Math.max(1, safeNumber(state.maxBoxDepth));
    const trunkGeom = new window.THREE.BoxGeometry(trunkW, trunkH, trunkD);

    const trunkFill = new window.THREE.Mesh(
      trunkGeom,
      new window.THREE.MeshStandardMaterial({
        color: 0x4ac7ff,
        transparent: true,
        opacity: 0.06,
        metalness: 0.0,
        roughness: 1.0
      })
    );
    trunkFill.position.set(0, trunkH * 0.5, 0);
    ctx.group.add(trunkFill);

    const trunkEdges = new window.THREE.LineSegments(
      new window.THREE.EdgesGeometry(trunkGeom),
      new window.THREE.LineBasicMaterial({ color: 0x5fd8ff, transparent: true, opacity: 0.42 })
    );
    trunkEdges.position.copy(trunkFill.position);
    ctx.group.add(trunkEdges);

    const frontGuide = new window.THREE.Mesh(
      new window.THREE.PlaneGeometry(trunkW * 0.92, trunkH * 0.82),
      new window.THREE.MeshBasicMaterial({ color: 0xff6f6f, transparent: true, opacity: 0.08, side: window.THREE.DoubleSide })
    );
    frontGuide.position.set(0, trunkH * 0.52, -trunkD * 0.5 + 0.02);
    ctx.group.add(frontGuide);

    const rearGuide = new window.THREE.Mesh(
      new window.THREE.PlaneGeometry(trunkW * 0.92, trunkH * 0.82),
      new window.THREE.MeshBasicMaterial({ color: 0x63ffc4, transparent: true, opacity: 0.08, side: window.THREE.DoubleSide })
    );
    rearGuide.position.set(0, trunkH * 0.52, trunkD * 0.5 - 0.02);
    rearGuide.rotateY(Math.PI);
    ctx.group.add(rearGuide);

    const rearSign = state.threeDepthDirection === 'back_to_front' ? -1 : 1;
    const frontZ = -rearSign * (trunkD * 0.5 - 0.35);
    const rearZ = rearSign * (trunkD * 0.5 - 0.35);
    addThreeLabel(ctx, 'BACK OF REAR SEATS', 0, trunkH + 1.1, frontZ, 0xff8a8a);
    addThreeLabel(ctx, 'REAR HATCH MAX', 0, trunkH + 1.1, rearZ, 0x7bffd1);
  }

  const threeFitInfo = document.getElementById('threeFitInfo');
  if (threeFitInfo) {
    const mw = state.useMaxConstraints ? safeNumber(state.maxBoxWidth) : occupiedEnvelope.width;
    const mh = state.useMaxConstraints ? safeNumber(state.maxBoxHeight) : occupiedEnvelope.height;
    const md = state.useMaxConstraints ? safeNumber(state.maxBoxDepth) : occupiedEnvelope.depth;
    const rw = mw - occupiedEnvelope.width;
    const rh = mh - occupiedEnvelope.height;
    const rd = md - occupiedEnvelope.depth;
    const fitWord = fitsConstraints ? 'FIT' : 'OVERFLOW';
    const depthDirText = state.threeDepthDirection === 'back_to_front'
      ? 'Depth axis: rear hatch -> back of rear seats'
      : 'Depth axis: back of rear seats -> rear hatch';
    const faceText = state.threeSubFacing === 'front'
      ? 'Subs facing back of rear seats'
      : 'Subs facing rear hatch';
    const portFaceText = portPreview
      ? `Port on ${portPreview.face} (${portPreview.extensionMode}, out ${portPreview.externalLength.toFixed(2)} in)`
      : 'No port';
    threeFitInfo.textContent = `3D fit status: ${fitWord} | Occupied W ${occupiedEnvelope.width.toFixed(2)} in (${rw >= 0 ? '+' : ''}${rw.toFixed(2)}) | H ${occupiedEnvelope.height.toFixed(2)} in (${rh >= 0 ? '+' : ''}${rh.toFixed(2)}) | D ${occupiedEnvelope.depth.toFixed(2)} in (${rd >= 0 ? '+' : ''}${rd.toFixed(2)}) | ${depthDirText} | ${faceText} | ${portFaceText}`;
    threeFitInfo.style.color = fitsConstraints ? 'var(--ok)' : 'var(--warn)';
  }

  // Position enclosure within the trunk frame: centered width, with configurable front/center/rear anchor.
  const rearSign = state.threeDepthDirection === 'back_to_front' ? -1 : 1;
  let anchorZ = 0;
  const flushInset = 0.08;
  if (state.threeBoxAnchor === 'rear') anchorZ = rearSign * ((trunkD * 0.5) - (depth * 0.5) - flushInset);
  if (state.threeBoxAnchor === 'front') anchorZ = -rearSign * ((trunkD * 0.5) - (depth * 0.5) - flushInset);
  enclosureGroup.position.set(0, height * 0.5, anchorZ);
  const facingRear = state.threeSubFacing === 'rear';
  enclosureGroup.rotation.y = (facingRear ? 0 : Math.PI) + (rearSign < 0 ? Math.PI : 0);

  const boxHandleRadius = Math.max(0.32, Math.min(width, height, depth) * 0.03);
  const widthHandle = createThreeHandleSphere(boxHandleRadius, 0x30d5ff, 0x0f3044);
  widthHandle.position.set((width * 0.5) + boxHandleRadius * 0.6, 0, 0);
  widthHandle.userData.dragAction = 'three-width';
  widthHandle.userData.worldCenter = {};
  widthHandle.userData.axisVector = {};
  enclosureGroup.add(widthHandle);

  const heightHandle = createThreeHandleSphere(boxHandleRadius, 0x59b9ff, 0x12325e);
  heightHandle.position.set(0, (height * 0.5) + boxHandleRadius * 0.6, 0);
  heightHandle.userData.dragAction = 'three-height';
  heightHandle.userData.worldCenter = {};
  heightHandle.userData.axisVector = {};
  enclosureGroup.add(heightHandle);

  const depthHandle = createThreeHandleSphere(boxHandleRadius, 0x7cf5c8, 0x143d32);
  depthHandle.position.set(0, 0, (depth * 0.5) + boxHandleRadius * 0.6);
  depthHandle.userData.dragAction = 'three-depth';
  depthHandle.userData.worldCenter = {};
  depthHandle.userData.axisVector = {};
  enclosureGroup.add(depthHandle);

  ctx.group.add(enclosureGroup);
  enclosureGroup.updateMatrixWorld(true);

  const enclosureWorldQuaternion = new window.THREE.Quaternion();
  enclosureGroup.getWorldQuaternion(enclosureWorldQuaternion);
  enclosureGroup.traverse((object) => {
    const data = object && object.userData;
    if (!data || typeof data.dragAction !== 'string' || !data.dragAction.startsWith('three-')) return;
    const worldPoint = new window.THREE.Vector3();
    object.getWorldPosition(worldPoint);
    data.worldCenter = { x: worldPoint.x, y: worldPoint.y, z: worldPoint.z };
    ['axisVector', 'axisVectorA', 'axisVectorB'].forEach((key) => {
      const vector = data[key];
      if (!vector) return;
      const worldVector = new window.THREE.Vector3(
        safeNumber(vector.x),
        safeNumber(vector.y),
        safeNumber(vector.z)
      ).applyQuaternion(enclosureWorldQuaternion);
      data[key] = { x: worldVector.x, y: worldVector.y, z: worldVector.z };
    });
  });

  const localWidthAxis = new window.THREE.Vector3(1, 0, 0).applyQuaternion(enclosureGroup.quaternion);
  const localHeightAxis = new window.THREE.Vector3(0, 1, 0).applyQuaternion(enclosureGroup.quaternion);
  const localDepthAxis = new window.THREE.Vector3(0, 0, 1).applyQuaternion(enclosureGroup.quaternion);
  const widthWorld = new window.THREE.Vector3();
  const heightWorld = new window.THREE.Vector3();
  const depthWorld = new window.THREE.Vector3();
  widthHandle.getWorldPosition(widthWorld);
  heightHandle.getWorldPosition(heightWorld);
  depthHandle.getWorldPosition(depthWorld);
  widthHandle.userData.worldCenter = { x: widthWorld.x, y: widthWorld.y, z: widthWorld.z };
  heightHandle.userData.worldCenter = { x: heightWorld.x, y: heightWorld.y, z: heightWorld.z };
  depthHandle.userData.worldCenter = { x: depthWorld.x, y: depthWorld.y, z: depthWorld.z };
  widthHandle.userData.axisVector = { x: localWidthAxis.x, y: localWidthAxis.y, z: localWidthAxis.z };
  heightHandle.userData.axisVector = { x: localHeightAxis.x, y: localHeightAxis.y, z: localHeightAxis.z };
  depthHandle.userData.axisVector = { x: localDepthAxis.x, y: localDepthAxis.y, z: localDepthAxis.z };

  addThreeLabel(ctx, 'WIDTH', widthWorld.x, widthWorld.y + boxHandleRadius * 1.8, widthWorld.z, 0x30d5ff, widthHandle.userData);
  addThreeLabel(ctx, 'HEIGHT', heightWorld.x, heightWorld.y + boxHandleRadius * 1.8, heightWorld.z, 0x59b9ff, heightHandle.userData);
  addThreeLabel(ctx, 'DEPTH', depthWorld.x, depthWorld.y + boxHandleRadius * 1.8, depthWorld.z, 0x7cf5c8, depthHandle.userData);

  const bounds = new window.THREE.Box3().setFromObject(ctx.group);
  const sphere = bounds.getBoundingSphere(new window.THREE.Sphere());
  const vFov = (ctx.camera.fov * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * ctx.camera.aspect);
  const fitDistanceVertical = sphere.radius / Math.sin(vFov / 2);
  const fitDistanceHorizontal = sphere.radius / Math.sin(hFov / 2);
  const fitDistance = Math.max(fitDistanceVertical, fitDistanceHorizontal, sphere.radius);
  const keepZoomDistance = state.threeLockZoom || (diagramInteraction.drag && diagramInteraction.activeSource === 'three');
  ctx.state3d.target.copy(sphere.center);
  if (!keepZoomDistance) {
    ctx.state3d.distance = fitDistance;
  }
  if (ctx.updateCamera) ctx.updateCamera();
}

function renderUI() {
  const autoPort = applyAutoPortSizing(state);
  syncAutoPortManagedInputs();
  const internalDimensions = getInternalDimensions(state);
  const externalDimensions = getExternalDimensions(state);

  const internalVolume = getVolume(internalDimensions);
  const totalDisplacement = getTotalDisplacementFt3(state);
  const netAfter = getNetVolume(internalVolume.ft3, totalDisplacement);
  const warnings = validateBox(state, internalDimensions);
  if (autoPort) {
    const lengthLabel = `${autoPort.lengthIn.toFixed(2)} in`;
    if (state.portType === 'round') {
      const openingLabel = autoPort.roundPortDiameter ? `Dia ${autoPort.roundPortDiameter.toFixed(2)} in` : `Dia ${state.roundPortDiameter.toFixed(2)} in`;
      warnings.push(`ℹ️ Auto round port: ${openingLabel} • L ${lengthLabel} • Total area ${autoPort.actualTotalAreaSqIn.toFixed(2)} in².`);
    } else {
      const widthLabel = autoPort.slotPortWidth ? autoPort.slotPortWidth.toFixed(2) : state.slotPortWidth.toFixed(2);
      const heightLabel = autoPort.slotPortHeight ? autoPort.slotPortHeight.toFixed(2) : state.slotPortHeight.toFixed(2);
      warnings.push(`ℹ️ Auto slot port: ${widthLabel} × ${heightLabel} in • L ${lengthLabel} • Total area ${autoPort.actualTotalAreaSqIn.toFixed(2)} in².`);
    }
  }
  const portPreview = getPortRouteData(externalDimensions);
  const selectionChanged = ensureRouteSelection(portPreview);
  if (selectionChanged) {
    if (state.portType === 'slot' && state.threeCutaway) {
      const selectedInternal = state.designerSelectedSegment.includes('internal-run') || state.designerSelectedSegment.includes('fold-connector');
      if (selectedInternal && inputs.threeCutaway) inputs.threeCutaway.checked = true;
    }
    persistState();
  }
  if (portPreview) {
    portPreview.warnings.forEach((warning) => warnings.push(`⚠️ ${warning}`));
    if (state.designerMode) {
      warnings.push('ℹ️ Designer Mode supports drag handles for box width, height, depth, first visible port center, first visible port size, and port length. Multi-port per-port editing and richer snapping are next.');
    }
    warnings.push('ℹ️ 3D preview port pieces are clickable and share selection with the Front / Side / Top designer views.');
  }
  syncThreeModeUI();
  syncThreeInteractionHint(portPreview);
  renderThreeDebug();

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
  outputs.netBefore.textContent = `${(internalVolume.ft3 - getPortDisplacementFt3(state)).toFixed(3)} ft³`;
  outputs.netAfter.textContent = `${netAfter.toFixed(3)} ft³`;
  if (outputs.quickVolume) {
    outputs.quickVolume.textContent = `Gross ${internalVolume.ft3.toFixed(3)} ft³ • Disp ${totalDisplacement.toFixed(3)} ft³ • Net ${netAfter.toFixed(3)} ft³`;
  }
  if (outputs.autoPortSummary) {
    if (state.enclosureType !== 'ported') {
      outputs.autoPortSummary.textContent = 'Switch Enclosure Type to Ported to design and auto-size ports.';
    } else if (autoPort) {
      const modeLabel = autoPort.mode === 'full' ? 'Full auto' : 'Auto length';
      if (state.portType === 'round') {
        outputs.autoPortSummary.textContent = `${modeLabel}: ${autoPort.quantity} round port${autoPort.quantity === 1 ? '' : 's'} • Dia ${state.roundPortDiameter.toFixed(2)} in • L ${state.roundPortLength.toFixed(2)} in • Area ${autoPort.actualTotalAreaSqIn.toFixed(2)} in² (target ${autoPort.targetAreaSqIn.toFixed(2)} in²)`;
      } else {
        outputs.autoPortSummary.textContent = `${modeLabel}: ${autoPort.quantity} slot opening${autoPort.quantity === 1 ? '' : 's'} • ${state.slotPortWidth.toFixed(2)} × ${state.slotPortHeight.toFixed(2)} in • L ${state.slotPortLength.toFixed(2)} in • Area ${autoPort.actualTotalAreaSqIn.toFixed(2)} in² (target ${autoPort.targetAreaSqIn.toFixed(2)} in²)`;
      }
    } else {
      outputs.autoPortSummary.textContent = 'Manual port sizing is active.';
    }
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
  renderDesignerViews(externalDimensions, portPreview);
  renderThreePreview(externalDimensions);
  renderCutSheet(externalDimensions, state.woodThickness);
  renderPresetState();
  syncCabinetStyleUI();
  syncPortUI();
  syncThreeModeUI();
}

function beginDiagramDrag(action, event, metadata = {}) {
  diagramInteraction.snapState = null;
  diagramInteraction.drag = {
    action,
    metadata,
    startX: event.clientX,
    startY: event.clientY,
    startState: {
      width: state.width,
      height: state.height,
      depth: state.depth,
      portOffsetX: state.portOffsetX,
      portOffsetY: state.portOffsetY,
      portOffsetZ: state.portOffsetZ,
      roundPortDiameter: state.roundPortDiameter,
      roundPortLength: state.roundPortLength,
      slotPortWidth: state.slotPortWidth,
      slotPortHeight: state.slotPortHeight,
      slotPortLength: state.slotPortLength,
      slotPortLeadRunOffset: state.slotPortLeadRunOffset
    }
  };
}

function updateDiagramDrag(event) {
  if (!diagramInteraction.drag || !diagramInteraction.context) return;
  const { action, metadata, startX, startY, startState } = diagramInteraction.drag;
  const ctx = diagramInteraction.context;
  const deltaX = event.clientX - startX;
  const deltaY = event.clientY - startY;
  const snapStep = Math.max(0.01, safeNumber(state.designerSnapIncrement) || 0.25);
  const snapThreshold = snapStep * 1.5;
  diagramInteraction.snapState = null;

  if (ctx.kind === 'three' && action === 'three-port-length' && ctx.portLength) {
    disengageAutoPortModeForManualEdit();
    const pxVector = ctx.portLength.pxVector;
    const vectorLenSq = Math.max(0.0001, (pxVector.x * pxVector.x) + (pxVector.y * pxVector.y));
    const deltaInches = ((deltaX * pxVector.x) + (deltaY * pxVector.y)) / vectorLenSq;
    if (state.portType === 'round') {
      state.roundPortLength = Math.max(0.5, snapToIncrement(startState.roundPortLength + deltaInches, snapStep));
    } else {
      state.slotPortLength = Math.max(0.5, snapToIncrement(startState.slotPortLength + deltaInches, snapStep));
    }
    diagramInteraction.snapState = {
      label: `3D port length ${state.portType === 'round' ? state.roundPortLength.toFixed(2) : state.slotPortLength.toFixed(2)} in`,
      guides: []
    };
  } else if (ctx.kind === 'three' && action === 'three-width' && ctx.boxResize) {
    const pxVector = ctx.boxResize.pxVector;
    const vectorLenSq = Math.max(0.0001, (pxVector.x * pxVector.x) + (pxVector.y * pxVector.y));
    const deltaInches = ((deltaX * pxVector.x) + (deltaY * pxVector.y)) / vectorLenSq;
    state.width = Math.max(1, snapToIncrement(startState.width + deltaInches, snapStep));
    diagramInteraction.snapState = { label: `3D width ${state.width.toFixed(2)} in`, guides: [] };
  } else if (ctx.kind === 'three' && action === 'three-height' && ctx.boxResize) {
    const pxVector = ctx.boxResize.pxVector;
    const vectorLenSq = Math.max(0.0001, (pxVector.x * pxVector.x) + (pxVector.y * pxVector.y));
    const deltaInches = ((deltaX * pxVector.x) + (deltaY * pxVector.y)) / vectorLenSq;
    state.height = Math.max(1, snapToIncrement(startState.height + deltaInches, snapStep));
    diagramInteraction.snapState = { label: `3D height ${state.height.toFixed(2)} in`, guides: [] };
  } else if (ctx.kind === 'three' && action === 'three-depth' && ctx.boxResize) {
    const pxVector = ctx.boxResize.pxVector;
    const vectorLenSq = Math.max(0.0001, (pxVector.x * pxVector.x) + (pxVector.y * pxVector.y));
    const deltaInches = ((deltaX * pxVector.x) + (deltaY * pxVector.y)) / vectorLenSq;
    state.depth = Math.max(1, snapToIncrement(startState.depth + deltaInches, snapStep));
    diagramInteraction.snapState = { label: `3D depth ${state.depth.toFixed(2)} in`, guides: [] };
  } else if (ctx.kind === 'three' && action === 'three-slot-run-length' && ctx.slotRunHandle) {
    disengageAutoPortModeForManualEdit();
    const pxVector = ctx.slotRunHandle.pxVector;
    const vectorLenSq = Math.max(0.0001, (pxVector.x * pxVector.x) + (pxVector.y * pxVector.y));
    const deltaRun = ((deltaX * pxVector.x) + (deltaY * pxVector.y)) / vectorLenSq;
    const minRun = Math.max(0.01, snapStep);
    const desired = ctx.slotRunHandle.runLengths.slice();
    desired[ctx.slotRunHandle.channelIndex] = Math.max(minRun, desired[ctx.slotRunHandle.channelIndex] + deltaRun);
    state.slotPortRunProfile = normalizeSlotRunProfile(
      desired,
      ctx.slotRunHandle.channelCount,
      ctx.slotRunHandle.totalRunLength,
      minRun,
      startState.slotPortLeadRunOffset
    );
    state.slotPortLeadRunOffset = snapToIncrement(
      state.slotPortRunProfile[0] - (ctx.slotRunHandle.totalRunLength / ctx.slotRunHandle.channelCount),
      snapStep
    );
    diagramInteraction.snapState = {
      label: `3D run ${ctx.slotRunHandle.channelIndex + 1} length ${state.slotPortRunProfile[ctx.slotRunHandle.channelIndex].toFixed(2)} in`,
      guides: []
    };
  } else if (ctx.kind === 'three' && action === 'three-slot-fold-node' && ctx.slotFoldHandle) {
    disengageAutoPortModeForManualEdit();
    const pxVector = ctx.slotFoldHandle.pxVector;
    const vectorLenSq = Math.max(0.0001, (pxVector.x * pxVector.x) + (pxVector.y * pxVector.y));
    const deltaFold = ((deltaX * pxVector.x) + (deltaY * pxVector.y)) / vectorLenSq;
    const nextOffset = ctx.slotFoldHandle.baseOffset + deltaFold;
    const direction = nextOffset >= 0 ? 'positive' : 'negative';
    const nextStep = Math.abs(nextOffset) / Math.max(0.5, ctx.slotFoldHandle.multiplier);
    const nextGap = Math.max(0, snapToIncrement(nextStep - ctx.slotFoldHandle.foldThickness, snapStep));
    state.slotPortChannelGap = nextGap;
    state.slotPortFoldDirection = direction;
    state.slotPortFoldAxis = axisToFoldSetting(ctx.slotFoldHandle.foldAxis);
    diagramInteraction.snapState = {
      label: `3D slot gap ${nextGap.toFixed(2)} in • ${direction} fold`,
      guides: []
    };
  } else if (ctx.kind === 'three' && action === 'three-port-position' && ctx.portMove) {
    const axisA = ctx.portMove.axisA.toUpperCase();
    const axisB = ctx.portMove.axisB.toUpperCase();
    const pxVectorA = ctx.portMove.pxVectorA;
    const pxVectorB = ctx.portMove.pxVectorB;
    const det = (pxVectorA.x * pxVectorB.y) - (pxVectorA.y * pxVectorB.x);
    let deltaA = 0;
    let deltaB = 0;
    if (Math.abs(det) > 0.0001) {
      deltaA = ((deltaX * pxVectorB.y) - (deltaY * pxVectorB.x)) / det;
      deltaB = ((pxVectorA.x * deltaY) - (pxVectorA.y * deltaX)) / det;
    } else {
      const lenSqA = Math.max(0.0001, (pxVectorA.x * pxVectorA.x) + (pxVectorA.y * pxVectorA.y));
      deltaA = ((deltaX * pxVectorA.x) + (deltaY * pxVectorA.y)) / lenSqA;
    }
    let nextA = snapToIncrement(startState[`portOffset${axisA}`] + deltaA, snapStep);
    let nextB = snapToIncrement(startState[`portOffset${axisB}`] + deltaB, snapStep);
    const margin = Math.max(snapStep, safeNumber(state.woodThickness));
    const maxOffsetA = Math.max(0, (ctx.portMove.spanA * 0.5) - (ctx.portMove.openingA * 0.5) - margin);
    const maxOffsetB = Math.max(0, (ctx.portMove.spanB * 0.5) - (ctx.portMove.openingB * 0.5) - margin);
    nextA = clampValue(nextA, -maxOffsetA, maxOffsetA);
    nextB = clampValue(nextB, -maxOffsetB, maxOffsetB);
    const snapA = applySnapCandidates(nextA, [
      { value: 0, label: `${axisA} centerline` },
      { value: -maxOffsetA, label: `${axisA} negative margin` },
      { value: maxOffsetA, label: `${axisA} positive margin` }
    ], snapThreshold);
    const snapB = applySnapCandidates(nextB, [
      { value: 0, label: `${axisB} centerline` },
      { value: -maxOffsetB, label: `${axisB} negative margin` },
      { value: maxOffsetB, label: `${axisB} positive margin` }
    ], snapThreshold);
    state[`portOffset${axisA}`] = snapA.value;
    state[`portOffset${axisB}`] = snapB.value;
    const labels = [snapA, snapB].filter((snap) => snap.snapped).map((snap) => snap.label);
    diagramInteraction.snapState = {
      label: labels.length ? `3D ${labels.join(' + ')}` : `3D port position ${axisA} ${snapA.value.toFixed(2)} • ${axisB} ${snapB.value.toFixed(2)}`,
      guides: []
    };
  } else if (ctx.kind === 'orthographic' && action === 'width') {
    let nextWidth = snapToIncrement(startState.width + (deltaX / Math.max(0.01, ctx.scale)), snapStep);
    if (state.useMaxConstraints) {
      const snapped = applySnapCandidates(nextWidth, [
        { value: safeNumber(state.maxBoxWidth), label: `max width ${safeNumber(state.maxBoxWidth).toFixed(2)} in` }
      ], snapThreshold);
      nextWidth = snapped.value;
      if (snapped.snapped) diagramInteraction.snapState = { label: snapped.label, guides: [] };
    }
    state.width = Math.max(1, nextWidth);
  } else if (ctx.kind === 'orthographic' && action === 'height') {
    let nextHeight = snapToIncrement(startState.height - (deltaY / Math.max(0.01, ctx.scale)), snapStep);
    if (state.useMaxConstraints) {
      const snapped = applySnapCandidates(nextHeight, [
        { value: safeNumber(state.maxBoxHeight), label: `max height ${safeNumber(state.maxBoxHeight).toFixed(2)} in` }
      ], snapThreshold);
      nextHeight = snapped.value;
      if (snapped.snapped) diagramInteraction.snapState = { label: snapped.label, guides: [] };
    }
    state.height = Math.max(1, nextHeight);
  } else if (ctx.kind === 'orthographic' && action === 'depth') {
    const deltaInches = (ctx.view.dimensionX === 'depth')
      ? (deltaX / Math.max(0.01, ctx.scale))
      : (-deltaY / Math.max(0.01, ctx.scale));
    let nextDepth = snapToIncrement(startState.depth + deltaInches, snapStep);
    if (state.useMaxConstraints) {
      const snapped = applySnapCandidates(nextDepth, [
        { value: safeNumber(state.maxBoxDepth), label: `max depth ${safeNumber(state.maxBoxDepth).toFixed(2)} in` }
      ], snapThreshold);
      nextDepth = snapped.value;
      if (snapped.snapped) diagramInteraction.snapState = { label: snapped.label, guides: [] };
    }
    state.depth = Math.max(1, nextDepth);
  } else if (ctx.kind === 'orthographic' && action === 'port-position' && ctx.portMove) {
    const axisA = ctx.portMove.axisA.toUpperCase();
    const axisB = ctx.portMove.axisB.toUpperCase();
    let nextA = snapToIncrement(startState[`portOffset${axisA}`] + (deltaX / Math.max(0.01, ctx.scale)), snapStep);
    let nextB = snapToIncrement(startState[`portOffset${axisB}`] - (deltaY / Math.max(0.01, ctx.scale)), snapStep);
    const margin = Math.max(snapStep, safeNumber(state.woodThickness));
    const maxOffsetA = Math.max(0, (ctx.portMove.spanA * 0.5) - (ctx.portMove.openingA * 0.5) - margin);
    const maxOffsetB = Math.max(0, (ctx.portMove.spanB * 0.5) - (ctx.portMove.openingB * 0.5) - margin);
    nextA = clampValue(nextA, -maxOffsetA, maxOffsetA);
    nextB = clampValue(nextB, -maxOffsetB, maxOffsetB);
    const snapA = applySnapCandidates(nextA, [
      { value: 0, label: `${axisA} centerline` },
      { value: -maxOffsetA, label: `${axisA} negative margin` },
      { value: maxOffsetA, label: `${axisA} positive margin` }
    ], snapThreshold);
    const snapB = applySnapCandidates(nextB, [
      { value: 0, label: `${axisB} centerline` },
      { value: -maxOffsetB, label: `${axisB} negative margin` },
      { value: maxOffsetB, label: `${axisB} positive margin` }
    ], snapThreshold);
    state[`portOffset${axisA}`] = snapA.value;
    state[`portOffset${axisB}`] = snapB.value;
    const labels = [snapA, snapB].filter((snap) => snap.snapped).map((snap) => snap.label);
    if (labels.length) diagramInteraction.snapState = { label: labels.join(' + '), guides: [] };
  } else if (ctx.kind === 'orthographic' && action === 'port-length' && ctx.portLength) {
    disengageAutoPortModeForManualEdit();
    const projectedPx = ((deltaX * ctx.portLength.pxVector.x) + (deltaY * ctx.portLength.pxVector.y))
      / Math.max(0.0001, (ctx.portLength.pxVector.x * ctx.portLength.pxVector.x) + (ctx.portLength.pxVector.y * ctx.portLength.pxVector.y));
    const deltaInches = projectedPx;
    if (state.portType === 'round') {
      state.roundPortLength = Math.max(0.5, snapToIncrement(startState.roundPortLength + deltaInches, snapStep));
    } else {
      state.slotPortLength = Math.max(0.5, snapToIncrement(startState.slotPortLength + deltaInches, snapStep));
    }
  } else if (ctx.kind === 'orthographic' && action === 'slot-fold-node' && ctx.foldHandles && metadata && metadata.handleKey) {
    disengageAutoPortModeForManualEdit();
    const handle = ctx.foldHandles[metadata.handleKey];
    if (handle) {
      let deltaFold = 0;
      if (ctx.view.axisX === handle.foldAxis) deltaFold = deltaX / Math.max(0.01, ctx.scale);
      if (ctx.view.axisY === handle.foldAxis) deltaFold = -deltaY / Math.max(0.01, ctx.scale);
      const nextOffset = handle.baseOffset + deltaFold;
      const direction = nextOffset >= 0 ? 'positive' : 'negative';
      const nextStep = Math.abs(nextOffset) / Math.max(0.5, handle.multiplier);
      const nextGap = Math.max(0, snapToIncrement(nextStep - handle.foldThickness, snapStep));
      state.slotPortChannelGap = nextGap;
      state.slotPortFoldDirection = direction;
      state.slotPortFoldAxis = axisToFoldSetting(handle.foldAxis);
      diagramInteraction.snapState = {
        label: `slot gap ${nextGap.toFixed(2)} in • ${direction} fold`,
        guides: []
      };
    }
  } else if (ctx.kind === 'orthographic' && action === 'slot-lead-run' && ctx.leadRunHandle) {
    disengageAutoPortModeForManualEdit();
    let deltaLead = 0;
    if (ctx.view.axisX === ctx.leadRunHandle.normalAxis) deltaLead = deltaX / Math.max(0.01, ctx.scale);
    if (ctx.view.axisY === ctx.leadRunHandle.normalAxis) deltaLead = -deltaY / Math.max(0.01, ctx.scale);
    state.slotPortLeadRunOffset = snapToIncrement(startState.slotPortLeadRunOffset + deltaLead, snapStep);
    diagramInteraction.snapState = {
      label: `lead run offset ${state.slotPortLeadRunOffset.toFixed(2)} in`,
      guides: []
    };
  } else if (ctx.kind === 'orthographic' && action === 'slot-run-length' && ctx.runHandles && metadata && metadata.handleKey) {
    disengageAutoPortModeForManualEdit();
    const handle = ctx.runHandles[metadata.handleKey];
    if (handle) {
      let deltaRun = 0;
      if (ctx.view.axisX === handle.normalAxis) deltaRun = deltaX / Math.max(0.01, ctx.scale);
      if (ctx.view.axisY === handle.normalAxis) deltaRun = -deltaY / Math.max(0.01, ctx.scale);
      const minRun = Math.max(0.01, snapStep);
      const desired = handle.runLengths.slice();
      desired[handle.channelIndex] = Math.max(minRun, desired[handle.channelIndex] + deltaRun);
      state.slotPortRunProfile = normalizeSlotRunProfile(
        desired,
        handle.channelCount,
        handle.totalRunLength,
        minRun,
        startState.slotPortLeadRunOffset
      );
      state.slotPortLeadRunOffset = snapToIncrement(state.slotPortRunProfile[0] - (handle.totalRunLength / handle.channelCount), snapStep);
      state.designerSelectedSegment = createSegmentKey(0, { kind: 'internal-run', channelIndex: handle.channelIndex, axis: handle.normalAxis });
      diagramInteraction.snapState = {
        label: `run ${handle.channelIndex + 1} length ${state.slotPortRunProfile[handle.channelIndex].toFixed(2)} in`,
        guides: []
      };
    }
  } else if (action === 'width') {
    let nextWidth = snapToIncrement(startState.width + (deltaX / Math.max(0.01, ctx.frontScaleX)), snapStep);
    if (state.useMaxConstraints) {
      const snapped = applySnapCandidates(nextWidth, [
        { value: safeNumber(state.maxBoxWidth), label: `max width ${safeNumber(state.maxBoxWidth).toFixed(2)} in` }
      ], snapThreshold);
      nextWidth = snapped.value;
      if (snapped.snapped) diagramInteraction.snapState = { label: snapped.label, guides: [] };
    }
    state.width = Math.max(1, nextWidth);
  } else if (action === 'height') {
    let nextHeight = snapToIncrement(startState.height - (deltaY / Math.max(0.01, ctx.frontScaleY)), snapStep);
    if (state.useMaxConstraints) {
      const snapped = applySnapCandidates(nextHeight, [
        { value: safeNumber(state.maxBoxHeight), label: `max height ${safeNumber(state.maxBoxHeight).toFixed(2)} in` }
      ], snapThreshold);
      nextHeight = snapped.value;
      if (snapped.snapped) diagramInteraction.snapState = { label: snapped.label, guides: [] };
    }
    state.height = Math.max(1, nextHeight);
  } else if (action === 'depth') {
    const depthVec = ctx.depthVector;
    const depthLenSq = Math.max(0.0001, (depthVec.x * depthVec.x) + (depthVec.y * depthVec.y));
    const projected = ((deltaX * depthVec.x) + (deltaY * depthVec.y)) / depthLenSq;
    let nextDepth = snapToIncrement(startState.depth + (projected * ctx.safeDepth), snapStep);
    if (state.useMaxConstraints) {
      const snapped = applySnapCandidates(nextDepth, [
        { value: safeNumber(state.maxBoxDepth), label: `max depth ${safeNumber(state.maxBoxDepth).toFixed(2)} in` }
      ], snapThreshold);
      nextDepth = snapped.value;
      if (snapped.snapped) diagramInteraction.snapState = { label: snapped.label, guides: [] };
    }
    state.depth = Math.max(1, nextDepth);
  } else if (action === 'port-position' && ctx.portPreview) {
    const face = ctx.portPreview.face;
    const quad = ctx.faceQuads[face];
    const edgeU = { x: quad[1].x - quad[0].x, y: quad[1].y - quad[0].y };
    const edgeV = { x: quad[3].x - quad[0].x, y: quad[3].y - quad[0].y };
    const edgeULenSq = Math.max(0.0001, (edgeU.x * edgeU.x) + (edgeU.y * edgeU.y));
    const edgeVLenSq = Math.max(0.0001, (edgeV.x * edgeV.x) + (edgeV.y * edgeV.y));
    const deltaUNorm = ((deltaX * edgeU.x) + (deltaY * edgeU.y)) / edgeULenSq;
    const deltaVNorm = ((deltaX * edgeV.x) + (deltaY * edgeV.y)) / edgeVLenSq;
    const axisA = ctx.portPreview.tangentA.toUpperCase();
    const axisB = ctx.portPreview.tangentB.toUpperCase();
    const spanA = ctx.portPreview.faceWidth;
    const spanB = ctx.portPreview.faceHeight;
    const deltaA = deltaUNorm * spanA;
    const deltaB = ctx.portPreview.tangentB === 'y' ? -(deltaVNorm * spanB) : (deltaVNorm * spanB);
    const openingA = ctx.portPreview.openingA;
    const openingB = ctx.portPreview.openingB;
    const margin = Math.max(snapStep, safeNumber(state.woodThickness));
    const maxOffsetA = Math.max(0, (spanA * 0.5) - (openingA * 0.5) - margin);
    const maxOffsetB = Math.max(0, (spanB * 0.5) - (openingB * 0.5) - margin);
    let nextA = snapToIncrement(startState[`portOffset${axisA}`] + deltaA, snapStep);
    let nextB = snapToIncrement(startState[`portOffset${axisB}`] + deltaB, snapStep);
    const faceQuad = ctx.faceQuads[face];
    const centerGuide = {
      type: 'line',
      x1: lerpPoint(faceQuad[0], faceQuad[3], 0.5).x,
      y1: lerpPoint(faceQuad[0], faceQuad[3], 0.5).y,
      x2: lerpPoint(faceQuad[1], faceQuad[2], 0.5).x,
      y2: lerpPoint(faceQuad[1], faceQuad[2], 0.5).y,
      color: '#ffe27a'
    };
    const middleGuide = {
      type: 'line',
      x1: lerpPoint(faceQuad[0], faceQuad[1], 0.5).x,
      y1: lerpPoint(faceQuad[0], faceQuad[1], 0.5).y,
      x2: lerpPoint(faceQuad[3], faceQuad[2], 0.5).x,
      y2: lerpPoint(faceQuad[3], faceQuad[2], 0.5).y,
      color: '#ffe27a'
    };
    const snapA = applySnapCandidates(nextA, [
      { value: 0, label: `${axisA} centerline`, guide: centerGuide },
      { value: -maxOffsetA, label: `${axisA} negative margin`, guide: centerGuide },
      { value: maxOffsetA, label: `${axisA} positive margin`, guide: centerGuide }
    ], snapThreshold);
    const snapB = applySnapCandidates(nextB, [
      { value: 0, label: `${axisB} centerline`, guide: middleGuide },
      { value: -maxOffsetB, label: `${axisB} negative margin`, guide: middleGuide },
      { value: maxOffsetB, label: `${axisB} positive margin`, guide: middleGuide }
    ], snapThreshold);
    nextA = snapA.value;
    nextB = snapB.value;
    state[`portOffset${axisA}`] = nextA;
    state[`portOffset${axisB}`] = nextB;
    const labels = [];
    const guides = [];
    if (snapA.snapped) {
      labels.push(snapA.label);
      if (snapA.guide) guides.push(snapA.guide);
    }
    if (snapB.snapped) {
      labels.push(snapB.label);
      if (snapB.guide) guides.push(snapB.guide);
    }
    if (labels.length) diagramInteraction.snapState = { label: labels.join(' + '), guides };
  } else if (action === 'port-length' && ctx.portPreview) {
    disengageAutoPortModeForManualEdit();
    const inward = ctx.firstPortHandle ? ctx.firstPortHandle.interiorVector : getPortInteriorVector(ctx.portPreview.face, ctx.axisVectors);
    const inwardLenSq = Math.max(0.0001, (inward.x * inward.x) + (inward.y * inward.y));
    const projectedInches = ((deltaX * inward.x) + (deltaY * inward.y)) / inwardLenSq;
    if (state.portType === 'round') {
      state.roundPortLength = Math.max(0.5, snapToIncrement(startState.roundPortLength + projectedInches, snapStep));
    } else {
      state.slotPortLength = Math.max(0.5, snapToIncrement(startState.slotPortLength + projectedInches, snapStep));
    }
  }

  if (state.cabinetStyle === 'rectangular') {
    state.topDepth = state.depth;
    state.bottomDepth = state.depth;
  }
  syncInputsFromState();
  persistState();
  if (ctx.kind === 'three' && diagramInteraction.snapState && diagramInteraction.snapState.label) {
    threeEditStatus = `3D edit status: ${diagramInteraction.snapState.label}.`;
    setThreeDebug({
      event: 'drag-move',
      action,
      pointer: `${Math.round(event.clientX)},${Math.round(event.clientY)}`,
      delta: `${Math.round(deltaX)},${Math.round(deltaY)}`
    });
  }
  renderUI();
}

function endDiagramDrag() {
  if (diagramInteraction.activeSource === 'three' && diagramInteraction.drag) {
    threeEditStatus = '3D edit status: drag complete.';
    setThreeDebug({
      event: 'drag-end',
      action: diagramInteraction.drag.action
    });
  }
  diagramInteraction.drag = null;
  diagramInteraction.snapState = null;
}

function disengageAutoPortModeForManualEdit() {
  if (state.enclosureType !== 'ported') return;
  if (state.autoPortMode === 'manual') return;
  state.autoPortMode = 'manual';
  if (inputs.autoPortMode) inputs.autoPortMode.value = 'manual';
}

function getRouteSegmentKeys(routeData) {
  if (!routeData || !Array.isArray(routeData.instances)) return [];
  const keys = [];
  routeData.instances.forEach((instance) => {
    const faceKey = createSegmentKey(instance.index, { kind: 'external-run', channelIndex: 0, axis: instance.normal });
    if (faceKey) keys.push(faceKey);
    if (Array.isArray(instance.segments)) {
      instance.segments.forEach((segment) => {
        if (segment && typeof segment.segmentKey === 'string' && segment.segmentKey) keys.push(segment.segmentKey);
      });
    }
  });
  return Array.from(new Set(keys));
}

function getDefaultRouteSegmentKey(routeData) {
  if (!routeData || !Array.isArray(routeData.instances) || !routeData.instances.length) return '';
  const firstInstance = routeData.instances[0];
  if (routeData.type === 'slot') {
    const preferredInternal = firstInstance.segments.find((segment) => segment.kind === 'internal-run' && typeof segment.segmentKey === 'string' && segment.segmentKey);
    if (preferredInternal) return preferredInternal.segmentKey;
  }
  const faceKey = createSegmentKey(firstInstance.index, { kind: 'external-run', channelIndex: 0, axis: firstInstance.normal });
  if (faceKey) return faceKey;
  const firstSegment = firstInstance.segments.find((segment) => typeof segment.segmentKey === 'string' && segment.segmentKey);
  return firstSegment ? firstSegment.segmentKey : '';
}

function ensureRouteSelection(routeData) {
  if (state.enclosureType !== 'ported' || !routeData) return false;
  const validKeys = getRouteSegmentKeys(routeData);
  if (!validKeys.length) return false;
  if (validKeys.includes(state.designerSelectedSegment)) return false;
  const nextKey = getDefaultRouteSegmentKey(routeData);
  if (!nextKey) return false;
  state.designerSelectedSegment = nextKey;
  if (routeData.type === 'slot' && (nextKey.includes('internal-run') || nextKey.includes('fold-connector'))) {
    state.threeCutaway = true;
    if (inputs.threeCutaway) inputs.threeCutaway.checked = true;
  }
  return true;
}

function syncThreeInteractionHint(routeData) {
  if (!outputs.threeInteractionHint) return;
  const statusText = threeEditStatus ? ` ${threeEditStatus}` : '';
  if (!state.threeLockZoom || !state.threeLockView) {
    outputs.threeInteractionHint.textContent = `3D interaction hint: lock zoom and lock view to enable 3D editing. Unlocked drag rotates the model.${statusText}`;
    return;
  }
  if (!state.threeEditMode) {
    outputs.threeInteractionHint.textContent = `3D interaction hint: enable 3D editing to drag box and port handles. View and zoom are locked.${statusText}`;
    return;
  }
  if (state.enclosureType !== 'ported' || !routeData) {
    outputs.threeInteractionHint.textContent = `3D interaction hint: editing enabled. Drag W/H/D labels or handles to resize the box; switch to Ported to edit ports.${statusText}`;
    return;
  }
  const selectedKey = state.designerSelectedSegment || getDefaultRouteSegmentKey(routeData);
  const selectedSegment = routeData.instances
    .flatMap((instance) => instance.segments || [])
    .find((segment) => segment.segmentKey === selectedKey) || null;

  if (!selectedKey) {
    outputs.threeInteractionHint.textContent = `3D interaction hint: click a port piece to select it, then drag the colored handle dots.${statusText}`;
    return;
  }

  if (routeData.type === 'round') {
    outputs.threeInteractionHint.textContent = `3D interaction hint: drag the gold dot to move the port on its face and the pink dot to change port length. The opening size is fixed.${statusText}`;
    return;
  }

  if (selectedSegment && selectedSegment.kind === 'internal-run') {
    outputs.threeInteractionHint.textContent = `3D interaction hint: drag the purple dot to change the selected folded run length. Interior view turns on automatically for internal slot edits.${statusText}`;
    return;
  }
  if (selectedSegment && selectedSegment.kind === 'fold-connector') {
    outputs.threeInteractionHint.textContent = `3D interaction hint: drag the gold dot to change fold gap and bend direction for the selected slot connector.${statusText}`;
    return;
  }
  outputs.threeInteractionHint.textContent = `3D interaction hint: drag the gold dot to move the slot mouth and the pink dot to change overall slot length.${statusText}`;
}

function bindDesignerSurface(surface, sourceName) {
  if (!surface) return;
  surface.addEventListener('mousedown', (event) => {
    const handle = event.target.closest('[data-drag-action]');
    if (!handle) return;
    const segmentKey = handle.getAttribute('data-segment-key');
    if (segmentKey) state.designerSelectedSegment = segmentKey;
    const surfaceContext = surface.__dragContext || null;
    if (surfaceContext) diagramInteraction.context = surfaceContext;
    diagramInteraction.activeSource = sourceName;
    event.preventDefault();
    beginDiagramDrag(handle.getAttribute('data-drag-action'), event, {
      handleKey: handle.getAttribute('data-handle-key') || ''
    });
  });
  surface.addEventListener('touchstart', (event) => {
    const t = event.touches && event.touches[0];
    if (!t) return;
    const handle = event.target.closest && event.target.closest('[data-drag-action]');
    if (!handle) return;
    const segmentKey = handle.getAttribute('data-segment-key');
    if (segmentKey) state.designerSelectedSegment = segmentKey;
    const surfaceContext = surface.__dragContext || null;
    if (surfaceContext) diagramInteraction.context = surfaceContext;
    diagramInteraction.activeSource = sourceName;
    event.preventDefault();
    beginDiagramDrag(handle.getAttribute('data-drag-action'), { clientX: t.clientX, clientY: t.clientY }, {
      handleKey: handle.getAttribute('data-handle-key') || ''
    });
  }, { passive: false });
  surface.addEventListener('click', (event) => {
    const segment = event.target.closest('[data-segment-key]');
    if (!segment) return;
    state.designerSelectedSegment = segment.getAttribute('data-segment-key') || '';
    persistState();
    renderUI();
  });
}

function syncStateFromInputs(changedKey) {
  state.cabinetStyle = (inputs.cabinetStyle && inputs.cabinetStyle.value === 'wedge') ? 'wedge' : 'rectangular';
  state.width = safeNumber(inputs.width.value);
  state.height = safeNumber(inputs.height.value);
  state.depth = safeNumber(inputs.depth.value);
  state.topDepth = safeNumber(inputs.topDepth && inputs.topDepth.value);
  state.bottomDepth = safeNumber(inputs.bottomDepth && inputs.bottomDepth.value);
  if (state.cabinetStyle === 'rectangular') {
    state.topDepth = state.depth;
    state.bottomDepth = state.depth;
  } else {
    state.depth = (state.topDepth + state.bottomDepth) / 2;
  }
  state.woodThickness = safeNumber(inputs.woodThickness.value);
  state.driverSize = Number.parseInt(inputs.driverSize.value, 10);
  state.driverCutout = safeNumber(inputs.driverCutout.value);
  state.driverDepth = safeNumber(inputs.driverDepth.value);
  state.mountingDepth = safeNumber(inputs.mountingDepth.value);
  state.driverDisplacement = safeNumber(inputs.driverDisplacement.value);
  state.driverCount = Math.max(1, Math.round(safeNumber(inputs.driverCount && inputs.driverCount.value)));
  state.bracingDisplacement = Math.max(0, safeNumber(inputs.bracingDisplacement && inputs.bracingDisplacement.value));
  state.portType = (inputs.portType && inputs.portType.value === 'round') ? 'round' : 'slot';
  state.slotPortWidth = safeNumber(inputs.slotPortWidth && inputs.slotPortWidth.value);
  state.slotPortHeight = safeNumber(inputs.slotPortHeight && inputs.slotPortHeight.value);
  state.slotPortLength = safeNumber(inputs.slotPortLength && inputs.slotPortLength.value);
  state.slotPortCount = Math.max(1, Math.round(safeNumber(inputs.slotPortCount && inputs.slotPortCount.value)));
  state.slotPortChannelCount = Math.max(1, Math.round(safeNumber(inputs.slotPortChannelCount && inputs.slotPortChannelCount.value)));
  state.slotPortChannelGap = Math.max(0, safeNumber(inputs.slotPortChannelGap && inputs.slotPortChannelGap.value));
  state.slotPortFoldAxis = (inputs.slotPortFoldAxis && ['auto', 'width', 'height', 'depth'].includes(inputs.slotPortFoldAxis.value))
    ? inputs.slotPortFoldAxis.value
    : 'auto';
  state.slotPortFoldDirection = (inputs.slotPortFoldDirection && ['auto', 'positive', 'negative'].includes(inputs.slotPortFoldDirection.value))
    ? inputs.slotPortFoldDirection.value
    : 'auto';
  state.slotPortLeadRunOffset = safeNumber(inputs.slotPortLeadRunOffset && inputs.slotPortLeadRunOffset.value);
  state.roundPortDiameter = safeNumber(inputs.roundPortDiameter && inputs.roundPortDiameter.value);
  state.roundPortLength = safeNumber(inputs.roundPortLength && inputs.roundPortLength.value);
  state.roundPortQuantity = Math.max(1, Math.round(safeNumber(inputs.roundPortQuantity && inputs.roundPortQuantity.value)));
  state.portMountFace = (inputs.portMountFace && ['front', 'rear', 'left', 'right', 'top', 'bottom'].includes(inputs.portMountFace.value))
    ? inputs.portMountFace.value
    : 'front';
  state.portLayout = (inputs.portLayout && ['horizontal', 'vertical'].includes(inputs.portLayout.value))
    ? inputs.portLayout.value
    : 'horizontal';
  state.portSpacing = Math.max(0, safeNumber(inputs.portSpacing && inputs.portSpacing.value));
  state.portExtensionMode = (inputs.portExtensionMode && ['internal', 'external', 'split'].includes(inputs.portExtensionMode.value))
    ? inputs.portExtensionMode.value
    : 'internal';
  state.portOffsetX = safeNumber(inputs.portOffsetX && inputs.portOffsetX.value);
  state.portOffsetY = safeNumber(inputs.portOffsetY && inputs.portOffsetY.value);
  state.portOffsetZ = safeNumber(inputs.portOffsetZ && inputs.portOffsetZ.value);
  state.threeShellOpacity = clampValue(safeNumber(inputs.threeShellOpacity && inputs.threeShellOpacity.value), 0.05, 1);
  state.threePortOpacity = clampValue(safeNumber(inputs.threePortOpacity && inputs.threePortOpacity.value), 0.05, 1);
  state.threePortWallThickness = Math.max(0.01, safeNumber(inputs.threePortWallThickness && inputs.threePortWallThickness.value));
  state.threeDepthDirection = (inputs.threeDepthDirection && ['front_to_back', 'back_to_front'].includes(inputs.threeDepthDirection.value))
    ? inputs.threeDepthDirection.value
    : 'front_to_back';
  state.threeBoxAnchor = (inputs.threeBoxAnchor && ['rear', 'center', 'front'].includes(inputs.threeBoxAnchor.value))
    ? inputs.threeBoxAnchor.value
    : 'rear';
  state.threeSubFacing = (inputs.threeSubFacing && ['rear', 'front'].includes(inputs.threeSubFacing.value))
    ? inputs.threeSubFacing.value
    : 'rear';
  state.threeCutaway = !!(inputs.threeCutaway && inputs.threeCutaway.checked);
  state.threeLockZoom = !!(inputs.threeLockZoom && inputs.threeLockZoom.checked);
  state.threeLockView = !!(inputs.threeLockView && inputs.threeLockView.checked);
  state.threeEditMode = !!(inputs.threeEditMode && inputs.threeEditMode.checked && state.threeLockZoom && state.threeLockView);
  state.threeDriverLayout = (inputs.threeDriverLayout && ['auto', 'horizontal', 'vertical'].includes(inputs.threeDriverLayout.value))
    ? inputs.threeDriverLayout.value
    : 'auto';
  state.designerMode = !!(inputs.designerMode && inputs.designerMode.checked);
  state.designerSnapIncrement = Math.max(0.01, safeNumber(inputs.designerSnapIncrement && inputs.designerSnapIncrement.value) || state.designerSnapIncrement);
  if (inputs.driverSensitivity) state.driverSensitivity = safeNumber(inputs.driverSensitivity.value);
  if (inputs.voiceCoilDiameter) state.voiceCoilDiameter = safeNumber(inputs.voiceCoilDiameter.value);
  if (inputs.enclosureType) state.enclosureType = inputs.enclosureType.value === 'ported' ? 'ported' : 'sealed';
  if (inputs.tuningFrequency) state.tuningFrequency = safeNumber(inputs.tuningFrequency.value);
  state.targetNetVolume = safeNumber(inputs.targetNetVolume.value);
  state.autoPortMode = (inputs.autoPortMode && ['manual', 'length', 'full'].includes(inputs.autoPortMode.value))
    ? inputs.autoPortMode.value
    : 'manual';
  state.autoPortAreaPerFt3 = Math.max(0.01, safeNumber(inputs.autoPortAreaPerFt3 && inputs.autoPortAreaPerFt3.value ? inputs.autoPortAreaPerFt3.value : state.autoPortAreaPerFt3));
  state.autoPortMinRoundDiameter = Math.max(0.01, safeNumber(inputs.autoPortMinRoundDiameter && inputs.autoPortMinRoundDiameter.value ? inputs.autoPortMinRoundDiameter.value : state.autoPortMinRoundDiameter));
  state.autoPortSlotAspectRatio = Math.max(0.01, safeNumber(inputs.autoPortSlotAspectRatio && inputs.autoPortSlotAspectRatio.value ? inputs.autoPortSlotAspectRatio.value : state.autoPortSlotAspectRatio));
  state.autoPortMinSlotHeight = Math.max(0.01, safeNumber(inputs.autoPortMinSlotHeight && inputs.autoPortMinSlotHeight.value ? inputs.autoPortMinSlotHeight.value : state.autoPortMinSlotHeight));
  state.autoPortMinLength = Math.max(0.01, safeNumber(inputs.autoPortMinLength && inputs.autoPortMinLength.value ? inputs.autoPortMinLength.value : state.autoPortMinLength));
  state.portTuningSpeedOfSound = Math.max(0.01, safeNumber(inputs.portTuningSpeedOfSound && inputs.portTuningSpeedOfSound.value ? inputs.portTuningSpeedOfSound.value : state.portTuningSpeedOfSound));
  state.portTuningInsideEndCorrection = Math.max(0, safeNumber(inputs.portTuningInsideEndCorrection ? inputs.portTuningInsideEndCorrection.value : state.portTuningInsideEndCorrection));
  state.portTuningOutsideEndCorrection = Math.max(0, safeNumber(inputs.portTuningOutsideEndCorrection ? inputs.portTuningOutsideEndCorrection.value : state.portTuningOutsideEndCorrection));
  state.portTuningLengthAdjustment = safeNumber(inputs.portTuningLengthAdjustment && inputs.portTuningLengthAdjustment.value);
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
  syncCabinetStyleUI();
  syncPortUI();
  syncThreeModeUI();
}

function applySuggestedDimensions() {
  // Ensure current UI selections (like suggestion mode) are reflected in state.
  syncStateFromInputs();
  applyAutoPortSizing(state);
  syncAutoPortManagedInputs();

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
      const targetGross = state.targetNetVolume + getTotalDisplacementFt3(state);
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
    if (state.cabinetStyle === 'wedge') {
      state.topDepth = suggestedInternal.depth;
      state.bottomDepth = suggestedInternal.depth;
    }
  } else {
    const t = state.woodThickness * 2;
    state.width = suggestedInternal.width + t;
    state.height = suggestedInternal.height + t;
    state.depth = suggestedInternal.depth + t;
    if (state.cabinetStyle === 'wedge') {
      state.topDepth = state.depth;
      state.bottomDepth = state.depth;
    }
  }

  if (inputs.width) inputs.width.value = state.width.toFixed(2);
  if (inputs.height) inputs.height.value = state.height.toFixed(2);
  if (inputs.depth) inputs.depth.value = state.depth.toFixed(2);
  if (inputs.topDepth) inputs.topDepth.value = state.topDepth.toFixed(2);
  if (inputs.bottomDepth) inputs.bottomDepth.value = state.bottomDepth.toFixed(2);

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

    state.cabinetStyle = merged.cabinetStyle === 'wedge' ? 'wedge' : 'rectangular';
    state.dimensionMode = merged.dimensionMode === 'internal' ? 'internal' : 'external';
    state.width = safeNumber(merged.width);
    state.height = safeNumber(merged.height);
    state.depth = safeNumber(merged.depth);
    state.topDepth = safeNumber(merged.topDepth) || state.topDepth;
    state.bottomDepth = safeNumber(merged.bottomDepth) || state.bottomDepth;
    state.woodThickness = safeNumber(merged.woodThickness);
    state.driverSize = Number.parseInt(merged.driverSize, 10) || 12;
    state.driverCutout = safeNumber(merged.driverCutout);
    state.mountingDepth = safeNumber(merged.mountingDepth);
    state.driverDisplacement = safeNumber(merged.driverDisplacement);
    state.driverCount = Math.max(1, Math.round(safeNumber(merged.driverCount) || 1));
    state.bracingDisplacement = Math.max(0, safeNumber(merged.bracingDisplacement));
    state.portType = merged.portType === 'round' ? 'round' : 'slot';
    state.slotPortWidth = safeNumber(merged.slotPortWidth) || state.slotPortWidth;
    state.slotPortHeight = safeNumber(merged.slotPortHeight) || state.slotPortHeight;
    state.slotPortLength = safeNumber(merged.slotPortLength) || state.slotPortLength;
    state.slotPortCount = Math.max(1, Math.round(safeNumber(merged.slotPortCount) || 1));
    state.slotPortChannelCount = Math.max(1, Math.round(safeNumber(merged.slotPortChannelCount) || 1));
    state.slotPortChannelGap = Math.max(0, safeNumber(merged.slotPortChannelGap) || state.slotPortChannelGap);
    state.slotPortFoldAxis = ['auto', 'width', 'height', 'depth'].includes(merged.slotPortFoldAxis) ? merged.slotPortFoldAxis : 'auto';
    state.slotPortFoldDirection = ['auto', 'positive', 'negative'].includes(merged.slotPortFoldDirection) ? merged.slotPortFoldDirection : 'auto';
    state.slotPortLeadRunOffset = safeNumber(merged.slotPortLeadRunOffset);
    state.slotPortRunProfile = Array.isArray(merged.slotPortRunProfile) ? merged.slotPortRunProfile.map((value) => safeNumber(value)) : [];
    state.roundPortDiameter = safeNumber(merged.roundPortDiameter) || state.roundPortDiameter;
    state.roundPortLength = safeNumber(merged.roundPortLength) || state.roundPortLength;
    state.roundPortQuantity = Math.max(1, Math.round(safeNumber(merged.roundPortQuantity) || 1));
    state.portMountFace = ['front', 'rear', 'left', 'right', 'top', 'bottom'].includes(merged.portMountFace) ? merged.portMountFace : 'front';
    state.portLayout = ['horizontal', 'vertical'].includes(merged.portLayout) ? merged.portLayout : 'horizontal';
    state.portSpacing = Math.max(0, safeNumber(merged.portSpacing));
    state.portExtensionMode = ['internal', 'external', 'split'].includes(merged.portExtensionMode) ? merged.portExtensionMode : 'internal';
    state.portOffsetX = safeNumber(merged.portOffsetX);
    state.portOffsetY = safeNumber(merged.portOffsetY);
    state.portOffsetZ = safeNumber(merged.portOffsetZ);
    state.threeShellOpacity = clampValue(safeNumber(merged.threeShellOpacity) || state.threeShellOpacity, 0.05, 1);
    state.threePortOpacity = clampValue(safeNumber(merged.threePortOpacity) || state.threePortOpacity, 0.05, 1);
    state.threePortWallThickness = Math.max(0.01, safeNumber(merged.threePortWallThickness) || state.threePortWallThickness);
    state.threeDepthDirection = ['front_to_back', 'back_to_front'].includes(merged.threeDepthDirection) ? merged.threeDepthDirection : 'front_to_back';
    state.threeBoxAnchor = ['rear', 'center', 'front'].includes(merged.threeBoxAnchor) ? merged.threeBoxAnchor : 'front';
    state.threeSubFacing = ['rear', 'front'].includes(merged.threeSubFacing) ? merged.threeSubFacing : 'rear';
    state.threeCutaway = merged.threeCutaway !== false;
    state.threeLockZoom = merged.threeLockZoom === true;
    state.threeLockView = merged.threeLockView === true;
    state.threeEditMode = merged.threeEditMode === true && state.threeLockZoom && state.threeLockView;
    state.threeDriverLayout = ['auto', 'horizontal', 'vertical'].includes(merged.threeDriverLayout) ? merged.threeDriverLayout : 'auto';
    state.designerMode = true;
    state.designerSnapIncrement = Math.max(0.01, safeNumber(merged.designerSnapIncrement) || state.designerSnapIncrement);
    state.designerSelectedSegment = typeof merged.designerSelectedSegment === 'string' ? merged.designerSelectedSegment : '';
    if (state.cabinetStyle === 'rectangular') {
      state.topDepth = state.depth;
      state.bottomDepth = state.depth;
    } else if (!(state.topDepth > 0 && state.bottomDepth > 0)) {
      state.topDepth = Math.max(0, state.depth - 1);
      state.bottomDepth = Math.max(0, state.depth + 1);
    }
    state.targetNetVolume = safeNumber(merged.targetNetVolume) || 1.25;
    state.autoPortMode = ['manual', 'length', 'full'].includes(merged.autoPortMode) ? merged.autoPortMode : 'full';
    state.autoPortAreaPerFt3 = Math.max(0.01, merged.autoPortAreaPerFt3 !== undefined ? safeNumber(merged.autoPortAreaPerFt3) : state.autoPortAreaPerFt3);
    state.autoPortMinRoundDiameter = Math.max(0.01, merged.autoPortMinRoundDiameter !== undefined ? safeNumber(merged.autoPortMinRoundDiameter) : state.autoPortMinRoundDiameter);
    state.autoPortSlotAspectRatio = Math.max(0.01, merged.autoPortSlotAspectRatio !== undefined ? safeNumber(merged.autoPortSlotAspectRatio) : state.autoPortSlotAspectRatio);
    state.autoPortMinSlotHeight = Math.max(0.01, merged.autoPortMinSlotHeight !== undefined ? safeNumber(merged.autoPortMinSlotHeight) : state.autoPortMinSlotHeight);
    state.autoPortMinLength = Math.max(0.01, merged.autoPortMinLength !== undefined ? safeNumber(merged.autoPortMinLength) : state.autoPortMinLength);
    state.portTuningSpeedOfSound = Math.max(0.01, merged.portTuningSpeedOfSound !== undefined ? safeNumber(merged.portTuningSpeedOfSound) : state.portTuningSpeedOfSound);
    state.portTuningInsideEndCorrection = Math.max(0, merged.portTuningInsideEndCorrection !== undefined ? safeNumber(merged.portTuningInsideEndCorrection) : state.portTuningInsideEndCorrection);
    state.portTuningOutsideEndCorrection = Math.max(0, merged.portTuningOutsideEndCorrection !== undefined ? safeNumber(merged.portTuningOutsideEndCorrection) : state.portTuningOutsideEndCorrection);
    state.portTuningLengthAdjustment = safeNumber(merged.portTuningLengthAdjustment);
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
  if (inputs.cabinetStyle) inputs.cabinetStyle.value = state.cabinetStyle;
  if (inputs.width) inputs.width.value = state.width;
  if (inputs.height) inputs.height.value = state.height;
  if (inputs.depth) inputs.depth.value = state.depth;
  if (inputs.topDepth) inputs.topDepth.value = state.topDepth;
  if (inputs.bottomDepth) inputs.bottomDepth.value = state.bottomDepth;
  if (inputs.woodThickness) inputs.woodThickness.value = state.woodThickness;
  if (inputs.driverSize) inputs.driverSize.value = String(state.driverSize);
  if (inputs.driverCutout) inputs.driverCutout.value = state.driverCutout;
  if (inputs.driverDepth) inputs.driverDepth.value = state.driverDepth;
  if (inputs.mountingDepth) inputs.mountingDepth.value = state.mountingDepth;
  if (inputs.driverDisplacement) inputs.driverDisplacement.value = state.driverDisplacement;
  if (inputs.driverCount) inputs.driverCount.value = state.driverCount;
  if (inputs.bracingDisplacement) inputs.bracingDisplacement.value = state.bracingDisplacement;
  if (inputs.portType) inputs.portType.value = state.portType;
  if (inputs.slotPortWidth) inputs.slotPortWidth.value = state.slotPortWidth;
  if (inputs.slotPortHeight) inputs.slotPortHeight.value = state.slotPortHeight;
  if (inputs.slotPortLength) inputs.slotPortLength.value = state.slotPortLength;
  if (inputs.slotPortCount) inputs.slotPortCount.value = state.slotPortCount;
  if (inputs.slotPortChannelCount) inputs.slotPortChannelCount.value = state.slotPortChannelCount;
  if (inputs.slotPortChannelGap) inputs.slotPortChannelGap.value = state.slotPortChannelGap;
  if (inputs.slotPortFoldAxis) inputs.slotPortFoldAxis.value = state.slotPortFoldAxis;
  if (inputs.slotPortFoldDirection) inputs.slotPortFoldDirection.value = state.slotPortFoldDirection;
  if (inputs.slotPortLeadRunOffset) inputs.slotPortLeadRunOffset.value = state.slotPortLeadRunOffset;
  if (inputs.roundPortDiameter) inputs.roundPortDiameter.value = state.roundPortDiameter;
  if (inputs.roundPortLength) inputs.roundPortLength.value = state.roundPortLength;
  if (inputs.roundPortQuantity) inputs.roundPortQuantity.value = state.roundPortQuantity;
  if (inputs.portMountFace) inputs.portMountFace.value = state.portMountFace;
  if (inputs.portLayout) inputs.portLayout.value = state.portLayout;
  if (inputs.portSpacing) inputs.portSpacing.value = state.portSpacing;
  if (inputs.portExtensionMode) inputs.portExtensionMode.value = state.portExtensionMode;
  if (inputs.portOffsetX) inputs.portOffsetX.value = state.portOffsetX;
  if (inputs.portOffsetY) inputs.portOffsetY.value = state.portOffsetY;
  if (inputs.portOffsetZ) inputs.portOffsetZ.value = state.portOffsetZ;
  if (inputs.threeShellOpacity) inputs.threeShellOpacity.value = state.threeShellOpacity;
  if (inputs.threePortOpacity) inputs.threePortOpacity.value = state.threePortOpacity;
  if (inputs.threePortWallThickness) inputs.threePortWallThickness.value = state.threePortWallThickness;
  if (inputs.threeDepthDirection) inputs.threeDepthDirection.value = state.threeDepthDirection;
  if (inputs.threeBoxAnchor) inputs.threeBoxAnchor.value = state.threeBoxAnchor;
  if (inputs.threeSubFacing) inputs.threeSubFacing.value = state.threeSubFacing;
  if (inputs.threeCutaway) inputs.threeCutaway.checked = !!state.threeCutaway;
  if (inputs.threeLockZoom) inputs.threeLockZoom.checked = !!state.threeLockZoom;
  if (inputs.threeLockView) inputs.threeLockView.checked = !!state.threeLockView;
  if (inputs.threeEditMode) inputs.threeEditMode.checked = !!state.threeEditMode;
  if (inputs.threeDriverLayout) inputs.threeDriverLayout.value = state.threeDriverLayout;
  if (inputs.designerMode) inputs.designerMode.checked = !!state.designerMode;
  if (inputs.designerSnapIncrement) inputs.designerSnapIncrement.value = state.designerSnapIncrement;
  if (inputs.driverSensitivity) inputs.driverSensitivity.value = state.driverSensitivity;
  if (inputs.voiceCoilDiameter) inputs.voiceCoilDiameter.value = state.voiceCoilDiameter;
  if (inputs.enclosureType) inputs.enclosureType.value = state.enclosureType;
  if (inputs.tuningFrequency) inputs.tuningFrequency.value = state.tuningFrequency;
  if (inputs.targetNetVolume) inputs.targetNetVolume.value = state.targetNetVolume;
  if (inputs.autoPortMode) inputs.autoPortMode.value = state.autoPortMode;
  if (inputs.autoPortAreaPerFt3) inputs.autoPortAreaPerFt3.value = state.autoPortAreaPerFt3;
  if (inputs.autoPortMinRoundDiameter) inputs.autoPortMinRoundDiameter.value = state.autoPortMinRoundDiameter;
  if (inputs.autoPortSlotAspectRatio) inputs.autoPortSlotAspectRatio.value = state.autoPortSlotAspectRatio;
  if (inputs.autoPortMinSlotHeight) inputs.autoPortMinSlotHeight.value = state.autoPortMinSlotHeight;
  if (inputs.autoPortMinLength) inputs.autoPortMinLength.value = state.autoPortMinLength;
  if (inputs.portTuningSpeedOfSound) inputs.portTuningSpeedOfSound.value = state.portTuningSpeedOfSound;
  if (inputs.portTuningInsideEndCorrection) inputs.portTuningInsideEndCorrection.value = state.portTuningInsideEndCorrection;
  if (inputs.portTuningOutsideEndCorrection) inputs.portTuningOutsideEndCorrection.value = state.portTuningOutsideEndCorrection;
  if (inputs.portTuningLengthAdjustment) inputs.portTuningLengthAdjustment.value = state.portTuningLengthAdjustment;
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
  syncCabinetStyleUI();
  syncPortUI();
  syncThreeModeUI();
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
    if (state.cabinetStyle === 'wedge') {
      state.topDepth = d;
      state.bottomDepth = d;
      if (inputs.topDepth) inputs.topDepth.value = d.toFixed(2);
      if (inputs.bottomDepth) inputs.bottomDepth.value = d.toFixed(2);
    }
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

  if (outputs.diagram) {
    bindDesignerSurface(outputs.diagram, 'isometric');
    bindDesignerSurface(outputs.designerFrontView, 'front');
    bindDesignerSurface(outputs.designerSideView, 'side');
    bindDesignerSurface(outputs.designerTopView, 'top');
    window.addEventListener('mousemove', (event) => {
      if (!diagramInteraction.drag) return;
      updateDiagramDrag(event);
    });
    window.addEventListener('mouseup', () => {
      if (!diagramInteraction.drag) return;
      endDiagramDrag();
    });
    window.addEventListener('touchmove', (event) => {
      if (!diagramInteraction.drag) return;
      const t = event.touches && event.touches[0];
      if (!t) return;
      event.preventDefault();
      updateDiagramDrag({ clientX: t.clientX, clientY: t.clientY });
    }, { passive: false });
    window.addEventListener('touchend', () => {
      if (!diagramInteraction.drag) return;
      endDiagramDrag();
    });
  }

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

  document.querySelectorAll('[data-three-view]').forEach((button) => {
    button.addEventListener('click', () => {
      setThreeViewPreset(button.getAttribute('data-three-view') || 'iso');
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
