import { DeepSeekResponse } from "./schema";

/**
 * Generates highly realistic mock responses based on user context and current stage.
 * This guarantees a fully functional demonstration mode when no API key is set.
 */
export function getMockResponse(
  stage: "fact_reflection" | "clarify" | "experiment",
  topic: string,
  userMessage: string,
  history: { role: string; content: string }[]
): DeepSeekResponse {
  const normalizedUserMsg = userMessage.toLowerCase();

  // Safety trigger for demo
  if (
    normalizedUserMsg.includes("自杀") ||
    normalizedUserMsg.includes("自残") ||
    normalizedUserMsg.includes("不想活") ||
    normalizedUserMsg.includes("自尽") ||
    normalizedUserMsg.includes("想死")
  ) {
    return {
      stage: "fact_reflection",
      reflection: "我感受到了你此刻正在承受着非常沉重、深不见底的痛苦与无助。这是一个自动化的自我梳理网页，它无法代替实时的专业心理危机干预和温暖的人际陪伴。",
      facts: ["用户表达了强烈的痛苦情绪"],
      interpretations: ["当前小工具的局限性导致其无法承接此类深度情绪"],
      constraints: ["AI 工具无法提供紧急安全保障", "线上文字沟通缺乏即时物理干预能力"],
      designable_parts: ["向身边的人寻求帮助", "拨打危机援助热线"],
      hypothesis: "我正在验证：拨打紧急求助电话并寻求专业心理支持，能够帮助我度过当下的情绪极度危机。",
      next_question: "请立刻暂停使用本工具，联系可信任的人、学校心理中心或拨打紧急心理热线。",
      experiment_suggestion: {
        action: "联系身边的专业心理支持或学校辅导员、医院急诊",
        real_world_context: "真实的心理干预与陪伴",
        output: "获得专业的心理危机处理和安全保护",
        deadline_suggestion: "立刻、现在"
      },
      safety_level: "urgent"
    };
  }

  // General theme tailored mock data
  if (stage === "fact_reflection") {
    // Stage 1 (Step 2 in UI): User input about their specific struggle
    let facts = ["你提到最近发生了一件让你感到困扰的具体事件。"];
    let interpretations = ["你觉得这件事让你感到有些挫败或阻滞。"];
    let constraints = ["目前的具体安排、资源和外部对这件事的要求。"];
    let designable_parts = ["你可以决定花在它上面的时间和第一步的小尝试。"];
    let next_q = "你当时原本计划怎么做？是什么想法让你最终改变了行动？";

    if (topic === "procrastination" || normalizedUserMsg.includes("拖延") || normalizedUserMsg.includes("论文") || normalizedUserMsg.includes("计划")) {
      facts = [
        "你提到在过去一周里，原本有一项计划（如写论文、做项目或复习）要开始进行。",
        "在实际过程中，你分配了时间，但最终没有按照预期开始执行，而是做了一些替代行为（如看手机或整理书桌）。"
      ];
      interpretations = [
        "你将这次没有启动解释为：自己‘自律性很差’或‘逃避困难’。",
        "你感到焦虑，认为如果不开始，后果会非常严重且难以挽回。"
      ];
      next_q = "在这件事里，你原本计划写/做的第一句话或第一步是什么？当时脑子里浮现了什么担忧？";
    } else if (topic === "future_unknown" || normalizedUserMsg.includes("未来") || normalizedUserMsg.includes("找工作") || normalizedUserMsg.includes("职业")) {
      facts = [
        "你目前面临需要对职业、选课或未来的走向做出某种思考或准备的阶段。",
        "你通过阅读资料或看别人的情况来做评估，但因为信息不全，尚未采取实际的投递或实践。"
      ];
      interpretations = [
        "你认为‘必须找准方向才能走第一步’，否则会‘浪费时间’或‘选错后悔终生’。",
        "觉得身边优秀的同学都‘已经确定了目标’，而自己被落下了。"
      ];
      next_q = "你目前认为最能帮你了解一个行业的信息来源是什么？是空想，还是去跟实际做过的人聊聊？";
    } else if (topic === "comparison" || normalizedUserMsg.includes("比较") || normalizedUserMsg.includes("同学") || normalizedUserMsg.includes("别人")) {
      facts = [
        "你在社交媒体（如朋友圈、小红书）或日常课堂上看到了某位同学或同龄人的优秀履历或实习进展。",
        "你将自己的进展与对方展示出来的成果进行了对比。"
      ];
      interpretations = [
        "你感到强烈的自卑或压力，认为‘别人都走得很远，自己却一无是处’。",
        "认为对方的成功是一帆风顺的，而自己的迷茫是异常且不可救药的。"
      ];
      next_q = "当你看到别人的进展时，你是否了解对方在这背后付出了什么，或者遇到了什么限制？";
    } else {
      facts = [
        `你提到了一件具体的事：${userMessage.length > 30 ? userMessage.substring(0, 30) + "..." : userMessage}`,
        "这件事让你感觉有些卡住，且最近正在占用你的注意力。"
      ];
      interpretations = [
        "你感觉有点手足无措，并对这件事情的发展趋势怀有一些不安或挫败感。"
      ];
      next_q = "在这件让你卡住的事情中，如果剥离掉‘我应该’或‘我不行’的评价，最客观发生的画面是什么？";
    }

    return {
      stage: "fact_reflection",
      reflection: `听到你详细的描述。你经历的这件事非常真实。我们先不急于去解决问题，而是把眼前的客观事实和你对自己做出的那些评判、担忧（也就是解释）分离开来。`,
      facts,
      interpretations,
      constraints: ["外界设定的截止日期或硬性要求", "你目前拥有的时间和精力上限"],
      designable_parts: ["拆解后极度微小的、不超过30分钟能完成的第一步行动", "对当下情绪的接纳和承认"],
      hypothesis: "我正在验证：我是否必须处于‘完美状态’下才能启动一件事。",
      next_question: next_q,
      experiment_suggestion: {
        action: "将大任务拆解为写出第一个100字，或者写一段极简大纲",
        real_world_context: "真实的文字草稿",
        output: "一页虽然不完美但真实存在的文档",
        deadline_suggestion: "3天内"
      },
      safety_level: "normal"
    };
  }

  if (stage === "clarify") {
    // Stage 2 (Step 3 in UI): Dialog further clarification, splitting constraints and designables
    let constraints = ["每天精力有限，无法同时进行好几个重度任务", "某些客观能力/资源（如缺少该领域的核心人脉）暂时缺失"];
    let designable_parts = ["挑选一个业内学长/学姐进行一次15分钟的快闪文字请教", "降低标准，容许自己在一开始做出‘垃圾成果’并获取反馈"];
    let hypothesis = "我正在验证：通过与真实从业者聊15分钟，我是否就能排遣掉由于信息差带来的一大半恐惧。";
    let next_q = "要理清这背后的关键点，你觉得你更害怕的是‘选错方向浪费时间’，还是‘做了以后发现自己能力不够’？";

    if (topic === "procrastination" || normalizedUserMsg.includes("写") || normalizedUserMsg.includes("不想动")) {
      constraints = [
        "你无法控制大脑在面对困难时的负面情绪反射",
        "外界任务的截止日期和评分标准是硬性给定的"
      ];
      designable_parts = [
        "你可以控制在书桌前坐下的第 10 分钟只进行最简单的机械工作（如复制文献格式）",
        "你可以把自己的启动目标降低到‘写 50 个烂字’，并允许自己写得很糟糕"
      ];
      hypothesis = "我正在验证：通过‘允许自己写 50 个烂字’的方式，我是否比‘等待完美灵感’更容易启动工作。";
      next_q = "试想一下，如果允许你写一个‘完全不合格、只用于凑字数’的第一版，你今天能在10分钟内做完它吗？";
    } else if (topic === "future_unknown" || normalizedUserMsg.includes("行业") || normalizedUserMsg.includes("工作")) {
      constraints = [
        "你不可能在进入一个行业前，100% 预测它在 5 年后的发展和它是否真的完美适合你",
        "应届生身份和求职季节的时间窗口是固定的"
      ];
      designable_parts = [
        "通过找一位已经工作 1-2 年的师兄进行一次 15 分钟的真实访谈，收集一手客观生活证据",
        "寻找一个仅需 3 天、非正式的小任务进行带教模拟，切身体验具体日常"
      ];
      hypothesis = "我正在验证：我是否更喜欢通过真实项目和人协作来评估职业，而不是独自在心里衡量其优缺点。";
      next_q = "如果要把这个大疑惑收窄为一个两周内、有真实对象、有结果反馈的迷你实验，你脑海里第一个浮现的形式是什么？";
    } else {
      constraints = [
        "过去发生的事情和现状无法被时光倒流改写",
        "别人的情绪、选择和评价是你无法 100% 掌控的"
      ];
      designable_parts = [
        "你可以划定边界：只关注自己手头的一件小任务，而不是全部人生课题",
        "你可以找一个信得过的朋友或师长，口头复述一次事实，并征询他们的中立反馈"
      ];
      hypothesis = "我正在验证：当我不试图把一件小事的成败等同于我个人的价值时，我是否感到更容易专注。";
      next_q = "你觉得在当下的局限中，最让你产生无力感的是哪个部分？这个无力感是可以改变的事实，还是对未来的预测？";
    }

    return {
      stage: "clarify",
      reflection: "你的回答帮我们聚焦了关键卡点。在面对这件具体困扰时，有些事实是我们必须低头承认、甚至接纳的限制；而有些则是我们仍然握有主动权、可以去设计和探索的小裂缝。",
      facts: ["你做出了进一步的说明", "确定了阻碍行动的内心最真实的阻力点"],
      interpretations: ["认为在限制条件下无法取得进展", "担心启动后的失败等同于个人能力的失败"],
      constraints,
      designable_parts,
      hypothesis,
      next_question: next_q,
      experiment_suggestion: {
        action: "将原本大而模糊的目标，降级为一个不超过两小时就能看到结果的小测试",
        real_world_context: "真实的1对1对话或一个极简的代码/文字文件",
        output: "一段对话记录或一个极为基础但可展示的物理成果",
        deadline_suggestion: "一周内"
      },
      safety_level: "normal"
    };
  }

  // Stage 3 (Step 4 in UI): Experiment optimization
  return {
    stage: "experiment",
    reflection: "非常棒！你已经亲手设计出了这个行动的雏形。请记住，实验的价值不在于‘它一定要成功’，而在于‘它能带给你一轮真实世界不带偏见的反馈证据’。有了这些证据，你就能调整自己的下一个脚步。",
    facts: ["用户选择/描述了一个具体的实验行动"],
    interpretations: ["相信两周内的试错不会带来终身性的灾难，而是宝贵的一手信息"],
    constraints: ["两周时间很短，无法进行系统性的大幅技能提升"],
    designable_parts: ["设置明确的完成标志，允许结果不够完美", "跟进记录自己实验前后的预期变化"],
    hypothesis: "我正在验证：一旦有了真实的外部反馈（无论好坏），我的拖延焦虑感是否会明显下降。",
    next_question: "这个实验已经具备了非常高的可执行性。你准备在哪一天正式启动它？",
    experiment_suggestion: {
      action: "按照你填写的实验，进行两周内的小范围启动",
      real_world_context: "真实的社会面或现实任务场景",
      output: "切实的经验笔记、访谈回复，或一个最粗糙的手稿",
      deadline_suggestion: "两周内"
    },
    safety_level: "normal"
  };
}
