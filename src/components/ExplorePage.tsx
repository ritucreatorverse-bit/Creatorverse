import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, BookOpen, ArrowRight, Paintbrush, Compass, Cpu, Users, Eye, 
  Heart, Share2, Star, Search, Tag, Play, Pause, Music, Volume2, X, Filter
} from 'lucide-react';
import { Story, ScrollTeaser } from '../types';
import { INSPIRATIONS } from '../data/mockData';
import { TROPES_CATEGORIES, ALL_TROPES, MOCK_MUSIC_TRACKS } from '../data/tropes';
import { useAuth } from '../context/AuthContext';

interface ExplorePageProps {
  onSelectStory: (story: Story) => void;
  onNavigateToTab: (tab: 'explore' | 'reader' | 'community' | 'studio') => void;
  storyRatings: Record<string, { avgRating: number; ratingCount: number; userRating?: number }>;
  onRateStory: (storyId: string, rating: number) => void;
  stories: Story[];
  scrollTeasers: ScrollTeaser[];
}

type PathType = 'all' | 'Writers' | 'Designers' | 'Artists' | 'Visionaries';

// Web audio synthethizer loop wrapper for genuine atmospheric music integration
let activeOscillatorCtx: AudioContext | null = null;

export default function ExplorePage({ 
  onSelectStory, 
  onNavigateToTab, 
  storyRatings, 
  onRateStory,
  stories,
  scrollTeasers
}: ExplorePageProps) {
  const { currentUser, setOpenAuthModal } = useAuth();
  const [selectedPath, setSelectedPath] = useState<PathType>('all');
  const [hoveredStoryStars, setHoveredStoryStars] = useState<Record<string, number>>({});
  const [savedStories, setSavedStories] = useState<Record<string, boolean>>({});
  const [galleryLikes, setGalleryLikes] = useState<Record<string, number>>({});
  
  // Search & Tropes Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrope, setSelectedTrope] = useState<string | null>(null);
  const [activeTropeCategory, setActiveTropeCategory] = useState<string>('General Vibes/Themes');
  const [showTropeFilterModal, setShowTropeFilterModal] = useState(false);
  const [scrollLikes, setScrollLikes] = useState<Record<string, number>>({});

  // Background Audio State
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  // Modern Phone-Frame Immersive Scroll Player States
  const [activeScrollId, setActiveScrollId] = useState<string | null>(null);
  const [isScrollPlaying, setIsScrollPlaying] = useState<boolean>(false);
  const [scrollTimeElapsed, setScrollTimeElapsed] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  const activeScroll = scrollTeasers.find(s => s.id === activeScrollId);
  const activeDuration = activeScroll?.duration || 35;

  // Drive the short video timeline tick (range 20s to 80s)
  useEffect(() => {
    let timer: any;
    if (activeScrollId && isScrollPlaying) {
      timer = setInterval(() => {
        setScrollTimeElapsed(prev => {
          if (prev >= activeDuration) {
            return 0; // loop
          }
          return Math.round((prev + 0.1) * 10) / 10;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [activeScrollId, isScrollPlaying, activeDuration]);

  // Connect active playback state with background ambient synth audio
  useEffect(() => {
    if (activeScrollId) {
      const scroll = scrollTeasers.find(s => s.id === activeScrollId);
      if (scroll && scroll.musicTrackId && isScrollPlaying && audioEnabled) {
        startSynthTrack(scroll.musicTrackId);
      } else {
        stopSynthTrack();
      }
    } else {
      // Don't stop outer playing track if no scroll modal is open
    }
  }, [activeScrollId, isScrollPlaying, audioEnabled]);

  // Stop ambient sounds when unmounting the page
  useEffect(() => {
    return () => {
      stopSynthTrack();
    };
  }, []);

  const startSynthTrack = (trackId: string) => {
    try {
      stopSynthTrack();
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      activeOscillatorCtx = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pitch mapping to give each background trail a bespoke ambient texture
      let pitchFreq = 110; 
      if (trackId === 'track-1') pitchFreq = 130.81; // C3 Low Neon pulses
      else if (trackId === 'track-2') pitchFreq = 98.00;  // G2 Dark rift drone
      else if (trackId === 'track-3') pitchFreq = 220.00; // A3 Light ambient wind
      else if (trackId === 'track-4') pitchFreq = 146.83; // D3 Gothic Cathedral
      else if (trackId === 'track-5') pitchFreq = 82.41;  // E2 Metallic bass
      else pitchFreq = 164.81; // E3 Soft acoustic tension

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitchFreq, ctx.currentTime);

      // Low frequency modulation to create beautiful pulsating soundscapes
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(4, ctx.currentTime); // pulsating speedhz
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.015, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Subtle, safe ambient volume
      gain.gain.setValueAtTime(0.04, ctx.currentTime);

      osc.start();
      lfo.start();
      setPlayingTrackId(trackId);
    } catch (e) {
      console.warn("Synth system failed or requires direct user interaction first.", e);
    }
  };

  const stopSynthTrack = () => {
    if (activeOscillatorCtx) {
      try {
        activeOscillatorCtx.close();
      } catch (e) {}
      activeOscillatorCtx = null;
    }
    setPlayingTrackId(null);
  };

  const toggleSynthTrack = (trackId: string) => {
    if (playingTrackId === trackId) {
      stopSynthTrack();
    } else {
      startSynthTrack(trackId);
    }
  };

  // Filter handlers
  const handleSelectTrope = (trope: string) => {
    setSelectedTrope(trope === selectedTrope ? null : trope);
    setShowTropeFilterModal(false);
  };

  // Comprehensive Search by: Name, Category, Trope, Author
  const filteredStories = stories.filter(story => {
    // 1. Path Filtering
    let pathMatch = true;
    if (selectedPath === 'Writers') {
      pathMatch = story.category === 'Sci-Fi' || story.category === 'Fantasy';
    } else if (selectedPath === 'Designers') {
      pathMatch = story.category === 'Cyberpunk';
    } else if (selectedPath === 'Artists') {
      pathMatch = story.category === 'Surrealism';
    }

    if (!pathMatch) return false;

    // 2. Trope Selection Filtering
    if (selectedTrope && (!story.tropes || !story.tropes.includes(selectedTrope))) {
      return false;
    }

    // 3. User Text Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const inTitle = story.title.toLowerCase().includes(query);
      const inDesc = story.description.toLowerCase().includes(query);
      const inCat = story.category.toLowerCase().includes(query);
      const inAuthor = story.author.name.toLowerCase().includes(query);
      const inTropes = story.tropes?.some(t => t.toLowerCase().includes(query)) || false;

      return inTitle || inDesc || inCat || inAuthor || inTropes;
    }

    return true;
  });

  const handleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      setOpenAuthModal(true);
      return;
    }
    setSavedStories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleGalleryLike = (id: string) => {
    if (!currentUser) {
      setOpenAuthModal(true);
      return;
    }
    setGalleryLikes(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const handleScrollLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      setOpenAuthModal(true);
      return;
    }
    setScrollLikes(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const paths = [
    { name: 'all', label: 'All Universes', icon: Compass, color: 'from-purple-500 to-indigo-600', description: 'Complete imaginative matrix' },
    { name: 'Writers', label: 'Writers Guild', icon: BookOpen, color: 'from-rose-500 to-pink-600', description: 'Speculative fiction, high fantasy & loop-mechanics' },
    { name: 'Designers', label: 'Tech Architects', icon: Cpu, color: 'from-cyan-500 to-blue-600', description: 'Cybernetics, UI coders, and system-designers' },
    { name: 'Artists', label: 'Immersive Artists', icon: Paintbrush, color: 'from-amber-500 to-orange-600', description: 'Surreal line art, landscape conceptualizers & 3D renderers' },
    { name: 'Visionaries', label: 'Deep Space', icon: Sparkles, color: 'from-emerald-500 to-teal-600', description: 'Multimodal collaborative design' },
  ];

  return (
    <div id="explore-root" className="min-h-screen text-slate-100 bg-[#07070d] pb-16 font-sans relative">
      
      {/* Immersive Cosmic Hero Section */}
      <div id="hero-banner" className="relative overflow-hidden py-24 sm:py-32 border-b border-slate-900 bg-radial-[at_center_center] from-[#170e2b] via-[#07070d] to-[#07070d]">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_70%_20%,#312e81,transparent_45%)]" />
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#9089fc] to-[#ff80b5] opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72rem]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs text-purple-300 font-medium mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>THE DIGITAL FRONTIER OF SPECULATIVE WORLDS</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
              Where Creativity Finds Its <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 select-all">Universe</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
              No place for artificial proxies. Explore authentic, collaborative story world journals, immersive design blueprints, and audio-guided visual scroll teasers.
            </p>
          </motion.div>

          {/* Unified Real-time Search Panel with Trope Capability */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-3xl mx-auto bg-slate-950/80 p-3 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row gap-3 items-center"
          >
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                id="story-search-input"
                type="text"
                placeholder="Search by story titles, authors, categories, or trope names (e.g. Enemies to lovers)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800/80 rounded-xl py-3 pl-11 pr-5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 transition-all font-sans"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              {/* Trope Filter Prompt Button */}
              <button
                id="toggle-trope-list-modal"
                onClick={() => setShowTropeFilterModal(true)}
                className={`px-4 py-3 leading-none rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 w-full sm:w-auto ${
                  selectedTrope 
                    ? 'bg-purple-900/40 border-purple-500 text-purple-200' 
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                {selectedTrope ? `Trope: ${selectedTrope}` : 'Filter by Trope'}
              </button>

              {/* Show All Reset Button */}
              {(searchQuery || selectedTrope) && (
                <button
                  id="reset-search-filters"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTrope(null);
                  }}
                  className="px-3 rounded-xl bg-red-950/20 border border-red-900/40 hover:bg-red-950/40 text-red-400 hover:text-red-300 text-xs font-medium cursor-pointer transition"
                  title="Clear all filters"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>

          {/* Prompt active filter reminder if any */}
          {(selectedTrope || searchQuery) && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {selectedTrope && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs rounded-full font-mono">
                  <span>Trope: <strong>{selectedTrope}</strong></span>
                  <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setSelectedTrope(null)} />
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs rounded-full font-mono">
                  <span>Keyword: <strong>"{searchQuery}"</strong></span>
                  <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setSearchQuery('')} />
                </span>
              )}
            </div>
          )}

          {/* Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            id="stats-bar" 
            className="mt-16 max-w-4xl mx-auto grid grid-cols-3 gap-6 py-6 px-8 rounded-2xl bg-slate-950/65 border border-slate-800/80 backdrop-blur-lg shadow-2xl relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#ffffff02] to-transparent pointer-events-none rounded-2xl" />
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">124K+</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Active Creators</div>
            </div>
            <div className="text-center border-x border-slate-800/80 px-2">
              <div className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-cyan-400">1.2M+</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Worlds Shared</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">45M+</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Atmospheric Reads</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Path Selector - Choose Your Path */}
      <div id="path-selection" className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Choose Your Path</h2>
            <p className="text-slate-400 mt-2">Filter speculative layers to focus on your creative elements</p>
          </div>
          {selectedPath !== 'all' && (
            <button 
              id="clear-path-filter"
              onClick={() => setSelectedPath('all')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 mt-2 md:mt-0 underline decoration-purple-500/40 underline-offset-4 cursor-pointer"
            >
              Reset to All Universes
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {paths.map((p) => {
            const Icon = p.icon;
            const isActive = selectedPath === p.name;
            return (
              <button
                id={`path-btn-${p.name}`}
                key={p.name}
                onClick={() => setSelectedPath(p.name as PathType)}
                className={`relative overflow-hidden rounded-xl p-5 text-left border cursor-pointer transition-all duration-300 group ${
                  isActive 
                    ? 'border-purple-500 bg-[#120f26]' 
                    : 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-900/60 hover:border-slate-700/85'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-400 to-pink-500" />
                )}
                <div className={`p-2.5 rounded-lg w-10 h-10 flex items-center justify-center mb-4 transition-colors ${
                  isActive ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-900 text-slate-400 group-hover:text-slate-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">{p.label}</h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{p.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Discover New Worlds - Main Grid */}
      <div id="discover-section" className="max-w-7xl mx-auto px-6 lg:px-8 py-12 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-slate-900 pb-4 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Discover New Worlds</h2>
            <p className="text-slate-400 mt-1 font-sans">Speculative fiction and authentic world-building journals tagging genuine tropes</p>
          </div>
          <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-300 font-mono self-start sm:self-center">
            {filteredStories.length} entries matching
          </span>
        </div>

        {filteredStories.length === 0 ? (
          <div className="py-16 text-center bg-slate-950/30 border border-dashed border-slate-800 rounded-2xl">
            <Tag className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-semibold">No stories match your current filtering criteria.</p>
            <p className="text-slate-500 text-xs mt-1">Try resetting the keyword query or search path filters.</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedTrope(null);
                setSelectedPath('all');
              }}
              className="mt-4 px-4 py-2 bg-purple-950/40 border border-purple-500/30 rounded-lg text-xs text-purple-300 hover:bg-purple-950/80 cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredStories.map((story) => {
                const ratingInfo = storyRatings[story.id] || { avgRating: story.avgRating || 4.5, ratingCount: story.ratingCount || 50 };
                const isSaved = savedStories[story.id] || false;
                const hoverVal = hoveredStoryStars[story.id] || 0;
                return (
                  <motion.article
                    key={story.id}
                    id={`story-card-${story.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-slate-950/45 border border-slate-800/80 hover:border-purple-900/40 transition-all duration-300 hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                  >
                    <div className="relative">
                      {/* Story Cover Image */}
                      <div className="aspect-[16/10] overflow-hidden bg-slate-900 relative">
                        <img
                          src={story.coverUrl}
                          alt={story.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#09090e] via-transparent to-transparent pointer-events-none" />
                        
                        <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 max-w-[80%]">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-sm uppercase">
                            {story.category}
                          </span>
                        </div>
                        
                        <div className="absolute top-4 right-4 text-xs text-slate-300 font-mono bg-slate-950/80 border border-slate-800 backdrop-blur-md px-2 py-0.5 rounded">
                          {story.readTime || '8 min read'}
                        </div>
                      </div>

                      {/* Story Author & Body Info */}
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <img
                            src={story.author.avatar}
                            alt={story.author.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full border border-slate-800"
                          />
                          <div>
                            <span className="text-xs font-semibold text-white block">{story.author.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider">{story.author.role}</span>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors duration-300 leading-tight">
                          {story.title}
                        </h3>
                        
                        <p className="text-sm text-slate-400 mt-2 line-clamp-3 leading-relaxed font-sans">
                          {story.description}
                        </p>

                        {/* Rendering matched user tropes visually on card list */}
                        {story.tropes && story.tropes.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1">
                            {story.tropes.slice(0, 4).map((tropeItem) => (
                              <button
                                key={tropeItem}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectTrope(tropeItem);
                                }}
                                className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                                  selectedTrope === tropeItem
                                    ? 'bg-purple-500 text-white border border-purple-400'
                                    : 'bg-slate-900/85 text-slate-400 hover:text-purple-300 border border-slate-800'
                                }`}
                                title="Click to filter by trope"
                              >
                                #{tropeItem}
                              </button>
                            ))}
                            {story.tropes.length > 4 && (
                              <span className="text-[9px] font-mono text-slate-600 px-1 pt-0.5" title={`${story.tropes.slice(4).join(', ')}`}>
                                +{story.tropes.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions / Star Ratings */}
                    <div className="px-6 pb-6 pt-2 border-t border-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <button
                        id={`read-btn-${story.id}`}
                        onClick={() => onSelectStory(story)}
                        className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors flex-shrink-0"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Read Story
                      </button>

                      {/* 1-5 Stars Interactive Widget */}
                      <div className="flex items-center justify-between sm:justify-start gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((starIdx) => {
                            const isLit = hoverVal > 0 
                              ? starIdx <= hoverVal 
                              : starIdx <= Math.round(ratingInfo.avgRating);
                            const isUserRated = ratingInfo.userRating !== undefined && starIdx <= ratingInfo.userRating;

                            return (
                              <button
                                key={starIdx}
                                id={`star-btn-${story.id}-${starIdx}`}
                                onMouseEnter={() => setHoveredStoryStars(prev => ({ ...prev, [story.id]: starIdx }))}
                                onMouseLeave={() => setHoveredStoryStars(prev => ({ ...prev, [story.id]: 0 }))}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRateStory(story.id, starIdx);
                                }}
                                className="p-0.5 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                                title={`Rate ${starIdx} Stars`}
                              >
                                <Star
                                  className={`w-3.5 h-3.5 transition-colors ${
                                    isLit 
                                      ? isUserRated
                                        ? 'fill-pink-500 text-pink-400' 
                                        : 'fill-amber-400 text-amber-400' 
                                      : 'text-slate-700 hover:text-slate-500'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold" title="Average Rating (Ratings Count)">
                          {ratingInfo.avgRating.toFixed(1)} <span className="text-slate-500 font-normal">({ratingInfo.ratingCount})</span>
                        </span>

                        <button
                          id={`bookmark-btn-${story.id}`}
                          onClick={(e) => handleSave(story.id, e)}
                          className={`py-1 px-1.5 rounded hover:bg-slate-900 flex items-center gap-1 cursor-pointer transition-colors ${
                            isSaved ? 'text-pink-400' : 'text-slate-500 hover:text-slate-200'
                          }`}
                          title={isSaved ? "Saved to Library" : "Save Story"}
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${isSaved ? 'fill-pink-500 text-pink-400' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* SPECULATIVE SCROLL TEASERS (Short Video-like atmospheric teasers for timepass & discover) */}
      <div id="creative-scrolls" className="bg-[#0b0a13] border-y border-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Compass className="text-purple-400 w-6 h-6 animate-spin-slow" />
                Speculative Video Scrolls
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Explore short video teasers and simple updates between 20s and 80s uploaded by creators. Connect with ambient soundtracks and play to discover.
              </p>
            </div>
            
            {playingTrackId && !activeScrollId && (
              <button
                onClick={stopSynthTrack}
                className="self-start sm:self-center px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-mono flex items-center gap-1.5 animate-pulse cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Stop Active Synth
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scrollTeasers.map((scroll) => {
              const likes = scrollLikes[scroll.id] || 0;
              const isPlaying = playingTrackId === scroll.musicTrackId && !activeScrollId;
              const attachedTrack = MOCK_MUSIC_TRACKS.find(t => t.id === scroll.musicTrackId);
              const duration = scroll.duration || 35;
              const vType = scroll.videoType || 'trailer';

              return (
                <div
                  id={`scroll-teaser-card-${scroll.id}`}
                  key={scroll.id}
                  className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] overflow-hidden relative group/sc h-96 bg-gradient-to-b ${
                    scroll.bgGradient || 'from-indigo-950 via-purple-950/40 to-slate-950'
                  } border-slate-800/80 hover:border-purple-500/50`}
                >
                  {/* Glowing vertical lines to simulate digital film grain representation */}
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                  
                  {/* Video length and view telemetry metadata tags */}
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5 z-10">
                    <span className="text-[9px] font-mono bg-black/75 px-2 py-0.5 rounded text-cyan-300 border border-cyan-500/25">
                      ⏱️ {duration}s
                    </span>
                    <span className="text-[9px] font-mono bg-black/75 px-2 py-0.5 rounded text-amber-400">
                      👁️ {scroll.views || 450} views
                    </span>
                  </div>

                  {/* Top-line Category and Audio Controller */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[9px] font-mono tracking-widest text-[#00ffff] bg-black/50 border border-cyan-500/30 px-2.5 py-1 rounded-full uppercase`}>
                        {vType === 'trailer' ? '🎬 TRAILER CLIP' : '📢 RECENT UPDATE'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 tracking-tight leading-tight mb-2 group-hover/sc:text-cyan-300 transition-colors">
                      {scroll.title}
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-slate-200/95 leading-relaxed font-sans line-clamp-4 italic select-none">
                      "{scroll.text}"
                    </p>
                  </div>

                  {/* Play Overlay trigger */}
                  <div className="my-2">
                    <button
                      onClick={() => {
                        setActiveScrollId(scroll.id);
                        setIsScrollPlaying(true);
                        setScrollTimeElapsed(0);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-purple-800/80 to-indigo-800/80 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-purple-500/25"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      ⚡ Play Scroll Video ({duration}s)
                    </button>
                  </div>

                  {/* Trope Tag list or Music Footer */}
                  <div className="space-y-3 pt-3 border-t border-slate-900/40">
                    <div className="flex flex-wrap gap-1">
                      {scroll.tropes.slice(0, 3).map((tropeItem) => (
                        <span 
                          key={tropeItem}
                          className="text-[9px] font-mono text-cyan-300 bg-cyan-900/10 px-2 py-0.5 rounded uppercase"
                        >
                          {tropeItem}
                        </span>
                      ))}
                    </div>

                    {attachedTrack && (
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 bg-black/40 py-1 px-2 rounded border border-slate-900">
                        <Music className="w-3 h-3 text-pink-400" />
                        <span className="truncate max-w-[120px]">{attachedTrack.title}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={scroll.author.avatar}
                          alt={scroll.author.name}
                          referrerPolicy="no-referrer"
                          className="w-5.5 h-5.5 rounded-full border border-slate-800"
                        />
                        <span className="text-[10px] text-slate-300">{scroll.author.name}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleScrollLike(scroll.id, e)}
                          className="text-[10px] font-mono text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                        >
                          <Heart className={`w-3.5 h-3.5 ${likes > 0 ? 'fill-red-500 text-rose-500' : ''}`} />
                          <span>{scroll.likes + likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DETAILED IMMERSIVE SHORT VIDEO VIEWPORT PLAYER OVERLAY */}
      <AnimatePresence>
        {activeScrollId && activeScroll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#040409] border border-slate-800 rounded-3xl p-6 max-w-lg w-full flex flex-col md:flex-row gap-6 relative shadow-2xl overflow-hidden"
            >
              {/* Outer absolute close */}
              <button
                onClick={() => {
                  setActiveScrollId(null);
                  stopSynthTrack();
                }}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/60 border border-slate-800 text-slate-400 hover:text-white hover:scale-105 transition-transform cursor-pointer"
                title="Exit player"
              >
                <X className="w-5 h-5" />
              </button>

              {/* COL 1: 9:16 TIMEPASS PHONE FRAME */}
              <div className="w-[320px] h-[550px] mx-auto rounded-[40px] bg-black border-8 border-slate-800 relative shadow-2xl overflow-hidden flex-shrink-0 flex flex-col justify-between">
                {/* Speaker Ear Notching at top */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-b-xl z-30 flex items-center justify-center">
                  <div className="w-8 h-1.5 bg-black rounded-full" />
                </div>

                {/* Vertical video active rendering view */}
                <div className={`absolute inset-0 bg-gradient-to-b ${activeScroll.bgGradient || 'from-indigo-950 via-purple-900 to-slate-950'} z-10 flex flex-col justify-between p-6 pt-12`}>
                  {/* Abstract vibrating stellar film art animation */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500 via-indigo-600 to-transparent pointer-events-none z-10 animate-pulse" />
                  
                  {/* Simulating moving particles inside active video streaming clip */}
                  <div className="absolute inset-x-0 bottom-1/3 top-12 overflow-hidden pointer-events-none z-10 opacity-30">
                    <div className="w-64 h-64 border border-cyan-500/30 rounded-full absolute -left-10 top-12 animate-spin-slow" />
                    <div className="w-48 h-48 border border-pink-500/20 rounded-full absolute -right-16 bottom-4 animate-reverse-spin-slow" />
                  </div>

                  {/* Header info bar */}
                  <div className="flex justify-between items-center z-20">
                    <span className="text-[9px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full uppercase">
                      ⚡ {activeScroll.videoType === 'trailer' ? '🎬 TRAILER CLIP' : '📢 SIMPLE UPDATE'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-300 bg-black/60 px-2 py-0.5 rounded-full">
                      👁️ {activeScroll.views ? activeScroll.views + 120 : 570} watching
                    </span>
                  </div>

                  {/* Simulated screen center overlay with big Play logo when paused */}
                  <div className="flex-grow flex items-center justify-center z-20 my-6">
                    <button
                      onClick={() => setIsScrollPlaying(!isScrollPlaying)}
                      className="p-5 rounded-full bg-black/55 text-white border border-slate-700/60 hover:scale-105 transition-transform"
                    >
                      {isScrollPlaying ? (
                        <Pause className="w-8 h-8 text-cyan-300 fill-current" />
                      ) : (
                        <Play className="w-8 h-8 text-cyan-300 fill-current" />
                      )}
                    </button>
                  </div>

                  {/* Lower metadata and transcript subtitles */}
                  <div className="z-20 space-y-3 bg-black/45 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                    {/* Caption sentence overlays */}
                    <p className="text-xs text-slate-100 font-sans tracking-tight italic leading-relaxed text-left drop-shadow-md">
                      "{activeScroll.text}"
                    </p>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/40">
                      <img
                        src={activeScroll.author.avatar}
                        alt="author"
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full border border-slate-700"
                      />
                      <div>
                        <span className="text-[10px] text-white font-bold block">{activeScroll.author.name}</span>
                        <span className="text-[8px] text-slate-400 font-mono block">{activeScroll.author.handle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress timeline and active Seek Slider */}
                  <div className="z-20 space-y-1.5 mt-2">
                    <div className="flex justify-between text-[8px] font-mono text-slate-300">
                      <span>0:{Math.floor(scrollTimeElapsed).toString().padStart(2, '0')}</span>
                      <span>0:{activeDuration}s</span>
                    </div>

                    {/* Progress seeking bars */}
                    <div className="h-1 bg-slate-800/80 rounded-full relative overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-100"
                        style={{ width: `${(scrollTimeElapsed / activeDuration) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Absolute vertical toolbar widget on right side of phone frame */}
                <div className="absolute right-3 bottom-24 flex flex-col gap-4 z-20 items-center bg-black/60 py-3.5 px-2 rounded-full border border-slate-850 backdrop-blur-sm">
                  {/* Liking */}
                  <button
                    onClick={() => {
                      const cid = activeScroll.id;
                      setScrollLikes(prev => ({
                        ...prev,
                        [cid]: (prev[cid] || 0) + 1
                      }));
                    }}
                    className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-rose-400"
                  >
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500/25 cursor-pointer" />
                    <span className="text-[9px] font-mono">{activeScroll.likes + (scrollLikes[activeScroll.id] || 0)}</span>
                  </button>

                  {/* Share code */}
                  <button
                    onClick={() => {
                      alert(`Multiverse transmit code generated for "${activeScroll.title}"! Shared to your spatial link!`);
                    }}
                    className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-cyan-400 cursor-pointer"
                  >
                    <Share2 className="w-4.5 h-4.5 text-slate-300" />
                    <span className="text-[9px] font-mono">{activeScroll.shares || 12}</span>
                  </button>

                  {/* Audio enable switcher */}
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className="p-1 px-1.5 rounded-full bg-slate-900 border border-slate-800"
                    title={audioEnabled ? "Mute soundtrack stream" : "Play soundtrack stream"}
                  >
                    {audioEnabled ? (
                      <Volume2 className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* COL 2: SWIPING NAVIGATION FEED & LIVE STREAM DISCUSSIONS */}
              <div className="flex-grow flex flex-col justify-between text-left select-none text-xs">
                <div>
                  <div className="mb-4">
                    <span className="text-[10px] font-mono uppercase bg-purple-900/30 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded">
                      Discover & Timepass Feed
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2 leading-tight">{activeScroll.title}</h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Currently playing on continuous audio sync. Use down arrows to swap to the next short video!
                    </p>
                  </div>

                  {/* Swiping navigation selectors */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 space-y-1.5">
                    <span className="text-[9px] text-slate-500 uppercase font-mono block">Swipe Timeline Channel</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const idx = scrollTeasers.findIndex(s => s.id === activeScroll.id);
                          if (idx > 0) {
                            setActiveScrollId(scrollTeasers[idx - 1].id);
                            setScrollTimeElapsed(0);
                          }
                        }}
                        disabled={scrollTeasers.findIndex(s => s.id === activeScroll.id) === 0}
                        className="flex-grow py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 rounded font-semibold text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Prev Trailer [↑]
                      </button>
                      <button
                        onClick={() => {
                          const idx = scrollTeasers.findIndex(s => s.id === activeScroll.id);
                          if (idx < scrollTeasers.length - 1) {
                            setActiveScrollId(scrollTeasers[idx + 1].id);
                            setScrollTimeElapsed(0);
                          }
                        }}
                        disabled={scrollTeasers.findIndex(s => s.id === activeScroll.id) === scrollTeasers.length - 1}
                        className="flex-grow py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 rounded font-semibold text-cyan-400 flex items-center justify-center gap-1 cursor-pointer animate-pulse"
                      >
                        Next Video [↓]
                      </button>
                    </div>
                  </div>

                  {/* Simulated comments board to do proper timepass */}
                  <div className="mt-4 space-y-2">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Recent Viewer Interactions</span>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                      <div className="text-[11px] text-slate-300 leading-normal">
                        <span className="font-bold text-cyan-300">@vesper_t</span>: This is incredible, the spatial overlays came together perfectly!
                      </div>
                      <div className="text-[11px] text-slate-300 leading-normal">
                        <span className="font-bold text-pink-400">@kaelen_v</span>: Those synth pulses are matching the tension! ⚡
                      </div>
                      <div className="text-[11px] text-slate-300 leading-normal">
                        <span className="font-bold text-indigo-400">@anon_pioneer</span>: Just spent 20 minutes clicking through these loop formats. High-grade timepass!
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close feedback indicators */}
                <div className="pt-4 border-t border-slate-900 mt-6 text-[10px] text-slate-500 font-mono flex justify-between">
                  <span>DURATION: {activeDuration}s</span>
                  <button 
                    onClick={() => {
                      setActiveScrollId(null);
                      stopSynthTrack();
                    }}
                    className="text-purple-400 hover:text-purple-300 font-bold"
                  >
                    Close Video Player [×]
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inspiration Gallery */}
      <div id="inspiration-gallery" className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div id="gallery-header" className="mb-10 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Paintbrush className="text-pink-400 w-6 h-6" />
            Inspiration Gallery
          </h2>
          <p className="text-slate-400 mt-2">Stunning visuals conceptualized for story worlds in our collaborative directory</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INSPIRATIONS.map((item) => {
            const likesCount = galleryLikes[item.id] || 0;
            return (
              <div 
                id={`gallery-item-${item.id}`}
                key={item.id} 
                className="group relative rounded-xl overflow-hidden bg-slate-950 border border-slate-900/60 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="aspect-square bg-slate-900 relative overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 pointer-events-none" />
                </div>
                
                {/* Info Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <span className="text-[9px] font-semibold text-pink-400 uppercase tracking-wider block bg-pink-950/40 border border-pink-900/40 px-2 py-0.5 rounded-full w-max mb-2">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold text-white truncate leading-snug">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">by {item.creator}</p>
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/40">
                    <button
                      id={`gallery-like-btn-${item.id}`}
                      onClick={() => handleGalleryLike(item.id)}
                      className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Heart className={`w-3.5 h-3.5 ${likesCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="font-mono">{12 + likesCount}</span>
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">REAL GRID</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aesthetic CTA Promo panel */}
      <div id="promotional-panel" className="max-w-5xl mx-auto px-6 mb-16">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#170e2b] to-[#120a1f] border border-purple-900/40 p-8 sm:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_120%,rgba(139,92,246,0.1),transparent_50%)] pointer-events-none" />
          <div className="max-w-xl relative">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Ready to map your own solar system?</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Create a free developer draft inside our Creator Studio. Harness our speculative tools, launch collaborative community missions, and release your first e-book.
            </p>
          </div>
          <button 
            id="cta-studio-direct"
            onClick={() => onNavigateToTab('studio')}
            className="flex-shrink-0 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 cursor-pointer shadow-lg transition-colors"
          >
            Enter Creator Studio
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DETAILED TROPE SELECTOR POPUP MODAL */}
      <AnimatePresence>
        {showTropeFilterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0a14] border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-900 flex justify-between items-center bg-slate-950/40">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Tag className="text-purple-400 w-5 h-5" />
                    Bespoke Story Trope Library
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Select any trope from our categorized lists to discover story universes.</p>
                </div>
                <button
                  onClick={() => setShowTropeFilterModal(false)}
                  className="p-1 px-2.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Close [×]
                </button>
              </div>

              {/* Selector Tabs for Trope Categories */}
              <div className="flex border-b border-inner border-slate-900 bg-slate-950/20 overflow-x-auto scrollbar-none py-1">
                {Object.keys(TROPES_CATEGORIES).map((catName) => (
                  <button
                    key={catName}
                    onClick={() => setActiveTropeCategory(catName)}
                    className={`flex-shrink-0 px-4 py-2 border-b-2 text-xs font-semibold cursor-pointer transition-colors ${
                      activeTropeCategory === catName 
                        ? 'border-purple-500 text-purple-300 bg-purple-950/10' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {catName}
                  </button>
                ))}
              </div>

              {/* Tropes Badge Grid */}
              <div className="flex-grow p-6 overflow-y-auto bg-slate-950/40 text-left">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {TROPES_CATEGORIES[activeTropeCategory as keyof typeof TROPES_CATEGORIES].map((tropeItem) => {
                    const isSelected = selectedTrope === tropeItem;
                    return (
                      <button
                        key={tropeItem}
                        onClick={() => handleSelectTrope(tropeItem)}
                        className={`px-3 py-2 rounded-lg text-xs border text-left cursor-pointer transition-all duration-150 ${
                          isSelected 
                            ? 'bg-purple-600/30 border-purple-500 text-white font-semibold' 
                            : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700/80 hover:bg-slate-900'
                        }`}
                      >
                        #{tropeItem}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-900 flex justify-between bg-slate-950/50">
                <button
                  onClick={() => {
                    setSelectedTrope(null);
                    setShowTropeFilterModal(false);
                  }}
                  className="px-4 py-2 hover:bg-slate-900 font-semibold border border-transparent rounded-lg text-xs text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Reset Current Trope
                </button>
                <button
                  onClick={() => setShowTropeFilterModal(false)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Done Selecting
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
