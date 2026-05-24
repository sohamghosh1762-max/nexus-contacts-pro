const Employee = require("../models/Employee");

const getEmployees = async (req, res) => {
  try {

    const employees =
      await Employee.find({
        userId:
          req.headers.userid,
      });

    res.json(employees);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

const createEmployee = async (req, res) => {
  try {

    const employee =
      await Employee.create({
        ...req.body,
        userId:
          req.headers.userid,
      });

    res.status(201).json(employee);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

const updateEmployee = async (req, res) => {
  try {

    const employee =
      await Employee.findOneAndUpdate(
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

    res.json(employee);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

const deleteEmployee = async (req, res) => {
  try {

    await Employee.findOneAndDelete({
      _id: req.params.id,
      userId:
        req.headers.userid,
    });

    res.json({
      message:
        "Employee deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};