const { extractGikiStructuredContent } = require("../extraction/extractGiki");
const {
  sendMetaCloudTemplateMessage,
} = require("../services/metaCloudService");
const uploadFile = require("../services/dropboxService");
const addLogoToImage = require("../services/addLogoToImage");
const { generateMessagesFromContent } = require("../services/aiService");
const { writeToExcel } = require("../services/excelWriter");
const { fetchPageContent } = require("../services/fetchPageContent");
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
      if (dates.applicationDates?.startDate || dates.applicationDates?.deadlineDate) {
        dynamicData.applicationDates = dynamicData.applicationDates || dates.applicationDates;
      }

      // Financial aid deadline
      if (dates.financialAidDeadline) {
        dynamicData.financialAidDeadline = dynamicData.financialAidDeadline || dates.financialAidDeadline;
      }

      // Admission test dates
      if (dates.admissionTestDates?.testDate || dates.admissionTestDates?.resultDate) {
        dynamicData.admissionTestDates = dynamicData.admissionTestDates || dates.admissionTestDates;
      }

      // Merit list date
      if (dates.meritListDate) {
        dynamicData.meritListDate = dynamicData.meritListDate || dates.meritListDate;
      }

      // Orientation dates
      if (dates.orientationDates?.orientationDate || dates.orientationDates?.commencementDate) {
        dynamicData.orientationDates = dynamicData.orientationDates || dates.orientationDates;
      }
    }

    console.log(dynamicData);

    // // Process and save excel file
    // const fileName = path.join(
    //   outputsDir,
    //   `Giki_admissions_${Date.now()}.xlsx`
    // );
    // await writeToExcel(pages, fileName);
    // console.log(`✅ Excel file saved: ${fileName}`);

    // // Upload to Dropbox
    // const fileUrl = await uploadFile(fileName);
    // console.log(`📤 File uploaded to Dropbox: ${fileUrl}`);

    // Prepare image URL
    // const bannerPath = path.join(publicDir, "images", "giki_banner.jpg");
    // const logoPath = path.join(publicDir, "images", "logo.png");
    // const finalImagePath = path.join(outputsDir, "giki_banner_with_logo.jpg");

    // // Generate image with logo
    // await addLogoToImage(bannerPath, logoPath, finalImagePath);

    // // Upload image to Dropbox
    // const imageUrl = await uploadFile(finalImagePath);
    // console.log(`📤 Logo image uploaded to Dropbox: ${imageUrl}`);

    // Send all messages in order using templates
    console.log("📱 Sending messages through Meta Cloud API...");

    // Create an array of message sending functions to send in sequence
    const messageSenders = [
      // 1. Application Schedule
      async () => {
        console.log("📨 Sending message 1: Application Schedule");
        const startingDate =
          dynamicData.applicationDates?.startDate || "To be announced";
        const deadline =
          dynamicData.applicationDates?.deadlineDate || "To be announced";
        await sendMetaCloudTemplateMessage("giki_msg_1", [
          startingDate,
          deadline,
        ]);
      },

      // 2. Financial Aid Deadline
      async () => {
        console.log("📨 Sending message 2: Financial Aid Deadline");
        const deadline = dynamicData.financialAidDeadline || "To be announced";
        await sendMetaCloudTemplateMessage("giki_msg_2", [deadline]);
      },

      // 3. Admission Test
      async () => {
        console.log("📨 Sending message 3: Admission Test");
        const testDate =
          dynamicData.admissionTestDates?.testDate || "To be announced";
        const resultDate =
          dynamicData.admissionTestDates?.resultDate || "To be announced";
        await sendMetaCloudTemplateMessage("giki_msg_3", [
          testDate,
          resultDate,
        ]);
      },

      // 4. Merit List
      async () => {
        console.log("📨 Sending message 4: Merit List");
        const meritListDate = dynamicData.meritListDate || "To be announced";
        await sendMetaCloudTemplateMessage("giki_msg_4", [meritListDate]);
      },

      // 5. Orientation Date
      async () => {
        console.log("📨 Sending message 5: Orientation Date");
        const orientationDate =
          dynamicData.orientationDates?.orientationDate || "To be announced";
        const classesCommencementDate =
          dynamicData.orientationDates?.commencementDate || "To be announced";
        await sendMetaCloudTemplateMessage("giki_msg_5", [
          orientationDate,
          classesCommencementDate,
        ]);
      },

      // 6. Classes Commencement
      async () => {
        console.log("📨 Sending message 6: Classes Commencement");
        // No parameters needed for this template
        await sendMetaCloudTemplateMessage("giki_msg_6", []);
      },

      // 7. Merit Criteria
      async () => {
        console.log("📨 Sending message 7: Merit Criteria");
        await sendMetaCloudTemplateMessage("giki_msg_7", []);
      },

      // 8. Eligibility Criteria
      async () => {
        console.log("📨 Sending message 8: Eligibility Criteria");
        await sendMetaCloudTemplateMessage("giki_msg_8", []);
      },

      // 9. Test Syllabus
      async () => {
        console.log("📨 Sending message 9: Test Syllabus");
        await sendMetaCloudTemplateMessage("giki_msg_9", []);
      },

      // 10. Application Payment Method
      async () => {
        console.log("📨 Sending message 10: Application Payment Method");
        await sendMetaCloudTemplateMessage("giki_msg_10", []);
      },

      // 11. Transfer Details
      async () => {
        console.log("📨 Sending message 11: Transfer Details");
        await sendMetaCloudTemplateMessage("giki_msg_11", []);
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
