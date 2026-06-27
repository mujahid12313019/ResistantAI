function normalizeTopic(topic = "") {
  return String(topic || "").toLowerCase();
}

function countWords(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function containsKeyword(text, keywords) {
  const normalized = String(text || "").toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function buildFallbackEvaluation(answer, confidence = "medium", topic = "") {
  const trimmed = String(answer || "").trim();
  const wordCount = countWords(trimmed);
  const topicText = normalizeTopic(topic);

  let score = trimmed.length > 0 ? 3 : 1;
  score += Math.min(5, Math.floor(wordCount / 10));
  if (wordCount > 50) score += 1;
  if (wordCount > 100) score += 1;
  if (containsKeyword(trimmed, ["because", "therefore", "as a result", "thus", "due to"])) score += 2;
  if (containsKeyword(trimmed, ["example", "for instance", "such as", "for example"])) score += 2;
  if (containsKeyword(trimmed, ["maybe", "perhaps", "might", "could be"])) score -= 2;
  if (topicText.includes("tree") || topicText.includes("recurs") || topicText.includes("quantum") || topicText.includes("photo")) score += 1;
  if (confidence === "high") score -= 2;
  if (confidence === "low") score += 1;

  score = Math.min(10, Math.max(2, score));

  const guidance = [];
  if (wordCount < 30) {
    guidance.push("Your answer is too brief to judge the reasoning properly.");
  }
  if (!containsKeyword(trimmed, ["because", "therefore", "as a result", "thus"])) {
    guidance.push("Explain why your conclusion follows from the underlying mechanism.");
  }
  if (!containsKeyword(trimmed, ["example", "for instance", "such as"])) {
    guidance.push("Add a concrete example or analogy to anchor the idea.");
  }
  if (containsKeyword(trimmed, ["maybe", "perhaps", "might", "could be"])) {
    guidance.push("Avoid hedging language when you are asked to make a clear claim.");
  }

  let critique;
  if (topicText.includes("tree")) {
    critique = `Your answer mentions the tree metaphor, but it still needs a clearer hierarchy. Map the root, branches, and leaves to the concept instead of staying at a general level.`;
  } else if (topicText.includes("recurs")) {
    critique = `Your recursion answer has the right direction, but it lacks a concrete recursive step and a base case. Describe how the process repeats and when it stops.`;
  } else if (topicText.includes("quantum")) {
    critique = `Your quantum explanation is too abstract. Connect the concept to a specific observable effect and explain how the behavior differs from ordinary classical expectations.`;
  } else if (topicText.includes("photo")) {
    critique = `Your answer should explain how light energy becomes chemical energy. Walk through the process step by step rather than leaving it as a general statement.`;
  } else {
    critique = confidence === "high"
      ? `Your answer is too confident for the evidence provided. Narrow the claim, show the underlying mechanism, and support it with one concrete example.`
      : confidence === "low"
        ? `Your caution is understandable, but the explanation is still too vague. Make the reasoning more specific and support it with a concrete example or mechanism.`
        : `The answer is directionally reasonable, but it is still too general. Tighten the logic, explain the mechanism clearly, and support it with a concrete example.`;
  }

  if (guidance.length > 0) {
    critique += ` ${guidance.join(" ")}`;
  }

  return { critique, qualityScore: score };
}

module.exports = { buildFallbackEvaluation }; 
