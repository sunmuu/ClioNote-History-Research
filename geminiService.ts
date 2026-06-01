import { GoogleGenAI, Type, Chat } from "@google/genai";
import { ThemeMode } from "./types";

const getSystemInstruction = (mode: ThemeMode, type: 'summary' | 'analysis') => {
  if (type === 'summary') {
    switch (mode) {
      case ThemeMode.HISTORICAL:
        return "你是一个资深的历史考据学家。请对该史料进行研判：1. 辨析其核心事实；2. 指出其在相关历史语境下的关键意义；3. 评价史料的互证价值。语气严谨、客观、学术。";
      case ThemeMode.FAN:
        return "你是一个深谙同人文化的资深创作者（‘太太’）。 分析任务： 当用户提供文本时，请忽略严肃的考据，转而挖掘其中的情感张力、人物羁绊 (CP感)、潜台词以及名场面。 语气风格： 感性、细腻、稍微带一点‘嗑到了’的兴奋感，多使用‘羁绊’、‘救赎’、‘宿命感’等词汇。 分析维度： 重点提取人物之间的互动细节和性格反差。";
      case ThemeMode.REVIEW:
        return "你是一个严格的期刊审稿人。请对这篇文献进行元分析：1. 提炼其核心论点 (Argument)；2. 识别其使用的研究方法 (Methodology)；3. 评价其理论贡献。忽略情感，专注逻辑。";
      case ThemeMode.MODERN:
      default:
        return "你是一个高效、专业的行政助理或数据分析师。 分析任务： 请对文本进行客观的摘要提炼。去除所有修辞和情感色彩，只保留核心事实（5W1H：Who, When, Where, What, Why, How）。 语气风格： 冷静、极简、商务风。 分析维度： 提取关键时间点、核心事件和涉及的实体对象。";
    }
  } else {
    // 全景分析指令 (Timeline/Context analysis)
    switch (mode) {
      case ThemeMode.HISTORICAL:
        return "你是一位精通宏观史学比对的研究专家。请分析时间轴序列：1. 找出事件间的因果链条；2. 识别历史趋势的转向点；3. 提示可能存在的史料矛盾点。";
      case ThemeMode.FAN:
        return "你是一个深谙同人文化的资深创作者（‘太太’）。 分析任务： 请扫描时间轴上的所有节点，分析人物羁绊的演进轨迹、情感升华点以及名场面在叙事中的分布。 语气风格： 感性、细腻、稍微带一点‘嗑到了’的兴奋感，多使用‘羁绊’、‘救赎’、‘宿命感’等词汇。 分析维度： 重点归纳各节点间的互动张力和性格反差的闭环。";
      case ThemeMode.REVIEW:
        return "你是一个撰写学术史综述的学者。请分析文献序列：1. 识别学术范式的转移轨迹；2. 总结不同流派的争论焦点；3. 发现当前领域的研究空白 (Research Gap)。";
      case ThemeMode.MODERN:
      default:
        return "你是一个高效、专业的行政助理或数据分析师。 分析任务： 请分析时间线上的核心数据分布，提取关键时间节点、核心事件流和实体变动。 语气风格： 冷静、极简、商务风。 分析维度： 以 5W1H 框架总结阶段性事实特征与数据趋势。";
    }
  }
};

export const getHistoricalSummary = async (content: string, mode: ThemeMode) => {
  const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY; });
  const systemInstruction = getSystemInstruction(mode, 'summary');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `分析以下内容：\n\n${content}`,
      config: {
        systemInstruction,
        temperature: mode === ThemeMode.FAN ? 0.8 : 0.3,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "分析引擎响应异常，请稍后再试。";
  }
};

export const analyzeTimelineContext = async (events: any[], mode: ThemeMode) => {
  const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });
  const context = events.map(e => `[${e.year} ${e.era}] ${e.title}: ${e.description}`).join('\n');
  const systemInstruction = getSystemInstruction(mode, 'analysis');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `基于以下序列进行深度扫描分析：\n\n${context}`,
      config: {
        systemInstruction,
        temperature: mode === ThemeMode.FAN ? 0.7 : 0.5,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Timeline Analysis Error:", error);
    return "全景分析失败。";
  }
};

export const parseHistoricalText = async (text: string, mode: ThemeMode) => {
  const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });
  const tagInstruction = mode === ThemeMode.REVIEW
    ? "针对学术综述，优先提取：理论模型、方法论、研究对象标签。"
    : mode === ThemeMode.FAN
    ? "针对同人创作，优先提取：CP名、属性（如傲娇/忠犬）、情感基调标签。"
    : "提取建议的学术或专业分类标签。";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `解析以下内容。${tagInstruction}\n\n文本：\n${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            source: { type: Type.STRING },
            lunarDate: { type: ThemeMode.HISTORICAL === mode ? Type.STRING : Type.STRING },
            solarDate: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "source", "lunarDate", "solarDate", "tags"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Parse Error:", error);
    return null;
  }
};

export const createResearchChat = (context: string, mode: ThemeMode): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });
  let roleDesc = "专业史学助理";
  if (mode === ThemeMode.FAN) roleDesc = "资深同人太太/剧情解析官";
  if (mode === ThemeMode.REVIEW) roleDesc = "学术导师/审稿专家";
  if (mode === ThemeMode.MODERN) roleDesc = "行政助理";

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `你是一个${roleDesc}。当前上下文信息如下：\n\n${context}\n\n请以此身份与用户对话。`,
    },
  });
};
