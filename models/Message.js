const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    index: true,
  },
  content: {
    type: String,
  },
  messageId: {
    type: String,
  },
  messageType: {
    type: String,
    enum: ["text", "interactive", "image", "document", "location", "unknown"],
    default: "text",
  },
  hasConsented: {
    type: Boolean,
    default: false,
  },
  consentDate: {
    type: Date,
  },
  processed: {
    type: Boolean,
    default: false,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create an index on phone number for faster lookups
messageSchema.index({ phoneNumber: 1 });

// Add a method to check if a user has given consent
messageSchema.statics.userHasConsented = async function (phoneNumber) {
  const consentRecord = await this.findOne({
    phoneNumber: phoneNumber,
    hasConsented: true,
  }).sort({ consentDate: -1 });

  return !!consentRecord;
};

// Add a method to mark user as consented
messageSchema.statics.markUserConsented = async function (phoneNumber) {
  return this.findOneAndUpdate(
    { phoneNumber },
    {
      hasConsented: true,
      consentDate: new Date(),
    },
    {
      new: true,
      upsert: true,
    }
  );
};

// Get unprocessed consent messages
messageSchema.statics.getUnprocessedConsents = async function () {
  return this.find({
    hasConsented: true,
    processed: false,
  }).sort({ consentDate: 1 });
};

module.exports =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
