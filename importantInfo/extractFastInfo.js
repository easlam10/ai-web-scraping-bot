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
  
  // Helper to map FAST labels to result fields
  function extractFastUndergradDate(label, value, result) {
    if (label.includes("application submission")) {
      result.applicationDates = value;
    } else if (label.includes("admission test")) {
      result.admissionTestDate = value;
    } else if (label.includes("merit list")) {
      result.meritListDate = value;
    } else if (label.includes("admission formalities")) {
      result.admissionFormalitiesDate = value;
    } else if (
      label.includes("commencement of classes") ||
      label.includes("classes start") ||
      label.includes("classes begin")
    ) {
      result.classesCommencementDate = value;
    }
  }
  
  module.exports = {
    extractDatesFromFastStructuredContent,
  };
  