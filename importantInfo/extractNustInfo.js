function toRoman(num) {
  const romanMap = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  return romanMap[num - 1] || num;
}

// NET Dates (deadline and exam dates) - More robust pattern

function extractLatestNetDeadlineAndExamDate(html) {
  const deadlineMatch = html.match(/NET[-\s]?2025[^.]*?(?:deadline|till|until|by)[^.]*?(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+2025)/i);
  const examMatch = html.match(/(?:Tests?|Exam)[^.]*?(?:commence|start|begin)[^.]*?(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+2025)/i);
  const seriesMatch = html.match(/NET[-\s]?2025[^.]*?(?:Series|Session)[-\s]?(\d+|[IVX]+)/i);

  const seriesRaw = seriesMatch?.[1] || null;
  const series = /^\d+$/.test(seriesRaw) ? `Series ${toRoman(Number(seriesRaw))}` : seriesRaw;

  return {
    deadline: deadlineMatch?.[1] || null,
    examStartDate: examMatch?.[1] || null,
    series: series || null
  };
}

// Math Course Deadline - More specific pattern
function extractMathCourseDateForFscPreMed(html) {
  const regex = /(?:complete|submit|finish).*?course.*?before.*?(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+2025)/i;
  return html.match(regex)?.[1] || null;
}


function extractAllNetRegistrationRanges(html) {
  const results = [];

  const rowRegex = /<tr[^>]*>\s*<th[^>]*>\s*<span[^>]*>Series\s*[–-]\s*(\d)[^<]*<\/span><\/th>\s*<td[^>]*>\s*<span[^>]*>([^<]*?)\s*[–-]\s*([^<]*?)<\/span>/gms;

  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const romanSeries = toRoman(Number(match[1]));

    // Remove &nbsp; and trim whitespace
    const cleanStartDate = match[2].replace(/&nbsp;/g, ' ').trim();
    const cleanEndDate = match[3].replace(/&nbsp;/g, ' ').trim();

    results.push({
      series: `Series ${romanSeries}`,
      startDate: cleanStartDate,
      endDate: cleanEndDate
    });
  }

  return results.length ? results : null;
}


module.exports = {
  extractLatestNetDeadlineAndExamDate,
  extractMathCourseDateForFscPreMed,
  extractAllNetRegistrationRanges
};