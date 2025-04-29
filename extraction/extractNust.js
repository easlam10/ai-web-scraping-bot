const cheerio = require("cheerio");

function extractNustStructuredContent(html) {
  const $ = cheerio.load(html);
  const content = [];

// Remove unwanted elements
$('script, style, noscript, iframe, svg, link, a:not([href^="mailto:"]), footer, nav, form, h3.widget-head').remove();

  // Process all relevant content elements
  $("body").find("h1, h2, h3, h4, h5, h6, p, ul, ol, table, div[style*='text-align'], pre").each(function () {
    const $element = $(this);

    // Skip elements that are inside a table or have no meaningful content
    if ($element.parents("table").length > 0 || $element.text().trim() === '') {
      return;
    }

    const tag = $element.prop("tagName").toLowerCase();
    let text = $element.text().trim();

    // Special handling for divs with text content
    if (tag === 'div' && $element.attr('style') && $element.attr('style').includes('text-align')) {
      content.push({
        type: "paragraph",
        text: text,
        element: $element
      });
      return;
    }

    // Handle pre elements (like "Rejection of Application")
    if (tag === 'pre') {
      content.push({
        type: "paragraph",
        text: text,
        element: $element
      });
      return;
    }

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
          const cellText = cheerio.load(cellHtml).text().trim();

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
module.exports = { extractNustStructuredContent };