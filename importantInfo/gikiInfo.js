function extractGikiInfo(html) {
    const regex = /(?:application|admission)\s*(?:start|begin|commence|opening)[sd]?\s*(?:on|from|date)?\s*[:-\s]*\s*([0-9]{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+202[0-9])/i;
    const match = html.match(regex);
    return match ? match[1] : null;
}

module.exports = { extractGikiInfo };