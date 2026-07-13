import React, { useState } from "react";
import { ActionCardData } from "../types";
import { ArrowLeft, BookOpen, CheckCircle, HelpCircle, Lightbulb, RefreshCw } from "lucide-react";

interface ReviewPageProps {
  card: ActionCardData;
  onSaveReview: (reviewData: NonNullable<ActionCardData["review"]>) => void;
  onBackToCard: () => void;
  onRestart: () => void;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({
  card,
  onSaveReview,
  onBackToCard,
  onRestart,
}) => {
  // Input states
  const [actualAction, setActualAction] = useState(card.review?.actualAction || "");
  const [unexpectedEvents, setUnexpectedEvents] = useState(card.review?.unexpectedEvents || "");
  const [newInsights, setNewInsights] = useState(card.review?.newInsights || "");
  const [status, setStatus] = useState<"continue" | "adjust" | "stop">(card.review?.status || "continue");

  const [isSaved, setIsSaved] = useState(!!card.review);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualAction.trim() || !unexpectedEvents.trim() || !newInsights.trim()) {
      alert("请填写所有的复盘反思输入框。这是收集真实证据、校准未来方向的关键。");
      return;
    }

    const reviewData: NonNullable<ActionCardData["review"]> = {
      actualAction: actualAction.trim(),
      unexpectedEvents: unexpectedEvents.trim(),
      newInsights: newInsights.trim(),
      status,
      reviewDate: new Date().toISOString(),
    };

