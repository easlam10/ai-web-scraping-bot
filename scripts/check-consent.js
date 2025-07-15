// Script to check for consent messages and run scrapers
const { connectToDatabase } = require("../services/dbService");
const Message = require("../models/Message");
const { runScrapers } = require("../index");

// Time window to check for recent consents (in minutes)
const CONSENT_WINDOW_MINUTES = 10;

async function checkForConsents() {
  try {
    console.log("🔍 Checking for new consent messages...");

    // Connect to database
    await connectToDatabase();

    // Calculate timestamp for consent window
    const windowTime = new Date();
    windowTime.setMinutes(windowTime.getMinutes() - CONSENT_WINDOW_MINUTES);

    // Find recent consent messages
    const recentConsents = await Message.find({
      hasConsented: true,
      consentDate: { $gte: windowTime },
    });

    console.log(`✅ Found ${recentConsents.length} recent consents`);

    // Process each consent
    for (const consent of recentConsents) {
      console.log(`📱 Processing consent for: ${consent.phoneNumber}`);

      // Set environment variable for recipient number
      process.env.WHATSAPP_RECIPIENT_NUMBER = consent.phoneNumber;

      try {
        // Import services here to ensure they use the updated env var
        const {
          sendMetaCloudTemplateMessage,
        } = require("../services/metaCloudService");

        // Send confirmation message
        await sendMetaCloudTemplateMessage("consent_confirmed", []);
        console.log(`✅ Confirmation message sent to ${consent.phoneNumber}`);

        // Run scrapers for this user
        console.log(`🚀 Running scrapers for ${consent.phoneNumber}...`);
        await runScrapers();
        console.log(
          `✅ Completed sending information to ${consent.phoneNumber}`
        );

        // Mark message as processed to avoid duplicate sends
        await Message.findByIdAndUpdate(consent._id, { processed: true });
      } catch (error) {
        console.error(
          `❌ Error processing consent for ${consent.phoneNumber}:`,
          error
        );
      }
    }

    console.log("✅ Consent check completed");
  } catch (error) {
    console.error("❌ Error checking for consents:", error);
  }
}

// Run the check when script is executed directly
if (require.main === module) {
  checkForConsents()
    .then(() => {
      console.log("✅ Script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Script failed:", error);
      process.exit(1);
    });
}

module.exports = { checkForConsents };
