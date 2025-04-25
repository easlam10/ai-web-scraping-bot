const puppeteer = require("puppeteer-extra");
const cron = require("node-cron");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cheerio = require("cheerio");
const ExcelJS = require("exceljs");
const path = require("path");
const uploadFile = require("./services/dropboxService");
const { sendWhatsAppWithMedia } = require("./services/twilioService");
const fs = require("fs");
const addLogoToImage = require("./utils/addLogoToImage");

// Ensure outputs directory exists
if (!fs.existsSync("./outputs")) {
  fs.mkdirSync("./outputs");
}

puppeteer.use(StealthPlugin());

async function fetchPageContent(url) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  const html = await page.content();
  await browser.close();
  return html;
}

function extractStructuredContent(html) {
  const $ = cheerio.load(html);
  const content = [];

  // Remove unwanted elements
  $('script, style, noscript, iframe, svg, link, a:not([href^="mailto:"]), footer, nav, form, h3.widget-head').remove();


  // Process content
  $("body")
    .find("h1, h2, h3, h4, h5, h6, p, ul, ol, table")
    .each(function () {
      const $element = $(this);

      // Skip elements that are inside a table
      if ($element.parents("table").length > 0) {
        return;
      }

      const tag = $element.prop("tagName").toLowerCase();
      const text = $element.text().trim();

      if (!text) return;

      if (tag.match(/^h[1-6]$/)) {
        content.push({
          type: "heading",
          level: parseInt(tag.charAt(1)),
          text: text,
          element: $element,
        });
      } else if (tag === "p") {
        content.push({
          type: "paragraph",
          text: text,
          element: $element,
        });
      } if (tag === "ul" || tag === "ol") {
        const items = [];
        $(this).find("li").each(function () {
          let itemText = $(this).html().trim();
          itemText = itemText.replace(/<br\s*\/?>/gi, "\n");
          itemText = cheerio.load(itemText).text().trim();
      
          // Skip empty or purely numeric list items
          if (itemText && !/^\d+$/.test(itemText)) {
            items.push(itemText);
          }
        });
        if (items.length > 0) {
          content.push({ type: "list", items, ordered: tag === "ol", element: $(this) });
        }
      }
       else if (tag === "table") {
        const tableData = [];
        $(this)
          .find("tr")
          .each(function () {
            const row = [];
            $(this)
              .find("th, td")
              .each(function () {
                let cellHtml = $(this).html().trim();
                cellHtml = cellHtml.replace(/<br\s*\/?>/gi, "\n");
                const cellText = cheerio.load(cellHtml).text().trim();

                const rowspan = parseInt($(this).attr("rowspan") || 1);
                const colspan = parseInt($(this).attr("colspan") || 1);

                row.push({
                  value: cellText,
                  rowspan: rowspan,
                  colspan: colspan,
                  element: $(this),
                });
              });
            tableData.push(row);
          });

        content.push({
          type: "table",
          data: tableData,
          element: $(this),
        });
      }
    });

    $("a[href^='mailto:']").each(function () {
      const email = $(this).attr("href").replace("mailto:", "").trim();
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (email && isValidEmail) {
        content.push({ type: "email", email, element: $(this) });
      }
    });

  return content;
}






