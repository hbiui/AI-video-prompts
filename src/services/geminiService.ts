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

    // Custom fetch for Gemini in Electron
    const requestOptions: any = {};
    if (typeof window !== 'undefined' && (window as any).ipcRenderer) {
      requestOptions.customFetch = universalFetch;
    }

    _ai = new GoogleGenAI({ 
      apiKey: apiKey || "dummy_key",
      ...requestOptions
    });
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

// Helper for cross-platform fetch (handles CORS in Electron)
async function universalFetch(url: string, options: any) {
  // Check if running in Electron and proxy is available
  if (typeof window !== 'undefined' && (window as any).ipcRenderer) {
    try {
      const result = await (window as any).ipcRenderer.invoke('fetch-proxy', { url, options });
      if (!result.ok && result.error) {
        throw new Error(result.error);
      }
      return {
        ok: result.ok,
        status: result.status,
        json: async () => JSON.parse(result.data),
        text: async () => result.data
      };
    } catch (e) {
      console.error("Electron fetch proxy failed, falling back to standard fetch", e);
    }
  }
  return fetch(url, options);
}

// Helper to format API errors into user-friendly messages
function formatApiError(error: any, provider: string): string {
  console.error(`${provider} API Error:`, error);
  
  const message = error.message || String(error);
  
  // Rate limiting
  if (message.includes("429") || message.toLowerCase().includes("rate limit") || message.includes("quota")) {
    return "请求过于频繁或额度不足，请稍后再试 (Rate Limit / Quota Exceeded)";
  }
  
  // Invalid API Key
  if (message.includes("401") || message.toLowerCase().includes("invalid api key") || message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("api_key_invalid")) {
    return "API 密钥无效，请检查设置 (Invalid API Key)";
  }
  
  // Model not found
  if (message.includes("404") || message.toLowerCase().includes("model not found") || message.toLowerCase().includes("not found")) {
    return "找不到指定的模型或接口地址错误，请检查设置 (Model Not Found / Invalid Endpoint)";
  }
  
  // Context length exceeded
  if (message.toLowerCase().includes("context_length_exceeded") || message.toLowerCase().includes("too many tokens")) {
    return "输入内容过长，请精简后重试 (Context Length Exceeded)";
  }

  // Network error
  if (message.toLowerCase().includes("fetch") || message.toLowerCase().includes("network") || message.toLowerCase().includes("failed to fetch")) {
    return "网络连接失败，请检查网络或代理设置 (Network Error)";
  }

  // Safety filters (Gemini specific)
  if (message.toLowerCase().includes("safety") || message.toLowerCase().includes("blocked")) {
    return "内容被安全过滤器拦截，请修改创意描述 (Blocked by Safety Filter)";
  }

  return `生成失败: ${message}`;
}

export async function testApiConnection(config: { provider: string; apiKey: string; baseUrl?: string; modelName?: string }): Promise<{ success: boolean; message: string }> {
  try {
    if (config.provider === "gemini") {
      const requestOptions: any = {};
      if (typeof window !== 'undefined' && (window as any).ipcRenderer) {
        requestOptions.customFetch = universalFetch;
      }
      const client = new GoogleGenAI({ apiKey: config.apiKey, ...requestOptions });
      await client.models.generateContent({
        model: config.modelName || "gemini-1.5-flash",
        contents: "Hi"
      });
      return { success: true, message: "Gemini API 连接成功！" };
    } else {
      const baseUrl = config.baseUrl || (config.provider === "openai" ? "https://api.openai.com/v1" : "");
      const endpoint = `${baseUrl}/chat/completions`;
      const modelToUse = config.modelName || (config.provider === "openai" ? "gpt-3.5-turbo" : "doubao-pro-32k");
      
      const response = await universalFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 5
        })
      });

      if (response.ok) {
        return { success: true, message: `${config.provider.toUpperCase()} API 连接成功！` };
      } else {
        const data = await response.json().catch(() => ({}));
        const errorMsg = data.error?.message || `连接失败 (状态码: ${response.status})`;
        return { success: false, message: formatApiError(new Error(errorMsg), config.provider) };
      }
    }
  } catch (error: any) {
    return { success: false, message: formatApiError(error, config.provider) };
  }
}

export async function generateVideoPrompt(
  userInput: string,
  model: ModelType,
  language: LanguageType,
  images?: (string | ImageObject)[], // Support both old and new formats
  apiConfig?: { provider: string; apiKey: string; baseUrl?: string; modelName?: string },
  technique?: string,
  totalDuration?: number
): Promise<PromptResult> {
  // Normalize images to ImageObject[]
  const normalizedImages: ImageObject[] = (images || []).map(img => {
    if (typeof img === 'string') return { url: img };
    return img;
  });

  // If custom API is provided and has a key, use the appropriate provider
  if (apiConfig && apiConfig.apiKey) {
    if (apiConfig.provider === "openai" || apiConfig.provider === "doubao" || apiConfig.provider === "custom") {
      return callOpenAICompatible(userInput, model, language, normalizedImages, apiConfig, technique, totalDuration);
    }
    // For Gemini, we could re-initialize the client with the user's key
    if (apiConfig.provider === "gemini") {
      const userAi = new GoogleGenAI({ apiKey: apiConfig.apiKey });
      return runGeminiGeneration(userAi, userInput, model, language, normalizedImages, apiConfig.modelName, technique, totalDuration);
    }
  }

  // Default to system Gemini
  return runGeminiGeneration(getAiClient(), userInput, model, language, normalizedImages, undefined, technique, totalDuration);
}

async function runGeminiGeneration(
  client: GoogleGenAI,
  userInput: string,
  model: ModelType,
  language: LanguageType,
  images?: ImageObject[],
  customModelName?: string,
  technique?: string,
  totalDuration?: number
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
${technique ? `指定视频手法: ${technique}` : ""}
${totalDuration ? `指定视频总时长: ${totalDuration}秒。请确保生成的每个分镜 [Shot N] 后都带有该镜头的时长（例如 [Shot 1] (3s)），且所有分镜时长之和等于或略小于总时长。` : ""}

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
    throw new Error(formatApiError(error, "Gemini"));
  }
}

async function callOpenAICompatible(
  userInput: string,
  model: ModelType,
  language: LanguageType,
  images?: ImageObject[],
  apiConfig?: { provider: string; apiKey: string; baseUrl?: string; modelName?: string },
  technique?: string,
  totalDuration?: number
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
          { type: "text", text: `用户创意: "${userInput}"\n选择模型: ${model}\n输出语言: ${language}\n${technique ? `指定视频手法: ${technique}\n` : ""}${totalDuration ? `指定视频总时长: ${totalDuration}秒。请确保生成的每个分镜 [Shot N] 后都带有该镜头的时长（例如 [Shot 1] (3s)），且所有分镜时长之和等于或略小于总时长。\n` : ""}\n${imageContext}\n\n请根据以上信息生成专业的视频提示词。` },
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

    const response = await universalFetch(endpoint, {
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
      throw new Error(formatApiError(new Error(errorMessage), apiConfig?.provider || "API"));
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
  } catch (error: any) {
    throw new Error(error.message || "API Call Error");
  }
}
