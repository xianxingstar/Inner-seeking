import { callDeepSeekAPI } from "../lib/deepseek";
import { getMockResponse } from "../lib/mockResponses";

const VALID_STAGES = new Set(["fact_reflection", "clarify", "experiment"]);

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

  const safeHistory = history
    .filter((item: unknown) => {
      return typeof item === "object" && item !== null &&
        ["user", "assistant"].includes((item as { role?: string }).role ?? "") &&
        typeof (item as { content?: unknown }).content === "string";
    })
    .map((item: { role: "user" | "assistant"; content: string }) => ({
      role: item.role,
      content: item.content.slice(0, 4000),
    }));

  const apiResult = await callDeepSeekAPI(stage, safeHistory);

  if (apiResult.success && apiResult.data) {
    return res.status(200).json({ ...apiResult.data, _mode: "api" });
  }

  const mockData = getMockResponse(stage, topic, userMessage, safeHistory);
  return res.status(200).json({
    ...mockData,
    _mode: "demo",
    _warning: apiResult.error ?? "未配置 DEEPSEEK_API_KEY，正在使用演示内容。",
  });
}
