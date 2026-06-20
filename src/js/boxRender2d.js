/* eslint-disable no-restricted-globals */

function createRender2d(deps) {
  const {
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
  } = deps;

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

  function renderCutSheet(externalDimensions, woodThickness, getCutSheet) {
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

  return {
    renderSVG,
    renderDesignerViews,
    renderCutSheet,
    bindDesignerSurface
  };
}

const api = { createRender2d };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else if (typeof window !== 'undefined') {
  window.BoxRender2D = api;
}
