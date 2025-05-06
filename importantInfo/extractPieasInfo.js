function extractDatesFromPieasStructuredContent(structuredData) {
  const result = {
    thirdTestApplication: {
      openingDate: null,
      deadlineDate: null,
      lateFeeDeadlineDate: null
    },
    thirdTestDate: null,
    meritNumberAnnouncementDate: null,
    joiningDate: null,
  };

  // Use ONLY the first table assuming it's the undergraduate table
  const tables = structuredData.filter(item => item.type === "table");
  const undergradTable = tables.length > 0 ? tables[0] : null;

  if (undergradTable) {
    for (const row of undergradTable.data) {
      if (row.length < 2) continue;

      const label = row[0].value.toLowerCase().trim();
      const value = row[1].value.trim();

      extractPieasDatesFromLabel(label, value, result);
    }
  }

  return result;
}

// Helper function to extract specific undergrad/third test dates
function extractPieasDatesFromLabel(label, value, result) {
  if (label.includes("third test") && label.includes("opening")) {
    result.thirdTestApplication.openingDate = value;
  } else if (
    label.includes("third test") &&
    (label.includes("last date") || label.includes("deadline")) &&
    label.includes("late")
  ) {
    result.thirdTestApplication.lateFeeDeadlineDate = value;
  } else if (
    label.includes("third test") &&
    (label.includes("last date") || label.includes("deadline")) &&
    !label.includes("late")
  ) {
    result.thirdTestApplication.deadlineDate = value;
  } else if (
    (label.includes("third test") && label.includes("test date")) ||
    label.includes("third written test")
  ) {
    result.thirdTestDate = value;
  } else if (label.includes("merit number")) {
    result.meritNumberAnnouncementDate = value;
  } else if (label.includes("joining") || label.includes("reporting")) {
    result.joiningDate = value;
  } 
}

module.exports = {
  extractDatesFromPieasStructuredContent
};
