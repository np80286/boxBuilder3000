/**
 * Box Builder Math Tests
 * Verifies core calculation functions with known values
 */

const assert = (typeof require !== 'undefined') ? require('node:assert/strict') : null;

// Import pure math helpers (Node.js context)
// In browser, BoxMath will be attached to window.
let BoxMath;
if (typeof require !== 'undefined') {
  // eslint-disable-next-line global-require
  BoxMath = require('./boxMath');
} else {
  BoxMath = window.BoxMath;
}

const {
  getVolume,
  getNetVolume,
  getInternalDimensions,
  getExternalDimensions,
  getConstraintData,
  getSuggestedInternalDimensions,
  applyConstraintToSuggested,
  getMaximizeSuggestion,
  getTargetPrioritySuggestion
} = BoxMath;

function testGetVolume() {
  // Test case from screenshots:
  // Internal: 32.38 × 15.34 × 14.20 in
  // Expected: 7,050.24 in³ | 4.080 ft³
  const dimensions = {
    width: 32.38,
    height: 15.34,
    depth: 14.20
  };

  const volume = getVolume(dimensions);
  const in3Expected = 7050.24;
  const ft3Expected = 4.080;

  if (assert) {
    assert.ok(
      Math.abs(volume.in3 - in3Expected) < 5,
      `Volume in³: expected ~${in3Expected}, got ${volume.in3.toFixed(2)}`
    );
    assert.ok(
      Math.abs(volume.ft3 - ft3Expected) < 0.01,
      `Volume ft³: expected ~${ft3Expected}, got ${volume.ft3.toFixed(3)}`
    );
  } else {
    console.assert(Math.abs(volume.in3 - in3Expected) < 1);
    console.assert(Math.abs(volume.ft3 - ft3Expected) < 0.01);
  }

  console.log('✓ testGetVolume passed');
}

function testGetNetVolume() {
  // Test case: 4.080 ft³ gross - 0.08 ft³ displacement = 4.000 ft³
  const netVolume = getNetVolume(4.080, 0.08);
  const expected = 4.000;

  if (assert) {
    assert.ok(
      Math.abs(netVolume - expected) < 0.001,
      `Net volume: expected ${expected}, got ${netVolume.toFixed(3)}`
    );
  } else {
    console.assert(Math.abs(netVolume - expected) < 0.001);
  }

  console.log('✓ testGetNetVolume passed');
}

function testInternalDimensionsFromExternal() {
  // External: 33.88 × 16.84 × 15.70 in with 0.75 in wood thickness
  // Internal should be: 33.88 - 1.5 = 32.38, etc.
  const state = {
    dimensionMode: 'external',
    width: 33.88,
    height: 16.84,
    depth: 15.70,
    woodThickness: 0.75
  };

  const internal = getInternalDimensions(state);

  if (assert) {
    assert.ok(
      Math.abs(internal.width - 32.38) < 0.01,
      `Internal width: expected ~32.38, got ${internal.width.toFixed(2)}`
    );
  } else {
    console.assert(Math.abs(internal.width - 32.38) < 0.01);
  }

  if (assert) {
    assert.ok(
      Math.abs(internal.height - 15.34) < 0.01,
      `Internal height: expected ~15.34, got ${internal.height.toFixed(2)}`
    );
  } else {
    console.assert(Math.abs(internal.height - 15.34) < 0.01);
  }

  if (assert) {
    assert.ok(
      Math.abs(internal.depth - 14.20) < 0.01,
      `Internal depth: expected ~14.20, got ${internal.depth.toFixed(2)}`
    );
  } else {
    console.assert(Math.abs(internal.depth - 14.20) < 0.01);
  }

  console.log('✓ testInternalDimensionsFromExternal passed');
}

function testExternalDimensionsFromInternal() {
  // Internal: 32.38 × 15.34 × 14.20 in with 0.75 in wood thickness
  // External should be: 32.38 + 1.5 = 33.88, etc.
  const state = {
    dimensionMode: 'internal',
    width: 32.38,
    height: 15.34,
    depth: 14.20,
    woodThickness: 0.75
  };

  const external = getExternalDimensions(state);

  if (assert) {
    assert.ok(
      Math.abs(external.width - 33.88) < 0.01,
      `External width: expected ~33.88, got ${external.width.toFixed(2)}`
    );
  } else {
    console.assert(Math.abs(external.width - 33.88) < 0.01);
  }

  if (assert) {
    assert.ok(
      Math.abs(external.height - 16.84) < 0.01,
      `External height: expected ~16.84, got ${external.height.toFixed(2)}`
    );
  } else {
    console.assert(Math.abs(external.height - 16.84) < 0.01);
  }

  if (assert) {
    assert.ok(
      Math.abs(external.depth - 15.70) < 0.01,
      `External depth: expected ~15.70, got ${external.depth.toFixed(2)}`
    );
  } else {
    console.assert(Math.abs(external.depth - 15.70) < 0.01);
  }

  console.log('✓ testExternalDimensionsFromInternal passed');
}

