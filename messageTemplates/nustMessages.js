const WHATSAPP_CHANNEL_LINK =
  "https://whatsapp.com/channel/0029Vb9qWtQGE56sYuYipX1P";

const nustMessages = {
  netAdmissionSchedule: ({
    deadline,
    examStartDate,
    series,
  }) => ` 📅 *NUST, Islamabad.*
\`Admission Schedule\` 

NUST has announced its deadline for the NET-2025 ${series} intake.

🗓️ *Deadline:* ${deadline}
📝 *Exam Commencement Date:* ${examStartDate}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,
  mathCourseInfo: ({ mathDeadline }) => `
📘 *NUST, Islamabad.*
\`Math Course Information\` 

NUST has designed an online self-paced mandatory Mathematics course of 8 weeks duration, for FSc Pre Medical students (who did not take additional math) and are applying for Engineering programs. 

🗓️ *Deadline to complete course:* ${mathDeadline}

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

🌟 A great opportunity for students aiming to pursue arts and humanities.

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  multiEntryTestSchedule: ({ tests, netSeries }) => {
    const testList = tests.map((t) => `📌 ${t.name}: ${t.date}`).join("\n");

    return `
    🧪 *NET-2025 ${netSeries} Test Schedule*
\`Entry Tests Schedule\` 

Nust has released dates for applying for NET-2025 ${netSeries}.
  
${testList}

🔔 *Important Notes:*
- For each series, separate online registration form is required to be submitted.
CBNET – Computer Based NUST Entry Test at Islamabad and Quetta
PBNET – Paper Based NUST Entry Test at Karachi and Gilgit

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`;
  },

  academicQualification: () => `
📄 *NUST, Islamabad.*
\`Academic Qualification\` 

NUST has outlined the academic qualification criteria for undergraduate programs.

📌 Non-FSc stream students must obtain an equivalence certificate from *IBCC, Pakistan*.
📌 As per HEC, *all students* must get their documents attested by *IBCC* before admission.

🔗 *Full Details:* https://nust.edu.pk/admissions/undergraduates/academic-qualification-required-for-different-ug-

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,
  admissionProcedure: () => `
🛂 *NUST, Islamabad.*
\`Admission Procedure\` 

NUST has announced its procedure for undergraduate admission via NET.

📌 Register at: https://ugadmissions.nust.edu.pk  
📌 Fill & submit the online form with a recent photo (max 1 month old).  
📌 Deposit fee at any HBL branch & get confirmation via email.  
📌 Select test date/session for Computer-Based Test (CBT).  
📌 Roll No. & test details will be emailed.  

📄 Paper-Based Test (PBT) is allotted on *First Come, First Served* basis.  

🔗 *Full Details:* https://nust.edu.pk/admissions/undergraduates/procedure-of-admission-on-the-basis-of-net/

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,
  programmesCommencement: () => `
🎓 *NUST, Islamabad.*
\`Date of Joining\`

Undergraduate classes at NUST will commence *from September 2025*, depending on your school.

📌 Most programmes (Engineering, Business, Bio-Sciences) begin in *September 2025*  
📌 CAE classes will start in *October 2025*

🔗 Full Schedule: https://nust.edu.pk/admissions/undergraduates/dates-to-remember/

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,
  actSatApplications: ({ registrationWindow, scoreDeadline }) => `
🌐 *NUST, Islamabad.*
\`ACT / SAT Admission Track\`

NUST is accepting ACT / SAT scores for UG admissions 2025.

🗓️ *Registration:* ${registrationWindow}  
📩 *Last Date to Submit Scores:* ${scoreDeadline}  
📬 Scores must be sent directly from *ACT / College Board (USA)* by due date.

🔗 More Info: https://nust.edu.pk/admissions/undergraduates/dates-to-remember/

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  actSatDates: ({ actSatDates }) => `
📆 *NUST, Islamabad.*
\`ACT/SAT Test Dates\`

Upcoming ACT/SAT test dates for NUST admissions:

${actSatDates}

📝 *Important*: Register early to secure your preferred test date and location.

🔗 More Info: https://nust.edu.pk/admissions/undergraduates/dates-to-remember/

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  netWeightageInfo: () => `
📊 *NUST, Islamabad.*
\`NET Subject Weightage\`

NUST Entry Test (NET) is stream-specific and includes subject-wise weightage based on your academic background.

🛠️ *Engineering / Computing:*  
📐 Math: 50% | ⚡ Physics: 30% | ✍️ English: 20%

🧬 *Applied Sciences:*  
🧫 Biology: 50% | 🧪 Chemistry: 30% | ✍️ English: 20%

📈 *Business / Social Sciences:*  
📊 Quantitative: 50% | ✍️ English: 50%

🏛️ *Architecture & Design:*  
🎨 Aptitude: 50% | 📐 Math: 30% | ✍️ English: 20%  
📘 [Aptitude Test Guide](https://sada.nust.edu.pk/in-the-spotlight/design-aptitude-net-guidelines/)

🔬 *Natural Sciences:*  
📐 Math: 50% | ✍️ English: 50%


🔗 Full Info: https://nust.edu.pk/admissions/undergraduates/subject-weightage-net/

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
  candidateSelection: () => `
📝 *NUST, Islamabad.*
\`Candidate Selection\`

Selection for undergraduate programmes will *tentatively begin in August 2025*.

📌 Final admission offers will be announced according to the official schedule.

🔗 Check updates here: https://nust.edu.pk/admissions/undergraduates/dates-to-remember/

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,
};

module.exports = nustMessages;
