function extractNustInfo(html) {
    const regex =
      /registration.*?NET[-\s]?2025.*?(till|until)?\s*([0-9]{1,2}(st|nd|rd|th)?\s+\w+\s+2025)/i;
    const match = html.match(regex);
    return match ? match[2] : null;
  }

  module.exports = { extractNustInfo };