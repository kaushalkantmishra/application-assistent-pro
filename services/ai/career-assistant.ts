import { callGemini, callGeminiStream } from "./gemini";

export interface AtsReportResult {
  atsScore: number;
  keywordMatch: number;
  keywordDensity: { keyword: string; densityPercent: number }[];
  formattingIssues: string[];
  missingKeywords: string[];
  weakKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  priorityImprovements: string[];
}

export interface RoadmapResult {
  role: string;
  skillsToLearn: string[];
  technologies: string[];
  suggestedProjects: { name: string; description: string; tech: string[] }[];
  recommendedCertifications: string[];
  practiceResources: string[];
  timelineWeeks: number;
  milestones: { week: string; title: string; objectives: string[] }[];
}

export interface SummaryResult {
  professionalSummary: string;
  careerObjective: string;
  aboutMe: string;
  linkedinHeadline: string;
  linkedinAbout: string;
}

export interface ProjectImprovementResult {
  name: string;
  betterDescription: string;
  betterAchievements: string[];
  betterTechnologies: string[];
  professionalWording: string;
  impactStatement: string;
}

export class CareerAssistantService {
  /**
   * Generates a complete standalone ATS report for a resume
   */
  static async analyzeAts(resumeJson: Record<string, any>): Promise<AtsReportResult> {
    const systemPrompt = `You are a professional Applicant Tracking System (ATS) auditor.
Analyze the provided Resume JSON and evaluate its structure, keywords, styling, and density.
You must return a structured JSON object strictly matching this schema:
{
  "atsScore": number (0-100),
  "keywordMatch": number (0-100),
  "keywordDensity": Array<{ "keyword": string, "densityPercent": number }>,
  "formattingIssues": string[],
  "missingKeywords": string[],
  "weakKeywords": string[],
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": string[],
  "priorityImprovements": string[]
}
Never include conversational text or markdown. Return only the raw JSON.`;

    const userPrompt = `--- RESUME JSON ---
${JSON.stringify(resumeJson, null, 2)}`;

    const raw = await callGemini(userPrompt, systemPrompt, true);
    return JSON.parse(this.cleanJson(raw)) as AtsReportResult;
  }

  /**
   * Generates a tailored career learning roadmap
   */
  static async generateRoadmap(
    currentSkills: string[],
    targetRole: string,
    experienceText: string,
    jobDescription?: string
  ): Promise<RoadmapResult> {
    const systemPrompt = `You are an elite career planning advisor. 
Based on the candidate's current skills, target role, and experience, generate a highly structured, week-by-week learning roadmap.
You must return a structured JSON object strictly matching this schema:
{
  "role": string,
  "skillsToLearn": string[],
  "technologies": string[],
  "suggestedProjects": Array<{ "name": string, "description": string, "tech": string[] }>,
  "recommendedCertifications": string[],
  "practiceResources": string[],
  "timelineWeeks": number,
  "milestones": Array<{ "week": string, "title": string, "objectives": string[] }>
}
Never include conversational text or markdown. Return only the raw JSON.`;

    const userPrompt = `Target Role: ${targetRole}
Current Skills: ${currentSkills.join(", ")}
Experience Summary: ${experienceText}
${jobDescription ? `Target Job Description: ${jobDescription}` : ""}`;

    const raw = await callGemini(userPrompt, systemPrompt, true);
    return JSON.parse(this.cleanJson(raw)) as RoadmapResult;
  }

  /**
   * Generates resume summaries, career objectives, and LinkedIn headlines
   */
  static async generateSummary(
    resumeJson: Record<string, any>,
    targetRole?: string
  ): Promise<SummaryResult> {
    const systemPrompt = `You are a professional personal brand consultant.
Generate compelling resume summaries, career objectives, and LinkedIn headlines based on the candidate's Resume JSON.
You must return a structured JSON object strictly matching this schema:
{
  "professionalSummary": string,
  "careerObjective": string,
  "aboutMe": string,
  "linkedinHeadline": string,
  "linkedinAbout": string
}
Never include conversational text or markdown. Return only the raw JSON.`;

    const userPrompt = `Resume JSON:
${JSON.stringify(resumeJson, null, 2)}
${targetRole ? `Targeting Designation: ${targetRole}` : ""}`;

    const raw = await callGemini(userPrompt, systemPrompt, true);
    return JSON.parse(this.cleanJson(raw)) as SummaryResult;
  }

  /**
   * Reviews and suggests improvements for a specific project
   */
  static async improveProject(
    projectName: string,
    description: string,
    technologies: string[],
    achievements: string[]
  ): Promise<ProjectImprovementResult> {
    const systemPrompt = `You are a technical advisor and expert copywriter.
Review the project details and suggest stronger descriptions, impact statements, professional wording, and better technologies.
RULES:
1. DO NOT fabricate accomplishments or metrics.
2. Only rewrite the wording and structure to sound highly professional, and use stronger action verbs.
You must return a structured JSON object strictly matching this schema:
{
  "name": string,
  "betterDescription": string,
  "betterAchievements": string[],
  "betterTechnologies": string[],
  "professionalWording": string,
  "impactStatement": string
}
Never include conversational text or markdown. Return only the raw JSON.`;

    const userPrompt = `Project Name: ${projectName}
Current Description: ${description}
Technologies: ${technologies.join(", ")}
Achievements / Bullets:
${achievements.map(a => `- ${a}`).join("\n")}`;

    const raw = await callGemini(userPrompt, systemPrompt, true);
    return JSON.parse(this.cleanJson(raw)) as ProjectImprovementResult;
  }

  /**
   * Streaming advisor generator
   */
  static streamAdvisorChat(
    messageHistory: { role: "user" | "assistant"; content: string }[],
    resumeContext?: any
  ): AsyncGenerator<string, void, unknown> {
    const systemPrompt = `You are a friendly, highly intelligent AI Career Advisor.
You assist job seekers with improving their resumes, identifying learning paths, building roadmaps, and reviewing ATS readiness.
${resumeContext ? `Here is the user's Resume JSON for context:\n${JSON.stringify(resumeContext)}` : ""}
Provide helpful, professional, clear feedback. Use markdown syntax where appropriate. Keep answers focused, actionable, and structured.`;

    // Convert message history to format Gemini prompts
    const chatPrompt = messageHistory
      .map((m) => `${m.role === "user" ? "User" : "Advisor"}: ${m.content}`)
      .join("\n\n") + "\n\nAdvisor:";

    return callGeminiStream(chatPrompt, systemPrompt);
  }

  private static cleanJson(raw: string): string {
    let clean = raw.trim();
    if (clean.startsWith("```json")) {
      clean = clean.substring(7);
    } else if (clean.startsWith("```")) {
      clean = clean.substring(3);
    }
    if (clean.endsWith("```")) {
      clean = clean.substring(0, clean.length - 3);
    }
    return clean.trim();
  }
}
