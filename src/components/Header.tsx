import React from "react";
import { StepId } from "../types";
import { HelpCircle, RefreshCw } from "lucide-react";

interface HeaderProps {
  currentStep: StepId;
  onRestart: () => void;
  hasActiveCard: boolean;
  onGoToReview: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onRestart,
  hasActiveCard,
  onGoToReview,
}) => {
  // Map step to numeric indicator (0 to 5)
  const getStepProgress = (step: StepId): { num: number; label: string } => {
    switch (step) {
      case "welcome":
        return { num: 0, label: "进入与边界" };
      case "select_trouble":
        return { num: 1, label: "选择当前困扰" };
      case "specific_event":
        return { num: 2, label: "回到具体事件" };
      case "clarify_card":
        return { num: 3, label: "澄清卡住的地方" };
      case "design_experiment":
        return { num: 4, label: "设计两周实验" };
      case "action_card":
        return { num: 5, label: "生成行动卡" };
      case "review_page":
        return { num: 5, label: "行动复盘" };
      default:
        return { num: 0, label: "自我澄清" };
    }
  };

  const progress = getStepProgress(currentStep);
  const totalSteps = 5;
  const percent = currentStep === "review_page" ? 100 : (progress.num / totalSteps) * 100;

  return (
    <header className="sticky top-0 z-50 w-full bg-bg-warm/90 backdrop-blur-md border-b border-border-stone">
      <div className="max-w-[720px] mx-auto px-4 py-4 flex flex-col gap-3">
        {/* Top brand and controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-primary" />
            <h1 className="font-display font-semibold text-lg tracking-tight text-brand-primary">
              清醒行动
            </h1>
            <span className="text-xs text-text-muted font-mono border border-border-stone px-1.5 py-0.5 rounded">
              MVP
            </span>
          </div>

          <div className="flex items-center gap-3">
            {hasActiveCard && currentStep !== "review_page" && (
              <button
                id="header-goto-review-btn"
                onClick={onGoToReview}
                className="text-xs text-brand-primary hover:underline transition font-medium"
              >
                查看两周复盘
              </button>
            )}

            {currentStep !== "welcome" && (
              <button
                id="header-restart-btn"
                onClick={() => {
                  if (confirm("确定要重新开始吗？当前梳理进度将会丢失。")) {
                    onRestart();
                  }
                }}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-text-dark transition"
                title="重新开始"
              >
                <RefreshCw size={12} />
                <span>重新开始</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar (Only show if not in welcome screen) */}
        {currentStep !== "welcome" && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs text-text-muted">
              <span className="font-medium text-brand-primary">
                步骤 {progress.num}/{totalSteps}：{progress.label}
              </span>
              <span className="font-mono text-text-muted">约需 8 分钟</span>
            </div>
            <div className="w-full h-1 bg-border-stone rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-primary transition-all duration-300 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
