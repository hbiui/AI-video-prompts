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

    // Standard fetch for Gemini
    const requestOptions: any = {
      customFetch: universalFetch
    };
    
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
    language: LanguageType;
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
- **多分镜支持**：你必须根据创意复杂度自动决定分镜数量。确保每个分镜都符合上述 6 步公式，并用 [Shot N] 标签清晰分隔。

#### 2. Kling 3.0 Omni (快手) 专属标准：
- **结构**：严格遵守“主体及外貌 + 动作 + 环境 + 镜头运动 + 音频氛围”的 5 部分结构。
- **核心机制**：必须明确给出 运动强度控制 (Motion Intensity) 数值 (0.1 - 1.0)。
- **参考引用**：使用 <<<image_1>>> 等标签引用图片。
- **指令**：支持单次生成最多 6 个分镜，格式如 Shot 1 (3s)。

#### 3. 动态分镜规划 (Dynamic Shot Planning) - 核心指令：
- **拒绝固定分镜**：禁止每次都输出固定（如 3 个或 4 个）分镜。你必须根据输入动态计算。
- **强制分镜数量 (Force Shot Count)**：如果你收到了 \`shotCount\` 参数，你必须严格按照此数量规划分镜。在规划分镜时，手动指定的 \`shotCount\` 优先级高于自动推导逻辑。
- **推导逻辑依赖**：
    - **分镜数量 (User Input)**：优先级最高。如果指定了，必须生成对应数量的分镜。
    - **视频总时长 (Primary)**：如果没有指定 \`shotCount\`，则根据时长推导。
        - 1-5秒：通常为 1-2 个分镜。
        - 6-10秒：通常为 2-4 个分镜。
        - 11-15秒：通常为 3-6 个分镜。
    - **视频手法 (Optional)**：若指定了“长镜头”，则分镜数量应极少（甚至只有 1 个）；若指定了“快节奏剪辑”，分镜数量应增加格式建议。
    - **创意概念/分镜脚本 (Context)**：分析用户的描述。如果描述中包含“首先...然后...最后...”或明显的场景切换，即便时长较短，也应规划多个分镜。
    - **视觉风格 (Visual Style)**：如果用户指定了具体的视觉风格，你必须将该风格的特征深度融入到每一个分镜的“风格/灯光”或“视觉描述”中。严禁只在标题提到风格，必须体现在具体的画面描述（如笔触、光影色调、材质感）中。
    - **参考素材**：每增加一张需要展示的参考图，通常建议增加 1 个对应分镜。
- **分镜时长显示规范 (MANDATORY)**：
    - **显示时长**：当 \`totalDuration\` 为有效数字（用户输入了时长）时，分镜标题必须标注时长区间，格式如 \`[Shot 1] (2-3s)\` 或 \`[第 1 镜] (2-3s)\`。
    - **隐藏时长**：当 \`totalDuration\` 未指定或无输入时，**严禁**在分镜标题或内容中出现任何时长信息（如 2s, 3秒, (2-3s) 等）。标题应仅为 \`[Shot 1]\` 或 \`[第 1 镜]\`。
- **强制约束**：所有分镜的时长总和必须严格等于 \`totalDuration\`（如果指定了）。如果没有指定，默认按 5-10 秒规划分镜，但不得在输出中显示具体秒数。
- **参数返回**：在 \`parameters.shotCount\` 中返回你实际生成的数字。

#### 4. 格式化规范 (Formatting Standard) - **强制执行**：
- **分段布局与强制换行**：每一个分镜标题及所有结构标签（如主体、动作、环境）都必须**单独占一行**。控制输出必须换行。
- **Seedance 2.0 强制结构**（中文版示例，每一行必须显示换行）：
  [镜头 N] (如果有总时长则在此显示 (X-Ys))
  主体 (Subject): [内容]
  动作 (Action): [内容]
  环境 (Environment): [内容]
  镜头语言 (Camera): [内容]
  风格/灯光 (Style/Lighting): [内容]
  约束 (Constraints): [内容]
- **Kling 3.0 Omni 强制结构**（中文版示例，每一行必须显示换行）：
  [第 N 镜] (如果有总时长则在此显示 (X-Ys))
  主体及外貌: [内容]
  动作: [内容]
  环境: [内容]
  镜头运动: [内容]
  音频氛围: [内容]
  运动强度: [数字]
- **换行一致性**：无论是否显示时长，每一项标签必须保持**新行 (Newline)** 开头，严禁合并。
- **语言一致性**：\`mainPrompt\` 和 \`translation\` 的结构必须完全一致。英文版使用对应的英文标签（如 Subject, Action 等）。时长显示逻辑（显示或隐藏）必须在双语中同步执行。

#### 5. 通用最优解：
- 避免使用“漂亮”、“好看”等模糊词。
- 景别（特写、中景、全景）和运镜方式（推、拉、摇、移）为必填项。
- 若有图片，聚焦描述“图片中元素将要发生的动作和运动轨迹”，而非重复描述视觉特征。

### 输出要求
请返回 JSON 格式的数据，包含以下字段：
- mainPrompt: 优化后的专业提示词（严格遵守上述分段格式，必须使用用户要求的目标语言输出）。
- translation: 对应语言的翻译版本（如果用户要求输出语言为“English”，则 mainPrompt 为英文，translation 为中文；反之亦然）。
- parameters: 包含 model, duration, motionIntensity (仅Kling), shotCount (实际生成的分镜数量)。
- suggestions: 4-6个分类建议，每个建议包含 category (如 "Cinematic", "Action", "Atmosphere", "Lighting") 和 text (具体的微调指令)。`;

