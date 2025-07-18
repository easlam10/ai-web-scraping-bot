require("dotenv").config();

module.exports = {
  dropbox: {
    accessToken: process.env.DROPBOX_ACCESS_TOKEN,
    refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
    recipientNumber: process.env.RECIPIENT_WHATSAPP_NUMBER,
  },
  whatsapp: {
    token: process.env.WHATSAPP_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    recipientNumber: process.env.WHATSAPP_RECIPIENT_NUMBER,
  },
  browserless: {
    apiKey: process.env.BROWSERLESS_API_KEY,
  },
};
