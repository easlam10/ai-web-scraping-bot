const WHATSAPP_CHANNEL_LINK = "https://whatsapp.com/channel/0029Vb9qWtQGE56sYuYipX1P";

const gikiMessages = {
  applicationSchedule: ({ startingDate, deadline }) => `
📅 *GIKI, Swabi*
\`Admission Schedule\` 

GIKI has announced its schedule for applications for undergraduate admissions in 2025.

🟢 *Starting Date:* ${startingDate}
⛔ *Deadline:* ${deadline}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  financialAidDeadline: ({ deadline }) => `
💸 *GIKI, Swabi*
\`Financial Aid Deadline\` 

Financial aid is available for those to be admitted in the academic year 2025-2026. 

📌 *Deadline to submit financial aid documents:* ${deadline}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  admissionTest: ({ testDate, resultDate }) => `
📝 *GIKI, Swabi*
\`Admission Test\` 

GIKI has announced the test schedule for admissions in 2025.

🗓️ *Admission Test Date:* ${testDate}
📢 *Result Announcement Date:* ${resultDate}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  meritList: ({ meritListDate }) => `
🏅 *GIKI, Swabi*
\`Merit List Announcement\` 

GIKI has announced the date for the release of merit list for admissions in 2025.

 *Merit List Date:* ${meritListDate}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  classesCommencement: ({ orientationDate, classesCommencementDate }) => `
🎓 *GIKI, Swabi*
\`Date of Joining\` 

GIKI has announced the dates for classes commencement in 2025.

 *Joining and Orientation:* ${orientationDate}
 *Commencement of Classes:* ${classesCommencementDate}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  eligibiltyCriteria: () => `
📘 *GIKI, Swabi*
\`Eligibility Criteria\` 

GIKI has announced its eligibility criteria for undergraduate admissions in 2025.
 *For Details:* https://giki.edu.pk/admissions/admissions-undergraduates/eligibility-criteria/

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  testSyllabus: () => `
📚 *GIKI, Swabi*
\`Test Syllabus\`

GIKI has released the test syllabus for undergraduate admissions in 2025.
 *For Details:* https://giki.edu.pk/admissions/admissions-undergraduates/undergraduate-admission-test-syllabus/

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  applicationPaymentMethod: () => `
💳 *GIKI, Swabi*
\`Payment Details\`

GIKI has released the payment details for undergraduate applications in 2025.
 *For Details:* https://giki.edu.pk/payment/

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  transferDetails: () => `
🔁 *GIKI, Swabi*
\`Transfer Details\`

GIKI has announced the procedure for applicants who wish to transfer from other universities.
 *For Details:* https://giki.edu.pk/transfer-from-other-universities/

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,
};

module.exports = gikiMessages;
