import React, { useState, useRef, useEffect } from "react";
import logoImg from "./ico.png";
import { 
  Video, 
  Image as ImageIcon, 
  Languages, 
  Cpu, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Info,
  Sparkles,
  X,
  Globe,
  History,
  Trash2,
  ExternalLink,
  Layout,
  Plus,
  Settings as SettingsIcon,
  Moon,
  Sun,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Film,
  Clapperboard,
  Timer,
  Wind,
  Target,
  Bird,
  Eye,
  Columns,
  Scissors,
  ArrowLeftRight,
  Link,
  Youtube,
  Flame,
  Upload,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Share2,
  Download,
  Pencil,
  Shapes,
  Palette,
  Camera,
  Layers,
  Factory,
  Landmark,
  Circle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  generateVideoPrompt, 
  reverseVideoPrompt,
  ModelType, 
  LanguageType, 
  PromptResult,
  ImageObject,
  testApiConnection
} from "./services/geminiService";
import { translations, Language, PROMPT_TEMPLATES, PromptTemplate, VISUAL_STYLES } from "./constants";

interface ApiConfig {
  provider: "gemini" | "openai" | "doubao" | "anthropic" | "custom";
  apiKey: string;
  baseUrl?: string;
  modelName?: string;
}

interface CompressionConfig {
  enabled: boolean;
  quality: number;
  maxDimension: number;
  historyCapacity: number;
}

interface HistoryItem {
  id: string;
  timestamp: number;
  userInput: string;
  model: ModelType;
  language: LanguageType;
  technique?: string;
  visualStyle?: string;
  totalDuration?: number;
  images: ImageObject[];
  result: PromptResult;
}

function SortableImage({ id, url, keyword, onRemove, onDoubleClick, onKeywordChange, uiLang }: { 
  id: string; 
  url: string; 
  keyword: string; 
  onRemove: () => void; 
  onDoubleClick: () => void;
  onKeywordChange: (val: string) => void;
  uiLang: Language;
  key?: React.Key;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    zIndex: isDragging ? 20 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`relative aspect-square rounded-lg border border-brand-border overflow-hidden group bg-brand-bg flex flex-col cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-2xl ring-2 ring-brand-primary/50' : ''}`}
      {...attributes}
      {...listeners}
      onDoubleClick={onDoubleClick}
    >
      <div className="relative flex-1 min-h-0">
        <img src={url} alt="ref" className="w-full h-full object-cover pointer-events-none" />
        <button 
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-1 right-1 bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <X className="w-2.5 h-2.5 text-white" />
        </button>
      </div>
      <div 
        className="bg-[var(--input-bg)]/90 p-1.5 border-t border-brand-border shrink-0"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <input 
          type="text"
          placeholder={`@${uiLang === "zh" ? "关键词" : "tag"}`}
          value={keyword || ""}
          onChange={(e) => {
            const val = e.target.value.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "");
            onKeywordChange(val);
          }}
          className="w-full bg-transparent text-sm text-muted focus:text-brand-primary outline-none text-center font-mono placeholder:opacity-50"
        />
      </div>
    </div>
  );
}

interface TrendingVideo {
  id: string;
  title: string;
  views: string;
  author: string;
  thumbnail: string;
  url: string;
}

const TRENDING_VIDEOS: TrendingVideo[] = [
  {
    id: "1",
    title: "the door iguana 🦎 #funny #subscribe #comedy #trendingshorts #viralshorts",
    views: "8.7M",
    author: "M.RISKI ALFARES",
    thumbnail: "https://picsum.photos/seed/iguana/120/200",
    url: "https://www.youtube.com/shorts/dQw4w9WgXcQ"
  },
  {
    id: "2",
    title: "ducking save seriously injured cat #duckrescue #cuteanimals #animalrescue 56",
    views: "6.8M",
    author: "SAPNON Ke UDAAN 70",
    thumbnail: "https://picsum.photos/seed/cat_rescue/120/200",
    url: "https://www.youtube.com/shorts/jNQXAC9IVRw"
  },
  {
    id: "3",
    title: "Minecraft but everything is CAKE! 🍰 #minecraft #gaming #shorts",
    views: "12M",
    author: "Dream",
    thumbnail: "https://picsum.photos/seed/minecraft/120/200",
    url: "https://www.youtube.com/shorts/minecraft_cake"
  },
  {
    id: "4",
    title: "Satisfying Hydraulic Press vs Nokia 3310 📱 #satisfying #experiment",
    views: "15M",
    author: "PressChannel",
    thumbnail: "https://picsum.photos/seed/hydraulic/120/200",
    url: "https://www.youtube.com/shorts/nokia_press"
  },
  {
    id: "5",
    title: "Teaching my dog to speak human?! 🐶 #dog #funny #cute",
    views: "4.2M",
    author: "DogWiz",
    thumbnail: "https://picsum.photos/seed/dog_speak/120/200",
    url: "https://www.youtube.com/shorts/dog_human"
  },
  {
    id: "6",
    title: "Making giant bubble with soap 🧼 #diy #bubbles #shorts",
    views: "2.1M",
    author: "DIYKing",
    thumbnail: "https://picsum.photos/seed/bubbles/120/200",
    url: "https://www.youtube.com/shorts/giant_bubble"
  },
  {
    id: "7",
    title: "Unboxing the worlds smallest laptop! 💻 #tech #unboxing",
    views: "5.5M",
    author: "TechReview",
    thumbnail: "https://picsum.photos/seed/tech_unbox/120/200",
    url: "https://www.youtube.com/shorts/small_laptop"
  },
  {
    id: "8",
    title: "How to make a paper airplane that flies 1km ✈️ #origami #tutorial",
    views: "9.1M",
    author: "PaperMaster",
    thumbnail: "https://picsum.photos/seed/paper_plane/120/200",
    url: "https://www.youtube.com/shorts/paper_plane"
  }
];

