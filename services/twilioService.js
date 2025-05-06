const twilio = require("twilio");
const config = require("../config/keys");

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

async function sendWhatsAppWithMedia(messageText) {
  try {
    // Option 1: If you have a pre-approved template
    await client.messages.create({
      from: config.twilio.whatsappNumber,
      to: config.twilio.recipientNumber,
      contentSid: 'HX5759daa0c0f2072f9c52c1da45e04e15', // Your template SID
      contentVariables: JSON.stringify({
        "1": messageText,
      })
    });

  
  } catch (error) {
    console.error("❌ Twilio API error:", error.message);
    throw error;
  }
}

module.exports = { sendWhatsAppWithMedia };