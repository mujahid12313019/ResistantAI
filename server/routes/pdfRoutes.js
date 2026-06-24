const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PdfReader } = require("pdfreader");
const axios = require("axios");
const authMiddleware = require("../middleware/authMiddleware");
const PdfSession = require("../models/PdfSession");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } 
}).fields([{ name: "lecture" }, { name: "exam" }]);

const uploadHandler = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) return res.status(400).json({ error: `Upload Error: ${err.message}` });
    else if (err) return res.status(500).json({ error: "File upload failed." });
    next();
  });
};

async function extractPdfTextByPage(filePath, maxPages = 200) {
    return new Promise((resolve, reject) => {
        let pages = [];
        let currentPageText = "";
        let pageCount = 0;
        const reader = new PdfReader();
        fs.readFile(filePath, (err, buffer) => {
            if (err) return reject(err);
            const timeout = setTimeout(() => {
                if (currentPageText) pages.push(currentPageText.trim());
                resolve(pages);
            }, 60000);
            reader.parseBuffer(buffer, (err, item) => {
                if (err) { clearTimeout(timeout); return reject(err); }
                if (!item || pageCount >= maxPages) {
                    if (currentPageText) pages.push(currentPageText.trim());
                    clearTimeout(timeout);
                    resolve(pages);
                    return;
                }
                if (item.page) {
                    if (pageCount > 0) pages.push(currentPageText.trim());
                    currentPageText = "";
                    pageCount++;
                } else if (item.text) {
                    currentPageText += item.text + " ";
                }
            });
        });
    });
}

