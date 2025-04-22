const puppeteer = require("puppeteer-extra");
const cron = require("node-cron");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cheerio = require("cheerio");
const ExcelJS = require("exceljs");
const path = require("path");
const uploadExcelFile = require("./services/dropboxService");
const { sendWhatsAppWithMedia } = require("./services/twilioService");
const fs = require("fs");

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
  $("script, style, noscript, iframe, svg, link, a, footer, nav").remove();

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

      // Rest of the processing remains the same
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
      } else if (tag === "ul" || tag === "ol") {
        const items = [];
        $(this)
          .find("li")
          .each(function () {
            let itemText = $(this).html().trim();
            itemText = itemText.replace(/<br\s*\/?>/gi, "\n");
            itemText = cheerio.load(itemText).text().trim();
            items.push(itemText);
          });
        content.push({
          type: "list",
          items: items,
          ordered: tag === "ol",
          element: $(this),
        });
      } else if (tag === "table") {
        const tableData = [];
        $(this)
          .find("tr")
          .each(function () {
            const row = [];
            $(this)
              .find("th, td")
              .each(function () {
                let cellText = $(this).html().trim();
                cellText = cellText.replace(/<br\s*\/?>/gi, "\n");
                cellText = cheerio.load(cellText).text().trim();

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
    const urls = [
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
    ];
    const pages = [];

    for (const { url, name } of urls) {
      console.log(`🌐 Scraping: ${url}`);
      const html = await fetchPageContent(url);
      const structuredData = extractStructuredContent(html);
      pages.push({ name, structuredData });
    }

    // Save Excel file
    const fileName = path.join(
      __dirname,
      "outputs",
      `nust_admissions_${Date.now()}.xlsx`
    );
    await writeToExcel(pages, fileName);
    console.log(`✅ Excel file saved: ${fileName}`);

    // Upload to Dropbox
    const fileUrl = await uploadExcelFile(fileName);
    console.log(`📤 File uploaded to Dropbox: ${fileUrl}`);

    // Prepare image URL (use your Dropbox link with raw=1)
    const imageUrl =
      "https://www.dropbox.com/scl/fi/kr9l7k60p93d1k6xubo63/image.jpg?rlkey=chqelr9eb0qq2kdtg9fwhbqbz&raw=1";

    // Extract date and build message
    const deadlineDate = extractNET2025Date(html);
    const message = deadlineDate
      ? `🗓️ Registration for *NET-2025 (Series-4)* will remain open till *${deadlineDate}*\n\n📊 See attached data`
      : `ℹ️ Latest NUST Admission Updates\n\n📊 See attached data`;

    // Send WhatsApp with both media
    await sendWhatsAppWithMedia(message, fileUrl, imageUrl);
    console.log("🚀 WhatsApp notification sent!");
  } catch (error) {
    console.error("❌ Process failed:", error);
  }
}
main();
// cron.schedule("30 6 * * 1", async () => {
//   console.log("⏳ Running scheduled job at", new Date().toLocaleTimeString());
//   await main();
// });
