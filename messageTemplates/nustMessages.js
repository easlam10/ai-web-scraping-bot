const WHATSAPP_CHANNEL_LINK = "https://whatsapp.com/channel/0029Vb9qWtQGE56sYuYipX1P";

const nustMessages = {
  netAdmissionSchedule: ({ deadline, examStartDate, series }) => `
📅 *NUST, Islamabad.*
\`Admission Schedule\` 

NUST has announced its deadline for the NET-2025 ${series} intake.

🗓️ *Deadline:* ${deadline}
📝 *Exam Commencement Date:* ${examStartDate}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  mathCourseInfo: ({ deadline }) => `
📘 *NUST, Islamabad.*
\`Math Course Information\` 

NUST has designed an online self-paced mandatory Mathematics course of 8 weeks duration, for FSc Pre Medical students (who did not take additional math) and are applying for Engineering programs. 

🗓️ *Deadline to complete course:* ${deadline}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  newProgrammes: () => `
🆕 *NUST, Islamabad.*
\`New Programmes\` 

🎓 *New Programs at NUST*
📅 Starting Fall 2025

- BS Liberal Arts & Humanities at S3H, Islamabad.
- BS Geoinformatics at SCEE (IGIS), Islamabad.
- BS English (Language and Literature) at NBC, Quetta.

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  multiEntryTestSchedule: ({ tests }) => {
    const testList = tests.map(t => `📌 ${t.name}: ${t.date}`).join('\n');

    return `
🧪 *NET-2025 Test Schedule*
\`Entry Tests Schedule\` 
  
${testList}

🔔 *Important Notes:*
- Computer Based (CBNET) and Paper Based (PBNET) dates may vary
- Test centers include Islamabad, Quetta, Karachi, and Gilgit

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`;
  },

  academicQualification: () => `
📄 *NUST, Islamabad.*
\`Academic Qualification\` 

NUST has released academic qualification requirements for different undergraduate programs.

*For Details:* https://nust.edu.pk/admissions/undergraduates/academic-qualification-required-for-different-ug-

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  admissionProcedure: () => `
🛂 *NUST, Islamabad.*
\`Admission Procedure\` 

NUST has announced its procedure for admission on the basis of NET.

*For Details:* https://nust.edu.pk/admissions/undergraduates/procedure-of-admission-on-the-basis-of-net/

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  programmesCommencement: () => `
🎓 *NUST, Islamabad.*
\`Date of Joining\`

NUST has announced its schedule for undergraduate programmes commencement dates.

*For Details:* https://nust.edu.pk/admissions/under

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  netWeightage: () => `
⚖️ *NUST, Islamabad.* 
\`NET Weightage\`

NUST has announced NET subject weightage for different academic backgrounds.

*For Details:* https://nust.edu.pk/admissions/undergraduates/subjects-included-in-net-with-weightings/

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  meritCriteria: () => `
📊 *NUST, Islamabad.* 
\`NET Merit Criteria\`

NUST has announced its NET merit generation criteria for undergraduate admissions 2025:

*Merit Breakdown:*
- 📝 NUST Entry Test: *75%*
- 📚 SSC / O-Levels / Equivalent: *10%*
- 🎓 HSSC Part-1 / A-Levels / DAE / Equivalent: *15%*

*More Details:* https://nust.edu.pk/admissions/undergraduates/merit-criteria-for-admission-on-net-basis

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,
};

module.exports = nustMessages;
