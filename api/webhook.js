// Webhook handler for Meta/WhatsApp
const { runScrapers } = require("../index");

// Environment variables are automatically available in Vercel

// In-memory store to prevent duplicate processing (in production, use Redis or database)
const processedMessages = new Set();

// Track the last processed message ID in environment to persist across serverless restarts
function getLastProcessedMessageId() {
  return process.env.LAST_PROCESSED_MESSAGE_ID || null;
}

function setLastProcessedMessageId(messageId) {
  process.env.LAST_PROCESSED_MESSAGE_ID = messageId;
}

module.exports = async (req, res) => {
  // Add timestamp to all logs
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ===== WEBHOOK RECEIVED =====`);
  console.log(`[${timestamp}] Method: ${req.method}`);
  console.log(`[${timestamp}] URL: ${req.url}`);

  // Handle GET request (for verification)
  if (req.method === "GET") {
    // Parse params from the webhook verification request
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

    console.log(`[${timestamp}] Verification attempt:`, {
      mode,
      receivedToken: token,
      expectedToken: VERIFY_TOKEN
        ? "Set (not showing for security)"
        : "NOT SET",
      challenge: challenge || "No challenge provided",
    });

    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        // Respond with 200 OK and challenge token
        console.log(`[${timestamp}] WEBHOOK_VERIFIED - SUCCESS`);
        return res.status(200).send(challenge);
      } else {
        // Respond with '403 Forbidden' if verify tokens do not match
        console.log(
          `[${timestamp}] WEBHOOK_VERIFICATION_FAILED - Token mismatch`
        );
        return res.status(403).end("Forbidden");
      }
    }

    // Return 400 if params are missing
    console.log(
      `[${timestamp}] WEBHOOK_VERIFICATION_FAILED - Missing parameters`
    );
    return res.status(400).end("Missing parameters");
  }

  // Handle POST request (incoming messages)
  if (req.method === "POST") {
    try {
      console.log(`[${timestamp}] WEBHOOK POST RECEIVED`);

      // Check if body exists
      if (!req.body) {
        console.log(`[${timestamp}] ERROR: No request body`);
        return res.status(400).end("No request body");
      }

      // Check if this is a message and not a delivery report or status update
      if (
        req.body.entry &&
        req.body.entry[0].changes &&
        req.body.entry[0].changes[0].value.messages
      ) {
        const message = req.body.entry[0].changes[0].value.messages[0];
        const phoneNumber = message.from;
        const messageId = message.id;

        console.log(`[${timestamp}] Message ID: ${messageId}`);
        console.log(`[${timestamp}] From phone number: ${phoneNumber}`);
        console.log(
          `[${timestamp}] Message type: ${message.type || "undefined"}`
        );

        // Check if we've already processed this message (both in-memory and environment)
        const lastProcessedId = getLastProcessedMessageId();
        if (processedMessages.has(messageId) || messageId === lastProcessedId) {
          console.log(
            `[${timestamp}] Message ${messageId} already processed, skipping`
          );
          return res.status(200).end("OK");
        }

        // Add message to processed set and environment
        processedMessages.add(messageId);
        setLastProcessedMessageId(messageId);

        // Clean up old messages (keep only last 100 to prevent memory leaks)
        if (processedMessages.size > 100) {
          const messagesArray = Array.from(processedMessages);
          processedMessages.clear();
          messagesArray.slice(-50).forEach((id) => processedMessages.add(id));
        }

        let userConsented = false;

        // Check if this is an interactive message (button click)
        if (message.interactive) {
          console.log(`[${timestamp}] Interactive message received`);

          // Get the ID or title of the button
          const buttonId =
            message.interactive.button_reply?.id ||
            message.interactive.quick_reply?.id ||
            message.interactive.button_reply?.title ||
            message.interactive.quick_reply?.payload ||
            "";

          const buttonTitle = (
            message.interactive.button_reply?.title ||
            message.interactive.quick_reply?.title ||
            ""
          ).toUpperCase();

          console.log(
            `[${timestamp}] Button ID: ${buttonId}, Title: ${buttonTitle}`
          );

          // Strict matching for interactive messages
          if (
            buttonId === "yes_button" ||
            buttonId === "YES" ||
            buttonTitle === "YES"
          ) {
            userConsented = true;
            console.log(`[${timestamp}] User clicked yes button/quick reply`);
          }
        }
        // Check if this is a text message containing exactly "YES"
        else if (message.type === "text" && message.text) {
          const text = message.text.body.trim().toUpperCase();
          console.log(`[${timestamp}] Received text message: "${text}"`);

          // Strict matching - only exact "YES" or "Y"
          if (text === "YES" || text === "Y") {
            userConsented = true;
            console.log(`[${timestamp}] User consent detected in text`);
          }
        }

        // Process consent if granted
        if (userConsented) {
          console.log(
            `[${timestamp}] User ${phoneNumber} consented to receive messages`
          );

          // Set the recipient number in environment variable
          process.env.WHATSAPP_RECIPIENT_NUMBER = phoneNumber;
          console.log(
            `[${timestamp}] Set recipient number to ${phoneNumber} for scrapers`
          );

          // Send confirmation message
          const {
            sendMetaCloudTemplateMessage,
          } = require("../services/metaCloudService");

          try {
            console.log(`[${timestamp}] Sending confirmation message`);
            await sendMetaCloudTemplateMessage(
              "consent_confirmed",
              [],
              phoneNumber
            );
            console.log(
              `[${timestamp}] Confirmation message sent successfully`
            );
          } catch (msgError) {
            console.error(
              `[${timestamp}] Failed to send confirmation message:`,
              msgError
            );
          }

          // Run scrapers and send information
          console.log(`[${timestamp}] Starting to run scrapers...`);
          try {
            await runScrapers();
            console.log(`[${timestamp}] Scrapers completed successfully`);
          } catch (scraperError) {
            console.error(
              `[${timestamp}] Error running scrapers:`,
              scraperError
            );
          }
        } else {
          console.log(
            `[${timestamp}] No consent detected from user ${phoneNumber}`
          );
        }
      } else {
        // Handle delivery reports and status updates
        console.log(`[${timestamp}] Received non-message webhook event`);

        if (
          req.body.entry &&
          req.body.entry[0].changes &&
          req.body.entry[0].changes[0].value.statuses
        ) {
          console.log(`[${timestamp}] Status update received - ignoring`);
        } else if (
          req.body.entry &&
          req.body.entry[0].changes &&
          req.body.entry[0].changes[0].value.errors
        ) {
          console.log(`[${timestamp}] Error update received - ignoring`);
        } else {
          console.log(`[${timestamp}] Unknown webhook event type - ignoring`);
        }
      }

      // Always respond with 200 OK to WhatsApp/Meta
      console.log(`[${timestamp}] Responding with 200 OK`);
      return res.status(200).end("OK");
    } catch (error) {
      console.error(`[${timestamp}] Error processing webhook:`, error);
      return res.status(500).end("Error processing webhook");
    }
  }

  // Handle other methods
  console.log(`[${timestamp}] Unsupported method: ${req.method}`);
  return res.status(405).end("Method Not Allowed");
};
