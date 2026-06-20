/* eslint-disable no-restricted-globals */

function createRender3d(deps) {
  const {
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
  } = deps;

  let threeCtx = null;
  let threeLoadStarted = false;
  let threeEditStatus = '';
  let threeDebugState = {
    event: 'idle',
    editMode: false,
    action: '-',
    pointer: '-',
    delta: '-',
    dimensions: '-'
  };

  function setEditStatus(status) {
    threeEditStatus = String(status || '');
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

  function syncThreeInteractionHint(routeData) {
    if (!outputs.threeInteractionHint) return;
    const statusText = threeEditStatus ? ` ${threeEditStatus}` : '';
    if (isCompactViewport()) {
      outputs.threeInteractionHint.textContent = `3D tip: compact screens are best for viewing and quick checks. Use desktop for the most reliable 3D editing.${statusText}`;
      return;
    }
    if (!state.threeLockZoom || !state.threeLockView) {
      outputs.threeInteractionHint.textContent = `3D tip: unlocked drag rotates the model. Lock zoom and lock view only when you want direct 3D editing.${statusText}`;
      return;
    }
    if (!state.threeEditMode) {
      outputs.threeInteractionHint.textContent = `3D tip: view and zoom are locked. Turn on 3D drag editing only if you want to move box or port handles here.${statusText}`;
      return;
    }
    if (state.enclosureType !== 'ported' || !routeData) {
      outputs.threeInteractionHint.textContent = `3D tip: drag W/H/D labels or handles to resize the box. Switch to Ported if you also want port editing here.${statusText}`;
      return;
    }
    const selectedKey = state.designerSelectedSegment || getDefaultRouteSegmentKey(routeData);
    const selectedSegment = routeData.instances
      .flatMap((instance) => instance.segments || [])
      .find((segment) => segment.segmentKey === selectedKey) || null;

    if (!selectedKey) {
      outputs.threeInteractionHint.textContent = `3D tip: click a port piece to select it, then drag the colored handle dots.${statusText}`;
      return;
    }

    if (routeData.type === 'round') {
      outputs.threeInteractionHint.textContent = `3D tip: drag the gold dot to move the port on its face and the pink dot to change port length. The opening size stays fixed.${statusText}`;
      return;
    }

    if (selectedSegment && selectedSegment.kind === 'internal-run') {
      outputs.threeInteractionHint.textContent = `3D tip: drag the purple dot to change the selected folded run length. Interior view turns on automatically for internal slot edits.${statusText}`;
      return;
    }
    if (selectedSegment && selectedSegment.kind === 'fold-connector') {
      outputs.threeInteractionHint.textContent = `3D tip: drag the gold dot to change fold gap and bend direction for the selected slot connector.${statusText}`;
      return;
    }
    outputs.threeInteractionHint.textContent = `3D tip: drag the gold dot to move the slot mouth and the pink dot to change overall slot length.${statusText}`;
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
            isSelected ? portMaterial.clone() : portMaterial
          );
          if (isSelected) portMesh.material.color.setHex(0xff7fa8);
          portMesh.userData.segmentKey = segmentKey;
          portMesh.userData.dragAction = 'three-port-length';
          portMesh.userData.worldCenter = { x: instance.center.x, y: instance.center.y, z: instance.center.z };
          portMesh.userData.axisVector = axisVector;
          portMesh.position.set(instance.center.x, instance.center.y, instance.center.z);
          portMesh.quaternion.setFromUnitVectors(new window.THREE.Vector3(0, 1, 0), axisThree);
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
            const slotDims = { x: segment.size.x, y: segment.size.y, z: segment.size.z };
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
            new window.THREE.PlaneGeometry(Math.max(0.05, instance.openingA), Math.max(0.05, instance.openingB)),
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
      const trunkFrontZ = -rearSign * (trunkD * 0.5 - 0.35);
      const trunkRearZ = rearSign * (trunkD * 0.5 - 0.35);
      addThreeLabel(ctx, 'BACK OF REAR SEATS', 0, trunkH + 1.1, trunkFrontZ, 0xff8a8a);
      addThreeLabel(ctx, 'REAR HATCH MAX', 0, trunkH + 1.1, trunkRearZ, 0x7bffd1);
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

  return {
    ensureThree,
    setThreeDebug,
    renderThreeDebug,
    renderThreePreview,
    setThreeViewPreset,
    syncThreeInteractionHint,
    setEditStatus,
    formatThreeDragAction
  };
}

const boxRender3dApi = { createRender3d };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = boxRender3dApi;
} else if (typeof window !== 'undefined') {
  window.BoxRender3D = boxRender3dApi;
}
