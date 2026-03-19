// Import the Express framework for creating the server
const express = require('express');
const cors = require('cors'); // Added cors import

// Import the Client class from 'pg' to interact with PostgreSQL
const { Client } = require('pg');

// Import bcrypt for hashing passwords securely
const bcrypt = require('bcrypt');

// Create an Express application instance
const app = express();

// Enable CORS for all routes
app.use(cors()); // Added this line

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Configure the PostgreSQL client with connection details
const client = new Client({
  host: 'localhost',           // Database host
  user: 'postgres',            // Database username
  password: 'Sadek1748*',      // Your PostgreSQL password
  database: 'mywebsite',       // Your database name
  port: 5432,                  // Default PostgreSQL port
});

// Connect to PostgreSQL database
client.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("Connection error", err));

// SIGNUP route: Handles user registration
app.post('/signup', async (req, res) => {
  const {
    firstName,
    lastName,
    dob,
    phone,
    email,
    password
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !dob || !email || !password) {
    return res.status(400).json({ message: 'All required fields must be filled' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    await client.query(
      'INSERT INTO users (first_name, last_name, dob, phone, email, password) VALUES ($1, $2, $3, $4, $5, $6)',
      [firstName, lastName, dob, phone, email, hashedPassword]
    );

    res.json({ message: 'User created successfully' });
  } catch (err) {
    if (err.code === '23505') { // duplicate key error
      res.status(400).json({ message: 'Email already exists' });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Database error' });
    }
  }
});

// LOGIN route: Handles user authentication
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Incorrect password' });

    res.json({ message: 'Login successful', username: user.first_name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));