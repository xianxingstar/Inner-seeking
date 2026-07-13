import { useEffect, useState } from "react";
import { ActionCardData, StepId, TroubleTopic } from "./types";
import { Header } from "./components/Header";
import { WelcomeStep } from "./components/WelcomeStep";
import { SelectTroubleStep } from "./components/SelectTroubleStep";
import { SpecificEventStep } from "./components/SpecificEventStep";
import { ClarifyCardStep } from "./components/ClarifyCardStep";
import { DesignExperimentStep } from "./components/DesignExperimentStep";
import { ActionCardStep } from "./components/ActionCardStep";
import { ReviewPage } from "./components/ReviewPage";
import { DeepSeekResponse } from "../lib/schema";
import { Shield, Trash2 } from "lucide-react";

const STORAGE_KEY = "sober_action_card_v1";

export default function App() {
  // Navigation Routing State
  const [currentStep, setCurrentStep] = useState<StepId>("welcome");

  // Step 1: Category & Problem
  const [selectedTopic, setSelectedTopic] = useState<TroubleTopic | null>(null);
  const [topicDescription, setTopicDescription] = useState("");

  // Step 2: Specific Event Description
  const [specificEvent, setSpecificEvent] = useState("");
  const [step2Response, setStep2Response] = useState<DeepSeekResponse | null>(null);
  const [step2Answer, setStep2Answer] = useState("");

  // Step 3: Clarify Card lists
  const [constraintsList, setConstraintsList] = useState<string[]>([]);
  const [designablesList, setDesignablesList] = useState<string[]>([]);
  const [hypothesisText, setHypothesisText] = useState("");
  const [step3Response, setStep3Response] = useState<DeepSeekResponse | null>(null);

  // Step 4: Experiment Designing
  const [expType, setExpType] = useState("interview");
  const [expAction, setExpAction] = useState("");
  const [expContext, setExpContext] = useState("");
  const [expOutput, setExpOutput] = useState("");
  const [expDeadline, setExpDeadline] = useState("");

  // Step 5: Master Active Card
  const [activeCard, setActiveCard] = useState<ActionCardData | null>(null);

  // Load active card from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ActionCardData;
        // Verify structure version
        if (parsed && parsed.version === 1) {
          setActiveCard(parsed);
          // If there is a card, let's land them on step 5 (Action Card) or review if they want
          setCurrentStep("action_card");
        }
      }
    } catch (err) {
      console.error("Failed to parse localStorage active card:", err);
    }
  }, []);

  // Save card to localStorage whenever activeCard changes
  const saveCardToStorage = (card: ActionCardData | null) => {
    setActiveCard(card);
    if (card) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(card));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Reset/Restart entire flow
  const handleRestart = () => {
    setCurrentStep("welcome");
    setSelectedTopic(null);
    setTopicDescription("");
    setSpecificEvent("");
    setStep2Response(null);
    setStep2Answer("");
    setConstraintsList([]);
    setDesignablesList([]);
    setHypothesisText("");
    setStep3Response(null);
    setExpType("interview");
    setExpAction("");
    setExpContext("");
    setExpOutput("");
    setExpDeadline("");
    // We do NOT delete the active card from localStorage immediately,
    // so they can still access it if they went to review, but they start a new drafting flow.
  };

  // Completely wipe local record
  const handleClearAllStorage = () => {
    if (confirm("🚨 警告：这会永久删除你在当前浏览器保存的‘清醒行动卡’和所有梳理记录，删除后将无法恢复。确定清除吗？")) {
      localStorage.removeItem(STORAGE_KEY);
      setActiveCard(null);
      handleRestart();
      alert("所有本地记录已安全清空。");
    }
  };

  // Generate finalized Action Card
  const handleGenerateFinalCard = () => {
    const newCard: ActionCardData = {
      version: 1, // Data scheme versioning
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      topic: selectedTopic || "other",
      topicDescription,
      specificEvent,
      // The first reflection is the source of truth for the user's event.
      // Later stages may add analysis, but must not replace the original facts.
      facts: step2Response?.facts ?? [],
      interpretations: step2Response?.interpretations ?? [],
      constraints: constraintsList,
      designable_parts: designablesList,
      hypothesis: hypothesisText,
      experiment: {
        action: expAction,
        realWorldContext: expContext,
        output: expOutput,
        deadline: expDeadline,
      },
      review: null, // Null until two-week review is triggered
    };

    saveCardToStorage(newCard);
    setCurrentStep("action_card");
  };

  // Handle Review Saving
  const handleSaveReview = (reviewData: NonNullable<ActionCardData["review"]>) => {
    if (!activeCard) return;
    const updatedCard: ActionCardData = {
      ...activeCard,
      review: reviewData,
    };
    saveCardToStorage(updatedCard);
  };

  return (
    <div className="min-h-screen bg-bg-warm text-text-dark flex flex-col font-sans selection:bg-brand-primary/10 selection:text-brand-primary">
      {/* Top Navigation Progress Bar Header */}
      <Header
        currentStep={currentStep}
        onRestart={handleRestart}
        hasActiveCard={!!activeCard}
        onGoToReview={() => setCurrentStep("review_page")}
      />

      {/* Main Interactive Stage Stage Routing Container */}
      <main className="flex-1 w-full py-4">
        {currentStep === "welcome" && (
          <WelcomeStep onNext={() => setCurrentStep("select_trouble")} />
        )}

        {currentStep === "select_trouble" && (
          <SelectTroubleStep
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            description={topicDescription}
            onChangeDescription={setTopicDescription}
            onNext={() => setCurrentStep("specific_event")}
            onBack={() => setCurrentStep("welcome")}
          />
        )}

        {currentStep === "specific_event" && (
          <SpecificEventStep
            topic={selectedTopic || "other"}
            topicDesc={topicDescription}
            specificEvent={specificEvent}
            onChangeSpecificEvent={setSpecificEvent}
            aiResponse={step2Response}
            onSetAiResponse={setStep2Response}
            followUpAnswer={step2Answer}
            onChangeFollowUpAnswer={setStep2Answer}
            onNext={() => setCurrentStep("clarify_card")}
            onBack={() => setCurrentStep("select_trouble")}
          />
        )}

        {currentStep === "clarify_card" && step2Response && (
          <ClarifyCardStep
            topic={selectedTopic || "other"}
            topicDesc={topicDescription}
            specificEvent={specificEvent}
            step2Response={step2Response}
            step2Answer={step2Answer}
            constraintsList={constraintsList}
            setConstraintsList={setConstraintsList}
            designablesList={designablesList}
            setDesignablesList={setDesignablesList}
            hypothesisText={hypothesisText}
            setHypothesisText={setHypothesisText}
            step3Response={step3Response}
            setStep3Response={setStep3Response}
            onNext={() => setCurrentStep("design_experiment")}
            onBack={() => setCurrentStep("specific_event")}
          />
        )}

        {currentStep === "design_experiment" && (
          <DesignExperimentStep
            hypothesis={hypothesisText}
            suggestedExperiment={step3Response?.experiment_suggestion}
            expType={expType}
            setExpType={setExpType}
            expAction={expAction}
            setExpAction={setExpAction}
            expContext={expContext}
            setExpContext={setExpContext}
            expOutput={expOutput}
            setExpOutput={setExpOutput}
            expDeadline={expDeadline}
            setExpDeadline={setExpDeadline}
            onNext={handleGenerateFinalCard}
            onBack={() => setCurrentStep("clarify_card")}
          />
        )}

        {currentStep === "action_card" && activeCard && (
          <ActionCardStep
            card={activeCard}
            onRestart={handleRestart}
            onGoToReview={() => setCurrentStep("review_page")}
          />
        )}

        {currentStep === "review_page" && activeCard && (
          <ReviewPage
            card={activeCard}
            onSaveReview={handleSaveReview}
            onBackToCard={() => setCurrentStep("action_card")}
            onRestart={handleRestart}
          />
        )}
      </main>

      {/* Aesthetic Privacy & Admin Footer */}
      <footer className="w-full max-w-[720px] mx-auto px-4 py-8 mt-12 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1.5 leading-none">
          <Shield size={13} className="text-gray-300" />
          <span>不在服务器持久化保存内容；行动卡仅保存在当前浏览器</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            id="clear-all-data-footer-btn"
            onClick={handleClearAllStorage}
            className="text-gray-400 hover:text-red-700 transition flex items-center gap-1"
            title="一键清空本地浏览器存储的行动卡数据"
          >
            <Trash2 size={12} />
            <span>清空本地记录</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
