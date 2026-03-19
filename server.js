// Import the Express framework for creating the server
const express = require('express');

// Import the Client class from 'pg' to interact with PostgreSQL
const { Client } = require('pg');

// Import bcrypt for hashing passwords securely
const bcrypt = require('bcrypt');

// Create an Express application instance
const app = express();

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Configure the PostgreSQL client with connection details
const client = new Client({
  host: 'localhost',           // Database host
  user: 'postgres',            // Database username
  password: 'YOUR_PASSWORD',   // Replace with your actual password
  database: 'mywebsite',       // Database name
  port: 5432,                  // Default PostgreSQL port
});

// Connect to PostgreSQL database
client.connect()
  .then(() => console.log("Connected to PostgreSQL")) // Log success message
  .catch(err => console.error(" Connection error", err)); // Log connection errors

// SIGNUP route: Handles user registration
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input fields
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  try {
    // Hash the user's password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database with hashed password
    await client.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      [username, email, hashedPassword]
    );

    // Send success response
    res.json({ message: 'User created successfully' });
  } catch (err) {
    // Handle duplicate username or email (unique constraint violation)
    if (err.code === '23505') { // PostgreSQL duplicate key error code
      res.status(400).json({ message: 'Username or email already exists' });
    } else {
      // Log other errors and send generic server error response
      console.error(err);
      res.status(500).json({ message: 'Database error' });
    }
  }
});

// LOGIN route: Handles user authentication
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate input fields
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  try {
    // Query database for user with provided email
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    // If user not found, respond with error
    if (!user) return res.status(400).json({ message: 'User not found' });

    // Compare input password with hashed password stored in database
    const match = await bcrypt.compare(password, user.password);

    // If passwords don't match, respond with error
    if (!match) return res.status(400).json({ message: 'Incorrect password' });

    // Successful login
    res.json({ message: 'Login successful', username: user.username });
  } catch (err) {
    // Log errors and send server error response
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

// Start the server on port 3000
app.listen(3000, () => console.log(' Server running on port 3000'));