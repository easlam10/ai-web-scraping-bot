const { extractPieasStructuredContent } = require("../extraction/extractPieas");
const { sendWhatsAppWithMedia } = require("../services/twilioService");
const { sendWhatsAppMessage } = require("../services/whatsappService");
const uploadFile = require("../services/dropboxService");
const addLogoToImage = require("../services/addLogoToImage");
const { generateMessagesFromContent } = require("../services/aiService");
const { writeToExcel } = require("../services/excelWriter");
const { fetchPageContent } = require("../services/fetchPageContent");
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
    let messages = [];
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
        // Changed from joiningDate to match your property name
        dynamicData.classesCommencement = dates.joiningDate;
      }
    }

    if (dynamicData.firstTestDeadlines) {
      messages.push(
        pieasMessages.firstTestDeadlines({
          deadline: dynamicData.firstTestDeadlines.firstTestDeadline,
          deadlineWithLateFees:
            dynamicData.firstTestDeadlines.firstTestDeadlineWithLateFees,
        })
      );
    }

    if (dynamicData.firstTestDateAndScore) {
      messages.push(
        pieasMessages.firstTestDateAndScore({
          date: dynamicData.firstTestDateAndScore.firstTestDate,
          scoreAnnouncement: dynamicData.firstTestDateAndScore.firstTestScore,
        })
      );
    }

    if (dynamicData.secondTestDeadlines) {
      messages.push(
        pieasMessages.secondTestDeadlines({
          openingDate: dynamicData.secondTestDeadlines.secondTestOpeningDate,
          deadline: dynamicData.secondTestDeadlines.secondTestDeadline,
          deadlineWithLateFees:
            dynamicData.secondTestDeadlines.secondTestDeadlineWithLateFees,
        })
      );
    }

    if (dynamicData.secondTestDateAndScore) {
      messages.push(
        pieasMessages.secondTestDateAndScore({
          date: dynamicData.secondTestDateAndScore.secondTestDate,
          scoreAnnouncement: dynamicData.secondTestDateAndScore.secondTestScore,
        })
      );
    }

    if (dynamicData.thirdTestDeadlines) {
      messages.push(
        pieasMessages.thirdTestDeadlines({
          deadline: dynamicData.thirdTestDeadlines.thirdTestDeadline,
          deadlineWithLateFees:
            dynamicData.thirdTestDeadlines.thirdTestDeadlineWithLateFees,
        })
      );
    }

    if (dynamicData.thirdTestDate) {
      messages.push(
        pieasMessages.thirdTestDate({
          date: dynamicData.thirdTestDate,
        })
      );
    }

    if (dynamicData.meritNumber) {
      messages.push(
        pieasMessages.meritNumber({
          date: dynamicData.meritNumber,
        })
      );
    }

    if (dynamicData.classesCommencement) {
      messages.push(
        pieasMessages.classesCommencement({
          date: dynamicData.classesCommencement,
        })
      );
    }

    messages.push(pieasMessages.programsOffered());

    const fileName = path.join(
      outputsDir,
      `Pieas_admissions_${Date.now()}.xlsx`
    );
    await writeToExcel(pages, fileName);
    console.log(`✅ Excel file saved: ${fileName}`);
    // Upload to Dropbox

    const fileUrl = await uploadFile(fileName);
    console.log(`📤 File uploaded to Dropbox: ${fileUrl}`);

    // Prepare image URL (use your Dropbox link)
    const bannerPath = path.join(publicDir, "images", "nust_banner.jpg");
    const logoPath = path.join(publicDir, "images", "logo.png");
    const finalImagePath = path.join(outputsDir, "nust_banner_with_logo.jpg");
    // ✅ Generate image with logo
    await addLogoToImage(bannerPath, logoPath, finalImagePath);

    // ✅ Upload image to Dropbox
    const imageUrl = await uploadFile(finalImagePath);
    console.log(`📤 Logo image uploaded to Dropbox: ${imageUrl}`);

    // Send messages one-by-one on WhatsApp
    for (const [i, msg] of messages.entries()) {
      console.log(`📨 Sending message ${i + 1}...`);
      await sendWhatsAppMessage(msg);
    }

    console.log("🚀 All messages sent successfully!");
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
