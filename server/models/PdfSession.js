const mongoose = require("mongoose");

const checkpointSchema = new mongoose.Schema({
  pageNumber: { type: Number, required: true },
  pyq: { type: String }, 
  creativeQuestion: { type: String, required: true }, 
  userAnswer: { type: String },
  aiCritique: { type: String },
  score: { type: Number, default: 0 }, // Out of 100
  status: { type: String, enum: ["locked", "passed", "failed"], default: "locked" },
  attempts: { type: Number, default: 0 },
  timeSpentAnswering: { type: Number, default: 0 }, // in ms
});

const pdfSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lectureFileName: { type: String, required: true },
  multerFileName: { type: String }, 
  lectureFilePath: { type: String }, 
  lecturePages: [{ type: String }], 
  lectureContent: { type: String }, 
  examContent: { type: String },    
  examPatterns: { type: String },   
  checkpoints: [checkpointSchema],
  currentPage: { type: Number, default: 1 },
  totalPageCount: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "completed"], default: "active" },
  
  // Illusion Breaker Metrics
  perceivedUnderstanding: { type: Number, default: 70 }, // User's self-assessment
  actualUnderstanding: { type: Number, default: 0 },    // AI-calculated
  weakTopics: [{ type: String }],
  overconfidenceLevel: { type: Number, default: 0 },
  timeSpentReading: { type: Number, default: 0 },      // in ms
  skippedQuestions: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PdfSession", pdfSessionSchema);
