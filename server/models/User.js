const mongoose = require("mongoose");

const generatedImageSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  style: { type: String, default: "illustration" },
  imageData: { type: String, required: true }, // base64 data URI
  prompt: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  generatedImages: [generatedImageSchema],
  globalFrictionScore: { type: Number, default: 0 },
  dailyCognitiveUsage: { type: Number, default: 0 }, // 0 to 100+
  lastCapacityReset: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);