async function callLLM(systemPrompt, userPrompt) {
  console.log(`[LLM REQUEST] System: ${systemPrompt.substring(0, 100)}...`);
  try {
    const response = await axios.post(`https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`, 
      { messages: [
          { role: "system", content: systemPrompt + " Return ONLY valid JSON. No conversational filler." }, 
          { role: "user", content: userPrompt }
        ] 
      },
      { headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}` }, timeout: 45000 }
    );
    const result = response.data.result.response;
    console.log(`[LLM RESPONSE] Received ${result.length} characters.`);
    return result;
  } catch (e) { 
    console.error(`[LLM ERROR] ${e.message}`);
    throw e; 
  }
}

function extractJSON(str) {
  if (!str) return null;
  try {
    // Try to find JSON block
    const jsonMatch = str.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    let cleanStr = jsonMatch[0];
    // Replace smart quotes if they exist
    cleanStr = cleanStr.replace(/[\u201C\u201D]/g, '"');
    
    return JSON.parse(cleanStr);
  } catch (e) { 
    console.error(`[JSON PARSE ERROR] Failed to parse: ${str.substring(0, 100)}...`);
    return null; 
  }
}

router.post("/upload", authMiddleware, uploadHandler, async (req, res) => {
  console.log("--- [STARTING DUAL-GAUNTLET DECONSTRUCTION] ---");
  try {
    if (!req.files || !req.files["lecture"]) return res.status(400).json({ error: "Lecture PDF missing." });
    
    const lectureFile = req.files["lecture"][0];
    const lecturePages = await extractPdfTextByPage(lectureFile.path);
    
    let examText = "No exam questions provided.";
    if (req.files["exam"]) {
      const examPages = await extractPdfTextByPage(req.files["exam"][0].path, 20);
      examText = examPages.join("\n\n");
    }

    const session = new PdfSession({
      userId: req.user.id,
      lectureFileName: lectureFile.originalname,
      multerFileName: lectureFile.filename,
      lectureFilePath: lectureFile.path.replace(/\\/g, "/"),
      lecturePages: lecturePages,
      lectureContent: lecturePages.join(" "),
      examContent: examText,
      totalPageCount: lecturePages.length,
      checkpoints: []
    });

    // Generate First Dual-Gauntlet Checkpoint
    const initialContext = lecturePages.slice(0, 5).join(" ");
    const cpRaw = await callLLM(
      `Identify an actual exam question (PYQ) from this text: "${examText.substring(0, 2000)}" that relates to these lecture pages. Then, create a TOUGHER creative follow-up. 
      IMPORTANT: Return ONLY JSON format like: {"pyq": "string", "creativeQuestion": "string"}`,
      `Context: ${initialContext.substring(0, 3000)}`
    );
    const cp = extractJSON(cpRaw);
    
    if (!cp) console.log("--- [FALLBACK TRIGGERED: Initial Checkpoint] ---");

    session.checkpoints.push({
        pageNumber: Math.min(5, lecturePages.length),
        pyq: cp?.pyq || "Analyze the core exam pattern for this sector.",
        creativeQuestion: cp?.creativeQuestion || "Synthesize the concepts from the first 5 pages and explain their theoretical limits."
    });

    await session.save();
    res.json({ sessionId: session._id, session });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/checkpoint", authMiddleware, async (req, res) => {
  const { sessionId, answer, timeReading, timeAnswering } = req.body;
  try {
    const session = await PdfSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session lost." });

    const currentCP = session.checkpoints.find(cp => cp.status === "locked");
    if (!currentCP) return res.json({ session });

    // Update tracking metrics
    session.timeSpentReading += (timeReading || 0);
    currentCP.timeSpentAnswering = (timeAnswering || 0);

    const evaluationRaw = await callLLM(
      `Evaluate student deconstruction. 
       1. Provide a marks/score out of 100.
       2. Provide a constructive but slightly 'uncomfortable' critique (the Illusion Breaker tone).
       3. Suggest how to modify the answer for perfection.
       4. Identify any potential 'weak topics' based on this answer.
       
       JSON format: {'score': number, 'critique': 'string', 'suggestions': 'string', 'weakTopics': ['string'], 'understandingValue': number}`,
      `Challenge: ${currentCP.creativeQuestion}\nAnswer: ${answer}`
    );
    const evaluation = extractJSON(evaluationRaw);

    currentCP.userAnswer = answer;
    currentCP.score = evaluation?.score || 50;
    currentCP.aiCritique = `${evaluation?.critique || "Knowledge synthesized."}\n\nPROPOSED MODIFICATION: ${evaluation?.suggestions || "Deepen your synthesis."}`;
    currentCP.status = "passed";
    
    // Update Global Metrics
    const scoreVal = evaluation?.score || 50;
    session.actualUnderstanding = Math.round((session.actualUnderstanding + scoreVal) / (session.checkpoints.length > 0 ? 2 : 1));
    if (evaluation?.weakTopics) {
        session.weakTopics = [...new Set([...session.weakTopics, ...evaluation.weakTopics])];
    }
    
    // Calculate Overconfidence (Perceived - Actual)
    session.overconfidenceLevel = Math.max(0, session.perceivedUnderstanding - session.actualUnderstanding);

    const nextTargetPage = currentCP.pageNumber + 5;
    if (nextTargetPage <= session.totalPageCount) {
        const nextContext = session.lecturePages.slice(currentCP.pageNumber, nextTargetPage).join(" ");
        const nextCPRaw = await callLLM(
            `Find a relevant exam question (PYQ) from: "${session.examContent.substring(0, 2000)}" for these pages. Create a harder creative follow-up. 
            IMPORTANT: Return ONLY JSON format like: {"pyq": "string", "creativeQuestion": "string"}`,
            `Context: ${nextContext.substring(0, 3000)}`
        );
        const nextCP = extractJSON(nextCPRaw);
        
        if (!nextCP) console.log(`--- [FALLBACK TRIGGERED: Checkpoint at Page ${nextTargetPage}] ---`);

        session.checkpoints.push({
            pageNumber: nextTargetPage,
            pyq: nextCP?.pyq || "Analyze the upcoming exam pattern.",
            creativeQuestion: nextCP?.creativeQuestion || "Explain the advanced implications of the next sector."
        });
    }

    await session.save();
    res.json({ session, result: evaluation });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/sessions", authMiddleware, async (req, res) => {
  try {
    const sessions = await PdfSession.find({ userId: req.user.id })
      .select("lectureFileName totalPageCount currentPage status actualUnderstanding perceivedUnderstanding overconfidenceLevel weakTopics checkpoints createdAt")
      .sort({ createdAt: -1 });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/view/:id", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const session = await PdfSession.findById(req.params.id);
    const filePath = path.resolve(session.lectureFilePath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    fs.createReadStream(filePath).pipe(res);
  } catch (err) { res.status(500).send(err.message); }
});

module.exports = router;
