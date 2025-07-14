const {
  sendMetaCloudTemplateMessage,
  testWhatsAppConnection,
} = require("./services/metaCloudService");
require("dotenv").config();

// First test the connection to WhatsApp API
async function runTest() {
  console.log("Testing WhatsApp connection...");

  try {
    // Test the connection first
    const connectionTest = await testWhatsAppConnection();
    console.log(
      "Connection test result:",
      JSON.stringify(connectionTest, null, 2)
    );

    if (!connectionTest.success) {
      console.error(
        "❌ Connection test failed. Please check your WhatsApp credentials."
      );
      return;
    }

    console.log("✅ Connection test successful!");

    // Get the recipient number from environment variable
    const recipientNumber = process.env.WHATSAPP_RECIPIENT_NUMBER;
    console.log(`📱 Will send test message to: ${recipientNumber}`);

    // Send a test template message - NOT passing the recipient as third parameter
    // This matches the approach in nustScraper.js that was working
    console.log("📤 Sending template message...");
    const result = await sendMetaCloudTemplateMessage("send_messages", []);

    console.log("✅ Message sent successfully!");
    console.log("📊 API Response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Test failed with error:");
    console.error(`- Message: ${error.message}`);

    if (error.response) {
      console.error(`- Status: ${error.response.status}`);
      console.error(`- Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Run the test
runTest();
