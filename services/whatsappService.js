const axios = require("axios");
const config = require("../config/keys");

async function sendWhatsAppMessage(messageText) {
  const url = `https://graph.facebook.com/v22.0/${config.whatsapp.phoneNumberId}/messages`;

  const headers = {
    Authorization: `Bearer ${config.whatsapp.token}`,
    "Content-Type": "application/json",
  };

  const data = {
    messaging_product: "whatsapp",
    to: config.whatsapp.recipientNumber,
    type: "text",
    text: {
      body: messageText,
    },
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log("✅ Message sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ WhatsApp API error:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = { sendWhatsAppMessage };
