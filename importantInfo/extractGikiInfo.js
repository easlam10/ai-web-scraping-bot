function extractDatesFromGikiStructuredContent(structuredData) {
  const result = {
    applicationDates: { startDate: null, deadlineDate: null },
    financialAidDeadline: null,
    admissionTestDates: { testDate: null, resultDate: null },
    meritListDate: null,
    orientationDates: { orientationDate: null, commencementDate: null },
  };

  // Look for schedule-specific paragraphs first
  const scheduleParagraphs = structuredData.filter(
    (item) => item.type === "paragraph" && item.isSchedule === true
  );
  for (const para of scheduleParagraphs) {
    extractDatesFromText(para.text, result);
  }

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
      const parts = item.split(/[:•\-–—]\s+/);
      if (parts.length >= 2) {
        const label = parts[0].toLowerCase().trim();
        const value = parts.slice(1).join(" ").trim();
        extractDatesFromLabelValuePair(label, value, result);
      } else {
        // Try to extract dates directly from the text
        extractDatesFromText(item, result);
      }
    }
  }

  // Finally check paragraphs
  const paragraphs = structuredData.filter(
    (item) => item.type === "paragraph" && item.isSchedule !== true
  );
  for (const para of paragraphs) {
    // Look for patterns like "Application Start: January 1, 2023"
    const matches = para.text.match(/([a-zA-Z\s]+)[:]\s*([^\n]+)/g);
    if (matches) {
      matches.forEach((match) => {
        try {
          const [full, label, value] = match.match(
            /([a-zA-Z\s]+)[:]\s*([^\n]+)/
          );
          if (label && value) {
            extractDatesFromLabelValuePair(
              label.toLowerCase().trim(),
              value.trim(),
              result
            );
          }
        } catch (e) {
          // Skip if regex match fails
        }
      });
    } else {
      // Try to extract dates directly from the text
      extractDatesFromText(para.text, result);
    }
  }

  return result;
}

// Helper function to extract dates from free text
function extractDatesFromText(text, result) {
  const lowerText = text.toLowerCase();

  // Application dates
  if (lowerText.includes("application") || lowerText.includes("apply")) {
    if (
      lowerText.includes("start") ||
      lowerText.includes("open") ||
      lowerText.includes("from")
    ) {
      const dateMatch = text.match(
        /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s+\d{4})?)/i
      );
      if (dateMatch) {
        result.applicationDates = result.applicationDates || {};
        result.applicationDates.startDate = dateMatch[1];
      }
    }

    if (
      lowerText.includes("deadline") ||
      lowerText.includes("close") ||
      lowerText.includes("last date") ||
      lowerText.includes("till") ||
      lowerText.includes("until")
    ) {
      const dateMatch = text.match(
        /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s+\d{4})?)/i
      );
      if (dateMatch) {
        result.applicationDates = result.applicationDates || {};
        result.applicationDates.deadlineDate = dateMatch[1];
      }
    }
  }

  // Financial aid
  if (
    lowerText.includes("financial") &&
    (lowerText.includes("assistance") ||
      lowerText.includes("aid") ||
      lowerText.includes("scholarship"))
  ) {
    const dateMatch = text.match(
      /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s+\d{4})?)/i
    );
    if (dateMatch) {
      result.financialAidDeadline = dateMatch[1];
    }
  }

  // Admission test
  if (
    lowerText.includes("admission test") ||
    lowerText.includes("entry test") ||
    (lowerText.includes("test") && lowerText.includes("date"))
  ) {
    const dateMatch = text.match(
      /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s+\d{4})?)/i
    );
    if (dateMatch) {
      result.admissionTestDates = result.admissionTestDates || {};
      result.admissionTestDates.testDate = dateMatch[1];
    }
  }

  // Result announcement
  if (
    lowerText.includes("result") ||
    lowerText.includes("announcement") ||
    lowerText.includes("declared")
  ) {
    const dateMatch = text.match(
      /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s+\d{4})?)/i
    );
    if (
      dateMatch &&
      (lowerText.includes("test") || lowerText.includes("exam"))
    ) {
      result.admissionTestDates = result.admissionTestDates || {};
      result.admissionTestDates.resultDate = dateMatch[1];
    }
  }

  // Merit list
  if (lowerText.includes("merit") || lowerText.includes("selection list")) {
    const dateMatch = text.match(
      /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s+\d{4})?)/i
    );
    if (dateMatch) {
      result.meritListDate = dateMatch[1];
    }
  }

  // Orientation and classes commencement
  if (
    lowerText.includes("orientation") ||
    lowerText.includes("joining") ||
    lowerText.includes("induction")
  ) {
    const dateMatch = text.match(
      /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s+\d{4})?)/i
    );
    if (dateMatch) {
      result.orientationDates = result.orientationDates || {};
      result.orientationDates.orientationDate = dateMatch[1];
    }
  }

  if (
    lowerText.includes("commencement") ||
    lowerText.includes("classes begin") ||
    lowerText.includes("start of classes")
  ) {
    const dateMatch = text.match(
      /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s+\d{4})?)/i
    );
    if (dateMatch) {
      result.orientationDates = result.orientationDates || {};
      result.orientationDates.commencementDate = dateMatch[1];
    }
  }
}

// Helper function to process label-value pairs
function extractDatesFromLabelValuePair(label, value, result) {
  // Application dates
  if (
    label.includes("application start") ||
    label.includes("registration open")
  ) {
    result.applicationDates = result.applicationDates || {};
    result.applicationDates.startDate = value;
  } else if (
    label.includes("application deadline") ||
    label.includes("last date to apply") ||
    label.includes("closing date")
  ) {
    result.applicationDates = result.applicationDates || {};
    result.applicationDates.deadlineDate = value;
  }

  // Financial aid
  if (
    label.includes("financial assistance") ||
    label.includes("last date for receipt") ||
    label.includes("financial aid") ||
    label.includes("scholarship")
  ) {
    result.financialAidDeadline = value;
  }

  // Admission test dates
  if (
    label.includes("admission test") ||
    label.includes("entry test") ||
    label.includes("test date")
  ) {
    result.admissionTestDates = result.admissionTestDates || {};
    result.admissionTestDates.testDate = value;
  } else if (
    label.includes("result announcement") ||
    label.includes("result date") ||
    label.includes("declaration of result")
  ) {
    result.admissionTestDates = result.admissionTestDates || {};
    result.admissionTestDates.resultDate = value;
  }

  // Merit list
  if (
    label.includes("merit list") ||
    label.includes("selection list") ||
    label.includes("final selection")
  ) {
    result.meritListDate = value;
  }

  // Orientation dates
  if (
    label.includes("orientation") ||
    label.includes("joining") ||
    label.includes("induction")
  ) {
    result.orientationDates = result.orientationDates || {};
    result.orientationDates.orientationDate = value;
  } else if (
    label.includes("commencement") ||
    label.includes("classes begin") ||
    label.includes("start of classes")
  ) {
    result.orientationDates = result.orientationDates || {};
    result.orientationDates.commencementDate = value;
  }
}

module.exports = {
  extractDatesFromGikiStructuredContent,
};
