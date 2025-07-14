const axios = require("axios");
require("dotenv").config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_RECIPIENT_NUMBER = process.env.WHATSAPP_RECIPIENT_NUMBER;

/**
 * Tests connection to the WhatsApp Business API
 * @returns {Promise<object>} Test result
 */
async function testWhatsAppConnection() {
  try {
    // Check if environment variables are set
    if (!WHATSAPP_TOKEN) {
      console.error("❌ WHATSAPP_TOKEN is not set in environment variables");
      return { success: false, error: "Missing WHATSAPP_TOKEN" };
    }

    if (!WHATSAPP_PHONE_NUMBER_ID) {
      console.error(
        "❌ WHATSAPP_PHONE_NUMBER_ID is not set in environment variables"
      );
      return { success: false, error: "Missing WHATSAPP_PHONE_NUMBER_ID" };
    }

    if (!WHATSAPP_RECIPIENT_NUMBER) {
      console.error(
        "❌ WHATSAPP_RECIPIENT_NUMBER is not set in environment variables"
      );
      return { success: false, error: "Missing WHATSAPP_RECIPIENT_NUMBER" };
    }

    // Try to get business profile info as a simple connectivity test
    const url = `https://graph.facebook.com/v23.0/${WHATSAPP_PHONE_NUMBER_ID}/whatsapp_business_profile`;

    console.log(`🔍 Testing WhatsApp Business API connection to: ${url}`);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
    });

    console.log("✅ WhatsApp Business API connection successful!");
    console.log("📊 Business Profile:", JSON.stringify(response.data, null, 2));

    return {
      success: true,
      businessProfile: response.data,
      message: "Connection test successful",
    };
  } catch (error) {
    console.error("❌ WhatsApp connection test failed:");

    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);

      if (error.response.data?.error?.code === 190) {
        console.error(
          "🔑 ERROR: Invalid OAuth access token. The token may be expired or invalid."
        );
        return {
          success: false,
          error: "Invalid OAuth access token",
          code: 190,
          message:
            "Your WhatsApp token is invalid or expired. Please generate a new one.",
        };
      }
    }

    return {
      success: false,
      error: error.message,
      details: error.response?.data || "No additional details",
    };
  }
}

/**
 * Sends a WhatsApp template message using Meta Cloud API
 * @param {string} templateName - The name of the template to use
 * @param {Array<{type: string, text: string}>} parameters - Array of parameters for the template
 * @param {string} [recipientNumber] - Optional recipient phone number (overrides env variable)
 * @returns {Promise<object>} - Response data from Meta Cloud API
 */
async function sendMetaCloudTemplateMessage(
  templateName,
  parameters,
  recipientNumber
) {
  try {
    // Get recipient number - use provided number, then env var, with validation
    const recipient = recipientNumber || process.env.WHATSAPP_RECIPIENT_NUMBER;
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
        language: { code: "en_GB" },
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

module.exports = { sendMetaCloudTemplateMessage, testWhatsAppConnection };
