import React from 'react';
import { Sparkles, Brain, X, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SmartSuggestProps {
  userInput: string;
  suggestedContinuations: string[];
  isSuggesting: boolean;
  showSuggestions: boolean;
  uiLang: string;
  t: any;
  onSuggest: () => void;
  onClose: () => void;
  onApply: (suggestion: string) => void;
}

export const SmartSuggest: React.FC<SmartSuggestProps> = ({
  userInput,
  suggestedContinuations,
  isSuggesting,
  showSuggestions,
  uiLang,
  t,
  onSuggest,
  onClose,
  onApply
}) => {
  if (userInput.trim().length < 5 && !showSuggestions) return null;

  return (
    <div className="absolute bottom-2 right-2 z-50 flex flex-col items-end gap-2 px-1 pb-1">
      <AnimatePresence>
        {showSuggestions && suggestedContinuations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="w-[450px] max-w-[80vw] bg-brand-surface border border-brand-border rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 space-y-3 mb-2"
          >
            <div className="flex items-center justify-between border-b border-brand-border pb-2 mb-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-brand-primary" />
                <span className="text-sm font-black uppercase tracking-widest text-brand-primary">
                  {uiLang === 'zh' ? '智慧灵感建议' : 'SMART SUGGESTIONS'}
                </span>
              </div>
              <button onClick={onClose} className="text-muted hover:text-brand-text">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {suggestedContinuations.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onApply(suggestion)}
                  className="w-full text-left p-3 rounded-lg bg-brand-bg hover:bg-brand-primary/10 border border-transparent hover:border-brand-primary/30 transition-all group"
                >
                  <p className="text-sm text-dim group-hover:text-main leading-relaxed">
                    {suggestion}
                  </p>
                </button>
              ))}
            </div>
            
            <div className="flex justify-center pt-2">
              <button 
                onClick={onSuggest}
                disabled={isSuggesting}
                className="text-[10px] font-black uppercase text-brand-primary hover:underline flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${isSuggesting ? 'animate-spin' : ''}`} />
                {uiLang === 'zh' ? '换一批' : 'REFRESH'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSuggestions && userInput.trim().length >= 5 && (
        <motion.button
          layoutId="suggestButton"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSuggest}
          className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 border border-brand-primary/30 rounded-full hover:bg-brand-primary/20 transition-all group"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-primary group-hover:animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
            {uiLang === 'zh' ? '智慧补全' : 'SMART SUGGEST'}
          </span>
        </motion.button>
      )}
      
      {isSuggesting && !showSuggestions && (
         <div className="bg-brand-surface/80 backdrop-blur rounded-full px-3 py-1.5 border border-brand-border flex items-center gap-2">
           <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
           <span className="text-[10px] font-black uppercase tracking-widest text-muted">{t.testing}</span>
         </div>
      )}
    </div>
  );
};
