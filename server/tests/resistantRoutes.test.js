const test = require('node:test');
const assert = require('node:assert/strict');
const { buildFallbackEvaluation, buildFallbackExplanation } = require('../utils/critique');

const sampleAnswer = 'A recursive function calls itself until it reaches a base case, then unwinds.';

test('fallback evaluation returns varied critique for recursion', () => {
  const result = buildFallbackEvaluation(sampleAnswer, 'medium', 'Recursion');
  assert.ok(result.qualityScore >= 3 && result.qualityScore <= 10);
  assert.match(result.critique.toLowerCase(), /base case|recursive step|terminates/);
});

test('scoring math produces non-uniform deltas', () => {
  const resultLow = buildFallbackEvaluation('Short answer.', 'low', 'Tree');
  const resultHigh = buildFallbackEvaluation('This is a lengthy answer that includes because, therefore, and for example to explain the mechanism in detail.', 'high', 'Quantum');
  assert.notStrictEqual(resultLow.qualityScore, resultHigh.qualityScore);
});

test('fallback explanation explains generative AI in plain language', () => {
  const explanation = buildFallbackExplanation('generative ai');
  assert.ok(explanation.length > 80);
  assert.match(explanation.toLowerCase(), /generative ai|content|patterns/);
});
