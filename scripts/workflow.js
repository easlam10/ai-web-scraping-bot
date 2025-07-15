// Complete workflow script for WhatsApp consent and messaging
const { fetchWhatsAppMessages } = require("./fetch-whatsapp-messages");
const { checkForConsents } = require("./check-consent");
const { connectToDatabase } = require("../services/dbService");
const Message = require("../models/Message");
require("dotenv").config();

/**
 * Complete workflow:
 * 1. Fetch messages from WhatsApp API
 * 2. Check for consent messages
 * 3. Process consents and run scrapers
 */
async function runWorkflow() {
  try {
    console.log("🚀 Starting WhatsApp message workflow");
    console.log("⏱️ " + new Date().toISOString());

    // Step 1: Connect to database
    console.log("🔌 Connecting to database");
    await connectToDatabase();

    // Step 2: Fetch recent WhatsApp messages
    console.log("📥 Fetching recent WhatsApp messages");
    await fetchWhatsAppMessages();

    // Step 3: Check for consent messages and process them
    console.log("✅ Checking for consent messages");
    await checkForConsents();

    console.log("✨ Workflow completed successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Workflow failed:", error);
    return { success: false, error: error.message };
  }
}

// Show system stats
async function showStats() {
  try {
    await connectToDatabase();

    const totalMessages = await Message.countDocuments();
    const consentedUsers = await Message.countDocuments({ hasConsented: true });
    const processedMessages = await Message.countDocuments({ processed: true });
    const unprocessedConsents = await Message.countDocuments({
      hasConsented: true,
      processed: false,
    });

    console.log("\n📊 System Statistics:");
    console.log(`- Total messages stored: ${totalMessages}`);
    console.log(`- Users who consented: ${consentedUsers}`);
    console.log(`- Processed messages: ${processedMessages}`);
    console.log(`- Pending consent processing: ${unprocessedConsents}`);

    // Get list of unique phone numbers that have consented
    const consentedPhoneNumbers = await Message.distinct("phoneNumber", {
      hasConsented: true,
    });
    console.log(`- Unique users with consent: ${consentedPhoneNumbers.length}`);

    return {
      totalMessages,
      consentedUsers,
      processedMessages,
      unprocessedConsents,
      uniqueUsers: consentedPhoneNumbers.length,
    };
  } catch (error) {
    console.error("❌ Error getting stats:", error);
    return null;
  }
}

// Run the workflow when executed directly
if (require.main === module) {
  // Check for --stats flag to show stats
  if (process.argv.includes("--stats")) {
    showStats()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else {
    runWorkflow()
      .then(() => showStats())
      .then(() => {
        console.log("✅ Script completed");
        process.exit(0);
      })
      .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
      });
  }
}

module.exports = { runWorkflow, showStats };
