import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoadClearance } from './road-clearance.js';

test('canopies avoid neighboring hairpin legs despite differing elevations', () => {
  const overlaps = createRoadClearance([
    { x: -100, y: 0, z: 0 }, { x: 100, y: 0, z: 0 },
    { x: 100, y: 15, z: 40 }, { x: -100, y: 15, z: 40 }
  ]);
  assert.equal(overlaps({ x: 0, y: 0, z: 28 }, 5), true);
  assert.equal(overlaps({ x: 0, y: 0, z: 20 }, 5), false);
  assert.equal(overlaps({ x: 0, y: 0, z: 28 }, 2), false);
});

test('clearance checks segment interiors and negative spatial cells', () => {
  const overlaps = createRoadClearance([{ x: -100, z: -40 }, { x: 100, z: -40 }]);
  assert.equal(overlaps({ x: -20, z: -30 }, 4), true);
  assert.equal(overlaps({ x: -20, z: -20 }, 4), false);
  assert.equal(overlaps({ x: 110, z: -40 }, 4), true);
  assert.equal(overlaps({ x: 120, z: -40 }, 4), false);
});
