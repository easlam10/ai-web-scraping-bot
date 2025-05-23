const WHATSAPP_CHANNEL_LINK = "https://whatsapp.com/channel/0029Vb9qWtQGE56sYuYipX1P";

const pieasMessages = {
  firstTestDeadlines: ({ deadline, deadlineWithLateFees }) => `
📅 *PIEAS, Islamabad*
\`First Entry Test Schedule\`

PIEAS has announced its schedule for applying for the first entry test for undergraduate admissions in 2025.

🔹 *Deadline to Apply:* ${deadline}
🔹 *Deadline with Late Fees:* ${deadlineWithLateFees}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  firstTestDateAndScore: ({ date, scoreAnnouncement }) => `
📅 *PIEAS, Islamabad*
\`First Entry Test\`

PIEAS has announced the test date for the first entry test for undergraduate admissions in 2025.

📝 *Test Date:* ${date}

📢 *Score Announcement:* ${scoreAnnouncement}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  secondTestDeadlines: ({ openingDate, deadline, deadlineWithLateFees }) => `
📅 *PIEAS, Islamabad*
\`Second Entry Test Schedule\`

PIEAS has announced its schedule for applying for the second entry test for undergraduate admissions in 2025.

🔓 *Opening of Applications:* ${openingDate}
🔹 *Deadline to Apply:* ${deadline}
🔹 *Deadline with Late Fees:* ${deadlineWithLateFees}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  secondTestDateAndScore: ({ date, scoreAnnouncement }) => `
📅 *PIEAS, Islamabad*
\`Second Entry Test\`

PIEAS has announced the test date for the second entry test for undergraduate admissions in 2025.

📝 *Test Date:* ${date}
📢 *Score Announcement:* ${scoreAnnouncement} (On Application Portal)

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  thirdTestDeadlines: ({ openingDate, deadline, deadlineWithLateFees }) => `
📅 *PIEAS, Islamabad*
\`Third Entry Test Schedule\`

PIEAS has announced its schedule for applying for the third entry test for undergraduate admissions in 2025.

🔓 *Opening of Applications:* ${openingDate}
🔹 *Deadline to Apply:* ${deadline}
🔹 *Deadline with Late Fees:* ${deadlineWithLateFees}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  thirdTestDate: ({ date }) => `
📅 *PIEAS, Islamabad*
\`Third Entry Test\`

PIEAS has announced the test date for the third entry test for undergraduate admissions in 2025.

📝 *Test Date:* ${date}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  meritNumber: ({ date }) => `
🏅 *PIEAS, Islamabad*
\`Merit Number Announcement\`

PIEAS has announced the date for the annoucement of merit positions for admissions in 2025.

📢 *Date:* ${date}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  classesCommencement: ({ date }) => `
🎓 *PIEAS, Islamabad*
\`Commencement of Classes\`

PIEAS has announced the date for commencement of classes in 2025.

📚 *Classes Begin:* ${date}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  programsOffered: () => `
🌐 *PIEAS, Islamabad*
\`BS Admissions 2025\`

PIEAS is offering the following BS programs:

🔧 *Engineering Programs*:
- Electrical Engineering
- Mechanical Engineering
- Chemical Engineering
- Metallurgy & Materials Engineering

🔬 *Science Programs*:
- Computer & Information Sciences
- Physics

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`
};

module.exports = pieasMessages;
