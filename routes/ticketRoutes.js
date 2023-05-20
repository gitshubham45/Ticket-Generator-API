const express = require('express');
const authenticateToken = require('../config/authentication');
const { createTickets , fetchTickets } = require('../controllers/ticketController');

const router = express.Router();

router.route("/").post(authenticateToken,createTickets);
router.route("/:id").get(authenticateToken,fetchTickets);

module.exports = router;