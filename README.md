# University Information Scraper System

## 📌 Overview

A Node.js automation system that:
1. Scrapes admission information from 5 Pakistani universities (NUST, NUMS, PIEAS, GIKI, FAST)
2. Extracts key dates and admission requirements
3. Generates formatted WhatsApp messages
4. Stores structured data in Excel files
5. Distributes updates via WhatsApp (Twilio/Meta) with branded visuals

## 🛠️ Technical Stack

- **Core**: Node.js
- **Scraping**: Puppeteer + Cheerio
- **AI Analysis**: Google Gemini
- **Messaging**: Twilio WhatsApp API + Meta Cloud API
- **Storage**: Dropbox
- **Image Processing**: Sharp
- **Data Export**: ExcelJS

## 📂 Project Structure
AI-WEB-SCRAPING-BOT/
├── config/
│ └── keys.js # Environment configuration
├── extraction/
│ ├── extractNust.js # NUST content extraction
│ ├── extractNums.js # NUMS content extraction
│ └── ... # Other universities
├── importantInfo/
│ ├── extractNustInfo.js # NUST specific data
│ └── ... # Other universities
├── messageTemplates/
│ ├── nustMessages.js # NUST message templates
│ └── ... # Other universities
├── public/
│ ├── images/
│ │ ├── nust_banner.jpg # University banners
│ │ └── logo.png # Client logo
├── scrapers/
│ ├── nustScraper.js # NUST scraper
│ └── ... # Other universities
├── services/
│ ├── addLogoToImage.js # Image branding
│ ├── dropboxService.js # Cloud storage
│ ├── excelWriter.js # Excel export
│ ├── fetchPageContent.js # Page scraping
│ ├── twilioService.js # Twilio integration
│ └── whatsappService.js # Meta integration
├── .env.example # Environment template
├── index.js # Main entry point
└── package.json


## 🔧 Setup Instructions

### 1. Prerequisites
- Node.js v18+
- Dropbox account
- Twilio/Meta WhatsApp API access

### 2. Installation

git clone [repository-url]
cd ai-web-scraping-bot
npm install


