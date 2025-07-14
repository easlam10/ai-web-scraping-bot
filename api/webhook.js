// Webhook handler for Meta/WhatsApp
const { runScrapers } = require("../index");

// Environment variables are automatically available in Vercel

module.exports = async (req, res) => {
  // Handle GET request (for verification)
  if (req.method === "GET") {
    // Parse params from the webhook verification request
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        // Respond with 200 OK and challenge token
        console.log("WEBHOOK_VERIFIED");
        return res.status(200).send(challenge);
      } else {
        // Respond with '403 Forbidden' if verify tokens do not match
        return res.status(403).end("Forbidden");
      }
    }

    // Return 400 if params are missing
    return res.status(400).end("Missing parameters");
  }

  // Handle POST request (incoming messages)
  if (req.method === "POST") {
    try {
      console.log(
        "FULL WEBHOOK REQUEST BODY:",
        JSON.stringify(req.body, null, 2)
      );

      // Check if this is a message and not a delivery report
      if (
        req.body.entry &&
        req.body.entry[0].changes &&
        req.body.entry[0].changes[0].value.messages
      ) {
        const message = req.body.entry[0].changes[0].value.messages[0];
        const phoneNumber = message.from;

        console.log("Message type:", message.type);
        console.log("Message content:", JSON.stringify(message, null, 2));
        console.log("From phone number:", phoneNumber);

        let userConsented = false;

        // Check if this is a quick reply button
        if (
          message.type === "interactive" &&
          (message.interactive.type === "button_reply" ||
            message.interactive.type === "quick_reply")
        ) {
          console.log(
            "Interactive message received:",
            JSON.stringify(message.interactive, null, 2)
          );

          // Get the ID or title of the button
          const buttonId =
            message.interactive.button_reply?.id ||
            message.interactive.quick_reply?.id ||
            message.interactive.button_reply?.title ||
            message.interactive.quick_reply?.payload ||
            "";

          console.log("Button ID detected:", buttonId);

          // For quick replies, also check the payload or title
          const buttonTitle = (
            message.interactive.button_reply?.title ||
            message.interactive.quick_reply?.title ||
            ""
          ).toUpperCase();

          console.log("Button title detected:", buttonTitle);

          // If the user clicked "yes" or a button with YES in the title/payload
          if (
            buttonId === "yes_button" ||
            buttonId === "YES" ||
            buttonTitle === "YES" ||
            buttonTitle.includes("YES")
          ) {
            userConsented = true;
            console.log("User clicked yes button/quick reply");
          }
        }
        // Check if this is a text message containing "YES"
        else if (message.type === "text" && message.text) {
          const text = message.text.body.trim().toUpperCase();
          console.log("Received text message:", text);

          if (
            text === "YES" ||
            text === "Y" ||
            text.includes("YES") ||
            text === "1"
          ) {
            userConsented = true;
            console.log("User consent detected in text");
          }
        }

        // Process consent if granted
        if (userConsented) {
          console.log(`User ${phoneNumber} consented to receive messages`);

          // Set the recipient number in environment variable
          process.env.WHATSAPP_RECIPIENT_NUMBER = phoneNumber;
          console.log(`Set recipient number to ${phoneNumber} for scrapers`);

          // Send confirmation message using the existing metaCloudService
          const {
            sendMetaCloudTemplateMessage,
          } = require("../services/metaCloudService");

          try {
            console.log("Sending confirmation message");
            await sendMetaCloudTemplateMessage(
              "consent_confirmed",
              [],
              phoneNumber
            );
            console.log("Confirmation message sent successfully");
          } catch (msgError) {
            console.error("Failed to send confirmation message:", msgError);
          }

          // Run scrapers and send information
          // Note: This might time out on Vercel's free tier if scrapers take too long
          // Consider triggering a separate process or queue for long-running tasks
          console.log("Starting to run scrapers...");
          try {
            await runScrapers();
            console.log("Scrapers completed successfully");
          } catch (scraperError) {
            console.error("Error running scrapers:", scraperError);
          }
        } else {
          console.log(`No consent detected from user ${phoneNumber}`);
        }
      } else {
        console.log("Received non-message webhook event or delivery report");
      }

      // Always respond with 200 OK to WhatsApp/Meta
      return res.status(200).end("OK");
    } catch (error) {
      console.error("Error processing webhook:", error);
      return res.status(500).end("Error processing webhook");
    }
  }

  // Handle other methods
  return res.status(405).end("Method Not Allowed");
};
