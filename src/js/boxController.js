/* eslint-disable no-restricted-globals */

function createController(deps) {
  const {
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
    persistPartsSpec,
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
  } = deps;

  function persistState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function resetViewTools() {
    state.threeCutaway = true;
    state.threeLockZoom = false;
    state.threeLockView = false;
    state.threeEditMode = false;
    state.threeDriverLayout = 'auto';
    state.threeDepthDirection = 'front_to_back';
    state.threeBoxAnchor = 'front';
    state.threeSubFacing = 'rear';
    state.designerMode = true;
    state.designerSnapIncrement = 0.25;
    state.designerSelectedSegment = '';
    syncInputsFromState();
    persistState();
    renderUI();
  }

  function resetAppState() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PARTS_SPEC_STORAGE_KEY);
    state.cabinetStyle = 'rectangular';
    state.dimensionMode = 'external';
    state.width = 30;
    state.height = 15;
    state.depth = 14;
    state.topDepth = 12;
    state.bottomDepth = 16;
    state.woodThickness = 0.75;
    state.driverSize = 15;
    state.driverCutout = 11.1;
    state.driverDepth = 6.5;
    state.mountingDepth = 6.5;
    state.driverDisplacement = 0.08;
    state.driverSensitivity = 88;
    state.voiceCoilDiameter = 2.0;
    state.enclosureType = 'sealed';
    state.driverCount = 1;
    state.bracingDisplacement = 0;
    state.portType = 'slot';
    state.slotPortWidth = 12;
    state.slotPortHeight = 1.5;
    state.slotPortLength = 18;
    state.slotPortCount = 1;
    state.slotPortChannelCount = 1;
    state.slotPortChannelGap = 0.75;
    state.slotPortFoldAxis = 'auto';
    state.slotPortFoldDirection = 'auto';
    state.slotPortLeadRunOffset = 0;
    state.slotPortRunProfile = [];
    state.roundPortDiameter = 4;
    state.roundPortLength = 12;
    state.roundPortQuantity = 1;
    state.portMountFace = 'front';
    state.portLayout = 'horizontal';
    state.portSpacing = 0;
    state.portExtensionMode = 'internal';
    state.portOffsetX = 0;
    state.portOffsetY = 0;
    state.portOffsetZ = 0;
    state.threeShellOpacity = 0.24;
    state.threePortOpacity = 0.82;
    state.threePortWallThickness = 0.25;
    state.threeDepthDirection = 'front_to_back';
    state.threeBoxAnchor = 'front';
    state.threeSubFacing = 'rear';
    state.threeCutaway = true;
    state.threeLockZoom = false;
    state.threeLockView = false;
    state.threeEditMode = false;
    state.threeDriverLayout = 'auto';
    state.designerMode = true;
    state.designerSnapIncrement = 0.25;
    state.designerSelectedSegment = '';
    state.tuningFrequency = 40;
    state.targetNetVolume = 1.25;
    state.autoPortMode = 'full';
    state.autoPortAreaPerFt3 = 16;
    state.autoPortMinRoundDiameter = 4;
    state.autoPortSlotAspectRatio = 8;
    state.autoPortMinSlotHeight = 1.5;
    state.autoPortMinLength = 0.5;
    state.portTuningSpeedOfSound = 13503.9;
    state.portTuningInsideEndCorrection = 0.85;
    state.portTuningOutsideEndCorrection = 0.85;
    state.portTuningLengthAdjustment = 0;
    state.suggestionMode = 'target';
    state.autoPriority1 = 'height';
    state.autoPriority2 = 'width';
    state.autoPriority3 = 'depth';
    state.autoWeightWidth = 33;
    state.autoWeightHeight = 34;
    state.autoWeightDepth = 33;
    state.useMaxConstraints = true;
    state.maxBoxWidth = 38;
    state.maxBoxHeight = 16;
    state.maxBoxDepth = 22;
    if (inputs.partsSpecPaste) inputs.partsSpecPaste.value = '';
    syncInputsFromState();
    persistState();
    renderUI();
    syncQuickInputs(true);
  }

  function loadPersistedState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

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

  function syncStateFromInputs(changedKey) {
    const manualPortOverrideKeys = new Set([
      'roundPortDiameter',
      'roundPortLength',
      'slotPortWidth',
      'slotPortHeight',
      'slotPortLength'
    ]);
    if (
      state.enclosureType === 'ported'
      && manualPortOverrideKeys.has(changedKey)
      && state.autoPortMode !== 'manual'
    ) {
      state.autoPortMode = 'manual';
      if (inputs.autoPortMode) inputs.autoPortMode.value = 'manual';
    }

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
    state.slotPortFoldAxis = (inputs.slotPortFoldAxis && ['auto', 'width', 'height', 'depth'].includes(inputs.slotPortFoldAxis.value)) ? inputs.slotPortFoldAxis.value : 'auto';
    state.slotPortFoldDirection = (inputs.slotPortFoldDirection && ['auto', 'positive', 'negative'].includes(inputs.slotPortFoldDirection.value)) ? inputs.slotPortFoldDirection.value : 'auto';
    state.slotPortLeadRunOffset = safeNumber(inputs.slotPortLeadRunOffset && inputs.slotPortLeadRunOffset.value);
    state.roundPortDiameter = safeNumber(inputs.roundPortDiameter && inputs.roundPortDiameter.value);
    state.roundPortLength = safeNumber(inputs.roundPortLength && inputs.roundPortLength.value);
    state.roundPortQuantity = Math.max(1, Math.round(safeNumber(inputs.roundPortQuantity && inputs.roundPortQuantity.value)));
    state.portMountFace = (inputs.portMountFace && ['front', 'rear', 'left', 'right', 'top', 'bottom'].includes(inputs.portMountFace.value)) ? inputs.portMountFace.value : 'front';
    state.portLayout = (inputs.portLayout && ['horizontal', 'vertical'].includes(inputs.portLayout.value)) ? inputs.portLayout.value : 'horizontal';
    state.portSpacing = Math.max(0, safeNumber(inputs.portSpacing && inputs.portSpacing.value));
    state.portExtensionMode = (inputs.portExtensionMode && ['internal', 'external', 'split'].includes(inputs.portExtensionMode.value)) ? inputs.portExtensionMode.value : 'internal';
    state.portOffsetX = safeNumber(inputs.portOffsetX && inputs.portOffsetX.value);
    state.portOffsetY = safeNumber(inputs.portOffsetY && inputs.portOffsetY.value);
    state.portOffsetZ = safeNumber(inputs.portOffsetZ && inputs.portOffsetZ.value);
    state.threeShellOpacity = clampValue(safeNumber(inputs.threeShellOpacity && inputs.threeShellOpacity.value), 0.05, 1);
    state.threePortOpacity = clampValue(safeNumber(inputs.threePortOpacity && inputs.threePortOpacity.value), 0.05, 1);
    state.threePortWallThickness = Math.max(0.01, safeNumber(inputs.threePortWallThickness && inputs.threePortWallThickness.value));
    state.threeDepthDirection = (inputs.threeDepthDirection && ['front_to_back', 'back_to_front'].includes(inputs.threeDepthDirection.value)) ? inputs.threeDepthDirection.value : 'front_to_back';
    state.threeBoxAnchor = (inputs.threeBoxAnchor && ['rear', 'center', 'front'].includes(inputs.threeBoxAnchor.value)) ? inputs.threeBoxAnchor.value : 'rear';
    state.threeSubFacing = (inputs.threeSubFacing && ['rear', 'front'].includes(inputs.threeSubFacing.value)) ? inputs.threeSubFacing.value : 'rear';
    state.threeCutaway = !!(inputs.threeCutaway && inputs.threeCutaway.checked);
    state.threeLockZoom = !!(inputs.threeLockZoom && inputs.threeLockZoom.checked);
    state.threeLockView = !!(inputs.threeLockView && inputs.threeLockView.checked);
    state.threeEditMode = !!(inputs.threeEditMode && inputs.threeEditMode.checked && state.threeLockZoom && state.threeLockView);
    state.threeDriverLayout = (inputs.threeDriverLayout && ['auto', 'horizontal', 'vertical'].includes(inputs.threeDriverLayout.value)) ? inputs.threeDriverLayout.value : 'auto';
    state.designerMode = !!(inputs.designerMode && inputs.designerMode.checked);
    state.designerSnapIncrement = Math.max(0.01, safeNumber(inputs.designerSnapIncrement && inputs.designerSnapIncrement.value) || state.designerSnapIncrement);
    if (inputs.driverSensitivity) state.driverSensitivity = safeNumber(inputs.driverSensitivity.value);
    if (inputs.voiceCoilDiameter) state.voiceCoilDiameter = safeNumber(inputs.voiceCoilDiameter.value);
    if (inputs.enclosureType) state.enclosureType = inputs.enclosureType.value === 'ported' ? 'ported' : 'sealed';
    if (inputs.tuningFrequency) state.tuningFrequency = safeNumber(inputs.tuningFrequency.value);
    state.targetNetVolume = safeNumber(inputs.targetNetVolume.value);
    state.autoPortMode = (inputs.autoPortMode && ['manual', 'length', 'full'].includes(inputs.autoPortMode.value)) ? inputs.autoPortMode.value : 'manual';
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
    if (modeInput) state.dimensionMode = modeInput.value;

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
    syncLinkedSuggestionControlsFromState();
    if (inputs.useMaxConstraints) inputs.useMaxConstraints.checked = state.useMaxConstraints;
    if (inputs.maxBoxWidth) inputs.maxBoxWidth.value = state.maxBoxWidth;
    if (inputs.maxBoxHeight) inputs.maxBoxHeight.value = state.maxBoxHeight;
    if (inputs.maxBoxDepth) inputs.maxBoxDepth.value = state.maxBoxDepth;
    const modeSelector = `input[name="dimensionMode"][value="${state.dimensionMode}"]`;
    const modeInput = document.querySelector(modeSelector);
    if (modeInput) modeInput.checked = true;
    syncCabinetStyleUI();
    syncPortUI();
    syncThreeModeUI();
  }

  function applySuggestedDimensions() {
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
    syncQuickInputs(true);
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
      const active = document.activeElement;
      const isEditingQuick = active === inputs.quickWidth || active === inputs.quickHeight || active === inputs.quickDepth;
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
      el.addEventListener('input', applyQuick);
      el.addEventListener('change', applyQuick);
    });

    if (inputs.suggestionMode) {
      inputs.suggestionMode.addEventListener('change', () => {
        if (inputs.suggestionMode.value !== 'target') return;
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

    const sanitizePrioritySet = (a, b, c, fromQuick = false) => {
      if (!a || !b || !c) return;
      const vals = [a.value, b.value, c.value];
      const all = ['height', 'width', 'depth'];
      const used = [];
      for (const v of vals) {
        if (all.includes(v) && !used.includes(v)) used.push(v);
      }
      for (const v of all) {
        if (!used.includes(v)) used.push(v);
      }
      a.value = used[0];
      b.value = used[1];
      c.value = used[2];
      syncStateFromInputs(fromQuick ? 'quickAutoPriority1' : undefined);
      renderUI();
    };

    ['autoPriority1', 'autoPriority2', 'autoPriority3'].forEach(() => {});
    ['autoPriority1', 'autoPriority2', 'autoPriority3'].forEach((id) => {
      const el = inputs[id];
      if (!el) return;
      el.addEventListener('change', () => sanitizePrioritySet(inputs.autoPriority1, inputs.autoPriority2, inputs.autoPriority3, false));
    });
    ['quickAutoPriority1', 'quickAutoPriority2', 'quickAutoPriority3'].forEach((id) => {
      const el = inputs[id];
      if (!el) return;
      el.addEventListener('change', () => sanitizePrioritySet(inputs.quickAutoPriority1, inputs.quickAutoPriority2, inputs.quickAutoPriority3, true));
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

    if (inputs.parsePartsBtn) {
      inputs.parsePartsBtn.addEventListener('click', () => {
        const text = inputs.partsSpecPaste.value || '';
        persistPartsSpec(PARTS_SPEC_STORAGE_KEY, text);
        const parsed = parsePartsSpec(text);
        if (parsed) {
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
          persistState();
          populateParsedPreview(parsed);
          renderUI();
        }
      });

      inputs.clearPartsBtn.addEventListener('click', () => {
        inputs.partsSpecPaste.value = '';
        persistPartsSpec(PARTS_SPEC_STORAGE_KEY, '');
        populateParsedPreview(null);
      });
    }
    if (inputs.partsSpecPaste) {
      inputs.partsSpecPaste.addEventListener('input', () => {
        persistPartsSpec(PARTS_SPEC_STORAGE_KEY, inputs.partsSpecPaste.value || '');
      });
    }

    if (inputs.applyParsedBtn) {
      inputs.applyParsedBtn.addEventListener('click', () => {
        try {
          const originalLabel = inputs.applyParsedBtn.textContent;
          inputs.applyParsedBtn.textContent = 'Applied ✓';
          window.setTimeout(() => {
            inputs.applyParsedBtn.textContent = originalLabel;
          }, 650);
        } catch (_) {}

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
          state.enclosureType = 'sealed';
          applyVolume(sv, sf);
        } else if (vv > 0) {
          state.enclosureType = 'ported';
          applyVolume(vv, vf);
        }

        persistState();
        applySuggestedDimensions();
        syncInputsFromState();
        renderUI();
        syncQuickInputs(true);
      });

      if (inputs.resetParsedBtn) {
        inputs.resetParsedBtn.addEventListener('click', () => {
          populateParsedPreview(null);
        });
      }

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

    if (inputs.showUsageBtn && outputs.usageGuide) {
      inputs.showUsageBtn.addEventListener('click', () => {
        const nextHidden = !outputs.usageGuide.hidden;
        outputs.usageGuide.hidden = nextHidden;
        inputs.showUsageBtn.textContent = nextHidden ? 'How To Use' : 'Hide Guide';
      });
    }

    if (inputs.resetViewBtn) {
      inputs.resetViewBtn.addEventListener('click', () => {
        resetViewTools();
      });
    }

    if (inputs.resetAppBtn) {
      inputs.resetAppBtn.addEventListener('click', () => {
        resetAppState();
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

    window.addEventListener('resize', () => {
      if (isCompactViewport()) {
        updateAdvancedSummaryChips();
      }
    });
  }

  return {
    persistState,
    loadPersistedState,
    syncStateFromInputs,
    syncInputsFromState,
    applySuggestedDimensions,
    bindEvents,
    resetViewTools,
    resetAppState
  };
}

const boxControllerApi = { createController };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = boxControllerApi;
} else if (typeof window !== 'undefined') {
  window.BoxController = boxControllerApi;
}
