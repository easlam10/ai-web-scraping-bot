const { extractPieasStructuredContent } = require("../extraction/extractPieas");
const { sendWhatsAppWithMedia } = require("../services/twilioService");
const uploadFile = require("../services/dropboxService");
const addLogoToImage = require("../services/addLogoToImage");
const { writeToExcel } = require("../services/excelWriter");
const { fetchPageContent } = require("../services/fetchPageContent");
const { extractDatesFromPieasStructuredContent } = require("../importantInfo/extractPieasInfo");
const pieasMessages = require("../messageTemplates/pieasMessages");
const path = require("path");
const fs = require("fs");
const projectRoot = path.join(__dirname, '..');
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
    
    
      const pieasUrls =  [
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
      ]

    const pages = [];
    let messages = [];
    let dynamicData = {
      thirdTestRegisteration : null,
      thirdTestDate : null,
      meritNumberAnnouncement : null,
      classesCommencementDate : null,

    }

    for (const { url, name } of pieasUrls) {
      console.log(`🌐 Scraping: ${url}`);
      const html = await fetchPageContent(url);
      const structuredData = extractPieasStructuredContent(html);
      pages.push({ name, structuredData });

      const dates = extractDatesFromPieasStructuredContent(structuredData)

      dynamicData.thirdTestRegisteration = dates.thirdTestApplication
      dynamicData.thirdTestDate = dates.thirdTestDate
      dynamicData.meritNumberAnnouncement = dates.meritNumberAnnouncementDate
      dynamicData.classesCommencementDate = dates.joiningDate
    }



    if (dynamicData.thirdTestRegisteration) {
      messages.push(pieasMessages.thirdTestDeadline({
        openingDate: dynamicData.thirdTestRegisteration.openingDate,
        deadline: dynamicData.thirdTestRegisteration.deadlineDate,
        deadlineWithLateFees: dynamicData.thirdTestRegisteration.lateFeeDeadlineDate,
      }))
    }

    if (dynamicData.thirdTestDate) {
      messages.push(pieasMessages.thirdTest({
        date: dynamicData.thirdTestDate,
      }))
    }

    if (dynamicData.meritNumberAnnouncement) {
      messages.push(pieasMessages.meritNumber({
        date: dynamicData.meritNumberAnnouncement,
      }))
    }

    if (dynamicData.classesCommencementDate) {
      messages.push(pieasMessages.classesCommencement({
        classesCommencementDate: dynamicData.classesCommencementDate,
      }))
    }

    console.log(messages);

    const fileName = path.join(
        outputsDir,
      `Pieas_admissions_${Date.now()}.xlsx`
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
    if (error.code === 'ENOENT') {
        console.error("File path error - please verify these directories exist:");
        console.error("- Outputs:", outputsDir);
        console.error("- Public:", publicDir);
      }
  }
}

module.exports = scrapPieas;
