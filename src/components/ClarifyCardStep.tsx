import React, { useEffect, useState } from "react";
import { TroubleTopic } from "../types";
import { DeepSeekResponse } from "../../lib/schema";
import { 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Edit3, 
  Loader2, 
  Check, 
  HelpCircle,
  Lightbulb,
  CornerDownRight
} from "lucide-react";

interface ClarifyCardStepProps {
  topic: TroubleTopic;
  topicDesc: string;
  specificEvent: string;
  step2Response: DeepSeekResponse;
  step2Answer: string;
  
  // States stored in parent so they persist if user goes back
  constraintsList: string[];
  setConstraintsList: (list: string[]) => void;
  designablesList: string[];
  setDesignablesList: (list: string[]) => void;
  hypothesisText: string;
  setHypothesisText: (val: string) => void;
  
  step3Response: DeepSeekResponse | null;
  setStep3Response: (resp: DeepSeekResponse | null) => void;
  
  onNext: () => void;
  onBack: () => void;
}

export const ClarifyCardStep: React.FC<ClarifyCardStepProps> = ({
  topic,
  topicDesc,
  specificEvent,
  step2Response,
  step2Answer,
  constraintsList,
  setConstraintsList,
  designablesList,
  setDesignablesList,
  hypothesisText,
  setHypothesisText,
  step3Response,
  setStep3Response,
  onNext,
  onBack,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [newConstraint, setNewConstraint] = useState("");
  const [newDesignable, setNewDesignable] = useState("");
  const [editingIndex, setEditingIndex] = useState<{ type: "constraint" | "designable" | "hypothesis"; index: number } | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // Load from API on mount if not already loaded
  useEffect(() => {
    if (!step3Response) {
      const fetchClarification = async () => {
        setLoading(true);
        setError(null);

        // Build dialogue history up to now
        const history = [
          {
            role: "user",
            content: `【我的困扰】: ${topicDesc}\n【我经历的具体事件】: ${specificEvent}`
          },
          {
            role: "assistant",
            content: JSON.stringify(step2Response)
          },
          {
            role: "user",
            content: `【我对追问的回答】: ${step2Answer}`
          }
        ];

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              stage: "clarify",
              topic,
              userMessage: step2Answer,
              history,
            }),
          });

          if (!response.ok) {
            throw new Error("后端连接失败，请重试。");
          }

          const data = await response.json();
          if (data.error) {
            throw new Error(data.error);
          }

          setStep3Response(data);
          setConstraintsList(data.constraints || []);
          setDesignablesList(data.designable_parts || []);
          setHypothesisText(data.hypothesis || "");
        } catch (err: any) {
          setError(err?.message || "无法加载深度分析，请点击下方重试。");
        } finally {
          setLoading(false);
        }
      };

      fetchClarification();
    }
  }, [step3Response]);

  // Handle addition
  const addConstraint = () => {
    if (newConstraint.trim()) {
      setConstraintsList([...constraintsList, newConstraint.trim()]);
      setNewConstraint("");
    }
  };

  const addDesignable = () => {
    if (newDesignable.trim()) {
      setDesignablesList([...designablesList, newDesignable.trim()]);
      setNewDesignable("");
    }
  };

  // Handle delete
  const deleteConstraint = (idx: number) => {
    setConstraintsList(constraintsList.filter((_, i) => i !== idx));
  };

  const deleteDesignable = (idx: number) => {
    setDesignablesList(designablesList.filter((_, i) => i !== idx));
  };

  // Handle edit launch
  const startEditing = (type: "constraint" | "designable" | "hypothesis", index: number, value: string) => {
    setEditingIndex({ type, index });
    setEditingValue(value);
  };

  // Save edit
  const saveEdit = () => {
    if (!editingIndex) return;
    const { type, index } = editingIndex;

    if (type === "constraint") {
      const updated = [...constraintsList];
      updated[index] = editingValue.trim();
      setConstraintsList(updated.filter(item => item !== ""));
    } else if (type === "designable") {
      const updated = [...designablesList];
      updated[index] = editingValue.trim();
      setDesignablesList(updated.filter(item => item !== ""));
    } else if (type === "hypothesis") {
      setHypothesisText(editingValue.trim());
    }

    setEditingIndex(null);
    setEditingValue("");
  };

  if (loading) {
    return (
      <div className="fade-in max-w-[720px] mx-auto px-4 py-24 flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="animate-spin text-brand-primary" size={36} />
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-sm text-text-dark">正在生成你的“澄清看板”</h3>
          <p className="text-xs text-text-muted">正在为你梳理无法改变的现实，并探索可被微调的主动裂缝...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in max-w-[720px] mx-auto px-4 py-16 flex flex-col items-center justify-center gap-5 text-center">
        <AlertCircle className="text-red-500" size={36} />
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-red-800">澄清看板加载出错</h3>
          <p className="text-xs text-text-muted">{error}</p>
        </div>
        <button
          onClick={() => {
            setStep3Response(null);
          }}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded text-xs font-medium transition shadow-sm cursor-pointer"
        >
          重新尝试
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-[720px] mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold tracking-tight text-brand-primary">
          澄清真正卡住的地方
        </h2>
        <p className="text-xs text-text-muted">
          通过区分现实阻力和能动空间，我们能降低无谓的心理内耗。请检查以下 AI 帮你看清的内容，你可以随意修改、删除或增加它们。
        </p>
      </div>

      {step3Response?._mode === "demo" && (
        <div className="bg-amber-50/60 text-amber-900 text-xs px-3 py-2 rounded-md border border-amber-100/80">
          ✨ 正在以<strong>演示模式（Demo Mode）</strong>运行，不消耗 API 额度。你可以根据实际需要调整这些清单。
        </div>
      )}

      {/* Constraints & Designables Cards Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
        {/* Constraints - Needs to acknowledge */}
        <div className="bg-white border border-border-stone border-l-4 border-l-amber-600 rounded-lg p-5 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 border-b border-border-stone/60 pb-2">
            <AlertCircle className="text-amber-700" size={16} />
            <div className="flex flex-col">
              <h4 className="text-xs font-semibold text-text-dark">需要承认的现实限制</h4>
              <p className="text-[10px] text-text-muted">暂时无法改变，需要接纳或低头承认的部分</p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 min-h-[120px]">
            {constraintsList.map((item, idx) => (
              <div key={idx} className="group relative flex items-start justify-between gap-2 bg-bg-warm/30 p-2.5 rounded border border-border-stone text-xs text-text-dark leading-relaxed">
                {editingIndex?.type === "constraint" && editingIndex.index === idx ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                      }}
                      className="w-full text-xs border border-border-stone rounded px-1.5 py-1 bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                    />
                    <button onClick={saveEdit} className="text-brand-primary hover:text-brand-hover cursor-pointer">
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 whitespace-pre-wrap">{item}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 ml-1">
                      <button
                        onClick={() => startEditing("constraint", idx, item)}
                        className="text-gray-400 hover:text-gray-700 p-0.5"
                        title="编辑"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => deleteConstraint(idx)}
                        className="text-gray-400 hover:text-red-700 p-0.5"
                        title="删除"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {constraintsList.length === 0 && (
              <p className="text-xs text-text-muted italic text-center my-auto">列表已空，你可以点击下方添加</p>
            )}
          </div>

          {/* Quick Add Constraint */}
          <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-border-stone/40">
            <input
              id="add-constraint-input"
              type="text"
              placeholder="新增一项不得不接受的现实..."
              value={newConstraint}
              onChange={(e) => setNewConstraint(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addConstraint();
              }}
              className="w-full text-[11px] border border-border-stone rounded px-2.5 py-1.5 bg-white text-text-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            />
            <button
              id="add-constraint-btn"
              onClick={addConstraint}
              className="bg-bg-warm hover:bg-border-stone p-2 rounded text-text-dark transition shrink-0 cursor-pointer"
              title="添加"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Designables - What we can design */}
        <div className="bg-brand-primary/5 border border-brand-primary/10 border-l-4 border-l-brand-primary rounded-lg p-5 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 border-b border-brand-primary/15 pb-2">
            <CheckCircle2 className="text-brand-primary" size={16} />
            <div className="flex flex-col">
              <h4 className="text-xs font-semibold text-brand-primary">仍然可以尝试的部分</h4>
              <p className="text-[10px] text-brand-primary/80">我们可以决定行动、进行小裂缝尝试的部分</p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 min-h-[120px]">
            {designablesList.map((item, idx) => (
              <div key={idx} className="group relative flex items-start justify-between gap-2 bg-white/80 p-2.5 rounded border border-border-stone text-xs text-text-dark leading-relaxed">
                {editingIndex?.type === "designable" && editingIndex.index === idx ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                      }}
                      className="w-full text-xs border border-border-stone rounded px-1.5 py-1 bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                    />
                    <button onClick={saveEdit} className="text-brand-primary hover:text-brand-hover cursor-pointer">
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 whitespace-pre-wrap">{item}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 ml-1">
                      <button
                        onClick={() => startEditing("designable", idx, item)}
                        className="text-text-muted hover:text-text-dark p-0.5 cursor-pointer"
                        title="编辑"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => deleteDesignable(idx)}
                        className="text-text-muted hover:text-red-700 p-0.5 cursor-pointer"
                        title="删除"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {designablesList.length === 0 && (
              <p className="text-xs text-text-muted italic text-center my-auto">列表已空，你可以点击下方添加</p>
            )}
          </div>

          {/* Quick Add Designable */}
          <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-brand-primary/10">
            <input
              id="add-designable-input"
              type="text"
              placeholder="新增一项可以主动微调的小行动..."
              value={newDesignable}
              onChange={(e) => setNewDesignable(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addDesignable();
              }}
              className="w-full text-[11px] border border-border-stone rounded px-2.5 py-1.5 bg-white text-text-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            />
            <button
              id="add-designable-btn"
              onClick={addDesignable}
              className="bg-brand-primary/10 hover:bg-brand-primary/20 p-2 rounded text-brand-primary transition shrink-0 cursor-pointer"
              title="添加"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Hypothesis formulation */}
      {hypothesisText && (
        <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-lg p-5 flex flex-col gap-2.5 mt-2">
          <h4 className="text-xs font-semibold text-brand-primary flex items-center gap-1.5">
            <Lightbulb size={15} />
            我们正在验证的“待验证假设”
          </h4>
          <p className="text-xs text-text-muted">
            这不是对你的人格或能力定义，而是一个在两周内通过小动作搜集证据来验证的猜想。
          </p>

          <div className="group relative flex items-start justify-between gap-3 bg-white p-3.5 rounded border border-brand-primary/20 text-xs text-text-dark leading-relaxed font-medium">
            {editingIndex?.type === "hypothesis" ? (
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                  }}
                  className="w-full text-xs border border-border-stone rounded px-1.5 py-1 bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
                <button onClick={saveEdit} className="text-brand-primary hover:text-brand-hover cursor-pointer">
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-brand-primary italic">“ {hypothesisText} ”</span>
                <button
                  onClick={() => startEditing("hypothesis", 0, hypothesisText)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-text-dark p-0.5 shrink-0 cursor-pointer"
                  title="修改假设"
                >
                  <Edit3 size={12} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Deep clarification question prompt */}
      {step3Response?.next_question && (
        <div className="text-xs text-text-muted leading-relaxed bg-bg-warm/60 p-4 rounded-md border border-border-stone flex gap-2">
          <HelpCircle className="text-brand-primary shrink-0" size={15} />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-text-dark">清醒提问：</span>
            <span className="italic">“{step3Response.next_question}”</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-stone">
        <button
          id="clarify-back-btn"
          onClick={onBack}
          className="text-xs text-text-muted hover:text-text-dark transition-colors cursor-pointer"
        >
          返回上一步
        </button>
        <button
          id="clarify-next-btn"
          onClick={onNext}
          disabled={constraintsList.length === 0 && designablesList.length === 0}
          className={`px-5 py-2.5 rounded-md font-medium text-xs text-white shadow-sm transition-all duration-200 ${
            constraintsList.length > 0 || designablesList.length > 0
              ? "bg-brand-primary hover:bg-brand-hover cursor-pointer"
              : "bg-border-stone text-text-muted cursor-not-allowed"
          }`}
        >
          去设计我的两周小实验
        </button>
      </div>
    </div>
  );
};
