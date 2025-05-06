function extractNumsInfo(html) {
    const regex = /admission.*?(start|begin|commence)[^\dA-Za-z]*([0-9]{1,2}(st|nd|rd|th)?\s+)?(\w+\s+2025)/i;
    const match = html.match(regex);
    if (match) {
      return (match[2] || "") + match[4];
    }
    return null;
}

  module.exports = { extractNumsInfo };