export default function App() {
  const [uiLang, setUiLang] = useState<Language>("zh");
  const t = translations[uiLang];

  const [userInput, setUserInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelType>("Seedance 2.0");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>("Chinese");
  const [activeTab, setActiveTab] = useState<"director" | "reverse">("director");
  const [reverseMode, setReverseMode] = useState<"youtube" | "url" | "file">("url");
  const [reverseUrl, setReverseUrl] = useState("");
  const [reverseFile, setReverseFile] = useState<string | null>(null);
  const [isReversing, setIsReversing] = useState(false);
  const [reverseSuccess, setReverseSuccess] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<string>("");
  const [selectedVisualStyle, setSelectedVisualStyle] = useState<string>("");
  const [isDurationEnabled, setIsDurationEnabled] = useState(false);
  const [totalDuration, setTotalDuration] = useState<string>("");
  const [isShotCountEnabled, setIsShotCountEnabled] = useState(false);
  const [manualShotCount, setManualShotCount] = useState<string>("3");
  const [showTechniqueDropdown, setShowTechniqueDropdown] = useState(false);
  const [showVisualStyleDropdown, setShowVisualStyleDropdown] = useState(false);
  const [activeVisualStyleCategory, setActiveVisualStyleCategory] = useState<string | null>(null);
  const [hoveredStyleDesc, setHoveredStyleDesc] = useState<{ zh: string; en: string } | null>(null);
  const [images, setImages] = useState<ImageObject[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<PromptResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "success">("idle");
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "success" | "json_success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [reverseError, setReverseError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userTemplates, setUserTemplates] = useState<PromptTemplate[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({ provider: "gemini", apiKey: "" });
  const [providerConfigs, setProviderConfigs] = useState<Record<string, Partial<ApiConfig>>>({
    gemini: { apiKey: "", modelName: "gemini-3.1-pro-preview" },
    openai: { apiKey: "", modelName: "gpt-4o", baseUrl: "https://api.openai.com/v1" },
    doubao: { apiKey: "", modelName: "doubao-seed-2-0-pro-260215", baseUrl: "https://ark.cn-beijing.volces.com/api/v3" },
    anthropic: { apiKey: "", modelName: "claude-3-5-sonnet-20240620", baseUrl: "https://api.anthropic.com/v1" },
    custom: { apiKey: "", modelName: "", baseUrl: "" }
  });
  const [compressionConfig, setCompressionConfig] = useState<CompressionConfig>({
    enabled: true,
    quality: 0.7,
    maxDimension: 800,
    historyCapacity: 10
  });
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showTrending, setShowTrending] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateCategory, setNewTemplateCategory] = useState<string>("cinematic");
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [mentionMenu, setMentionMenu] = useState<{ show: boolean; x: number; y: number; index: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [resultViewTab, setResultViewTab] = useState<"main" | "translation">("main");
  const [logoError, setLogoError] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; message: string | null; success: boolean | null }>({
    loading: false,
    message: null,
    success: null
  });

  const techniqueOptions = [
    { id: "montage", icon: Film },
    { id: "longTake", icon: Clapperboard },
    { id: "timeLapse", icon: Timer },
    { id: "slowMotion", icon: Wind },
    { id: "trackingShot", icon: Target },
    { id: "aerialView", icon: Bird },
    { id: "pov", icon: Eye },
    { id: "splitScreen", icon: Columns },
    { id: "matchCut", icon: Scissors },
    { id: "fadeTransition", icon: ArrowLeftRight },
  ];

  const visualStyleCategoryIcons: Record<string, any> = {
    animation: Shapes,
    artistic: Palette,
    realistic: Camera,
    industrial: Factory,
    saudi: Landmark
  };

  const videoInputRef = useRef<HTMLInputElement>(null);

  // Theme effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
  }, [isDarkMode]);

  // Global drag-drop prevention for Electron
  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('dragover', preventDefault);
    window.addEventListener('drop', preventDefault);
    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, []);

  const handleTestConnection = async () => {
    if (!apiConfig.apiKey) {
      setTestStatus({ loading: false, success: false, message: uiLang === "zh" ? "请输入 API 密钥" : "Please enter API Key" });
      return;
    }

    setTestStatus({ loading: true, success: null, message: t.testing });
    
    const result = await testApiConnection(apiConfig);
    setTestStatus({ loading: false, success: result.success, message: result.success ? t.testSuccess : result.message });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setTestStatus(prev => ({ ...prev, message: null }));
    }, 3000);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("director_history");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // Migrate images to objects if needed
        const migrated = parsed.map((item: any) => ({
          ...item,
          images: (item.images || []).map((img: any) => 
            typeof img === 'string' ? { url: img } : img
          )
        }));
        setHistory(migrated);
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    const savedTemplates = localStorage.getItem("director_user_templates");
    if (savedTemplates) {
      try {
        setUserTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error("Failed to parse user templates", e);
      }
    }

    const savedApiConfig = localStorage.getItem("director_api_config");
    if (savedApiConfig) {
      try {
        setApiConfig(JSON.parse(savedApiConfig));
      } catch (e) {
        console.error("Failed to parse API config", e);
      }
    }

    const savedProviderConfigs = localStorage.getItem("director_provider_configs");
    if (savedProviderConfigs) {
      try {
        setProviderConfigs(JSON.parse(savedProviderConfigs));
      } catch (e) {
        console.error("Failed to parse provider configs", e);
      }
    }

    const savedCompressionConfig = localStorage.getItem("director_compression_config");
    if (savedCompressionConfig) {
      try {
        setCompressionConfig(JSON.parse(savedCompressionConfig));
      } catch (e) {
        console.error("Failed to parse compression config", e);
      }
    }

    // Migration: Compress existing history items if they are too large
    const migrateHistory = async () => {
      const savedHistory = localStorage.getItem("director_history");
      if (!savedHistory) return;
      
      try {
        const parsed = JSON.parse(savedHistory);
        let changed = false;
        const migrated = await Promise.all(parsed.map(async (item: any) => {
          if (item.images && item.images.length > 0) {
            const newImages = await Promise.all(item.images.map(async (img: any) => {
              // If image is large base64, compress it
              if (img.url && img.url.length > 50000) { // > 50KB roughly
                changed = true;
                const compressed = await compressImage(img.url);
                return { ...img, url: compressed };
              }
              return img;
            }));
            return { ...item, images: newImages };
          }
          return item;
        }));

        if (changed) {
          setHistory(migrated.slice(0, compressionConfig.historyCapacity));
        }
      } catch (e) {
        console.error("History migration failed", e);
      }
    };
    migrateHistory();

    // API Key Warning Check
    const checkApiKey = () => {
      const savedApiConfig = localStorage.getItem("director_api_config");
      const config = savedApiConfig ? JSON.parse(savedApiConfig) : null;
      
      if (!config || !config.apiKey) {
        const savedDismissedDate = localStorage.getItem("director_api_warning_dismissed");
        const today = new Date().toDateString();
        if (savedDismissedDate !== today) {
          setShowApiKeyWarning(true);
        }
      }
    };

    // Handle shared prompt from URL
    const hash = window.location.hash;
    if (hash.startsWith("#prompt=")) {
      try {
        const encoded = hash.split("#prompt=")[1];
        const json = decodeURIComponent(escape(atob(encoded)));
        const data = JSON.parse(json);
        if (data.mainPrompt) {
          setResult(data);
          // Small delay to ensure render
          setTimeout(() => {
            if (rightPanelRef.current) {
              rightPanelRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
          // Clear hash to prevent reloading it every time
          window.history.replaceState(null, "", window.location.pathname);
        }
      } catch (e) {
        console.error("Failed to parse shared prompt", e);
      }
    }
    
    // Delay check to ensure UI is ready and doesn't clash with other loads
    const warningTimer = setTimeout(checkApiKey, 2000);
    return () => clearTimeout(warningTimer);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const saveHistory = () => {
      try {
        const historyStr = JSON.stringify(history);
        localStorage.setItem("director_history", historyStr);
      } catch (e) {
        console.error("Failed to save history to localStorage:", e);
        if (e instanceof Error && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          // If quota exceeded, remove oldest items one by one until it fits or history is empty
          if (history.length > 0) {
            // Use a timeout to avoid infinite loop if setting state triggers this again immediately
            setTimeout(() => {
              setHistory(prev => prev.slice(0, -1));
            }, 0);
          }
        }
      }
    };
    saveHistory();
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem("director_user_templates", JSON.stringify(userTemplates));
    } catch (e) {
      console.error("Failed to save templates to localStorage:", e);
    }
  }, [userTemplates]);

  useEffect(() => {
    try {
      localStorage.setItem("director_api_config", JSON.stringify(apiConfig));
    } catch (e) {
      console.error("Failed to save api config to localStorage:", e);
    }
  }, [apiConfig]);

  useEffect(() => {
    try {
      localStorage.setItem("director_provider_configs", JSON.stringify(providerConfigs));
    } catch (e) {
      console.error("Failed to save provider configs to localStorage:", e);
    }
  }, [providerConfigs]);

  useEffect(() => {
    if (!apiConfig.provider) return;
    setProviderConfigs(prev => {
      const current = prev[apiConfig.provider];
      if (current && 
          current.apiKey === apiConfig.apiKey && 
          current.baseUrl === apiConfig.baseUrl && 
          current.modelName === apiConfig.modelName) {
        return prev;
      }
      return {
        ...prev,
        [apiConfig.provider]: {
          apiKey: apiConfig.apiKey,
          baseUrl: apiConfig.baseUrl,
          modelName: apiConfig.modelName
        }
      };
    });
  }, [apiConfig.apiKey, apiConfig.baseUrl, apiConfig.modelName, apiConfig.provider]);

  const handleProviderChange = (newProvider: ApiConfig["provider"]) => {
    const config = providerConfigs[newProvider] || {};
    setApiConfig({
      provider: newProvider,
      apiKey: config.apiKey || "",
      baseUrl: config.baseUrl || (
        newProvider === "openai" ? "https://api.openai.com/v1" :
        newProvider === "anthropic" ? "https://api.anthropic.com/v1" :
        newProvider === "doubao" ? "https://ark.cn-beijing.volces.com/api/v3" : ""
      ),
      modelName: config.modelName || (
        newProvider === "gemini" ? "gemini-3.1-pro-preview" :
        newProvider === "openai" ? "gpt-4o" :
        newProvider === "doubao" ? "doubao-seed-2-0-pro-260215" :
        newProvider === "anthropic" ? "claude-3-5-sonnet-20240620" : ""
      )
    });
  };

  const mirrorRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (mirrorRef.current) {
      mirrorRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const renderFormattedText = (text: string) => {
    // Collect all custom keywords
    const customKeywords = images
      .filter(img => img.keyword)
      .map(img => img.keyword!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    const customRegexPart = customKeywords.length > 0 ? `|(@(${customKeywords.join('|')}))` : '';
    const regex = new RegExp(`(@Image(\\d+))|(<<<image_(\\d+)>>>)${customRegexPart}`, 'g');
    
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      parts.push(text.substring(lastIndex, match.index));
      
      const tag = match[0];
      let imgIdx = -1;

      if (match[2] || match[4]) {
        // Standard tags
        imgIdx = parseInt(match[2] || match[4]) - 1;
      } else if (match[6]) {
        // Custom keyword
        const keyword = match[6];
        imgIdx = images.findIndex(img => img.keyword === keyword);
      }

      const img = imgIdx >= 0 ? images[imgIdx] : null;
      
      if (img) {
        // Calculate visual length for 'ch' unit, accounting for Chinese characters
        const visualLength = tag.split('').reduce((acc, char) => acc + (char.charCodeAt(0) > 127 ? 2 : 1), 0);
        
        parts.push(
          <span 
            key={match.index} 
            className="mention-chip"
            style={{ 
              width: `${visualLength}ch`,
              fontSize: '14px', // Match textarea font size for accurate 'ch' unit
            }}
          >
            {img.url ? (
              <img src={img.url} className="w-3.5 h-3.5 rounded-sm object-cover shrink-0 border border-white/10" alt="" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 shrink-0 opacity-40" />
            )}
            <span className="truncate opacity-90 text-xs leading-none">
              {img.keyword ? `@${img.keyword}` : `${uiLang === "zh" ? "图片" : "Image"}${imgIdx + 1}`}
            </span>
          </span>
        );
      } else {
        parts.push(tag);
      }
      
      lastIndex = regex.lastIndex;
    }
    parts.push(text.substring(lastIndex));
    
    return <>{parts}</>;
  };
  const handleSaveTemplate = () => {
    if (!userInput || !newTemplateName) return;

    if (editingTemplateId) {
      setUserTemplates(prev => prev.map(t => 
        t.id === editingTemplateId 
          ? { ...t, title: { zh: newTemplateName, en: newTemplateName }, category: newTemplateCategory as any } 
          : t
      ));
    } else {
      const newTpl: PromptTemplate = {
        id: Math.random().toString(36).substring(7),
        category: newTemplateCategory as any,
        title: { zh: newTemplateName, en: newTemplateName },
        concept: userInput
      };
      setUserTemplates(prev => [newTpl, ...prev]);
    }

    setNewTemplateName("");
    setEditingTemplateId(null);
    setNewTemplateCategory("cinematic");
    setShowSaveTemplateModal(false);
  };

  const openEditTemplateModal = (tpl: PromptTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setNewTemplateName(tpl.title[uiLang] || tpl.title.zh);
    setNewTemplateCategory(tpl.category);
    setEditingTemplateId(tpl.id);
    setShowSaveTemplateModal(true);
  };

  const deleteUserTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserTemplates(prev => prev.filter(t => t.id !== id));
  };

  // Generation stages logic
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setGenerationStage(0);
      interval = setInterval(() => {
        setGenerationStage(prev => (prev < 3 ? prev + 1 : prev));
      }, 2000);
    } else {
      setGenerationStage(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const getStageText = () => {
    switch (generationStage) {
      case 0: return t.stageAnalyzing;
      case 1: return t.stageStructuring;
      case 2: return t.stageOptimizing.replace("{model}", selectedModel);
      case 3: return t.stageFinalizing;
      default: return t.thinking;
    }
  };

  // Image compression utility
  const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(base64Str);
    });
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(file => file.type.startsWith("image/"));
    const newImages: ImageObject[] = [];
    let processedCount = 0;

    if (fileArray.length === 0) return;

    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === 'string') {
          let finalUrl = reader.result;
          if (compressionConfig.enabled) {
            finalUrl = await compressImage(
              reader.result, 
              compressionConfig.maxDimension, 
              compressionConfig.maxDimension, 
              compressionConfig.quality
            );
          }
          newImages.push({ 
            id: Math.random().toString(36).substring(7),
            url: finalUrl,
            keyword: "" 
          });
        }
        processedCount++;
        if (processedCount === fileArray.length) {
          setImages(prev => [...prev, ...newImages].slice(0, 9));
        }
      };
      reader.onerror = () => {
        processedCount++;
        console.error("FileReader error for file:", file.name);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const selectionStart = e.target.selectionStart;
    setUserInput(value);

    // Detect @ mention
    const lastChar = value[selectionStart - 1];
    if (lastChar === "@") {
      const { offsetLeft, offsetTop } = getCursorXY(e.target, selectionStart);
      const rect = e.target.getBoundingClientRect();
      setMentionMenu({
        show: true,
        x: rect.left + offsetLeft,
        y: rect.top + offsetTop + 20,
        index: selectionStart
      });
    } else {
      setMentionMenu(null);
    }
  };

  // Helper to get cursor coordinates in textarea
  const getCursorXY = (el: HTMLTextAreaElement, cursorIndex: number) => {
    const { offsetLeft, offsetTop } = el;
    const style = window.getComputedStyle(el);
    const div = document.createElement("div");
    const copyStyle = Array.from(style);
    copyStyle.forEach((prop) => {
      div.style.setProperty(prop, style.getPropertyValue(prop));
    });
    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.width = el.clientWidth + "px";
    div.style.height = "auto";
    
    const textBeforeCursor = el.value.substring(0, cursorIndex);
    div.textContent = textBeforeCursor;
    const span = document.createElement("span");
    span.textContent = el.value.substring(cursorIndex) || ".";
    div.appendChild(span);
    document.body.appendChild(div);
    
    const { offsetLeft: spanLeft, offsetTop: spanTop } = span;
    document.body.removeChild(div);
    return { 
      offsetLeft: spanLeft, 
      offsetTop: spanTop - el.scrollTop 
    };
  };

  const insertMention = (imageIndex: number | "new" | string) => {
    if (!mentionMenu || !textareaRef.current) return;

    if (imageIndex === "new") {
      fileInputRef.current?.click();
      setMentionMenu(null);
      return;
    }

    const imgIdx = typeof imageIndex === 'number' ? imageIndex : 0;
    const tag = selectedModel === "Seedance 2.0" 
      ? `@Image${imgIdx + 1}` 
      : `<<<image_${imgIdx + 1}>>>`;
    
    if (typeof imageIndex === 'string') {
      // If it's a custom keyword, we still use the @keyword format
      // but the logic below will handle it
    }
    
    const tagToInsert = typeof imageIndex === 'string' ? `@${imageIndex}` : tag;
    const before = userInput.substring(0, Math.max(0, mentionMenu.index - 1));
    const after = userInput.substring(mentionMenu.index);
    const newValue = before + tagToInsert + " " + after;
    
    setUserInput(newValue);
    setMentionMenu(null);
    
    // Refocus and set cursor
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = before.length + tagToInsert.length + 1;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleReversePrompt = async () => {
    if (reverseMode === "file" && !reverseFile) {
      setReverseError(t.dropVideo);
      return;
    }
    if ((reverseMode === "youtube" || reverseMode === "url") && !reverseUrl) {
      setReverseError(reverseMode === "youtube" ? t.pasteYoutube : t.pasteVideoUrl);
      return;
    }

    setIsReversing(true);
    setReverseError(null);
    setReverseSuccess(false);

    try {
      const source = reverseMode === "file" 
        ? { type: 'file' as const, data: reverseFile! }
        : { type: 'url' as const, data: reverseUrl };
      
      const result = await reverseVideoPrompt(source, selectedLanguage, apiConfig.apiKey ? apiConfig : undefined);
      
      setUserInput(result);
      setReverseSuccess(true);
      setTimeout(() => {
        setActiveTab("director");
        setReverseSuccess(false);
      }, 2000);
    } catch (err: any) {
      setReverseError(err.message || t.errorFailed);
    } finally {
      setIsReversing(false);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setReverseFile(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (customInput?: string) => {
    if (customInput) {
      setUserInput(customInput);
    }
    const inputToUse = customInput || userInput;
    if (!inputToUse && images.length === 0) {
      setError(t.errorInput);
      return;
    }

    setIsGenerating(true);
    setResultViewTab('main');
    setError(null);
    if (rightPanelRef.current) {
      rightPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    try {
      const res = await generateVideoPrompt(
        inputToUse, 
        selectedModel, 
        selectedLanguage, 
        images, 
        apiConfig.apiKey ? apiConfig : undefined,
        selectedTechnique ? t.techniques[selectedTechnique as keyof typeof t.techniques] : undefined,
        isDurationEnabled && totalDuration ? parseInt(totalDuration, 10) : undefined,
        isShotCountEnabled && manualShotCount ? parseInt(manualShotCount, 10) : undefined,
        selectedVisualStyle || undefined
      );
      setResult(res);
      
      // Save to history
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        userInput: inputToUse,
        model: selectedModel,
        language: selectedLanguage,
        technique: selectedTechnique,
        visualStyle: selectedVisualStyle,
        totalDuration: isDurationEnabled && totalDuration ? parseInt(totalDuration) : undefined,
        images: [...images],
        result: res
      };
      setHistory(prev => [newItem, ...prev].slice(0, compressionConfig.historyCapacity));
    } catch (err: any) {
      setError(err.message || t.errorFailed);
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!navigator.clipboard) {
      // Fallback for non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      document.body.removeChild(textArea);
      return;
    }

    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const handleShare = (targetResult?: PromptResult) => {
    const dataToShare = targetResult || result;
    if (!dataToShare) return;
    try {
      const data = {
        mainPrompt: dataToShare.mainPrompt,
        translation: dataToShare.translation,
        parameters: dataToShare.parameters,
        suggestions: dataToShare.suggestions
      };
      const json = JSON.stringify(data);
      const encoded = btoa(unescape(encodeURIComponent(json)));
      const url = `${window.location.origin}${window.location.pathname}#prompt=${encoded}`;
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          setShareStatus("success");
          setTimeout(() => setShareStatus("idle"), 3000);
        });
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setShareStatus("success");
        setTimeout(() => setShareStatus("idle"), 3000);
      }
    } catch (e) {
      console.error("Failed to generate share URL", e);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const model = result.parameters.model;
    const content = `[${model} AI Video Prompt]\n\n` + 
                    `### Main Prompt (${result.parameters.language}):\n${result.mainPrompt}\n\n` +
                    `### Translation / Reference:\n${result.translation}\n\n` +
                    `### Video Parameters:\n` +
                    `- Model: ${result.parameters.model}\n` +
                    `- Duration: ${result.parameters.duration}\n` +
                    `${result.parameters.motionIntensity ? `- Motion Intensity: ${result.parameters.motionIntensity}\n` : ''}` +
                    `- Shots: ${result.parameters.shotCount}\n\n` +
                    `--- Generated by AI Video Prompt Director ---`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `video_prompt_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    setDownloadStatus("success");
    setTimeout(() => setDownloadStatus("idle"), 3000);
  };

  const handleDownloadJson = () => {
    if (!result) return;
    
    // Prepare a clean object for API automation
    const exportData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      project: "AI Video Prompt Director",
      parameters: {
        model: result.parameters.model,
        language: result.parameters.language,
        duration: result.parameters.duration,
        motionIntensity: result.parameters.motionIntensity || null,
        shotCount: result.parameters.shotCount,
        technique: result.parameters.technique || null,
        style: result.parameters.style || null
      },
      content: {
        mainPrompt: result.mainPrompt,
        translation: result.translation,
        concept: result.parameters.concept
      },
      assets: images.map(img => ({
        id: img.id,
        keyword: img.keyword || ""
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `video_prompt_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    setDownloadStatus("json_success");
    setTimeout(() => setDownloadStatus("idle"), 3000);
  };

  const toggleUiLang = () => {
    setUiLang(prev => prev === "zh" ? "en" : "zh");
  };

  const handleClearAll = () => {
    setUserInput("");
    setSelectedModel("Seedance 2.0");
    setSelectedLanguage("Chinese");
    setSelectedTechnique("");
    setSelectedVisualStyle("");
    setIsDurationEnabled(false);
    setTotalDuration("");
    setImages([]);
    setResult(null);
    setError(null);
    setReverseUrl("");
    setReverseFile(null);
    setReverseError(null);
    setReverseSuccess(false);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setUserInput(item.userInput);
    setSelectedModel(item.model);
    setSelectedLanguage(item.language);
    setSelectedTechnique(item.technique || "");
    setSelectedVisualStyle(item.visualStyle || "");
    setIsDurationEnabled(!!item.totalDuration);
    setTotalDuration(item.totalDuration ? item.totalDuration.toString() : "");
    // Ensure images are objects and have IDs
    const normalizedImages = (item.images || []).map(img => {
      const base = typeof img === 'string' ? { url: img } : img;
      return { ...base, id: base.id || Math.random().toString(36).substring(7) };
    });
    setImages(normalizedImages);
    setResult(item.result);
    setShowHistory(false);
    if (rightPanelRef.current) {
      rightPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const importPromptToInput = (prompt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserInput(prompt);
    setShowHistory(false);
    if (leftPanelRef.current) {
      leftPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const useTemplate = (template: PromptTemplate) => {
    setUserInput(template.concept);
    setShowTemplates(false);
    if (leftPanelRef.current) {
      leftPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-7xl mx-auto gap-8">
      {/* Mention Menu */}
      <AnimatePresence>
        {mentionMenu && mentionMenu.show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            style={{ left: mentionMenu.x, top: mentionMenu.y }}
            className="fixed z-[100] w-64 bg-brand-surface border border-brand-border rounded-lg shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-3 bg-[var(--input-bg)]/40 border-b border-brand-border">
              <span className="text-sm font-bold text-muted uppercase tracking-widest">{t.mentionTitle}</span>
            </div>
            <div className="max-h-64 overflow-y-auto p-1">
              <button
                onClick={() => insertMention("new")}
                className="w-full flex items-center gap-3 p-2 hover:bg-brand-border/30 rounded transition-colors text-left"
              >
                <div className="w-8 h-8 rounded bg-brand-border/50 flex items-center justify-center">
                  <X className="w-4 h-4 rotate-45" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{t.createSubject}</span>
                  <span className="text-sm text-muted">{t.addFromLocal}</span>
                </div>
              </button>
              
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => insertMention(img.keyword || idx)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-brand-border/30 rounded transition-colors text-left"
                >
                  <img src={img.url} className="w-8 h-8 rounded object-cover border border-brand-border" alt="" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {img.keyword ? `@${img.keyword}` : `${t.imageLabel}${idx + 1}`}
                    </span>
                    {img.keyword && (
                      <span className="text-xs text-dim uppercase tracking-tighter">
                        {t.imageLabel}{idx + 1}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {logoError ? (
              <div className="w-11 h-11 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg border border-brand-border/20">
                <Video className="text-black w-6 h-6" />
              </div>
            ) : (
              <img 
                src={logoImg} 
                className="w-11 h-11 rounded-xl shadow-lg border border-brand-border/10 object-cover" 
                alt="Logo"
                onError={() => {
                  console.warn("Local logo failed to load, using fallback icon.");
                  setLogoError(true);
                }}
              />
            )}
            <h1 className="text-2xl font-bold tracking-tighter uppercase">{t.title}</h1>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-full hover:bg-brand-border/50 transition-colors text-brand-primary"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={toggleUiLang}
              className="p-1.5 rounded-full hover:bg-brand-border/50 transition-colors text-brand-primary"
              title={uiLang === "zh" ? "Switch to English" : "切换到中文"}
            >
              <Languages className="w-5 h-5" />
            </button>
          </div>
          <p className="text-muted text-base max-w-md">
            {t.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowTemplates(!showTemplates)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-colors text-sm font-bold ${
              showTemplates ? "bg-brand-primary text-black border-brand-primary" : "bg-brand-surface border-brand-border text-main hover:border-brand-primary"
            }`}
          >
            <Layout className="w-3 h-3" />
            {t.templates}
          </button>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-colors text-sm font-bold ${
              showHistory ? "bg-brand-primary text-black border-brand-primary" : "bg-brand-surface border-brand-border text-main hover:border-brand-primary"
            }`}
          >
            <History className="w-3 h-3" />
            {t.history}
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-colors text-sm font-bold ${
              showSettings ? "bg-brand-primary text-black border-brand-primary" : "bg-brand-surface border-brand-border text-main hover:border-brand-primary"
            }`}
          >
            <SettingsIcon className="w-3 h-3" />
            {t.settings}
          </button>
          <div className="flex items-center gap-4 text-sm font-mono text-muted">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              {t.systemOnline}
            </div>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 relative">
        {/* Settings Drawer Overlay */}
        <AnimatePresence>
          {showSettings && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSettings(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-surface border-l border-brand-border z-50 flex flex-col shadow-2xl"
              >
                <div className="console-header p-4 border-b border-brand-border flex items-center justify-between bg-[var(--input-bg)]/50">
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4 text-brand-primary" />
                    <span className="label-micro">{t.apiConfig}</span>
                  </div>
                  <button onClick={() => setShowSettings(false)} className="text-muted hover:text-main">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted uppercase tracking-widest">{t.apiProvider}</label>
                      <select 
                        value={apiConfig.provider}
                        onChange={(e) => handleProviderChange(e.target.value as any)}
                        className="w-full bg-[var(--input-bg)] border border-brand-border rounded-lg px-4 py-3 text-base focus:border-brand-primary outline-none transition-all appearance-none"
                      >
                        <option value="gemini">Google Gemini</option>
                        <option value="openai">OpenAI ChatGPT</option>
                        <option value="doubao">火山引擎豆包 (Doubao)</option>
                        <option value="anthropic">Anthropic Claude</option>
                        <option value="custom">Custom (OpenAI Format)</option>
                      </select>
                    </div>

                    <div className="p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-lg space-y-2">
                      <p className="text-sm text-muted leading-relaxed">
                        {t.providerInfo[apiConfig.provider]}
                      </p>
                      <a 
                        href={
                          apiConfig.provider === "gemini" ? "https://aistudio.google.com/app/apikey" :
                          apiConfig.provider === "openai" ? "https://platform.openai.com/api-keys" :
                          apiConfig.provider === "doubao" ? "https://www.volcengine.com/product/doubao" :
                          "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-text hover:underline inline-flex items-center gap-1 font-bold"
                      >
                        {t.applyLink} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted uppercase tracking-widest">{t.apiKey}</label>
                      <input 
                        type="password"
                        value={apiConfig.apiKey || ""}
                        onChange={(e) => setApiConfig({...apiConfig, apiKey: e.target.value})}
                        placeholder="sk-..."
                        className="w-full bg-[var(--input-bg)] border border-brand-border rounded-lg px-4 py-3 text-base focus:border-brand-primary outline-none transition-all"
                      />
                    </div>

                    {apiConfig.provider !== "gemini" && (
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-muted uppercase tracking-widest">{t.apiBaseUrl}</label>
                        <input 
                          type="text"
                          value={apiConfig.baseUrl || ""}
                          onChange={(e) => setApiConfig({...apiConfig, baseUrl: e.target.value})}
                          placeholder="https://api.openai.com/v1"
                          className="w-full bg-[var(--input-bg)] border border-brand-border rounded-lg px-4 py-3 text-base focus:border-brand-primary outline-none transition-all"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-muted uppercase tracking-widest">{t.apiModelName}</label>
                        <button 
                          onClick={handleTestConnection}
                          disabled={testStatus.loading}
                          className={`text-xs font-bold px-2 py-0.5 rounded border transition-all ${
                            testStatus.success === true ? 'bg-green-500/10 border-green-500/50 text-green-500' :
                            testStatus.success === false ? 'bg-red-500/10 border-red-500/50 text-red-500' :
                            'bg-brand-primary/10 border-brand-primary/30 text-brand-text hover:bg-brand-primary hover:text-black'
                          }`}
                        >
                          {testStatus.loading ? t.testing : t.testConnection}
                        </button>
                      </div>
                      <input 
                        type="text"
                        value={apiConfig.modelName || ""}
                        onChange={(e) => setApiConfig({...apiConfig, modelName: e.target.value})}
                        placeholder={
                          apiConfig.provider === "gemini" ? "gemini-3.1-pro-preview" :
                          apiConfig.provider === "openai" ? "gpt-4o" :
                          apiConfig.provider === "doubao" ? "doubao-seed-2-0-pro-260215" :
                          apiConfig.provider === "anthropic" ? "claude-3-5-sonnet-20240620" :
                          "model-name"
                        }
                        className="w-full bg-[var(--input-bg)] border border-brand-border rounded-lg px-4 py-3 text-base focus:border-brand-primary outline-none transition-all"
                      />
                      
                      {apiConfig.provider === "gemini" && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {[
                            { name: "3.1 Pro", id: "gemini-3.1-pro-preview" },
                            { name: "3.1 Flash Lite", id: "gemini-3.1-flash-lite-preview" },
                            { name: "3 Flash", id: "gemini-3-flash-preview" },
                            { name: "3 Pro", id: "gemini-3-pro-preview" }
                          ].map(m => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setApiConfig({...apiConfig, modelName: m.id})}
                              className={`text-xs px-2 py-1 rounded border transition-all ${
                                apiConfig.modelName === m.id 
                                  ? "bg-brand-primary/20 border-brand-primary text-brand-primary" 
                                  : "bg-brand-surface border-brand-border text-muted hover:border-brand-primary/50"
                              }`}
                            >
                              {m.name}
                            </button>
                          ))}
                        </div>
                      )}

                      {apiConfig.provider === "openai" && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {[
                            { name: "GPT-4o", id: "gpt-4o" },
                            { name: "GPT-4o Mini", id: "gpt-4o-mini" },
                            { name: "o1 Preview", id: "o1-preview" },
                            { name: "o1 Mini", id: "o1-mini" },
                            { name: "GPT-4 Turbo", id: "gpt-4-turbo" }
                          ].map(m => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setApiConfig({...apiConfig, modelName: m.id})}
                              className={`text-xs px-2 py-1 rounded border transition-all ${
                                apiConfig.modelName === m.id 
                                  ? "bg-brand-primary/20 border-brand-primary text-brand-primary" 
                                  : "bg-brand-surface border-brand-border text-muted hover:border-brand-primary/50"
                              }`}
                            >
                              {m.name}
                            </button>
                          ))}
                        </div>
                      )}

                      {apiConfig.provider === "anthropic" && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {[
                            { name: "Claude 3.5 Sonnet", id: "claude-3-5-sonnet-20240620" },
                            { name: "Claude 3.5 Haiku", id: "claude-3-5-haiku-20241022" },
                            { name: "Claude 3 Opus", id: "claude-3-opus-20240229" },
                            { name: "Claude 3 Sonnet", id: "claude-3-sonnet-20240229" },
                            { name: "Claude 3 Haiku", id: "claude-3-haiku-20240307" }
                          ].map(m => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setApiConfig({...apiConfig, modelName: m.id})}
                              className={`text-xs px-2 py-1 rounded border transition-all ${
                                apiConfig.modelName === m.id 
                                  ? "bg-brand-primary/20 border-brand-primary text-brand-primary" 
                                  : "bg-brand-surface border-brand-border text-muted hover:border-brand-primary/50"
                              }`}
                            >
                              {m.name}
                            </button>
                          ))}
                        </div>
                      )}
                      {apiConfig.provider === "doubao" && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {[
                            { name: "Seed 2.0 Pro", id: "doubao-seed-2-0-pro-260215" },
                            { name: "Seed 2.0 Lite", id: "doubao-seed-2-0-lite-260215" },
                            { name: "Seed 2.0 Mini", id: "doubao-seed-2-0-mini-260215" }
                          ].map(m => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setApiConfig({...apiConfig, modelName: m.id})}
                              className={`text-xs px-2 py-1 rounded border transition-all ${
                                apiConfig.modelName === m.id 
                                  ? "bg-brand-primary/20 border-brand-primary text-brand-primary" 
                                  : "bg-brand-surface border-brand-border text-muted hover:border-brand-primary/50"
                              }`}
                            >
                              {m.name}
                            </button>
                          ))}
                        </div>
                      )}
                      {testStatus.message && (
                        <p className={`text-xs mt-1 font-medium animate-in fade-in slide-in-from-top-1 duration-200 ${testStatus.success ? 'text-green-500' : 'text-red-500'}`}>
                          {testStatus.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Image Compression Settings */}
                  <div className="space-y-4 pt-4 border-t border-brand-border">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-muted uppercase tracking-widest">{t.imageCompression}</label>
                      <button 
                        onClick={() => setCompressionConfig({...compressionConfig, enabled: !compressionConfig.enabled})}
                        className={`w-10 h-5 rounded-full transition-colors relative ${compressionConfig.enabled ? 'bg-brand-primary' : 'bg-brand-border'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${compressionConfig.enabled ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>

                    {compressionConfig.enabled && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-sm font-bold text-muted uppercase tracking-widest">{t.compressionQuality}</label>
                            <span className="text-sm font-mono text-brand-primary">{Math.round(compressionConfig.quality * 100)}%</span>
                          </div>
                          <input 
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.05"
                            value={compressionConfig.quality}
                            onInput={(e: React.FormEvent<HTMLInputElement>) => {
                              const val = (e.target as HTMLInputElement).valueAsNumber;
                              setCompressionConfig(prev => ({...prev, quality: val}));
                            }}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setCompressionConfig(prev => ({...prev, quality: val}));
                            }}
                            className="w-full accent-brand-primary cursor-pointer"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-sm font-bold text-muted uppercase tracking-widest">{t.maxDimension}</label>
                            <span className="text-sm font-mono text-brand-primary">{compressionConfig.maxDimension}px</span>
                          </div>
                          <input 
                            type="range"
                            min="200"
                            max="4000"
                            step="50"
                            value={compressionConfig.maxDimension}
                            onInput={(e: React.FormEvent<HTMLInputElement>) => {
                              const val = (e.target as HTMLInputElement).valueAsNumber;
                              setCompressionConfig(prev => ({...prev, maxDimension: val}));
                            }}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setCompressionConfig(prev => ({...prev, maxDimension: val}));
                            }}
                            className="w-full accent-brand-primary cursor-pointer"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-sm font-bold text-muted uppercase tracking-widest">{t.historyCapacity}</label>
                            <span className="text-sm font-mono text-brand-primary">{compressionConfig.historyCapacity}</span>
                          </div>
                          <input 
                            type="range"
                            min="5"
                            max="50"
                            step="1"
                            value={compressionConfig.historyCapacity}
                            onInput={(e: React.FormEvent<HTMLInputElement>) => {
                              const val = (e.target as HTMLInputElement).valueAsNumber;
                              setCompressionConfig(prev => ({...prev, historyCapacity: val}));
                            }}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setCompressionConfig(prev => ({...prev, historyCapacity: val}));
                            }}
                            className="w-full accent-brand-primary cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-dim leading-relaxed">
                      {t.compressionTip}
                    </p>
                    <p className="text-sm text-dim leading-relaxed">
                      {t.historyCapacityTip}
                    </p>
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={() => {
                        localStorage.setItem("director_api_config", JSON.stringify(apiConfig));
                        localStorage.setItem("director_compression_config", JSON.stringify(compressionConfig));
                        setShowSettings(false);
                      }}
                      className="w-full py-3 rounded-lg bg-brand-primary text-black text-sm font-bold hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {t.saveSettings}
                    </button>
                    <p className="text-sm text-dim text-center mt-4">
                      {t.apiTip}
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Templates Drawer Overlay */}
        <AnimatePresence>
          {showTemplates && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowTemplates(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-surface border-l border-brand-border z-50 flex flex-col shadow-2xl"
              >
                <div className="console-header p-4 border-b border-brand-border flex items-center justify-between bg-[var(--input-bg)]/50">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-brand-primary" />
                    <span className="label-micro">{t.templates}</span>
                  </div>
                  <button onClick={() => setShowTemplates(false)} className="text-muted hover:text-main">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* User Templates */}
                  {userTemplates.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest px-1">{t.userTemplates}</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {userTemplates.map(tpl => (
                          <div key={tpl.id} className="relative group">
                            <button
                              onClick={() => useTemplate(tpl)}
                              className="w-full bg-brand-primary/5 border border-brand-primary/20 rounded-lg p-4 hover:border-brand-primary transition-all text-left overflow-hidden"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-brand-text">
                                  {tpl.title.zh}
                                </h4>
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                                  {t.templateCategories[tpl.category as keyof typeof t.templateCategories]}
                                </span>
                              </div>
                              <p className="text-sm text-muted line-clamp-2">
                                {tpl.concept}
                              </p>
                            </button>
                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => openEditTemplateModal(tpl, e)}
                                className="p-1.5 text-dim hover:text-brand-primary transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => deleteUserTemplate(tpl.id, e)}
                                className="p-1.5 text-dim hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.entries(t.templateCategories).map(([catKey, catLabel]) => (
                    <div key={catKey} className="space-y-3">
                      <h3 className="text-sm font-bold text-dim uppercase tracking-widest px-1">{catLabel}</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {PROMPT_TEMPLATES.filter(tpl => tpl.category === catKey).map(tpl => (
                          <button
                            key={tpl.id}
                            onClick={() => useTemplate(tpl)}
                            className="group bg-[var(--input-bg)]/40 border border-brand-border rounded-lg p-4 hover:border-brand-primary/50 transition-all text-left relative overflow-hidden"
                          >
                            <h4 className="text-sm font-bold text-main group-hover:text-brand-primary mb-2 transition-colors">
                              {uiLang === "zh" ? tpl.title.zh : tpl.title.en}
                            </h4>
                            <p className="text-sm text-muted line-clamp-2">
                              {tpl.concept}
                            </p>
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="w-3 h-3 text-brand-primary" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* History Drawer Overlay */}
        <AnimatePresence>
          {showHistory && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowHistory(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-surface border-l border-brand-border z-50 flex flex-col shadow-2xl"
              >
                <div className="console-header p-4 border-b border-brand-border flex items-center justify-between bg-[var(--input-bg)]/50">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-brand-primary" />
                    <span className="label-micro">{t.history}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {history.length > 0 && (
                      <button 
                        onClick={() => {
                          if (window.confirm(uiLang === "zh" ? "确定要清空所有历史记录吗？" : "Are you sure you want to clear all history?")) {
                            setHistory([]);
                          }
                        }}
                        className="text-sm font-bold text-red-500 hover:bg-red-500/10 px-2 py-1 rounded transition-colors"
                      >
                        {t.clearHistory}
                      </button>
                    )}
                    <button onClick={() => setShowHistory(false)} className="text-muted hover:text-main">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-dim gap-4">
                      <History className="w-12 h-12" />
                      <p className="font-mono text-sm uppercase tracking-widest">{t.noHistory}</p>
                    </div>
                  ) : (
                    history.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => loadFromHistory(item)}
                        className="group bg-[var(--input-bg)]/40 border border-brand-border rounded-lg p-4 hover:border-brand-primary/50 transition-all cursor-pointer relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-mono text-muted">
                            {new Date(item.timestamp).toLocaleString(uiLang === "zh" ? "zh-CN" : "en-US")}
                          </span>
                          <button 
                            onClick={(e) => deleteFromHistory(item.id, e)}
                            className="text-dim hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-sm text-main line-clamp-2 mb-3 font-medium">
                          {item.userInput || (uiLang === "zh" ? "[图片输入]" : "[Image Input]")}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-text border border-brand-primary/20">
                              {item.model}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-brand-bg text-muted border border-brand-border">
                              {item.language}
                            </span>
                          </div>
                          <button 
                            onClick={(e) => importPromptToInput(item.result.mainPrompt, e)}
                            className="flex items-center gap-1 text-xs font-bold text-brand-text hover:bg-brand-primary hover:text-black px-2 py-1 rounded border border-brand-primary/30 transition-all"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            {t.importPrompt}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleShare(item.result); }}
                            className="flex items-center gap-1 text-xs font-bold text-muted hover:text-brand-text px-2 py-1 rounded border border-brand-border transition-all"
                            title={t.sharePrompt}
                          >
                            <Share2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-3 h-3 text-brand-primary" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="lg:col-span-5 flex flex-col gap-4 relative z-20">
          {/* Tab Switcher */}
          <div className="flex bg-brand-surface border border-brand-border rounded p-1 self-start">
            <button
              onClick={() => { setActiveTab("director"); setError(null); setReverseError(null); }}
              className={`px-4 py-1.5 rounded text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "director" 
                  ? "bg-brand-primary text-black shadow-sm" 
                  : "text-muted hover:text-main"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              {t.directorTab}
            </button>
            <button
              onClick={() => { setActiveTab("reverse"); setError(null); setReverseError(null); }}
              className={`px-4 py-1.5 rounded text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "reverse" 
                  ? "bg-brand-primary text-black shadow-sm" 
                  : "text-muted hover:text-main"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              {t.reverseTab}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "director" ? (
              <motion.div 
                key="director-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                ref={leftPanelRef} 
                className="flex flex-col gap-6 pb-4"
              >
            <section className="console-panel flex flex-col shrink-0">
            <div className="console-header">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-primary" />
                <span className="label-micro">{t.inputConfig}</span>
              </div>
              <button 
                onClick={handleClearAll}
                className="flex items-center gap-1 text-sm font-bold text-muted hover:text-red-500 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                {t.clearAll}
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              {/* Model Selection */}
              <div className="space-y-3">
                <label className="label-micro">{t.targetModel}</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Seedance 2.0", "Kling 3.0 Omni"] as ModelType[]).map(model => (
                    <button
                      key={model}
                      onClick={() => setSelectedModel(model)}
                      className={`py-3 px-4 rounded border text-base font-bold transition-all ${
                        selectedModel === model 
                          ? "bg-brand-primary text-black border-brand-primary" 
                          : "bg-brand-surface text-muted border-brand-border hover:bg-brand-border/50"
                      }`}
                    >
                      {t.modelNames[model]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-3">
                <label className="label-micro">{t.outputLanguage}</label>
                <div className="flex gap-2">
                  {(["Chinese", "English"] as LanguageType[]).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`flex-1 py-2 px-4 rounded border text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                        selectedLanguage === lang 
                          ? "bg-brand-primary text-black border-brand-primary" 
                          : "bg-brand-surface text-muted border-brand-border hover:bg-brand-border/50"
                      }`}
                    >
                      <Languages className="w-3 h-3" />
                      {lang === "Chinese" ? t.chinesePrompt : t.englishPrompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Technique Selection */}
              <div className="space-y-3 relative">
                <div className="flex items-center gap-2">
                  <label className="label-micro">{t.videoTechnique}</label>
                  <span className="text-sm text-dim font-mono">{t.optional}</span>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowTechniqueDropdown(!showTechniqueDropdown)}
                    className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 flex items-center justify-between hover:border-brand-primary/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      {selectedTechnique ? (
                        <>
                          {React.createElement(techniqueOptions.find(opt => opt.id === selectedTechnique)?.icon || Film, { className: "w-4 h-4 text-brand-primary" })}
                          <span className="text-base font-bold text-main">
                            {t.techniques[selectedTechnique as keyof typeof t.techniques]}
                          </span>
                        </>
                      ) : (
                        <span className="text-base text-dim">{t.selectTechnique}</span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted group-hover:text-brand-primary transition-transform ${showTechniqueDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showTechniqueDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-[60]" 
                          onClick={() => setShowTechniqueDropdown(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-brand-surface border border-brand-border rounded-xl shadow-2xl z-[70] overflow-hidden py-1"
                        >
                          <button
                            onClick={() => {
                              setSelectedTechnique("");
                              setShowTechniqueDropdown(false);
                            }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-brand-primary/10 transition-colors text-left"
                          >
                            <div className="w-4 h-4 rounded-full border border-brand-border" />
                            <span className="text-sm font-bold text-dim">{t.clearAll}</span>
                          </button>
                          <div className="h-[1px] bg-brand-border mx-2 my-1" />
                          {techniqueOptions.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => {
                                setSelectedTechnique(opt.id);
                                setShowTechniqueDropdown(false);
                              }}
                              className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-brand-primary/10 transition-colors text-left ${
                                selectedTechnique === opt.id ? 'bg-brand-primary/5 text-brand-primary' : 'text-main'
                              }`}
                            >
                              <opt.icon className={`w-4 h-4 ${selectedTechnique === opt.id ? 'text-brand-primary' : 'text-muted'}`} />
                              <span className="text-sm font-bold">
                                {t.techniques[opt.id as keyof typeof t.techniques]}
                              </span>
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Visual Style Selection */}
              <div className="space-y-3 relative">
                <div className="flex items-center gap-2">
                  <label className="label-micro">{t.visualStyle}</label>
                  <span className="text-sm text-dim font-mono">{t.optional}</span>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowVisualStyleDropdown(!showVisualStyleDropdown)}
                    className="w-full bg-brand-surface border border-brand-border rounded-lg px-4 py-3 flex items-center justify-between hover:border-brand-primary/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      {selectedVisualStyle ? (
                        <>
                          <Sparkles className="w-4 h-4 text-brand-primary" />
                          <span className="text-base font-bold text-main">
                            {(() => {
                              for (const cat of Object.values(VISUAL_STYLES)) {
                                const style = cat.styles.find(s => s.name.zh === selectedVisualStyle || s.name.en === selectedVisualStyle);
                                if (style) return style.name[uiLang];
                              }
                              return selectedVisualStyle;
                            })()}
                          </span>
                        </>
                      ) : (
                        <span className="text-base text-dim">{t.selectStyle}</span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted group-hover:text-brand-primary transition-transform ${showVisualStyleDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showVisualStyleDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-[60]" 
                          onClick={() => {
                            setShowVisualStyleDropdown(false);
                            setActiveVisualStyleCategory(null);
                            setHoveredStyleDesc(null);
                          }}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full left-0 mt-2 bg-brand-surface border border-brand-border rounded-xl shadow-2xl z-[70] flex flex-col h-[400px] w-max overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex flex-1 min-h-0">
                            {/* Category Sidebar */}
                            <div className="w-[170px] border-r border-brand-border py-2 bg-brand-primary/[0.02] flex flex-col overflow-y-auto custom-scrollbar">
                              <button
                                  onClick={() => {
                                    setSelectedVisualStyle("");
                                    setShowVisualStyleDropdown(false);
                                    setActiveVisualStyleCategory(null);
                                  }}
                                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-brand-primary/10 transition-colors text-left"
                                >
                                  <Circle className="w-4 h-4 text-muted" />
                                  <span className="text-sm font-bold text-dim">{t.clearAll}</span>
                                </button>
                                <div className="h-[1px] bg-brand-border mx-2 my-1" />
                                {Object.entries(VISUAL_STYLES).map(([key, cat]) => {
                                  const Icon = visualStyleCategoryIcons[key as keyof typeof visualStyleCategoryIcons] || Shapes;
                                  return (
                                    <button
                                      key={key}
                                      onMouseEnter={() => setActiveVisualStyleCategory(key)}
                                      className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left group ${
                                        activeVisualStyleCategory === key ? 'bg-brand-primary/20 text-brand-primary' : 'hover:bg-brand-primary/10 text-main'
                                      }`}
                                    >
                                      <Icon className={`w-4 h-4 ${activeVisualStyleCategory === key ? 'text-brand-primary' : 'text-muted'}`} />
                                      <span className="text-sm font-bold">{cat.label[uiLang]}</span>
                                    </button>
                                  );
                                })}
                            </div>

                            {/* Styles Panel */}
                            <div className="w-[210px] overflow-y-auto py-2 bg-black/[0.01] custom-scrollbar">
                              {activeVisualStyleCategory ? (
                                <div className="grid grid-cols-1 gap-1 px-2">
                                  {VISUAL_STYLES[activeVisualStyleCategory as keyof typeof VISUAL_STYLES].styles.map((style) => (
                                    <div key={style.name.zh} className="relative group/item">
                                      <button
                                        onMouseEnter={() => setHoveredStyleDesc(style.description)}
                                        onMouseLeave={() => setHoveredStyleDesc(null)}
                                        onClick={() => {
                                          setSelectedVisualStyle(style.name.zh);
                                          setShowVisualStyleDropdown(false);
                                          setActiveVisualStyleCategory(null);
                                          setHoveredStyleDesc(null);
                                        }}
                                        className={`w-full px-4 py-2.5 rounded-lg text-left transition-all ${
                                          selectedVisualStyle === style.name.zh 
                                            ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                                            : 'hover:bg-brand-primary/10 text-main'
                                        }`}
                                      >
                                        <span className="text-sm font-medium">{style.name[uiLang]}</span>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="h-full flex flex-col items-center justify-center text-dim opacity-50 space-y-2">
                                   <Sparkles className="w-8 h-8" />
                                   <p className="text-sm">{t.selectStyle}</p>
                                </div>
                              )}
                            </div>

                            {/* Description Panel (Conditionally rendered) */}
                            <AnimatePresence>
                              {hoveredStyleDesc && (
                                <motion.div
                                  initial={{ width: 0, opacity: 0 }}
                                  animate={{ width: 260, opacity: 1 }}
                                  exit={{ width: 0, opacity: 0 }}
                                  transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                                  className="bg-brand-bg/40 flex flex-col relative overflow-hidden border-l border-brand-border"
                                >
                                  <div className="w-[260px] p-6 h-full flex flex-col relative">
                                    <motion.div
                                      initial={{ opacity: 0, x: 10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.05 }}
                                      className="flex flex-col gap-4 relative z-10"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                                          <Info className="w-4 h-4 text-brand-primary" />
                                        </div>
                                        <h4 className="text-sm font-black text-brand-primary uppercase tracking-[0.2em] line-clamp-1">
                                          {uiLang === 'zh' ? '风格详情' : 'Style Details'}
                                        </h4>
                                      </div>
                                      <div className="h-[1px] bg-brand-border/50 w-full" />
                                      <p className="text-sm leading-relaxed text-main/90 font-medium">
                                        {hoveredStyleDesc[uiLang]}
                                      </p>
                                    </motion.div>
                                    
                                    {/* Decorative blur circle */}
                                    <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Total Video Duration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="label-micro">{t.totalDuration}</label>
                    <span className="text-sm text-dim font-mono">{t.optional}</span>
                  </div>
                  <button
                    onClick={() => setIsDurationEnabled(!isDurationEnabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isDurationEnabled ? 'bg-brand-primary' : 'bg-brand-border'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isDurationEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {isDurationEnabled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 bg-brand-surface border border-brand-border rounded-lg px-3 py-2 focus-within:border-brand-primary transition-all">
                        <Timer className="w-4 h-4 text-muted" />
                        <input
                          type="number"
                          value={totalDuration || ""}
                          onChange={(e) => setTotalDuration(e.target.value)}
                          placeholder={t.durationPlaceholder}
                          className="flex-1 bg-transparent border-none outline-none text-base text-main font-mono"
                          min="1"
                        />
                        <span className="text-sm text-muted font-bold">{t.durationUnit}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Manual Shot Count */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="label-micro">{t.shotCount}</label>
                    <span className="text-sm text-dim font-mono">{t.optional}</span>
                  </div>
                  <button
                    onClick={() => setIsShotCountEnabled(!isShotCountEnabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isShotCountEnabled ? 'bg-brand-primary' : 'bg-brand-border'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isShotCountEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {isShotCountEnabled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 bg-brand-surface border border-brand-border rounded-lg px-3 py-2 focus-within:border-brand-primary transition-all">
                        <Film className="w-4 h-4 text-muted" />
                        <select
                          value={manualShotCount}
                          onChange={(e) => setManualShotCount(e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none text-base text-main font-mono appearance-none"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                            <option key={n} value={n.toString()} className="bg-brand-surface text-main">
                              {n} {t.shotsUnit}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-muted pointer-events-none" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Creative Input */}
              <div className="space-y-3 flex flex-col">
                <div className="flex items-center justify-between">
                  <label className="label-micro">{t.creativeConcept}</label>
                  {userInput && (
                    <button 
                      onClick={() => {
                        setNewTemplateName("");
                        setEditingTemplateId(null);
                        setNewTemplateCategory("cinematic");
                        setShowSaveTemplateModal(true);
                      }}
                      className="text-sm text-brand-text hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      {t.saveAsTemplate}
                    </button>
                  )}
                </div>
                <div className="mention-container bg-[var(--input-bg)] border border-brand-border rounded focus-within:border-brand-primary transition-colors overflow-hidden">
                  <div 
                    ref={mirrorRef}
                    className="mention-mirror"
                  >
                    {renderFormattedText(userInput)}
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={userInput || ""}
                    onChange={handleTextareaChange}
                    onScroll={handleScroll}
                    placeholder={t.placeholder}
                    className="mention-textarea relative z-10"
                    style={{ height: '220px', minHeight: '100px', maxHeight: '900px' }}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="label-micro">{t.referenceAssets} ({images.length}/9)</label>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-brand-text hover:underline flex items-center gap-1"
                  >
                    <ImageIcon className="w-3 h-3" />
                    {t.addImages}
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                />
                
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="relative"
                >
                  {images.length === 0 ? (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full py-10 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 ${
                        isDragging 
                          ? "border-brand-primary bg-brand-primary/10 text-brand-text" 
                          : "border-brand-border bg-[var(--input-bg)]/20 text-dim hover:border-brand-primary/50 hover:text-muted"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-brand-border/30 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold uppercase tracking-widest">{t.dropImages}</p>
                        <p className="text-sm opacity-60 mt-1">
                          {uiLang === 'zh' ? '支持拖拽或点击上传 (最多9张)' : 'Drag & drop or click to upload (Max 9)'}
                        </p>
                      </div>
                    </button>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext 
                        items={images}
                        strategy={rectSortingStrategy}
                      >
                        <div className="grid grid-cols-5 gap-2">
                          {images.map((img) => (
                            <SortableImage 
                              key={img.id}
                              id={img.id}
                              url={img.url}
                              keyword={img.keyword || ""}
                              uiLang={uiLang}
                              onRemove={() => removeImage(img.id)}
                              onDoubleClick={() => {
                                setPreviewImage(img.url);
                                setZoomLevel(1);
                              }}
                              onKeywordChange={(val) => {
                                setImages(prev => prev.map((item) => 
                                  item.id === img.id ? { ...item, keyword: val } : item
                                ));
                              }}
                            />
                          ))}
                          {images.length < 9 && (
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className={`aspect-square rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center gap-1 ${
                                isDragging 
                                  ? "border-brand-primary bg-brand-primary/10 text-brand-text" 
                                  : "border-brand-border bg-[var(--input-bg)]/20 text-dim hover:border-brand-primary/50 hover:text-muted"
                              }`}
                            >
                              <Plus className="w-5 h-5" />
                              <span className="text-xs font-bold uppercase">{t.addImages}</span>
                            </button>
                          )}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm font-mono bg-red-500/10 p-2 border border-red-500/20 rounded">
                  {error}
                </div>
              )}

              <div
                className={`btn-primary w-full py-4 flex items-center justify-center gap-2 ${isGenerating ? "cursor-default opacity-100" : "cursor-pointer"}`}
                onClick={() => !isGenerating && handleGenerate()}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-3">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{t.generating}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsGenerating(false);
                      }}
                      className="ml-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded text-sm border border-red-500/30 transition-all font-bold"
                    >
                      {t.stop}
                    </button>
                  </div>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {t.generateBtn}
                  </>
                )}
              </div>
            </div>
          </section>
        </motion.div>
      ) : (
            <motion.div 
              key="reverse-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-6 pb-4"
            >
              <section className="console-panel flex flex-col shrink-0">
                <div className="console-header">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-brand-primary" />
                    <span className="label-micro">{t.videoReverseTitle}</span>
                  </div>
                  <button 
                    onClick={handleClearAll}
                    className="flex items-center gap-1 text-sm font-bold text-muted hover:text-red-500 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {t.clearAll}
                  </button>
                </div>
                
                <div className="p-6 flex flex-col gap-8">
                  {/* Mode Switcher */}
                  <div className="flex bg-brand-surface border border-brand-border rounded p-1">
                    {(["youtube", "url", "file"] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setReverseMode(mode)}
                        className={`flex-1 py-2 rounded text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                          reverseMode === mode 
                            ? "bg-brand-border text-main shadow-sm" 
                            : "text-muted hover:text-dim"
                        }`}
                      >
                        {mode === "youtube" && <Youtube className="w-3.5 h-3.5" />}
                        {mode === "url" && <Link className="w-3.5 h-3.5" />}
                        {mode === "file" && <Upload className="w-3.5 h-3.5" />}
                        {t[mode as keyof typeof t] as string}
                      </button>
                    ))}
                  </div>

                  {/* Input Area */}
                  <div className="space-y-4">
                    {reverseMode === "file" ? (
                      <div 
                        onClick={() => videoInputRef.current?.click()}
                        className="aspect-video rounded-xl border-2 border-dashed border-brand-border flex flex-col items-center justify-center gap-4 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all cursor-pointer group relative overflow-hidden"
                      >
                        {reverseFile ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-surface">
                            <Video className="w-12 h-12 text-brand-primary mb-2" />
                            <span className="text-sm font-bold text-main">视频已就绪 / Video Ready</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setReverseFile(null); }}
                              className="mt-4 px-3 py-1 bg-red-500/10 text-red-500 text-sm font-bold rounded hover:bg-red-500 hover:text-white transition-all"
                            >
                              移除 / Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-brand-surface rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Upload className="w-8 h-8 text-muted group-hover:text-brand-primary" />
                            </div>
                            <div className="text-center">
                              <p className="text-base font-bold text-main mb-1">{t.uploadFile}</p>
                              <p className="text-sm text-dim">{t.dropVideo}</p>
                            </div>
                          </>
                        )}
                        <input 
                          type="file" 
                          ref={videoInputRef} 
                          onChange={handleVideoUpload} 
                          accept="video/*" 
                          className="hidden" 
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label className="label-micro">{reverseMode === "youtube" ? "YouTube URL" : "Video URL"}</label>
                        <div className="flex items-center gap-3 bg-brand-surface border border-brand-border rounded px-4 py-3 focus-within:border-brand-primary transition-all relative">
                          <div className="flex items-center gap-2 pr-3 border-r border-brand-border group">
                            {reverseMode === "youtube" ? (
                              <div className="relative">
                                <button
                                  onClick={() => setShowTrending(!showTrending)}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all whitespace-nowrap active:scale-95 ${
                                    showTrending 
                                      ? "bg-brand-primary text-black" 
                                      : "hover:bg-brand-border/30 text-muted hover:text-dim"
                                  }`}
                                >
                                  <Flame className={`w-3.5 h-3.5 ${showTrending ? "text-black" : "text-red-500 animate-pulse"}`} />
                                  <span className="text-sm font-bold">{t.trending}</span>
                                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showTrending ? "rotate-180" : ""}`} />
                                </button>

                                <AnimatePresence>
                                  {showTrending && (
                                    <>
                                      <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setShowTrending(false)}
                                        className="fixed inset-0 z-[120]"
                                      />
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute left-0 top-full mt-2 w-80 max-h-[480px] bg-brand-surface border border-brand-border rounded-xl shadow-2xl z-[130] overflow-hidden flex flex-col"
                                      >
                                        <div className="p-4 border-b border-brand-border bg-brand-primary/5">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Flame className="w-4 h-4 text-red-500" />
                                            <span className="text-sm font-bold text-main">{t.trendingTitle}</span>
                                          </div>
                                          <p className="text-xs text-muted">{t.trendingSubtitle}</p>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                          {TRENDING_VIDEOS.map((video) => (
                                            <button
                                              key={video.id}
                                              onClick={() => {
                                                setReverseUrl(video.url);
                                                setShowTrending(false);
                                              }}
                                              className="w-full flex gap-3 p-2 rounded-lg hover:bg-brand-border/20 transition-all text-left group"
                                            >
                                              <div className="w-16 h-24 rounded-md overflow-hidden shrink-0 border border-brand-border/50 bg-brand-bg relative">
                                                <img 
                                                  src={video.thumbnail} 
                                                  alt={video.title} 
                                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                  referrerPolicy="no-referrer"
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                              </div>
                                              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                <p className="text-xs font-bold text-main line-clamp-2 leading-relaxed group-hover:text-brand-primary transition-colors">
                                                  {video.title}
                                                </p>
                                                <div className="space-y-0.5">
                                                  <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                    <span className="text-[10px] text-muted font-bold tracking-tight">{video.views} {t.views}</span>
                                                  </div>
                                                  <p className="text-[10px] text-dim truncate font-medium">{video.author}</p>
                                                </div>
                                              </div>
                                            </button>
                                          ))}
                                        </div>
                                      </motion.div>
                                    </>
                                  )}
                                </AnimatePresence>
                              </div>
                            ) : (
                              reverseMode === "youtube" ? <Youtube className="w-4 h-4 text-red-500" /> : <Link className="w-4 h-4 text-brand-primary" />
                            )}
                          </div>
                          <input
                            type="text"
                            value={reverseUrl || ""}
                            onChange={(e) => setReverseUrl(e.target.value)}
                            placeholder={reverseMode === "youtube" ? t.pasteYoutube : t.pasteVideoUrl}
                            className="flex-1 bg-transparent border-none outline-none text-base text-main"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Language Selection for Reverse */}
                  <div className="space-y-3">
                    <label className="label-micro">{t.outputLanguage}</label>
                    <div className="flex gap-2">
                      {(["Chinese", "English"] as LanguageType[]).map(lang => (
                        <button
                          key={lang}
                          onClick={() => setSelectedLanguage(lang)}
                          className={`flex-1 py-2 px-4 rounded border text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                            selectedLanguage === lang 
                              ? "bg-brand-primary text-black border-brand-primary" 
                              : "bg-brand-surface text-muted border-brand-border hover:bg-brand-border/50"
                          }`}
                        >
                          <Languages className="w-3 h-3" />
                          {lang === "Chinese" ? "中文" : "English"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tip Area */}
                  <div className="flex flex-col gap-2 p-3 bg-brand-primary/5 border border-brand-primary/10 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-muted leading-relaxed">
                        {t.reverseTip}
                      </p>
                    </div>
                    {apiConfig.provider !== "gemini" && (
                      <div className="flex items-start gap-2 pt-2 border-t border-brand-primary/10">
                        <Sparkles className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-brand-text/80 leading-relaxed">
                          {uiLang === "zh" 
                            ? "提示：视频反推功能在 Gemini 模型下效果最佳。当前模型可能无法处理视频文件。" 
                            : "Tip: Video reverse works best with Gemini models. Current provider may not support direct video file analysis."}
                        </p>
                      </div>
                    )}
                  </div>

                  {reverseError && (
                    <div className="text-red-500 text-sm font-mono bg-red-500/10 p-2 border border-red-500/20 rounded">
                      {reverseError}
                    </div>
                  )}
                </div>

                <div className="p-6 pt-0 mt-auto">
                  <button
                    onClick={handleReversePrompt}
                    disabled={isReversing || reverseSuccess}
                    className={`w-full py-4 rounded-xl font-black text-base tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg ${
                      isReversing || reverseSuccess
                        ? "bg-brand-border text-muted cursor-not-allowed"
                        : "bg-brand-primary text-black hover:scale-[1.02] active:scale-[0.98] shadow-brand-primary/20"
                    }`}
                  >
                    {isReversing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t.reversing}
                      </>
                    ) : reverseSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        {t.reverseSuccess}
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-5 h-5" />
                        {t.reverseBtn}
                      </>
                    )}
                  </button>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

        {/* Right Column: Output Panel */}
        <div ref={rightPanelRef} className="lg:col-span-7 flex flex-col gap-6">
          <section className="console-panel flex-1 flex flex-col relative">
            <div className="console-header">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                  <span className="label-micro">{t.optimizedPrompt}</span>
                </div>
                {result && (
                  <div className="flex bg-brand-surface/50 rounded p-0.5 border border-brand-border">
                    <button 
                      onClick={() => setResultViewTab('main')}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        resultViewTab === 'main' 
                          ? "bg-brand-primary text-black" 
                          : "text-muted hover:text-dim"
                      }`}
                    >
                      {t.scriptPreview}
                    </button>
                    <button 
                      onClick={() => setResultViewTab('translation')}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        resultViewTab === 'translation' 
                          ? "bg-brand-primary text-black" 
                          : "text-muted hover:text-dim"
                      }`}
                    >
                      {t.translationRef}
                    </button>
                  </div>
                )}
              </div>
              {result && (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      const content = resultViewTab === 'main' 
                        ? (result.parameters.language === selectedLanguage ? result.mainPrompt : result.translation)
                        : (result.parameters.language === selectedLanguage ? result.translation : result.mainPrompt);
                      copyToClipboard(content);
                    }}
                    className="flex items-center gap-1 text-sm font-bold text-muted hover:text-brand-text transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? t.copied : t.copyPrompt}
                  </button>
                  <button 
                    onClick={handleDownload}
                    className={`flex items-center gap-1 text-sm font-bold transition-colors ${downloadStatus === 'success' ? 'text-green-500' : 'text-muted hover:text-brand-text'}`}
                  >
                    {downloadStatus === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                    {downloadStatus === 'success' ? t.copied : t.downloadTxt}
                  </button>
                  <button 
                    onClick={handleDownloadJson}
                    className={`flex items-center gap-1 text-sm font-bold transition-colors ${downloadStatus === 'json_success' ? 'text-green-500' : 'text-muted hover:text-brand-text'}`}
                  >
                    {downloadStatus === 'json_success' ? <CheckCircle2 className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
                    {downloadStatus === 'json_success' ? t.copied : t.downloadJson}
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto relative">
              <AnimatePresence mode="wait">
                {!result && !isGenerating ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center gap-6 opacity-40 select-none grayscale"
                  >
                    <div className="w-20 h-20 rounded-full bg-brand-border/20 flex items-center justify-center border border-brand-border/30">
                      <Video className="w-10 h-10 text-muted" />
                    </div>
                    <div className="space-y-2">
                       <p className="font-mono text-base tracking-[0.3em] text-dim uppercase font-bold">{t.awaitingInput}</p>
                       <p className="text-sm text-muted opacity-60 tracking-wider">
                         {uiLang === 'zh' ? '暂无生成指令' : 'No instructions yet'}
                       </p>
                    </div>
                  </motion.div>
                ) : isGenerating ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center gap-8"
                  >
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      {/* Outer rotating ring */}
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-2 border-brand-primary/10 border-t-brand-primary rounded-full"
                      />
                      {/* Inner pulsing core */}
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-16 h-16 bg-brand-primary/20 rounded-full blur-xl"
                      />
                      <Video className="w-8 h-8 text-brand-primary relative z-10" />
                      
                      {/* Progress dots */}
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className={`absolute w-1.5 h-1.5 rounded-full ${i <= generationStage ? "bg-brand-primary" : "bg-brand-border"}`}
                          style={{
                            transform: `rotate(${i * 90}deg) translateY(-64px)`
                          }}
                        />
                      ))}
                    </div>

                    <div className="space-y-4 text-center max-w-xs">
                      <div className="flex flex-col gap-1">
                        <AnimatePresence mode="wait">
                          <motion.p 
                            key={generationStage}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="font-mono text-base text-brand-text uppercase tracking-wider"
                          >
                            {getStageText()}
                          </motion.p>
                        </AnimatePresence>
                        <div className="w-48 h-1 bg-brand-border/30 rounded-full mx-auto overflow-hidden">
                          <motion.div 
                            className="h-full bg-brand-primary"
                            initial={{ width: "0%" }}
                            animate={{ width: `${(generationStage + 1) * 25}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-dim font-mono uppercase tracking-[0.2em]">
                        Director Engine Processing...
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {/* Content Area */}
                    <div className="space-y-4">
                      <div className="bg-[var(--input-bg)] p-6 rounded border border-brand-border font-mono text-base leading-relaxed whitespace-pre-wrap selection:bg-brand-primary selection:text-black min-h-[300px]">
                        {resultViewTab === 'main' ? (
                          result?.parameters.language === selectedLanguage 
                            ? result?.mainPrompt 
                            : result?.translation
                        ) : (
                          result?.parameters.language === selectedLanguage 
                            ? result?.translation 
                            : result?.mainPrompt
                        )}
                      </div>
                    </div>

                    {/* Parameters Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-[var(--input-bg)] p-3 rounded border border-brand-border">
                        <p className="label-micro mb-1">{t.model}</p>
                        <p className="text-sm font-bold text-brand-text">{result?.parameters.model}</p>
                      </div>
                      <div className="bg-[var(--input-bg)] p-3 rounded border border-brand-border">
                        <p className="label-micro mb-1">{t.duration}</p>
                        <p className="text-sm font-bold">{result?.parameters.duration}</p>
                      </div>
                      {result?.parameters.motionIntensity && (
                        <div className="bg-[var(--input-bg)] p-3 rounded border border-brand-border">
                          <p className="label-micro mb-1">{t.intensity}</p>
                          <p className="text-sm font-bold">{result?.parameters.motionIntensity}</p>
                        </div>
                      )}
                      <div className="bg-[var(--input-bg)] p-3 rounded border border-brand-border">
                        <p className="label-micro mb-1">{t.shots}</p>
                        <p className="text-sm font-bold">{result?.parameters.shotCount}</p>
                      </div>
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-primary" />
                        <label className="label-micro">{t.fineTune}</label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {result?.suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleGenerate(`${userInput}\n\n[${s.category}] ${s.text}`)}
                            className="group flex flex-col items-start p-3 rounded-lg border border-brand-border bg-brand-surface hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left"
                          >
                            <span className="text-xs font-bold uppercase tracking-tighter text-brand-primary mb-1 opacity-70 group-hover:opacity-100">
                              {s.category}
                            </span>
                            <p className="text-sm text-muted group-hover:text-main leading-relaxed">
                              {s.text}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Decorative Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
          </section>

          {/* Tips Section */}
          <section className="bg-brand-primary/5 border border-brand-primary/20 rounded-lg p-4 flex gap-4 items-start">
            <div className="flex flex-col items-center shrink-0 mt-0.5">
              <Info className="w-5 h-5 text-brand-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-brand-text uppercase tracking-wider">{t.proTip}</p>
              <p className="text-sm text-muted leading-relaxed">
                {selectedModel === "Seedance 2.0" ? t.seedanceTip : t.klingTip}
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Save Template Modal */}
      <AnimatePresence>
        {showSaveTemplateModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaveTemplateModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-brand-surface border border-brand-border rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-brand-border bg-[var(--input-bg)]/50 flex items-center justify-between">
                <span className="label-micro">{t.saveAsTemplate}</span>
                <button onClick={() => setShowSaveTemplateModal(false)} className="text-muted hover:text-main">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-widest">{t.templateName}</label>
                  <input 
                    type="text"
                    value={newTemplateName || ""}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder={uiLang === "zh" ? "输入模板名称..." : "Enter template name..."}
                    className="w-full bg-[var(--input-bg)] border border-brand-border rounded-lg px-4 py-3 text-base focus:border-brand-primary outline-none transition-all"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted uppercase tracking-widest">{uiLang === "zh" ? "选择分类" : "Select Category"}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(t.templateCategories).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setNewTemplateCategory(key)}
                        className={`px-3 py-2 rounded-lg border text-sm font-bold transition-all ${
                          newTemplateCategory === key 
                            ? "bg-brand-primary text-black border-brand-primary" 
                            : "bg-brand-surface text-muted border-brand-border hover:bg-brand-border/50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowSaveTemplateModal(false)}
                    className="flex-1 py-2.5 rounded-lg border border-brand-border text-sm font-bold hover:bg-brand-border/30 transition-all"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    onClick={handleSaveTemplate}
                    disabled={!newTemplateName}
                    className="flex-1 py-2.5 rounded-lg bg-brand-primary text-black text-sm font-bold hover:bg-brand-primary/90 disabled:opacity-50 transition-all"
                  >
                    {t.save}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-4 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-mono text-muted">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
            SEEDANCE {t.footerReady}
          </div>
          <div className="flex items-center gap-2 text-sm font-mono text-muted">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
            KLING OMNI {t.footerReady}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-4">
            <p className="text-sm font-mono text-dim">
              {t.footerDesign}
            </p>
          </div>
          <p className="text-sm font-mono text-dim">
            {uiLang === 'zh' ? 'S06109力荐' : 'S06109 Recommended'}
          </p>
        </div>
      </footer>

      {/* API Key Warning Modal */}
      <AnimatePresence>
        {showApiKeyWarning && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-brand-border bg-brand-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-primary" />
                  <span className="text-base font-bold text-brand-text">Sunell市场部为视频创作而设计</span>
                </div>
                <button onClick={() => setShowApiKeyWarning(false)} className="text-muted hover:text-main transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-3 text-center">
                  <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SettingsIcon className="w-8 h-8 text-brand-primary animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-main">
                    {uiLang === 'zh' ? '未检测到 API 密钥' : 'API Key Not Found'}
                  </h3>
                  <p className="text-base text-muted leading-relaxed">
                    {uiLang === 'zh' 
                      ? '为了获得最佳的提示词优化体验，请先前往设置页面填入您的 API 密钥。' 
                      : 'To get the best prompt optimization experience, please go to settings and enter your API key first.'}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      setShowApiKeyWarning(false);
                      setShowSettings(true);
                    }}
                    className="w-full py-3.5 rounded-xl bg-brand-primary text-black text-base font-bold hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    {uiLang === 'zh' ? '立即前往设置' : 'Go to Settings Now'}
                  </button>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowApiKeyWarning(false)}
                      className="flex-1 py-3 rounded-xl border border-brand-border text-sm font-bold text-muted hover:bg-brand-border/30 transition-all"
                    >
                      {uiLang === 'zh' ? '暂时关闭' : 'Close for Now'}
                    </button>
                    <button 
                      onClick={() => {
                        localStorage.setItem("director_api_warning_dismissed", new Date().toDateString());
                        setShowApiKeyWarning(false);
                      }}
                      className="flex-1 py-3 rounded-xl border border-brand-border text-sm font-bold text-muted hover:bg-brand-border/30 transition-all"
                    >
                      {uiLang === 'zh' ? '今日不再提醒' : "Don't remind me today"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* API Key Warning Modal */}
      <AnimatePresence>
        {showApiKeyWarning && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-brand-border bg-brand-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-primary" />
                  <span className="text-base font-bold text-brand-text">Sunell市场部为视频创作而设计</span>
                </div>
                <button onClick={() => setShowApiKeyWarning(false)} className="text-muted hover:text-main transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-3 text-center">
                  <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SettingsIcon className="w-8 h-8 text-brand-primary animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-main">
                    {uiLang === 'zh' ? '未检测到 API 密钥' : 'API Key Not Found'}
                  </h3>
                  <p className="text-base text-muted leading-relaxed">
                    {uiLang === 'zh' 
                      ? '为了获得最佳的提示词优化体验，请先前往设置页面填入您的 API 密钥。' 
                      : 'To get the best prompt optimization experience, please go to settings and enter your API key first.'}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      setShowApiKeyWarning(false);
                      setShowSettings(true);
                    }}
                    className="w-full py-3.5 rounded-xl bg-brand-primary text-black text-base font-bold hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    {uiLang === 'zh' ? '立即前往设置' : 'Go to Settings Now'}
                  </button>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowApiKeyWarning(false)}
                      className="flex-1 py-3 rounded-xl border border-brand-border text-sm font-bold text-muted hover:bg-brand-border/30 transition-all"
                    >
                      {uiLang === 'zh' ? '暂时关闭' : 'Close for Now'}
                    </button>
                    <button 
                      onClick={() => {
                        localStorage.setItem("director_api_warning_dismissed", new Date().toDateString());
                        setShowApiKeyWarning(false);
                      }}
                      className="flex-1 py-3 rounded-xl border border-brand-border text-sm font-bold text-muted hover:bg-brand-border/30 transition-all"
                    >
                      {uiLang === 'zh' ? '今日不再提醒' : "Don't remind me today"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-full max-h-full flex flex-col items-center gap-6"
            >
              <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-black/40 flex items-center justify-center min-w-[300px] min-h-[300px]">
                <motion.img 
                  src={previewImage} 
                  alt="Preview" 
                  animate={{ scale: zoomLevel }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="max-w-full max-h-[70vh] object-contain"
                  onWheel={(e) => {
                    if (e.deltaY < 0) setZoomLevel(prev => Math.min(prev + 0.2, 5));
                    else setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
                  }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                <button 
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                  title={uiLang === 'zh' ? '缩小' : 'Zoom Out'}
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <div className="w-12 text-center font-mono text-sm text-white font-bold">
                  {Math.round(zoomLevel * 100)}%
                </div>
                <button 
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 5))}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                  title={uiLang === 'zh' ? '放大' : 'Zoom In'}
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <div className="w-[1px] h-4 bg-white/20 mx-1" />
                <button 
                  onClick={() => setZoomLevel(1)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                  title={uiLang === 'zh' ? '重置' : 'Reset'}
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <div className="w-[1px] h-4 bg-white/20 mx-1" />
                <button 
                  onClick={() => setPreviewImage(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                  title={uiLang === 'zh' ? '关闭' : 'Close'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-white/40 text-sm font-mono uppercase tracking-widest">
                {uiLang === 'zh' ? '滚动滚轮或使用按钮缩放' : 'Scroll or use buttons to zoom'}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
