# University Information Scraper System

## 📌 Overview

A Node.js automation system that:
1. Scrapes admission information from 5 Pakistani universities (NUST, NUMS, PIEAS, GIKI, FAST)
2. Extracts key dates and admission requirements
3. Generates formatted WhatsApp messages
4. Stores structured data in Excel files
5. Distributes updates via WhatsApp (Twilio/Meta) with branded visuals

## 🛠️ Technical Stack

| Component           | Technology                          |
|---------------------|-------------------------------------|
| Core Platform       | Node.js v18+                       |
| Web Scraping        | Puppeteer + Cheerio                 |
| AI Analysis         | Google Gemini API                   |
| Messaging           | Twilio WhatsApp API + Meta Cloud API|
| Cloud Storage       | Dropbox                             |
| Image Processing    | Sharp                               |
| Data Export         | ExcelJS                             |
| Hosting             | Railway (with cron scheduling)      |

---

## 📂 Project Structure

```bash
AI-WEB-SCRAPING-BOT/
│
├── config/
│   └── keys.js              # Environment configuration
│
├── extraction/              # Content extraction logic
│   ├── extractNust.js       # NUST content extraction
│   ├── extractNums.js       # NUMS content extraction
│   └── ...                  # Other universities
│
├── importantInfo/           # Important data extractors
│   ├── extractNustInfo.js   # NUST-specific data
│   └── ...                  # Other universities
│
├── messageTemplates/        # WhatsApp templates
│   ├── nustMessages.js      # NUST message templates
│   └── ...                  # Other universities
│
├── public/
│   └── images/
│       ├── nust_banner.jpg  # University banners
│       └── logo.png         # Client logo
│
├── outputs/                 # Processed assets
│   ├── nust_banner_with_logo.jpg 
│   └── {uni}_banner_with_logo.jpg 
│
├── scrapers/                # Scraper modules
│   ├── nustScraper.js       # NUST scraping logic
│   └── ...                  # Other universities
│
├── services/                # Core utilities
│   ├── addLogoToImage.js    # Image branding
│   ├── dropboxService.js    # Dropbox uploads
│   ├── excelWriter.js       # Excel generation
│   ├── fetchPageContent.js  # Page fetcher
│   ├── twilioService.js     # Twilio integration
│   └── whatsappService.js   # Meta integration
│
├── .env.example             # Environment template
├── index.js                 # Main entry point
└── package.json             # Project metadata

🚦 Deployment
Hosting on Railway
bash
1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Configure automated deployments
4. Set weekly cron job (Monday 12:00 PM PKT)
Environment Configuration
Create .env file from template:

ini
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
RECIPIENT_WHATSAPP_NUMBER=whatsapp:+923000000000

# WhatsApp Meta
WHATSAPP_TOKEN=your_meta_token
WHATSAPP_PHONE_NUMBER_ID=your_meta_number_id

# Dropbox
DROPBOX_ACCESS_TOKEN=your_dropbox_token
DROPBOX_REFRESH_TOKEN=your_refresh_token

# AI Services
GEMINI_API_KEY=your_gemini_key
🔒 Security Notice

Never commit .env to version control

Share credentials via 1Password/Vault

Rotate tokens before production use