async function writeToExcel(pages, fileName = "nust_admissions_data.xlsx") {
  const workbook = new ExcelJS.Workbook();
  for (const { name, structuredData } of pages) {
    const sheet = workbook.addWorksheet(name);
    // Style Definitions
    const headingStyle = {
      font: { bold: true, color: { argb: "FFFFFFFF" }, size: 14 },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0070C0" },
      },
      alignment: { wrapText: true, vertical: "middle", horizontal: "center" },
    };

    const subheadingStyle = {
      font: { bold: true, size: 12 },
      alignment: { wrapText: true, vertical: "middle", horizontal: "left" },
    };

    const paragraphStyle = {
      font: { size: 11 },
      alignment: { wrapText: true, vertical: "top", horizontal: "left" },
    };

    const listStyle = {
      font: { size: 11 },
      alignment: {
        wrapText: true,
        vertical: "top",
        horizontal: "left",
        indent: 1,
      },
    };

    const tableHeaderStyle = {
      font: { bold: true, color: { argb: "FFFFFFFF" }, size: 12 },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2F5597" },
      },
      alignment: { wrapText: true, vertical: "center", horizontal: "center" },
      border: {
        top: { style: "medium", color: { argb: "FF000000" } },
        left: { style: "medium", color: { argb: "FF000000" } },
        bottom: { style: "medium", color: { argb: "FF000000" } },
        right: { style: "medium", color: { argb: "FF000000" } },
      },
    };

    const tableCellStyle = {
      font: { size: 11 },
      alignment: { wrapText: true, vertical: "middle", horizontal: "center" }, // Changed to middle
      border: {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      },
    };

    const centeredCellStyle = {
      ...tableCellStyle,
      alignment: { wrapText: true, vertical: "middle", horizontal: "center" }, // Changed to middle
    };

    // Process content
    let currentRow = 1;

    // Set column widths
    sheet.getColumn(1).width = 40; // Left column width
    sheet.getColumn(2).width = 60; // Right column width

    for (const item of structuredData) {
      switch (item.type) {
        case "heading":
          sheet.getCell(`A${currentRow}`).value = item.text;
          sheet.getCell(`A${currentRow}`).style = headingStyle;
          sheet.mergeCells(`A${currentRow}:B${currentRow}`);
          currentRow++;
          break;

        case "paragraph":
          sheet.getCell(`A${currentRow}`).value = item.text;
          sheet.getCell(`A${currentRow}`).style = paragraphStyle;
          sheet.mergeCells(`A${currentRow}:B${currentRow}`);
          currentRow++;
          break;

        case "list":
          for (const listItem of item.items) {
            // Create rich text with bullet point
            sheet.getCell(`A${currentRow}`).value = {
              richText: [
                { text: "• ", font: { bold: true } },
                { text: listItem },
              ],
            };

            // Apply list style with wrapping
            sheet.getCell(`A${currentRow}`).style = {
              ...listStyle,
              alignment: {
                ...listStyle.alignment,
                wrapText: true,
              },
            };

            // Merge cells and set row height based on content
            sheet.mergeCells(`A${currentRow}:B${currentRow}`);

            // Calculate required height based on wrapped text
            const calculateWrappedLines = (text, colWidth) => {
              const avgCharWidth = 1.1;
              const lineLength = Math.floor(colWidth / avgCharWidth);
              const lines = text.split("\n");
              let totalLines = 0;

              for (const line of lines) {
                totalLines += Math.max(1, Math.ceil(line.length / lineLength));
              }

              return totalLines;
            };

            const totalWidth =
              sheet.getColumn(1).width + sheet.getColumn(2).width;
            const lines = calculateWrappedLines(listItem, totalWidth);
            sheet.getRow(currentRow).height = Math.max(20, 15 * lines);

            currentRow++;
          }
          break;

        case "table":
          // Add separator before table
          currentRow++;
          sheet.mergeCells(`A${currentRow}:B${currentRow}`);
          currentRow++;

          if (!item.data || item.data.length === 0) {
            sheet.getCell(`A${currentRow}`).value = "(Empty Table)";
            sheet.mergeCells(`A${currentRow}:B${currentRow}`);
            currentRow++;
            break;
          }

          // Process table data
          const startRow = currentRow;
          let mergeStart = null;
          let mergeEnd = null;
          let lastLeftCellValue = null;

          for (let i = 0; i < item.data.length; i++) {
            const row = item.data[i];

            // Skip empty rows
            if (row.length === 0) continue;

            // Get cell values
            const leftCellValue = row[0]?.value || "";
            const rightCellValue = row.length > 1 ? row[1]?.value || "" : "";

            // Handle merging logic for left column
            if (leftCellValue) {
              // If we have a pending merge, apply it
              if (
                mergeStart !== null &&
                mergeEnd !== null &&
                mergeStart < mergeEnd
              ) {
                sheet.mergeCells(`A${mergeStart}:A${mergeEnd}`);
                sheet.getCell(`A${mergeStart}`).style = centeredCellStyle;
              }

              // Start new merge tracking
              mergeStart = currentRow;
              mergeEnd = currentRow;
              lastLeftCellValue = leftCellValue;
            } else if (lastLeftCellValue) {
              // Extend the current merge
              mergeEnd = currentRow;
            }

            // Write values to cells
            if (leftCellValue) {
              sheet.getCell(`A${currentRow}`).value = leftCellValue;
              sheet.getCell(`A${currentRow}`).style = {
                ...(i === 0 ? tableHeaderStyle : tableCellStyle),
                alignment: {
                  wrapText: true,
                  vertical: "middle", // Ensure middle alignment
                  horizontal: "center",
                },
              };
            } else if (lastLeftCellValue) {
              // Keep the left cell empty for merging
              sheet.getCell(`A${currentRow}`).value = "";
              sheet.getCell(`A${currentRow}`).style = tableCellStyle;
            }

            if (row.length > 1) {
              sheet.getCell(`B${currentRow}`).value = rightCellValue;
              sheet.getCell(`B${currentRow}`).style = {
                ...(i === 0 ? tableHeaderStyle : tableCellStyle),
                alignment: {
                  wrapText: true,
                  vertical: "middle", // Ensure middle alignment
                  horizontal: "center",
                },
              };
            }

            // Calculate row height based on wrapped text
            const calculateWrappedLines = (text, colWidth) => {
              const avgCharWidth = 1.1;
              const lineLength = Math.floor(colWidth / avgCharWidth);
              const lines = text.split("\n");
              let totalLines = 0;

              for (const line of lines) {
                totalLines += Math.max(1, Math.ceil(line.length / lineLength));
              }

              return totalLines;
            };

            const leftLines = calculateWrappedLines(
              leftCellValue || lastLeftCellValue || "",
              40
            );
            const rightLines = calculateWrappedLines(rightCellValue, 60);
            const maxLines = Math.max(leftLines, rightLines, 1);

            // Set row height (minimum 20, +15 for each additional line)
            sheet.getRow(currentRow).height = Math.max(20, 15 * maxLines);

            currentRow++;
          }

          // Apply any pending merge for the last group
          if (
            mergeStart !== null &&
            mergeEnd !== null &&
            mergeStart < mergeEnd
          ) {
            sheet.mergeCells(`A${mergeStart}:A${mergeEnd}`);
            sheet.getCell(`A${mergeStart}`).style = centeredCellStyle;
          }

          // Add separator after table
          currentRow++;
          sheet.mergeCells(`A${currentRow}:B${currentRow}`);
          currentRow++;
          break;
      }
    }
  }

  await workbook.xlsx.writeFile(fileName);
  console.log(`✅ Excel file created with multiple sheets saved: ${fileName}`);
}

