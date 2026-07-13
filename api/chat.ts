const VALID_STAGES = new Set(["fact_reflection", "clarify", "experiment"]);

const SYSTEM_PROMPT = `你是“清醒行动”的自我澄清引导者，不是心理咨询师、职业测评师或人生预言者。

目标：帮助大学生从一件具体困扰中分清事实、主观解释、现实限制和可行动部分，并设计一个两周内可完成的真实世界小实验。

硬规则：
1. 不定义用户人格、职业、天赋或未来；不说“你一定”“你天生适合”。
2. facts 只能摘录或紧贴改写用户明确说过的事件，不能写“用户进一步说明”“找到了阻力点”等过程空话。
3. interpretations 只能写用户已经表达的担忧或评价；证据不足时返回空数组。
4. 每次只问一个问题，next_question 不超过 45 个字。
5. experiment 必须在两周内完成，且包含真实对象、真实任务或真实反馈与可见产出；不能只是刷视频或空想。
6. 用户出现自伤、自杀、即刻危险或极度绝望时，safety_level 必须为 urgent，停止普通分析，建议联系身边可信任的人、学校心理中心、当地紧急服务或专业支持。

阶段约束：
- fact_reflection：只做事实与感受/判断的区分。next_question 必须继续追问用户描述的那件具体事件，例如当时最不满意的环节、最担心的后果或先后顺序。此阶段严禁建议“做 MVP”“找人测试”“访谈”“行动计划”，也不要用“你愿意先……吗”“比如……”把建议伪装成问题。
- clarify：只帮助用户确认 AI 的暂时理解，分清现实限制和可设计部分。可以问用户认不认同某个理解，但不能替用户选方案。
- experiment：只有在用户已经明确待验证假设后，才可以提出低成本实验。实验必须直接服务于该假设，不能从用户文本里随意抽取一个项目点子。

当前阶段会由另一条系统消息提供。只返回严格 JSON，不要 Markdown 或额外文本。
JSON 必须包含：stage、reflection、facts、interpretations、constraints、designable_parts、hypothesis、next_question、experiment_suggestion（含 action、real_world_context、output、deadline_suggestion）、safety_level。`;

function demoResponse(stage: string, userMessage: string, warning?: string) {
  const snippet = userMessage.trim().slice(0, 80);
  return {
    stage,
    reflection: "当前处于演示模式，以下内容仅用于体验流程，不应视为对你的真实分析。",
    facts: snippet ? [`你刚才提到：${snippet}${userMessage.length > 80 ? "..." : ""}`] : [],
    interpretations: [],
    constraints: [],
    designable_parts: [],
    hypothesis: "待真实模型连接后再生成。",
    next_question: "这件事里，最让你停下来的具体担心是什么？",
    experiment_suggestion: {
      action: "写下一件想进一步了解的具体事情。",
      real_world_context: "在真实生活中观察或记录一次。",
      output: "一段简短记录。",
      deadline_suggestion: "两周内",
    },
    safety_level: "normal",
    _mode: "demo",
    ...(warning ? { _warning: warning } : {}),
  };
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").slice(0, 4);
}

function normalizeResponse(value: unknown, stage: string) {
  if (!value || typeof value !== "object") throw new Error("模型没有返回对象。");
  const response = value as Record<string, unknown>;
  const experiment = response.experiment_suggestion as Record<string, unknown> | undefined;
  const safety = response.safety_level;

  return {
    stage: VALID_STAGES.has(String(response.stage)) ? response.stage : stage,
    reflection: typeof response.reflection === "string" ? response.reflection.slice(0, 160) : "",
    facts: asStringArray(response.facts),
    interpretations: asStringArray(response.interpretations),
    constraints: asStringArray(response.constraints),
    designable_parts: asStringArray(response.designable_parts),
    hypothesis: typeof response.hypothesis === "string" ? response.hypothesis : "",
    next_question: typeof response.next_question === "string" ? response.next_question.slice(0, 100) : "请再具体说说当时发生了什么？",
    experiment_suggestion: {
      action: typeof experiment?.action === "string" ? experiment.action : "",
      real_world_context: typeof experiment?.real_world_context === "string" ? experiment.real_world_context : "",
      output: typeof experiment?.output === "string" ? experiment.output : "",
      deadline_suggestion: typeof experiment?.deadline_suggestion === "string" ? experiment.deadline_suggestion : "两周内",
    },
    safety_level: safety === "urgent" || safety === "needs_support" ? safety : "normal",
    _mode: "api",
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "仅支持 POST 请求。" });
  }

  const { stage, topic, userMessage, history } = req.body ?? {};
  if (!VALID_STAGES.has(stage) || typeof topic !== "string" || typeof userMessage !== "string" || !Array.isArray(history)) {
    return res.status(400).json({ error: "参数不完整或格式不正确。" });
  }
  if (userMessage.trim().length === 0 || userMessage.length > 2000 || history.length > 8) {
    return res.status(400).json({ error: "输入内容或对话长度超出当前测试范围。" });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(200).json(demoResponse(stage, userMessage, "未配置 DEEPSEEK_API_KEY，正在使用演示内容。"));
  }

  const safeHistory = history
    .filter((item: unknown) => typeof item === "object" && item !== null &&
      ["user", "assistant"].includes((item as { role?: string }).role ?? "") &&
      typeof (item as { content?: unknown }).content === "string")
    .map((item: { role: "user" | "assistant"; content: string }) => ({ role: item.role, content: item.content.slice(0, 4000) }));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.3,
        max_tokens: 700,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: `【当前阶段】${stage}。只执行这个阶段的任务，不要提前进入下一阶段。` },
          ...safeHistory,
        ],
      }),
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      throw new Error(`DeepSeek 返回 ${response.status}: ${detail}`);
    }

    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("DeepSeek 没有返回有效内容。");
    return res.status(200).json(normalizeResponse(JSON.parse(content.replace(/```json|```/g, "").trim()), stage));
  } catch (error: any) {
    console.error("DeepSeek request failed:", error?.message ?? error);
    return res.status(200).json(demoResponse(stage, userMessage, "真实模型暂时不可用，正在使用演示内容。"));
  } finally {
    clearTimeout(timeoutId);
  }
}
