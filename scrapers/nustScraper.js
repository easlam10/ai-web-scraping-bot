const { extractNustStructuredContent } = require("../extraction/extractNust");
const nustMessages = require("../messageTemplates/nustMessages");
const { sendWhatsAppWithMedia } = require("../services/twilioService");
const uploadFile = require("../services/dropboxService");
const addLogoToImage = require("../services/addLogoToImage");
const { writeToExcel } = require("../services/excelWriter");
const { fetchPageContent } = require("../services/fetchPageContent");
const {
  extractLatestNetDeadlineAndExamDate,
  extractMathCourseDateForFscPreMed,
  extractAllNetRegistrationRanges,
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
    let messages = [];
    let dynamicData = {
      netDates: null,
      mathDeadline: null,
      netSeries: null,
    };

    // First pass: Scrape all pages and extract dynamic data
    for (const { url, name } of nustUrls) {
      console.log(`🌐 Scraping: ${url}`);
      const html = await fetchPageContent(url);
      const structuredData = extractNustStructuredContent(html);
      pages.push({ name, structuredData });

      // Extract dynamic data from each page with fallbacks
      const netData = extractLatestNetDeadlineAndExamDate(html);
      const mathData = extractMathCourseDateForFscPreMed(html);
      const netSeriesData = extractAllNetRegistrationRanges(html);

      
      // Add this in your scrapNust function

      // Only overwrite null values with new findings
      dynamicData.netDates = dynamicData.netDates || netData;
      dynamicData.mathDeadline = dynamicData.mathDeadline || mathData;
      dynamicData.netSeries = dynamicData.netSeries || netSeriesData;

    }


    // 1. Dynamic - NET Admission Schedule
    if (dynamicData.netDates) {
      messages.push(
        nustMessages.netAdmissionSchedule({
          deadline: dynamicData.netDates.deadline || "To be announced",
          examStartDate:
            dynamicData.netDates.examStartDate || "To be announced",
          series: dynamicData.netDates.series || "2025",
        })
      );
    } 

    // 2. Dynamic - Math Course Info
    if (dynamicData.mathDeadline) {
      messages.push(
        nustMessages.mathCourseInfo({
          deadline: dynamicData.mathDeadline,
        })
      );
    } else {
      messages.push(
        nustMessages.mathCourseInfo({
          deadline: "To be announced",
        })
      );
    }

  messages.push(nustMessages.newProgrammes());

    // 3. Update message generation for NET series
    if (dynamicData.netSeries) {
      messages.push(
        nustMessages.multiEntryTestSchedule({
          tests: dynamicData.netSeries.map((series) => ({
            name: `NET ${series.series}`,
            date: `${series.startDate} to ${series.endDate}`,
          })),
        })
      );
    }

    // 5. Static - Academic Qualification
    messages.push(nustMessages.academicQualification());

    // 6. Static - Admission Procedure
    messages.push(nustMessages.admissionProcedure());

    // 7. Static - Programmes Commencement
    messages.push(nustMessages.programmesCommencement());

    // 8. Static - NET Weightage
    messages.push(nustMessages.netWeightage());

    // 9. Static - Merit Criteria
    messages.push(nustMessages.meritCriteria());

    console.log(messages)

    const fileName = path.join(
      outputsDir,
      `Nust_admissions_${Date.now()}.xlsx`
    );
    await writeToExcel(pages, fileName);
    console.log(`✅ Excel file saved: ${fileName}`);
    // // Upload to Dropbox

    // // const fileUrl = await uploadFile(fileName);
    // // console.log(`📤 File uploaded to Dropbox: ${fileUrl}`);

    // // Prepare image URL (use your Dropbox link with raw=1)
    // const bannerPath = path.join(publicDir, 'images', 'nust_banner.jpg');
    // const logoPath = path.join(publicDir, 'images', 'logo.png');
    // const finalImagePath = path.join(outputsDir, 'nust_banner_with_logo.jpg');
    // // ✅ Generate image with logo
    // await addLogoToImage(bannerPath, logoPath, finalImagePath);

    // // ✅ Upload image to Dropbox
    // const imageUrl = await uploadFile(finalImagePath);
    // console.log(`📤 Logo image uploaded to Dropbox: ${imageUrl}`);

  

    // // Send messages one-by-one on WhatsApp
     for (const [i, msg] of messages.entries()) {
      console.log(`📨 Sending message ${i + 1}...`);
      await sendWhatsAppWithMedia(msg);
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

module.exports = scrapNust;
