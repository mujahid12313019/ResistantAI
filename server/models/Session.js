const mongoose = require("mongoose");

const iterationSchema = new mongoose.Schema({
  userAnswer: { type: String, required: true },
  confidence: { type: String, enum: ["low", "medium", "high"], required: true },
  aiCritique: { type: String, required: true },
  frictionScoreDelta: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: String, required: true },
  mode: { 
    type: String, 
    enum: ["Strict Teacher", "Socratic", "Devil's Advocate", "Scientist"], 
    default: "Strict Teacher" 
  },
  status: { type: String, enum: ["active", "completed"], default: "active" },
  imageUrl: { type: String }, // base64 or URL
  promptUsed: { type: String },
  frictionScore: { type: Number, default: 0 },
  difficultyLevel: { type: Number, default: 1 },
  teachAttempts: { type: Number, default: 0 },
  iterations: [iterationSchema],
  finalExplanation: { type: String },
  lastActivityAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Fix: Modern Mongoose pre-save hook (next is no longer required for sync operations)
sessionSchema.pre("save", function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model("Session", sessionSchema);
