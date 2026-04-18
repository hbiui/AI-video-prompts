export type Language = "zh" | "en";

export const translations = {
  zh: {
    title: "AI 视频提示词导演助手",
    subtitle: "顶级 AI 视频提示词导演助手。专为 Seedance 2.0 与 Kling 3.0 Omni 打造的专业提示词优化引擎。",
    systemOnline: "系统在线",
    inputConfig: "输入配置",
    targetModel: "目标模型引擎",
    outputLanguage: "输出提示词语言",
    creativeConcept: "创意概念 / 分镜脚本",
    placeholder: "例如：[Shot 1] 赛博朋克跑车在雨夜穿梭，霓虹灯倒影。[Shot 2] 镜头推向驾驶员特写，眼神坚定...",
    referenceAssets: "参考素材",
    addImages: "添加图片",
    generateBtn: "生成导演提示词",
    stageAnalyzing: "正在分析创意概念...",
    stageStructuring: "正在构建分镜结构...",
    stageOptimizing: "正在根据 {model} 规则优化...",
    stageFinalizing: "正在润色导演提示词...",
    generating: "分析并生成中...",
    optimizedPrompt: "优化后的导演提示词",
    copyPrompt: "复制提示词",
    copied: "已复制",
    scriptPreview: "脚本预览",
    translationRef: "翻译参考",
    model: "模型",
    duration: "时长",
    intensity: "运动强度",
    shots: "分镜数",
    fineTune: "微调建议",
    proTip: "导演建议",
    awaitingInput: "等待输入指令",
    thinking: "导演正在思考...",
    optimizing: "正在根据 {model} 规则优化分镜脚本",
    errorInput: "请输入创意描述或上传图片",
    errorFailed: "生成失败，请重试",
    seedanceTip: "Seedance 2.0 擅长处理多图参考，建议在提示词中使用 @Image1 明确标注动作发生的起始帧。",
    klingTip: "Kling 3.0 Omni 的核心在于运动强度控制，如果你觉得画面太静止，可以尝试将 Motion Intensity 调高至 0.8 以上。",
    chinesePrompt: "中文提示词",
    englishPrompt: "英文提示词",
    footerReady: "引擎就绪",
    footerDesign: "sunell市场部为视频创作而设计 © 2026",
    clearAll: "清空全部",
    history: "历史记录",
    noHistory: "暂无历史记录",
    reuse: "复用",
    importPrompt: "导入提示词",
    delete: "删除",
    saveSuccess: "已保存至历史",
    sharePrompt: "分享提示词",
    downloadTxt: "导出 TXT",
    shareSuccessUrl: "分享链接已复制，他人访问即可加载此作品",
    shareSuccessTxt: "提示词文件已准备好下载",
    mentionTitle: "可能@的内容",
    createSubject: "创建主体",
    addFromLocal: "从本地添加",
    imageLabel: "图片",
    dropImages: "拖拽图片至此上传",
    modelNames: {
      "Seedance 2.0": "Seedance 2.0",
      "Kling 3.0 Omni": "Kling 3.0 Omni"
    },
    settings: "设置",
    apiConfig: "API 配置",
    apiProvider: "模型服务商",
    apiKey: "API 密钥",
    apiBaseUrl: "API 代理地址 (可选)",
    apiModelName: "模型名称 (可选)",
    saveSettings: "保存设置",
    settingsSaved: "设置已保存",
    testConnection: "测试连接",
    testing: "测试中...",
    testSuccess: "连接成功！",
    testFailed: "连接失败",
    apiTip: "提示：您可以接入第三方大模型来驱动导演引擎。推荐使用具有强逻辑分析能力的模型。",
    imageCompression: "图片压缩设置",
    enableCompression: "启用自动压缩",
    compressionQuality: "压缩质量",
    maxDimension: "最大尺寸限制 (px)",
    historyCapacity: "历史记录容量",
    historyCapacityTip: "提示：增加容量会占用更多浏览器存储。建议保持在 10-20 条以获得最佳性能。",
    compressionTip: "提示：启用压缩可以显著减少浏览器存储占用，防止历史记录因空间不足而保存失败。",
    providerInfo: {
      gemini: "Google Gemini: 强大的多模态理解能力，建议使用 Gemini 3.1 Pro。",
      openai: "OpenAI ChatGPT: 逻辑严密，建议使用 GPT-4o。",
      doubao: "火山引擎豆包: 字节跳动出品，中文语境理解极佳。",
      anthropic: "Anthropic Claude: 逻辑极其严密，长文本理解能力顶尖。",
      custom: "自定义 OpenAI 格式: 支持任何兼容 OpenAI 接口的第三方中转。"
    },
    applyLink: "申请链接",
    templates: "灵感模板",
    saveAsTemplate: "保存为灵感模板",
    templateName: "模板名称",
    userTemplates: "我的模板",
    save: "保存",
    cancel: "取消",
    stop: "停止",
    clearHistory: "清空历史",
    templateCategories: {
      cinematic: "电影感",
      product: "产品展示",
      animation: "动画角色",
      nature: "自然风光",
      scifi: "科幻未来",
      fantasy: "奇幻史诗",
      documentary: "纪实风格",
      abstract: "抽象艺术"
    },
    videoReverseTitle: "视频反推提示词生成器",
    reverseTab: "视频反推",
    directorTab: "导演助手",
    youtube: "YouTube",
    url: "视频URL",
    file: "上传视频",
    videoUrl: "视频链接",
    uploadFile: "上传文件",
    pasteYoutube: "粘贴 YouTube 视频链接...",
    pasteVideoUrl: "粘贴视频链接 (MP4, WebM, MOV...)",
    dropVideo: "拖拽视频文件至此或点击上传 (支持 MP4, WebM, MOV 等)",
    reverseBtn: "开始反推提示词",
    reversing: "正在分析视频并反推提示词...",
    reverseSuccess: "反推成功！已将结果填入导演助手。",
    reverseTip: "提示：视频反推功能使用 Gemini 模型效果最佳。",
    videoTechnique: "视频手法",
    visualStyle: "视觉风格",
    optional: "(可选)",
    selectTechnique: "选择一种视频手法 (可选)",
    selectStyle: "选择一种视觉风格 (可选)",
    totalDuration: "视频总时长",
    durationUnit: "秒 (S)",
    enableDuration: "启用时长控制",
    durationPlaceholder: "输入总时长...",
    shotCount: "分镜数量",
    enableShotCount: "启用数量控制",
    shotCountPlaceholder: "选择分镜数...",
    shotsUnit: "个分镜",
    techniques: {
      montage: "蒙太奇",
      longTake: "长镜头",
      timeLapse: "延时摄影",
      slowMotion: "慢动作",
      trackingShot: "跟拍镜头",
      aerialView: "航拍视角",
      pov: "POV (第一人称)",
      splitScreen: "分屏",
      matchCut: "匹配剪辑",
      fadeTransition: "淡入淡出"
    }
  },
  en: {
    title: "AI Video Prompt Director",
    subtitle: "Professional video prompt optimization engine. Specifically designed for Seedance 2.0 and Kling 3.0 Omni.",
    systemOnline: "SYSTEM ONLINE",
    inputConfig: "Input Configuration",
    targetModel: "Target Model Engine",
    outputLanguage: "Output Prompt Language",
    creativeConcept: "Creative Concept / Storyboard",
    placeholder: "e.g., [Shot 1] Cyberpunk sports car driving through a rainy night. [Shot 2] Close-up on the driver's determined eyes...",
    referenceAssets: "Reference Assets",
    addImages: "ADD IMAGES",
    generateBtn: "GENERATE DIRECTOR PROMPT",
    stageAnalyzing: "Analyzing creative concept...",
    stageStructuring: "Structuring storyboard...",
    stageOptimizing: "Optimizing based on {model} rules...",
    stageFinalizing: "Polishing director prompt...",
    generating: "ANALYZING & GENERATING...",
    optimizedPrompt: "Optimized Director Prompt",
    copyPrompt: "COPY PROMPT",
    copied: "COPIED",
    scriptPreview: "Script Preview",
    translationRef: "Translation Reference",
    model: "Model",
    duration: "Duration",
    intensity: "Intensity",
    shots: "Shots",
    fineTune: "Fine-tune Suggestions",
    proTip: "Director's Pro Tip",
    awaitingInput: "AWAITING INPUT COMMANDS",
    thinking: "DIRECTOR IS THINKING...",
    optimizing: "Optimizing storyboard based on {model} rules",
    errorInput: "Please enter a description or upload images",
    errorFailed: "Generation failed, please try again",
    seedanceTip: "Seedance 2.0 excels at multi-image references. Use @Image1 to mark the starting frame of an action.",
    klingTip: "Kling 3.0 Omni focuses on Motion Intensity. If the scene is too static, try increasing it to 0.8 or higher.",
    chinesePrompt: "Chinese Prompt",
    englishPrompt: "English Prompt",
    footerReady: "ENGINE READY",
    footerDesign: "Designed for Video Creation by sunell Marketing © 2026",
    clearAll: "Clear All",
    history: "History",
    noHistory: "No history yet",
    reuse: "Reuse",
    importPrompt: "Import Prompt",
    delete: "Delete",
    saveSuccess: "Saved to history",
    sharePrompt: "Share Prompt",
    downloadTxt: "Export TXT",
    shareSuccessUrl: "Share link copied to clipboard",
    shareSuccessTxt: "Prompt file ready for download",
    mentionTitle: "Possible Mentions",
    createSubject: "Create Subject",
    addFromLocal: "Add from Local",
    imageLabel: "Image",
    dropImages: "Drop images here to upload",
    modelNames: {
      "Seedance 2.0": "Seedance 2.0",
      "Kling 3.0 Omni": "Kling 3.0 Omni"
    },
    settings: "Settings",
    apiConfig: "API Configuration",
    apiProvider: "API Provider",
    apiKey: "API Key",
    apiBaseUrl: "API Base URL (Optional)",
    apiModelName: "Model Name (Optional)",
    saveSettings: "Save Settings",
    settingsSaved: "Settings Saved",
    testConnection: "Test Connection",
    testing: "Testing...",
    testSuccess: "Connection Successful!",
    testFailed: "Connection Failed",
    apiTip: "Tip: You can connect third-party LLMs to drive the Director Engine. Models with strong logical analysis are recommended.",
    imageCompression: "Image Compression",
    enableCompression: "Enable Compression",
    compressionQuality: "Quality",
    maxDimension: "Max Dimension (px)",
    historyCapacity: "History Capacity",
    historyCapacityTip: "Tip: Increasing capacity uses more storage. 10-20 items recommended for best performance.",
    compressionTip: "Tip: Enabling compression significantly reduces storage usage and prevents history save failures.",
    providerInfo: {
      gemini: "Google Gemini: Strong multimodal understanding, Gemini 3.1 Pro recommended.",
      openai: "OpenAI ChatGPT: Precise logic, GPT-4o recommended.",
      doubao: "Volcengine Doubao: By ByteDance, excellent Chinese context understanding.",
      anthropic: "Anthropic Claude: Extremely precise logic, top-tier long context understanding.",
      custom: "Custom OpenAI Format: Supports any OpenAI-compatible third-party proxy."
    },
    applyLink: "Apply Link",
    templates: "Inspiration Templates",
    saveAsTemplate: "Save as Template",
    templateName: "Template Name",
    userTemplates: "My Templates",
    save: "Save",
    cancel: "Cancel",
    stop: "Stop",
    clearHistory: "Clear History",
    templateCategories: {
      cinematic: "Cinematic",
      product: "Product",
      animation: "Animation",
      nature: "Nature",
      scifi: "Sci-Fi",
      fantasy: "Fantasy",
      documentary: "Documentary",
      abstract: "Abstract"
    },
    videoReverseTitle: "Video Reverse Prompt Generator",
    reverseTab: "Video Reverse",
    directorTab: "Director Assistant",
    youtube: "YouTube",
    url: "Video URL",
    file: "Upload Video",
    videoUrl: "Video URL",
    uploadFile: "Upload File",
    pasteYoutube: "Paste YouTube video link...",
    pasteVideoUrl: "Paste video link (MP4, WebM, MOV...)",
    dropVideo: "Drop video file here or click to upload (Supports MP4, WebM, MOV, etc.)",
    reverseBtn: "START REVERSE PROMPT",
    reversing: "ANALYZING VIDEO & REVERSING...",
    reverseSuccess: "Reverse successful! Result filled into Director Assistant.",
    reverseTip: "Tip: Video reverse works best with Gemini models.",
    videoTechnique: "Video Technique",
    visualStyle: "Visual Style",
    optional: "(Optional)",
    selectTechnique: "Select a video technique (optional)",
    selectStyle: "Select a visual style (optional)",
    totalDuration: "Total Video Duration",
    durationUnit: "Seconds (S)",
    enableDuration: "Enable Duration Control",
    durationPlaceholder: "Enter total duration...",
    shotCount: "Shot Count",
    enableShotCount: "Enable Shot Count",
    shotCountPlaceholder: "Select shot count...",
    shotsUnit: "Shots",
    techniques: {
      montage: "Montage",
      longTake: "Long Take",
      timeLapse: "Time-lapse",
      slowMotion: "Slow Motion",
      trackingShot: "Tracking Shot",
      aerialView: "Aerial View",
      pov: "POV (First Person)",
      splitScreen: "Split Screen",
      matchCut: "Match Cut",
      fadeTransition: "Fade Transition"
    }
  }
};

