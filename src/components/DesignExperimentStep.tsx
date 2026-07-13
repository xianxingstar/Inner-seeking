import React, { useState, useEffect } from "react";
import { DeepSeekResponse } from "../../lib/schema";
import { 
  Lightbulb, 
  HelpCircle, 
  Check, 
  Users, 
  FileCheck, 
  Compass, 
  Wrench, 
  Edit, 
  AlertTriangle 
} from "lucide-react";

interface DesignExperimentStepProps {
  hypothesis: string;
  suggestedExperiment: DeepSeekResponse["experiment_suggestion"] | undefined;
  
  // Experiment form values kept in parent
  expType: string;
  setExpType: (val: string) => void;
  expAction: string;
  setExpAction: (val: string) => void;
  expContext: string;
  setExpContext: (val: string) => void;
  expOutput: string;
  setExpOutput: (val: string) => void;
  expDeadline: string;
  setExpDeadline: (val: string) => void;

  onNext: () => void;
  onBack: () => void;
}

export const DesignExperimentStep: React.FC<DesignExperimentStepProps> = ({
  hypothesis,
  suggestedExperiment,
  expType,
  setExpType,
  expAction,
  setExpAction,
  expContext,
  setExpContext,
  expOutput,
  setExpOutput,
  expDeadline,
  setExpDeadline,
  onNext,
  onBack,
}) => {
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const experimentFormats = [
    { id: "interview", label: "访谈一位相关领域的人", icon: <Users size={15} /> },
    { id: "micro_task", label: "完成一个微型真实任务", icon: <FileCheck size={15} /> },
    { id: "experience", label: "参加一次活动或体验", icon: <Compass size={15} /> },
    { id: "help_someone", label: "帮助一个真实的人解决小问题", icon: <Wrench size={15} /> },
    { id: "custom", label: "自定义", icon: <Edit size={15} /> },
  ];

  // Pre-populate with AI suggestions on first selection if empty
  useEffect(() => {
    if (suggestedExperiment && !expAction && !expContext && !expOutput && !expDeadline) {
      setExpAction(suggestedExperiment.action || "");
      setExpContext(suggestedExperiment.real_world_context || "");
      setExpOutput(suggestedExperiment.output || "");
      setExpDeadline(suggestedExperiment.deadline_suggestion || "两周内 (14天)");
    }
  }, [suggestedExperiment]);

  // Real-time experiment check (linting)
  useEffect(() => {
    const textToTest = (expAction + " " + expContext + " " + expOutput).toLowerCase();
    const soloKeywords = ["刷视频", "看视频", "看网课", "自学", "看资料", "看书", "阅读", "空想", "独自思考", "心里想", "百度", "搜集资料", "上网查"];
    
    const containsSolo = soloKeywords.some(keyword => textToTest.includes(keyword));

    if (containsSolo) {
      setWarningMsg(
        "💡 温和提示：当前的实验似乎偏向于‘独自闭门检索、看资料或看书’。一个能带来真实改变的清醒实验，必须包含【与外部真实世界的物理交互】（例如：去和活生生的人对话、向外界交付一个粗糙的代码/手绘版原型、去获取外部非自我的反馈）。建议微调实验，添加真实的人、组织或反馈渠道。"
      );
    } else if (expAction && expAction.length < 10) {
      setWarningMsg("💡 温和提示：实验的行动描述似乎有些简短。试着把‘做什么’写得更具体一些，让一个陌生人看一眼就知道怎么帮你做。");
    } else {
      setWarningMsg(null);
    }
  }, [expAction, expContext, expOutput]);

  const handlePresetSelect = (formatId: string, label: string) => {
    setExpType(formatId);
    // If selecting custom, reset unless already filled
    if (formatId === "custom") {
      setExpAction("");
      setExpContext("");
      setExpOutput("");
      setExpDeadline("两周内 (14天)");
    } else if (suggestedExperiment) {
      // Re-populate with AI suggestions to guide the user
      setExpAction(suggestedExperiment.action || "");
      setExpContext(suggestedExperiment.real_world_context || "");
      setExpOutput(suggestedExperiment.output || "");
      setExpDeadline(suggestedExperiment.deadline_suggestion || "两周内 (14天)");
    }
  };

  const isFormComplete = expAction.trim() && expContext.trim() && expOutput.trim() && expDeadline.trim();

  return (
    <div className="fade-in max-w-[720px] mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold tracking-tight text-brand-primary">
          不需要决定未来，只需要收集一轮真实证据。
        </h2>
        <p className="text-xs text-text-muted">
          实验是一次轻型的探索。它的最高标准是：在两周内看到反馈。即便证明假设是错的，也是极为宝贵的数据点。
        </p>
      </div>

      {/* Hypothesis display */}
      <div className="bg-brand-primary/5 border border-brand-primary/10 border-l-4 border-l-brand-primary rounded-lg p-4 flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb className="text-brand-primary" size={14} />
          <span className="text-xs font-semibold text-brand-primary">你正在验证的假设：</span>
        </div>
        <p className="text-sm italic font-medium text-text-dark pl-6">
          “ {hypothesis || "我正在验证：通过与行业学长交流，我是否能更清晰地认识当前的抉择。"} ”
        </p>
        <span className="text-[10px] text-text-muted pl-6 mt-1 block">
          （这不是对你的终身定义，只是一个值得收集证据的假设。）
        </span>
      </div>

      {/* Experiment Type Selector */}
      <div className="flex flex-col gap-2.5">
        <label className="text-sm font-semibold text-text-dark">第一步：选择你的实验形式</label>
        <div className="flex flex-wrap gap-2">
          {experimentFormats.map((format) => {
            const isSelected = expType === format.id;
            return (
              <button
                id={`exp-type-${format.id}`}
                key={format.id}
                onClick={() => handlePresetSelect(format.id, format.label)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? "bg-brand-primary border-brand-primary text-white"
                    : "bg-white border-border-stone text-text-dark hover:border-text-muted"
                }`}
              >
                {format.icon}
                <span>{format.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Experiment Sheet */}
      <div className="bg-white border border-border-stone rounded-lg p-5 flex flex-col gap-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted font-mono">
          # 两周实验行动单（支持自定义编辑）
        </h4>

        {/* Action Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-dark">
            1. 我准备做什么？（具体、可操作的行动）
          </label>
          <textarea
            id="exp-action-textarea"
            rows={2}
            value={expAction}
            onChange={(e) => setExpAction(e.target.value)}
            placeholder="例如：访谈一位做后端开发2年的师兄，问他日常最枯燥的三个场景，以及对初学者的能力建议。"
            className="w-full text-xs border border-border-stone rounded px-3 py-2 bg-white text-text-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition resize-none leading-relaxed"
          />
        </div>

        {/* Real World Context Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-dark">
            2. 我会和谁做，或者在什么环境做？（真实的外部对象/反馈源）
          </label>
          <input
            id="exp-context-input"
            type="text"
            value={expContext}
            onChange={(e) => setExpContext(e.target.value)}
            placeholder="例如：本系的张师兄，约他在微信进行15分钟语音访谈。"
            className="w-full text-xs border border-border-stone rounded px-3 py-2.5 bg-white text-text-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
          />
        </div>

        {/* Output Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-dark">
            3. 完成后会留下什么可被看见的结果/交付物？
          </label>
          <input
            id="exp-output-input"
            type="text"
            value={expOutput}
            onChange={(e) => setExpOutput(e.target.value)}
            placeholder="例如：整理出一份包含他3个工作日常、对初学者2个重点建议的访谈笔记。"
            className="w-full text-xs border border-border-stone rounded px-3 py-2.5 bg-white text-text-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
          />
        </div>

        {/* Deadline Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-dark">
            4. 承诺截止日期（建议在两周以内）
          </label>
          <input
            id="exp-deadline-input"
            type="text"
            value={expDeadline}
            onChange={(e) => setExpDeadline(e.target.value)}
            placeholder="例如：2026年7月25日之前（大约两周）"
            className="w-full text-xs border border-border-stone rounded px-3 py-2.5 bg-white text-text-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
          />
        </div>
      </div>

      {/* Gentle warning feedback (if Solo Experiment detected) */}
      {warningMsg && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-4 flex gap-3 text-xs leading-relaxed text-amber-900">
          <AlertTriangle className="text-amber-700 shrink-0 mt-0.5" size={16} />
          <div>{warningMsg}</div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-stone">
        <button
          id="exp-back-btn"
          onClick={onBack}
          className="text-xs text-text-muted hover:text-text-dark transition-colors cursor-pointer"
        >
          返回上一步
        </button>
        <button
          id="exp-next-btn"
          onClick={onNext}
          disabled={!isFormComplete}
          className={`px-5 py-2.5 rounded-md font-medium text-xs text-white shadow-sm transition-all duration-200 ${
            isFormComplete
              ? "bg-brand-primary hover:bg-brand-hover cursor-pointer"
              : "bg-border-stone text-text-muted cursor-not-allowed"
          }`}
        >
          确认并生成“清醒行动卡”
        </button>
      </div>
    </div>
  );
};
