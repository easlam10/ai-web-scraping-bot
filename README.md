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
│   └── keys.js                         # Environment configuration
│
├── extraction/                         # Content extraction logic
│   ├── extractNust.js                  # NUST content extraction
│   ├── extractNums.js                  # NUMS content extraction
│   └── ...                             # Other universities
│
├── importantInfo/                     # Important static data extractors
│   ├── extractNustInfo.js             # NUST-specific data
│   └── ...                            # Other universities
│
├── messageTemplates/                  # WhatsApp message templates
│   ├── nustMessages.js                # NUST templates
│   └── ...                            # Other universities
│
├── public/
│   └── images/
│       ├── nust_banner.jpg            # University banners
│       └── logo.png                   # Client logo
│
├── outputs/                            # Processed output assets
│   ├── nust_banner_with_logo.jpg      # Final NUST banner
│   └── {uni}_banner_with_logo.jpg     # Other university banners
│
├── scrapers/                          # Scraper modules
│   ├── nustScraper.js                 # NUST scraping logic
│   └── ...                            # Other universities
│
├── services/                          # Core service utilities
│   ├── addLogoToImage.js             # Image branding logic
│   ├── dropboxService.js             # Dropbox file upload
│   ├── excelWriter.js                # Excel generation
│   ├── fetchPageContent.js           # Generic page fetcher
│   ├── twilioService.js              # Twilio messaging
│   └── whatsappService.js            # Meta API integration
│
├── .env.example                        # Example environment config
├── index.js                            # Main entry point
└── package.json                        # Project metadata & dependencies



## 🔧 Setup Instructions

### 1. Prerequisites
- Node.js v18+
- Dropbox account
- Twilio/Meta WhatsApp API access

### 2. Installation

git clone [repository-url]
cd ai-web-scraping-bot
npm install

3. Environment Configuration
Create .env file based on .env.example:

ini
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
RECIPIENT_WHATSAPP_NUMBER=whatsapp:+923000000000

# WhatsApp Meta Configuration
WHATSAPP_TOKEN=your_meta_token
WHATSAPP_PHONE_NUMBER_ID=your_meta_number_id
WHATSAPP_RECIPIENT_NUMBER=923000000000

# Dropbox Configuration
DROPBOX_ACCESS_TOKEN=your_dropbox_token
DROPBOX_REFRESH_TOKEN=your_refresh_token

# AI Configuration
GEMINI_API_KEY=your_gemini_key
Security Note:

Never commit .env to version control

Share credentials via secure channels (LastPass, 1Password, or encrypted email)

Rotate all tokens before handover

4. Running the System
Manual Execution:

bash
node index.js


🤖 How It Works
Scraping Workflow
URL Processing:

Each university has dedicated URLs array

Example: nustUrls in nustScraper.js

Content Extraction:

javascript
const html = await fetchPageContent(url);
const structuredData = extractNustStructuredContent(html);
Data Analysis:

Uses Cheerio-parsed structured content

Extracts deadlines, programs, etc. via extractNustInfo.js

Message Generation:

javascript
messages.push(nustMessages.netAdmissionSchedule({
  deadline: "2024-05-15",
  examStartDate: "2024-06-01"
}));
Output Generation:

Excel reports with raw data

Branded images with institutional logos

Distribution:

WhatsApp messages via Twilio/Meta

Cloud storage on Dropbox

🔐 Security Considerations
Environment Variables:

All sensitive keys are configured via .env

config/keys.js acts as central access point

Secure Sharing:

Recommend using Vault by HashiCorp for team access

Or Infisical for open-source alternative

Token Rotation:

bash
# Sample rotation procedure:
# 1. Generate new Dropbox token
# 2. Update .env
# 3. Restart application
📈 Monitoring & Maintenance
Logging
All operations are logged to console with emoji indicators:

🌐 Scraping initiated

✅ Success markers

❌ Error states

Error Handling
Automatic retries for failed scrapes

Fallback to structured data when AI fails

Graceful degradation for individual university failures

Maintenance Tasks
URL Updates:

Quarterly review of university URLs

Update in respective scraper files

Template Updates:

Modify message formats in messageTemplates/






