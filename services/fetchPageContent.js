const axios = require("axios");
const { browserless } = require("../config/keys");

async function fetchPageContent(url) {
  try {
    const response = await axios.post(
      `https://production-sfo.browserless.io/content?token=${browserless.apiKey}`,
      {
        url: url,
        gotoOptions: {
          waitUntil: "networkidle2",
          timeout: 60000,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching page content with browserless:",
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = { fetchPageContent };
