import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialization helper
let _ai: GoogleGenAI | null = null;
function getAiClient() {
  if (!_ai) {
    let apiKey = "";
    try {
      apiKey = process.env.GEMINI_API_KEY || "";
    } catch (e) {
      // process might not be defined in some environments
      console.warn("process.env is not available");
    }
    
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Please check your .env file.");
    }
    _ai = new GoogleGenAI({ apiKey: apiKey || "dummy_key" });
  }
  return _ai;
}

export type ModelType = "Seedance 2.0" | "Kling 3.0 Omni";
export type LanguageType = "Chinese" | "English";

export interface Suggestion {
  category: string;
  text: string;
}

export interface PromptResult {
  mainPrompt: string;
  translation: string;
  parameters: {
    model: string;
    duration: string;
    motionIntensity?: string;
    shotCount: string;
  };
  suggestions: Suggestion[];
}

const SYSTEM_INSTRUCTION = `你是一位顶级的 AI 视频生成提示词工程师与工具架构师，专精于中国系视频大模型的交互逻辑。
你的目标是充当“翻译官”，将用户的模糊创意转化为符合 Seedance 2.0 和 Kling 3.0 Omni 的精准、专业的执行指令。

### 核心知识库

#### 1. Seedance 2.0 (字节跳动) 专属标准：
- **结构**：严格遵守“主体 (Subject) + 动作 (Action) + 环境 (Environment) + 镜头语言 (Camera) + 风格/灯光 (Style/Lighting) + 约束 (Constraints)”的 6 步公式。
- **特性**：支持最长 15秒；原生音效同步；支持最多 9 张参考图（使用 @Character1, @Image1 等标签）。
- **长度**：100-260 词。
- **指令**：使用分镜表语言，如 [Shot 1], [Shot 2], [Cut to]。禁止堆砌无意义形容词。
- **多分镜支持**：若用户在输入中使用 [Shot 1], [Shot 2] 等标签，你必须尊重并扩展这些具体的分镜描述，确保每个分镜都符合上述 6 步公式，并用 [Shot N] 标签清晰分隔。

#### 2. Kling 3.0 Omni (快手) 专属标准：
- **结构**：严格遵守“主体及外貌 + 动作 + 环境 + 镜头运动 + 音频氛围”的 5 部分结构。
- **核心机制**：必须明确给出 运动强度控制 (Motion Intensity) 数值 (0.1 - 1.0)。
- **参考引用**：使用 <<<image_1>>> 等标签引用图片。
- **指令**：支持单次生成最多 6 个分镜，格式如 Shot 1 (3s)。

#### 3. 通用最优解：
- 避免使用“漂亮”、“好看”等模糊词。
- 景别（特写、中景、全景）和运镜方式（推、拉、摇、移）为必填项。
- 若有图片，聚焦描述“图片中元素将要发生的动作和运动轨迹”，而非重复描述视觉特征。

### 输出要求
请返回 JSON 格式的数据，包含以下字段：
- mainPrompt: 优化后的专业提示词（根据用户选择的语言）。
- translation: 对应语言的翻译版本。
- parameters: 包含 model, duration, motionIntensity (仅Kling), shotCount。
- suggestions: 4-6个分类建议，每个建议包含 category (如 "Cinematic", "Action", "Atmosphere", "Lighting") 和 text (具体的微调指令)。`;

export interface ImageObject {
  id?: string;
  url: string;
  keyword?: string;
}

export async function generateVideoPrompt(
  userInput: string,
  model: ModelType,
  language: LanguageType,
  images?: (string | ImageObject)[], // Support both old and new formats
  apiConfig?: { provider: string; apiKey: string; baseUrl?: string; modelName?: string }
): Promise<PromptResult> {
  // Normalize images to ImageObject[]
  const normalizedImages: ImageObject[] = (images || []).map(img => {
    if (typeof img === 'string') return { url: img };
    return img;
  });

  // If custom API is provided and has a key, use the appropriate provider
  if (apiConfig && apiConfig.apiKey) {
    if (apiConfig.provider === "openai" || apiConfig.provider === "doubao" || apiConfig.provider === "custom") {
      return callOpenAICompatible(userInput, model, language, normalizedImages, apiConfig);
    }
    // For Gemini, we could re-initialize the client with the user's key
    if (apiConfig.provider === "gemini") {
      const userAi = new GoogleGenAI({ apiKey: apiConfig.apiKey });
      return runGeminiGeneration(userAi, userInput, model, language, normalizedImages, apiConfig.modelName);
    }
  }

  // Default to system Gemini
  return runGeminiGeneration(getAiClient(), userInput, model, language, normalizedImages);
}

