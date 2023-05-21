const Ticket = require("../models/ticketModel");
const getTickets = require("../Utility/ticketGenerator")


//Ticket Create API
const createTickets = async (req, res) => {
    const { num_tickets } = req.body;

    if (!num_tickets || num_tickets <= 0) {
        res.status(400).json({ message: 'Invalid number of tickets' });
    } else {
        try {
            const generatedTicketsAndIdArray = await generateTickets(num_tickets);
            const tickets = generatedTicketsAndIdArray[0];
            const ticketId = generatedTicketsAndIdArray[1];
            
            res.json({ ticketId });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

// Ticket Fetch API
const fetchTickets = async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const ticketsArrayWithGivenId = await Ticket.find({ _id : id });

        const ticketArray = ticketsArrayWithGivenId[0].tickets;

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const slicedArray = ticketArray.slice(startIndex, endIndex);

        res.status(200).json({ tickets: slicedArray });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Function to generate tickets and save them in the database
async function generateTickets(numTickets, ticketId) {
    const ticketAndIdArray = [];

    const tickets = [];

    for (let i = 0; i < numTickets; i++) {
        const ticket = getTickets();
        tickets.push(ticket);
    }

    const newTickets = new Ticket({ ticketId, tickets });
    await newTickets.save();

    ticketAndIdArray.push(tickets);
    ticketAndIdArray.push(newTickets._id);
    return ticketAndIdArray;
}


module.exports = { createTickets, fetchTickets };