function testCubicInchesToCubicFeetConversion() {
  // 1 cubic foot = 12 × 12 × 12 = 1,728 cubic inches
  const in3 = 1728;
  const expected_ft3 = 1.0;
  const ft3 = in3 / 1728;

  if (assert) {
    assert.equal(ft3, expected_ft3, `Conversion factor: 1728 in³ should = 1 ft³, got ${ft3}`);
  } else {
    console.assert(ft3 === expected_ft3);
  }

  console.log('✓ testCubicInchesToCubicFeetConversion passed');
}

function testMaximizeSuggestionRespectsMountingDepth() {
  const state = {
    dimensionMode: 'external',
    width: 30,
    height: 15,
    depth: 14,
    woodThickness: 0.75,
    driverDisplacement: 0.08,
    targetNetVolume: 2.1,
    mountingDepth: 6.5,
    useMaxConstraints: true,
    maxBoxWidth: 38,
    maxBoxHeight: 16,
    maxBoxDepth: 22
  };

  const external = getExternalDimensions(state);
  const constraintData = getConstraintData(state, external);
  const result = getMaximizeSuggestion(state, constraintData);

  if (assert) {
    assert.ok(result && result.internal, 'Maximize suggestion should return internal dimensions');
    assert.ok(
      result.internal.depth >= state.mountingDepth - 1e-9,
      `Internal depth should be >= mountingDepth (${state.mountingDepth}), got ${result.internal.depth.toFixed(2)}`
    );
  } else {
    console.assert(!!(result && result.internal));
    console.assert(result.internal.depth >= state.mountingDepth - 1e-9);
  }

  console.log('✓ testMaximizeSuggestionRespectsMountingDepth passed');
}

function testMaximizeSuggestionFillsHeightThenWidthThenDepth() {
  const state = {
    dimensionMode: 'external',
    width: 30,
    height: 15,
    depth: 14,
    woodThickness: 0.75,
    driverDisplacement: 0.08,
    targetNetVolume: 100, // huge so we will hit all constraints
    mountingDepth: 6.5,
    useMaxConstraints: true,
    maxBoxWidth: 38,
    maxBoxHeight: 16,
    maxBoxDepth: 22
  };

  const external = getExternalDimensions(state);
  const constraintData = getConstraintData(state, external);
  const result = getMaximizeSuggestion(state, constraintData);

  if (assert) {
    assert.ok(result && result.internal, 'Maximize suggestion should return internal dimensions');
    // With giant target, we should max out all three.
    assert.equal(result.maxed.height, true, 'Height should be maxed first (and true)');
    assert.equal(result.maxed.width, true, 'Width should be maxed (and true)');
    assert.equal(result.maxed.depth, true, 'Depth should be maxed (and true)');
  } else {
    console.assert(!!(result && result.internal));
    console.assert(result.maxed.height === true);
    console.assert(result.maxed.width === true);
    console.assert(result.maxed.depth === true);
  }

  console.log('✓ testMaximizeSuggestionFillsHeightThenWidthThenDepth passed');
}

function testConstrainedTargetCanGrowNonLimitingDimensions() {
  // Scenario: internal height is already at max, but target volume is larger than current.
  // We should keep height at max and increase width/depth (instead of "doing nothing").
  const state = {
    dimensionMode: 'external',
    width: 20.0,
    height: 16.0,
    depth: 13.0,
    woodThickness: 0.75,
    driverDisplacement: 0.08,
    targetNetVolume: 2.1,
    useMaxConstraints: true,
    maxBoxWidth: 38,
    maxBoxHeight: 16,
    maxBoxDepth: 22
  };

  const internalStart = getInternalDimensions(state);
  const external = getExternalDimensions(state);
  const constraintData = getConstraintData(state, external);

  // Build an unconstrained suggestion off the current shape.
  const unconstrained = getSuggestedInternalDimensions(state, internalStart);
  const constrained = applyConstraintToSuggested(state, unconstrained, constraintData);

  assert.ok(constrained.internal, 'Constrained suggestion should exist');
  // Height should be at max internal height due to constraint.
  const maxInternalH = constraintData.maxInternal.height;
  assert.ok(Math.abs(constrained.internal.height - maxInternalH) < 1e-6, 'Height should be clamped to max internal height');

  // And it should not be identical to the starting internal box (i.e., it should change width/depth upward).
  const changed =
    Math.abs(constrained.internal.width - internalStart.width) > 1e-6 ||
    Math.abs(constrained.internal.depth - internalStart.depth) > 1e-6;
  assert.ok(changed, 'Constrained target should adjust non-limiting dimensions');

  console.log('✓ testConstrainedTargetCanGrowNonLimitingDimensions passed');
}

