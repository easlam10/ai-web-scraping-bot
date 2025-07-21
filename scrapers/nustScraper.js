const { extractNustStructuredContent } = require("../extraction/extractNust");
const nustMessages = require("../messageTemplates/nustMessages");
const {
  sendMetaCloudTemplateMessage,
} = require("../services/metaCloudService");
const uploadFile = require("../services/dropboxService");
const addLogoToImage = require("../services/addLogoToImage");
const { writeToExcel } = require("../services/excelWriter");
const { fetchPageContent } = require("../services/fetchPageContent");
const { generateMessagesFromContent } = require("../services/aiService");
const {
  extractLatestNetDeadlineAndExamDate,
  extractMathCourseDateForFscPreMed,
  extractAllNetRegistrationRanges,
  extractActSatDates,
} = require("../importantInfo/extractNustInfo");
const path = require("path");
const fs = require("fs");
const projectRoot = path.join(__dirname, "..");
const outputsDir = path.join(projectRoot, "outputs");
const publicDir = path.join(projectRoot, "public");

// Helper function to add delay between messages
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapNust() {
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

    const nustUrls = [
      {
        url: "https://nust.edu.pk/admissions/undergraduates/updates-on-ug-admissions/",
        name: "Updates on UG Admissions",
      },
      {
        url: "https://nust.edu.pk/admissions/undergraduates/eligibility-criteria-for-ug-programmes/",
        name: "Eligibility Criteria for UG Programmes",
      },
      {
        url: "https://nust.edu.pk/admissions/undergraduates/academic-qualification-required-for-different-ug-",
        name: "Academic Qualification Required for Different UG Programmes",
      },
      {
        url: "https://nust.edu.pk/admissions/undergraduates/procedure-of-admission-on-the-basis-of-net/",
        name: "Procedure of Admission on the Basis of NET",
      },
      {
        url: "https://nust.edu.pk/admissions/undergraduates/undergraduate-selection-process/",
        name: "Undergraduate Selection Process",
      },
      {
        url: "https://nust.edu.pk/admissions/undergraduates/list-of-ug-programmes-and-institutions/",
        name: "list of undergraduate programmes and institutions",
      },
      {
        url: "https://nust.edu.pk/admissions/undergraduates/dates-to-remember/",
        name: "Dates to rememeber",
      },
      {
        url: "https://nust.edu.pk/admissions/undergraduates/ug-admission-application-processing-fee/",
        name: "Application processing fee",
      },
      {
        url: "https://nust.edu.pk/admissions/undergraduates/cancellation-of-admission/",
        name: "Cancellation of admission",
      },
      {
        url: "https://nust.edu.pk/admissions/undergraduates/subjects-included-in-net-with-weightings/",
        name: "Subjects included in NET",
      },
      {
        url: "https://nust.edu.pk/admissions/undergraduates/merit-criteria-for-admission-on-net-basis",
        name: "Merit generation criteria",
      },
      {
        url: "https://nust.edu.pk/admissions/undergraduates/ineligibility-criteria/",
        name: "ineligibility criteria",
      },
      {
        url: "https://www.facebook.com/nustofficial/  ",
        name: "Digital Page Link",
      },
      {
        url: "https://nust.edu.pk/about-us/resources-offices/ ",
        name: "Contact Details",
      },
    ];

    const pages = [];
    let dynamicData = {
      netDates: null,
      mathDeadline: null,
      netSeries: null,
      actSatDates: null,
    };

    // Fetch and extract data from all URLs
    for (const { url, name } of nustUrls) {
      console.log(`🌐 Scraping: ${url}`);
      const html = await fetchPageContent(url);
      const structuredData = extractNustStructuredContent(html);
      pages.push({ name, structuredData });

      // Extract dynamic data from each page with fallbacks
      const netData = extractLatestNetDeadlineAndExamDate(html);
      const mathData = extractMathCourseDateForFscPreMed(html);
      const netSeriesData = extractAllNetRegistrationRanges(html);
      const actSatData = extractActSatDates(structuredData);

      if (netData?.deadline && netData?.examStartDate && netData?.series)
        dynamicData.netDates = dynamicData.netDates || netData;

      if (mathData)
        dynamicData.mathDeadline = dynamicData.mathDeadline || mathData;

      if (netSeriesData)
        dynamicData.netSeries = dynamicData.netSeries || netSeriesData;

      if (
        (!dynamicData.actSatDates?.registrationWindow &&
          actSatData.registrationWindow) ||
        (!dynamicData.actSatDates?.scoreDeadline && actSatData.scoreDeadline)
      ) {
        dynamicData.actSatDates = actSatData;
      }
    }

    // console.log(dynamicData)

    // // Process and save excel file
    // const fileName = path.join(
    //   outputsDir,
    //   `Nust_admissions_${Date.now()}.xlsx`
    // );
    // await writeToExcel(pages, fileName);
    // console.log(`✅ Excel file saved: ${fileName}`);

    // // Upload to Dropbox
    // const fileUrl = await uploadFile(fileName);
    // console.log(`📤 File uploaded to Dropbox: ${fileUrl}`);

    // // Prepare image URL
    // const bannerPath = path.join(publicDir, "images", "nust_banner.jpg");
    // const logoPath = path.join(publicDir, "images", "logo.png");
    // const finalImagePath = path.join(outputsDir, "nust_banner_with_logo.jpg");

    // // Generate image with logo
    // await addLogoToImage(bannerPath, logoPath, finalImagePath);

    // // Upload image to Dropbox
    // const imageUrl = await uploadFile(finalImagePath);
    // console.log(`📤 Logo image uploaded to Dropbox: ${imageUrl}`);

    // Send all messages in order using templates
    console.log("📱 Sending messages through Meta Cloud API...");

    // Create an array of message sending functions to send in sequence
    const messageSenders = [
      // // 1. NET Admission Schedule
      // async () => {
      //   console.log("📨 Sending message 1: NET Admission Schedule");
      //   // Adding netData parameters for testing
      //   const series = dynamicData.netDates?.series || "upcoming";
      //   const deadline = dynamicData.netDates?.deadline || "To be announced";
      //   const examStartDate =
      //     dynamicData.netDates?.examStartDate || "To be announced";

      //   console.log("Test parameters:", { series, deadline, examStartDate });

      //   await sendMetaCloudTemplateMessage("nust_msg_1", [
      //     series,
      //     deadline,
      //     examStartDate,
      //   ]);
      // },

      // 2. Math Course Info
      async () => {
        console.log("📨 Sending message 2: Math Course Info");
        const mathDeadline = dynamicData.mathDeadline || "To be announced";
        await sendMetaCloudTemplateMessage("nust_msg_2", [mathDeadline]);
      },

      // 3. New Programmes
      async () => {
        console.log("📨 Sending message 3: New Programmes");
        // Parameters will be manually added by the user
        await sendMetaCloudTemplateMessage("nust_msg_3", []);
      },

      // 4. Multi Entry Test Schedule
      async () => {
        console.log("📨 Sending message 4: Multi Entry Test Schedule");

        // Initialize default values
        let series1 = "To be announced";
        let series2 = "To be announced";
        let series3 = "To be announced";
        let series4 = "To be announced";

        // Check if netSeries is an array (direct result from extractAllNetRegistrationRanges)
        if (Array.isArray(dynamicData.netSeries)) {
          // Process each series directly
          for (const test of dynamicData.netSeries) {
            if (test.series === "Series I") {
              series1 = `${test.startDate} - ${test.endDate}`;
            } else if (test.series === "Series II") {
              series2 = `${test.startDate} - ${test.endDate}`;
            } else if (test.series === "Series III") {
              series3 = `${test.startDate} - ${test.endDate}`;
            } else if (test.series === "Series IV") {
              series4 = `${test.startDate} - ${test.endDate}`;
            }
          }
        }
        // Original nested structure handling
        else if (
          dynamicData.netSeries?.tests &&
          Array.isArray(dynamicData.netSeries.tests)
        ) {
          const tests = dynamicData.netSeries.tests;
          for (const test of tests) {
            if (test.name?.includes("Series I")) {
              series1 = test.date;
            } else if (test.name?.includes("Series II")) {
              series2 = test.date;
            } else if (test.name?.includes("Series III")) {
              series3 = test.date;
            } else if (test.name?.includes("Series IV")) {
              series4 = test.date;
            }
          }
        }

        // Send the message with all 4 parameters
        await sendMetaCloudTemplateMessage("nust_msg_4", [
          series1,
          series2,
          series3,
          series4,
        ]);
      },

      // 5. Academic Qualification
      async () => {
        console.log("📨 Sending message 5: Academic Qualification");
        // Parameters will be manually added by the user
        await sendMetaCloudTemplateMessage("nust_msg_5", []);
      },

      // 6. Admission Procedure
      async () => {
        console.log("📨 Sending message 6: Admission Procedure");
        // Parameters will be manually added by the user
        await sendMetaCloudTemplateMessage("nust_msg_6", []);
      },

      // 7. Programmes Commencement
      async () => {
        console.log("📨 Sending message 7: Programmes Commencement");
        // Parameters will be manually added by the user
        await sendMetaCloudTemplateMessage("nust_msg_7", []);
      },

      // 8. ACT/SAT Applications
      async () => {
        console.log("📨 Sending message 8: ACT/SAT Applications");
        await sendMetaCloudTemplateMessage("nust_msg_8", []);
      },

      // 9. NET Weightage Info
      async () => {
        console.log("📨 Sending message 9: NET Weightage Info");
        // Parameters will be manually added by the user
        await sendMetaCloudTemplateMessage("nust_msg_9", []);
      },

      // 10. Merit Criteria
      async () => {
        console.log("📨 Sending message 10: Merit Criteria");
        // Parameters will be manually added by the user
        await sendMetaCloudTemplateMessage("must_msg_10", []);
      },

      // 11. ACT/SAT Test Dates
      async () => {
        console.log("📨 Sending message 11: ACT/SAT Test Dates");
        const registrationWindow =
          dynamicData.actSatDates?.registrationWindow || "To be announced";
        const scoreDeadline =
          dynamicData.actSatDates?.scoreDeadline || "To be announced";
        await sendMetaCloudTemplateMessage("must_msg_11", [
          registrationWindow,
          scoreDeadline,
        ]);
      },
    ];

    for (let i = 0; i < messageSenders.length; i++) {
      try {
        await messageSenders[i]();
        console.log(`✅ Message ${i + 1} sent successfully`);
      } catch (error) {
        console.error(`❌ Failed to send message ${i + 1}:`, error.message);
      }
    }

    console.log("✅ All NUST messages sent successfully!");
  } catch (error) {
    console.error("❌ Process failed:", error);
    if (error.code === "ENOENT") {
      console.error("File path error - please verify these directories exist:");
      console.error("- Outputs:", outputsDir);
      console.error("- Public:", publicDir);
    }
  }
}

module.exports = scrapNust;
