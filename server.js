// Import the Express framework
const express = require('express');

// Import the Client class from the 'pg' package to interact with PostgreSQL
const { Client } = require('pg');

// Create an Express application instance
const app = express();

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Create a new PostgreSQL client instance with connection configuration
const client = new Client({
  host: 'localhost',          // Database host
  user: 'postgres',           // Database username
  password: 'Sadek1748*',     // Database password
  database: 'mywebsite',      // Database name
  port: 5432,                 // Port number (default for PostgreSQL)
});

// Connect to the PostgreSQL database
client.connect()
  .then(() => console.log("Connected to PostgreSQL")) // Log success
  .catch(err => console.error("Connection error", err)); // Log errors if connection fails

// Define a route for the root URL ('/') that responds with a simple message
app.get('/', (req, res) => {
  res.send('Server working');
});

// Define a route for '/test-db' to test database connectivity
app.get('/test-db', async (req, res) => {
  // Execute a simple query to get the current timestamp from the database
  const result = await client.query('SELECT NOW()');
  // Send the result rows back as JSON
  res.json(result.rows);
});

// Start the server and listen on port 3000
app.listen(3000, () => {
  console.log('Server running on port 3000');
});