// Simple test webhook to debug Meta Cloud API connection issues
module.exports = async (req, res) => {
  // Add proper CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // If preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Log every request
  console.log("=============== TEST WEBHOOK HIT ===============");
  console.log("Method:", req.method);
  console.log("Query params:", JSON.stringify(req.query));
  console.log("Headers:", JSON.stringify(req.headers));

  // For GET requests, handle webhook verification
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("Verification attempt:", { mode, token, challenge });

    // Use your ACTUAL verify token from environment variables
    const VERIFY_TOKEN =
      process.env.WEBHOOK_VERIFY_TOKEN || "your_verify_token_here";

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Verification successful, returning challenge");
      return res.status(200).send(challenge);
    }

    console.log("Verification failed: Invalid verify token");
    return res.status(403).send("Forbidden");
  }

  // For POST requests, log the body
  if (req.method === "POST") {
    console.log("POST Body:", JSON.stringify(req.body, null, 2));

    // Check if this is a message event
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0].value.messages
    ) {
      const message = req.body.entry[0].changes[0].value.messages[0];
      console.log("DETECTED MESSAGE:", JSON.stringify(message, null, 2));
    }

    return res.status(200).send("OK");
  }

  // For any other method
  return res.status(200).send("Test webhook is working");
};
