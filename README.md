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
```


## 🚀 Deployment & Hosting

### 🌐 Railway Configuration
```bash
1. Connect your GitHub repository to Railway
2. Navigate to 'Variables' tab in Railway dashboard
3. Add all environment variables from .env.example
4. Set deployment trigger to 'Auto Deploy'
5. Verify build process completes successfully
```

⏰ Cron Job Setup
bash
1. In Railway dashboard, go to 'Cron Jobs'
2. Create new job with schedule:
   - Frequency: Weekly
   - Day: Monday
   - Time: 12:00 (PKT)
3. Attach to production deployment
4. Test manually via 'Run Now' button
🔧 Environment Management
ini
# Required Variables (Railway -> Settings -> Variables)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
GEMINI_API_KEY=your_gemini_key
DROPBOX_ACCESS_TOKEN=your_dropbox_token

🔄 Update Workflow
Diagram
Code
graph TD
    A[Git Push] --> B{Railway CI}
    B -->|Success| C[Auto-Deploy]
    B -->|Failure| D[Slack Alert]
    C --> E[Verify Logs]
    E --> F[Test Messages]

    
📊 Health Monitoring
Component	Check Command	Expected Output
Scrapers	railway logs -s 1h	"✅ Excel file saved"
WhatsApp API	railway run test-msg	Message delivered
Dropbox Upload	Check /outputs folder	New .xlsx files present


⚠️ Critical Notes

Always test cron jobs during low-traffic periods

Monitor usage quotas for Twilio/Gemini

Keep .env.example updated with new variables

Use railway logs for real-time debugging

🛠️ Maintenance Commands
bash
# Force immediate deployment
railway up

# Check scheduled jobs
railway cron:list

# View recent executions
railway cron:logs

# Temporary pause service
railway service:suspend






