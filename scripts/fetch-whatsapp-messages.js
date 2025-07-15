// Script to fetch WhatsApp messages using Meta Graph API
const axios = require("axios");
const { connectToDatabase } = require("../services/dbService");
const Message = require("../models/Message");
require("dotenv").config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const META_BUSINESS_ID = process.env.META_BUSINESS_ID; // Add this to your .env file

/**
 * Fetches recent messages from WhatsApp Business API
 */
async function fetchWhatsAppMessages() {
  try {
    console.log("🔍 Fetching messages from WhatsApp Business API...");

    // Connect to database
    await connectToDatabase();

    // Get timestamp for last 24 hours (or adjust as needed)
    const since = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);

    // WhatsApp Business API endpoint for conversations
    const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/conversations`;

    console.log(`🔗 Requesting data from: ${url}`);

    const response = await axios.get(url, {
      params: {
        fields: "messages{id,from,to,text,created_time}",
        user_initiated: "true", // Only fetch user-initiated conversations
        since: since,
      },
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Successfully fetched conversation data");

    // Check if there are conversations
    if (!response.data.data || response.data.data.length === 0) {
      console.log("📭 No conversations found");
      return;
    }

    console.log(`📥 Found ${response.data.data.length} conversations`);

    // Process each conversation and its messages
    for (const conversation of response.data.data) {
      if (!conversation.messages || !conversation.messages.data) {
        continue;
      }

      console.log(
        `📨 Processing messages from conversation ID: ${conversation.id}`
      );

      for (const msg of conversation.messages.data) {
        // Only process messages FROM users (not sent by your business)
        if (msg.from !== WHATSAPP_PHONE_NUMBER_ID) {
          const phoneNumber = msg.from;
          const content = msg.text?.body || "";
          const messageId = msg.id;
          const createdAt = new Date(msg.created_time);

          console.log(`📱 Message from ${phoneNumber}: ${content}`);

          // Check if this message exists in database
          const existingMessage = await Message.findOne({ messageId });

          if (!existingMessage) {
            // Create new message in database
            const newMessage = new Message({
              phoneNumber,
              content,
              messageId,
              messageType: "text",
              createdAt,
              // Check if content contains consent keywords
              hasConsented:
                ["YES", "Y", "1"].includes(content.trim().toUpperCase()) ||
                content.trim().toUpperCase().includes("YES"),
              consentDate:
                ["YES", "Y", "1"].includes(content.trim().toUpperCase()) ||
                content.trim().toUpperCase().includes("YES")
                  ? createdAt
                  : null,
            });

            await newMessage.save();
            console.log(`✅ Saved new message from ${phoneNumber} to database`);
          } else {
            console.log(
              `⏭️ Skipping message ${messageId}, already in database`
            );
          }
        }
      }
    }

    console.log("✅ Finished processing WhatsApp messages");
  } catch (error) {
    console.error("❌ Error fetching WhatsApp messages:");

    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);

      // Check for specific errors
      if (error.response.data?.error?.code === 190) {
        console.error(
          "🔑 ERROR: Invalid OAuth token. Your WHATSAPP_TOKEN may be expired or invalid."
        );
      } else if (error.response.status === 404) {
        console.error(
          "❓ ERROR: Resource not found. Check if your WHATSAPP_PHONE_NUMBER_ID is correct."
        );
      } else if (error.response.data?.error?.message) {
        console.error(`⚠️ ERROR: ${error.response.data.error.message}`);
      }
    } else {
      console.error(error.message);
    }
  }
}

// Run the script when executed directly
if (require.main === module) {
  fetchWhatsAppMessages()
    .then(() => {
      console.log("✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Script failed:", error);
      process.exit(1);
    });
}

module.exports = { fetchWhatsAppMessages };
