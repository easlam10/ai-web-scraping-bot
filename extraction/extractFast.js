const cheerio = require("cheerio");

function extractFastStructuredContent(html) {
  const $ = cheerio.load(html);
  const content = [];

// Remove unwanted elements
$('script, style, noscript, iframe, svg, link,  footer, nav, form, .Note, .breadcrumb').remove();

$("body").find("h1, h2, h3, h4, h5, h6, p, ul, ol, table").each(function () {
    const $element = $(this);

    // Skip invisible elements (self or parent hidden)
  let skip = false;
  $element.parents().addBack().each(function () {
    const el = $(this);
    const style = (el.attr("style") || "").toLowerCase();
    if (
      style.includes("display:none") ||
      style.includes("visibility:hidden") ||
      el.attr("hidden") !== undefined
    ) {
      skip = true;
      return false;
    }
  });
  if (skip) {
    return; // don't process
  }

    // Skip elements that are inside a table or have no meaningful content
    if ($element.parents("table").length > 0 || $element.text().trim() === '') {
      return;
    }

    const tag = $element.prop("tagName").toLowerCase();
    let text = $element.text().trim();


    // Original handling for other elements
    if (tag.match(/^h[1-6]$/)) {
      content.push({
        type: "heading",
        level: parseInt(tag.charAt(1)),
        text: text,
        element: $element,
      });
    } else if (tag === "p") {
      const text = $element.text().trim();
      if (text) { // Only add if there's actual text
        content.push({
          type: "paragraph",
          text: text,
          element: $element,
        });
      }
    }
    else if (tag === "ul" || tag === "ol") {
      const items = [];
      $(this).find("li").each(function () {
        let itemText = $(this).html().trim();
        itemText = itemText.replace(/<br\s*\/?>/gi, "\n");
        itemText = cheerio.load(itemText).text().trim();
    
        if (itemText && !/^\d+$/.test(itemText)) {
          items.push(itemText);
        }
      });
      if (items.length > 0) {
        content.push({ type: "list", items, ordered: tag === "ol", element: $(this) });
      }
    } else if (tag === "table") {
      const tableData = [];
      $(this).find("tr").each(function () {
        const row = [];
        $(this).find("th, td").each(function () {
          let cellHtml = $(this).html().trim();
          cellHtml = cellHtml.replace(/<br\s*\/?>/gi, "\n");
          const $cell = cheerio.load(cellHtml);
          const hasCheck = $cell("a.fa.fa-check").length > 0;
          let cellText = $cell.text().trim();
      
          if (!cellText && hasCheck) {
            cellText = "✔";
          }
      

          row.push({
            value: cellText,
            rowspan: parseInt($(this).attr("rowspan") || 1),
            colspan: parseInt($(this).attr("colspan") || 1),
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
module.exports = { extractFastStructuredContent };