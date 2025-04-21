const twilio = require("twilio");
const config = require("../config/keys"); // Consistent import pattern

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

async function sendWhatsAppWithMedia(messageText, fileUrl, imageUrl) {
  try {
    await client.messages.create({
      body: `${messageText}\n\n📎 Excel download: ${fileUrl}`,
      from: config.twilio.whatsappNumber,
      to: config.twilio.recipientNumber,
      mediaUrl: imageUrl
    });
  } catch (error) {
    console.error("❌ Twilio API error:", error.message);
    throw error;
  }
}

module.exports = { sendWhatsAppWithMedia };