export interface ImageObject {
  id?: string;
  url: string;
  keyword?: string;
}

// Helper for cross-platform fetch (handles CORS in web app via local proxy and Electron via IPC)
async function universalFetch(url: string, options: any) {
  // 1. Check if running in Electron and proxy is available
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

  // 2. If it's already a local request, don't proxy
  if (url.startsWith('/') || url.startsWith('http://localhost') || url.startsWith('http://0.0.0.0')) {
    return fetch(url, options);
  }

  // 3. Use Web Proxy for standard web environment
  try {
    const proxyResponse = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, options }),
    });

    const data = await proxyResponse.text();
    
    return {
      ok: proxyResponse.ok,
      status: proxyResponse.status,
      json: async () => JSON.parse(data),
      text: async () => data,
      headers: proxyResponse.headers
    } as any;
  } catch (e) {
    console.error("Proxy fetch failed, falling back to standard fetch", e);
    return fetch(url, options);
  }
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
      const requestOptions: any = {
        customFetch: universalFetch
      };
      const client = new GoogleGenAI({ apiKey: config.apiKey, ...requestOptions });
      await client.models.generateContent({
        model: config.modelName || "gemini-3-flash-preview",
        contents: "Hi"
      });
      return { success: true, message: "Gemini API 连接成功！" };
    } else if (config.provider === "anthropic") {
      const baseUrl = config.baseUrl || "https://api.anthropic.com/v1";
      const endpoint = `${baseUrl}/messages`;
      const modelToUse = config.modelName || "claude-3-haiku-20240307";
      
      const response = await universalFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 100
        })
      });

      if (response.ok) {
        return { success: true, message: "Anthropic API 连接成功！" };
      } else {
        const data = await response.json().catch(() => ({}));
        const errorMsg = data.error?.message || `连接失败 (状态码: ${response.status})`;
        return { success: false, message: formatApiError(new Error(errorMsg), "Anthropic") };
      }
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
          max_tokens: 100
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

