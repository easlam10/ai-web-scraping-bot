const { extractFastStructuredContent } = require("../extraction/extractFast");
const {
  extractDatesFromFastStructuredContent,
} = require("../importantInfo/extractFastInfo");
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
const fastMessages = require("../messageTemplates/fastMessages");
const projectRoot = path.join(__dirname, "..");
const outputsDir = path.join(projectRoot, "outputs");
const publicDir = path.join(projectRoot, "public");

async function scrapFast() {
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

    const fastUrls = [
      {
        url: "https://nu.edu.pk/Admissions/Schedule",
        name: "Admission Schedule",
      },
      {
        url: "https://nu.edu.pk/Admissions/HowToApply",
        name: "Admission Procedure",
      },
      {
        url: "https://nu.edu.pk/Degree-Programs",
        name: "Program Offered",
      },
      {
        url: "https://nu.edu.pk/Admissions/EligibilityCriteria",
        name: "Eligibility Criteria",
      },
      {
        url: "https://nu.edu.pk/Admissions/TestPattern",
        name: "Test Pattern",
      },
      {
        url: "https://nu.edu.pk/Admissions/FeeStructure",
        name: "Fee Structure",
      },
      {
        url: "https://www.facebook.com/FastNUIslamabadOfficial?_rdc=1&_rdr#",
        name: "Digital Media Link",
      },
      {
        url: "https://nu.edu.pk/home/ContactUs",
        name: "Contact Details",
      },
    ];

    const pages = [];
    let dynamicData = {
      applicationDates: null,
      admissionFormalityDates: null,
      admissionTestDates: null,
      meritListDate: null,
      commencementDate: null,
    };

    // Fetch and extract data from all URLs
    for (const { url, name } of fastUrls) {
      console.log(`🌐 Scraping: ${url}`);
      const html = await fetchPageContent(url);
      const structuredData = extractFastStructuredContent(html);
      pages.push({ name, structuredData });

      const dates = extractDatesFromFastStructuredContent(structuredData);

      if (dates.applicationDates) {
        dynamicData.applicationDates = dates.applicationDates;
      }
      if (dates.admissionFormalitiesDate) {
        dynamicData.admissionFormalityDates = dates.admissionFormalitiesDate;
      }
      if (dates.admissionTestDate) {
        dynamicData.admissionTestDates = dates.admissionTestDate;
      }
      if (dates.meritListDate) {
        dynamicData.meritListDate = dates.meritListDate;
      }
      if (dates.classesCommencementDate) {
        dynamicData.commencementDate = dates.classesCommencementDate;
      }
    }

    console.log(dynamicData);

    // Process and save excel file
    // const fileName = path.join(
    //   outputsDir,
    //   `Fast_admissions_${Date.now()}.xlsx`
    // );
    // await writeToExcel(pages, fileName);
    // console.log(`✅ Excel file saved: ${fileName}`);

    // // Upload to Dropbox
    // const fileUrl = await uploadFile(fileName);
    // console.log(`📤 File uploaded to Dropbox: ${fileUrl}`);

    // // Prepare image URL
    // const bannerPath = path.join(publicDir, "images", "fast_banner.jpg");
    // const logoPath = path.join(publicDir, "images", "logo.png");
    // const finalImagePath = path.join(outputsDir, "fast_banner_with_logo.jpg");

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
        const dates = dynamicData.applicationDates || "To be announced";
        await sendMetaCloudTemplateMessage("fast_msg_1", [dates]);
      },

      // 2. Admission Formalities
      async () => {
        console.log("📨 Sending message 2: Admission Formalities");
        const dates = dynamicData.admissionFormalityDates || "To be announced";
        await sendMetaCloudTemplateMessage("fast_msg_2", [dates]);
      },

      // 3. Admission Test
      async () => {
        console.log("📨 Sending message 3: Admission Test");
        const testDates = dynamicData.admissionTestDates || "To be announced";
        await sendMetaCloudTemplateMessage("fast_msg_3", [testDates]);
      },

      // 4. Merit List
      async () => {
        console.log("📨 Sending message 4: Merit List");
        const meritListDate = dynamicData.meritListDate || "To be announced";
        await sendMetaCloudTemplateMessage("fast_msg_4", [meritListDate]);
      },

      // 5. Classes Commencement
      async () => {
        console.log("📨 Sending message 5: Classes Commencement");
        const classesCommencementDate =
          dynamicData.commencementDate || "To be announced";
        await sendMetaCloudTemplateMessage("fast_msg_5", [
          classesCommencementDate,
        ]);
      },

      // 6. Eligibility Criteria
      async () => {
        console.log("📨 Sending message 6: Eligibility Criteria");
        await sendMetaCloudTemplateMessage("fast_msg_6", []);
      },

      // 7. Test Syllabus
      async () => {
        console.log("📨 Sending message 7: Test Syllabus");
        await sendMetaCloudTemplateMessage("fast_msg_7", []);
      },

      // 8. Programmes Offered
      async () => {
        console.log("📨 Sending message 8: Programmes Offered");
        await sendMetaCloudTemplateMessage("fast_msg_8", []);
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

    console.log("✅ All FAST messages sent successfully!");
  } catch (error) {
    console.error("❌ Process failed:", error);
    if (error.code === "ENOENT") {
      console.error("File path error - please verify these directories exist:");
      console.error("- Outputs:", outputsDir);
      console.error("- Public:", publicDir);
    }
  }
}

module.exports = scrapFast;
