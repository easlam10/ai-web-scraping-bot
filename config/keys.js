require('dotenv').config();

module.exports = {
  dropbox: {
    accessToken: process.env.DROPBOX_ACCESS_TOKEN
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
    recipientNumber: process.env.RECIPIENT_WHATSAPP_NUMBER
  }
};