export interface PromptTemplate {
  id: string;
  category: keyof typeof translations.en.templateCategories;
  title: { zh: string; en: string };
  concept: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "car-chase",
    category: "cinematic",
    title: { zh: "电影级飙车戏", en: "Cinematic Car Chase" },
    concept: "[Shot 1] 一辆黑色改装跑车在繁华的赛博朋克都市街道疾驰，身后紧跟着两辆警车，霓虹灯光在车身流转。\n[Shot 2] 镜头快速切到跑车轮胎在雨地漂移的特写，溅起巨大的水花。\n[Shot 3] 航拍视角，跑车在密集的车流中灵活穿梭，引擎轰鸣声仿佛穿透屏幕。"
  },
  {
    id: "product-watch",
    category: "product",
    title: { zh: "高端腕表展示", en: "Luxury Watch Showcase" },
    concept: "[Shot 1] 极简黑色背景，镜头缓慢环绕一块精密的机械腕表，光影在金属表壳上优雅跃动。\n[Shot 2] 极近特写，展示表盘内齿轮咬合转动的精密细节，展现极致工艺感。\n[Shot 3] 腕表整体特写，指针指向10:10，周围散发出淡淡的奢华光晕。"
  },
  {
    id: "character-intro",
    category: "animation",
    title: { zh: "动画角色登场", en: "Character Intro" },
    concept: "[Shot 1] 一个身穿红色斗篷的小狐狸在充满魔法气息的森林中探头探脑，周围有发光的蝴蝶飞舞。\n[Shot 2] 小狐狸发现了一颗发光的宝石，眼睛里充满了好奇和惊喜的亮光。\n[Shot 3] 小狐狸跳向宝石，镜头跟随它的动作，展现出灵动活泼的性格。"
  },
  {
    id: "mountain-mist",
    category: "nature",
    title: { zh: "云雾山间", en: "Mountain Mist" },
    concept: "[Shot 1] 延时摄影风格，清晨的云雾在层峦叠嶂的山峰间缓慢流动，如同一幅流动的泼墨山水画。\n[Shot 2] 镜头推近，一棵孤傲的松树矗立在悬崖边，云海在其脚下翻腾。\n[Shot 3] 阳光穿透云层，形成壮丽的丁达尔效应，照亮了远处的古老寺庙。"
  },
  {
    id: "scifi-station",
    category: "scifi",
    title: { zh: "星际空间站", en: "Interstellar Station" },
    concept: "[Shot 1] 巨大的环形空间站静静悬浮在深邃的宇宙中，远处的蓝色行星散发着柔和的光芒。\n[Shot 2] 镜头推向空间站的观察窗，一名宇航员正凝视着外面的星云，反射光在他头盔上闪烁。\n[Shot 3] 一艘小型穿梭机从空间站弹射而出，尾部喷射出耀眼的离子火焰，消失在星海深处。"
  },
  {
    id: "scifi-lab",
    category: "scifi",
    title: { zh: "赛博朋克实验室", en: "Cyberpunk Lab" },
    concept: "[Shot 1] 昏暗的实验室里，无数全息投影屏幕漂浮在空中，散发着幽蓝的光芒，复杂的代码在屏幕上飞速滚动。\n[Shot 2] 镜头推向一个正在组装的仿生手臂，机械关节在激光焊接下发出细微的火花。\n[Shot 3] 科学家戴着增强现实眼镜，手指在虚空中灵巧地拨动，展现出极高科技的未来感。"
  },
  {
    id: "fantasy-dragon",
    category: "fantasy",
    title: { zh: "巨龙觉醒", en: "Dragon Awakening" },
    concept: "[Shot 1] 幽暗的巨大洞穴内，堆积如山的金币中，一只巨大的金色眼睛突然睁开，瞳孔竖立。\n[Shot 2] 镜头拉远，巨龙缓缓起身，抖落身上的财宝，鳞片在微弱的火光下闪烁着金属光泽。\n[Shot 3] 巨龙仰天长啸，一道炽热的龙息喷涌而出，瞬间照亮了整个地下宫殿。"
  },
  {
    id: "fantasy-forest",
    category: "fantasy",
    title: { zh: "魔法森林秘境", en: "Enchanted Forest" },
    concept: "[Shot 1] 参天大树的树根上覆盖着发光的苔藓，巨大的发光蘑菇像路灯一样点亮了森林的小径。\n[Shot 2] 一只长着独角的白鹿在溪边饮水，它每走一步，脚下的草地都会绽放出微小的光花。\n[Shot 3] 镜头缓缓拉升，展现出整片森林在夜色下犹如星海般璀璨的奇幻景观。"
  },
  {
    id: "doc-cheetah",
    category: "documentary",
    title: { zh: "非洲草原猎豹", en: "African Savanna Cheetah" },
    concept: "[Shot 1] 广阔的非洲大草原，金色的夕阳下，一只猎豹静静地潜伏在枯黄的高草丛中，目光锁定远处的羚羊。\n[Shot 2] 慢动作镜头，猎豹突然爆发，肌肉在皮毛下剧烈起伏，四肢在空中完全舒展。\n[Shot 3] 镜头跟随猎豹疾驰，背景变得模糊，展现出极致的速度与野性之美。"
  },
  {
    id: "doc-whale",
    category: "documentary",
    title: { zh: "深海巨鲸", en: "Deep Sea Whale" },
    concept: "[Shot 1] 深邃湛蓝的海水中，一头巨大的座头鲸缓慢游动，阳光从海面透射下来，形成神圣的光柱。\n[Shot 2] 镜头跟随鲸鱼巨大的尾鳍摆动，展现出海洋生物的优雅与力量感。\n[Shot 3] 鲸鱼发出的低频鸣叫声仿佛在深海中回荡，营造出宁静而壮阔的纪实氛围。"
  },
  {
    id: "abstract-fluid",
    category: "abstract",
    title: { zh: "流动的色彩", en: "Fluid Colors" },
    concept: "[Shot 1] 宏观摄影，深蓝色的墨水滴入清措的水中，缓慢扩散并交织成梦幻的丝绸状纹理。\n[Shot 2] 镜头快速穿梭在不断变化的色彩隧道中，光影交错，产生强烈的视觉冲击力。\n[Shot 3] 金色的粉末在液体中旋转升腾，形成类似星系的螺旋结构，充满艺术张力。"
  },
  {
    id: "abstract-geo",
    category: "abstract",
    title: { zh: "几何光影", en: "Geometric Light" },
    concept: "[Shot 1] 纯白色的极简空间，巨大的几何体在缓慢旋转，投射出不断变化的锐利阴影。\n[Shot 2] 镜头快速穿过一系列平行的光栅，产生强烈的频闪视觉效果，充满现代艺术感。\n[Shot 3] 空间开始扭曲折叠，光影交织成复杂的莫比乌斯环结构，探索维度与空间的边界。"
  }
];

