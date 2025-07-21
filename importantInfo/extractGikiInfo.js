function extractDatesFromGikiStructuredContent(structuredData) {
  const result = {
    applicationDates: { startDate: null, deadlineDate: null },
    financialAidDeadline: null,
    admissionTestDates: { testDate: null, resultDate: null },
    meritListDate: null,
    orientationDates: { orientationDate: null, commencementDate: null },
  };

  // First check tables (most likely structure for dates)
  const tables = structuredData.filter((item) => item.type === "table");
  for (const table of tables) {
    for (const row of table.data) {
      if (row.length < 2) continue;

      const label = row[0].value.toLowerCase().trim();
      const value = row[1].value.trim();
      extractDatesFromLabelValuePair(label, value, result);
    }
  }

  // Then check lists (bulleted/numbered items)
  const lists = structuredData.filter((item) => item.type === "list");
  for (const list of lists) {
    for (const item of list.items) {
      // Try to split list items that might contain label: value pairs
      const parts = item.split(/[:•\-]\s+/);
      if (parts.length >= 2) {
        const label = parts[0].toLowerCase().trim();
        const value = parts.slice(1).join(" ").trim();
        extractDatesFromLabelValuePair(label, value, result);
      }
    }
  }

  // Finally check paragraphs (least likely but possible)
  const paragraphs = structuredData.filter((item) => item.type === "paragraph");
  for (const para of paragraphs) {
    // Look for patterns like "Application Start: January 1, 2023"
    const matches = para.text.match(/([a-zA-Z\s]+):\s*([^\n]+)/g);
    if (matches) {
      matches.forEach((match) => {
        const [_, label, value] = match.match(/([a-zA-Z\s]+):\s*([^\n]+)/);
        extractDatesFromLabelValuePair(
          label.toLowerCase().trim(),
          value.trim(),
          result
        );
      });
    }
  }

  return result;
}

// Helper function to process label-value pairs
function extractDatesFromLabelValuePair(label, value, result) {
  // Application dates
  if (label.includes("application start")) {
    result.applicationDates = result.applicationDates || {};
    result.applicationDates.startDate = value;
  } else if (
    label.includes("application deadline") ||
    label.includes("last date to apply")
  ) {
    result.applicationDates = result.applicationDates || {};
    result.applicationDates.deadlineDate = value;
  }

  // Financial aid
  if (
    label.includes("financial assistance") ||
    label.includes("last date for receipt")
  ) {
    result.financialAidDeadline = value;
  }

  // Admission test dates
  if (label.includes("admission test") || label.includes("test date")) {
    result.admissionTestDates = result.admissionTestDates || {};
    result.admissionTestDates.testDate = value;
  } else if (
    label.includes("result announcement") ||
    label.includes("result date")
  ) {
    result.admissionTestDates = result.admissionTestDates || {};
    result.admissionTestDates.resultDate = value;
  }

  // Merit list
  if (label.includes("merit list") || label.includes("selection list")) {
    result.meritListDate = value;
  }

  // Orientation dates
  if (label.includes("orientation") || label.includes("joining")) {
    result.orientationDates = result.orientationDates || {};
    result.orientationDates.orientationDate = value;
  } else if (
    label.includes("commencement") ||
    label.includes("classes begin")
  ) {
    result.orientationDates = result.orientationDates || {};
    result.orientationDates.commencementDate = value;
  }
}

module.exports = {
  extractDatesFromGikiStructuredContent,
};