async function runGeminiGeneration(
  client: GoogleGenAI,
  userInput: string,
  model: ModelType,
  language: LanguageType,
  images?: ImageObject[],
  customModelName?: string
): Promise<PromptResult> {
  const modelName = customModelName || "gemini-3-flash-preview";
  
  const parts: any[] = [];
  
  if (images && images.length > 0) {
    images.forEach((img, idx) => {
      if (img.url && typeof img.url === 'string') {
        const base64Data = img.url.includes(",") ? img.url.split(",")[1] : img.url;
        if (base64Data) {
          parts.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          });
          
          // Add a text part to identify the image and its keyword
          const defaultTag = model === "Seedance 2.0" ? `@Image${idx + 1}` : `<<<image_${idx + 1}>>>`;
          const keywordInfo = img.keyword ? ` (用户引用关键词: @${img.keyword})` : "";
          parts.push({
            text: `参考图片 ${idx + 1}: 标签为 ${defaultTag}${keywordInfo}。`,
          });
        }
      }
    });
    
    parts.push({
      text: `分析以上图片中的核心元素，并将其作为“参考素材”融入提示词中。如果用户在创意描述中使用了上述图片标签或关键词，请在生成的提示词中正确引用它们。`,
    });
  }

  parts.push({
    text: `用户创意: "${userInput}"
选择模型: ${model}
输出语言: ${language}

请根据以上信息生成专业的视频提示词。`,
  });

  try {
    const response = await client.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mainPrompt: { type: Type.STRING },
            translation: { type: Type.STRING },
            parameters: {
              type: Type.OBJECT,
              properties: {
                model: { type: Type.STRING },
                duration: { type: Type.STRING },
                motionIntensity: { type: Type.STRING },
                shotCount: { type: Type.STRING },
              },
              required: ["model", "duration", "shotCount"],
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
                required: ["category", "text"],
              },
            },
          },
          required: ["mainPrompt", "translation", "parameters", "suggestions"],
        },
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("AI returned an empty response.");
    }

    try {
      return JSON.parse(text) as PromptResult;
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text:", text);
      throw new Error("Failed to parse AI response as JSON.");
    }
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}

async function callOpenAICompatible(
  userInput: string,
  model: ModelType,
  language: LanguageType,
  images?: ImageObject[],
  apiConfig?: { provider: string; apiKey: string; baseUrl?: string; modelName?: string }
): Promise<PromptResult> {
  try {
    const baseUrl = apiConfig?.baseUrl || (apiConfig?.provider === "openai" ? "https://api.openai.com/v1" : "");
    if (!baseUrl && apiConfig?.provider === "custom") throw new Error("Base URL is required for custom provider");
    
    const endpoint = `${baseUrl}/chat/completions`;
    
    const imageContext = (images || []).map((img, idx) => {
      const defaultTag = model === "Seedance 2.0" ? `@Image${idx + 1}` : `<<<image_${idx + 1}>>>`;
      const keywordInfo = img.keyword ? ` (用户引用关键词: @${img.keyword})` : "";
      return `参考图片 ${idx + 1}: 标签为 ${defaultTag}${keywordInfo}。`;
    }).join("\n");

    const messages: any[] = [
      { role: "system", content: SYSTEM_INSTRUCTION },
      { 
        role: "user", 
        content: [
          { type: "text", text: `用户创意: "${userInput}"\n选择模型: ${model}\n输出语言: ${language}\n\n${imageContext}\n\n请根据以上信息生成专业的视频提示词。` },
          ...(images || [])
            .filter(img => img.url && typeof img.url === 'string')
            .map(img => ({
              type: "image_url",
              image_url: { url: img.url.startsWith("data:") ? img.url : `data:image/jpeg;base64,${img.url}` }
            }))
        ]
      }
    ];

    const defaultModel = apiConfig?.provider === "openai" ? "gpt-4o" : "doubao-pro-32k";
    const modelToUse = apiConfig?.modelName || defaultModel;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiConfig?.apiKey}`
      },
      body: JSON.stringify({
        model: modelToUse,
        messages,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      let errorMessage = "API request failed";
      try {
        const err = await response.json();
        errorMessage = err.error?.message || errorMessage;
      } catch (e) {
        // Fallback if JSON parsing of error fails
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Empty response from AI provider");
    }

    try {
      return JSON.parse(content) as PromptResult;
    } catch (parseError) {
      console.error("OpenAI Parse Error. Raw content:", content);
      throw new Error("Failed to parse AI response as JSON. Please try again.");
    }
  } catch (error) {
    console.error("API Call Error:", error);
    throw error;
  }
}
