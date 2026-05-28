import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Compass, BookOpen, Users, LayoutDashboard, Menu, X } from 'lucide-react';
import { Story, TabType, ScrollTeaser, FeedPost } from './types';
import { MOCK_STORIES, MOCK_FEED } from './data/mockData';

// Pages
import ExplorePage from './components/ExplorePage';
import ReaderPage from './components/ReaderPage';
import CommunityPage from './components/CommunityPage';
import StudioPage from './components/StudioPage';

// Authentication Context & UI Modal
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';

function CreatorverseApp() {
  const { currentUser, logout, openAuthModal, setOpenAuthModal, updateCurrentUserRole } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(MOCK_FEED);
  const [currentStory, setCurrentStory] = useState<Story | null>(MOCK_STORIES[0]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Scroll Teasers list state
  const [scrollTeasers, setScrollTeasers] = useState<ScrollTeaser[]>([
    {
      id: 'scroll-1',
      title: 'Touch Her and Die',
      text: 'He stood in the acid rain, obsidian blade humming. "I warned you," he whispered to the dark lord\'s legions, "touch her and die." The ancient evil was awake, but so was his protective obsession.',
      tropes: ['Touch her and die', 'Morally gray love interest', 'Dark academia', 'Silent protector', 'Knife-to-throat tension'],
      author: {
        name: 'Vesper Thorne',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
        handle: '@vesper_t',
        role: 'Writer'
      },
      bgGradient: 'from-stone-900 via-yellow-950 to-neutral-950 bg-gradient-to-b',
      musicTrackId: 'track-4',
      likes: 184,
      commentsCount: 22,
      timestamp: '2 hours ago',
      duration: 35,
      videoType: 'trailer',
      views: 1240,
      shares: 45,
      completionRate: 88,
      watchTime: 12.1
    },
    {
      id: 'scroll-2',
      title: 'Regression of the S-Rank Overlord',
      text: "The kingdom betrayed me at the cosmic altar. I thought it was my final chapter. Instead, my system dashboard flashed: [Regression Initiated - Rewinding 10 Years]. This time, I won't play the reluctant hero.",
      tropes: ['Regression', 'System powers', 'OP MC', 'S-rank hunter', 'Revenge return', 'Power fantasy'],
      author: {
        name: 'Kaelen Vox',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
        handle: '@kaelen_v',
        role: 'Designer'
      },
      bgGradient: 'from-fuchsia-600 via-pink-700 to-rose-900 bg-gradient-to-tr',
      musicTrackId: 'track-1',
      likes: 312,
      commentsCount: 45,
      timestamp: '5 hours ago',
      duration: 65,
      videoType: 'update',
      views: 3420,
      shares: 112,
      completionRate: 74,
      watchTime: 41.5
    },
    {
      id: 'scroll-3',
      title: 'The Time Loop Realization',
      text: "This is loop number 412. Evelyn, every time we speak, you ask the exact same sensor calculations before the engine collapses. But look at your hand—it’s trembling. Why are you remembering?",
      tropes: ['Time-travel', 'Loop ending', 'Obsessed genius', 'Star-crossed lovers', 'Slow burn', 'Unreliable narrator'],
      author: {
        name: 'Zane Vector',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
        handle: '@z_vector',
        role: 'Visionary'
      },
      bgGradient: 'from-indigo-950 via-purple-900 to-slate-950 bg-gradient-to-br',
      musicTrackId: 'track-2',
      likes: 247,
      commentsCount: 19,
      timestamp: '1 day ago',
      duration: 50,
      videoType: 'trailer',
      views: 1890,
      shares: 67,
      completionRate: 82,
      watchTime: 20.8
    }
  ]);

  // Global Ratings State initialized from stories list
  const [storyRatings, setStoryRatings] = useState<Record<string, { avgRating: number; ratingCount: number; userRating?: number }>>(() => {
    const initial: Record<string, { avgRating: number; ratingCount: number; userRating?: number }> = {};
    MOCK_STORIES.forEach(story => {
      initial[story.id] = {
        avgRating: story.avgRating || 4.5,
        ratingCount: story.ratingCount || 50,
        userRating: undefined
      };
    });
    return initial;
  });

  const handleRateStory = (storyId: string, rating: number) => {
    setStoryRatings(prev => {
      const current = prev[storyId];
      
      // Calculate from custom or static fallback if not registered yet
      const currentAvg = current ? current.avgRating : 4.5;
      const currentCount = current ? current.ratingCount : 50;
      const currentUserR = current ? current.userRating : undefined;

      let newCount = currentCount;
      let newSum = currentAvg * currentCount;

      if (currentUserR !== undefined) {
        newSum = newSum - currentUserR + rating;
      } else {
        newCount += 1;
        newSum += rating;
      }

      const newAvg = Math.round((newSum / newCount) * 10) / 10;

      return {
        ...prev,
        [storyId]: {
          avgRating: newAvg,
          ratingCount: newCount,
          userRating: rating
        }
      };
    });
  };

  const handlePublishStory = (newStory: Story) => {
    setStories(prev => [newStory, ...prev]);
    setStoryRatings(prev => ({
      ...prev,
      [newStory.id]: {
        avgRating: 5.0,
        ratingCount: 1,
        userRating: undefined
      }
    }));
  };

  const handleDeleteStoryBook = (storyId: string) => {
    setStories(prev => prev.filter(s => s.id !== storyId));
  };

  const handleUpdateStoryChapters = (storyId: string, chapters: any[]) => {
    setStories(prev => prev.map(s => s.id === storyId ? { ...s, chapters } : s));
  };

  const handleUpdateStoryCover = (storyId: string, coverUrl: string) => {
    setStories(prev => prev.map(s => s.id === storyId ? { ...s, coverUrl } : s));
  };

  const handlePublishFeedPost = (newPost: FeedPost) => {
    setFeedPosts(prev => [newPost, ...prev]);
  };

  const handlePublishScrollTeaser = (newScroll: ScrollTeaser) => {
    setScrollTeasers(prev => [newScroll, ...prev]);
  };

  // Cross-page action: user triggers reading a story
  const handleSelectStory = (story: Story) => {
    setCurrentStory(story);
    setActiveTab('reader');
    setMobileMenuOpen(false);
  };

  const handleNavigateToTab = (tab: TabType) => {
    if (tab === 'studio' && !currentUser) {
      setOpenAuthModal(true);
      return;
    }
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const menuItems = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'reader', label: 'Library & Reader', icon: BookOpen },
    { id: 'community', label: 'Deep Space Feed', icon: Users },
    { id: 'studio', label: 'Creator Studio', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#07070d] text-slate-100 font-sans selection:bg-purple-500/30 selection:text-white">
      {/* GLOWING AMBIENT BACKGROUND ACCENTS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[radial-gradient(circle_at_50%_0%,#151030,transparent_55%)]">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-pink-900/5 rounded-full blur-3xl" />
      </div>

      {/* HEADER PLATFORM TOPBAR */}
      <header id="platform-topbar" className="sticky top-0 z-40 bg-[#07070d]/80 border-b border-slate-900 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div 
            id="brand-logo" 
            onClick={() => handleNavigateToTab('explore')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-md font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 font-sans">
                CREATORVERSE
              </span>
              <span className="text-[9px] text-purple-400 font-mono block tracking-widest leading-none">Ritu/RV</span>
            </div>
          </div>

          {/* Desktop Nav Items & Profile Station */}
          <div className="hidden md:flex items-center gap-5">
            <nav id="desktop-nav" className="flex items-center gap-1.5 font-sans">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    id={`nav-btn-${item.id}`}
                    key={item.id}
                    onClick={() => handleNavigateToTab(item.id as TabType)}
                    className={`px-3.5 py-1.5 text-[11.5px] font-semibold rounded-lg flex items-center gap-2 tracking-wide cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-purple-950/40 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/30 border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* User Access Point */}
            {currentUser ? (
              <div id="profile-identity-dropdown" className="flex items-center gap-3 pl-3 border-l border-slate-900">
                <div className="flex flex-col items-end">
                  <span className="text-[11.5px] font-bold text-slate-100 leading-none">{currentUser.name}</span>
                  <span className={`text-[8.5px] font-mono font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none mt-1 ${
                    currentUser.role === 'Reader' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    currentUser.role === 'Author' ? 'bg-purple-500/10 text-purple-400 border border-purple-400/20' :
                    currentUser.role === 'Photographer' ? 'bg-amber-500/10 text-amber-400 border border-amber-400/20' :
                    'bg-cyan-500/10 text-cyan-400 border border-cyan-400/20'
                  }`}>{currentUser.role}</span>
                </div>
                <img 
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-8.5 h-8.5 rounded-full object-cover border border-purple-500/45 shrink-0"
                />
                <button
                  id="auth-logout-action"
                  onClick={() => logout()}
                  className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-500 hover:text-red-400 rounded-md text-[9px] font-mono cursor-pointer transition"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <button
                id="auth-login-trigger"
                onClick={() => setOpenAuthModal(true)}
                className="px-4 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg cursor-pointer transition-colors shadow-md shadow-purple-500/10"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu button */}
          <div className="md:hidden flex items-center">
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-950/60 border border-slate-900 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE TRIGGER DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-nav-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a14] border-b border-indigo-950/40 z-30 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    id={`mobile-nav-btn-${item.id}`}
                    key={item.id}
                    onClick={() => handleNavigateToTab(item.id as TabType)}
                    className={`w-full px-4 py-3 text-xs font-semibold rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${
                      isActive 
                        ? 'bg-purple-600 text-white' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE VIEWPORT SCENE SWITCHER */}
      <main className="flex-grow z-10 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full"
          >
            {activeTab === 'explore' && (
              <ExplorePage 
                onSelectStory={handleSelectStory} 
                onNavigateToTab={handleNavigateToTab} 
                storyRatings={storyRatings}
                onRateStory={handleRateStory}
                stories={stories}
                scrollTeasers={scrollTeasers}
              />
            )}
            {activeTab === 'reader' && (
              <ReaderPage 
                currentStory={currentStory} 
                onSelectStory={handleSelectStory}
                onBackToExplore={() => handleNavigateToTab('explore')} 
                storyRatings={storyRatings}
                onRateStory={handleRateStory}
                currentUser={currentUser}
                onUpdateStoryChapters={handleUpdateStoryChapters}
              />
            )}
            {activeTab === 'community' && (
              <CommunityPage 
                onSelectStory={handleSelectStory} 
                stories={stories}
                feed={feedPosts}
                onPublishFeedPost={handlePublishFeedPost}
                scrollTeasers={scrollTeasers}
                currentUser={currentUser}
              />
            )}
            {activeTab === 'studio' && (
              <StudioPage 
                onPublishStory={handlePublishStory}
                onPublishFeedPost={handlePublishFeedPost}
                onPublishScrollTeaser={handlePublishScrollTeaser}
                stories={stories}
                onDeleteStoryBook={handleDeleteStoryBook}
                onUpdateStoryChapters={handleUpdateStoryChapters}
                onUpdateStoryCover={handleUpdateStoryCover}
                currentUser={currentUser}
                onUpdateCurrentUserRole={updateCurrentUserRole}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER METADATA (Only rendering when not in Reader's Focus view) */}
      {activeTab !== 'reader' && (
        <footer id="platform-footer" className="mt-auto border-t border-slate-900 bg-[#040409] py-12 px-6 lg:px-8 z-10 text-center relative border-b-4 border-purple-950/20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-mono">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>© 2026 CREATORVERSE INC. MULTIVERSE PROTOCOL STABLE v2.1</span>
            </div>
            <div className="flex gap-4">
              <span className="hover:text-slate-300 cursor-pointer">COEFFICIENTS</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">TERMS OF TRANSMISSION</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">DEEP DATA PRIVACY</span>
            </div>
          </div>
        </footer>
      )}

      {/* Dynamic Authentication Modal Form */}
      {openAuthModal && <AuthModal onClose={() => setOpenAuthModal(false)} />}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CreatorverseApp />
    </AuthProvider>
  );
}
