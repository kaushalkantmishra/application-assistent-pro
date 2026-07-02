if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not defined in environment variables");
}

export interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
}

/**
 * Invokes the Gemini API via a standardized POST request.
 * Supports system instructions and optional JSON mode.
 */
export async function callGemini(
  prompt: string,
  systemInstruction?: string,
  jsonMode: boolean = false
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  // Try gemini-2.5-flash first, fallback to gemini-2.0-flash or gemini-1.5-flash-latest if unavailable
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest"];
  let lastError: any = null;

  const requestBody: Record<string, any> = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [
        { text: systemInstruction }
      ]
    };
  }

  if (jsonMode) {
    requestBody.generationConfig = {
      responseMimeType: "application/json"
    };
  }

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API returned HTTP ${response.status} for ${model}: ${errText}`);
      }

      const data = (await response.json()) as GeminiResponse;
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        throw new Error(`Gemini API returned an empty response structure for ${model}`);
      }

      return textResponse;
    } catch (error: any) {
      console.warn(`Failed with model ${model}, trying next... Error:`, error.message);
      lastError = error;
      // Brief pause before trying next model
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw lastError || new Error("Failed to invoke Gemini API");
}
