const axios = require("axios");
const config = require("../config/keys");

const WHATSAPP_TOKEN = config.whatsapp.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = config.whatsapp.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_RECIPIENT_NUMBER = config.whatsapp.WHATSAPP_RECIPIENT_NUMBER;


async function sendWhatsAppWithTemplate(messageText) {
  try {
    const url = `https://graph.facebook.com/v23.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to: WHATSAPP_RECIPIENT_NUMBER,
      type: "template",
      template: {
        name: "uni_alerts",
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: messageText }],
          },
        ],
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ WhatsApp message sent:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ WhatsApp API error:",
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = { sendWhatsAppWithTemplate };
