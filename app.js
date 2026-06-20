const BUILD_ID = 'v1.0.0-2026-06-20-01';
const STORAGE_KEY = 'boxBuilderState.v2';
const PARTS_SPEC_STORAGE_KEY = 'boxBuilderPartsSpec.v1';
const PARSED_STORAGE_KEY = 'boxBuilderParsedPreview.v1';

const DEFAULT_PARTS_SPEC = `Sealed Volume\t2.1ft³
Sealed F3\t42Hz
Vented Volume\t6ft³
Vented F3\t23Hz`;

const {
  isCompactViewport,
  updateAdvancedSummaryChips: updateAdvancedSummaryChipsUI,
  applyResponsivePanelDefaults: applyResponsivePanelDefaultsUI,
  renderWarnings: renderWarningsUI,
  updateSpaceInfo: updateSpaceInfoUI,
  syncCabinetStyleUI: syncCabinetStyleUIHelper,
  syncPortUI: syncPortUIHelper,
  syncThreeModeUI: syncThreeModeUIHelper,
  syncAutoPortManagedInputs: syncAutoPortManagedInputsHelper,
  parsePartsSpec,
  populateParsedPreview: populateParsedPreviewUI,
  loadPersistedPartsSpec: loadPersistedPartsSpecUI,
  persistPartsSpec: persistPartsSpecUI,
  loadPersistedParsedPreview: loadPersistedParsedPreviewUI,
  markIfModified
} = window.BoxUI;

function updateAdvancedSummaryChips() {
  if (!state || typeof state !== 'object') return;
  updateAdvancedSummaryChipsUI(state);
}

function updateSpaceInfo() {
  if (!state || typeof state !== 'object') return;
  updateSpaceInfoUI(state);
}

const validateBox = window.BoxValidation.createValidator({
  safeNumber,
  isWedge,
  getExternalDimensions,
  getOccupiedEnvelope,
  getPortAreaPerInstanceSqIn
});

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
  showUsageBtn: document.getElementById('showUsageBtn'),
  resetViewBtn: document.getElementById('resetViewBtn'),
  resetAppBtn: document.getElementById('resetAppBtn'),
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
  portModeHint: document.getElementById('portModeHint'),
  threeInteractionHint: document.getElementById('threeInteractionHint'),
  threeDebug: document.getElementById('threeDebug'),
  modeSummaryChip: document.getElementById('modeSummaryChip'),
  fitSummaryChip: document.getElementById('fitSummaryChip'),
  portStateChip: document.getElementById('portStateChip'),
  confidenceChip: document.getElementById('confidenceChip'),
  usageGuide: document.getElementById('usageGuide'),
  designerFrontView: document.getElementById('designerFrontView'),
  designerSideView: document.getElementById('designerSideView'),
  designerTopView: document.getElementById('designerTopView')
};

let diagramInteraction = {
  drag: null,
  context: null,
  snapState: null,
  activeSource: 'isometric'
};
let responsivePanelsInitialized = false;
let render2dApi = null;
let render3dApi = null;
let interactionApi = null;
let controllerApi = null;

// Helps confirm you're running the latest JS (cache busting / hard refresh).
try {
  const buildEl = document.getElementById('buildId');
  if (buildEl) buildEl.textContent = `Build: ${BUILD_ID}`;
  // eslint-disable-next-line no-console
  console.log(`BoxBuilder loaded (${BUILD_ID})`);
} catch (_) {
  // ignore
}

