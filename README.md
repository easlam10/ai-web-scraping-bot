# University Scraping Bot

A web scraping application that extracts admission information from various university websites and sends notifications through WhatsApp.

## Heroku Deployment

This application is configured to run on Heroku with Puppeteer. The necessary buildpacks are already configured in the `.buildpacks` file and `app.json`.

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Key Features

- Scrapes admission information from multiple university websites
- Sends notifications via WhatsApp
- Generates Excel reports
- Scheduled scraping with cron jobs

## Tech Stack

- Node.js
- Puppeteer
- Express
- Twilio API for WhatsApp integration
- ExcelJS for report generation