const { extractNumsStructuredContent } = require("../extraction/extractNums");
const {
  sendMetaCloudTemplateMessage,
} = require("../services/metaCloudService");
const uploadFile = require("../services/dropboxService");
const addLogoToImage = require("../services/addLogoToImage");
const { generateMessagesFromContent } = require("../services/aiService");
const { writeToExcel } = require("../services/excelWriter");
const { fetchPageContent } = require("../services/fetchPageContent");
const path = require("path");
const fs = require("fs");
const projectRoot = path.join(__dirname, "..");
const outputsDir = path.join(projectRoot, "outputs");
const publicDir = path.join(projectRoot, "public");

async function scrapNums() {
  try {
    try {
      if (!fs.existsSync(outputsDir)) {
        fs.mkdirSync(outputsDir, { recursive: true });
        console.log(`📁 Created outputs directory: ${outputsDir}`);
      }
    } catch (dirError) {
      console.error("❌ Failed to create outputs directory:", dirError);
      throw dirError;
    }

    const numsUrls = [
      {
        url: "https://numspak.edu.pk/admissions",
        name: "Admissions",
      },
      {
        url: "https://numspak.edu.pk/admissions/undergraduate-programs",
        name: "Undergraduate Programs",
      },
      {
        url: "https://numspak.edu.pk/admissions/admission-schedule",
        name: "Admission Schedule",
      },
      {
        url: "https://numspak.edu.pk/admissions/admission-process",
        name: "Admission Process",
      },
      {
        url: "https://numspak.edu.pk/admissions/eligibility-criteria",
        name: "Eligibility Criteria",
      },
      {
        url: "https://numspak.edu.pk/admissions/fee-structure",
        name: "Fee Structure",
      },
      {
        url: "https://numspak.edu.pk/admissions/nums-entry-test",
        name: "NUMS Entry Test",
      },
      {
        url: "https://www.facebook.com/NUMSPakistan/",
        name: "Digital Media Link",
      },
      {
        url: "https://numspak.edu.pk/contact-us",
        name: "Contact Details",
      },
    ];

    const pages = [];

    // Fetch and extract data from all URLs
    for (const { url, name } of numsUrls) {
      console.log(`🌐 Scraping: ${url}`);
      const html = await fetchPageContent(url);
      const structuredData = extractNumsStructuredContent(html);
      pages.push({ name, structuredData });
    }

    // Process and save excel file
    const fileName = path.join(
      outputsDir,
      `Nums_admissions_${Date.now()}.xlsx`
    );
    await writeToExcel(pages, fileName);
    console.log(`✅ Excel file saved: ${fileName}`);

    // Upload to Dropbox
    const fileUrl = await uploadFile(fileName);
    console.log(`📤 File uploaded to Dropbox: ${fileUrl}`);

    // Prepare image URL
    const bannerPath = path.join(publicDir, "images", "nums_banner.jpg");
    const logoPath = path.join(publicDir, "images", "logo.png");
    const finalImagePath = path.join(outputsDir, "nums_banner_with_logo.jpg");

    // Generate image with logo
    await addLogoToImage(bannerPath, logoPath, finalImagePath);

    // Upload image to Dropbox
    const imageUrl = await uploadFile(finalImagePath);
    console.log(`📤 Logo image uploaded to Dropbox: ${imageUrl}`);

    // Send all messages in order using templates
    console.log("📱 Sending messages through Meta Cloud API...");

    // Create an array of message sending functions to send in sequence
    const messageSenders = [
      // 1. Undergraduate Programs
      async () => {
        console.log("📨 Sending message 1: Undergraduate Programs");
        // Parameters will be manually added by the user
        await sendMetaCloudTemplateMessage("nums_msg_1", []);
      },

      // 2. Admission Schedule
      async () => {
        console.log("📨 Sending message 2: Admission Schedule");
        // Parameters will be manually added by the user
        await sendMetaCloudTemplateMessage("nums_msg_2", []);
      },

      // 3. Admission Process
      async () => {
        console.log("📨 Sending message 3: Admission Process");
        // Parameters will be manually added by the user
        await sendMetaCloudTemplateMessage("nums_msg_3", []);
      },

      // 4. Eligibility Criteria
      async () => {
        console.log("📨 Sending message 4: Eligibility Criteria");
        // Parameters will be manually added by the user
        await sendMetaCloudTemplateMessage("nums_msg_4", []);
      },

      // 5. NUMS Entry Test
      async () => {
        console.log("📨 Sending message 5: NUMS Entry Test");
        // Parameters will be manually added by the user
        await sendMetaCloudTemplateMessage("nums_msg_5", []);
      },

      // 6. Fee Structure
      async () => {
        console.log("📨 Sending message 6: Fee Structure");
        // Parameters will be manually added by the user
        await sendMetaCloudTemplateMessage("nums_msg_6", []);
      },
    ];

    // Send all messages in sequence
    for (let i = 0; i < messageSenders.length; i++) {
      try {
        await messageSenders[i]();
        console.log(`✅ Message ${i + 1} sent successfully`);
      } catch (error) {
        console.error(`❌ Failed to send message ${i + 1}:`, error.message);
      }
    }

    console.log("✅ All NUMS messages sent successfully!");
  } catch (error) {
    console.error("❌ Process failed:", error);
    if (error.code === "ENOENT") {
      console.error("File path error - please verify these directories exist:");
      console.error("- Outputs:", outputsDir);
      console.error("- Public:", publicDir);
    }
  }
}

module.exports = scrapNums;
