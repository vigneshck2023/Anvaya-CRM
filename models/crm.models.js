const mongoose = require("mongoose");

// SalesAgent Schema
const salesAgentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: String
    },
    role: {
      type: String
    }
  },
  { timestamps: true }
);

const SalesAgent = mongoose.model("SalesAgent", salesAgentSchema);

// Lead Schema
const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: true
    },
    salesAgent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SalesAgent",
        required: true
      }
    ],

    status: {
      type: String,
      enum: ["New", "Contracted", "Qualified"],
      default: "New",
      required: true
    },
    tags: [{ type: String }],
    timeToClose: {
      type: Number
    },
    priority: {
  type: [String],
  enum: ["High", "Medium", "Low"],
  default: ["Medium"],
  required: true
}
,
    comments: [
      {
        author: String,
        text: String,
        date: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);

module.exports = { SalesAgent, Lead };
