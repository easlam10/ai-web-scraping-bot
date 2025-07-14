// API endpoint to send consent message
const {
  sendMetaCloudTemplateMessage,
} = require("../services/metaCloudService");

module.exports = async (req, res) => {
  try {
    // Check if this is a POST request
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Get phone number from request body
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    console.log(`Sending consent request to: ${phoneNumber}`);

    // Store the phone number in environment variable temporarily
    // This ensures the metaCloudService will use it as the recipient
    process.env.WHATSAPP_RECIPIENT_NUMBER = phoneNumber;

    // Send template message with quick reply button
    // Template must be pre-approved in Meta Business Manager
    await sendMetaCloudTemplateMessage("send_messages", []);

    return res.status(200).json({
      success: true,
      message: `Consent request sent to ${phoneNumber}. User should click the "YES" button to receive updates.`,
    });
  } catch (error) {
    console.error("Failed to send consent request:", error);
    return res.status(500).json({
      error: "Failed to send consent request",
      details: error.message,
    });
  }
};
