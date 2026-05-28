import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, Send, Heart, Share2, Compass, Radio, Users, CheckCircle, PlusCircle, Paperclip } from 'lucide-react';
import { FeedPost, CollabMission, DirectMessage, Story } from '../types';
import { MOCK_FEED, MOCK_MISSION, INITIAL_DMS, AUTHORS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

interface CommunityPageProps {
  onSelectStory: (story: Story) => void;
  stories: Story[];
  feed: FeedPost[];
  onPublishFeedPost: (post: FeedPost) => void;
  scrollTeasers: any[];
  currentUser?: any;
}

type SubTabType = 'pulse' | 'visionaries' | 'messages';

export default function CommunityPage({ 
  onSelectStory, 
  stories, 
  feed, 
  onPublishFeedPost,
  scrollTeasers
}: CommunityPageProps) {
  const { currentUser, setOpenAuthModal } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('pulse');
  const [localFeed, setLocalFeed] = useState<FeedPost[]>(() => feed || MOCK_FEED);
  const [missions, setMissions] = useState<CollabMission[]>(MOCK_MISSION);
  const [dms, setDms] = useState<DirectMessage[]>(INITIAL_DMS);

  // Sync prop changes back into local feed state dynamically
  React.useEffect(() => {
    if (feed) {
      setLocalFeed(feed);
    }
  }, [feed]);

  // Form states
  const [newPostText, setNewPostText] = useState<string>('');
  const [attachedStoryId, setAttachedStoryId] = useState<string>('');
  const [newMsgText, setNewMsgText] = useState<string>('');

  const [activeChatUser, setActiveChatUser] = useState({
    name: 'Vesper Thorne',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80',
    role: 'Writer'
  });

  // Handle post submittal
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setOpenAuthModal(true);
      return;
    }
    if (!newPostText.trim()) return;

    const attached = stories.find(s => s.id === attachedStoryId);

    const post: FeedPost = {
      id: `post-${Date.now()}`,
      author: {
        name: currentUser?.name || 'You (Creator Alpha)',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80',
        handle: currentUser?.handle || '@creator_alpha',
        role: currentUser?.role || 'Visionary'
      },
      timestamp: 'Just now',
      content: newPostText,
      likes: 0,
      commentsCount: 0,
      shares: 0,
      attachedStory: attached ? {
        id: attached.id,
        title: attached.title,
        preview: attached.description
      } : undefined
    };

    onPublishFeedPost(post);
    setNewPostText('');
    setAttachedStoryId('');
  };

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setOpenAuthModal(true);
      return;
    }
    if (!newMsgText.trim()) return;

    const msg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderName: 'You',
      senderAvatar: '',
      content: newMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setDms(prev => [...prev, msg]);
    setNewMsgText('');

    // Quick auto response simulation
    setTimeout(() => {
      const response: DirectMessage = {
        id: `msg-resp-${Date.now()}`,
        senderName: activeChatUser.name,
        senderAvatar: activeChatUser.avatar,
        content: `Transmitting on secure link... Your message has been integrated. Let\'s review this draft in-depth tomorrow.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      };
      setDms(prev => [...prev, response]);
    }, 1500);
  };

  // Apply to mission
  const handleApplyMission = (id: string) => {
    if (!currentUser) {
      setOpenAuthModal(true);
      return;
    }
    setMissions(prev => 
      prev.map(m => m.id === id ? { ...m, status: 'Applied', spotsFilled: m.spotsFilled + 1 } : m)
    );
  };

  // Toggle feed like
  const handleToggleLikePost = (id: string) => {
    if (!currentUser) {
      setOpenAuthModal(true);
      return;
    }
    setLocalFeed(prev => 
      prev.map(p => {
        if (p.id === id) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : p.likes - 1
          };
        }
        return p;
      })
    );
  };

  return (
    <div id="community-root" className="min-h-screen text-slate-100 bg-[#07070d] pb-20 font-sans">
      
      {/* Page Header banner */}
      <div id="community-header" className="border-b border-slate-900 bg-[#0a0a14] py-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-bold">
              Deep Space Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">Creatorverse Guildhall</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Submit speculative updates, join collaboration missions, or chat directly with high-rank visionaries</p>
          </div>

          {/* Sub Navigation */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              id="subtab-pulse"
              onClick={() => setActiveSubTab('pulse')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeSubTab === 'pulse' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Pulse Feed
            </button>
            <button
              id="subtab-visionaries"
              onClick={() => setActiveSubTab('visionaries')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeSubTab === 'visionaries' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Missions & Guilds
            </button>
            <button
              id="subtab-messages"
              onClick={() => {
                if (!currentUser) {
                  setOpenAuthModal(true);
                } else {
                  setActiveSubTab('messages');
                }
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeSubTab === 'messages' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Messages
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT COLUMN: Mini Profile & Directory */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Mini Profile */}
            <div id="user-stub" className="rounded-2xl bg-slate-950/45 border border-slate-800 p-5 text-center relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-indigo-700 to-purple-800" />
              <div className="relative mt-4">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="My Avatar"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full border-4 border-slate-950 mx-auto bg-slate-900"
                />
              </div>
              <h3 className="text-md font-bold text-white mt-3">You (Creator Alpha)</h3>
              <p className="text-xs text-slate-400 font-mono">@creator_alpha</p>
              <span className="inline-block mt-3 px-3 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 border border-purple-500/25 text-purple-300">
                ACTIVE VISIONARY
              </span>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-900 text-xs">
                <div>
                  <span className="font-bold text-white block">12</span>
                  <span className="text-slate-500 text-[10px] uppercase">Draft Projects</span>
                </div>
                <div className="border-l border-slate-900">
                  <span className="font-bold text-white block">142</span>
                  <span className="text-slate-500 text-[10px] uppercase">Collabs Joined</span>
                </div>
              </div>
            </div>

            {/* Platform Core Creators Directory */}
            <div id="creators-directory" className="rounded-2xl bg-slate-950/40 border border-slate-800/80 p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Elite Sector Creators</h3>
              <div className="space-y-4">
                {Object.values(AUTHORS).map((author) => (
                  <button
                    id={`dir-user-${author.handle}`}
                    key={author.handle}
                    onClick={() => {
                      setActiveChatUser({ name: author.name, avatar: author.avatar, role: author.role });
                      setActiveSubTab('messages');
                    }}
                    className="w-full flex items-center justify-between text-left hover:bg-slate-900/60 p-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={author.avatar}
                        alt={author.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full border border-slate-850"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">{author.name}</span>
                        <span className="text-[10px] text-slate-500 block truncate">{author.handle}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono text-purple-400">
                      {author.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN COLUMN & RIGHT SIDE depending on activeSubTab */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Pulse Tab View */}
              {activeSubTab === 'pulse' && (
                <motion.div
                  key="feed-view-pane"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Share A Yarn Composer */}
                  <form 
                    id="composer-form" 
                    onSubmit={handleCreatePost}
                    className="rounded-2xl bg-slate-950/65 border border-slate-800/80 p-5"
                  >
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <PlusCircle className="w-4 h-4 text-purple-400" />
                      Share a Yarn / Speculative Update
                    </h3>
                    <textarea
                      id="feed-composer-input"
                      value={newPostText}
                      onChange={(e) => setNewPostText(e.target.value)}
                      placeholder="Transmitting creative thoughts... 'My newly synthesized aquatic nebula on floor 340 carries memory cores...'"
                      rows={3}
                      className="w-full bg-[#0d0d16] border border-slate-800 p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 rounded-xl focus:border-indigo-500 focus:outline-none"
                    />

                    {/* Attach story toggle */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono uppercase">Reference Story:</span>
                        <select
                          id="feed-composer-attach-select"
                          value={attachedStoryId}
                          onChange={(e) => setAttachedStoryId(e.target.value)}
                          className="bg-[#0e0e16] border border-slate-800 px-3 py-1 text-[11px] text-slate-300 rounded cursor-pointer max-w-[200px]"
                        >
                          <option value="">No attachment</option>
                          {stories.map(s => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        id="feed-post-submit"
                        type="submit"
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Transmit Page
                      </button>
                    </div>
                  </form>

                  {/* Feed Items */}
                  <div id="pulse-posts-list" className="space-y-6">
                    {localFeed.map((post) => (
                      <article
                        id={`feed-post-${post.id}`}
                        key={post.id}
                        className="rounded-2xl bg-slate-950/45 border border-slate-800 p-5 shadow-sm hover:border-slate-800 transition-colors"
                      >
                        {/* Header metadata */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={post.author.avatar}
                              alt={post.author.name}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-full border border-slate-800"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-white">{post.author.name}</span>
                                <span className="text-[10px] text-indigo-400 font-mono">{post.author.handle}</span>
                              </div>
                              <span className="text-[9px] text-slate-500 font-mono block tracking-wider uppercase">
                                {post.author.role} • {post.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Content text */}
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words whitespace-pre-line">
                          {post.content}
                        </p>

                        {/* Feed Attached Graphic Media / Speculative Visual Edit */}
                        {post.imageUrl && (
                          <div className="mt-4 overflow-hidden rounded-xl border border-slate-900 bg-[#0d0d16]/90">
                            <img 
                              src={post.imageUrl} 
                              alt="Creative visual artwork edit" 
                              referrerPolicy="no-referrer"
                              className="w-full max-h-96 object-cover hover:scale-[1.01] transition-transform duration-300"
                            />
                          </div>
                        )}

                        {/* Attached story snippet */}
                        {post.attachedStory && (
                          <div 
                            id={`attached-stub-${post.attachedStory.id}`}
                            className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-950/20 to-slate-950 border border-purple-900/30 flex justify-between items-center gap-4"
                          >
                            <div className="min-w-0">
                              <span className="text-[9px] uppercase font-mono tracking-widest text-purple-400 block mb-1">ATTACHED STORY ENTRY</span>
                              <h4 className="text-xs font-bold text-white block truncate">{post.attachedStory.title}</h4>
                              <p className="text-[11px] text-slate-400 truncate mt-1">{post.attachedStory.preview}</p>
                            </div>
                            <button
                              id={`load-attached-story-${post.attachedStory.id}`}
                              onClick={() => {
                                const matched = stories.find(s => s.id === post.attachedStory?.id);
                                if (matched) onSelectStory(matched);
                              }}
                              className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 text-[10px] font-bold rounded-lg flex-shrink-0 cursor-pointer transition-colors"
                            >
                              Load Reader
                            </button>
                          </div>
                        )}

                        {/* Bottom Row actions */}
                        <div className="flex items-center gap-6 mt-5 pt-3 border-t border-slate-900 text-xs text-slate-400">
                          <button
                            id={`feed-like-btn-${post.id}`}
                            onClick={() => handleToggleLikePost(post.id)}
                            className="flex items-center gap-1.5 hover:text-red-400 cursor-pointer transition-colors"
                          >
                            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500 animate-bounce' : ''}`} />
                            <span className="font-mono">{post.likes} Likes</span>
                          </button>

                          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <MessageSquare className="w-4 h-4" />
                            <span className="font-mono">{post.commentsCount} Comments</span>
                          </div>

                          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <Share2 className="w-4 h-4" />
                            <span className="font-mono">{post.shares} Shares</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Mission Guilds View */}
              {activeSubTab === 'visionaries' && (
                <motion.div
                  key="missions-view-pane"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="rounded-2xl bg-gradient-to-r from-[#170e2b] to-[#0d0a14] border border-indigo-900/30 p-6">
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <Sparkles className="text-purple-400 w-5 h-5 animate-pulse" />
                      Platform Collaboration Guilds
                    </h2>
                    <p className="text-xs sm:text-sm text-indigo-200 mt-2 leading-relaxed">
                      Writers need artists. Designers need audio producers. Tap on a community mission to pitch your bio-metric keys or join active production teams to claim co-author recognition and co-creator credits.
                    </p>
                  </div>

                  <div id="missions-list" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {missions.map((m) => {
                      const isCompleted = m.spotsFilled >= m.totalSpots;
                      const hasApplied = m.status === 'Applied';
                      return (
                        <div
                          id={`mission-card-${m.id}`}
                          key={m.id}
                          className="rounded-2xl bg-slate-950/50 border border-slate-800 p-5 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-4 mb-3">
                              <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-300 font-bold uppercase">
                                {m.category}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">Host: {m.host}</span>
                            </div>

                            <h3 className="text-md font-bold text-white block">{m.title}</h3>
                            <p className="text-xs text-slate-400 mt-3 leading-relaxed">{m.description}</p>

                            <div className="mt-4 p-3 bg-slate-900/40 border border-slate-850 rounded-lg text-xs">
                              <span className="text-slate-500 uppercase tracking-widest text-[9px] font-mono block mb-1">CONTRACT COMPENSATION</span>
                              <span className="font-semibold text-purple-400 font-mono">{m.reward}</span>
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-between">
                            <div className="text-xs">
                              <span className="text-slate-500 font-mono">Guild slots fills:</span>
                              <div className="flex items-center gap-1.5 mt-1 font-mono font-semibold text-white">
                                <span>{m.spotsFilled}</span>
                                <span className="opacity-40">/</span>
                                <span>{m.totalSpots}</span>
                              </div>
                            </div>

                            {hasApplied ? (
                              <button
                                id={`apply-btn-disabled-${m.id}`}
                                disabled
                                className="px-4 py-1.8 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-default"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Credentials Dispatched
                              </button>
                            ) : (
                              <button
                                id={`apply-btn-${m.id}`}
                                onClick={() => handleApplyMission(m.id)}
                                disabled={isCompleted}
                                className={`px-4 py-1.8 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                                  isCompleted 
                                    ? 'bg-slate-900 border border-slate-850 text-slate-400 cursor-default'
                                    : 'bg-indigo-600 hover:bg-indigo-505 text-white shadow-lg'
                                }`}
                              >
                                {isCompleted ? 'Guild Is Full' : 'Apply to Guild'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Messages View */}
              {activeSubTab === 'messages' && (
                <motion.div
                  key="messages-view-pane"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl bg-slate-950/50 border border-slate-800 p-4 min-h-[500px]"
                >
                  {/* Chats list (Left section) */}
                  <div className="col-span-1 border-r border-slate-900/50 pb-4 md:pb-0 pr-0 md:pr-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Active Channels</h3>
                    <div className="space-y-2">
                      <button
                        id="select-channel-vesper"
                        onClick={() => setActiveChatUser({ name: 'Vesper Thorne', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80', role: 'Writer' })}
                        className={`w-full flex items-center gap-3 p-3 text-left rounded-xl transition-colors cursor-pointer ${
                          activeChatUser.name === 'Vesper Thorne' ? 'bg-[#15112f] border border-indigo-900/50' : 'hover:bg-slate-900/50 border border-transparent'
                        }`}
                      >
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
                          alt="Vesper"
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full border border-slate-800"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-200 block truncate">Vesper Thorne</span>
                          <span className="text-[10px] text-slate-400 block truncate leading-relaxed">Transmitting on Floor 150 project...</span>
                        </div>
                      </button>

                      <button
                        id="select-channel-kaelen"
                        onClick={() => setActiveChatUser({ name: 'Kaelen Vox', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80', role: 'Designer' })}
                        className={`w-full flex items-center gap-3 p-3 text-left rounded-xl transition-colors cursor-pointer ${
                          activeChatUser.name === 'Kaelen Vox' ? 'bg-[#15112f] border border-indigo-900/50' : 'hover:bg-slate-900/50 border border-transparent'
                        }`}
                      >
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80"
                          alt="Kaelen"
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full border border-slate-800"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-200 block truncate">Kaelen Vox</span>
                          <span className="text-[10px] text-slate-500 block truncate leading-relaxed">Let\'s code these memory registers...</span>
                        </div>
                      </button>

                      <button
                        id="select-channel-lyra"
                        onClick={() => setActiveChatUser({ name: 'Lyra Vance', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80', role: 'Artist' })}
                        className={`w-full flex items-center gap-3 p-3 text-left rounded-xl transition-colors cursor-pointer ${
                          activeChatUser.name === 'Lyra Vance' ? 'bg-[#15112f] border border-indigo-900/50' : 'hover:bg-slate-900/50 border border-transparent'
                        }`}
                      >
                        <img
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80"
                          alt="Lyra"
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full border border-slate-800"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-200 block truncate">Lyra Vance</span>
                          <span className="text-[10px] text-slate-500 block truncate leading-relaxed"> Antarctica coordinate contour code lines...</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Active Message stream (Right section) */}
                  <div className="col-span-1 md:col-span-2 flex flex-col justify-between min-h-[380px]">
                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-slate-900/40 pb-3 mb-4">
                      <img
                        src={activeChatUser.avatar}
                        alt="Active Avatar"
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full border border-slate-850"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-100 block">{activeChatUser.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">{activeChatUser.role} • Transmitting</span>
                        </div>
                      </div>
                    </div>

                    {/* Messages scroll */}
                    <div id="chat-messages-scroll" className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[290px] mscrollbar-thin mb-4">
                      {dms.map((msg) => (
                        <div
                          id={`chat-msg-${msg.id}`}
                          key={msg.id}
                          className={`flex items-start gap-2.5 max-w-[85%] text-xs ${
                            msg.isMe ? 'ml-auto flex-row-reverse' : ''
                          }`}
                        >
                          {!msg.isMe && (
                            <img
                              src={msg.senderAvatar}
                              alt="Sender"
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-full border border-slate-850 flex-shrink-0"
                            />
                          )}
                          <div>
                            <div className={`p-3 rounded-2xl ${
                              msg.isMe 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-[#0e0e15] text-slate-300 border border-slate-900 rounded-tl-none'
                            }`}>
                              <p className="leading-relaxed">{msg.content}</p>
                            </div>
                            <span className={`text-[9px] text-slate-500 font-mono mt-1 block ${msg.isMe ? 'text-right' : ''}`}>
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chat composer form */}
                    <form id="chat-composer-form" onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        id="chat-composer-input"
                        type="text"
                        value={newMsgText}
                        onChange={(e) => setNewMsgText(e.target.value)}
                        placeholder={`Transmit response to ${activeChatUser.name.split(' ')[0]}...`}
                        className="flex-1 bg-[#090910] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        id="chat-send-btn"
                        type="submit"
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

    </div>
  );
}
