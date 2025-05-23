// services/aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Roman numeral converter for NET series
const romanNumerals = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
];

// Setup model
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const createSystemPrompt = (university, sourceUrl) => `
You are an AI assistant that reads structured content from ${university} admissions pages and generates concise, WhatsApp-friendly updates for students.
Only generate a message if it fits exactly one of the following formats. Ignore all other types of updates or news. Skip program listings, rankings, events, facilities, general info, or faculty bios. Your messages must match ONLY one of these types:

Admission Schedule

Entry Test Schedule

Multi-Entry Test Schedule

Deadline Extension

Date of joining/commencement

NET weightage

New Program Launch

Merit List Announcement

Vacant Seats Admission

New Campus Announcement
GENERATION RULES:
1. MESSAGE STRUCTURE:
   - Start with: "🌐 *${university}*" followed by ONE line break
   - Then relevant Sub-heading with relevant emoji (e.g., "📅 \`admission updates\`")
   - Then ONE line break
   - Then body content
   - End with: "\n\n\`📢 Tap to Join, Share & Shine\`" followed by WhatsApp link https://whatsapp.com/channel/0029Vb9qWtQGE56sYuYipX1P
   - DO NOT include extra line breaks between sections - use exactly one line break between each section



3. FORMATTING RULES:
   - Single line break between list items
   - Use Roman numerals for NET series (Series-I, II, III, IV) instead of numbers (only use for NET series)
   - Relevant emojis for content type:
     📅 Dates/Schedule
     🎓 Programs
     📝 Requirements
     ⚠️ Policies
     🔗 Resources
     📌 General info
   - Bold important dates: *15 Jun 2025*
   - Include source URL when mentioning details
   - Never start a message directly with a list or numbers without explaining what it's about


5. MESSAGE LIMITS:
- Maximum 1000 characters per message
   - Minimum 0 if no relevant info
   - Each message must be complete and standalone


7. EXAMPLES:

GOOD EXAMPLE (use only as inspiration for format dont copy it entirely) (Dates):
🌐 *${university}*
📅 \`NET-2025 Series-4 Registration\`

Registration for NET-2025 Series-IV is now open!

🗓️ *Application Deadline:* 10 Jun 2025  
📝 *Test Start Date:* 15 Jun 2025  

\`📢 Tap to Join, Share & Shine\`
https://whatsapp.com/channel/0029Vb9qWtQGE56sYuYipX1P

GOOD EXAMPLE (Programs):
🌐 *${university}*
🎓 \`New Programs - Fall 2025\`


GOOD EXAMPLE (Programs):
📘 *${university}*
\`Eligibility Criteria\` 

GIKI has announced its eligibility criteria for undergraduate admissions in 2025.

 *For Details:* ${sourceUrl}

\`📢 Tap to Join, Share & Shine\`
https://whatsapp.com/channel/0029Vb9qWtQGE56sYuYipX1P

Now process this content:
`;

async function generateMessagesFromContent(
  structuredContent,
  university = "",
  sourceUrl = ""
) {
  try {
    const contentText = structuredContent
      .map((item) => {
        if (item.type === "heading") return `## ${item.text}`;
        if (item.type === "paragraph") return item.text;
        if (item.type === "list")
          return item.items.map((i) => `- ${i}`).join("\n");
        if (item.type === "table")
          return item.data
            .map((row) => row.map((cell) => cell.value).join(" | "))
            .join("\n");
        return "";
      })
      .join("\n\n");

    const prompt = `${createSystemPrompt(
      university,
      sourceUrl
    )}\n\n${contentText}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Post-processing
    return processMessages(text, university, sourceUrl);
  } catch (error) {
    console.error("AI generation error:", error);
    return [];
  }
}

function processMessages(rawText, university, sourceUrl) {
  return (
    rawText
      .split(`🌐 *${university}*`)
      .filter((msg) => {
        const cleanMsg = msg.trim();
        return (
          cleanMsg &&
          !cleanMsg.startsWith("**Message") &&
          cleanMsg.includes("Tap to Join") &&
          !cleanMsg.includes("campuses including")
        );
      })
      .map((msg) => {
        let processed = `🌐 *${university}*${msg.trim()}`;

        // Fix NET series Roman numerals
        processed = processed.replace(
          /Series-(\d+)/g,
          (_, num) => `Series-${romanNumerals[Number(num) - 1] || num}`
        );
     // Only add line break if it's missing between heading and sub-heading
        processed = processed.replace(
          new RegExp(`(\\*${university}\\*)(?![\\n\\r])([^\\n\\r])`, "g"),
          "$1\n$2"
        );

        // Fix multiline backtick headings like:
        // 🎓 `New Undergraduate Programs
        // * Fall 2025` → 🎓 `New Undergraduate Programs - Fall 2025`
        processed = processed.replace(
          /🎓 `([^`\n]+)\s*\n\s*[*-]?\s*([^`\n]+)`/g,
          (_, a, b) => `🎓 \`${a.trim()} - ${b.trim()}\``
        );

        // Clean bullet points (- or •)
        processed = processed.replace(/(?:^|\n)[*-] +/g, "\n• ");

        // Bold plain dates (e.g., 15 Jun 2025)
        processed = processed.replace(
          /(?<!\*)\b(\d{1,2} [A-Za-z]{3} \d{4})\b(?!\*)/g,
          "*$1*"
        );

        // Only replace [link] or (link), not actual URLs
        processed = processed.replace(/\[link\]|\(link\)/g, sourceUrl);

        // Ensure 2 line breaks before 🔗 Details:
        processed = processed.replace(/\n*🔗 Details:/g, "\n\n🔗 Details:");

        // Ensure 2 line breaks before WhatsApp CTA block
        processed = processed.replace(
          /🔗 Details:.*?\n?(?=\`📢 )/gs,
          (match) => `${match.trim()}\n\n`
        );
        processed = processed.replace(
          /\`📢 Tap to Join, Share & Shine\`/,
          "\n`📢 Tap to Join, Share & Shine`"
        );

        // Clean double line breaks after bullets
        processed = processed.replace(/\n{3,}/g, "\n\n");

        return processed.trim();
      })

      // Group NET messages if needed
      .reduce((acc, msg) => {
        if (msg.includes("NET-2025")) {
          const existing = acc.find((m) => m.includes("NET-2025 Schedule"));
          if (existing) {
            return acc.map((m) =>
              m === existing ? mergeNetMessages(existing, msg) : m
            );
          }
        }
        return [...acc, msg];
      }, [])

      .slice(0, 7)
  );
}

function mergeNetMessages(existing, newMsg) {
  // Extract and combine NET series data
  const seriesData = [...existing.matchAll(/Series-[IVX]+:(.*?)(?=\n\S+|$)/gs)];
  const newSeries = newMsg.match(/Series-[IVX]+:(.*?)(?=\n\S+|$)/s);

  return newSeries ? `${existing}\n\n${newSeries[0].trim()}` : existing;
}

module.exports = { generateMessagesFromContent };