    onSaveReview(reviewData);
    setIsSaved(true);
  };

  const statusOptions = [
    { id: "continue", label: "值得继续", desc: "实验获得了满意的正反馈，假设方向大致正确，可以深入进行" },
    { id: "adjust", label: "需要调整", desc: "发现一些与假设不符的信息，需要修改假设或微调实验动作" },
    { id: "stop", label: "应该停止", desc: "真实反馈不甚理想，或者发现这件事和自己想的截然不同，可以清醒放弃" },
  ] as const;

  return (
    <div className="fade-in max-w-[720px] mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Back button */}
      <div className="flex justify-between items-center">
        <button
          id="review-back-btn"
          onClick={onBackToCard}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-dark transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>返回查看我的行动卡</span>
        </button>
        <span className="text-xs text-text-muted font-mono">
          实验期复盘评估
        </span>
      </div>

      {/* Intro section */}
      <div className="flex flex-col gap-1.5 border-b border-border-stone pb-4">
        <h2 className="text-xl font-semibold tracking-tight text-brand-primary">
          实验期两周复盘
        </h2>
        <p className="text-xs text-text-muted">
          你制定的假设：<strong className="text-brand-primary italic">“{card.hypothesis}”</strong> 已经到了收集客观反馈并决定下一步的时候。
        </p>
      </div>

      {!isSaved ? (
        // Input Form
        <form onSubmit={handleSubmitReview} className="flex flex-col gap-6">
          {/* Action reminder box */}
          <div className="bg-[#F9F8F6] border border-border-stone border-l-4 border-l-brand-primary p-4 rounded-lg flex flex-col gap-1 text-xs">
            <span className="font-semibold text-text-dark">此前你计划的实验行动：</span>
            <p className="text-text-dark mt-0.5 whitespace-pre-wrap">{card.experiment.action}</p>
            <div className="flex gap-4 mt-2 text-text-muted font-mono">
              <span>对象环境: {card.experiment.realWorldContext}</span>
              <span>预期产出: {card.experiment.output}</span>
            </div>
          </div>

          {/* Q1: Actual action */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-dark flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-brand-primary/10 text-[10px] flex items-center justify-center text-brand-primary font-mono font-bold">1</span>
              你实际做了什么？（对比原计划，真实执行的过程）
            </label>
            <textarea
              id="review-actual-action"
              rows={3}
              value={actualAction}
              onChange={(e) => setActualAction(e.target.value)}
              placeholder="请描述你实际的推进过程。即便因为某些原因没有完全做完，或者做得很粗糙，也请如实记录事实..."
              className="w-full text-xs border border-border-stone rounded px-3 py-2 bg-white text-text-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition leading-relaxed resize-none"
            />
          </div>

          {/* Q2: Unexpected events */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-dark flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-brand-primary/10 text-[10px] flex items-center justify-center text-brand-primary font-mono font-bold">2</span>
              发生了什么和你预期不同的事？（意想不到的阻力或转机）
            </label>
            <textarea
              id="review-unexpected-events"
              rows={3}
              value={unexpectedEvents}
              onChange={(e) => setUnexpectedEvents(e.target.value)}
              placeholder="有没有碰到意料之外的现实困难、或者完全不同的反馈？这些没有被预料到的事实，反而是最重要的参考信息..."
              className="w-full text-xs border border-border-stone rounded px-3 py-2 bg-white text-text-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition leading-relaxed resize-none"
            />
          </div>

          {/* Q3: New insights */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-dark flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-brand-primary/10 text-[10px] flex items-center justify-center text-brand-primary font-mono font-bold">3</span>
              你获得了什么新信息？（关于这一件事、关于这个领域，或者关于你自己的澄清）
            </label>
            <textarea
              id="review-new-insights"
              rows={3}
              value={newInsights}
              onChange={(e) => setNewInsights(e.target.value)}
              placeholder="通过这次实验，你有了什么感性认识？以前的担忧被证实了还是被推翻了？你发现了什么新的机会？"
              className="w-full text-xs border border-border-stone rounded px-3 py-2 bg-white text-text-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition leading-relaxed resize-none"
            />
          </div>

          {/* Q4: Status Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-dark flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-brand-primary/10 text-[10px] flex items-center justify-center text-brand-primary font-mono font-bold">4</span>
              综合评估，你觉得这件事下一步应该：
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {statusOptions.map((opt) => {
                const isSelected = status === opt.id;
                return (
                  <button
                    id={`status-opt-${opt.id}`}
                    key={opt.id}
                    type="button"
                    onClick={() => setStatus(opt.id)}
                    className={`flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary"
                        : "border-border-stone bg-white hover:border-text-muted"
                    }`}
                  >
                    <span className={`text-xs font-bold ${isSelected ? "text-brand-primary" : "text-text-dark"}`}>
                      {opt.label}
                    </span>
                    <p className="text-[10px] text-text-muted leading-normal">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            id="submit-review-btn"
            type="submit"
            className="w-full py-3 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded shadow-sm transition cursor-pointer"
          >
            完成复盘，确认实验结果
          </button>
        </form>
      ) : (
        // Saved state / Concluding screen
        <div className="flex flex-col gap-6 py-4">
          {/* High polished check-in banner */}
          <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-lg p-6 text-center flex flex-col items-center gap-3">
            <CheckCircle className="text-brand-primary" size={36} />
            <h3 className="font-display font-semibold text-lg text-brand-primary">
              复盘记录已归档
            </h3>
            
            {/* The core requested quote, presented beautifully and soberly */}
            <p className="text-sm font-semibold text-brand-primary bg-white px-4 py-3 rounded-md border border-border-stone italic leading-relaxed max-w-[500px]">
              “你不需要马上确定未来。你已经比两周前多了一轮真实证据。”
            </p>

            <span className="text-[11px] text-text-muted">
              数据已同步保存在当前浏览器的 localStorage
            </span>
          </div>

          {/* Renders read-only responses */}
          <div className="bg-white border border-border-stone rounded-lg p-5 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono">
              # 复盘反思备忘
            </h4>

            <div className="flex flex-col gap-3 text-xs leading-relaxed">
              <div>
                <strong className="text-brand-primary block mb-0.5">我的行动验证决定：</strong>
                <span className="font-semibold bg-brand-primary/5 border border-brand-primary/10 px-2.5 py-0.5 rounded text-brand-primary">
                  {statusOptions.find((o) => o.id === status)?.label}
                </span>
              </div>

              <div className="border-t border-border-stone pt-3">
                <strong className="text-text-muted block">实际推进过程：</strong>
                <p className="text-text-dark mt-1 whitespace-pre-wrap">{actualAction}</p>
              </div>

              <div className="border-t border-border-stone pt-3">
                <strong className="text-text-muted block">预期外的阻力或契机：</strong>
                <p className="text-text-dark mt-1 whitespace-pre-wrap">{unexpectedEvents}</p>
              </div>

              <div className="border-t border-border-stone pt-3">
                <strong className="text-text-muted block">获得的新澄清信息：</strong>
                <p className="text-text-dark mt-1 whitespace-pre-wrap">{newInsights}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            <button
              id="edit-review-btn"
              onClick={() => setIsSaved(false)}
              className="px-4 py-2 bg-white border border-border-stone hover:border-text-muted text-text-dark text-xs font-semibold rounded transition cursor-pointer"
            >
              重新编辑复盘信息
            </button>
            <button
              id="new-round-btn"
              onClick={() => {
                if (confirm("确定要开启一轮新的澄清吗？之前的复盘卡仍然保存在本地历史中。")) {
                  onRestart();
                }
              }}
              className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded transition cursor-pointer"
            >
              开启新一轮澄清梳理
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