async function callAnthropic(
  userInput: string,
  model: ModelType,
  language: LanguageType,
  images?: ImageObject[],
  apiConfig?: { provider: string; apiKey: string; baseUrl?: string; modelName?: string },
  technique?: string,
  totalDuration?: number,
  shotCount?: number,
  visualStyle?: string
): Promise<PromptResult> {
  try {
    const baseUrl = apiConfig?.baseUrl || "https://api.anthropic.com/v1";
    const endpoint = `${baseUrl}/messages`;
    
    const imageContext = (images || []).map((img, idx) => {
      const defaultTag = model === "Seedance 2.0" ? `@Image${idx + 1}` : `<<<image_${idx + 1}>>>`;
      const keywordInfo = img.keyword ? ` (用户引用关键词: @${img.keyword})` : "";
      return `参考图片 ${idx + 1}: 标签为 ${defaultTag}${keywordInfo}。`;
    }).join("\n");

    const userContent: any[] = [
      { 
        type: "text", 
        text: `## 任务指令
请基于以下输入配置，自动推导最科学的分镜数量与内容：
- 用户创意/脚本: "${userInput}"
- 目标模型: ${model}
- 输出语言 (Target Language): ${language} (注意：mainPrompt 必须对应此语言，translation 则为另一种语言)
- 视频手法: ${technique || "未指定"}
- 视觉风格: ${visualStyle || "未指定"}
- 视频总时长: ${totalDuration ? `${totalDuration}秒` : "未指定"}
- 分镜数量: ${shotCount || "自动推导（如果没有指定）"}
- 参考素材: 已提供图片及描述如下

## 规划逻辑
1. 严禁使用固定模板。
2. 结合时长 ${totalDuration || ""}、手法 ${technique || ""} 和创意复杂度决定分镜数。
3. 如果指定了分镜数量 ${shotCount || ""}，则必须严格输出对应数量的分镜。
4. 确保分镜时长总和一致。
5. 必须遵守语言设定：如果输出语言为 English，则 mainPrompt 必须是全英文提示词。

${imageContext}` 
      }
    ];

    if (images && images.length > 0) {
      images.forEach(img => {
        if (img.url && typeof img.url === 'string') {
          const match = img.url.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
          if (match) {
            userContent.push({
              type: "image",
              source: {
                type: "base64",
                media_type: match[1],
                data: match[2]
              }
            });
          }
        }
      });
    }

    const modelToUse = apiConfig?.modelName || "claude-3-5-sonnet-20240620";

    const response = await universalFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiConfig?.apiKey || "",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: modelToUse,
        max_tokens: 4096,
        system: SYSTEM_INSTRUCTION + "\n\nIMPORTANT: You MUST return ONLY a valid JSON object. Do not include any other text.",
        messages: [
          { role: "user", content: userContent }
        ]
      })
    });

    if (!response.ok) {
      let errorMessage = "Anthropic API request failed";
      try {
        const err = await response.json();
        errorMessage = err.error?.message || errorMessage;
      } catch (e) {}
      throw new Error(formatApiError(new Error(errorMessage), "Anthropic"));
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    
    if (!content) {
      throw new Error("Empty response from Anthropic");
    }

    try {
      // Anthropic sometimes adds markdown blocks even when told not to
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      const parsed = JSON.parse(jsonStr) as PromptResult;
      parsed.parameters.language = language;
      return parsed;
    } catch (parseError) {
      console.error("Anthropic Parse Error. Raw content:", content);
      throw new Error("Failed to parse Anthropic response as JSON.");
    }
  } catch (error: any) {
    throw new Error(error.message || "Anthropic API Call Error");
  }
}

