const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const dotenv = require('dotenv');

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;


// Register API
const registerUser = async (req, res) => {
    const { username, password } = req.body;

    console.log(password);

    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Login API
const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });

        if (user) {
            // Generate JWT token
            if (bcrypt.compare(user.password, password)) {
                const token = jwt.sign({ username }, jwtSecret, { expiresIn: '1d' });
                console.log(token);

                res.json({ message: 'Login successful', token });
            }
            else {
                res.status(401).json({ message: 'Wrong Password' });
            }

        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { registerUser, loginUser };