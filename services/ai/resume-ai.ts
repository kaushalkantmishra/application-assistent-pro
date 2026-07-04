import { callGemini } from "./gemini";
import { PromptBuilder } from "./prompt-builder";

export interface AnalysisResult {
  overallMatchScore: number;
  technicalMatchPercent: number;
  experienceMatchPercent: number;
  skillsMatchPercent: number;
  educationMatchPercent: number;
  keywordMatchPercent: number;
  atsScore: number;
  missingSkills: string[];
  missingTechnologies: string[];
  missingKeywords: string[];
  missingCertifications: string[];
  missingActionVerbs: string[];
  missingResponsibilities: string[];
  suggestions: { recommendation: string; why: string }[];
  keywordDensity: { keyword: string; densityPercent: number }[];
  strengths: string[];
  weaknesses: string[];
  formattingSuggestions: string[];
  improvementSuggestions: string[];
}

export interface SectionOptimizationResult {
  explanation: string;
  optimizedSection: any;
}

export interface FullOptimizationResult {
  explanation: string;
  optimizedResumeJson: Record<string, any>;
}

export class ResumeAiService {
  /**
   * Analyzes a resume against a job description.
   */
  static async analyzeResume(resumeJson: Record<string, any>, jobDescription: string): Promise<AnalysisResult> {
    const { systemInstruction, userPrompt } = PromptBuilder.buildAnalysisPrompt(resumeJson, jobDescription);
    const rawResponse = await callGemini(userPrompt, systemInstruction, true);
    
    // Clean up response if there are markdown wrappers
    const cleaned = this.cleanJsonString(rawResponse);
    return JSON.parse(cleaned) as AnalysisResult;
  }

  /**
   * Optimizes a single section of the resume.
   */
  static async optimizeSection(
    resumeJson: Record<string, any>,
    sectionId: string,
    jobDescription: string
  ): Promise<SectionOptimizationResult> {
    const { systemInstruction, userPrompt } = PromptBuilder.buildSectionOptimizationPrompt(
      resumeJson,
      sectionId,
      jobDescription
    );
    const rawResponse = await callGemini(userPrompt, systemInstruction, true);
    const cleaned = this.cleanJsonString(rawResponse);
    return JSON.parse(cleaned) as SectionOptimizationResult;
  }

  /**
   * Optimizes the entire resume.
   */
  static async optimizeEntireResume(
    resumeJson: Record<string, any>,
    jobDescription: string
  ): Promise<FullOptimizationResult> {
    const { systemInstruction, userPrompt } = PromptBuilder.buildEntireResumeOptimizationPrompt(
      resumeJson,
      jobDescription
    );
    const rawResponse = await callGemini(userPrompt, systemInstruction, true);
    const cleaned = this.cleanJsonString(rawResponse);
    return JSON.parse(cleaned) as FullOptimizationResult;
  }

  /**
   * Sanitizes the Gemini output in case it includes markdown wrappers.
   */
  private static cleanJsonString(raw: string): string {
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
