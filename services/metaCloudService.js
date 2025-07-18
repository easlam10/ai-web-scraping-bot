const axios = require("axios");
require("dotenv").config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_RECIPIENT_NUMBER = process.env.WHATSAPP_RECIPIENT_NUMBER;

/**
 * Sends a WhatsApp template message using Meta Cloud API
 * @param {string} templateName - The name of the template to use
 * @param {Array<{type: string, text: string}>} parameters - Array of parameters for the template
 * @param {string} [recipientNumber] - Optional recipient phone number (overrides env variable)
 * @returns {Promise<object>} - Response data from Meta Cloud API
 */
async function sendMetaCloudTemplateMessage(templateName, parameters = []) {
  try {
    const recipient = WHATSAPP_RECIPIENT_NUMBER;
    if (!recipient) {
      throw new Error(
        "Recipient phone number is missing. Check environment variables or provide it as parameter."
      );
    }

    // Log environment variables (without showing full token)
    console.log("🔍 Debug - Environment Variables:");
    console.log(
      `- WHATSAPP_PHONE_NUMBER_ID: ${
        WHATSAPP_PHONE_NUMBER_ID ? "✓ Set" : "❌ Not set"
      }`
    );
    console.log(`- Using recipient number: ${recipient}`);
    console.log(
      `- WHATSAPP_TOKEN: ${
        WHATSAPP_TOKEN
          ? `✓ Set (starts with: ${WHATSAPP_TOKEN.substring(0, 4)}...)`
          : "❌ Not set"
      }`
    );

    const url = `https://graph.facebook.com/v23.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    console.log(`🔗 API URL: ${url}`);
    console.log(`📝 Template name: ${templateName}`);
    console.log(`📊 Parameters:`, parameters);

    const payload = {
      messaging_product: "whatsapp",
      to: recipient,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: parameters.map((param) => ({
              type: "text",
              text: param,
            })),
          },
        ],
      },
    };

    console.log("📦 Request payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Meta Cloud WhatsApp template message sent successfully");
    console.log("📊 Response data:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("❌ Meta Cloud API template error details:");

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error(
        `Headers: ${JSON.stringify(error.response.headers, null, 2)}`
      );
      console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);

      // Check for specific error codes
      if (error.response.data?.error?.code === 190) {
        console.error(
          "🔑 ERROR: Invalid OAuth token. Your WHATSAPP_TOKEN may be expired or invalid."
        );
      } else if (error.response.data?.error?.code === 100) {
        console.error(
          "❓ ERROR: Parameter may be missing or invalid in the template."
        );
      } else if (error.response.status === 404) {
        console.error(
          `🔍 ERROR: Template '${templateName}' may not exist or you don't have permissions.`
        );
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error(
        "🌐 ERROR: No response received from server. Network issue?"
      );
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error(
        "⚠️ ERROR: Issue when setting up the request:",
        error.message
      );
    }

    console.error("Stack trace:", error.stack);
    throw error;
  }
}

/**
 * Sends a WhatsApp text message using Meta Cloud API
 * @param {string} message - The text message to send
 * @param {string} [recipientNumber] - Optional recipient phone number (overrides env variable)
 * @returns {Promise<object>} - Response data from Meta Cloud API
 */
async function sendMetaCloudTextMessage(message, recipientNumber) {
  try {
    const recipient = recipientNumber || process.env.WHATSAPP_RECIPIENT_NUMBER;
    if (!recipient) {
      throw new Error(
        "Recipient phone number is missing. Check environment variables or provide it as parameter."
      );
    }

    const url = `https://graph.facebook.com/v23.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    console.log(`🔗 API URL: ${url}`);
    console.log(`📝 Text message: ${message}`);

    const payload = {
      messaging_product: "whatsapp",
      to: recipient,
      type: "text",
      text: {
        body: message
      }
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Meta Cloud WhatsApp text message sent successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Meta Cloud API text message error:", error.message);
    throw error;
  }
}

module.exports = {
  sendMetaCloudTemplateMessage,
  sendMetaCloudTextMessage
};
