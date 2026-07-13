import { DeepSeekResponse } from "../lib/schema";

export type StepId = 
  | "welcome"          // Step 0: Disclaimer & safety boundaries
  | "select_trouble"   // Step 1: Choose category & sub-description
  | "specific_event"   // Step 2: Input detailed event, get fact-reflection
  | "clarify_card"     // Step 3: Deep dive question, refine constraints & designables
  | "design_experiment"// Step 4: Create low-cost 2-week experiment
  | "action_card"      // Step 5: Show finalized Sober Action Card
  | "review_page";     // Review Page: Retro active or finished experiment

export interface ActionCardData {
  version: number;          // Data structure version (e.g., 1)
  id: string;               // Unique card ID
  createdAt: string;        // Date ISO string
  topic: string;            // Key of selected topic
  topicDescription: string; // User's self-described problem
  specificEvent: string;    // User's paragraph about what happened
  
  // From Step 2 & 3 AI responses
  facts: string[];
  interpretations: string[];
  constraints: string[];
  designable_parts: string[];
  hypothesis: string;
  
  // Experiment details
  experiment: {
    action: string;
    realWorldContext: string;
    output: string;
    deadline: string;
  };

  // Review answers (null until completed)
  review?: {
    actualAction: string;
    unexpectedEvents: string;
    newInsights: string;
    status: "continue" | "adjust" | "stop";
    reviewDate: string;
  } | null;
}

export type TroubleTopic = 
  | "future_unknown"   // 我不知道未来要做什么
  | "procrastination"   // 我想行动，但总是拖延
  | "self_doubt"       // 我经常怀疑自己
  | "comparison"       // 我总在和别人比较
  | "specific_choice"  // 我面临一个具体选择
  | "other";           // 其他
