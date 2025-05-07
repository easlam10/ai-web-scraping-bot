const { extractFastStructuredContent } = require("../extraction/extractFast");
const { extractDatesFromFastStructuredContent } = require("../importantInfo/extractFastInfo");
const { sendWhatsAppWithMedia } = require("../services/twilioService");
const uploadFile = require("../services/dropboxService");
const addLogoToImage = require("../services/addLogoToImage");
const { writeToExcel } = require("../services/excelWriter");
const { fetchPageContent } = require("../services/fetchPageContent");
const path = require("path");
const fs = require("fs");
const fastMessages = require("../messageTemplates/fastMessages");
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
        // {
        //   url: "https://nu.edu.pk/Admissions/HowToApply",
        //   name: "Admission Procedure",
        // },
        // {
        //   url: "https://nu.edu.pk/Degree-Programs",
        //   name: "Program Offered",
        // },
        // {
        //   url: "https://nu.edu.pk/Admissions/EligibilityCriteria",
        //   name: "Eligibility Criteria",
        // },
        // {
        //   url: "https://nu.edu.pk/Admissions/TestPattern",
        //   name: "Test Pattern",
        // },
        // {
        //   url: "https://nu.edu.pk/Admissions/FeeStructure",
        //   name: "Fee Structure",
        // },
        // {
        //   url: "https://www.facebook.com/FastNUIslamabadOfficial?_rdc=1&_rdr#",
        //   name: "Digital Media Link",
        // },
        // {
        //   url: "https://nu.edu.pk/home/ContactUs",
        //   name: "Contact Details",
        // },
      ]

    const pages = [];
    let messages = [];
    let dynamicData = {
      applicationDates: null,
      admissionFormalityDates: null,
      admissionTestDates: null,
      meritListDate: null,
      commencementDate: null,

  }


    for (const { url, name } of fastUrls) {
      console.log(`🌐 Scraping: ${url}`);
      const html = await fetchPageContent(url);
      const structuredData = extractFastStructuredContent(html);
      pages.push({ name, structuredData });

      const dates = extractDatesFromFastStructuredContent(structuredData)

      dynamicData.applicationDates = dates.applicationDates
      dynamicData.admissionFormalityDates = dates.admissionFormalitiesDate
      dynamicData.admissionTestDates = dates.admissionTestDate
      dynamicData.meritListDate = dates.meritListDate
      dynamicData.commencementDate = dates.classesCommencementDate

      
    }


    if (dynamicData.applicationDates) {
      messages.push(
        fastMessages.applicationSchedule({
          dates: dynamicData.applicationDates || "To be announced",
          
        })
      );
    }
    
    if (dynamicData.admissionFormalityDates) {
      messages.push(
        fastMessages.admissionFormaltites({
          dates: dynamicData.admissionFormalityDates || "To be announced",
        })
      );
    }
    
    if (dynamicData.admissionTestDates) {
      messages.push(
        fastMessages.admissionTest({
          testDates: dynamicData.admissionTestDates || "To be announced",
        })
      );
    }
    
    if (dynamicData.meritListDate) {
      messages.push(
        fastMessages.meritList({
          meritListDate: dynamicData.meritListDate || "To be announced",
        })
      );
    }
    
    if (dynamicData.commencementDate) {
      messages.push(
        fastMessages.classesCommencement({   
          classesCommencementDate: 
            dynamicData.commencementDate || "To be announced",
        })
      );
    }

    
    messages.push(fastMessages.eligibiltyCriteria());

  
    messages.push(fastMessages.testSyllabus());


    messages.push(fastMessages.programmesOffered());

   
    messages.push(fastMessages.howToApply());

    console.log(messages)

  

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



  // Send messages one-by-one on WhatsApp
  // for (const [i, msg] of messages.entries()) {
  //   console.log(`📨 Sending message ${i + 1}...`);
  //   await sendWhatsAppWithMedia(msg);
  // }
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