function applyResponsivePanelDefaults() {
  responsivePanelsInitialized = applyResponsivePanelDefaultsUI({
    responsivePanelsInitialized,
    compactViewport: isCompactViewport()
  });
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

function getRender2dApi() {
  if (render2dApi) return render2dApi;
  render2dApi = window.BoxRender2D.createRender2d({
    state,
    outputs,
    diagramInteraction,
    safeNumber,
    formatInches,
    formatDimensions,
    getVolume,
    getTotalDisplacementFt3,
    getNetVolume,
    getPortRouteData,
    getProjectedAxisVectors,
    getFaceBasis,
    normalize2DVector,
    getPortInteriorVector,
    getPortLengthHandleVector,
    axisValueToFaceNormalized,
    projectFacePoint,
    createHandleBadge,
    createHandleLabel,
    getPortFaceMoveAxes,
    getOrthographicLengthContext,
    createSegmentKey,
    persistState,
    renderUI,
    beginDiagramDrag
  });
  return render2dApi;
}

function getRender3dApi() {
  if (render3dApi) return render3dApi;
  render3dApi = window.BoxRender3D.createRender3d({
    state,
    inputs,
    outputs,
    diagramInteraction,
    safeNumber,
    clampValue,
    clamp01,
    createAxisVector,
    getExternalDimensions,
    getOccupiedEnvelope,
    getPortRouteData,
    createSegmentKey,
    getDefaultRouteSegmentKey,
    persistState,
    renderUI,
    syncStateFromInputs,
    beginDiagramDrag,
    updateDiagramDrag,
    endDiagramDrag,
    isCompactViewport
  });
  return render3dApi;
}

function getInteractionApi() {
  if (interactionApi) return interactionApi;
  interactionApi = window.BoxInteraction.createInteraction({
    state,
    inputs,
    diagramInteraction,
    safeNumber,
    clampValue,
    snapToIncrement,
    lerpPoint,
    normalizeSlotRunProfile,
    axisToFoldSetting,
    applySnapCandidates,
    createSegmentKey,
    getPortInteriorVector,
    persistState,
    renderUI,
    syncInputsFromState,
    setThreeDebug,
    setThreeEditStatus: (status) => getRender3dApi().setEditStatus(status),
    getRender3dApi
  });
  return interactionApi;
}

function getControllerApi() {
  if (controllerApi) return controllerApi;
  controllerApi = window.BoxController.createController({
    STORAGE_KEY,
    PARTS_SPEC_STORAGE_KEY,
    state,
    inputs,
    outputs,
    diagramInteraction,
    DRIVER_DEFAULTS,
    safeNumber,
    clampValue,
    syncLinkedSuggestionControlsFromState,
    syncCabinetStyleUI,
    syncPortUI,
    syncThreeModeUI,
    syncAutoPortManagedInputs,
    bindDesignerSurface,
    updateDiagramDrag,
    endDiagramDrag,
    renderUI,
    persistPartsSpec: persistPartsSpecUI,
    parsePartsSpec,
    populateParsedPreview,
    markIfModified,
    setActiveTab,
    setThreeViewPreset,
    getConstraintData,
    getExternalDimensions,
    getInternalDimensions,
    getSuggestedInternalDimensions,
    getTargetBaselineInternal,
    getTargetPrioritySuggestion,
    getMaximizeSuggestion,
    applyConstraintToSuggested,
    applyAutoPortSizing,
    getTotalDisplacementFt3,
    syncQuickInputs,
    isCompactViewport,
    updateAdvancedSummaryChips
  });
  return controllerApi;
}

function setThreeDebug(update = {}) {
  getRender3dApi().setThreeDebug(update);
}

function renderThreeDebug() {
  getRender3dApi().renderThreeDebug();
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
    return `2D layout: snapped to ${diagramInteraction.snapState.label}`;
  }
  const dragAction = diagramInteraction.drag && diagramInteraction.drag.action;
  if (dragAction === 'width') return `2D layout: width ${state.width.toFixed(2)} in`;
  if (dragAction === 'height') return `2D layout: height ${state.height.toFixed(2)} in`;
  if (dragAction === 'depth') return `2D layout: depth ${state.depth.toFixed(2)} in`;
  if (dragAction === 'port-position') {
    return `2D layout: port offsets X ${state.portOffsetX.toFixed(2)} in • Y ${state.portOffsetY.toFixed(2)} in • Z ${state.portOffsetZ.toFixed(2)} in`;
  }
  if (dragAction === 'port-length') {
    const length = state.portType === 'round' ? state.roundPortLength : state.slotPortLength;
    return `2D layout: port length ${length.toFixed(2)} in`;
  }
  if (dragAction === 'slot-fold-node') {
    return `2D layout: slot channel gap ${state.slotPortChannelGap.toFixed(2)} in • fold ${state.slotPortFoldDirection}`;
  }
  if (dragAction === 'slot-lead-run') {
    return `2D layout: slot lead run offset ${state.slotPortLeadRunOffset.toFixed(2)} in`;
  }
  if (dragAction === 'slot-run-length') {
    return '2D layout: adjusting selected folded run length';
  }
  return '2D layout: drag cyan handles for W/H/D. Green moves port center. Yellow changes port size. Orange changes port length.';
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

// Track last parsed values to allow reset vs manual edits
let lastParsed = null;

function populateParsedPreview(parsed) {
  lastParsed = parsed ? { ...parsed } : null;
  populateParsedPreviewUI(inputs, PARSED_STORAGE_KEY, parsed);
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
  renderWarningsUI(outputs, warnings);
}

function renderSVG(externalDimensions, internalDimensions) {
  getRender2dApi().renderSVG(externalDimensions, internalDimensions);
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
  getRender2dApi().renderDesignerViews(externalDimensions, routeData);
}

function renderCutSheet(externalDimensions, woodThickness) {
  getRender2dApi().renderCutSheet(externalDimensions, woodThickness, getCutSheet);
}

function renderPresetState() {
  const buttons = document.querySelectorAll('.preset-btn');
  buttons.forEach((button) => {
    const presetValue = safeNumber(button.dataset.preset);
    button.classList.toggle('active', Math.abs(presetValue - state.targetNetVolume) < 0.005);
  });
}

function syncCabinetStyleUI() {
  syncCabinetStyleUIHelper(state, inputs, safeNumber);
}

function syncPortUI() {
  syncPortUIHelper(state, inputs);
}

function syncThreeModeUI() {
  syncThreeModeUIHelper(state, inputs);
}

function syncAutoPortManagedInputs() {
  syncAutoPortManagedInputsHelper(state, inputs);
}

function ensureThree() {
  return getRender3dApi().ensureThree();
}

function setThreeViewPreset(name) {
  getRender3dApi().setThreeViewPreset(name);
}

function renderThreePreview(externalDimensions) {
  getRender3dApi().renderThreePreview(externalDimensions);
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
      warnings.push('Designer Mode currently focuses on the main box dimensions plus the first visible port handles. For precision work on complex ports, verify the numeric inputs as the source of truth.');
    }
    warnings.push('3D port pieces are clickable and share selection with the Front / Side / Top designer views.');
  }
  if (isCompactViewport()) {
    warnings.push('Compact-screen mode keeps advanced 3D and folded-slot controls collapsed by default. Desktop remains the best workflow for heavy editing.');
  }
  syncThreeModeUI();
  syncThreeInteractionHint(portPreview);
  renderThreeDebug();
  updateAdvancedSummaryChips();

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
  if (outputs.modeSummaryChip) {
    const dimensionLabel = state.dimensionMode === 'internal' ? 'Internal dims' : 'External dims';
    const cabinetLabel = state.cabinetStyle === 'wedge' ? 'Wedge' : 'Rectangular';
    const enclosureLabel = state.enclosureType === 'ported' ? 'Ported' : 'Sealed';
    outputs.modeSummaryChip.textContent = `${dimensionLabel} • ${cabinetLabel} • ${enclosureLabel}`;
  }
  if (outputs.fitSummaryChip) {
    if (state.useMaxConstraints) {
      const occupiedEnvelope = getOccupiedEnvelope(state, externalDimensions);
      const fitsConstraints =
        occupiedEnvelope.width <= Math.max(0, safeNumber(state.maxBoxWidth)) &&
        occupiedEnvelope.height <= Math.max(0, safeNumber(state.maxBoxHeight)) &&
        occupiedEnvelope.depth <= Math.max(0, safeNumber(state.maxBoxDepth));
      outputs.fitSummaryChip.textContent = fitsConstraints ? 'Within trunk limits' : 'Exceeds trunk limits';
    } else {
      outputs.fitSummaryChip.textContent = 'Trunk limits off';
    }
  }
  if (outputs.portStateChip) {
    if (state.enclosureType !== 'ported') {
      outputs.portStateChip.textContent = 'No port active';
    } else {
      const portKind = state.portType === 'round' ? 'Round port' : 'Slot port';
      const portMode = state.autoPortMode === 'manual'
        ? 'Manual sizing'
        : (state.autoPortMode === 'length' ? 'Auto length' : 'Full auto');
      outputs.portStateChip.textContent = `${portKind} • ${portMode}`;
    }
  }
  if (outputs.confidenceChip) {
    const errorCount = warnings.filter((message) => /^⚠️/.test(message)).length;
    const infoCount = warnings.filter((message) => /^ℹ️/.test(message)).length;
    if (errorCount > 0) {
      outputs.confidenceChip.textContent = `Needs review • ${errorCount} warning${errorCount === 1 ? '' : 's'}`;
    } else if (warnings.length > 0) {
      outputs.confidenceChip.textContent = `Usable with notes • ${infoCount} info`;
    } else {
      outputs.confidenceChip.textContent = 'Build checks passed';
    }
  }
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
  if (outputs.portModeHint) {
    if (state.enclosureType !== 'ported') {
      outputs.portModeHint.textContent = 'Port controls stay hidden until you switch the enclosure type to Ported.';
    } else if (state.autoPortMode === 'manual') {
      outputs.portModeHint.textContent = 'Port mode: manual sizing keeps your typed values. Use Auto Length if you want the app to keep your opening size but recalculate length.';
    } else if (state.autoPortMode === 'length') {
      outputs.portModeHint.textContent = 'Port mode: Auto Length preserves your current opening size and recalculates only port length.';
    } else {
      outputs.portModeHint.textContent = 'Port mode: Full Auto can change opening size and length. Type into a port size field any time to switch back to manual sizing.';
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
  getInteractionApi().beginDiagramDrag(action, event, metadata);
}

function updateDiagramDrag(event) {
  getInteractionApi().updateDiagramDrag(event);
}

function endDiagramDrag() {
  getInteractionApi().endDiagramDrag();
}

function disengageAutoPortModeForManualEdit() {
  getInteractionApi().disengageAutoPortModeForManualEdit();
}

function getRouteSegmentKeys(routeData) {
  return getInteractionApi().getRouteSegmentKeys(routeData);
}

function getDefaultRouteSegmentKey(routeData) {
  return getInteractionApi().getDefaultRouteSegmentKey(routeData);
}

function ensureRouteSelection(routeData) {
  return getInteractionApi().ensureRouteSelection(routeData);
}

function syncThreeInteractionHint(routeData) {
  getRender3dApi().syncThreeInteractionHint(routeData);
}

function bindDesignerSurface(surface, sourceName) {
  getRender2dApi().bindDesignerSurface(surface, sourceName);
}

function syncStateFromInputs(changedKey) {
  getControllerApi().syncStateFromInputs(changedKey);
}

function applySuggestedDimensions() {
  getControllerApi().applySuggestedDimensions();
}

function persistState() {
  getControllerApi().persistState();
}

function loadPersistedState() {
  getControllerApi().loadPersistedState();
}

function syncInputsFromState() {
  getControllerApi().syncInputsFromState();
}

function bindEvents() {
  getControllerApi().bindEvents();
}

loadPersistedState();
syncInputsFromState();
bindEvents();
setActiveTab('design');
applyResponsivePanelDefaults();
window.addEventListener('resize', () => {
  applyResponsivePanelDefaults();
  updateAdvancedSummaryChips();
});

// Seed/persist Parts Express paste + preview defaults so Apply Preview works without re-pasting.
if (inputs.partsSpecPaste) {
  const savedSpec = loadPersistedPartsSpecUI(PARTS_SPEC_STORAGE_KEY);
  if (savedSpec) {
    inputs.partsSpecPaste.value = savedSpec;
  } else {
    inputs.partsSpecPaste.value = DEFAULT_PARTS_SPEC;
    persistPartsSpecUI(PARTS_SPEC_STORAGE_KEY, DEFAULT_PARTS_SPEC);
  }
}
const savedPreview = loadPersistedParsedPreviewUI(PARSED_STORAGE_KEY);
if (savedPreview) {
  populateParsedPreview(savedPreview);
} else if (inputs.partsSpecPaste && inputs.partsSpecPaste.value) {
  const parsed = parsePartsSpec(inputs.partsSpecPaste.value);
  if (parsed) populateParsedPreview(parsed);
}

renderUI();
