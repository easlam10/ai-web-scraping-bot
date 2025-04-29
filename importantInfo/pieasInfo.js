function extractThirdTestApplyDate(html) {
  const regex = /last\s*date\s*to\s*apply.*?third\s*test.*?(with\s*late\s*fee)?.*?(till|until)?\s*([0-9]{1,2}(st|nd|rd|th)?\s+\w+\s+2025)/i;
  const match = html.match(regex);
  return match ? match[3] : null; // match[3] contains the date
}

function extractThirdTestDate(html) {
  const regex = /third\s*(test|exam|net)[^\n]*?\s*(on|held on)?\s*([0-9]{1,2}(st|nd|rd|th)?\s+\w+\s+2025)/i;
  const match = html.match(regex);
  return match ? match[3] : null; // match[3] contains the date
}

module.exports = { extractThirdTestApplyDate, extractThirdTestDate };
