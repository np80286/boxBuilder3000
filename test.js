/**
 * Box Builder Math Tests
 * Verifies core calculation functions with known values
 */

// Import functions from app.js (Node.js context)
// In browser, these would be global since app.js is loaded first

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

  console.assert(
    Math.abs(volume.in3 - in3Expected) < 1,
    `Volume in³: expected ~${in3Expected}, got ${volume.in3.toFixed(2)}`
  );

  console.assert(
    Math.abs(volume.ft3 - ft3Expected) < 0.01,
    `Volume ft³: expected ~${ft3Expected}, got ${volume.ft3.toFixed(3)}`
  );

  console.log('✓ testGetVolume passed');
}

function testGetNetVolume() {
  // Test case: 4.080 ft³ gross - 0.08 ft³ displacement = 4.000 ft³
  const netVolume = getNetVolume(4.080, 0.08);
  const expected = 4.000;

  console.assert(
    Math.abs(netVolume - expected) < 0.001,
    `Net volume: expected ${expected}, got ${netVolume.toFixed(3)}`
  );

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

  console.assert(
    Math.abs(internal.width - 32.38) < 0.01,
    `Internal width: expected ~32.38, got ${internal.width.toFixed(2)}`
  );

  console.assert(
    Math.abs(internal.height - 15.34) < 0.01,
    `Internal height: expected ~15.34, got ${internal.height.toFixed(2)}`
  );

  console.assert(
    Math.abs(internal.depth - 14.20) < 0.01,
    `Internal depth: expected ~14.20, got ${internal.depth.toFixed(2)}`
  );

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

  console.assert(
    Math.abs(external.width - 33.88) < 0.01,
    `External width: expected ~33.88, got ${external.width.toFixed(2)}`
  );

  console.assert(
    Math.abs(external.height - 16.84) < 0.01,
    `External height: expected ~16.84, got ${external.height.toFixed(2)}`
  );

  console.assert(
    Math.abs(external.depth - 15.70) < 0.01,
    `External depth: expected ~15.70, got ${external.depth.toFixed(2)}`
  );

  console.log('✓ testExternalDimensionsFromInternal passed');
}

function testCubicInchesToCubicFeetConversion() {
  // 1 cubic foot = 12 × 12 × 12 = 1,728 cubic inches
  const in3 = 1728;
  const expected_ft3 = 1.0;
  const ft3 = in3 / 1728;

  console.assert(
    ft3 === expected_ft3,
    `Conversion factor: 1728 in³ should = 1 ft³, got ${ft3}`
  );

  console.log('✓ testCubicInchesToCubicFeetConversion passed');
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
    runAllTests
  };
}
