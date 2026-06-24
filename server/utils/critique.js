function normalizeTopic(topic = "") {
  return String(topic || "").toLowerCase();
}

function buildFallbackEvaluation(answer, confidence = "medium", topic = "") {
  const trimmed = (answer || "").trim();
  const length = trimmed.length;
  const baseScore = length > 80 ? 7 : length > 30 ? 5 : 3;
  const confidenceAdjust = confidence === "high" ? -1 : confidence === "low" ? 1 : 0;
  const qualityScore = Math.min(10, Math.max(2, baseScore + confidenceAdjust));

  const topicText = normalizeTopic(topic);

  if (topicText.includes("tree")) {
    return {
      critique: `Your answer touches the tree idea, but it still needs a clearer structure. Explain the root, the branches, and the relationship between them so the reasoning feels connected rather than generic.`,
      qualityScore,
    };
  }

  if (topicText.includes("recurs")) {
    return {
      critique: `Your recursion answer is close, but it needs a sharper explanation of the base case and the recursive step. Show how the problem shrinks and how the process eventually terminates.`,
      qualityScore,
    };
  }

  if (topicText.includes("quantum")) {
    return {
      critique: `Your quantum explanation is still too vague for the complexity of the topic. Focus on the mechanism, the observable effect, and the reason the idea behaves differently from classical intuition.`,
      qualityScore,
    };
  }

  if (topicText.includes("photo")) {
    return {
      critique: `Your explanation should connect the process more clearly to energy transfer. Describe how light is used, what is produced, and how the system transforms energy step by step.`,
      qualityScore,
    };
  }

  const critique = confidence === "high"
    ? `Your answer is too confident for the strength of the reasoning. Narrow the claim, add a concrete example, and explain how the idea works step by step.`
    : confidence === "low"
      ? `Your caution is understandable, but the explanation is still too vague. Make the reasoning more specific and support it with a concrete example or mechanism.`
      : `The answer is directionally reasonable, but it is still too general. Tighten the logic, explain the mechanism clearly, and support it with a concrete example.`;

  return { critique, qualityScore };
}

module.exports = { buildFallbackEvaluation }; 
