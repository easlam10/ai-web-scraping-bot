const { extractPieasStructuredContent } = require("../extraction/extractPieas");
const {
  sendMetaCloudTemplateMessage,
} = require("../services/metaCloudService");
const uploadFile = require("../services/dropboxService");
const addLogoToImage = require("../services/addLogoToImage");
const { generateMessagesFromContent } = require("../services/aiService");
const { writeToExcel } = require("../services/excelWriter");
const { fetchPageContent } = require("../services/fetchPageContent");
const whatsappWebService = require("../services/whatsappWebService");
const {
  extractDatesFromPieasStructuredContent,
} = require("../importantInfo/extractPieasInfo");
const pieasMessages = require("../messageTemplates/pieasMessages");
const path = require("path");
const fs = require("fs");
const projectRoot = path.join(__dirname, "..");
const outputsDir = path.join(projectRoot, "outputs");
const publicDir = path.join(projectRoot, "public");

async function scrapPieas() {
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

    const pieasUrls = [
      {
        url: "https://admissions.pieas.edu.pk/Admissions/BS.html",
        name: "Undergraduate programs",
      },
      {
        url: "https://admissions.pieas.edu.pk/Academic_Rules/academic_rules.html",
        name: "Rules and Policies",
      },
      {
        url: "https://admissions.pieas.edu.pk/Admissions/schedule.html",
        name: "BS Admissions (2025-2029)",
      },
      {
        url: "https://admissions.pieas.edu.pk/Academic_Rules/fee_structure.html",
        name: "Fee Structure",
      },
      {
        url: "https://www.facebook.com/PIEAS.official.pk/ ",
        name: "Digital Media Link",
      },
      {
        url: "https://www.pieas.edu.pk/contactusvone.cshtml  ",
        name: "Contact Details",
      },
    ];

    const pages = [];
    let dynamicData = {
      firstTestDeadlines: null,
      firstTestDateAndScore: null,
      secondTestDeadlines: null,
      secondTestDateAndScore: null,
      thirdTestDeadlines: null,
      thirdTestDate: null,
      meritNumber: null,
      classesCommencement: null,
    };

    // Fetch and extract data from all URLs
    for (const { url, name } of pieasUrls) {
      console.log(`🌐 Scraping: ${url}`);
      const html = await fetchPageContent(url);
      const structuredData = extractPieasStructuredContent(html);
      pages.push({ name, structuredData });

      const dates = extractDatesFromPieasStructuredContent(structuredData);

      // First Test Dates - only set if both deadline fields exist
      if (
        dates.firstTestDeadlines?.firstTestDeadline &&
        dates.firstTestDeadlines?.firstTestDeadlineWithLateFees
      ) {
        dynamicData.firstTestDeadlines = dates.firstTestDeadlines;
      }

      // First Test Date and Score - only set if both fields exist
      if (
        dates.firstTestDateAndScore?.firstTestDate &&
        dates.firstTestDateAndScore?.firstTestScore
      ) {
        dynamicData.firstTestDateAndScore = dates.firstTestDateAndScore;
      }

      // Second Test Deadlines - only set if all three fields exist
      if (
        dates.secondTestDeadlines?.secondTestOpeningDate &&
        dates.secondTestDeadlines?.secondTestDeadline &&
        dates.secondTestDeadlines?.secondTestDeadlineWithLateFees
      ) {
        dynamicData.secondTestDeadlines = dates.secondTestDeadlines;
      }

      // Second Test Date and Score - only set if both fields exist
      if (
        dates.secondTestDateAndScore?.secondTestDate &&
        dates.secondTestDateAndScore?.secondTestScore
      ) {
        dynamicData.secondTestDateAndScore = dates.secondTestDateAndScore;
      }

      // Third Test Deadlines - only set if all three fields exist
      if (
        dates.thirdTestDeadlines?.thirdTestOpeningDate &&
        dates.thirdTestDeadlines?.thirdTestDeadline &&
        dates.thirdTestDeadlines?.thirdTestDeadlineWithLateFees
      ) {
        dynamicData.thirdTestDeadlines = dates.thirdTestDeadlines;
      }

      // Simple fields - just check if they exist
      if (dates.thirdTestDate) {
        dynamicData.thirdTestDate = dates.thirdTestDate;
      }

      if (dates.meritNumber) {
        dynamicData.meritNumber = dates.meritNumber;
      }

      if (dates.joiningDate) {
        dynamicData.classesCommencement = dates.joiningDate;
      }
    }
    console.log(dynamicData);

    // Process and save excel file
    // const fileName = path.join(
    //   outputsDir,
    //   `Pieas_admissions_${Date.now()}.xlsx`
    // );
    // await writeToExcel(pages, fileName);
    // console.log(`✅ Excel file saved: ${fileName}`);

    // // Upload to Dropbox
    // const fileUrl = await uploadFile(fileName);
    // console.log(`📤 File uploaded to Dropbox: ${fileUrl}`);

    // // Prepare image URL
    // const bannerPath = path.join(publicDir, "images", "pieas_banner.jpg");
    // const logoPath = path.join(publicDir, "images", "logo.png");
    // const finalImagePath = path.join(outputsDir, "pieas_banner_with_logo.jpg");

    // // Generate image with logo
    // await addLogoToImage(bannerPath, logoPath, finalImagePath);

    // // Upload image to Dropbox
    // const imageUrl = await uploadFile(finalImagePath);
    // console.log(`📤 Logo image uploaded to Dropbox: ${imageUrl}`);

    // Send all messages in sequence using templates
    console.log("📱 Sending messages through WhatsApp Web...");

    // Recipient phone number
    const recipientNumber = process.env.DEFAULT_RECIPIENT_NUMBER;

    // Prepare all messages using templates and dynamic data
    const messages = [
      // 1. First Test Deadlines
      pieasMessages.firstTestDeadlines({
        deadline:
          dynamicData.firstTestDeadlines?.firstTestDeadline ||
          "To be announced",
        deadlineWithLateFees:
          dynamicData.firstTestDeadlines?.firstTestDeadlineWithLateFees ||
          "To be announced",
      }),

      // 2. First Test Date and Score
      pieasMessages.firstTestDateAndScore({
        date:
          dynamicData.firstTestDateAndScore?.firstTestDate || "To be announced",
        scoreAnnouncement:
          dynamicData.firstTestDateAndScore?.firstTestScore ||
          "To be announced",
      }),

      // 3. Second Test Deadlines
      pieasMessages.secondTestDeadlines({
        openingDate:
          dynamicData.secondTestDeadlines?.secondTestOpeningDate ||
          "To be announced",
        deadline:
          dynamicData.secondTestDeadlines?.secondTestDeadline ||
          "To be announced",
        deadlineWithLateFees:
          dynamicData.secondTestDeadlines?.secondTestDeadlineWithLateFees ||
          "To be announced",
      }),

      // 4. Second Test Date and Score
      pieasMessages.secondTestDateAndScore({
        date:
          dynamicData.secondTestDateAndScore?.secondTestDate ||
          "To be announced",
        scoreAnnouncement:
          dynamicData.secondTestDateAndScore?.secondTestScore ||
          "To be announced",
      }),

      // 5. Third Test Deadlines
      pieasMessages.thirdTestDeadlines({
        openingDate:
          dynamicData.thirdTestDeadlines?.thirdTestOpeningDate ||
          "To be announced",
        deadline:
          dynamicData.thirdTestDeadlines?.thirdTestDeadline ||
          "To be announced",
        deadlineWithLateFees:
          dynamicData.thirdTestDeadlines?.thirdTestDeadlineWithLateFees ||
          "To be announced",
      }),

      // 6. Third Test Date
      pieasMessages.thirdTestDate({
        date: dynamicData.thirdTestDate || "To be announced",
      }),

      // 7. Merit Number
      pieasMessages.meritNumber({
        date: dynamicData.meritNumber || "To be announced",
      }),

      // 8. Classes Commencement
      pieasMessages.classesCommencement({
        date: dynamicData.classesCommencement || "To be announced",
      }),

      // 9. Programs Offered
      pieasMessages.programsOffered(),
    ];

    // Send all messages in sequence
    await whatsappWebService.sendMessagesInSequence(recipientNumber, messages);

    console.log("✅ All PIEAS messages sent successfully!");
  } catch (error) {
    console.error("❌ Process failed:", error);
    if (error.code === "ENOENT") {
      console.error("File path error - please verify these directories exist:");
      console.error("- Outputs:", outputsDir);
      console.error("- Public:", publicDir);
    }
  }
}

module.exports = scrapPieas;
