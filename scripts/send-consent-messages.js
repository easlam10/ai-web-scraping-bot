// Script to send consent messages to a list of phone numbers
const { connectToDatabase } = require("../services/dbService");
const { sendMetaCloudTextMessage } = require("../services/metaCloudService");
const fs = require("fs").promises;
const path = require("path");

// Delay between sending messages (in ms)
const MESSAGE_DELAY = 2000; // 2 seconds

// Helper function to add delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends consent messages to a list of phone numbers
 * @param {Array<string>} phoneNumbers - Array of phone numbers or path to a text file with one number per line
 * @returns {Promise<void>}
 */
async function sendConsentMessages(phoneNumbers) {
  try {
    console.log("🚀 Starting to send consent messages...");

    // Parse phone numbers
    let numbers = [];

    // Check if phoneNumbers is a string (file path)
    if (typeof phoneNumbers === "string") {
      const filePath = path.resolve(phoneNumbers);
      console.log(`📂 Reading phone numbers from: ${filePath}`);
      const fileContent = await fs.readFile(filePath, "utf8");
      numbers = fileContent
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#")); // Skip empty lines and comments
    } else if (Array.isArray(phoneNumbers)) {
      numbers = phoneNumbers;
    } else {
      throw new Error(
        "Invalid input: expected array of phone numbers or file path"
      );
    }

    console.log(`📱 Found ${numbers.length} phone numbers to process`);

    // Connect to database
    await connectToDatabase();

    // Send consent message to each number
    const consentMessage =
      "Would you like to receive university admission updates? Please reply with YES to confirm.";

    for (let i = 0; i < numbers.length; i++) {
      const phoneNumber = numbers[i].trim();
      if (!phoneNumber) continue;

      try {
        console.log(
          `📨 [${i + 1}/${
            numbers.length
          }] Sending consent message to: ${phoneNumber}`
        );
        await sendMetaCloudTextMessage(consentMessage, phoneNumber);
        console.log(`✅ Message sent to ${phoneNumber}`);

        // Add delay before next message
        if (i < numbers.length - 1) {
          console.log(
            `⏱️ Waiting ${MESSAGE_DELAY / 1000} seconds before next message...`
          );
          await delay(MESSAGE_DELAY);
        }
      } catch (error) {
        console.error(`❌ Failed to send to ${phoneNumber}:`, error.message);
      }
    }

    console.log("✅ Finished sending consent messages");
  } catch (error) {
    console.error("❌ Error sending consent messages:", error);
    throw error;
  }
}

// Run the script when executed directly
if (require.main === module) {
  // Check for command line argument (file path)
  const filePath = process.argv[2];

  if (!filePath) {
    console.error("❌ Please provide a file path with phone numbers");
    console.error(
      "Usage: node scripts/send-consent-messages.js phone-numbers.txt"
    );
    process.exit(1);
  }

  sendConsentMessages(filePath)
    .then(() => {
      console.log("✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Script failed:", error);
      process.exit(1);
    });
}

module.exports = { sendConsentMessages };