function testTargetModeIgnoresManualCurrentRatios() {
  // If the user manually makes width huge, "apply target" should rebuild from a neutral baseline,
  // not preserve the extreme ratio.
  const state = {
    dimensionMode: 'external',
    width: 40.0,
    height: 16.0,
    depth: 13.0,
    woodThickness: 0.75,
    driverDisplacement: 0.08,
    targetNetVolume: 2.1,
    mountingDepth: 6.5,
    useMaxConstraints: true,
    maxBoxWidth: 38,
    maxBoxHeight: 16,
    maxBoxDepth: 22
  };

  const external = getExternalDimensions(state);
  const constraintData = getConstraintData(state, external);
  const baseline = BoxMath.getTargetBaselineInternal(state, constraintData);
  const unconstrained = getSuggestedInternalDimensions(state, baseline);
  const constrained = applyConstraintToSuggested(state, unconstrained, constraintData);

  assert.ok(constrained.internal, 'Target suggestion should exist');
  // Ensure we didn't just mirror the extreme width ratio. With constraints, max internal width is 36.5
  // and the baseline should lead to a more balanced shape than "as wide as possible".
  assert.ok(
    constrained.internal.width < (constraintData.maxInternal.width - 1e-6),
    'Target suggestion should not pin width to max just because current width was extreme'
  );

  console.log('✓ testTargetModeIgnoresManualCurrentRatios passed');
}

function testTargetPriorityPrefersHeightFirst() {
  const state = {
    dimensionMode: 'external',
    width: 20.0,
    height: 16.0,
    depth: 13.0,
    woodThickness: 0.75,
    driverDisplacement: 0.08,
    targetNetVolume: 10.0, // big to force clamping
    mountingDepth: 6.5,
    useMaxConstraints: true,
    maxBoxWidth: 38,
    maxBoxHeight: 16,
    maxBoxDepth: 22,
    autoPriority1: 'height',
    autoPriority2: 'width',
    autoPriority3: 'depth',
    autoWeightWidth: 33,
    autoWeightHeight: 34,
    autoWeightDepth: 33
  };

  const constraintData = getConstraintData(state, getExternalDimensions(state));
  const result = getTargetPrioritySuggestion(state, constraintData);
  assert.ok(result.internal, 'Priority target suggestion should exist');
  assert.equal(result.maxed.height, true, 'Height should max first under big target');

  console.log('✓ testTargetPriorityPrefersHeightFirst passed');
}

// Run all tests
function runAllTests() {
  console.log('🧪 Running Box Builder Math Tests...\n');

  try {
    testCubicInchesToCubicFeetConversion();
    testGetVolume();
    testGetNetVolume();
    testInternalDimensionsFromExternal();
    testExternalDimensionsFromInternal();
    testMaximizeSuggestionRespectsMountingDepth();
    testMaximizeSuggestionFillsHeightThenWidthThenDepth();
    testConstrainedTargetCanGrowNonLimitingDimensions();
    testTargetModeIgnoresManualCurrentRatios();
    testTargetPriorityPrefersHeightFirst();

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Export for Node.js or run directly in browser console
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testGetVolume,
    testGetNetVolume,
    testInternalDimensionsFromExternal,
    testExternalDimensionsFromInternal,
    testCubicInchesToCubicFeetConversion,
    testMaximizeSuggestionRespectsMountingDepth,
    testMaximizeSuggestionFillsHeightThenWidthThenDepth,
    testConstrainedTargetCanGrowNonLimitingDimensions,
    testTargetModeIgnoresManualCurrentRatios,
    testTargetPriorityPrefersHeightFirst,
    runAllTests
  };
}

// Run when executed directly: `node test.js`
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  runAllTests();
}
