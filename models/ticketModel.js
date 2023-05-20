const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketId: String,
    tickets: [[[Number]]],
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;