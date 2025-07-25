const { Client, RemoteAuth } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");

class WhatsAppWebService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.initialize();
  }

  async initialize() {
    try {
      // Connect to MongoDB
      console.log("Connecting to MongoDB...");
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("✅ Connected to MongoDB successfully!");

      // Create MongoDB store
      const store = new MongoStore({ mongoose });

      // Create WhatsApp client with RemoteAuth
      this.client = new Client({
        authStrategy: new RemoteAuth({
          store: store,
          backupSyncIntervalMs: 300000, // Sync every 5 minutes
          clientId: "app2", // Use the same clientId as the original app
        }),
        puppeteer: {
          args: ["--no-sandbox"],
          headless: true,
        },
      });

      // Handle QR code generation
      this.client.on("qr", (qr) => {
        console.log("No saved session found. Please scan this QR code:");
        qrcode.generate(qr, { small: true });

        // Save QR code to file for remote access
        fs.writeFileSync(path.join(__dirname, "../qr-code.txt"), qr);
        console.log("QR code also saved to qr-code.txt");
      });

      // Authentication events
      this.client.on("authenticated", () => {
        console.log("Authentication successful!");
      });

      this.client.on("remote_session_saved", () => {
        console.log("Session saved to MongoDB!");
      });

      // Ready event
      this.client.on("ready", () => {
        this.isReady = true;
        console.log("Client is ready! Session loaded from MongoDB.");
      });

      this.client.on("disconnected", () => {
        this.isReady = false;
        console.log("WhatsApp client disconnected. Attempting to reconnect...");
        setTimeout(() => this.initialize(), 5000);
      });

      // Initialize the client
      console.log("Initializing WhatsApp client with saved session...");
      this.client.initialize();
    } catch (error) {
      console.error("Error starting WhatsApp client:", error);
      setTimeout(() => this.initialize(), 10000);
    }
  }

  // Send message to a specified number
  async sendMessage(to, message) {
    try {
      await this.waitForReady();

      // Format number for WhatsApp
      const formattedNumber = this.formatPhoneNumber(to);
      const chatId = `${formattedNumber}@c.us`;

      // Send the message
      console.log(`Sending message to ${to}...`);
      const response = await this.client.sendMessage(chatId, message);
      console.log(`Message sent successfully!`);
      return response;
    } catch (error) {
      console.error(`Failed to send message to ${to}:`, error);
      throw error;
    }
  }

  // Send messages in sequence from message templates
  async sendMessagesInSequence(to, messages) {
    try {
      await this.waitForReady();

      // Format number for WhatsApp
      const formattedNumber = this.formatPhoneNumber(to);
      const chatId = `${formattedNumber}@c.us`;

      const results = [];
      for (const message of messages) {
        // Skip commented out messages (those starting with //)
        if (typeof message === "string" && message.trim().startsWith("//")) {
          console.log(
            `Skipping commented message: ${message.substring(0, 30)}...`
          );
          continue;
        }

        // Send the message
        console.log(`Sending message to ${to}...`);
        const response = await this.client.sendMessage(chatId, message);
        results.push(response);
        console.log("Message sent successfully!");

        // Add a 5-second delay between messages
        console.log("Waiting 5 seconds before sending next message...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      console.log(`All messages sent to ${to}`);
      return results;
    } catch (error) {
      console.error(`Failed to send messages to ${to}:`, error);
      throw error;
    }
  }

  // Wait for client to be ready
  async waitForReady() {
    if (this.isReady) return;

    console.log("Waiting for WhatsApp client to be ready...");
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.isReady) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 1000);
    });
  }

  // Format phone number to WhatsApp format
  formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    return phoneNumber.replace(/\D/g, "");
  }
}

// Create singleton instance
const whatsappWebService = new WhatsAppWebService();

module.exports = whatsappWebService;