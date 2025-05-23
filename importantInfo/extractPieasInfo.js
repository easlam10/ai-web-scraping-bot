function extractDatesFromPieasStructuredContent(structuredData) {
  const result = {
    firstTestDeadlines: {
      firstTestDeadline: null,
      firstTestDeadlineWithLateFees: null,
    },
    firstTestDateAndScore: {
      firstTestDate: null,
      firstTestScore: null,
    },
    secondTestDeadlines: {
      secondTestOpeningDate: null,
      secondTestDeadline: null,
      secondTestDeadlineWithLateFees: null,
    },
    secondTestDateAndScore: {
      secondTestDate: null,
      secondTestScore: null,
    },
    thirdTestDeadlines: {
      thirdTestOpeningDate: null,
      thirdTestDeadline: null,
      thirdTestDeadlineWithLateFees: null,
    },

    thirdTestDate: null,
    meritNumber: null,
    joiningDate: null,
  };

  const tables = structuredData.filter((item) => item.type === "table");
  const undergradTable = tables.length > 0 ? tables[0] : null;

  if (undergradTable) {
    for (const row of undergradTable.data) {
      if (row.length < 2) continue;

      const label = row[0].value.toLowerCase().trim();
      const value = row[1].value.trim();

      if (label.includes("first test") && label.includes("last date") && label.includes("late")) {
        result.firstTestDeadlines.firstTestDeadlineWithLateFees = value;
      } else if (label.includes("first test") && label.includes("last date")) {
        result.firstTestDeadlines.firstTestDeadline = value;
      } else if (label.includes("first") && label.includes("written test")) {
        result.firstTestDateAndScore.firstTestDate = value;
      } else if (label.includes("test score") && label.includes("first test")) {
        result.firstTestDateAndScore.firstTestScore = value;
      } else if (label.includes("second test") && label.includes("opening")) {
        result.secondTestDeadlines.secondTestOpeningDate = value;
      } else if (label.includes("second test") && label.includes("last date") && label.includes("late")) {
        result.secondTestDeadlines.secondTestDeadlineWithLateFees = value;
      } else if (label.includes("second test") && label.includes("last date")) {
        result.secondTestDeadlines.secondTestDeadline = value;
      } else if (label.includes("second") && label.includes("written test")) {
        result.secondTestDateAndScore.secondTestDate = value;
      } else if (label.includes("test score") && label.includes("second")) {
        result.secondTestDateAndScore.secondTestScore = value;
      } else if (label.includes("third test") && label.includes("opening")) {
        result.thirdTestDeadlines.thirdTestOpeningDate = value;
      } else if (label.includes("third test") && label.includes("last date") && label.includes("late")) {
        result.thirdTestDeadlines.thirdTestDeadlineWithLateFees = value;
      } else if (label.includes("third test") && label.includes("last date")) {
        result.thirdTestDeadlines.thirdTestDeadline = value;
      } else if (label.includes("third") && label.includes("written test")) {
        result.thirdTestDate = value;
      } else if (label.includes("announcement of merit number")) {
        result.meritNumber = value;
      } else if (label.includes("date of joining")) {
        result.joiningDate = value;
      }
    }
  }

  return result;
}

module.exports = { extractDatesFromPieasStructuredContent };
