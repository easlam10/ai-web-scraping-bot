const ExcelJS = require("exceljs");

function normalizeRowspans(tableData) {
  const numRows = tableData.length;
  const numCols = Math.max(...tableData.map(row => row.length));
  const normalized = Array.from({ length: numRows }, () => Array(numCols).fill(null));

  for (let i = 0; i < numRows; i++) {
    let colPointer = 0;
    for (let j = 0; j < tableData[i].length; j++) {
      while (normalized[i][colPointer] !== null) colPointer++;

      const cell = tableData[i][j];
      const { rowspan = 1, colspan = 1 } = cell;

      for (let r = 0; r < rowspan; r++) {
        for (let c = 0; c < colspan; c++) {
          const rowIndex = i + r;
          const colIndex = colPointer + c;
          if (!normalized[rowIndex]) normalized[rowIndex] = [];
          normalized[rowIndex][colIndex] = {
            ...cell,
            rowspan: 1,
            colspan: 1,
            isMerged: r !== 0 || c !== 0,
          };
        }
      }

      colPointer += colspan;
    }
  }

  return normalized;
}

function calculateWrappedLines(text, colWidth) {
  const avgCharWidth = 1.1;
  const lineLength = Math.floor(colWidth / avgCharWidth);
  const lines = text.split("\n");
  let totalLines = 0;
  for (const line of lines) {
    totalLines += Math.max(1, Math.ceil(line.length / lineLength));
  }
  return totalLines;
}

async function writeToExcel(pages, fileName) {
  const workbook = new ExcelJS.Workbook();
  for (const { name, structuredData } of pages) {
    const sheet = workbook.addWorksheet(name);

    // Styles
    const headingStyle = {
      font: { bold: true, color: { argb: "FFFFFFFF" }, size: 14 },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0070C0" } },
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
      alignment: { wrapText: true, vertical: "top", horizontal: "left", indent: 1 },
    };

    const tableHeaderStyle = {
      font: { bold: true, color: { argb: "FFFFFFFF" }, size: 12 },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF2F5597" } },
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
      alignment: { wrapText: true, vertical: "middle", horizontal: "center" },
      border: {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      },
    };

    let currentRow = 1;
    sheet.getColumn(1).width = 40;
    sheet.getColumn(2).width = 60;

    for (const item of structuredData) {
      switch (item.type) {
        case "heading":
          sheet.getCell(`A${currentRow}`).value = item.text;
          sheet.getCell(`A${currentRow}`).style = headingStyle;
          sheet.mergeCells(`A${currentRow}:B${currentRow}`);
          const headingLines = Math.ceil(item.text.length / 80);
          sheet.getRow(currentRow).height = Math.max(30, 20 * headingLines);
          currentRow++;
          break;

        case "paragraph":
          const cleanText = item.text.replace(/\s+/g, " ").trim();
          sheet.getCell(`A${currentRow}`).value = cleanText;
          sheet.getCell(`A${currentRow}`).style = paragraphStyle;
          const textLength = cleanText.length;
          const approxLines = Math.ceil(textLength / 100);
          sheet.getRow(currentRow).height = Math.max(20, 15 * approxLines);
          if (textLength > 100) {
            sheet.mergeCells(`A${currentRow}:B${currentRow}`);
          }
          currentRow++;
          break;

        case "list":
          for (const listItem of item.items) {
            sheet.getCell(`A${currentRow}`).value = {
              richText: [
                { text: "• ", font: { bold: true } },
                { text: listItem },
              ],
            };
            sheet.getCell(`A${currentRow}`).style = listStyle;
            sheet.mergeCells(`A${currentRow}:B${currentRow}`);
            const lines = calculateWrappedLines(listItem, 100);
            sheet.getRow(currentRow).height = Math.max(20, 15 * lines);
            currentRow++;
          }
          break;

        case "table":
          currentRow++;
          const normalizedData = normalizeRowspans(item.data);
          const numColumns = Math.max(...normalizedData.map(row => row.length));

          for (let col = 1; col <= numColumns; col++) {
            sheet.getColumn(col).width = col === 1 ? 40 : 60;
          }

          for (let i = 0; i < normalizedData.length; i++) {
            const row = normalizedData[i];
            for (let j = 0; j < numColumns; j++) {
              const cell = row[j];
              if (!cell || cell.isMerged) continue;

              const colChar = String.fromCharCode(65 + j);
              const cellAddress = `${colChar}${currentRow}`;
              sheet.getCell(cellAddress).value = cell.value || "";
              sheet.getCell(cellAddress).style = i === 0 ? tableHeaderStyle : tableCellStyle;

              const endRow = currentRow + (cell.rowspan || 1) - 1;
              const endCol = j + (cell.colspan || 1) - 1;
              if (endRow > currentRow || endCol > j) {
                const endColChar = String.fromCharCode(65 + endCol);
                sheet.mergeCells(`${colChar}${currentRow}:${endColChar}${endRow}`);
              }
            }

            // Adjust row height based on content
            let maxLines = 1;
            for (let j = 0; j < numColumns; j++) {
              const cell = row[j];
              if (!cell || cell.isMerged) continue;
              const width = j === 0 ? 40 : 60;
              const lines = calculateWrappedLines(cell.value || "", width);
              maxLines = Math.max(maxLines, lines);
            }
            sheet.getRow(currentRow).height = Math.max(20, 15 * maxLines);
            currentRow++;
          }

          currentRow++;
          sheet.mergeCells(`A${currentRow}:${String.fromCharCode(65 + numColumns - 1)}${currentRow}`);
          currentRow++;
          break;
      }
    }
  }

  await workbook.xlsx.writeFile(fileName);
  console.log(`✅ Excel file created with multiple sheets saved: ${fileName}`);
}

module.exports = { writeToExcel };
