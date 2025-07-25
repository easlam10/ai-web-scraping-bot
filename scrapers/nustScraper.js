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
const whatsappWebService = require("../services/whatsappWebService");
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

    console.log(dynamicData);

    // Process and save excel file
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

    // Send all messages in sequence using templates
    console.log("📱 Sending messages through WhatsApp Web...");

    // Recipient phone number (replace with actual number when needed)
    const recipientNumber =
      process.env.DEFAULT_RECIPIENT_NUMBER 

    // Prepare all messages using templates and dynamic data
    const messages = [
      // Math Course Info
      nustMessages.mathCourseInfo({
        mathDeadline: dynamicData.mathDeadline || "To be announced",
      }),

      // New Programmes
      nustMessages.newProgrammes(),

      // Multi Entry Test Schedule
      // This message requires a specific structure, so we'll format it directly
      (() => {
        // Initialize test data
        let tests = [];
        let netSeries = "upcoming";

        // Check if netSeries is an array (direct result from extractAllNetRegistrationRanges)
        if (Array.isArray(dynamicData.netSeries)) {
          tests = dynamicData.netSeries.map((test) => ({
            name: test.series,
            date: `${test.startDate} - ${test.endDate}`,
          }));
          if (tests.length > 0) {
            netSeries = tests[0].name.split(" ")[0]; // Extract "Series" from "Series I"
          }
        }
        // Original nested structure handling
        else if (
          dynamicData.netSeries?.tests &&
          Array.isArray(dynamicData.netSeries.tests)
        ) {
          tests = dynamicData.netSeries.tests;
          netSeries = dynamicData.netSeries.series || "upcoming";
        }

        return nustMessages.multiEntryTestSchedule({ tests, netSeries });
      })(),

      // Academic Qualification
      nustMessages.academicQualification(),

      // Admission Procedure
      nustMessages.admissionProcedure(),

      // Programmes Commencement
      nustMessages.programmesCommencement(),

      // ACT/SAT Applications
      nustMessages.actSatApplications({
        registrationWindow:
          dynamicData.actSatDates?.registrationWindow || "To be announced",
        scoreDeadline:
          dynamicData.actSatDates?.scoreDeadline || "To be announced",
      }),

      // NET Weightage Info
      nustMessages.netWeightageInfo(),

      // Merit Criteria
      nustMessages.meritCriteria(),

      // Candidate Selection
      nustMessages.candidateSelection(),
    ];

    // Send all messages in sequence
    await whatsappWebService.sendMessagesInSequence(recipientNumber, messages);

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
