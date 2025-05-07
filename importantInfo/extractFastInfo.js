function extractDatesFromFastStructuredContent(structuredData) {
    const result = {
      applicationDates: null,
      admissionTestDate: null,
      meritListDate: null,
      admissionFormalitiesDate: null,
      classesCommencementDate: null,
    };
  
    // Process only tables, since FAST schedule is in table format
    const tables = structuredData.filter(item => item.type === "table");
  
    for (const table of tables) {
      for (const row of table.data) {
        // Expecting rows like: [label, undergraduateDate, graduateDate]
        if (row.length < 2) continue;
  
        const label = row[0].value.toLowerCase().trim();
        const undergraduateValue = row[1].value.trim(); // Only UG column considered
  
        extractFastUndergradDate(label, undergraduateValue, result);
      }
    }
  
    return result;
  }

  function isProbablyDate(text) {
    // Check if it contains month names or digits with separators (basic heuristic)
    return /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i.test(text);
  }
  
  // Helper to map FAST labels to result fields
  function extractFastUndergradDate(label, value, result) {
    if (!isProbablyDate(value)) return; // Skip non-date values
    if (label.includes("application submission")) {
      result.applicationDates = value;
    } else if (label.includes("admission tests")) {
      result.admissionTestDate = value;
    } else if (label.includes("merit list")) {
      result.meritListDate = value;
    } else if (label.includes("admission formalities")) {
      result.admissionFormalitiesDate = value;
    } else if (
      label.includes("commencement of classes")
    ) {
      result.classesCommencementDate = value;
    }
  }
  
  module.exports = {
    extractDatesFromFastStructuredContent,
  };
  