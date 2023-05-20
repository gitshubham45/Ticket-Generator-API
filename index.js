const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

dotenv.config();    

const app = express();
app.use(express.json());


// connection to Database
connectDB();

// Register and login user
app.use('/user' , userRoutes);

// generate and fetch tickets
app.use('/tickets',ticketRoutes);

const port = process.env.PORT || 3000;

// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});



