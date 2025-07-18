require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // THIS LINE SHOULD BE UNCOMMENTED

const app = express();

// Connect Database
connectDB(); // THIS LINE SHOULD BE UNCOMMENTED

// Init Middleware
app.use(express.json({ extended: false })); // Allows us to get data in req.body
app.use(cors()); // Enable CORS for cross-origin requests

// Define a basic route for now
app.use('/api/auth', require('./routes/auth'));       // Add this line
app.use('/api/journals', require('./routes/journals')); // Add this line
app.use('/api/chatbot', require('./routes/chatbot')); // Add this line
app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));