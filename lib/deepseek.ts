import { DeepSeekResponse, DeepSeekResponseSchema } from "./schema";
import { SYSTEM_PROMPT } from "./systemPrompt";

/**
 * Calls DeepSeek Chat Completions API with OpenAI compatible structure.
 * Validates the output JSON with Zod and provides fallback/retry.
 */
export async function callDeepSeekAPI(
  stage: "fact_reflection" | "clarify" | "experiment",
  history: { role: string; content: string }[],
  retryCount = 0
): Promise<{ success: boolean; data?: DeepSeekResponse; error?: string; isDemo: boolean }> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.warn("DEEPSEEK_API_KEY is not configured or placeholder. Falling back to Demonstration Mode.");
    return { success: false, isDemo: true };
  }

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API responded with status ${response.status}: ${errText}`);
    }

    const json = await response.json();
    const rawContent = json.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("Empty response content from DeepSeek API");
    }

    // Try parsing the content
    let parsedContent;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch (parseError) {
      // Sometimes it wraps JSON in markdown blocks
      const cleaned = rawContent
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      parsedContent = JSON.parse(cleaned);
    }

    // Validate using Zod
    const validationResult = DeepSeekResponseSchema.safeParse(parsedContent);

    if (!validationResult.success) {
      console.error("Zod Validation Failed:", validationResult.error.format());
      if (retryCount < 1) {
        console.log("Retrying DeepSeek API call due to schema mismatch...");
        // Add a prompt telling the model to fix its response
        const repairHistory = [
          ...history,
          { role: "assistant", content: rawContent },
          {
            role: "user",
            content: `Your previous response did not match the required JSON schema. Validation errors: ${JSON.stringify(
              validationResult.error.format()
            )}. Please output a clean JSON that matches the schema perfectly.`
          }
        ];
        return callDeepSeekAPI(stage, repairHistory, retryCount + 1);
      }
      throw new Error("Response schema validation failed after retries.");
    }

    return { success: true, data: validationResult.data, isDemo: false };
  } catch (error: any) {
    console.error("Error in callDeepSeekAPI:", error);
    return { success: false, error: error?.message || "网络请求或模型解析出错", isDemo: false };
  }
}