export async function generateVideoPrompt(
  userInput: string,
  model: ModelType,
  language: LanguageType,
  images?: (string | ImageObject)[], // Support both old and new formats
  apiConfig?: { provider: string; apiKey: string; baseUrl?: string; modelName?: string },
  technique?: string,
  totalDuration?: number,
  shotCount?: number,
  visualStyle?: string
): Promise<PromptResult> {
  // Normalize images to ImageObject[]
  const normalizedImages: ImageObject[] = (images || []).map(img => {
    if (typeof img === 'string') return { url: img };
    return img;
  });

  // If custom API is provided and has a key, use the appropriate provider
  if (apiConfig && apiConfig.apiKey) {
    if (apiConfig.provider === "openai" || apiConfig.provider === "doubao" || apiConfig.provider === "custom") {
      return callOpenAICompatible(userInput, model, language, normalizedImages, apiConfig, technique, totalDuration, shotCount, visualStyle);
    }
    if (apiConfig.provider === "anthropic") {
      return callAnthropic(userInput, model, language, normalizedImages, apiConfig, technique, totalDuration, shotCount, visualStyle);
    }
    // For Gemini, we could re-initialize the client with the user's key
    if (apiConfig.provider === "gemini") {
      const userAi = new GoogleGenAI({ apiKey: apiConfig.apiKey });
      return runGeminiGeneration(userAi, userInput, model, language, normalizedImages, apiConfig.modelName, technique, totalDuration, shotCount, visualStyle);
    }
  }

  // Default to system Gemini
  return runGeminiGeneration(getAiClient(), userInput, model, language, normalizedImages, undefined, technique, totalDuration, shotCount, visualStyle);
}

async function runGeminiGeneration(
  client: GoogleGenAI,
  userInput: string,
  model: ModelType,
  language: LanguageType,
  images?: ImageObject[],
  customModelName?: string,
  technique?: string,
  totalDuration?: number,
  shotCount?: number,
  visualStyle?: string
): Promise<PromptResult> {
  const modelName = customModelName || "gemini-3.1-pro-preview";
  
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
      text: `## 任务指令 (Task)
请基于以下输入配置，自动推导最科学的分镜数量与内容：
1. 用户创意/脚本: "${userInput}"
2. 目标模型: ${model}
3. 输出语言 (Target Language): ${language} (注意：mainPrompt 必须使用此语言，translation 为另一种语言)
4. 视频手法: ${technique || "未指定（请根据创意自动选择最合适的）"}
5. 视觉风格: ${visualStyle || "未指定（请根据创意自动选择最合适的）"}
6. 视频总时长: ${totalDuration ? `${totalDuration}秒` : "未指定（请建议一个合适的时长）"}
7. 分镜数量: ${shotCount || "自动推导（如果没有指定）"}
8. 参考素材: 已上传 ${images?.length || 0} 张参考图

## 规划要求
- **严禁固定分镜数量**：分析用户脚本的动作节点和总时长。
- **强制分镜数**：如果指定了分镜数量 (${shotCount})，必须严格输出对应数量的分镜。
- **语言权重**：如果输出语言为 ${language}，则 mainPrompt 必须严格按照此语言生成。
- **时长匹配**：分镜时长总和必须等于 ${totalDuration || "你建议的时长"}。
- **分镜内容**：根据视频手法决定运镜，根据参考素材决定视觉元素。
- **输出格式**：返回符合 JSON Schema 的结果。`,
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
      const parsed = JSON.parse(text) as PromptResult;
      parsed.parameters.language = language;
      return parsed;
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
  totalDuration?: number,
  shotCount?: number,
  visualStyle?: string
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
          { 
            type: "text", 
            text: `## 任务指令
请基于以下输入配置，自动推导最科学的分镜数量与内容：
- 用户创意/脚本: "${userInput}"
- 目标模型: ${model}
- 输出语言 (Target Language): ${language} (注意：mainPrompt 必须使用此语言，translation 则为另一种语言)
- 视频手法: ${technique || "未指定"}
- 视觉风格: ${visualStyle || "未指定"}
- 视频总时长: ${totalDuration ? `${totalDuration}秒` : "未指定"}
- 分镜数量: ${shotCount || "自动推导（如果没有指定）"}
- 参考素材: 已提供 ${images?.length || 0} 个素材描述及图片

## 规划逻辑
1. 严禁使用固定模板。
2. 结合时长 ${totalDuration || ""}、手法 ${technique || ""} 和创意复杂度决定分镜数。
3. 如果指定了分镜数量 ${shotCount || ""}，则必须严格输出对应数量的分镜。
4. 确保分镜时长总和一致。
5. 强调：如果输出语言是 English，则 mainPrompt 字段必须是英文提示词。
\n${imageContext}` 
          },
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
        max_tokens: 4096,
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
      const parsed = JSON.parse(content) as PromptResult;
      parsed.parameters.language = language;
      return parsed;
    } catch (parseError) {
      console.error("OpenAI Parse Error. Raw content:", content);
      throw new Error("Failed to parse AI response as JSON. Please try again.");
    }
  } catch (error: any) {
    throw new Error(error.message || "API Call Error");
  }
}

