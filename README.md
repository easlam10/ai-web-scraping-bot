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

## 📦 Environment Configuration

Create a `.env` file based on `.env.example`:

```ini
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
⚠️ Security Note
```

## ⚠️ Security Note

- **Never commit `.env` files** to version control  
- **Share credentials securely** using:  
  - [1Password](https://1password.com/)  
  - [LastPass](https://www.lastpass.com/)  
  - Encrypted email (ProtonMail, Tutanota)  
- **Rotate all tokens** before project handover  

---

## 🤖 How It Works

### 🔗 URL Processing  
- Each university has a dedicated URLs array  
- Example: `nustUrls` in `nustScraper.js`  

### 🧠 Content Extraction  
```javascript
const html = await fetchPageContent(url);
const structuredData = extractNustStructuredContent(html);
```

### 📊 Data Analysis
Uses Cheerio-parsed structured content

Extracts key information via university-specific files (e.g. extractNustInfo.js)

### 💬 Message Generation
```javascript
messages.push(nustMessages.netAdmissionSchedule({
  deadline: "2024-05-15",
  examStartDate: "2024-06-01"
}));
```

### 🧾 Output Generation
Excel reports with raw data (outputs/ directory)

Branded images with institutional logos

### 📤 Distribution
WhatsApp messages via Twilio/Meta APIs

Cloud storage via Dropbox integration

## 🔐 Security Considerations

### 📁 Environment Variables

= All sensitive keys stored in .env

- Centralized access via config/keys.js

```javascript
// Example keys.js structure
module.exports = {
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN
  }
}
```


## 📈 Monitoring & Maintenance

### 📋 Logging

All operations include emoji-enhanced logs:

🌐 Scraping initiated

✅ Success

❌ Errors

### 🛠 Error Handling
- Automatic retries for failed scrapes.

- Fallback to structured data when AI fails.

- Graceful degradation for partial university failures.


### 📝 Template Updates
Modify WhatsApp message formats in messageTemplates/.

## 🚀 Deployment & Hosting

### 🌐 Railway Configuration

1. Connect your GitHub repository to Railway
2. Navigate to 'Variables' tab in Railway dashboard
3. Add all environment variables from .env.example
4. Set deployment trigger to 'Auto Deploy'
5. Verify build process completes successfully


### ⚠️ Critical Notes

- Always test cron jobs during low-traffic periods

- Monitor usage quotas for Twilio/Gemini

- Keep .env.example updated with new variables

- Use railway logs for real-time debugging

### 🛠️ Maintenance Commands

### Force immediate deployment
```railway up```

### Check scheduled jobs
```railway cron:list```

### View recent executions
```railway cron:logs```

### Temporary pause service
```railway service:suspend```






