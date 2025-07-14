const cheerio = require("cheerio");

function extractGikiStructuredContent(html) {
  const $ = cheerio.load(html);
  const content = [];

  // Remove unwanted elements
  $(
    'script, style, noscript, iframe, svg, link, a:not([href^="mailto:"]), footer, nav, form'
  ).remove();

  // Extract schedule dates from any tabular or list data
  const dateRegex =
    /(?:from|on|by|till|until|starting|deadline|before|after)\s+(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s+\d{4})?)/gi;
  const scheduleParagraphs = $("body").find(
    "p:contains('schedule'), p:contains('deadline'), p:contains('admission'), p:contains('date')"
  );
  scheduleParagraphs.each(function () {
    const text = $(this).text().trim();
    if (text) {
      content.push({
        type: "paragraph",
        text: text,
        element: $(this),
        isSchedule: true,
      });
    }
  });

  $("body")
    .find("h1, h2, h3, h4, h5, h6, p, ul, ol, table")
    .each(function () {
      const $element = $(this);

      // Skip invisible elements (self or parent hidden)
      let skip = false;
      $element
        .parents()
        .addBack()
        .each(function () {
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
      if (
        $element.parents("table").length > 0 ||
        $element.text().trim() === ""
      ) {
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
        if (text) {
          // Only add if there's actual text
          content.push({
            type: "paragraph",
            text: text,
            element: $element,
          });
        }
      } else if (tag === "ul" || tag === "ol") {
        const items = [];
        $(this)
          .find("li")
          .each(function () {
            let itemText = $(this).html().trim();
            itemText = itemText.replace(/<br\s*\/?>/gi, "\n");
            itemText = cheerio.load(itemText).text().trim();

            if (itemText && !/^\d+$/.test(itemText)) {
              items.push(itemText);
            }
          });
        if (items.length > 0) {
          content.push({
            type: "list",
            items,
            ordered: tag === "ol",
            element: $(this),
          });
        }
      } else if (tag === "table") {
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
module.exports = { extractGikiStructuredContent };