export async function reverseVideoPrompt(
  videoSource: { type: 'file' | 'url'; data: string },
  language: LanguageType,
  apiConfig?: { provider: string; apiKey: string; baseUrl?: string; modelName?: string }
): Promise<string> {
  const systemInstruction = `你是一位顶级的视频 analysis 专家和提示词反推架构师。
你的任务是深度分析用户提供的视频，并将其反推为高质量的视频生成提示词。

### 输出要求：
1. **结构化描述**：使用 [Shot 1], [Shot 2] 等标签清晰分隔不同的分镜。
2. **细节丰富**：描述主体、动作、环境、灯光、构图和镜头运动。
3. **专业术语**：使用专业的摄影和导演术语（如：Dolly In, Pan, Tilt, Low Angle, Rim Light 等）。
4. **语言**：根据用户要求的语言（${language === "Chinese" ? "中文" : "英文"}）输出。
5. **格式**：仅输出反推后的提示词文本，不要包含任何额外的解释或 JSON 格式。`;

  try {
    if (apiConfig?.provider === "gemini" || !apiConfig) {
      const requestOptions: any = {
        customFetch: universalFetch
      };
      const client = apiConfig?.apiKey ? new GoogleGenAI({ apiKey: apiConfig.apiKey, ...requestOptions }) : getAiClient();
      const modelName = apiConfig?.modelName || "gemini-3.1-pro-preview";

      const parts: any[] = [];
      
      if (videoSource.type === 'file') {
        const mimeType = videoSource.data.match(/^data:([^;]+);/)?.[1] || "video/mp4";
        const base64Data = videoSource.data.includes(",") ? videoSource.data.split(",")[1] : videoSource.data;
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      } else {
        parts.push({ text: `视频链接: ${videoSource.data}` });
      }

      parts.push({ text: `请分析这段视频并反推其生成提示词。输出语言: ${language}` });

      const result = await client.models.generateContent({
        model: modelName,
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction,
        }
      });

      return result.text || "";
    } else {
      // Generic OpenAI-compatible call for reverse prompt
      const baseUrl = apiConfig?.baseUrl || (apiConfig?.provider === "openai" ? "https://api.openai.com/v1" : "");
      if (!baseUrl && apiConfig?.provider === "custom") throw new Error("Base URL is required for custom provider");
      
      const endpoint = `${baseUrl}/chat/completions`;
      const defaultModel = apiConfig?.provider === "openai" ? "gpt-4o" : "doubao-pro-32k";
      const modelToUse = apiConfig?.modelName || defaultModel;

      const content: any[] = [
        { type: "text", text: `请分析这段视频并反推其生成提示词。输出语言: ${language}\n\n${systemInstruction}` }
      ];

      if (videoSource.type === 'url') {
        content.push({ type: "text", text: `视频链接: ${videoSource.data}` });
      } else {
        // For files, we try to send as a data URL if the provider supports it
        // Note: Most OpenAI-compatible APIs expect frames as images for video analysis
        content.push({ 
          type: "text", 
          text: "[视频文件输入] 提示：当前模型可能不支持直接处理视频文件，建议使用视频链接或切换至 Gemini 模型以获得最佳效果。" 
        });
      }

      const response = await universalFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiConfig?.apiKey}`
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [{ role: "user", content }],
          max_tokens: 2048
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API 请求失败 (状态码: ${response.status})`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    }
  } catch (error: any) {
    throw new Error(formatApiError(error, apiConfig?.provider || "Gemini"));
  }
}
