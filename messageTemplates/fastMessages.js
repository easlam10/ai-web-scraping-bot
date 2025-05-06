const WHATSAPP_CHANNEL_LINK = "https://whatsapp.com/channel/0029Vb9qWtQGE56sYuYipX1P";

const fastMessages = {
  applicationSchedule: ({ dates }) => `
📅 *FAST, Lahore*
\`Admission Schedule\` 

FAST has announced its schedule for applications for undergraduate admissions in 2025.

 *Application Submission Dates:* ${dates}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  admissionFormaltites: ({ dates }) => `
📋 *FAST, Lahore*
\`Admissions Formalities\` 

FAST has announced the dates for admission formalities in 2025. 

 *Date:* ${dates}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  admissionTest: ({ testDates }) => `
📝 *FAST, Lahore*
\`Admission Test Schedule\` 

FAST has announced the test schedule for undergraduate admissions in 2025.

📆 *Admission Test Date:* ${testDates}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  meritList: ({ meritListDate }) => `
🏅 *FAST, Lahore*
\`Merit List Announcement\` 

FAST has announced the date for the release of merit list for admissions in 2025.

*Merit List Date:* ${meritListDate}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  classesCommencement: ({ classesCommencementDate }) => `
🎓 *FAST, Lahore*
\`Date of Joining\` 

FAST has announced the dates for classes commencement in 2025.

📆 *Commencement of Classes:* ${classesCommencementDate}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  eligibiltyCriteria: () => `
📚 *FAST, Lahore*
\`Eligibility Criteria\` 

FAST has announced its eligibility criteria for undergraduate admissions in 2025.
 *For Details:* https://nu.edu.pk/Admissions/EligibilityCriteria

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  testSyllabus: () => `
📘 *FAST, Lahore*
\`Test Pattern\`

FAST has released the test pattern for undergraduate admissions in 2025.
 *For Details:* https://nu.edu.pk/Admissions/TestPattern

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  programmesOffered: () => `
📖 *FAST, Lahore*
\`Programmes Offered\`

FAST has released the list of programmes offered in all campuses for undergraduate admissions in 2025.
 *For Details:* https://nu.edu.pk/Degree-Programs

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  howToApply: () => `
🛠️ *FAST, Lahore*
\`How to Apply\`

FAST has announced the procedure for undergraduate admissions in 2025.
 *For Details:* https://giki.edu.pk/transfer-from-other-universities/

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,
};

module.exports = fastMessages;
