const { extractNumsStructuredContent } = require("../extraction/extractNums");
const { extractNumsInfo } = require("../importantInfo/numsInfo");
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

async function scrapNums() {
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
    
    
      const numsUrls =  [
        {
          url: "https://numspak.edu.pk/admissions-details.php",
          name: "NUMS Admissions",
        },
        {
          url: "https://numspak.edu.pk/acad/nums-departments ",
          name: "NUMS Departments",
        },
        {
          url: "https://numspak.edu.pk/acad/undergraduate",
          name: "Undergraduate Programs",
        },
        {
          url: "https://numspak.edu.pk/course/mbbs",
          name: "MBBS",
        },
        {
          url: "https://numspak.edu.pk/course/bds",
          name: "BDS",
        },
        {
          url: "https://numspak.edu.pk/course/bs-nursing-generic",
          name: "BS Nursing (Generic)",
        },
        {
          url: "https://numspak.edu.pk/course/bs-cardiac-perfusion-cp  ",
          name: "BS Cardiac Perfusion (CP)",
        },
        {
          url: "https://numspak.edu.pk/course/bs-social-science-of-health",
          name: "BS Social Science of Health",
        },
        {
          url: "https://numspak.edu.pk/course/bs-biological-sciences-genetics",
          name: "BS Biological Sciences (Genetics)",
        },
        {
          url: "https://numspak.edu.pk/course/bs-biological-sciences-microbiology",
          name: "BS Biological Sciences (Microbiology)",
        },
        {
          url: "https://numspak.edu.pk/course/bs-medical-imaging-technology-mit",
          name: "BS Medical Imaging Technology (MIT)",
        },
        {
          url: "https://numspak.edu.pk/course/bs-Sociology",
          name: "BS Sociology",
        },
        {
          url: "https://numspak.edu.pk/course/bs-speech-language-pathology",
          name: "BS Speech & Language Pathology",
        },
        {
          url: "https://numspak.edu.pk/course/bs-nursing-post-rn",
          name: "BS Nursing (Post RN)",
        },
        {
          url: "https://numspak.edu.pk/course/bs-public-health-bsph",
          name: "BS Public Health (BSPH)",
        },
        {
          url: "https://numspak.edu.pk/course/bs-psychology",
          name: "BS Psychology",
        },
        {
          url: "https://numspak.edu.pk/course/bs-biological-sciences-biotechnology",
          name: "BS Biological Sciences (Biotechnology)",
        },
        {
          url: "https://numspak.edu.pk/course/bs-medical-laboratory-technology-mlt",
          name: "BS Medical Laboratory Technology (MLT)",
        },
        {
          url: "https://numspak.edu.pk/course/BS-in-Human-Nutrition-and-Dietetics",
          name: "BS in Human Nutrition and Dietetics",
        },
        {
          url: "https://numspak.edu.pk/course/bs-emergency-and-clinical-medicine-technology",
          name: "BS Emergency And Clinical Medicine Technology",
        },
        {
          url: "https://numspak.edu.pk/course/bs-prosthetics-orthotics-pno",
          name: "BS Prosthetics & Orthotics (PNO)",
        },
        {
          url: "https://numspak.edu.pk/upload/media/2024-HEC-Academic-UnderGraduate-Policy-v1-20231720175663.pdf",
          name: "Undergraduate Policies",
        },
        {
          url: "https://www.facebook.com/NUMSOfficial/?ref=embed_page#",
          name: "Digital Page Link",
        },
        {
          url: "https://numspak.edu.pk/contact.php",
          name: "Contact Details",
        },
      ]
    const pages = [];
    let admissionStartDate = null; // Declare before the loop

    for (const { url, name } of numsUrls) {
      console.log(`🌐 Scraping: ${url}`);
      const html = await fetchPageContent(url);
      const structuredData = extractNumsStructuredContent(html);
      pages.push({ name, structuredData });

      if (name === "MBBS") {
        admissionStartDate = extractNumsInfo(html);
      }
    }

    
    

    const fileName = path.join(
        outputsDir,
      `Nums_admissions_${Date.now()}.xlsx`
    );
    await writeToExcel(pages, fileName);
    console.log(`✅ Excel file saved: ${fileName}`);
    // Upload to Dropbox

    const fileUrl = await uploadFile(fileName);
    console.log(`📤 File uploaded to Dropbox: ${fileUrl}`);

    // Prepare image URL (use your Dropbox link with raw=1)
    const bannerPath = path.join(publicDir, 'images', 'nust_banner.jpg');
    const logoPath = path.join(publicDir, 'images', 'logo.png');
    const finalImagePath = path.join(outputsDir, 'nust_banner_with_logo.jpg');
    // ✅ Generate image with logo
    await addLogoToImage(bannerPath, logoPath, finalImagePath);

    // ✅ Upload image to Dropbox
    const imageUrl = await uploadFile(finalImagePath);
    console.log(`📤 Logo image uploaded to Dropbox: ${imageUrl}`);

    const message = admissionStartDate
      ? `*🔔 National University of Medical Sciences*\n` +
        "`Admissions`\n" +
        `Nums has announced the Mbbs admission process.\n*Admissions start on:* ${admissionStartDate}\n\n` +
        "`Tap to Join, Share & Shine`\n" +
        `https://whatsapp.com/channel/0029Vb9qWtQGE56sYuYipX1P`
      : `ℹ️ Latest Nust Admission Updates\n\n📊 See attached data`;

    // Send WhatsApp with both media
    await sendWhatsAppWithMedia(message, imageUrl);
    console.log("🚀 WhatsApp notification sent!");
  } catch (error) {
    console.error("❌ Process failed:", error);
    if (error.code === 'ENOENT') {
        console.error("File path error - please verify these directories exist:");
        console.error("- Outputs:", outputsDir);
        console.error("- Public:", publicDir);
      }
  }
}

module.exports = scrapNums;
