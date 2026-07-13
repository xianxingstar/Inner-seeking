import React, { useState } from "react";
import { ShieldAlert, AlertTriangle } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="fade-in max-w-[720px] mx-auto px-4 py-8 flex flex-col gap-8">
      {/* App Intro Banner */}
      <div className="flex flex-col gap-3 text-center py-6">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-dark">
          清醒行动：自我澄清工具
        </h2>
        <p className="text-text-muted text-sm sm:text-base max-w-[500px] mx-auto leading-relaxed">
          一个帮助你从具体迷茫出发，分清事实与情绪，设计两周实验的小脚本。
        </p>
      </div>

      {/* Boundary definition card */}
      <div id="boundary-card" className="bg-white border border-border-stone border-l-4 border-l-brand-primary rounded-lg p-6 shadow-sm flex flex-col gap-4">
        <h3 className="font-semibold text-brand-primary flex items-center gap-2">
          <ShieldAlert size={18} />
          边界与定位说明
        </h3>
        
        <p className="text-text-dark text-sm leading-relaxed">
          “这不是职业测评、心理治疗或人生预测。它不会替你定义未来，只帮助你看清现在，并设计一个值得尝试的下一步。”
        </p>

        <p className="text-text-muted text-xs leading-relaxed bg-bg-warm/50 p-3 rounded-md border border-border-stone">
          <strong>数据隐私说明：</strong> 你的所有输入和生成的对话仅保存在当前浏览器的本地存储（localStorage）中。我们不向服务器数据库传输或保存任何个人身份敏感信息。请放心使用，并注意<strong>不要填写姓名、电话、学校或身份证号</strong>等任何可识别个人的真实信息。
        </p>

        {/* Checkbox */}
        <label className="flex items-start gap-3 mt-2 cursor-pointer select-none">
          <input
            id="accept-checkbox"
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 h-4.5 w-4.5 rounded border-border-stone text-brand-primary focus:ring-brand-primary cursor-pointer"
          />
          <span className="text-sm text-text-dark leading-snug font-medium">
            我理解这是一项自我探索工具，不替代专业心理支持，且我不会在表单里填写个人身份敏感信息。
          </span>
        </label>
      </div>

      {/* Safety trigger note */}
      <div className="bg-red-50/50 border border-red-100/50 rounded-lg p-5 flex gap-3.5">
        <AlertTriangle className="text-[#C0564D] shrink-0 mt-0.5" size={18} />
        <div className="flex flex-col gap-1">
          <h4 className="text-xs font-semibold text-[#8B4A45]">安全提示</h4>
          <p className="text-[#8B4A45] text-xs leading-relaxed">
            如果你正处于紧急危险，或有自伤、自杀冲动，请暂停使用并联系身边可信任的人、学校心理中心、当地紧急服务或专业支持。你不需要一个人面对。
          </p>
        </div>
      </div>

      {/* Start Button */}
      <div className="flex justify-center mt-2">
        <button
          id="start-btn"
          onClick={onNext}
          disabled={!accepted}
          className={`w-full sm:w-64 py-3 px-6 rounded-md font-medium text-sm text-white shadow-sm transition-all duration-200 ${
            accepted
              ? "bg-brand-primary hover:bg-brand-hover active:translate-y-px cursor-pointer"
              : "bg-border-stone text-text-muted cursor-not-allowed"
          }`}
        >
          开始梳理
        </button>
      </div>
    </div>
  );
};
