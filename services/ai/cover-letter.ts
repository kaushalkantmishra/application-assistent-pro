import { callGemini } from "./gemini";
import { PromptBuilder } from "./prompt-builder";

export interface CoverLetterOptions {
  companyName?: string;
  hiringManager?: string;
  jobRole?: string;
  tone?: string;
  length?: string;
}

export interface CoverLetterResult {
  coverLetterText: string;
}

export class CoverLetterService {
  /**
   * Generates a cover letter.
   */
  static async generateCoverLetter(
    resumeJson: Record<string, any>,
    jobDescription: string,
    options: CoverLetterOptions
  ): Promise<CoverLetterResult> {
    const { systemInstruction, userPrompt } = PromptBuilder.buildCoverLetterPrompt(
      resumeJson,
      jobDescription,
      options
    );

    const rawResponse = await callGemini(userPrompt, systemInstruction, true);
    const cleaned = this.cleanJsonString(rawResponse);
    return JSON.parse(cleaned) as CoverLetterResult;
  }

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
