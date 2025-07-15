// Webhook handler for Meta/WhatsApp
const { runScrapers } = require("../index");

// Environment variables are automatically available in Vercel

module.exports = async (req, res) => {
  // Add timestamp to all logs
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ===== WEBHOOK RECEIVED =====`);
  console.log(`[${timestamp}] Method: ${req.method}`);
  console.log(`[${timestamp}] URL: ${req.url}`);
  console.log(`[${timestamp}] Headers:`, JSON.stringify(req.headers, null, 2));

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

      console.log(
        `[${timestamp}] FULL WEBHOOK REQUEST BODY:`,
        JSON.stringify(req.body, null, 2)
      );

      // Debug the structure of the request body
      const hasEntry = req.body.entry ? "Yes" : "No";
      const hasChanges =
        req.body.entry && req.body.entry[0] && req.body.entry[0].changes
          ? "Yes"
          : "No";
      const hasValue =
        hasChanges === "Yes" && req.body.entry[0].changes[0].value
          ? "Yes"
          : "No";
      const hasMessages =
        hasValue === "Yes" && req.body.entry[0].changes[0].value.messages
          ? "Yes"
          : "No";

      console.log(`[${timestamp}] Request body structure check:`, {
        hasEntry,
        hasChanges,
        hasValue,
        hasMessages,
      });

      // Check if this is a message and not a delivery report
      if (
        req.body.entry &&
        req.body.entry[0].changes &&
        req.body.entry[0].changes[0].value.messages
      ) {
        const message = req.body.entry[0].changes[0].value.messages[0];
        const phoneNumber = message.from;

        console.log(
          `[${timestamp}] Message type:`,
          message.type || "undefined"
        );
        console.log(
          `[${timestamp}] Message content:`,
          JSON.stringify(message, null, 2)
        );
        console.log(`[${timestamp}] From phone number:`, phoneNumber);

        let userConsented = false;

        // Check if this is a interactive message (button click) - FIXED
        if (message.interactive) {
          console.log(
            `[${timestamp}] Interactive message received:`,
            JSON.stringify(message.interactive, null, 2)
          );

          // Get the ID or title of the button
          const buttonId =
            message.interactive.button_reply?.id ||
            message.interactive.quick_reply?.id ||
            message.interactive.button_reply?.title ||
            message.interactive.quick_reply?.payload ||
            "";

          console.log(`[${timestamp}] Button ID detected:`, buttonId);

          // For quick replies, also check the payload or title
          const buttonTitle = (
            message.interactive.button_reply?.title ||
            message.interactive.quick_reply?.title ||
            ""
          ).toUpperCase();

          console.log(`[${timestamp}] Button title detected:`, buttonTitle);

          // If the user clicked "yes" or a button with YES in the title/payload
          if (
            buttonId === "yes_button" ||
            buttonId === "YES" ||
            buttonTitle === "YES" ||
            buttonTitle.includes("YES")
          ) {
            userConsented = true;
            console.log(`[${timestamp}] User clicked yes button/quick reply`);
          }
        }
        // Check if this is a text message containing "YES"
        else if (message.type === "text" && message.text) {
          const text = message.text.body.trim().toUpperCase();
          console.log(`[${timestamp}] Received text message:`, text);

          if (
            text === "YES" ||
            text === "Y" ||
            text.includes("YES") ||
            text === "1"
          ) {
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

          // Run scrapers and send information
          // Note: This might time out on Vercel's free tier if scrapers take too long
          // Consider triggering a separate process or queue for long-running tasks
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
        console.log(
          `[${timestamp}] Received non-message webhook event or delivery report`
        );
        console.log(`[${timestamp}] Event type:`, req.body.object || "unknown");

        // Check for status updates
        if (
          req.body.entry &&
          req.body.entry[0].changes &&
          req.body.entry[0].changes[0].value.statuses
        ) {
          console.log(
            `[${timestamp}] Status update received:`,
            JSON.stringify(req.body.entry[0].changes[0].value.statuses, null, 2)
          );
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
