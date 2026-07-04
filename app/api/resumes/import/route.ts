import { NextRequest, NextResponse } from "next/server";
import { getInitialResumeJson } from "@/lib/resume-schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileText, fileName } = body;

    if (!fileText) {
      return NextResponse.json({ error: "No file content provided" }, { status: 400 });
    }

    const initialJson = getInitialResumeJson();

    // 1. JSON Import
    if (fileName && fileName.endsWith(".json")) {
      try {
        const parsed = JSON.parse(fileText);
        // Basic schema check
        if (parsed.personalInfo || parsed.skills || parsed.workExperience) {
          return NextResponse.json(parsed);
        }
      } catch (e) {
        console.error("Failed to parse JSON import:", e);
      }
    }

    // 2. TXT / Extracted Text Parser
    const lines = fileText.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
    
    // Extract Email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatch = fileText.match(emailRegex);
    if (emailMatch && emailMatch.length > 0) {
      initialJson.personalInfo.email = emailMatch[0];
    }

    // Extract Phone
    const phoneRegex = /(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g;
    const phoneMatch = fileText.match(phoneRegex);
    if (phoneMatch && phoneMatch.length > 0) {
      initialJson.personalInfo.phone = phoneMatch[0];
    }

    // Extract Links
    const githubMatch = fileText.match(/github\.com\/[a-zA-Z0-9_-]+/i);
    if (githubMatch) {
      initialJson.personalInfo.github = "https://" + githubMatch[0].toLowerCase();
    }
    const linkedinMatch = fileText.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    if (linkedinMatch) {
      initialJson.personalInfo.linkedin = "https://" + linkedinMatch[0].toLowerCase();
    }

    // Extract Name (assume first non-empty line without email/phone/link keywords is the name)
    for (const line of lines.slice(0, 5)) {
      if (!line.includes("@") && !line.includes("github") && !line.includes("linkedin") && !line.includes("http") && line.length > 3 && line.length < 40) {
        initialJson.personalInfo.fullName = line;
        break;
      }
    }

    // Parse sections based on header keywords
    let currentSection = "";
    let sectionLines: string[] = [];

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.match(/^(summary|objective|profile|about me)$/)) {
        currentSection = "summary";
        continue;
      } else if (lower.match(/^(skills|technical skills|technologies)$/)) {
        currentSection = "skills";
        continue;
      } else if (lower.match(/^(experience|work experience|employment|work history)$/)) {
        currentSection = "experience";
        continue;
      } else if (lower.match(/^(education|academic history)$/)) {
        currentSection = "education";
        continue;
      } else if (lower.match(/^(projects|key projects|personal projects)$/)) {
        currentSection = "projects";
        continue;
      }

      if (currentSection === "summary") {
        initialJson.personalInfo.summary = (initialJson.personalInfo.summary || "") + " " + line;
      } else if (currentSection === "skills") {
        // split by comma or bullet
        const splitSkills = line.split(/[•,;]/).map((s: string) => s.trim()).filter(Boolean);
        splitSkills.forEach((skill: string) => {
          if (!initialJson.skills.some((s: any) => s.name.toLowerCase() === skill.toLowerCase()) && skill.length < 25) {
            initialJson.skills.push({ name: skill, level: "Advanced" });
          }
        });
      }
    }

    initialJson.personalInfo.summary = initialJson.personalInfo.summary?.trim() || "";

    return NextResponse.json(initialJson);
  } catch (error: any) {
    console.error("POST Import Resume Error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse import" }, { status: 500 });
  }
}
