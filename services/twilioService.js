const twilio = require("twilio");
const config = require("../config/keys"); // Consistent import pattern

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

async function sendWhatsAppTwilio(messageText) {
  try {
    await client.messages.create({
      body: messageText, 
      from: config.twilio.whatsappNumber,
      to: config.twilio.recipientNumber,
    });
  } catch (error) {
    console.error("❌ Twilio API error:", error.message);
    throw error;
  }
}

module.exports = { sendWhatsAppTwilio };