const { extractFastStructuredContent } = require("../extraction/extractFast");
const { extractFastInfo } = require("../importantInfo/fastInfo");
const { sendWhatsAppWithMedia } = require("../services/twilioService");
const uploadFile = require("../services/dropboxService");
const addLogoToImage = require("../services/addLogoToImage");
const { writeToExcel } = require("../services/excelWriter");
const { fetchPageContent } = require("../services/fetchPageContent");
const path = require("path");
const fs = require("fs");
const projectRoot = path.join(__dirname, '..');
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
    
    
      const fastUrls =  [
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
      ]

    const pages = [];
    let startDate = null; // Declare before the loop

    for (const { url, name } of fastUrls) {
      console.log(`🌐 Scraping: ${url}`);
      const html = await fetchPageContent(url);
      const structuredData = extractFastStructuredContent(html);
      pages.push({ name, structuredData });

      if (name === "Admission Schedule") {
        startDate = extractFastInfo(html);
      }
    }

    const fileName = path.join(
        outputsDir,
      `Fast_admissions_${Date.now()}.xlsx`
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

    // const message = deadlineDate
    //   ? `*🔔 GIK Institute of Engineering Sciences and Technology*\n` +
    //     "`Admission Schedule`\n" +
    //     `*Starting from:* ${startDate}\n\n` +
    //     "`Tap to Join, Share & Shine`\n" +
    //     `https://whatsapp.com/channel/0029Vb9qWtQGE56sYuYipX1P`
    //   : `ℹ️ Latest Nust Admission Updates\n\n📊 See attached data`;

    // // Send WhatsApp with both media
    // await sendWhatsAppWithMedia(message, imageUrl);
    // console.log("🚀 WhatsApp notification sent!");
  } catch (error) {
    console.error("❌ Process failed:", error);
    if (error.code === 'ENOENT') {
        console.error("File path error - please verify these directories exist:");
        console.error("- Outputs:", outputsDir);
        console.error("- Public:", publicDir);
      }
  }
}

module.exports = scrapFast;
