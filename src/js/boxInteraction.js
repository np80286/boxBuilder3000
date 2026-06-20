/* eslint-disable no-restricted-globals */

function createInteraction(deps) {
  const {
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
    setThreeEditStatus,
    getRender3dApi
  } = deps;

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

  function disengageAutoPortModeForManualEdit() {
    if (state.enclosureType !== 'ported') return;
    if (state.autoPortMode === 'manual') return;
    state.autoPortMode = 'manual';
    if (inputs.autoPortMode) inputs.autoPortMode.value = 'manual';
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
      setThreeEditStatus(`3D edit status: ${diagramInteraction.snapState.label}.`);
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
      setThreeEditStatus('3D edit status: drag complete.');
      setThreeDebug({
        event: 'drag-end',
        action: diagramInteraction.drag.action
      });
    }
    diagramInteraction.drag = null;
    diagramInteraction.snapState = null;
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

  return {
    beginDiagramDrag,
    updateDiagramDrag,
    endDiagramDrag,
    disengageAutoPortModeForManualEdit,
    getRouteSegmentKeys,
    getDefaultRouteSegmentKey,
    ensureRouteSelection
  };
}

const boxInteractionApi = { createInteraction };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = boxInteractionApi;
} else if (typeof window !== 'undefined') {
  window.BoxInteraction = boxInteractionApi;
}
