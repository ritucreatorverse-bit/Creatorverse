import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Eye, EyeOff, BookOpen, Clock, Heart, Star, ArrowLeft, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Story } from '../types';
import { MOCK_STORIES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

interface ReaderPageProps {
  currentStory: Story | null;
  onSelectStory: (story: Story) => void;
  onBackToExplore: () => void;
  storyRatings: Record<string, { avgRating: number; ratingCount: number; userRating?: number }>;
  onRateStory: (storyId: string, rating: number) => void;
  currentUser?: any;
  onUpdateStoryChapters?: (storyId: string, chapters: any[]) => void;
}

type ReaderTheme = 'midnight' | 'paper' | 'cosmic';
type ReaderFont = 'serif' | 'sans' | 'mono';
type LineHeight = 'snug' | 'relaxed' | 'loose';

export default function ReaderPage({ 
  currentStory, 
  onSelectStory, 
  onBackToExplore, 
  storyRatings, 
  onRateStory,
  currentUser,
  onUpdateStoryChapters
}: ReaderPageProps) {
  const { currentUser: authUser, setOpenAuthModal } = useAuth();
  // If no story is currently loaded, default to the first one
  const story = currentStory || MOCK_STORIES[0];

  const [hoverRating, setHoverRating] = useState<number>(0);

  const [theme, setTheme] = useState<ReaderTheme>('cosmic');
  const [fontFamily, setFontFamily] = useState<ReaderFont>('serif');
  const [fontSize, setFontSize] = useState<number>(18); // default size in px
  const [lineHeight, setLineHeight] = useState<LineHeight>('relaxed');
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Load bookmark on mount or when storyId / authUser changes
  useEffect(() => {
    const key = `creatorverse_bookmark_${authUser?.email || 'guest'}_${story.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const idx = parseInt(stored, 10);
      if (!isNaN(idx) && idx >= 0 && idx < story.chapters.length) {
        setActiveChapterIdx(idx);
        return;
      }
    }
    setActiveChapterIdx(0);
  }, [story.id, authUser]);

  // Save bookmark whenever activeChapterIdx changes
  useEffect(() => {
    const key = `creatorverse_bookmark_${authUser?.email || 'guest'}_${story.id}`;
    localStorage.setItem(key, activeChapterIdx.toString());
  }, [activeChapterIdx, story.id, authUser]);

  // States for live paragraph editing (Editor-exclusive)
  const [editingParaIdx, setEditingParaIdx] = useState<number | null>(null);
  const [editingParaText, setEditingParaText] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Measure scroll progress inside reader container to update progress bar
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const element = containerRef.current;
      const totalHeight = element.scrollHeight - element.clientHeight;
      if (totalHeight === 0) {
        setScrollProgress(0);
      } else {
        const progress = (element.scrollTop / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };

    const element = containerRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      // reset scroll when changing story or chapter
      element.scrollTop = 0;
      setScrollProgress(0);
    }
    return () => {
      if (element) {
        element.removeEventListener('scroll', handleScroll);
      }
    };
  }, [story.id, activeChapterIdx]);

  const activeChapter = story.chapters[activeChapterIdx] || story.chapters[0];

  // Theme styling definitions
  const themeClasses: Record<ReaderTheme, string> = {
    midnight: 'bg-[#09090b] text-[#cbd5e1] border-slate-800',
    paper: 'bg-[#f7f5ed] text-[#2c2014] border-amber-200/60',
    cosmic: 'bg-[#0c0a1e] text-[#e0e2f5] border-purple-950/40',
  };

  const themeInnerClasses: Record<ReaderTheme, string> = {
    midnight: 'bg-[#0e0e11] text-slate-300',
    paper: 'bg-[#faf8f5] text-[#3c3024]',
    cosmic: 'bg-[#120f26] text-slate-100',
  };

  const fontClasses: Record<ReaderFont, string> = {
    serif: 'font-serif Georgia, "Playfair Display", serif',
    sans: 'font-sans "Inter", sans-serif',
    mono: 'font-mono "JetBrains Mono", monospace',
  };

  const lineHeights: Record<LineHeight, string> = {
    snug: 'leading-6',
    relaxed: 'leading-8',
    loose: 'leading-10',
  };

  const handleNextChapter = () => {
    if (activeChapterIdx < story.chapters.length - 1) {
      setActiveChapterIdx(prev => prev + 1);
    }
  };

  const handlePrevChapter = () => {
    if (activeChapterIdx > 0) {
      setActiveChapterIdx(prev => prev - 1);
    }
  };

  return (
    <div 
      id="reader-root" 
      className={`min-h-screen transition-colors duration-500 flex flex-col md:flex-row relative overflow-hidden ${themeClasses[theme]}`}
    >
      
      {/* Distraction-Free Scroll Navigation / Header Indicator (only in Focus Mode) */}
      {focusMode && (
        <div 
          id="focus-progress-header" 
          className="absolute top-0 inset-x-0 h-1.5 z-50 bg-slate-900/50"
        >
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
          <button 
            id="exit-focus-floating"
            onClick={() => setFocusMode(false)}
            className="absolute top-4 right-6 px-3 py-1.5 rounded-full bg-slate-950/85 border border-slate-850 text-white text-[11px] font-semibold tracking-wide shadow-lg hover:bg-slate-900 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <EyeOff className="w-3.5 h-3.5" />
            Exit Focus Mode
          </button>
        </div>
      )}

      {/* Main Reading Canvas Column (Scrolls independently) */}
      <div 
        id="reading-canvas"
        ref={containerRef}
        className="flex-1 overflow-y-auto h-screen px-6 py-8 sm:py-16 md:px-12 flex flex-col items-center justify-between"
      >
        <div className="w-full max-w-2xl">
          {/* Header row (hidden during focus mode) */}
          {!focusMode && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-12 border-b pb-4 border-current/10"
            >
              <button
                id="reader-back-btn"
                onClick={onBackToExplore}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400 hover:text-purple-300 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Explore Worlds
              </button>

              <div className="flex items-center gap-4">
                <button
                  id="reader-settings-btn"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-lg border border-current/15 hover:bg-current/5 cursor-pointer transition-colors ${showSettings ? 'bg-current/10' : ''}`}
                  title="Configure reading aesthetic"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  id="reader-focus-btn"
                  onClick={() => setFocusMode(true)}
                  className="px-3.5 py-1.5 rounded-lg border border-current/15 hover:bg-current/5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Hide side controls & read"
                >
                  <Eye className="w-4 h-4" />
                  Focus Mode
                </button>
              </div>
            </motion.div>
          )}

          {/* Reader Core Content and Progress */}
          <div id="story-reader-core">
            {!focusMode && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
              >
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-[10px] uppercase font-mono tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold">
                    {story.category}
                  </span>
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {story.readTime}
                  </span>
                  
                  {/* Header mini rating display */}
                  <div className="flex items-center gap-1 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-md">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {(storyRatings[story.id]?.avgRating || story.avgRating || 4.5).toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({storyRatings[story.id]?.ratingCount || story.ratingCount || 50})
                    </span>
                  </div>
                </div>
                
                <h1 className="text-3xl sm:text-5xl font-extrabold font-serif tracking-tight leading-tight select-text text-white">
                  {story.title}
                </h1>

                <div className="flex items-center gap-3 mt-6 pb-6 border-b border-current/10">
                  <img
                    src={story.author.avatar}
                    alt={story.author.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full border border-slate-850"
                  />
                  <div>
                    <span className="text-sm font-semibold text-white block leading-snug">{story.author.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block tracking-wider uppercase">{story.author.role}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Simulated progress indicator at top inside focus mode */}
            {focusMode && (
              <div className="mb-12 text-center text-xs opacity-50 font-mono tracking-widest uppercase">
                {story.title} • {activeChapter.title}
              </div>
            )}

            {/* Dynamic chapter display */}
            <motion.div 
              key={`${story.id}-${activeChapterIdx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              id="story-paragraphs"
              style={{ fontSize: `${fontSize}px` }}
              className={`${fontClasses[fontFamily]} ${lineHeights[lineHeight]} text-justify tracking-wide hyphens-auto mt-6 break-words`}
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-8 italic text-purple-400 border-l-2 border-purple-500/50 pl-4">
                {activeChapter.title}
              </h2>

              {activeChapter.paragraphs.map((para, pIdx) => {
                const isEditingThis = editingParaIdx === pIdx;
                const isEditor = currentUser?.role === 'Editor';
                return (
                  <div key={pIdx} className="group/para relative mb-6">
                    {isEditingThis ? (
                      <div className="p-4 bg-purple-950/20 rounded-lg border border-purple-500/30 space-y-2.5 my-3 text-left">
                        <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-widest block">✏️ LIVE PROOFREADING DESK</span>
                        <textarea
                          value={editingParaText}
                          onChange={(e) => setEditingParaText(e.target.value)}
                          className="w-full bg-[#050510] border border-slate-850 p-3 text-xs sm:text-sm text-slate-100 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30 font-sans leading-relaxed text-left"
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdateStoryChapters) {
                                const newChapters = [...story.chapters];
                                const currentChap = { ...newChapters[activeChapterIdx] };
                                const updatedParas = [...currentChap.paragraphs];
                                updatedParas[pIdx] = editingParaText;
                                currentChap.paragraphs = updatedParas;
                                newChapters[activeChapterIdx] = currentChap;
                                onUpdateStoryChapters(story.id, newChapters);
                              }
                              setEditingParaIdx(null);
                            }}
                            className="px-3 py-1 bg-purple-700 hover:bg-purple-650 text-[10px] font-bold font-mono text-white rounded cursor-pointer transition-colors"
                          >
                            Save Proofread
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingParaIdx(null)}
                            className="px-3 py-1 bg-slate-900 border border-slate-800 text-[10px] font-bold font-mono text-slate-400 rounded cursor-pointer hover:text-slate-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <p className="indent-4 leading-relaxed hover:text-[#fff] transition-colors duration-200 select-text">
                          {para}
                        </p>
                        {isEditor && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingParaIdx(pIdx);
                              setEditingParaText(para);
                            }}
                            className="absolute -right-3 top-0 opacity-0 group-hover/para:opacity-100 px-2 py-0.5 bg-purple-900/40 hover:bg-purple-800/80 text-purple-300 font-mono text-[8.5px] rounded border border-purple-850 transition shadow-md cursor-pointer uppercase select-none leading-none flex items-center gap-1 z-10"
                          >
                            <span>✏️ Proofread</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>

            {/* Universe Rating Station */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              id="universe-rating-station"
              className={`mt-16 p-6 sm:p-8 rounded-2xl border ${themeInnerClasses[theme]} border-current/10 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
              
              <div className="relative text-center">
                <span className="text-[10px] sm:text-xs uppercase font-mono tracking-widest text-purple-400 font-bold block mb-2">
                  SPECULATIVE VERDICT
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-sans">
                  Rate this speculative universe
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed">
                  How deeply did you find yourself immersed in Nolan and Vesper Thorne's cosmic matrices?
                </p>

                {/* Stars Interactive Block */}
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {[1, 2, 3, 4, 5].map((starIdx) => {
                      const ratingInfo = storyRatings[story.id] || { avgRating: story.avgRating || 4.5, ratingCount: story.ratingCount || 50 };
                      const isLit = hoverRating > 0 
                        ? starIdx <= hoverRating 
                        : starIdx <= Math.round(ratingInfo.avgRating);
                      const isUserRated = ratingInfo.userRating !== undefined && starIdx <= ratingInfo.userRating;

                      return (
                        <button
                          key={starIdx}
                          id={`reader-star-btn-${starIdx}`}
                          onMouseEnter={() => setHoverRating(starIdx)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => {
                            if (!authUser) {
                              setOpenAuthModal(true);
                            } else {
                              onRateStory(story.id, starIdx);
                            }
                          }}
                          className="p-1 cursor-pointer transition-all duration-200 hover:scale-130 active:scale-95 focus:outline-none"
                          title={`Assign ${starIdx} Stars`}
                        >
                          <Star
                            className={`w-6 h-6 sm:w-8 sm:h-8 transition-all ${
                              isLit 
                                ? isUserRated
                                  ? 'fill-pink-500 text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)] animate-pulse'
                                  : 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                : 'text-slate-650 hover:text-slate-400'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Rating Feedback Text */}
                  {(() => {
                    const ratingInfo = storyRatings[story.id] || { avgRating: story.avgRating || 4.5, ratingCount: story.ratingCount || 50 };
                    return (
                      <div className="mt-2 text-xs font-mono text-slate-400">
                        {ratingInfo.userRating !== undefined ? (
                          <span className="text-pink-400 font-semibold bg-pink-950/20 border border-pink-900/30 px-3 py-1 rounded-full">
                            Your rating: {ratingInfo.userRating} Stars • Thank you!
                          </span>
                        ) : (
                          <span>Average: {ratingInfo.avgRating.toFixed(1)} ({ratingInfo.ratingCount} ratings dispatched)</span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Chapter Navigation Controls */}
          {story.chapters.length > 1 && (
            <div id="chapter-nav-row" className="flex items-center justify-between border-t border-current/10 pt-8 mt-12">
              <button
                id="prev-chapter-btn"
                onClick={handlePrevChapter}
                disabled={activeChapterIdx === 0}
                className="px-4 py-2 border border-current/15 rounded-lg flex items-center gap-1.5 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-current/5"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Chapter
              </button>

              <span className="text-xs font-mono">
                Chapter {activeChapterIdx + 1} of {story.chapters.length}
              </span>

              <button
                id="next-chapter-btn"
                onClick={handleNextChapter}
                disabled={activeChapterIdx === story.chapters.length - 1}
                className="px-4 py-2 border border-current/15 rounded-lg flex items-center gap-1.5 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:bg-current/5"
              >
                Next Chapter
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer info inside reading container */}
        <div className="w-full text-center text-xs opacity-40 font-mono mt-16 pb-4">
          END OF CHAPTER • CREATED IN CREATORVERSE MATRIX
        </div>
      </div>

      {/* Library Sidebar or floating configuration (only shown when requested or not in Focus Mode) */}
      {(!focusMode || showSettings) && (
        <div 
          id="reader-sidepanel" 
          className="w-full md:w-80 border-t md:border-t-0 md:border-l border-current/10 p-6 flex flex-col gap-6"
        >
          {/* Quick Settings Panel */}
          <div id="aesthetic-config-block" className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 block border-b border-current/10 pb-2">
              Aesthetic Settings
            </h3>

            {/* Themes */}
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-2.5">Aura Palette</span>
              <div className="grid grid-cols-3 gap-2">
                {(['midnight', 'paper', 'cosmic'] as ReaderTheme[]).map((t) => (
                  <button
                    id={`theme-btn-${t}`}
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-2.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer capitalize text-center ${
                      theme === t 
                        ? 'border-purple-500 bg-purple-500/10 text-purple-400' 
                        : 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-900/40'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Fonts */}
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-2.5">Speculative Typography</span>
              <div className="grid grid-cols-3 gap-2">
                {(['serif', 'sans', 'mono'] as ReaderFont[]).map((f) => (
                  <button
                    id={`font-btn-${f}`}
                    key={f}
                    onClick={() => setFontFamily(f)}
                    className={`px-1.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer capitalize text-center ${
                      fontFamily === f 
                        ? 'border-purple-500 bg-purple-500/10 text-purple-400' 
                        : 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-900/40'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Controls */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Word Scale ({fontSize}px)</span>
                <button 
                  id="reset-font-size"
                  onClick={() => setFontSize(18)}
                  className="text-[10px] text-purple-400 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  id="font-decrease"
                  onClick={() => setFontSize(prev => Math.max(14, prev - 1))}
                  className="p-1 px-3 rounded border border-current/15 hover:bg-current/10 cursor-pointer text-sm font-bold"
                  disabled={fontSize <= 14}
                >
                  -
                </button>
                <div className="flex-1 h-1 bg-current/20 rounded-full relative">
                  <div 
                    className="absolute inset-y-0 left-0 bg-purple-500 rounded-full" 
                    style={{ width: `${((fontSize - 14) / 10) * 100}%` }}
                  />
                </div>
                <button
                  id="font-increase"
                  onClick={() => setFontSize(prev => Math.min(26, prev + 1))}
                  className="p-1 px-3 rounded border border-current/15 hover:bg-current/10 cursor-pointer text-sm font-bold"
                  disabled={fontSize >= 26}
                >
                  +
                </button>
              </div>
            </div>

            {/* Line Spacing */}
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-2.5">Line Spacing</span>
              <div className="grid grid-cols-3 gap-2">
                {(['snug', 'relaxed', 'loose'] as LineHeight[]).map((h) => (
                  <button
                    id={`height-btn-${h}`}
                    key={h}
                    onClick={() => setTheme(prev => {
                      setLineHeight(h);
                      return prev;
                    })}
                    className={`px-1.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer capitalize text-center ${
                      lineHeight === h 
                        ? 'border-purple-[500] bg-purple-500/10 text-purple-400' 
                        : 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-900/40'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Library Picker Section inside the Reader Sidebar */}
          <div id="sidebar-library" className="flex-1 flex flex-col min-h-48 border-t border-current/10 pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 block mb-4 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-400" />
              Creatorverse Library
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-72 mscrollbar-thin">
              {MOCK_STORIES.map((item) => (
                <button
                  id={`browse-load-${item.id}`}
                  key={item.id}
                  onClick={() => {
                    onSelectStory(item);
                    setActiveChapterIdx(0);
                  }}
                  className={`w-full text-left p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    story.id === item.id
                      ? 'border-purple-500 bg-purple-500/10 text-purple-200'
                      : 'border-slate-800/80 bg-slate-950/30 hover:bg-slate-900/30 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-semibold block truncate mb-1">{item.title}</span>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="truncate">by {item.author.name}</span>
                    <span className="font-mono">{item.readTime}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
