const Attendance = require(
  "../models/Attendance"
);

const getAttendance =
  async (req, res) => {

    try {

      const attendance =
        await Attendance.find({
          userId:
            req.headers.userid,
        });

      res.json(attendance);

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }
};

const createAttendance =
  async (req, res) => {

    try {

      const attendance =
        await Attendance.create({
          ...req.body,
          userId:
            req.headers.userid,
        });

      res.status(201).json(
        attendance
      );

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }
};

const updateAttendance =
  async (req, res) => {

    try {

      const attendance =
        await Attendance.findOneAndUpdate(
          {
            _id: req.params.id,
            userId:
              req.headers.userid,
          },
          req.body,
          {
            new: true,
          }
        );

      res.json(attendance);

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }
};

const deleteAttendance =
  async (req, res) => {

    try {

      await Attendance.findOneAndDelete({
        _id: req.params.id,
        userId:
          req.headers.userid,
      });

      res.json({
        message:
          "Attendance deleted",
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }
};

module.exports = {
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
};