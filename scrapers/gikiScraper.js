const { extractGikiStructuredContent } = require("../extraction/extractGiki");
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
  extractDatesFromGikiStructuredContent,
} = require("../importantInfo/extractGikiInfo");
const gikiMessages = require("../messageTemplates/gikiMessages");
const path = require("path");
const fs = require("fs");
const projectRoot = path.join(__dirname, "..");
const outputsDir = path.join(projectRoot, "outputs");
const publicDir = path.join(projectRoot, "public");

async function scrapGiki() {
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

    const gikiUrls = [
      {
        url: "https://giki.edu.pk/admissions/undergraduate/",
        name: "Undergraduate",
      },
      {
        url: "https://giki.edu.pk/admissions/undergraduate/eligibility-criteria/",
        name: "Eligibility Criteria",
      },
      {
        url: "https://giki.edu.pk/admissions/undergraduate/admission-procedure/",
        name: "Admission Procedure",
      },
      {
        url: "https://giki.edu.pk/admissions/undergraduate/admission-schedule/",
        name: "Admission Schedule",
      },
      {
        url: "https://giki.edu.pk/admissions/undergraduate/fee-structure/",
        name: "Fee Structure",
      },
      {
        url: "https://giki.edu.pk/admissions/undergraduate/financial-assistance/",
        name: "Financial Assistance",
      },
      {
        url: "https://giki.edu.pk/admissions/undergraduate/admission-test-pattern/",
        name: "Admission Test Pattern",
      },
      {
        url: "https://giki.edu.pk/academics/faculties/",
        name: "Faculties",
      },
      {
        url: "https://www.facebook.com/GIKInstitute.official/ ",
        name: "Digital Media Link",
      },
      {
        url: "https://giki.edu.pk/contact-us/",
        name: "Contact Details",
      },
    ];

    const pages = [];
    let dynamicData = {
      applicationDates: null,
      financialAidDeadline: null,
      admissionTestDates: null,
      meritListDate: null,
      orientationDates: null,
    };

    // Fetch and extract data from all URLs
    for (const { url, name } of gikiUrls) {
      console.log(`🌐 Scraping: ${url}`);
      const html = await fetchPageContent(url);
      const structuredData = extractGikiStructuredContent(html);
      pages.push({ name, structuredData });

      const dates = extractDatesFromGikiStructuredContent(structuredData);

      // Application dates
      if (
        dates.applicationDates?.startDate ||
        dates.applicationDates?.deadlineDate
      ) {
        dynamicData.applicationDates =
          dynamicData.applicationDates || dates.applicationDates;
      }

      // Financial aid deadline
      if (dates.financialAidDeadline) {
        dynamicData.financialAidDeadline =
          dynamicData.financialAidDeadline || dates.financialAidDeadline;
      }

      // Admission test dates
      if (
        dates.admissionTestDates?.testDate ||
        dates.admissionTestDates?.resultDate
      ) {
        dynamicData.admissionTestDates =
          dynamicData.admissionTestDates || dates.admissionTestDates;
      }

      // Merit list date
      if (dates.meritListDate) {
        dynamicData.meritListDate =
          dynamicData.meritListDate || dates.meritListDate;
      }

      // Orientation dates
      if (
        dates.orientationDates?.orientationDate ||
        dates.orientationDates?.commencementDate
      ) {
        dynamicData.orientationDates =
          dynamicData.orientationDates || dates.orientationDates;
      }
    }

    console.log(dynamicData);

    // Process and save excel file
    // const fileName = path.join(
    //   outputsDir,
    //   `Giki_admissions_${Date.now()}.xlsx`
    // );
    // await writeToExcel(pages, fileName);
    // console.log(`✅ Excel file saved: ${fileName}`);

    // // Upload to Dropbox
    // const fileUrl = await uploadFile(fileName);
    // console.log(`📤 File uploaded to Dropbox: ${fileUrl}`);

    // // Prepare image URL
    // const bannerPath = path.join(publicDir, "images", "giki_banner.jpg");
    // const logoPath = path.join(publicDir, "images", "logo.png");
    // const finalImagePath = path.join(outputsDir, "giki_banner_with_logo.jpg");

    // // Generate image with logo
    // await addLogoToImage(bannerPath, logoPath, finalImagePath);

    // // Upload image to Dropbox
    // const imageUrl = await uploadFile(finalImagePath);
    // console.log(`📤 Logo image uploaded to Dropbox: ${imageUrl}`);

    // Send all messages in sequence using templates
    console.log("📱 Sending messages through WhatsApp Web...");

    // Recipient phone number (replace with actual number when needed)
    const recipientNumber =
      process.env.DEFAULT_RECIPIENT_NUMBER;

    // Prepare all messages using templates and dynamic data
    const messages = [
      // Merit Criteria
      gikiMessages.meritCriteria(),

      // Eligibility Criteria
      gikiMessages.eligibiltyCriteria(),

      // Test Syllabus
      gikiMessages.testSyllabus(),

      // Application Payment Method
      gikiMessages.applicationPaymentMethod(),

      // Transfer Details
      gikiMessages.transferDetails(),
    ];

    // Send all messages in sequence
    await whatsappWebService.sendMessagesInSequence(recipientNumber, messages);

    console.log("✅ All GIKI messages sent successfully!");
  } catch (error) {
    console.error("❌ Process failed:", error);
    if (error.code === "ENOENT") {
      console.error("File path error - please verify these directories exist:");
      console.error("- Outputs:", outputsDir);
      console.error("- Public:", publicDir);
    }
  }
}

module.exports = scrapGiki;
