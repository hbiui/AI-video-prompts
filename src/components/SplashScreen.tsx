import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logoImg from '../ico.png';

interface SplashScreenProps {
  onComplete: () => void;
}

const TERMINAL_LINES = [
  "> [系统] 开始初始化引导序列...",
  "> [系统] 正在加载导演引擎协议...",
  "> [AI] 正在建立大模型集群连接...",
  "> [就绪] 系统在线。欢迎使用，导演。"
];

export function SplashScreen({ onComplete }: SplashScreenProps) {
  // Use environment variables or fallbacks
  const envMode = import.meta.env.VITE_SPLASH_MODE || 'glitch';
  const duration = parseInt(import.meta.env.VITE_SPLASH_DURATION || '3000', 10);
  const mediaPath = import.meta.env.VITE_SPLASH_MEDIA_PATH || '';

  const [mode, setMode] = useState<string>(envMode);
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Fallback to glitch if media fails to load or path is empty in media mode
  const handleMediaError = () => {
    console.warn("Splash media failed to load or path is missing. Falling back to glitch mode.");
    setMode('glitch');
  };

  useEffect(() => {
    if (mode === 'media' && !mediaPath) {
      handleMediaError();
    }
  }, [mode, mediaPath]);

  // Main timer logic
  useEffect(() => {
    if (envMode === 'none') {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for exit animation to complete before removing from DOM
      setTimeout(onComplete, 500); 
    }, duration);

    return () => clearTimeout(timer);
  }, [envMode, duration, onComplete]);

  // Typewriter effect for glitch mode
  useEffect(() => {
    if (mode !== 'glitch' || currentLineIndex >= TERMINAL_LINES.length) return;

    const currentLine = TERMINAL_LINES[currentLineIndex];
    if (currentCharIndex < currentLine.length) {
      const typeTimer = setTimeout(() => {
        setTypedLines(prev => {
          const newLines = [...prev];
          if (newLines[currentLineIndex] === undefined) {
             newLines[currentLineIndex] = '';
          }
          newLines[currentLineIndex] += currentLine[currentCharIndex];
          return newLines;
        });
        setCurrentCharIndex(prev => prev + 1);
      }, 30); // Typing speed
      return () => clearTimeout(typeTimer);
    } else {
      const lineTimer = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, 200); // Pause between lines
      return () => clearTimeout(lineTimer);
    }
  }, [mode, currentLineIndex, currentCharIndex]);

  const isVideo = mediaPath.match(/\.(mp4|webm|ogg)$/i);

  if (envMode === 'none') return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-brand-bg flex flex-col items-center justify-center overflow-hidden"
        >
          {mode === 'media' && mediaPath ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {isVideo ? (
                <video
                  src={mediaPath}
                  autoPlay
                  muted
                  playsInline
                  onEnded={() => setIsVisible(false)} // Optionally end earlier if video finishes
                  onError={handleMediaError}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={mediaPath}
                  alt="Splash Screen"
                  onError={handleMediaError}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#050505]">
              {/* Background ambient glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />
              
              {/* Logo / Glow Text */}
              <div className="relative flex flex-col items-center mb-20 text-center">
                <img 
                  src={logoImg} 
                  alt="Logo" 
                  style={{ filter: "var(--logo-filter, hue-rotate(0deg))" }}
                  className="w-20 h-20 mb-6 opacity-80" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="flex flex-col items-center gap-3"
                >
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-[#b2b2b2] glow-breathe-text">
                    AI 视频提示词导演助手
                  </h1>
                  <p className="text-sm md:text-base text-[#b2b2b2]/40 tracking-widest font-mono">
                    Sunell市场部，S06109力荐
                  </p>
                </motion.div>
              </div>

              {/* Terminal Typewriter */}
              <div 
                className="absolute bottom-16 md:bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-start font-mono text-sm md:text-base tracking-widest min-w-[280px]"
                style={{ color: "var(--brand-primary, #00FF00)", opacity: 0.8 }}
              >
                {typedLines.map((line, i) => (
                  <div key={i} className="mb-2 text-xs md:text-sm shadow-sm">{line}</div>
                ))}
                {currentLineIndex < TERMINAL_LINES.length && (
                  <span 
                    className="animate-pulse inline-block w-2.5 h-4 ml-1 align-middle" 
                    style={{ backgroundColor: "var(--brand-primary, #00ff41)" }}
                  />
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
