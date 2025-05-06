const WHATSAPP_CHANNEL_LINK = "https://whatsapp.com/channel/0029Vb9qWtQGE56sYuYipX1P";

const pieasMessages = {
  thirdTestDeadline: ({ openingDate, deadline, deadlineWithLateFees }) => `
📅 *PIEAS, Islamabad*
\`Admission Schedule\` 

PIEAS has announced the schedule for its third test for BS admissions in 2025.

 *Opening of Admissions:* ${openingDate}
*Deadline:* ${deadline}
 *Deadline with Late Fees:* ${deadlineWithLateFees}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  thirdTest: ({ date }) => `
📝 *PIEAS, Islamabad*
\`Entrance Test\` 

PIEAS has announced the date for its third test for undergraduate admissions in 2025.

📆 *Date:* ${date}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  meritNumber: ({ date }) => `
🏅 *PIEAS, Islamabad*
\`Merit Number Announcement\` 

PIEAS has announced the date for the announcement of merit number for undergraduate programs.

📢 *Date:* ${date}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  classesCommencement: ({ classesCommencementDate }) => `
🎓 *PIEAS, Islamabad*
\`Date of Joining\` 

PIEAS has announced the dates for commencement of classes in 2025.

📚 *Commencement of Classes:* ${classesCommencementDate}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,
};

module.exports = pieasMessages;
