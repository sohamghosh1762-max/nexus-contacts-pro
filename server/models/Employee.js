const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      default: "",
    },

    company: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "",
    },

    team: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    linkedin: {
      type: String,
      default: "",
    },

    birthday: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    performance: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      default: "active",
    },

    tags: {
      type: [String],
      default: [],
    },

    interactions: {
      type: Number,
      default: 0,
    },

    tasksCompleted: {
      type: Number,
      default: 0,
    },

    dealsOwned: {
      type: Number,
      default: 0,
    },

    revenue: {
      type: Number,
      default: 0,
    },

    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Employee",
  employeeSchema
);