# University Scraping Bot

A web scraping application that extracts admission information from various university websites and sends notifications through WhatsApp.

## Heroku Deployment

This application is configured to run on Heroku with Puppeteer. The necessary buildpacks are already configured in the `.buildpacks` file and `app.json`.

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Key Features

- Scrapes admission information from multiple university websites
- Sends notifications via WhatsApp Web
- Generates Excel reports
- Uploads reports to Dropbox
- Scheduled scraping with cron jobs

## WhatsApp Integration

This application uses WhatsApp Web with persistent session storage in MongoDB. Key features:

- Uses `whatsapp-web.js` and `wwebjs-mongo` libraries
- Stores session data in MongoDB for persistence across app restarts
- Scans QR code only once, then reuses the session
- Sends messages directly from university message templates
- Handles dynamic data from university websites

### Setting up WhatsApp

1. Set the `MONGODB_URI` environment variable with your MongoDB connection string
2. Start the application
3. Scan the QR code with WhatsApp on your phone when prompted
4. The session will be saved to MongoDB for future use

## Tech Stack

- Node.js
- Puppeteer for web scraping
- Express
- WhatsApp Web API via whatsapp-web.js
- MongoDB for session storage
- ExcelJS for report generation
- Dropbox API for file storage

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
# MongoDB connection string for WhatsApp session storage
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp-sessions

# WhatsApp recipient number (with country code, no + symbol)
RECIPIENT_PHONE_NUMBER=923286958404

# Dropbox settings
DROPBOX_ACCESS_TOKEN=your_dropbox_access_token
```
