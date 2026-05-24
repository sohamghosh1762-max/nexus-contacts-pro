const Contact = require("../models/Contact");

const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();

    res.json(contacts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getSingleContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    res.json(contact);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const createContact = async (req, res) => {
  try {
    const newContact = new Contact(req.body);

    const savedContact = await newContact.save();

    res.status(201).json(savedContact);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateContact = async (req, res) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    res.json(updatedContact);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);

    res.json({
      message: "Contact deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getContacts,
  getSingleContact,
  createContact,
  updateContact,
  deleteContact,
};