function extractNET2025Date(html) {
  const regex =
    /registration.*?NET[-\s]?2025.*?(till|until)?\s*([0-9]{1,2}(st|nd|rd|th)?\s+\w+\s+2025)/i;
  const match = html.match(regex);
  return match ? match[2] : null;
}

async function main() {
  try {
    const unis = [
      {
          name: "NUST",
          urls: [
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
              url: "https://nust.edu.pk/admissions/undergraduates/merit-criteria-for-admission-on-net-basis/",
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
          ],
        },
  
        {
          name: "NUMS",
          urls: [
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
          ],
        },
  
        {
          name: "PIEAS",
          urls: [
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
          ],
        },
  
        {
          name: "GIKI",
          urls: [
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
          ],
        },
  
        {
          name: "FAST",
          urls: [
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
          ],
        },
      ];
   

    for (const uni of unis) {
      const pages = [];
      let deadlineDate = null; // Declare before the loop

      for (const { url, name } of uni.urls) {
        console.log(`🌐 Scraping: ${url}`);
        const html = await fetchPageContent(url);
        const structuredData = extractStructuredContent(html);
        pages.push({ name, structuredData });

        if (name === "Updates on UG Admissions" && uni.name === "NUST") {
          deadlineDate = extractNET2025Date(html);
        }
      }
      

      // Save Excel file per university
      const fileName = path.join(
        __dirname,
        "outputs",
        `${uni.name.toLowerCase()}_admissions_${Date.now()}.xlsx`
      );
      await writeToExcel(pages, fileName);
      console.log(`✅ Excel file saved: ${fileName}`);
      // Upload to Dropbox

      const fileUrl = await uploadFile(fileName);
      console.log(`📤 File uploaded to Dropbox: ${fileUrl}`);

      // Prepare image URL (use your Dropbox link with raw=1)
        const bannerPath = path.join(__dirname, `public/images/${uni.name.toLowerCase()}_banner.jpg`);
        const logoPath = path.join(__dirname, 'public/images/logo.png');
        const finalImagePath = path.join(__dirname, `outputs/${uni.name.toLowerCase()}_banner_with_logo.jpg`);

        // ✅ Generate image with logo
        await addLogoToImage(bannerPath, logoPath, finalImagePath);

        // ✅ Upload image to Dropbox
        const imageUrl = await uploadFile(finalImagePath);
        console.log(`📤 Logo image uploaded to Dropbox: ${imageUrl}`);

        const message = deadlineDate
          ? `*🔔 National University of Sciences & Technology*\n` +
            "`Entry Test`\n" +
            `NET-IV registrations are now open.\n*Deadline:* ${deadlineDate}\n\n` +
            "`Tap to Join, Share & Shine`\n" +
            `https://whatsapp.com/channel/0029Vb9qWtQGE56sYuYipX1P`
          : `ℹ️ Latest ${uni.name} Admission Updates\n\n📊 See attached data`;

        // Send WhatsApp with both media
        await sendWhatsAppWithMedia(message, imageUrl);
        console.log("🚀 WhatsApp notification sent!");
    }
  } catch (error) {
    console.error("❌ Process failed:", error);
  }
}

main();
// cron.schedule("30 6 * * 1", async () => {
//   console.log("⏳ Running scheduled job at", new Date().toLocaleTimeString());
//   await main();
// });
