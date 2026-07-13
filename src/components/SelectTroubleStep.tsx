import React from "react";
import { TroubleTopic } from "../types";
import { Compass, Sparkles, HelpCircle, Users, GitFork, ClipboardList } from "lucide-react";

interface SelectTroubleStepProps {
  selectedTopic: TroubleTopic | null;
  onSelectTopic: (topic: TroubleTopic) => void;
  description: string;
  onChangeDescription: (desc: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const SelectTroubleStep: React.FC<SelectTroubleStepProps> = ({
  selectedTopic,
  onSelectTopic,
  description,
  onChangeDescription,
  onNext,
  onBack,
}) => {
  const topics: { key: TroubleTopic; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      key: "future_unknown",
      label: "我不知道未来要做什么",
      icon: <Compass className="text-brand-primary" size={20} />,
      desc: "面对选科、专业去向、择业或人生方向缺乏规划和掌控感",
    },
    {
      key: "procrastination",
      label: "我想行动，但总是拖延",
      icon: <ClipboardList className="text-brand-primary" size={20} />,
      desc: "脑子里有一堆计划，但总是无法起步，陷入自我怀疑的怪圈",
    },
    {
      key: "self_doubt",
      label: "我经常怀疑自己",
      icon: <Sparkles className="text-brand-primary" size={20} />,
      desc: "觉得自己能力不足，在任务或挑战前习惯性退缩",
    },
    {
      key: "comparison",
      label: "我总在和别人比较",
      icon: <Users className="text-brand-primary" size={20} />,
      desc: "看到同学拿实习、发论文或社交精彩而焦虑，觉得自己落后了",
    },
    {
      key: "specific_choice",
      label: "我面临一个具体选择",
      icon: <GitFork className="text-brand-primary" size={20} />,
      desc: "比如考研还是找工作、选A公司还是B公司，不知道如何取舍",
    },
    {
      key: "other",
      label: "其他困扰",
      icon: <HelpCircle className="text-brand-primary" size={20} />,
      desc: "有一些其他原因让我这段时间思维卡顿，静不下心来",
    },
  ];

  const isNextDisabled = !selectedTopic || !description.trim();

  return (
    <div className="fade-in max-w-[720px] mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold tracking-tight text-brand-primary">
          你现在最想理清什么？
        </h2>
        <p className="text-xs text-text-muted">
          选择一个最符合你当下状态的类目，它能帮助我们的澄清工具更精准地契合你的思考模式。
        </p>
      </div>

      {/* Grid selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {topics.map((t) => {
          const isSelected = selectedTopic === t.key;
          return (
            <button
              id={`topic-btn-${t.key}`}
              key={t.key}
              onClick={() => onSelectTopic(t.key)}
              className={`flex flex-col items-start gap-2.5 p-4 rounded-lg border text-left transition-all duration-200 ${
                isSelected
                  ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary"
                  : "border-border-stone bg-white hover:border-gray-300 hover:shadow-sm cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-2">
                {t.icon}
                <span className="font-medium text-text-dark text-sm">{t.label}</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">{t.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Description Supplement */}
      <div className="flex flex-col gap-2 mt-2">
        <label className="text-sm font-semibold text-text-dark">
          用自己的话说说，你最近最卡住的是什么？
        </label>
        <p className="text-xs text-text-muted">
          不用字斟句酌，一两句话简短写下你的烦恼即可。请勿填写姓名、手机等敏感信息。
        </p>
        <input
          id="trouble-desc-input"
          type="text"
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          placeholder="例如：原本打算这周要把复习计划订出来，但看到别人在做高含金量实习就慌了，感觉不知道干啥，一直耗在手机上。"
          className="w-full text-sm border border-border-stone rounded-md px-3.5 py-3.5 bg-white text-text-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
        />
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-stone">
        <button
          id="trouble-back-btn"
          onClick={onBack}
          className="text-xs text-text-muted hover:text-text-dark transition-colors cursor-pointer"
        >
          返回
        </button>
        <button
          id="trouble-next-btn"
          onClick={onNext}
          disabled={isNextDisabled}
          className={`px-5 py-2.5 rounded-md font-medium text-xs text-white shadow-sm transition-all duration-200 ${
            !isNextDisabled
              ? "bg-brand-primary hover:bg-brand-hover cursor-pointer"
              : "bg-border-stone text-text-muted cursor-not-allowed"
          }`}
        >
          继续
        </button>
      </div>
    </div>
  );
};
