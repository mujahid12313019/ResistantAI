const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// POST /api/generate - Generate image from topic using Cloudflare Workers AI
router.post("/", authMiddleware, async (req, res) => {
  const { topic, style } = req.body;

  if (!topic || topic.trim().length === 0) {
    return res.status(400).json({ error: "Topic is required" });
  }

  const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
  const CF_API_TOKEN = process.env.CF_API_TOKEN;

  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    return res.status(500).json({ error: "Cloudflare credentials not configured" });
  }

  // Build an educational, visually rich prompt
  const styleMap = {
    realistic: "photorealistic, highly detailed, 8k resolution",
    illustration: "digital art illustration, vibrant, colorful, artistic",
    infographic: "clean infographic style, diagram layout, highly legible typography",
    cinematic: "cinematic, dramatic lighting, epic composition, atmospheric",
    abstract: "abstract art, conceptual, surrealist, thought-provoking",
  };

  const styleDesc = styleMap[style] || styleMap.illustration;
  const enhancedPrompt = `Educational concept visualization of: "${topic.trim()}". ${styleDesc}. IMPORTANT RULE: The image MUST prominently feature the exact text "${topic.trim()}" written in clear, bold English letters. Do NOT invent any other random words, labels, or gibberish. Only write the exact phrase "${topic.trim()}". High quality, visually stunning.`;

  try {
    const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

    const response = await fetch(cfUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        num_steps: 4,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Cloudflare AI error:", errText);
      return res.status(response.status).json({ error: "Image generation failed", details: errText });
    }

    // Cloudflare returns JSON with the base64 string
    const responseData = await response.json();
    const base64Image = responseData.result.image;
    
    // Determine image type (flux-1-schnell returns jpeg by default)
    const imageType = base64Image.startsWith('/9j/') ? 'jpeg' : 'png';
    const imageData = `data:image/${imageType};base64,${base64Image}`;

    // Save the generation to the user's history
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        generatedImages: {
          topic: topic.trim(),
          style: style || "illustration",
          imageData,
          prompt: enhancedPrompt,
          createdAt: new Date(),
        },
      },
    });

    return res.json({ imageData, prompt: enhancedPrompt });
  } catch (err) {
    console.error("Generation error:", err);
    return res.status(500).json({ error: "Server error during image generation" });
  }
});

// GET /api/generate/history - Get user's generation history
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("generatedImages email");
    if (!user) return res.status(404).json({ error: "User not found" });

    // Return last 20, most recent first
    const history = (user.generatedImages || []).slice(-20).reverse();
    return res.json({ history, email: user.email });
  } catch (err) {
    console.error("History error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/generate/history/:index - Delete a specific image from history
router.delete("/history/:index", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const idx = parseInt(req.params.index);
    if (isNaN(idx) || idx < 0 || idx >= user.generatedImages.length) {
      return res.status(400).json({ error: "Invalid index" });
    }

    user.generatedImages.splice(idx, 1);
    await user.save();

    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;