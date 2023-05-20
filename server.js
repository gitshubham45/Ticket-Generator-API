const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');
const Ticket = require('./models/ticket');

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB connection URI
const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tambolaDB';
const jwtSecret = process.env.JWT_SECRET;

// user schema and model
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

// Sample ticket schema and model
const ticketSchema = new mongoose.Schema({
    ticketId: String,
    tickets: [[[Number]]],
});

const Ticket = mongoose.model('Ticket', ticketSchema);

// Connect to MongoDB
mongoose.connect(mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// MongoDB connection event handlers
const db = mongoose.connection;

db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Register API
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const newUser = new User({ username, password });
        await newUser.save();

        res.json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login API
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, password });

        if (user) {
            // Generate JWT token
            const token = jwt.sign({ username }, jwtSecret, { expiresIn: '1d' });

            res.json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Middleware to validate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token === null) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = user;
        next();
    });
}

// Tambola Ticket Create API
app.post('/tickets', authenticateToken, async (req, res) => {
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
});

// Tambola Ticket Fetch API
app.get('/tickets/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const ticketsArrayWithGivenId = await Ticket.find({ ticketId: id });

        const ticketArray = ticketsArrayWithGivenId[0].tickets;

        const totalTicketsCount = ticketArray.length;

        console.log(totalTicketsCount);

        const totalPages = Math.ceil(totalTicketsCount / limit);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const slicedArray = ticketArray.slice(startIndex, endIndex);

        res.json({ slicedArray });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});




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

// Function to generate a single ticket
function generateTicket() {
    const ticket = [];

    const numbers = Array.from({ length: 90 }, (_, i) => i + 1);
    const cols = 3;
    const rows = 9;

    for (let col = 0; col < cols; col++) {
        const column = [];

        for (let row = 0; row < rows; row++) {
            let number;
            if (Math.random() < 0.5 || numbers.length === 0) {
                number = 0; // Represent blank cell with zero
            } else {
                const index = Math.floor(Math.random() * numbers.length);
                number = numbers.splice(index, 1)[0];
            }
            if(number!== 0) number = row*10 + number%10;

            column.push(number);
        }
        ticket.push(column);
    }

    return ticket;
}



// Function to generate a unique ticket ID
function generateTicketId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});



