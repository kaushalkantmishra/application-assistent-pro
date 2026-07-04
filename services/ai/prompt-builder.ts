export class PromptBuilder {
  /**
   * Generates the system prompt and user prompt for ATS Match analysis.
   */
  static buildAnalysisPrompt(resumeJson: Record<string, any>, jobDescription: string) {
    const systemInstruction = `You are a professional ATS (Applicant Tracking System) parser and senior recruiter.
Analyze the provided Resume JSON and the Job Description to evaluate how well the candidate matches the job.
You must return a structured JSON object strictly matching this schema:
{
  "overallMatchScore": number (0-100),
  "technicalMatchPercent": number (0-100),
  "experienceMatchPercent": number (0-100),
  "skillsMatchPercent": number (0-100),
  "educationMatchPercent": number (0-100),
  "keywordMatchPercent": number (0-100),
  "atsScore": number (0-100),
  "missingSkills": string[],
  "missingTechnologies": string[],
  "missingKeywords": string[],
  "missingCertifications": string[],
  "missingActionVerbs": string[],
  "missingResponsibilities": string[],
  "suggestions": Array<{ "recommendation": string, "why": string }>,
  "keywordDensity": Array<{ "keyword": string, "densityPercent": number }>,
  "strengths": string[],
  "weaknesses": string[],
  "formattingSuggestions": string[],
  "improvementSuggestions": string[]
}
Never include any conversational text or markdown wrappers in your output. Return only the raw JSON.`;

    const userPrompt = `--- RESUME JSON ---
${JSON.stringify(resumeJson, null, 2)}

--- JOB DESCRIPTION ---
${jobDescription}`;

    return { systemInstruction, userPrompt };
  }

  /**
   * Generates the system and user prompts for optimizing a specific section.
   */
  static buildSectionOptimizationPrompt(
    resumeJson: Record<string, any>,
    sectionId: string,
    jobDescription: string
  ) {
    const currentSectionData = resumeJson[sectionId] || {};

    const systemInstruction = `You are an expert resume writer. Optimize the selected section of the candidate's Resume JSON to better align with the provided Job Description.
RULES:
1. NEVER fabricate accomplishments, credentials, degrees, dates, certifications, projects, or employment history.
2. Only improve the phrasing, vocabulary, structure, grammar, and ATS keyword inclusion of the EXISTING text.
3. Keep the same JSON schema structure as the current section.
4. Use strong action verbs and professional tone.
5. Return a structured JSON object strictly matching this schema:
{
  "explanation": "A summary of what changes were made and why (grammar, action verbs, keywords, etc.)",
  "optimizedSection": <The optimized section object in the exact same schema structure as the original input>
}
Return only the raw JSON.`;

    const userPrompt = `--- SECTION ID ---
${sectionId}

--- ORIGINAL SECTION DATA ---
${JSON.stringify(currentSectionData, null, 2)}

--- JOB DESCRIPTION ---
${jobDescription}`;

    return { systemInstruction, userPrompt };
  }

  /**
   * Generates the prompts for optimizing the entire resume.
   */
  static buildEntireResumeOptimizationPrompt(resumeJson: Record<string, any>, jobDescription: string) {
    const systemInstruction = `You are a world-class resume optimizer.
Review the candidate's entire Resume JSON and optimize all sections (Professional Summary, Experience, Projects, Skills, Achievements, Certificates, Headline) to fit the Job Description.
RULES:
1. NEVER fabricate accomplishments, companies, certifications, projects, degrees, locations, or employment dates.
2. Improve phrasing, vocabulary, grammar, and keyword relevance of existing content.
3. Maintain the exact same schema structure of the original Resume JSON.
4. Return a structured JSON object strictly matching this schema:
{
  "explanation": "Summary of changes made across all sections",
  "optimizedResumeJson": <The fully optimized replica of the input Resume JSON with identical keys>
}
Return only the raw JSON.`;

    const userPrompt = `--- ORIGINAL RESUME JSON ---
${JSON.stringify(resumeJson, null, 2)}

--- JOB DESCRIPTION ---
${jobDescription}`;

    return { systemInstruction, userPrompt };
  }

  /**
   * Generates the prompts for Cover Letter generation.
   */
  static buildCoverLetterPrompt(
    resumeJson: Record<string, any>,
    jobDescription: string,
    options: {
      companyName?: string;
      hiringManager?: string;
      jobRole?: string;
      tone?: string;
      length?: string;
    }
  ) {
    const tone = options.tone || "professional";
    const length = options.length || "medium";
    const companyName = options.companyName || "the Company";
    const hiringManager = options.hiringManager || "Hiring Manager";
    const jobRole = options.jobRole || "Open Position";

    const systemInstruction = `You are a professional cover letter writer.
Create a tailored cover letter based on the candidate's Resume JSON, target Job Description, and specified options.
RULES:
1. Highlight matching skills, relevant experience, and specific projects from the resume that align with the job description.
2. Structure the letter with a formal heading, polite introduction, body paragraphs, and a professional closing.
3. Do not invent any facts about the candidate that are not found in their resume.
4. Adhere strictly to the requested Tone: "${tone}" (Professional, Friendly, Formal, or Confident) and Length: "${length}" (Short: 1-2 brief paragraphs, Medium: 3 paragraphs, Long: 4 paragraphs).
5. Return a structured JSON object matching this schema:
{
  "coverLetterText": "The complete plain-text cover letter with proper spacing and paragraph breaks"
}
Return only the raw JSON.`;

    const userPrompt = `--- RESUME JSON ---
${JSON.stringify(resumeJson, null, 2)}

--- JOB DESCRIPTION ---
${jobDescription}

--- TARGET OPTIONS ---
Company Name: ${companyName}
Hiring Manager: ${hiringManager}
Job Role: ${jobRole}`;

    return { systemInstruction, userPrompt };
  }
}
