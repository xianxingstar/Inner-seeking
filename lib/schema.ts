import { z } from "zod";

export const DeepSeekResponseSchema = z.object({
  stage: z.enum(["fact_reflection", "clarify", "experiment"]),
  reflection: z.string().describe("不超过 100 字，基于用户明确表达的事实"),
  facts: z.array(z.string()).describe("用户明确说过的事实"),
  interpretations: z.array(z.string()).describe("用户对事实的解释或担忧"),
  constraints: z.array(z.string()).describe("待用户确认的现实限制"),
  designable_parts: z.array(z.string()).describe("待用户确认的可行动部分"),
  hypothesis: z.string().describe("待验证假设；不是人格或职业结论"),
  next_question: z.string().max(100).describe("只能有一个问题，不超过 45 字左右"),
  experiment_suggestion: z.object({
    action: z.string().describe("行动建议"),
    real_world_context: z.string().describe("真实对象/任务/反馈"),
    output: z.string().describe("交付物/成果"),
    deadline_suggestion: z.string().describe("时间建议，一般两周内")
  }),
  safety_level: z.enum(["normal", "needs_support", "urgent"])
});

export type DeepSeekResponse = z.infer<typeof DeepSeekResponseSchema>;
