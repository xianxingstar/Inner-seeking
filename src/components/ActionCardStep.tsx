import React, { useState } from "react";
import { ActionCardData } from "../types";
import { 
  Clipboard, 
  Download, 
  RefreshCw, 
  Calendar, 
  Check, 
  Lightbulb, 
  HelpCircle,
  FileText
} from "lucide-react";

interface ActionCardStepProps {
  card: ActionCardData;
  onRestart: () => void;
  onGoToReview: () => void;
}

export const ActionCardStep: React.FC<ActionCardStepProps> = ({
  card,
  onRestart,
  onGoToReview,
}) => {
  const [copied, setCopied] = useState(false);

  // Generate markdown string representing the Action Card
  const generateMarkdown = (): string => {
    return `# 【清醒行动卡】Sober Action Card
生成时间: ${new Date(card.createdAt).toLocaleDateString("zh-CN")}
项目版本: v${card.version}

## 1. 我现在真实的状态（面临的困扰）
> ${card.topicDescription}

## 2. 我反复卡住的具体事情
> ${card.specificEvent}

## 3. 已经发生的事实
${card.facts.map((f) => `- ${f}`).join("\n")}

## 4. 我可能给它附加的解释
${card.interpretations.map((i) => `- ${i}`).join("\n")}

## 5. 需要承认的现实限制
${card.constraints.map((c) => `- ${c}`).join("\n")}

## 6. 我仍然可以设计的部分（可行动部分）
${card.designable_parts.map((d) => `- ${d}`).join("\n")}

## 7. 我正在验证的一个假设
**假设：** ${card.hypothesis}
*(这不是对你的人格或结论性定义，而是一个在两周内通过行动来检验的猜测)*

## 8. 我的两周实验
* **实验行动:** ${card.experiment.action}
* **真实环境/对象:** ${card.experiment.realWorldContext}
* **实验交付物:** ${card.experiment.output}
* **截止日期:** ${card.experiment.deadline}

## 9. 我如何判断这次实验值得继续、调整或停止
* 验证标志：当我获取了真实的“实验交付物”，我将根据其提供的信息，而非脑海中的预判，决定是否继续。

## 10. 我的复盘时间
* **预计复盘日期:** ${card.experiment.deadline}
`;
  };

  // Handle Clipboard copy
  const handleCopy = async () => {
    try {
      const markdownText = generateMarkdown();
      await navigator.clipboard.writeText(markdownText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("复制失败，您可以手动选定文本进行复制。");
    }
  };

  // Handle Markdown download
  const handleDownloadMarkdown = () => {
    const text = generateMarkdown();
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `清醒行动卡-${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-in max-w-[720px] mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Success Title */}
      <div className="flex flex-col gap-1 text-center py-4">
        <span className="text-brand-primary font-semibold text-xs tracking-wider uppercase font-mono mb-1">
          # SUCCESS · 梳理已完成
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-brand-primary">
          你的“清醒行动卡”已准备就绪
        </h2>
        <p className="text-xs text-text-muted max-w-[450px] mx-auto leading-relaxed">
          它已经安全保存在你当前浏览器的本地存储（localStorage）中。无需分享给任何人，这是一个属于你自己的行动航标。
        </p>
      </div>

      {/* Visual Action Card Container */}
      <div 
        id="sober-action-card-print" 
        className="bg-white border-2 border-brand-primary rounded-none p-6 sm:p-8 shadow-[6px_6px_0px_#2D4F43] flex flex-col gap-6 relative overflow-hidden"
      >
        {/* Card Header styling */}
        <div className="flex justify-between items-start border-b-2 border-brand-primary pb-4">
          <div>
            <h3 className="font-display font-bold text-lg tracking-tight text-brand-primary">
              清 醒 行 动 卡
            </h3>
            <span className="text-[10px] font-mono text-text-muted uppercase">
              SOBER ACTION FACILITATION CARD
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-text-muted block">
              ID: {card.id.substring(0, 8)}
            </span>
            <span className="text-xs font-mono text-text-dark font-medium">
              {new Date(card.createdAt).toLocaleDateString("zh-CN")}
            </span>
          </div>
        </div>

        {/* 1 & 2: Current Dilemma & Incident */}
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-[10px] font-semibold text-brand-primary uppercase font-mono block mb-1">
              01 · 我的真实困扰
            </span>
            <p className="text-xs text-text-dark leading-relaxed font-medium">
              {card.topicDescription}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-text-muted uppercase font-mono block mb-1">
              02 · 反复卡住的具体事情
            </span>
            <p className="text-xs text-text-dark leading-relaxed bg-[#F9F8F6] p-2.5 border border-dashed border-border-stone rounded">
              {card.specificEvent}
            </p>
          </div>
        </div>

        {/* Grid: Facts & Interpretations vs Constraints & Designables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b border-border-stone py-4">
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-[10px] font-semibold text-text-dark uppercase font-mono block mb-1">
                03 · 客观发生的事实
              </span>
              <ul className="list-disc list-inside text-[11px] text-text-dark space-y-1 pl-1">
                {card.facts.map((f, i) => (
                  <li key={i} className="leading-relaxed">{f}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-amber-800 uppercase font-mono block mb-1">
                04 · 可能附加的解释 / 担忧
              </span>
              <ul className="list-disc list-inside text-[11px] text-text-muted space-y-1 pl-1">
                {card.interpretations.map((it, i) => (
                  <li key={i} className="leading-relaxed">{it}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t md:border-t-0 md:border-l border-border-stone pt-3 md:pt-0 md:pl-4">
            <div>
              <span className="text-[10px] font-semibold text-red-800 uppercase font-mono block mb-1">
                05 · 需要承认的现实限制
              </span>
              <ul className="list-disc list-inside text-[11px] text-text-dark space-y-1 pl-1">
                {card.constraints.map((c, i) => (
                  <li key={i} className="leading-relaxed">{c}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-brand-primary uppercase font-mono block mb-1">
                06 · 我仍然可以设计的部分
              </span>
              <ul className="list-disc list-inside text-[11px] text-brand-primary space-y-1 pl-1 font-medium">
                {card.designable_parts.map((d, i) => (
                  <li key={i} className="leading-relaxed">{d}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 7: Hypothesis */}
        <div className="bg-brand-primary/5 p-3 border-l-4 border-brand-primary">
          <span className="text-[10px] font-semibold text-brand-primary uppercase font-mono block mb-1">
            07 · 我正在验证的假设（Hypothesis）
          </span>
          <p className="text-xs text-brand-primary font-medium italic">
            “ {card.hypothesis} ”
          </p>
        </div>

        {/* 8: 2-Week Experiment */}
        <div className="bg-[#F9F8F6] p-4 border border-border-stone">
          <span className="text-[10px] font-semibold text-text-dark uppercase font-mono block mb-2">
            08 · 两周探索实验（Experiment Plan）
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <strong className="text-text-muted block text-[10px] uppercase">A. 行动方案</strong>
              <p className="text-text-dark font-medium">{card.experiment.action}</p>
            </div>
            <div>
              <strong className="text-text-muted block text-[10px] uppercase">B. 真实对象与环境</strong>
              <p className="text-text-dark font-medium">{card.experiment.realWorldContext}</p>
            </div>
            <div className="mt-1">
              <strong className="text-text-muted block text-[10px] uppercase">C. 成果交付物</strong>
              <p className="text-brand-primary font-semibold">{card.experiment.output}</p>
            </div>
            <div className="mt-1">
              <strong className="text-text-muted block text-[10px] uppercase">D. 复盘截止日期</strong>
              <p className="text-amber-800 font-medium flex items-center gap-1">
                <Calendar size={12} />
                <span>{card.experiment.deadline}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom micro branding */}
        <div className="border-t border-border-stone pt-3 flex justify-between items-center text-[10px] text-text-muted">
          <span>清醒行动 · 面对现实 拥抱能动</span>
          <span>Sober Action facilitation cards</span>
        </div>
      </div>

      {/* Action buttons on page */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-4">
        <button
          id="copy-card-btn"
          onClick={handleCopy}
          className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>已复制 Markdown！</span>
            </>
          ) : (
            <>
              <Clipboard size={14} />
              <span>复制行动卡</span>
            </>
          )}
        </button>

        <button
          id="download-card-btn"
          onClick={handleDownloadMarkdown}
          className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 bg-white border border-border-stone hover:border-text-muted text-text-dark text-xs font-semibold rounded transition cursor-pointer"
        >
          <Download size={14} />
          <span>下载为 Markdown</span>
        </button>

        <button
          id="goto-review-btn"
          onClick={onGoToReview}
          className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded transition cursor-pointer"
        >
          <Calendar size={14} />
          <span>两周后再来复盘</span>
        </button>
      </div>

      <div className="text-center mt-2">
        <button
          id="footer-restart-btn"
          onClick={() => {
            if (confirm("确定要开启一轮新的梳理吗？当前行动卡仍然会保存在你的历史记录中。")) {
              onRestart();
            }
          }}
          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-dark transition cursor-pointer"
        >
          <RefreshCw size={12} />
          <span>新开启一轮自我澄清</span>
        </button>
      </div>
    </div>
  );
};
