const Ticket = require("../models/ticketModel");


// Tambola Ticket Create API
const createTickets = async (req, res) => {
    const { num_tickets } = req.body;

    if (!num_tickets || num_tickets <= 0) {
        res.status(400).json({ message: 'Invalid number of tickets' });
    } else {
        try {
            const ticketId = generateTicketId();
            const tickets = await generateTickets(num_tickets, ticketId);
            res.json({ ticketId });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

// Tambola Ticket Fetch API
const fetchTickets = async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const ticketsArrayWithGivenId = await Ticket.find({ ticketId: id });

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
    const tickets = [];

    for (let i = 0; i < numTickets; i++) {
        const ticket = generateTicket();
        tickets.push(ticket);
    }

    const newTickets = new Ticket({ ticketId, tickets });
    await newTickets.save();

    return tickets;
}

//generate tickets
function generateTicket() {
    const ticket = [];

    const numbers = Array.from({ length: 90 }, (_, i) => i + 1);
    const cols = 3;
    const rows = 9;

    for (let col = 0; col < cols; col++) {
        const column = [];

        let startNum = col * 10 + 1; // Starting number for the column
        let endNum = startNum + 9; // Ending number for the column

        for (let row = 0; row < rows; row++) {
            let number;
            if (Math.random() < 0.5 || numbers.length === 0) {
                number = 0; // Represent blank cell with zero
            } else {
                const index = Math.floor(Math.random() * numbers.length);
                number = numbers.splice(index, 1)[0];
            }

            if (number !== 0) {
                number = startNum + (row % 10);
                if (column.filter((num) => num !== 0).length >= 5) {
                    number = col * 10 + (row % 10) + 1; // Replace extra zeros with respective column number
                }
            }

            column.push(number);
        }

        // Sort the column in ascending order from top to bottom
        // column.sort((a, b) => a - b);

        // Add additional numbers to ensure each column has at least 1 number
        while (column.filter((num) => num !== 0).length < 1) {
            const index = Math.floor(Math.random() * numbers.length);
            const additionalNumber = numbers.splice(index, 1)[0];
            column.push(additionalNumber);
        }

        ticket.push(column);
    }

    // Ensure each row has exactly 5 numbers
    for (let row = 0; row < rows; row++) {
        const nonZeroNumbers = ticket[row].filter((num) => num !== 0);
        const zeroCount = ticket[row].length - nonZeroNumbers.length;

        if (nonZeroNumbers.length < 5) {
            const missingCount = 5 - nonZeroNumbers.length;
            for (let i = 0; i < missingCount; i++) {
                const index = Math.floor(Math.random() * cols);
                if (ticket[row][index] === 0) {
                    ticket[row][index] = startNum + (row % 10) + index + 1;
                } else {
                    i--;
                }
            }
        } else if (zeroCount > 0) {
            const zeroIndices = ticket[row]
                .map((num, index) => (num === 0 ? index : -1))
                .filter((index) => index !== -1);

            for (let i = 0; i < zeroCount; i++) {
                const index = Math.floor(Math.random() * zeroIndices.length);
                const zeroIndex = zeroIndices.splice(index, 1)[0];
                ticket[row][zeroIndex] = startNum + (row % 10) + zeroIndex + 1;
            }
        }
    }

    return ticket;
}





// Function to generate a unique ticket ID
function generateTicketId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}


module.exports = { createTickets, fetchTickets };