const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const webhookHandler = require('./api/webhook');
const sendConsentHandler = require('./api/send-consent');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.send('University Scraping Bot Server is running!');
});

// Webhook route - handle both GET (verification) and POST (messages)
app.all('/api/webhook', (req, res) => {
  return webhookHandler(req, res);
});

// Send consent route
app.post('/api/send-consent', (req, res) => {
  return sendConsentHandler(req, res);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});