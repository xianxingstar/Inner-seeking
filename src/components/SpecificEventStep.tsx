import React, { useState } from "react";
import { TroubleTopic } from "../types";
import { DeepSeekResponse } from "../../lib/schema";
import { FileText, HelpCircle, Loader2, RefreshCcw, Eye, HeartHandshake } from "lucide-react";

interface SpecificEventStepProps {
  topic: TroubleTopic;
  topicDesc: string;
  specificEvent: string;
  onChangeSpecificEvent: (val: string) => void;
  aiResponse: DeepSeekResponse | null;
  onSetAiResponse: (resp: DeepSeekResponse | null) => void;
  followUpAnswer: string;
  onChangeFollowUpAnswer: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const SpecificEventStep: React.FC<SpecificEventStepProps> = ({
  topic,
  topicDesc,
  specificEvent,
  onChangeSpecificEvent,
  aiResponse,
  onSetAiResponse,
  followUpAnswer,
  onChangeFollowUpAnswer,
  onNext,
  onBack,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = specificEvent.trim().length;
  const isLengthValid = wordCount >= 30; // Min 30 to allow flexibility, prompt suggests 50-300

  const handleFetchReflection = async () => {
    if (!isLengthValid) {
      setError("输入字数略少，建议至少写 30 个字，这样梳理效果更精准。");
      return;
    }

    setLoading(true);
    setError(null);

    const userMsg = `【我的困扰】: ${topicDesc}\n【我经历的具体事件】: ${specificEvent}`;
    const initialHistory = [
      {
        role: "user",
        content: userMsg,
      },
    ];

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stage: "fact_reflection",
          topic,
          userMessage: specificEvent,
          history: initialHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("与后端连接出错，请稍后重试。");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      onSetAiResponse(data);
    } catch (err: any) {
      setError(err?.message || "网络出了点问题，未能加载分析。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-[720px] mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold tracking-tight text-brand-primary">
          先不急着解决，回到一件真实发生的事。
        </h2>
        <p className="text-xs text-text-muted">
          许多焦虑或拖延源于我们对大概念的空想。回到真实发生的、可感知的情境，更容易看到出口。
        </p>
      </div>

      {!aiResponse ? (
        // Input Form Sub-state
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-dark">
              最近一周或一个月，哪一件事情最让你感到迷茫、拖延或焦虑？当时你原本想做什么，最后实际做了什么？
            </label>
            <p className="text-xs text-text-muted">
              请具体写下：时间、原本规划、实际发生的画面（例如：‘昨天下午三点，我原本打算去图书馆写实习简历大纲，实际我坐在位置上刷了两个小时朋友圈，什么都没写’）。
            </p>
            <textarea
              id="specific-event-textarea"
              rows={6}
              value={specificEvent}
              onChange={(e) => {
                onChangeSpecificEvent(e.target.value);
                if (error) setError(null);
              }}
              placeholder="请在此处详细描述这件事（50 - 300 字为宜）..."
              className="w-full text-sm border border-border-stone rounded-md px-3.5 py-3.5 bg-white text-text-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition resize-none leading-relaxed"
            />
            {/* Character meter */}
            <div className="flex justify-between items-center text-xs mt-1">
              <span className={`font-medium ${wordCount < 50 ? "text-amber-600" : "text-brand-primary"}`}>
                {wordCount < 50 
                  ? `建议再补充一些细节 (目前 ${wordCount} 字，写满 50 字效果更佳)` 
                  : `已输入 ${wordCount} 字`
                }
              </span>
              <span className="text-text-muted">字数上限约 500 字</span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded bg-red-50 text-red-800 text-xs border border-red-100">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-stone">
            <button
              id="event-back-btn"
              onClick={onBack}
              className="text-xs text-text-muted hover:text-text-dark transition-colors cursor-pointer"
            >
              返回上一步
            </button>
            <button
              id="event-submit-btn"
              onClick={handleFetchReflection}
              disabled={loading || !isLengthValid}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-md font-medium text-xs text-white shadow-sm transition-all duration-200 ${
                isLengthValid && !loading
                  ? "bg-brand-primary hover:bg-brand-hover cursor-pointer"
                  : "bg-border-stone text-text-muted cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>整理客观事实中...</span>
                </>
              ) : (
                <>
                  <Eye size={14} />
                  <span>让我看一看</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        // Response Sub-state: AI response shown, prompting user to answer follow-up
        <div className="flex flex-col gap-6">
          {/* Urgent crisis interception */}
          {aiResponse.safety_level === "urgent" ? (
            <div className="bg-red-50/50 border border-red-100/50 rounded-lg p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-red-800 font-semibold text-sm">
                <HeartHandshake className="text-[#C0564D] animate-pulse" size={20} />
                安全与关怀保障
              </div>
              <p className="text-[#8B4A45] text-sm leading-relaxed">
                {aiResponse.reflection}
              </p>
              <div className="bg-white p-4 rounded border border-red-100/50 text-xs text-[#8B4A45] leading-relaxed flex flex-col gap-2">
                <p className="font-semibold">你可以联系以下支持管道：</p>
                <ul className="list-disc list-inside flex flex-col gap-1">
                  <li>学校心理健康教育与咨询中心 / 辅导员老师</li>
                  <li>全国心理援助热线：400-161-9995 或 800-810-1117</li>
                  <li>国家卫生健康委心理援助热线 / 当地心理危机干预热线</li>
                  <li>紧急事件请直接拨打：110 报警、120 急救</li>
                </ul>
              </div>
              <button
                id="urgent-restart-btn"
                onClick={() => window.location.reload()}
                className="w-full py-2.5 bg-[#C0564D] hover:bg-[#A8413A] text-white rounded text-xs font-medium transition cursor-pointer"
              >
                重置流程
              </button>
            </div>
          ) : (
            // Normal facilitation flow
            <>
              {/* Dynamic mode banner */}
              {aiResponse._mode === "demo" && (
                <div className="bg-amber-50/60 text-amber-900 text-xs px-3 py-2 rounded-md border border-amber-100/80 flex justify-between items-center">
                  <span>✨ 正在以<strong>演示模式（Demo Mode）</strong>运行，不消耗 API 额度，体验完整步骤。</span>
                  {aiResponse._warning && (
                    <span className="text-[10px] text-amber-700 block sm:inline">（{aiResponse._warning}）</span>
                  )}
                </div>
              )}

              {/* Reflection explanation card */}
              <div className="bg-white border border-border-stone rounded-lg p-5 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 font-mono">
                  # 澄清梳理
                </h3>
                <p className="text-text-dark text-sm leading-relaxed whitespace-pre-wrap">
                  {aiResponse.reflection}
                </p>
              </div>

              {/* Grid: Facts vs Interpretations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Objective Facts Card */}
                <div className="bg-bg-warm/50 border border-border-stone rounded-lg p-5">
                  <h4 className="text-xs font-semibold text-brand-primary flex items-center gap-1.5 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                    我听到的客观事实
                  </h4>
                  {aiResponse.facts && aiResponse.facts.length > 0 ? (
                    <ul className="flex flex-col gap-2">
                      {aiResponse.facts.map((fact, idx) => (
                        <li key={idx} className="text-xs text-text-dark leading-relaxed list-none pl-3 border-l-2 border-border-stone">
                          {fact}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-text-muted italic">暂无记录的事实</p>
                  )}
                </div>

                {/* Subjective Interpretations Card */}
                <div className="bg-white border border-border-stone rounded-lg p-5">
                  <h4 className="text-xs font-semibold text-amber-800 flex items-center gap-1.5 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    你附加的主观解释
                  </h4>
                  {aiResponse.interpretations && aiResponse.interpretations.length > 0 ? (
                    <ul className="flex flex-col gap-2">
                      {aiResponse.interpretations.map((interp, idx) => (
                        <li key={idx} className="text-xs text-text-muted leading-relaxed list-none pl-3 border-l-2 border-amber-200">
                          {interp}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-text-muted italic">暂无检测出的主观担忧</p>
                  )}
                </div>
              </div>

              {/* AI Follow-up Question Box */}
              <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-lg p-5 flex flex-col gap-3.5">
                <div className="flex items-center gap-2">
                  <span className="bg-brand-primary text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    下一问
                  </span>
                  <h4 className="text-xs font-semibold text-brand-primary">
                    一个值得进一步确认的地方
                  </h4>
                </div>
                <p className="text-sm font-semibold text-text-dark leading-relaxed">
                  {aiResponse.next_question}
                </p>

                {/* Text area for follow up */}
                <textarea
                  id="followup-answer-textarea"
                  rows={3}
                  value={followUpAnswer}
                  onChange={(e) => onChangeFollowUpAnswer(e.target.value)}
                  placeholder="说出你真实的看法或感受，不用粉饰..."
                  className="w-full text-xs border border-border-stone rounded px-3 py-2.5 bg-white text-text-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition leading-relaxed"
                />
              </div>

              {/* Next Controls */}
              <div className="flex justify-between items-center pt-4 border-t border-border-stone">
                <button
                  id="event-reset-btn"
                  onClick={() => {
                    onSetAiResponse(null);
                    onChangeFollowUpAnswer("");
                  }}
                  className="flex items-center gap-1 text-xs text-text-muted hover:text-text-dark transition cursor-pointer"
                >
                  <RefreshCcw size={12} />
                  <span>重新修改描述</span>
                </button>

                <button
                  id="event-confirm-next-btn"
                  onClick={onNext}
                  disabled={!followUpAnswer.trim()}
                  className={`px-5 py-2.5 rounded-md font-medium text-xs text-white shadow-sm transition-all duration-200 ${
                    followUpAnswer.trim()
                      ? "bg-brand-primary hover:bg-brand-hover cursor-pointer"
                      : "bg-border-stone text-text-muted cursor-not-allowed"
                  }`}
                >
                  确认事实并继续
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
