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

Students applying for FAST in 2025 must complete their admission before:

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

FAST has announced the date for the release of merit list for undergraduate admissions in 2025.

*Merit List Date:* ${meritListDate}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

  classesCommencement: ({ classesCommencementDate }) => `
🎓 *FAST, Lahore*
\`Date of Joining\` 

FAST has announced the dates for commencement of classes in 2025.

📆 *Commencement of Classes:* ${classesCommencementDate}

\`Tap to Join, Share & Shine\`
${WHATSAPP_CHANNEL_LINK}
`,

eligibiltyCriteria: () => `
📚 *FAST, Lahore*  
\`Eligibility Criteria 2025\`  

FAST has shared itseligibility & selection criteria for undergraduate admissions in 2025*.

*Key Weightage Highlights:*

🛠 *Engineering Programs:*  
📊 Admission Test: *33%* 
📚 HSSC / Equivalent: *50%* 
📄 SSC / Matric: *17%*  

💻 *Computing Programs:*  
📊 Admission Test: *50%*  
📚 HSSC / Equivalent: *40%* 
📄 SSC / Matric: *10%*  

📈 *Business Programs :  
📊 Admission Test: *50%* 
📚 HSSC / Equivalent: *40%*  
📄 SSC / Matric: *10%* 

*Admission Tests Accepted:* FAST-NUCES / SAT / NTS NAT (specific types only).  
*Minimum Marks:* Generally *60%* in SSC, *50-60%* in HSSC depending on program.  

For Full Details: https://nu.edu.pk/Admissions/EligibilityCriteria  

\`Tap to Join, Share & Shine\`  
${WHATSAPP_CHANNEL_LINK}
`,

  testSyllabus: () => `
📘 *FAST, Lahore*  
\`Admission Test Pattern 2025\`  

FAST has shared the admission test pattern for its undergraduate programs.

💼 *BBA, BS (Accounting & Finance, Business Analytics, FinTech):*  
🔹 English: *10%*  
🔹 Essay Writing: *15%*  
🔹 Analytical Skills & IQ: *25%* 
🔹 Basic Math: *50%*  

💻 *BS (CS, Engineering Programs):*  
🔹 English: *10%*  
🔹 Analytical Skills & IQ: *20%*  
🔹 Basic Math: *20%* 
🔹 Advanced Math: *50%*  

⚠️ *Note:*  
➖ *Negative Marking applies.*  
➖ *Calculators are NOT allowed.*  

\`Tap to Join, Share & Shine\`  
${WHATSAPP_CHANNEL_LINK}
`
,

  programmesOffered: () => `
📖 *FAST, Pakistan*  
\`Undergraduate Programs Offered\`  

FAST offers a diverse range of undergraduate programs across its campuses:  
🏛 Chiniot-Faisalabad | Islamabad | Karachi | Lahore | Multan | Peshawar


📍 *Note:* Program availability varies by campus.  
Check which campus offers which program here: https://nu.edu.pk/Degree-Programs  

\`Tap to Join, Share & Shine\`  
${WHATSAPP_CHANNEL_LINK}
`
};

module.exports = fastMessages;
