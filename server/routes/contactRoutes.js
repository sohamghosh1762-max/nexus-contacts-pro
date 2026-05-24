const express = require("express");

const router = express.Router();

const {
  getContacts,
  getSingleContact,
  createContact,
  updateContact,
  deleteContact,
} = require("../controllers/contactController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getContacts);

router.get("/:id", protect, getSingleContact);

router.post("/", protect, createContact);

router.put("/:id", protect, updateContact);

router.delete("/:id", protect, deleteContact);

module.exports = router;