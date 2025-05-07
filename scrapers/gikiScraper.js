const { extractGikiStructuredContent } = require("../extraction/extractGiki");
const { sendWhatsAppWithMedia } = require("../services/twilioService");
const uploadFile = require("../services/dropboxService");
const addLogoToImage = require("../services/addLogoToImage");
const { writeToExcel } = require("../services/excelWriter");
const gikiMessages = require("../messageTemplates/gikiMessages");
const { fetchPageContent } = require("../services/fetchPageContent");
const path = require("path");
const fs = require("fs");
const {
  extractDatesFromGikiStructuredContent,
} = require("../importantInfo/extractGikiInfo");
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
        url: "https://giki.edu.pk/admissions/admissions-undergraduates/",
        name: "Undergraduate Admissions",
      },
      {
        url: "https://giki.edu.pk/admissions/admissions-undergraduates/eligibility-criteria/ ",
        name: "Eligibility and Assessment Criteria",
      },
      {
        url: "https://giki.edu.pk/admissions/admissions-undergraduates/undergraduate-admission-test-syllabus/  ",
        name: "Undergraduate Admission Test Syllabus",
      },
      {
        url: "https://giki.edu.pk/admissions/admissions-undergraduates/ugradhow-to-apply/  ",
        name: "Application Procedure (How to Apply)",
      },
      {
        url: "https://giki.edu.pk/admissions/admissions-undergraduates/ugrad-fees-and-expenses/  ",
        name: "Fees and Expenses",
      },
      {
        url: "https://giki.edu.pk/payment/",
        name: "Payment Methods",
      },
      {
        url: "https://giki.edu.pk/transfer-from-other-universities/",
        name: "Transfer from other Universities",
      },
      {
        url: "https://www.facebook.com/OfficialGIKI/",
        name: "Digital Media Link",
      },
      {
        url: "https://giki.edu.pk/contact-us/",
        name: "Contact Details",
      },
    ];

    const pages = [];
    let messages = [];
    let dynamicData = {
      applicationDates: null,
      financialAidDeadline: null,
      admissionTestDates: null,
      meritListDate: null,
      orientationAndCommencementDate: null,
    };

    for (const { url, name } of gikiUrls) {
      console.log(`🌐 Scraping: ${url}`);
      const html = await fetchPageContent(url);
      const structuredData = extractGikiStructuredContent(html);
      pages.push({ name, structuredData });

      const dates = extractDatesFromGikiStructuredContent(structuredData);

      // Store the dates in dynamicData if needed
      dynamicData.applicationDates = dates.applicationDates;
      dynamicData.financialAidDeadline = dates.financialAidDeadline;
      dynamicData.admissionTestDates = dates.admissionTestDates;
      dynamicData.meritListDate = dates.meritListDate;
      dynamicData.orientationAndCommencementDate = dates.orientationDates;

      
    }

    if (dynamicData.applicationDates) {
      messages.push(
        gikiMessages.applicationSchedule({
          startingDate: dynamicData.applicationDates.startDate || "To be announced",
          deadline: dynamicData.applicationDates.deadlineDate || "To be announced",
        })
      );
    }
    
    if (dynamicData.financialAidDeadline) {
      messages.push(
        gikiMessages.financialAidDeadline({
          deadline: dynamicData.financialAidDeadline || "To be announced",
        })
      );
    }
    
    if (dynamicData.admissionTestDates) {
      messages.push(
        gikiMessages.admissionTest({
          testDate: dynamicData.admissionTestDates.testDate || "To be announced",
          resultDate: dynamicData.admissionTestDates.resultDate || "To be announced",
        })
      );
    }
    
    if (dynamicData.meritListDate) {
      messages.push(
        gikiMessages.meritList({
          meritListDate: dynamicData.meritListDate || "To be announced",
        })
      );
    }
    
    if (dynamicData.orientationAndCommencementDate) {
      messages.push(
        gikiMessages.classesCommencement({
          orientationDate: 
            dynamicData.orientationAndCommencementDate.orientationDate || "To be announced",
          classesCommencementDate: 
            dynamicData.orientationAndCommencementDate.commencementDate || "To be announced",
        })
      );
    }

    
    messages.push(gikiMessages.eligibiltyCriteria());

  
    messages.push(gikiMessages.testSyllabus());


    messages.push(gikiMessages.applicationPaymentMethod());

   
    messages.push(gikiMessages.transferDetails());

    console.log(messages)




    const fileName = path.join(
      outputsDir,
      `Giki_admissions_${Date.now()}.xlsx`
    );
    await writeToExcel(pages, fileName);
    console.log(`✅ Excel file saved: ${fileName}`);
    // Upload to Dropbox

    // const fileUrl = await uploadFile(fileName);
    // console.log(`📤 File uploaded to Dropbox: ${fileUrl}`);

    // // Prepare image URL (use your Dropbox link with raw=1)
    // const bannerPath = path.join(publicDir, 'images', 'nust_banner.jpg');
    // const logoPath = path.join(publicDir, 'images', 'logo.png');
    // const finalImagePath = path.join(outputsDir, 'nust_banner_with_logo.jpg');
    // // ✅ Generate image with logo
    // await addLogoToImage(bannerPath, logoPath, finalImagePath);

    // // ✅ Upload image to Dropbox
    // const imageUrl = await uploadFile(finalImagePath);
    // console.log(`📤 Logo image uploaded to Dropbox: ${imageUrl}`);

       // Send messages one-by-one on WhatsApp
       for (const [i, msg] of messages.entries()) {
        console.log(`📨 Sending message ${i + 1}...`);
        await sendWhatsAppWithMedia(msg);
      }
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