export const VISUAL_STYLES = {
  animation: {
    label: { zh: "3D / 动画类风格", en: "3D / Animation" },
    icon: "Shapes",
    styles: [
      {
        name: { zh: "皮克斯 3D 卡通风格", en: "Pixar 3D Cartoon Style" },
        description: { zh: "圆润可爱的卡通造型、柔和明亮的光影，适合治愈系、儿童向内容，能生成拟人化的生动角色。", en: "Rounded and cute cartoon shapes, soft and bright lighting, suitable for healing and children's content." }
      },
      {
        name: { zh: "写实 3A 游戏风格", en: "Realistic 3A Game Style" },
        description: { zh: "类似《荒野大镖客》这类 3A 大作的电影级质感，细节丰富、氛围感强烈，适合打造大片感的动作、剧情场景。", en: "Movie-level texture similar to 3A masterpieces, rich details and strong atmosphere, suitable for blockbuster action or plots." }
      },
      {
        name: { zh: "3D 国漫风格", en: "3D Chinese Anime Style" },
        description: { zh: "以《凡人修仙传》这类国产 3D 动漫为代表，适配仙侠、古风玄幻内容，能还原精致的国风角色与特效。", en: "Represented by domestic 3D anime, suitable for fairy tale and fantasy content, restoring exquisite character details." }
      },
      {
        name: { zh: "定格动画风格", en: "Stop-Motion Animation Style" },
        description: { zh: "模拟逐帧拍摄的定格动画质感，带有手工创作的复古趣味。", en: "Simulates the texture of frame-by-frame stop-motion animation, with the retro fun of manual creation." }
      },
      {
        name: { zh: "日系赛璐璐平涂风格", en: "Japanese Cel Shaded Style" },
        description: { zh: "经典的二次元动漫风格，干净的线条、简约的明暗，适合二次元角色、清新向的动漫场景。", en: "Classic 2D anime style, clean lines, simple shading, suitable for ACG characters and fresh anime scenes." }
      },
      {
        name: { zh: "电商 3D 风格", en: "E-commerce 3D Style" },
        description: { zh: "高光质感与干净背景，强调产品细节与视觉吸引力，适合电商展示与广告内容。", en: "Highlight texture and clean background, emphasizing product details and visual appeal, suitable for e-commerce displays." }
      }
    ]
  },
  artistic: {
    label: { zh: "艺术绘画类风格", en: "Artistic Painting" },
    icon: "Palette",
    styles: [
      {
        name: { zh: "水彩风格", en: "Watercolor Style" },
        description: { zh: "通透晕染的水彩笔触，清新柔和的色彩，适合文艺、意境类的创作。", en: "Transparent watercolor strokes, fresh and soft colors, suitable for literary and artistic creations." }
      },
      {
        name: { zh: "剪纸风格", en: "Paper-cut Style" },
        description: { zh: "模拟传统剪纸的镂空、层叠质感，带有鲜明的国风手工特色。", en: "Simulates the hollowed-out and layered texture of traditional paper-cutting, with distinct Chinese manual characteristics." }
      },
      {
        name: { zh: "水墨 / 古风插画风格", en: "Ink / Ancient Illustration" },
        description: { zh: "中式水墨的写意留白，搭配古风的雅致色调，适合国风、意境类的内容。", en: "Impressionistic white space of Chinese ink painting with elegant ancient colors, suitable for traditional Chinese content." }
      },
      {
        name: { zh: "油画风格", en: "Oil Painting Style" },
        description: { zh: "厚重的笔触、丰富的色彩层次，带有浓厚的艺术创作感，适合艺术向的场景创作。", en: "Heavy brushstrokes and rich color layers, with a strong sense of artistic creation, suitable for artistic scenes." }
      },
      {
        name: { zh: "游戏美宣厚涂风格", en: "Game Promo Thick Shading" },
        description: { zh: "细腻的光影、强烈的质感，适合制作氛围感强烈的角色宣传、海报级的视频内容。", en: "Detailed lighting and strong texture, suitable for creating atmospheric character promos and poster-level videos." }
      },
      {
        name: { zh: "赛博朋克风格", en: "Cyberpunk Style" },
        description: { zh: "高对比度的霓虹色彩、未来科技感的视觉，适配科幻、未来都市类的场景。", en: "High-contrast neon colors and future tech visuals, suitable for sci-fi and future city scenes." }
      },
      {
        name: { zh: "黑色电影风格", en: "Film Noir Style" },
        description: { zh: "带有复古黑色电影的低光、高对比的影调，适合悬疑、剧情类的内容。", en: "Retro film noir tones with low light and high contrast, suitable for suspense and drama content." }
      }
    ]
  },
  realistic: {
    label: { zh: "写实 / 影视 / 摄影类风格", en: "Realistic / Film / Photo" },
    icon: "Camera",
    styles: [
      {
        name: { zh: "超写实 / 照片级写实风格", en: "Hyper-realistic / Photo-realistic" },
        description: { zh: "最基础也最稳定的风格，能生成和真实拍摄几乎无差的视频内容，支持各类日常、商业场景。", en: "The most basic and stable style, can generate video content that is almost identical to real shooting." }
      },
      {
        name: { zh: "电影质感写实风格", en: "Cinematic Realistic Style" },
        description: { zh: "好莱坞级的电影运镜与光影，搭配胶片质感，适合打造剧情大片、商业广告类内容。", en: "Hollywood-level movie camera movement and lighting, paired with film texture, suitable for creating blockbusters." }
      },
      {
        name: { zh: "伪纪录片 / Vlog 实拍风格", en: "Mockumentary / Vlog Style" },
        description: { zh: "模拟手持拍摄的真实感，带有生活化的细节，能制作 vlog、伪纪实类的创意内容。", en: "Simulates the realism of handheld shooting, with life-like details, suitable for creating vlogs and mockumentaries." }
      },
      {
        name: { zh: "产品静物摄影风格", en: "Product Still Life Style" },
        description: { zh: "专业的产品打光、细腻的质感，适合带货、产品展示类的内容。", en: "Professional product lighting and fine texture, suitable for live-streaming and product showcase content." }
      },
      {
        name: { zh: "胶片复古风格", en: "Vintage Film Style" },
        description: { zh: "复古的胶片色调、颗粒质感，适合怀旧、文艺向的生活记录内容。", en: "Retro film tones and grainy texture, suitable for nostalgic and literary life record content." }
      },
      {
        name: { zh: "美食特写风格", en: "Food Close-up Style" },
        description: { zh: "类似《舌尖上的中国》的美食拍摄风格，暖光、细节拉满，能突出食物的食欲感。", en: "Food shooting style similar to A Bite of China, with warm light and full details to highlight appetites." }
      }
    ]
  },
  industrial: {
    label: { zh: "意大利工业风格", en: "Italian Industrial" },
    icon: "Factory",
    styles: [
      {
        name: { zh: "意式极简工业风格", en: "Italian Minimalist Industrial" },
        description: { zh: "干净利落的线条与金属质感结合，强调结构与比例美感，呈现高级简约的工业设计氛围。", en: "Clean lines combined with metal texture, emphasizing structural beauty and proportions." }
      },
      {
        name: { zh: "复古机械工业风格", en: "Retro Mechanical Industrial" },
        description: { zh: "融合旧工厂元素与机械结构细节，带有岁月感与工业历史气息，适合复古与硬核主题。", en: "Fuses old factory elements with mechanical structural details, with a sense of time and industrial history." }
      },
      {
        name: { zh: "现代轻奢工业风格", en: "Modern Luxury Industrial" },
        description: { zh: "在工业基础上融入轻奢材质与精致灯光，呈现高端、精致且具有设计感的空间氛围。", en: "Integrates luxury materials and exquisite lighting on an industrial basis, presenting a high-end atmosphere." }
      },
      {
        name: { zh: "工业科技融合风格", en: "Industrial Tech Fusion Style" },
        description: { zh: "将工业结构与未来科技元素结合，突出金属、光效与功能性的融合，适合科技与未来主题。", en: "Combines industrial structures with futuristic tech elements, highlighting the fusion of metal and light effects." }
      },
      {
        name: { zh: "工业空间场景风格", en: "Industrial Space Scene Style" },
        description: { zh: "强调开放空间、裸露结构与大尺度场景构建，适合展示建筑空间与环境氛围。", en: "Emphasizes open spaces, exposed structures, and large-scale scene construction." }
      },
      {
        name: { zh: "简约抽象风格", en: "Minimalist Abstract Style" },
        description: { zh: "以极简几何形态与抽象线条为核心，弱化具象装饰，突出纯粹的结构美感与留白意境，适合现代艺术、概念设计及实验性视觉表达。", en: "Core of minimalist geometric forms and abstract lines, highlighting pure structural beauty and mood." }
      }
    ]
  },
  saudi: {
    label: { zh: "中东沙特风格", en: "Middle Eastern Saudi" },
    icon: "Landmark",
    styles: [
      {
        name: { zh: "奢华宫廷风格", en: "Luxury Palace Style" },
        description: { zh: "金色装饰、复杂纹样与大理石材质结合，呈现富丽堂皇的宫廷视觉效果。", en: "Golden decorations, complex patterns and marble materials, presenting a magnificent palace visual effect." }
      },
      {
        name: { zh: "沙漠现代风格", en: "Modern Desert Style" },
        description: { zh: "融合沙漠色系与现代建筑设计，强调光影与空间层次，具有独特地域氛围。", en: "Combines desert color schemes with modern architectural design, emphasizing light and spatial layers." }
      },
      {
        name: { zh: "伊斯兰几何艺术风格", en: "Islamic Geometric Art Style" },
        description: { zh: "以重复几何图案与对称结构为核心，展现传统伊斯兰艺术的秩序与美感。", en: "Centered on repetitive geometric patterns and symmetrical structures, showing traditional Islamic art order." }
      },
      {
        name: { zh: "中东轻奢商业风格", en: "ME Luxury Commercial Style" },
        description: { zh: "结合现代商业设计与中东元素，强调高端材质与视觉冲击力，适合商业展示。", en: "Combines modern commercial design with Middle Eastern elements, emphasizing high-end materials." }
      },
      {
        name: { zh: "绿洲生态未来风格", en: "Oasis Ecological Future Style" },
        description: { zh: "将绿植、水景与未来建筑融合，体现沙特新城市理念与生态科技感。", en: "Fuses green plants, water features and future architecture, reflecting new city concepts." }
      }
    ]
  }
};
