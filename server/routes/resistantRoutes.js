const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Session = require("../models/Session");
const User = require("../models/User");
const { buildFallbackEvaluation, buildFallbackExplanation } = require("../utils/critique");

const router = express.Router();

function extractJSON(str) {
  try {
    const match = str.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed.critique || parsed.qualityScore || parsed.feedback) return parsed;
    }
    return null;
  } catch (e) { return null; }
}

async function callGemini(systemPrompt, userPrompt) {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}\n\nReturn ONLY a compact JSON object with keys critique and qualityScore.` }],
          }],
          generationConfig: { temperature: 0.2 },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI] Gemini call failed:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    console.log('[AI] Gemini raw response:', text);
    return text;
  } catch (e) {
    console.error('[AI] Gemini exception:', e);
    return null;
  }
}

async function callLLM(systemPrompt, userPrompt, CF_ACCOUNT_ID, CF_API_TOKEN) {
  if (CF_ACCOUNT_ID && CF_API_TOKEN) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`;
      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${CF_API_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.result?.response;
        console.log('[AI] Cloudflare LLM raw response:', text);
        if (text) {
          return text;
        }
      } else {
        const errorText = await response.text();
        console.error('[AI] Cloudflare LLM call failed:', response.status, errorText);
      }
    } catch (e) {
      console.error('[AI] Cloudflare LLM exception:', e);
      // fall through to Gemini
    }
  }

  return callGemini(systemPrompt, userPrompt);
}

// POST /api/resistant/start
router.post("/start", authMiddleware, async (req, res) => {
  const { topic, mode } = req.body;
  if (!topic) return res.status(400).json({ error: "Topic is required" });
  try {
    const enhancedPrompt = `Conceptual representation of "${topic.trim()}". No text. Abstract puzzle, deep learning concept.`;
    const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
    let imageData = "";
    try {
      const imgRes = await fetch(cfUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: enhancedPrompt, num_steps: 4 }),
      });
      if (imgRes.ok) {
        const imgJson = await imgRes.json();
        if (imgJson?.result?.image) imageData = `data:image/png;base64,${imgJson.result.image}`;
      }
    } catch (e) {}
    const finalExplanation = (await callLLM("Expert encyclopedia. Clear 2-paragraph explanation.", `Explain ${topic}`, process.env.CF_ACCOUNT_ID, process.env.CF_API_TOKEN)) || buildFallbackExplanation(topic);
    const session = new Session({ userId: req.user.id, topic: topic.trim(), mode: mode || "Strict Teacher", imageUrl: imageData, finalExplanation });
    await session.save();
    return res.json({ session });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// POST /api/resistant/submit
router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const { sessionId, answer, confidence } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const currentTime = Date.now();
    const timeTakenSec = Math.min(300, (currentTime - new Date(session.lastActivityAt).getTime()) / 1000);

    if (timeTakenSec < 45 && session.iterations.length > 0) session.difficultyLevel = Math.min(5, session.difficultyLevel + 1);

    const systemPrompt = `Topic: ${session.topic}. Persona: ${session.mode}. Difficulty: ${session.difficultyLevel}/5. Critique the user's answer as a strict tutor. Respond ONLY with JSON: {"critique": "string", "qualityScore": number}`;
    const responseStr = await callLLM(systemPrompt, `User Answer: "${answer}"`, process.env.CF_ACCOUNT_ID, process.env.CF_API_TOKEN);
    let result = extractJSON(responseStr) || buildFallbackEvaluation(answer, confidence, session.topic);

    const answerLength = answer.trim().length;
    const lengthBonus = Math.min(8, Math.max(0, Math.floor(answerLength / 40) - 1));
    const evidenceBonus = /because|therefore|thus|as a result|for example|for instance|such as/i.test(answer) ? 3 : 0;
    const hedgingPenalty = /maybe|perhaps|might|could be/i.test(answer) ? -3 : 0;
    const confidenceModifier = confidence === "high" ? -5 : confidence === "low" ? 5 : 0;

    const finalDelta = Math.round((result.qualityScore * 2) + lengthBonus + evidenceBonus + confidenceModifier + hedgingPenalty);
    const capacityUsage = Math.max(1, result.qualityScore * 0.7 + Math.log10(timeTakenSec + 1) * 4 + lengthBonus * 0.4);

    session.frictionScore += finalDelta;
    session.lastActivityAt = new Date();
    session.iterations.push({ userAnswer: answer, confidence, aiCritique: result.critique, frictionScoreDelta: finalDelta });
    await session.save();

    const user = await User.findById(req.user.id);
    if (user) {
      if (new Date(user.lastCapacityReset).toDateString() !== new Date().toDateString()) {
        user.dailyCognitiveUsage = capacityUsage;
        user.lastCapacityReset = new Date();
      } else {
        user.dailyCognitiveUsage += capacityUsage;
      }
      user.globalFrictionScore += finalDelta;
      await user.save();
      return res.json({ session, dailyCognitiveUsage: user.dailyCognitiveUsage });
    }

    return res.json({ session, dailyCognitiveUsage: Math.round(capacityUsage) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/resistant/teach
router.post("/teach", authMiddleware, async (req, res) => {
  try {
    const { sessionId, explanation } = req.body;
    const session = await Session.findById(sessionId);
    
    // Adaptive Leniency: If attempts > 1, make AI more flexible
    const leniencyPrompt = session.teachAttempts > 1 
      ? "The user has tried multiple times. Be more flexible. If their explanation is mostly correct, unlock clarity. Encourage them."
      : "Be strict. Only unlock if they show deep understanding.";

    const systemPrompt = `
      Evaluate mastery of "${session.topic}". 
      Respond ONLY with JSON: {"unlocked": boolean, "feedback": "string", "quality": number}
      ${leniencyPrompt}
    `;
    const resultStr = await callLLM(systemPrompt, `User Explanation: ${explanation}`, process.env.CF_ACCOUNT_ID, process.env.CF_API_TOKEN);
    let result = extractJSON(resultStr) || {
      unlocked: explanation.length > 100,
      feedback: "Local evaluation was used because the AI service could not be reached. To improve your explanation, add a clear definition, step-by-step reasoning, and a concrete example tied to the topic.",
      quality: Math.min(10, Math.max(2, Math.floor(explanation.length / 25) + 1)),
    };

    if (!result.unlocked) {
      session.teachAttempts += 1;
      // Force Unlock if attempts > 2 and quality is reasonable
      if (session.teachAttempts > 2 && (result.quality > 5 || explanation.length > 100)) {
        result.unlocked = true;
        result.feedback = "After multiple attempts, your persistent effort has earned the clarity. Well done.";
      }
      await session.save();
    }

    if (result.unlocked) {
      session.status = "completed";
      const masteryBonus = (result.quality || 5) * 10 + (Math.max(1, 10 - session.iterations.length) * 20);
      session.frictionScore += masteryBonus;
      await session.save();
      await User.findByIdAndUpdate(req.user.id, { $inc: { globalFrictionScore: masteryBonus, dailyCognitiveUsage: 15 } });
    }

    return res.json({ unlocked: result.unlocked, feedback: result.feedback, session });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get("/sessions", authMiddleware, async (req, res) => {
  const sessions = await Session.find({ userId: req.user.id }).sort({ createdAt: -1 });
  return res.json({ sessions });
});

router.get("/session/:id", authMiddleware, async (req, res) => {
  const session = await Session.findById(req.params.id);
  return res.json({ session });
});

module.exports = router;
