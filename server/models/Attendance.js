const mongoose = require("mongoose");

const attendanceSchema =
  new mongoose.Schema(
    {
      employeeId: {
        type: String,
        required: true,
      },

      employeeName: {
        type: String,
        required: true,
      },

      checkIn: {
        type: String,
        default: "",
      },

      checkOut: {
        type: String,
        default: "",
      },

      workHours: {
        type: Number,
        default: 0,
      },

      status: {
        type: String,
        enum: [
          "present",
          "absent",
          "leave",
        ],
        default: "present",
      },

      leaveReason: {
        type: String,
        default: "",
      },

      date: {
        type: String,
        required: true,
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
  "Attendance",
  attendanceSchema
);