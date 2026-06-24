const test = require('node:test');
const assert = require('node:assert/strict');
const { buildFallbackEvaluation } = require('../utils/critique');

test('buildFallbackEvaluation varies feedback for tree topics', () => {
  const result = buildFallbackEvaluation('The root splits into branches and leaves.', 'medium', 'tree');
  assert.match(result.critique.toLowerCase(), /root|branch|leaf|structure/);
  assert.ok(result.qualityScore >= 3);
});

test('buildFallbackEvaluation varies feedback for recursion topics', () => {
  const result = buildFallbackEvaluation('It calls itself until it reaches a base case.', 'medium', 'recursion');
  assert.match(result.critique.toLowerCase(), /base case|recursive|call itself|termination/);
});
