import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, BarChart2, Plus, Users, Award, BookOpen, Clock, Send, Eye, Paintbrush,
  PenTool, Clipboard, Edit3, Trash2, Tag, Music, Grid, Image, Volume2, CheckCircle2, Play, Pause
} from 'lucide-react';
import { CreatorProject, Story, FeedPost, ScrollTeaser } from '../types';
import { MOCK_PROJECTS } from '../data/mockData';
import { TROPES_CATEGORIES, ALL_TROPES, MOCK_MUSIC_TRACKS, DESIGN_GRADIENTS } from '../data/tropes';

interface StudioPageProps {
  onPublishStory: (story: Story) => void;
  onPublishFeedPost: (post: FeedPost) => void;
  onPublishScrollTeaser: (scroll: ScrollTeaser) => void;
  stories: Story[];
  onDeleteStoryBook?: (storyId: string) => void;
  onUpdateStoryChapters?: (storyId: string, chapters: any[]) => void;
  onUpdateStoryCover?: (storyId: string, coverUrl: string) => void;
  currentUser?: any;
  onUpdateCurrentUserRole?: (role: any) => void;
}

// Simulated active synthesizer for inside the creator room
let studioOscillatorCtx: AudioContext | null = null;

// Speculative high-concept presets available on the app for covers & title pages
const PRESET_IMAGES = [
  { title: "Stellar Rift", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&h=500&q=80" },
  { title: "Cyber Spires", url: "https://images.unsplash.com/photo-1515621061946-eff1eed2a352?auto=format&fit=crop&w=800&h=500&q=80" },
  { title: "Ethereal Mystic", url: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&h=500&q=80" },
  { title: "Cosmic Altar", url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=800&h=500&q=80" },
  { title: "Bio-luminescent Woods", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&h=500&q=80" },
  { title: "Obsidian Citadel", url: "https://images.unsplash.com/photo-1516339901601-2e1d62d0e45f?auto=format&fit=crop&w=800&h=500&q=80" }
];

export default function StudioPage({ 
  onPublishStory, 
  onPublishFeedPost, 
  onPublishScrollTeaser,
  stories,
  onDeleteStoryBook,
  onUpdateStoryChapters,
  onUpdateStoryCover,
  currentUser,
  onUpdateCurrentUserRole
}: StudioPageProps) {
  const [projects, setProjects] = React.useState<CreatorProject[]>([]);
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<'Novel' | 'Screenplay' | 'Art Collection' | 'Short Story'>('Novel');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Dynamically filter stories to only show those authored by this specific user in their studio
  const userStories = stories.filter(s => {
    if (!currentUser) return false;
    
    const uName = currentUser.name.toLowerCase().trim();
    const sName = s.author.name.toLowerCase().trim();
    const uHandle = currentUser.handle.toLowerCase().trim();
    const sHandle = s.author.handle.toLowerCase().trim();

    // Map demo accounts to corresponding predefined creator datasets
    if (currentUser.email === 'author@creatorverse.com' && s.author.name === 'Vesper Thorne') {
      return true;
    }
    if (currentUser.email === 'photographer@creatorverse.com' && s.author.name === 'Kaelen Vox') {
      return true;
    }
    if (currentUser.email === 'editor@creatorverse.com' && s.author.name === 'Zane Vector') {
      return true;
    }
    
    return uName === sName || uHandle === sHandle;
  });

  // Helper to persist projects for the current user
  const saveProjects = (newProjects: CreatorProject[]) => {
    setProjects(newProjects);
    if (currentUser) {
      localStorage.setItem(`creatorverse_projects_${currentUser.email}`, JSON.stringify(newProjects));
    }
  };

  // Sync projects list according to current logged-in user email
  React.useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      return;
    }
    const key = `creatorverse_projects_${currentUser.email}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setProjects(JSON.parse(stored));
    } else {
      // If none, allocate customized beginner projects
      if (currentUser.email === 'author@creatorverse.com') {
        setProjects(MOCK_PROJECTS);
        localStorage.setItem(key, JSON.stringify(MOCK_PROJECTS));
      } else {
        const starter: CreatorProject[] = [
          {
            id: `proj-custom-${Date.now()}`,
            title: `${currentUser.name}'s Debut Speculative Work`,
            type: 'Novel',
            status: 'Drafting',
            completion: 10,
            lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            metrics: '0 words • Chapter 1 started'
          },
          {
            id: `proj-custom-ideas-${Date.now()}`,
            title: 'Multiverse Sci-Fi Brainstorms',
            type: 'Short Story',
            status: 'Drafting',
            completion: 35,
            lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            metrics: '120 words • Conceptual plot points'
          }
        ];
        setProjects(starter);
        localStorage.setItem(key, JSON.stringify(starter));
      }
    }
  }, [currentUser]);

  // Creative Generator Workspace States
  const [speculatingGenre, setSpeculatingGenre] = useState<string>('Cosmic Fantasy');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>(
    'Select a speculative genre and activate the Speculating Matrix to generate high-concept worldbuilding prompts.'
  );
  const [draftText, setDraftText] = useState<string>('');
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);

  // Active creator posting form state
  const [activeCreatorTab, setActiveCreatorTab] = useState<'story' | 'edit' | 'scroll'>('story');
  const [submitNotification, setSubmitNotification] = useState<string | null>(null);

  // 1. Story form states
  const [storyTitle, setStoryTitle] = useState('');
  const [storyCategory, setStoryCategory] = useState('Sci-Fi');
  const [storyDesc, setStoryDesc] = useState('');
  const [storyImage, setStoryImage] = useState('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&h=500&q=80');
  const [storyChapters, setStoryChapters] = useState('Chapter 1\nThe air in the spire was thin...');
  const [storyReadTime, setStoryReadTime] = useState('6 min read');
  const [storySelectedTropes, setStorySelectedTropes] = useState<string[]>([]);
  const [storySearchTropeQuery, setStorySearchTropeQuery] = useState('');

  // Story Cover Page in-app image presets selector toggles
  const [storyPublishCoverSelectOpen, setStoryPublishCoverSelectOpen] = useState(false);

  // Active story portfolio manager states
  const [activeStoryFolderId, setActiveStoryFolderId] = useState<string | null>(null);
  const [activeStoryCoverEditingId, setActiveStoryCoverEditingId] = useState<string | null>(null);
  const [chapterCoverImageSelectorOpen, setChapterCoverImageSelectorOpen] = useState(false);

  // Add chapter inline states
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterBody, setNewChapterBody] = useState('');
  const [newChapterPicUrl, setNewChapterPicUrl] = useState('');

  // 2. Edit / Picture form states
  const [editTitle, setEditTitle] = useState('');
  const [editImage, setEditImage] = useState('https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&h=500&q=80');
  const [editCaption, setEditCaption] = useState('');

  // 3. Scroll Teaser form states
  const [scrollTitle, setScrollTitle] = useState('');
  const [scrollBodyText, setScrollBodyText] = useState('');
  const [scrollGradient, setScrollGradient] = useState('from-stone-900 via-yellow-950 to-neutral-950 bg-gradient-to-b');
  const [scrollMusicId, setScrollMusicId] = useState('track-4');
  const [scrollSelectedTropes, setScrollSelectedTropes] = useState<string[]>([]);
  const [scrollDuration, setScrollDuration] = useState<number>(45); // range between 20 to 80
  const [scrollVideoType, setScrollVideoType] = useState<'trailer' | 'update'>('trailer');

  // Studio Ambient Playback Sound State (like Instagram feature)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const startStudioSynth = (trackId: string) => {
    try {
      stopStudioSynth();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      studioOscillatorCtx = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      let freqHz = 110;
      if (trackId === 'track-1') freqHz = 130.81;
      else if (trackId === 'track-2') freqHz = 98.00;
      else if (trackId === 'track-3') freqHz = 220.00;
      else if (trackId === 'track-4') freqHz = 146.83;
      else if (trackId === 'track-5') freqHz = 82.41;
      else freqHz = 164.81;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freqHz, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(2, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.015, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.05, ctx.currentTime); // delicate safe room volume

      osc.start();
      lfo.start();
      setPlayingTrackId(trackId);
    } catch(err) {
      console.warn("Studio Synth track failure", err);
    }
  };

  const stopStudioSynth = () => {
    if (studioOscillatorCtx) {
      try {
        studioOscillatorCtx.close();
      } catch (e) {}
      studioOscillatorCtx = null;
    }
    setPlayingTrackId(null);
  };

  const toggleStudioSynth = (trackId: string) => {
    if (playingTrackId === trackId) {
      stopStudioSynth();
    } else {
      startStudioSynth(trackId);
    }
  };

  // Lists of prompt elements for randomized generator
  const subjectPool = [
    'An infinite obsidian skyscraper hanging over Venus',
    'A silent sensory coder in the cybernetic core',
    'A mechanical seed vault buried under cold Antarctic contours',
    'A research vessel repeats the last 45 minutes of spaceflight',
    'An ancient quantum mapping stylus that hums with coordinates'
  ];

  const complicationPool = [
    'whose synthetic floors are merging physical boundaries',
    'discovers an illegal memory file that belongs to an alien origin',
    'secretly holds the cryptographic coordinate maps of an unpolluted planet',
    'only to find the captain is actively planning to break the loops',
    'begins to translate physical objects into coordinate equations'
  ];

  const visualTonePool = [
    'illuminated by Chemical Pink rain and matte carbon hulls.',
    'framed by deep auroral violet halos and solar panel rings.',
    'dripping with cold mineral condensation and dry savannah grass.',
    'vibrating under high-frequency holographic lines of gold.',
    'accompanied by industrial synthwave and galactic loops.'
  ];

  const handleGeneratePrompt = () => {
    const s = subjectPool[Math.floor(Math.random() * subjectPool.length)];
    const c = complicationPool[Math.floor(Math.random() * complicationPool.length)];
    const v = visualTonePool[Math.floor(Math.random() * visualTonePool.length)];
    setGeneratedPrompt(`[${speculatingGenre}] ${s} ${c}, ${v}`);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newProj: CreatorProject = {
      id: `proj-${Date.now()}`,
      title: title,
      type: type,
      status: 'Drafting',
      completion: 10,
      lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      metrics: '0 words • Chapter 1 started'
    };

    saveProjects([newProj, ...projects]);
    setTitle('');
    setShowAddForm(false);
  };

  const handleRemoveProject = (id: string) => {
    saveProjects(projects.filter(p => p.id !== id));
  };

  const handleIncrementCompletion = (id: string) => {
    const updated = projects.map(p => {
      if (p.id === id) {
        const nextComp = Math.min(100, p.completion + 10);
        return {
          ...p,
          completion: nextComp,
          status: nextComp === 100 ? 'Published' : p.status,
          metrics: nextComp === 100 ? 'Published to Library' : p.metrics
        };
      }
      return p;
    });
    saveProjects(updated);
  };

  // Multi-trope select operations
  const handleToggleTropeSelection = (trope: string) => {
    if (activeCreatorTab === 'story') {
      setStorySelectedTropes(prev => 
        prev.includes(trope) ? prev.filter(t => t !== trope) : [...prev, trope]
      );
    } else if (activeCreatorTab === 'scroll') {
      setScrollSelectedTropes(prev => 
        prev.includes(trope) ? prev.filter(t => t !== trope) : [...prev, trope]
      );
    }
  };

  // Photographer states and handler
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoUrl, setPhotoUrl] = useState(PRESET_IMAGES[0].url);
  const [photoLens, setPhotoLens] = useState('50mm f/1.2');
  const [photoShutter, setPhotoShutter] = useState('1/250s');
  const [photoISO, setPhotoISO] = useState('400');
  const [photoCategory, setPhotoCategory] = useState<'Concept Art' | 'Character Design' | 'World Map'>('Concept Art');

  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle.trim()) return;

    onPublishFeedPost({
      id: `photo-${Date.now()}`,
      author: {
        name: currentUser?.name || 'Gavin Shutter',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
        handle: currentUser?.handle || '@gav_shutter',
        role: 'Photographer'
      },
      timestamp: 'Just now',
      content: `### 📷 PHOTOGRAPHER PORTFOLIO SPECIFICATIONS\n- **Project**: *${photoTitle}*\n- **Category**: ${photoCategory}\n- **Lens Focal Dimension**: \\\`${photoLens}\\\`\n- **Shutter Rate**: \\\`${photoShutter}\\\`\n- **ISO Factor**: \\\`${photoISO}\\\`\n\nDirectly uploaded from my visual telemetry board. Refitting and styling matrices.`,
      imageUrl: photoUrl,
      likes: 6,
      commentsCount: 1,
      shares: 2
    });

    setPhotoTitle('');
    triggerNotification(`Successfully dispatched photography portfolio asset to Deep Space Feed!`);
  };

  // POST SUBMISSION SUITE ACTIONS
  const submitStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitle.trim() || !storyDesc.trim()) return;

    const newStory: Story = {
      id: `story-custom-${Date.now()}`,
      title: storyTitle,
      author: {
        name: currentUser?.name || 'You (Creator Host)',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80',
        handle: currentUser?.handle || '@host_creator',
        role: currentUser?.role || 'Author'
      },
      description: storyDesc,
      category: storyCategory,
      coverUrl: storyImage || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&h=500&q=80',
      readTime: storyReadTime || '5 min read',
      likes: 0,
      wordCount: storyChapters.split(/\s+/).length,
      avgRating: 5.0,
      ratingCount: 1,
      tropes: storySelectedTropes.length > 0 ? storySelectedTropes : ['Writer Guild Selection'],
      chapters: [
        {
          title: 'I. Induction',
          paragraphs: storyChapters.split('\n\n').filter(p => p.trim() !== '')
        }
      ]
    };

    onPublishStory(newStory);
    
    // Also auto spin a creator project log
    const projectLog: CreatorProject = {
      id: `proj-${Date.now()}`,
      title: storyTitle,
      type: 'Short Story',
      status: 'Published',
      completion: 100,
      lastUpdated: 'Just now',
      metrics: 'Published directly to the core digital library'
    };
    saveProjects([projectLog, ...projects]);

    // Cleanup Story fields
    setStoryTitle('');
    setStoryDesc('');
    setStorySelectedTropes([]);
    setStoryChapters('Chapter 1\n...');
    triggerNotification(`Story "${storyTitle}" was successfully logged & published!`);
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editCaption.trim()) return;

    const newPost: FeedPost = {
      id: `post-edit-${Date.now()}`,
      author: {
        name: currentUser?.name || 'You (Creator Host)',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80',
        handle: currentUser?.handle || '@host_creator',
        role: currentUser?.role || 'Author'
      },
      timestamp: 'Just now',
      content: `### EDIT PREVIEW: "${editTitle}"\n\n${editCaption}`,
      imageUrl: editImage,
      likes: 1,
      commentsCount: 0,
      shares: 0
    };

    onPublishFeedPost(newPost);

    // Cleanup Edit fields
    setEditTitle('');
    setEditCaption('');
    triggerNotification(`Dynamic visual edit published straight to Deep Space Feed!`);
  };

  const submitScrollTeaser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrollTitle.trim() || !scrollBodyText.trim()) return;

    const newTeaser: ScrollTeaser = {
      id: `scroll-custom-${Date.now()}`,
      title: scrollTitle,
      text: scrollBodyText,
      tropes: scrollSelectedTropes.length > 0 ? scrollSelectedTropes : ['Creative Teaser'],
      author: {
        name: currentUser?.name || 'You (Creator Host)',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80',
        handle: currentUser?.handle || '@host_creator',
        role: currentUser?.role || 'Author'
      },
      bgGradient: scrollGradient,
      musicTrackId: scrollMusicId,
      likes: 0,
      commentsCount: 0,
      timestamp: 'Just now',
      duration: scrollDuration,
      videoType: scrollVideoType,
      views: Math.floor(Math.random() * 200) + 50,
      shares: Math.floor(Math.random() * 10) + 1,
      completionRate: Math.floor(Math.random() * 15) + 75,
      watchTime: Math.round((Math.random() * 3 + 1) * 10) / 10
    };

    onPublishScrollTeaser(newTeaser);

    // Cleanup Scroll fields
    setScrollTitle('');
    setScrollBodyText('');
    setScrollSelectedTropes([]);
    triggerNotification(`Teaser scroll "${scrollTitle}" appended to Explore Page!`);
  };

  const triggerNotification = (msg: string) => {
    setSubmitNotification(msg);
    setTimeout(() => {
      setSubmitNotification(null);
    }, 5000);
  };

  // Autocomplete trope search listing
  const searchedTropes = ALL_TROPES.filter(t => 
    t.toLowerCase().includes(storySearchTropeQuery.toLowerCase())
  ).slice(0, 8);

  const activeSelectedTropesArray = activeCreatorTab === 'story' ? storySelectedTropes : scrollSelectedTropes;

  return (
    <div id="studio-root" className="min-h-screen text-slate-100 bg-[#07070d] pb-20 font-sans relative">
      
      {/* Toast alert */}
      <AnimatePresence>
        {submitNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 p-4 bg-[#0d1512] border border-emerald-500/40 rounded-xl flex items-center gap-3 shadow-2xl max-w-sm"
          >
            <CheckCircle2 className="text-emerald-400 w-5 h-5 flex-shrink-0" />
            <p className="text-xs text-slate-200 font-semibold">{submitNotification}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <div id="studio-header" className="border-b border-slate-900 bg-[#0a0a14] py-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-bold">
              Creator Studio Panel
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-sans">Workspace & Submission Guild</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Audit active drafts, publish stories with custom tropes, or draft Instagram-inspired visual scrolls.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="broadcast-status-btn"
              onClick={() => setIsBroadcasting(!isBroadcasting)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                isBroadcasting 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 animate-pulse'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isBroadcasting ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`} />
              {isBroadcasting ? 'Broadcasting Availability' : 'Signal Availability'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-10">

        {/* GUILD ACCESS ACTIVE STATUS HEADER & ACTIONS */}
        <div id="guild-status-header" className="rounded-2xl bg-[#090915] border border-slate-900 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-left w-full md:w-auto">
            <div className="relative">
              <img 
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=120&h=120&q=80'} 
                alt="Active Session User" 
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
              />
              <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[7.5px] font-bold text-white border-2 border-[#090915] ${
                currentUser?.role === 'Reader' ? 'bg-emerald-500' :
                currentUser?.role === 'Author' ? 'bg-purple-500' :
                currentUser?.role === 'Photographer' ? 'bg-amber-500' : 'bg-cyan-500'
              }`}>
                {currentUser?.role ? currentUser.role[0] : 'G'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100">{currentUser?.name || 'Guest Operative'}</span>
                <span className="text-[9px] font-mono font-bold text-slate-500 tracking-wider">({currentUser?.handle || '@guest'})</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Current clearance level: <span className="text-purple-400 font-bold font-mono uppercase">{currentUser?.role || 'Guest'}</span> • Accessing active creator cores.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <span className="text-[10px] text-slate-500 font-mono">Switch Role:</span>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-905 gap-1">
              {(['Reader', 'Author', 'Photographer', 'Editor'] as const).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    if (onUpdateCurrentUserRole) onUpdateCurrentUserRole(role);
                  }}
                  className={`px-2 py-1 rounded text-[9.5px] font-mono cursor-pointer transition ${
                    currentUser?.role === role 
                      ? 'bg-purple-900/40 border border-purple-500/30 text-purple-300 font-bold' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ROLE SECURITY NOTICE */}
        {currentUser?.role !== 'Author' && (
          <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-900/35 text-left space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Award className="w-5 h-5 animate-pulse" />
              <h3 className="text-xs font-bold font-mono tracking-widest uppercase">AUTHOR LICENSE SECURITY VERIFICATION</h3>
            </div>
            <p className="text-xs text-slate-350 leading-relaxed max-w-2xl">
              You are currently authenticated as a <span className="text-purple-400 uppercase font-bold">{currentUser?.role || 'Guest'}</span>. 
              Creating story books and threading chapter logs in our database requires **Author** status. Swap profiles above or upgrade in one click to unlock story drafting.
            </p>
            <button
               type="button"
               onClick={() => {
                 if (onUpdateCurrentUserRole) {
                   onUpdateCurrentUserRole('Author');
                   triggerNotification("Security clearance elevated to Author! Unlocking drafting cores.");
                 }
               }}
               className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-mono font-bold text-[10px] rounded shadow cursor-pointer uppercase transition-all hover:scale-[1.01]"
            >
              Promote profile to Author Role instantly
            </button>
          </div>
        )}

        {/* EXCLUSIVE PHOTOGRAPHER LAB */}
        {currentUser?.role === 'Photographer' && (
          <div className="p-6 rounded-2xl bg-[#080812] border border-slate-900 text-left space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Image className="text-amber-400 w-5 h-5 animate-pulse" />
                <h3 className="text-sm font-extrabold text-white tracking-widest uppercase font-mono">📷 PHOTOGRAPHER PORTFOLIO SUBMISSION LAB</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                As an approved visual director, publish visual assets to the live feed with focal exposure telemetry.
              </p>
            </div>

            <form onSubmit={handlePhotoSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1 font-bold">Image Concept Title</label>
                  <input 
                    type="text"
                    required
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    placeholder="e.g. Neo-Tokyo Drone Eye"
                    className="w-full bg-[#050510] border border-slate-850 p-2.5 text-xs text-slate-100 rounded focus:border-purple-500 focus:outline-none placeholder-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1 font-bold">Select Portfolio Backdrop preset</label>
                  <select 
                    value={photoUrl} 
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full bg-[#050510] border border-slate-850 p-2.5 text-xs text-slate-100 rounded focus:border-purple-500 focus:outline-none"
                  >
                    {PRESET_IMAGES.map((img, i) => (
                      <option key={i} value={img.url}>{img.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1 font-bold">Lens (Focal)</label>
                    <select 
                      value={photoLens}
                      onChange={(e) => setPhotoLens(e.target.value)}
                      className="w-full bg-[#050510] border border-slate-850 p-2 text-xs text-slate-100 rounded focus:outline-none"
                    >
                      <option value="50mm f/1.2">50mm f/1.2</option>
                      <option value="85mm f/1.4">85mm f/1.4</option>
                      <option value="24mm f/2.4">24mm f/2.4</option>
                      <option value="135mm f/1.8">135mm f/1.8</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1 font-bold">Shutter</label>
                    <select 
                      value={photoShutter}
                      onChange={(e) => setPhotoShutter(e.target.value)}
                      className="w-full bg-[#050510] border border-slate-850 p-2 text-xs text-slate-100 rounded focus:outline-none"
                    >
                      <option value="1/250s">1/250s</option>
                      <option value="1/1000s">1/1000s</option>
                      <option value="1/60s">1/60s</option>
                      <option value="1/2s">1/2s</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1 font-bold">ISO rating</label>
                    <select 
                      value={photoISO}
                      onChange={(e) => setPhotoISO(e.target.value)}
                      className="w-full bg-[#050510] border border-slate-850 p-2 text-xs text-slate-100 rounded focus:outline-none"
                    >
                      <option value="100">100</option>
                      <option value="400">400</option>
                      <option value="1600">1600</option>
                      <option value="3200">3200</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1 font-bold">Graphic Concept Category</label>
                  <div className="flex gap-2">
                    {(['Concept Art', 'Character Design', 'World Map'] as const).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setPhotoCategory(cat)}
                        className={`px-3 py-1.5 text-[10px] rounded cursor-pointer border transition-all ${
                          photoCategory === cat 
                            ? 'bg-amber-950/40 border-amber-500 text-amber-300 font-bold shadow-sm' 
                            : 'bg-transparent border-slate-850 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-end gap-3">
                <div className="flex items-center gap-2.5 p-2 bg-[#050510] border border-slate-850 rounded">
                  <img src={photoUrl} alt="Selected preview" referrerPolicy="no-referrer" className="w-12 h-10 object-cover rounded border border-slate-800" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block truncate font-mono">Aspect Ratio Sealed</span>
                    <span className="text-[8.5px] text-slate-500 block truncate">Ready for fast dispatch</span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="py-2 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-mono font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer shadow-md transition-all hover:scale-[1.01]"
                >
                  Publish Photography Asset
                </button>
              </div>
            </form>
          </div>
        )}

        {/* EDITOR DESK WIDGET */}
        {currentUser?.role === 'Editor' && (
          <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-900/35 text-left space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Edit3 className="w-5 h-5 animate-pulse" />
              <h3 className="text-xs font-bold font-mono tracking-widest uppercase">EDITOR DESK CONTROL CORE INSTALLED</h3>
            </div>
            <p className="text-xs text-slate-350 leading-relaxed max-w-2xl">
              You hold full proofreading & rewrite privileges in this cosmic library. Directly alter paragraphs or correct dialogue flows in real-time within the Reader view!
            </p>
          </div>
        )}

        {/* BENTO GRID DASHBOARD METRICS */}
        <div id="analytics-bento-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative rounded-2xl bg-slate-950/45 border border-slate-800/80 p-6 flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">ACTIVE DRAFTS</span>
              <div className="p-1.5 rounded-lg bg-[#6366f1]/10 text-[#818cf8]">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-6">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{projects.length}</span>
              <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 mt-2 font-mono">
                <span>Active local tracking logs</span>
              </div>
            </div>
          </div>

          <div className="group relative rounded-2xl bg-slate-950/45 border border-slate-800/80 p-6 flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">COSMIC FANS</span>
              <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-6">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">5,842</span>
              <div className="flex items-center gap-1.5 text-[11px] text-pink-400 mt-2 font-mono">
                <span>+244 organic hits</span>
              </div>
            </div>
          </div>

          <div className="group relative rounded-2xl bg-slate-950/45 border border-slate-800/80 p-6 flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">CREATIVITY LEVEL</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-6">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">92.4%</span>
              <div className="flex items-center gap-1.5 text-[11px] text-purple-400 mt-2 font-mono">
                <span>Highly dynamic index</span>
              </div>
            </div>
          </div>

          <div className="group relative rounded-2xl bg-slate-950/45 border border-slate-800/80 p-6 flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">ATMOSPHERIC VIEWS</span>
              <div className="p-1.5 rounded-lg bg-[#06b6d4]/10 text-[#22d3ee]">
                <BarChart2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-6">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">48.3K</span>
              <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 mt-2 font-mono">
                <span>Outstanding real views</span>
              </div>
            </div>
          </div>
        </div>

        {/* THE MAIN CREATIVE HUB & SUBMISSIONS FOR STORIES / PICTURES / SCROLLS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* EASY CREATOR PUBLISHING SUITE */}
            <div className="rounded-2xl bg-slate-950/65 border border-purple-500/15 p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />
              
              <div className="mb-6">
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Plus className="text-purple-400 w-5 h-5" />
                  Creator Submissions Suite
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Draft and inject real content directly into the live universe without mock placeholders.
                </p>
              </div>

              {/* Tabs selector */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950 border border-slate-900 rounded-xl mb-6">
                <button
                  onClick={() => { setActiveCreatorTab('story'); stopStudioSynth(); }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    activeCreatorTab === 'story'
                      ? 'bg-purple-900/30 border border-purple-500/30 text-purple-200 shadow-md font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Story Work
                </button>
                <button
                  onClick={() => { setActiveCreatorTab('edit'); stopStudioSynth(); }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    activeCreatorTab === 'edit'
                      ? 'bg-purple-900/30 border border-purple-500/30 text-purple-200 shadow-md font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Image className="w-3.5 h-3.5" />
                  Visual Edit / Post
                </button>
                <button
                  onClick={() => { setActiveCreatorTab('scroll'); }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    activeCreatorTab === 'scroll'
                      ? 'bg-purple-900/30 border border-purple-500/30 text-purple-200 shadow-md font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  Scroll Teaser
                </button>
              </div>

              {/* RENDER FORM: STORY WORK */}
              {activeCreatorTab === 'story' && (
                <form onSubmit={submitStory} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-1.5">Story Title</label>
                      <input
                        type="text"
                        required
                        value={storyTitle}
                        onChange={(e) => setStoryTitle(e.target.value)}
                        placeholder="e.g. The Spacetime Collision"
                        className="w-full bg-[#090910] border border-slate-800 p-2.5 text-xs text-white placeholder-slate-500 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-1.5">Core Category</label>
                      <select
                        value={storyCategory}
                        onChange={(e) => setStoryCategory(e.target.value)}
                        className="w-full bg-[#090910] border border-slate-800 p-2.5 text-xs text-slate-300 rounded-lg cursor-pointer focus:border-purple-500 focus:outline-none"
                      >
                        <option value="Sci-Fi">Sci-Fi Universe</option>
                        <option value="Fantasy">High Fantasy Realm</option>
                        <option value="Cyberpunk">Cyberpunk Undergrid</option>
                        <option value="Surrealism">Surreal Abstract Space</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-1.5">Cover Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={storyImage}
                          onChange={(e) => setStoryImage(e.target.value)}
                          placeholder="Copy and paste index URL"
                          className="flex-grow bg-[#090910] border border-slate-800 p-2.5 text-xs text-white placeholder-slate-500 rounded-lg focus:border-purple-500 focus:outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setStoryPublishCoverSelectOpen(!storyPublishCoverSelectOpen)}
                          className="px-3 bg-purple-900/30 text-purple-300 border border-purple-800 rounded-lg text-xs hover:bg-purple-800/40 font-semibold cursor-pointer whitespace-nowrap"
                        >
                          Pick Preset Image
                        </button>
                      </div>
                      {storyPublishCoverSelectOpen && (
                        <div className="mt-3 p-3 bg-slate-950 border border-slate-900 rounded-lg grid grid-cols-3 gap-2">
                          {PRESET_IMAGES.map((preset) => (
                            <button
                              type="button"
                              key={preset.title}
                              onClick={() => {
                                setStoryImage(preset.url);
                                setStoryPublishCoverSelectOpen(false);
                              }}
                              className="group text-left relative aspect-[4/3] rounded overflow-hidden border border-slate-850 hover:border-purple-500 transition cursor-pointer"
                            >
                              <img src={preset.url} alt={preset.title} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-black/60 flex items-end p-1.5">
                                <span className="text-[8px] font-bold text-white leading-tight truncate w-full">{preset.title}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-1.5">Estimated Read Time</label>
                      <input
                        type="text"
                        value={storyReadTime}
                        onChange={(e) => setStoryReadTime(e.target.value)}
                        placeholder="e.g. 7 min read"
                        className="w-full bg-[#090910] border border-slate-800 p-2.5 text-xs text-white placeholder-slate-500 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-1.5">Story Synopsis / Metadescription</label>
                    <textarea
                      required
                      value={storyDesc}
                      onChange={(e) => setStoryDesc(e.target.value)}
                      placeholder="Type a captivating real log that summary your e-book story..."
                      rows={2}
                      className="w-full bg-[#090910] border border-slate-800 p-2.5 text-xs text-white placeholder-slate-500 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  {/* HIGH-LEVEL INTERACTIVE TROPE SELECTOR FOR STORIES */}
                  <div className="border border-slate-900 rounded-xl p-4 bg-slate-950/40">
                    <label className="block text-[10px] text-purple-400 uppercase font-mono font-bold mb-2 flex items-center justify-between">
                      <span>Bespoke Story Tropes (# Tags)</span>
                      <span className="text-slate-500 normal-case font-sans font-normal">{storySelectedTropes.length} selected</span>
                    </label>

                    {/* Active selected list */}
                    {storySelectedTropes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3 bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                        {storySelectedTropes.map((trope) => (
                          <span 
                            key={trope} 
                            onClick={() => handleToggleTropeSelection(trope)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 text-purple-200 border border-purple-500/35 rounded text-[10px] font-mono font-bold cursor-pointer hover:bg-red-900/40 hover:text-red-300"
                            title="Click to remove"
                          >
                            #{trope}
                            <span>×</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="relative mb-3">
                      <input
                        type="text"
                        value={storySearchTropeQuery}
                        onChange={(e) => setStorySearchTropeQuery(e.target.value)}
                        placeholder="Search our massive trope pool (e.g. Enemies to lovers, Chosen one, Time loop)..."
                        className="w-full bg-[#06060c] border border-slate-850 p-2 rounded text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                      />
                    </div>

                    {/* Quick trope lists suggested dynamically based on search */}
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto mscrollbar-thin pr-2">
                      {searchedTropes.map((tropeItem) => {
                        const isSelected = storySelectedTropes.includes(tropeItem);
                        return (
                          <button
                            type="button"
                            key={tropeItem}
                            onClick={() => handleToggleTropeSelection(tropeItem)}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded cursor-pointer border transition ${
                              isSelected 
                                ? 'bg-purple-600 border-purple-500 text-white font-semibold' 
                                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-850'
                            }`}
                          >
                            #{tropeItem}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-1.5">Chapter Draft text (Separated by double return to form paragraphs)</label>
                    <textarea
                      required
                      value={storyChapters}
                      onChange={(e) => setStoryChapters(e.target.value)}
                      placeholder="Write your beautiful complete story here..."
                      rows={6}
                      className="w-full bg-[#090910] border border-slate-800 p-4 text-xs font-sans text-slate-100 placeholder-slate-600 rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                    <span className="text-[10px] text-slate-500 font-mono">Word Count: {storyChapters.trim() ? storyChapters.split(/\s+/).length : 0} words</span>
                    <button
                      type="submit"
                      id="publish-custom-story-btn"
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform hover:scale-[1.02]"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Publish Speculative Story
                    </button>
                  </div>
                </form>
              )}

              {/* RENDER FORM: VISUAL EDIT / POST */}
              {activeCreatorTab === 'edit' && (
                <form onSubmit={submitEdit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-1.5">Graphic / Edit Artwork Title</label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="e.g. Chemical Pink Horizon"
                        className="w-full bg-[#090910] border border-slate-800 p-2.5 text-xs text-white placeholder-slate-500 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-1.5">Unsplash Artwork Image URL</label>
                      <input
                        type="text"
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        placeholder="Copy image URL from web"
                        className="w-full bg-[#090910] border border-slate-800 p-2.5 text-xs text-white placeholder-slate-500 rounded-lg focus:border-purple-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-1.5">Design Specs / Caption Log</label>
                    <textarea
                      required
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Share details on how you created this speculative art model, render, or graphic edit..."
                      rows={4}
                      className="w-full bg-[#090910] border border-slate-800 p-4 text-xs font-sans text-slate-100 placeholder-slate-500 rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  {/* Dynamic mock templates list for convenience */}
                  <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl">
                    <span className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-2">Preset speculatives graphics</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditImage('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80')}
                        className="p-1 border border-slate-800 rounded bg-slate-950 text-[10px] font-mono text-slate-400 hover:text-white"
                      >
                        Cyber Circuits
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditImage('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80')}
                        className="p-1 border border-slate-800 rounded bg-slate-950 text-[10px] font-mono text-slate-400 hover:text-white"
                      >
                        Magnetic Vortex
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditImage('https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=500&q=80')}
                        className="p-1 border border-slate-800 rounded bg-slate-950 text-[10px] font-mono text-slate-400 hover:text-white"
                      >
                        Liquid Vector
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end p-2 border-t border-slate-950">
                    <button
                      type="submit"
                      id="publish-custom-edit-btn"
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Broadcast Edit & Feed Post
                    </button>
                  </div>
                </form>
              )}

              {/* RENDER FORM: SCROLL TEASER WITH SOUND */}
              {activeCreatorTab === 'scroll' && (
                <form onSubmit={submitScrollTeaser} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-1.5">Teaser Short Title</label>
                      <input
                        type="text"
                        required
                        value={scrollTitle}
                        onChange={(e) => setScrollTitle(e.target.value)}
                        placeholder="e.g. Blood Magic & Spire Contracts"
                        className="w-full bg-[#090910] border border-slate-800 p-2.5 text-xs text-white placeholder-slate-500 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* HIGH-PRECISION VIDEO PROPERTIES SPECIFICATION */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-900 bg-slate-950/40 p-3 rounded-lg">
                    <div>
                      <label className="block text-[10px] text-purple-400 uppercase font-mono font-bold mb-1.5 flex justify-between">
                        <span>Short Clip Video Type</span>
                        <span className="text-slate-500 font-normal">Select categorization</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setScrollVideoType('trailer')}
                          className={`flex-grow py-1.5 text-[10px] font-mono rounded cursor-pointer uppercase font-bold text-center border ${
                            scrollVideoType === 'trailer'
                              ? 'bg-purple-900/30 border-purple-500 text-purple-200'
                              : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-200'
                          }`}
                        >
                          🎬 Video Trailer
                        </button>
                        <button
                          type="button"
                          onClick={() => setScrollVideoType('update')}
                          className={`flex-grow py-1.5 text-[10px] font-mono rounded cursor-pointer uppercase font-bold text-center border ${
                            scrollVideoType === 'update'
                              ? 'bg-purple-900/30 border-purple-500 text-purple-200'
                              : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-200'
                          }`}
                        >
                          📢 Simple Update
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-purple-400 uppercase font-mono font-bold mb-1.5 flex justify-between">
                        <span>Video Duration (Seconds)</span>
                        <span className="text-cyan-400 font-bold">{scrollDuration} seconds</span>
                      </label>
                      <div className="flex items-center gap-3 mt-1 bg-slate-950/80 p-1.5 rounded-lg border border-slate-900">
                        <span className="text-[10px] text-slate-500 font-mono">20s</span>
                        <input
                          type="range"
                          min={20}
                          max={80}
                          step={5}
                          value={scrollDuration}
                          onChange={(e) => setScrollDuration(parseInt(e.target.value))}
                          className="flex-grow h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 font-mono">80s</span>
                      </div>
                    </div>
                  </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-1.5">Select Background Music Match (Curated System Guild)</label>
                      <div className="flex gap-2">
                        <select
                          value={scrollMusicId}
                          onChange={(e) => {
                            setScrollMusicId(e.target.value);
                            startStudioSynth(e.target.value);
                          }}
                          className="flex-grow bg-[#090910] border border-slate-800 p-2 text-xs text-slate-300 rounded-lg cursor-pointer focus:border-purple-500 focus:outline-none"
                        >
                          {MOCK_MUSIC_TRACKS.map((track) => (
                            <option key={track.id} value={track.id}>
                              {track.title} ({track.genre})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => toggleStudioSynth(scrollMusicId)}
                          className={`p-2 rounded-lg cursor-pointer flex items-center justify-center border transition ${
                            playingTrackId === scrollMusicId 
                              ? 'bg-purple-600 text-white border-purple-500 animate-pulse' 
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                          }`}
                          title="Simulate background sound track (Instagram audio feature)"
                        >
                          {playingTrackId === scrollMusicId ? (
                            <Volume2 className="w-4 h-4 text-white" />
                          ) : (
                            <Play className="w-4 h-4 text-purple-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-1.5 font-sans">Teaser Body Text (Dynamic Hook / Bold Dialogue Sentence)</label>
                    <textarea
                      required
                      value={scrollBodyText}
                      onChange={(e) => setScrollBodyText(e.target.value)}
                      placeholder='e.g. He stood in the acid rain, obsidian blade humming. "I warned you," he whispered to the dark lord, "touch her and die."'
                      rows={3}
                      maxLength={240}
                      className="w-full bg-[#090910] border border-slate-800 p-3 text-xs font-sans text-slate-100 placeholder-slate-500 rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                    <span className="text-[9px] text-slate-500 font-mono mt-1 block text-right">{scrollBodyText.length}/240 characters</span>
                  </div>

                  {/* Gradient Select & Trope Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1.5">Select Ambient Mesh Gradient</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {DESIGN_GRADIENTS.map((grad) => (
                          <button
                            type="button"
                            key={grad.id}
                            onClick={() => setScrollGradient(grad.classes)}
                            className={`p-2 rounded border text-[10px] font-mono hover:text-white truncate cursor-pointer transition ${
                              scrollGradient === grad.classes 
                                ? 'border-purple-500 text-purple-300 bg-purple-950/20' 
                                : 'border-slate-850 text-slate-400 bg-slate-950'
                            }`}
                          >
                            {grad.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[10px] text-slate-500 font-mono font-bold uppercase mb-1.5">Trope Tag selection ({scrollSelectedTropes.length} selected)</span>
                      <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto bg-slate-950 p-2 border border-slate-900 rounded-lg">
                        {ALL_TROPES.slice(12, 45).map((tropeItem) => {
                          const isSelected = scrollSelectedTropes.includes(tropeItem);
                          return (
                            <button
                              type="button"
                              key={tropeItem}
                              onClick={() => handleToggleTropeSelection(tropeItem)}
                              className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded cursor-pointer ${
                                isSelected 
                                  ? 'bg-purple-500 text-white' 
                                  : 'bg-slate-900 text-slate-400 hover:text-slate-300'
                              }`}
                            >
                              #{tropeItem}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Card Live Preview Box before publishing */}
                  <div className="p-4 rounded-xl border border-dashed border-purple-500/20 bg-slate-950/50">
                    <span className="block text-[9px] text-slate-500 font-mono uppercase mb-2">Live Scroll Preview Box</span>
                    <div className={`p-5 rounded-lg border h-36 flex flex-col justify-between overflow-hidden relative bg-gradient-to-b ${
                      scrollGradient
                    } border-purple-500/30`}>
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-mono text-cyan-300 uppercase">
                          {scrollVideoType === 'trailer' ? '🎬 TRAILER' : '📢 UPDATE'} • {scrollDuration}s
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8.5px] text-purple-400 font-mono animate-pulse">● FEED SYNC</span>
                          <Volume2 className={`w-3.5 h-3.5 text-white ${playingTrackId ? 'animate-bounce' : ''}`} />
                        </div>
                      </div>
                      <p className="text-xs text-slate-100 font-sans italic leading-relaxed line-clamp-2">
                        "{scrollBodyText || 'Teaser sentence hook preview here...'}"
                      </p>
                      <span className="text-[10px] font-mono text-slate-300 truncate">
                        {scrollTitle || 'Teaser title'} • By You (Creator Host)
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end p-2 border-t border-slate-950">
                    <button
                      type="submit"
                      id="publish-custom-scroll-btn"
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Launch Scroll & Audio Sync
                    </button>
                  </div>
                </form>
              )}

            </div>

            {/* PROJECT MATRIX ACTIVE LISTS */}
            <div className="rounded-2xl bg-slate-950/65 border border-slate-800/80 p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-md font-extrabold text-white flex items-center gap-2">
                    <PenTool className="text-purple-400 w-5 h-5" />
                    Speculative Local Log
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Status logs of e-books, scripts, and drafts tracked inside your room</p>
                </div>
                <button
                  id="add-project-toggle"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Tag
                </button>
              </div>

              <AnimatePresence>
                {showAddForm && (
                  <motion.form
                    id="add-project-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddProject}
                    className="overflow-hidden border border-slate-850 bg-slate-950/90 rounded-xl p-4 mb-6 space-y-4 text-xs"
                  >
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-2">Project Title</label>
                      <input
                        id="new-project-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Echoes of the Solar Ribs"
                        className="w-full bg-[#090910] border border-slate-800 p-2.5 text-xs text-white placeholder-slate-500 rounded focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-2">Category Form</label>
                      <select
                        id="new-project-type"
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full bg-[#090910] border border-slate-800 p-2.5 text-xs text-slate-300 rounded cursor-pointer"
                      >
                        <option value="Novel">Novel / E-Book</option>
                        <option value="Screenplay">Screenplay</option>
                        <option value="Art Collection">Art Collection</option>
                        <option value="Short Story">Short Story</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        id="add-project-submit"
                        type="submit"
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold"
                      >
                        Launch Draft
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              <div id="projects-list" className="space-y-4">
                {projects.map((proj) => (
                  <div
                    id={`project-card-${proj.id}`}
                    key={proj.id}
                    className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-slate-850 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] uppercase font-mono font-bold bg-slate-900 border border-slate-800 text-purple-400 px-2 py-0.5 rounded">
                          {proj.type}
                        </span>
                        <span className="text-[10px] text-slate-500">Updated: {proj.lastUpdated}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 block">{proj.title}</h4>
                      <span className="text-xs text-slate-400 mt-1 block">{proj.metrics}</span>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                          <span>{proj.status}</span>
                          <span>{proj.completion}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" 
                            style={{ width: `${proj.completion}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          id={`progress-btn-${proj.id}`}
                          onClick={() => handleIncrementCompletion(proj.id)}
                          disabled={proj.completion >= 100}
                          className="p-1 px-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 rounded text-[10px] uppercase font-bold cursor-pointer"
                        >
                          Work
                        </button>
                        <button
                          id={`delete-btn-${proj.id}`}
                          onClick={() => handleRemoveProject(proj.id)}
                          className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK DRAFT WORKSPACE SANDBOX */}
            <div id="quick-draft-workspace" className="rounded-2xl bg-slate-950/45 border border-slate-800/80 p-5">
              <h3 className="text-md font-bold text-white mb-2 flex items-center gap-1.5 font-sans">
                <BookOpen className="text-pink-400 w-5 h-5" />
                Quick Draft sandbox
              </h3>
              <p className="text-xs text-slate-400 mb-4">Draft chapters directly. Click "Generate Content Prompt" to use our matrix brainstormer.</p>

              <textarea
                id="draft-text-area"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder="Start writing your speculative fiction draft. 'The magnetic lattices of the floating spire gave way without warning...'"
                rows={6}
                className="w-full bg-[#0d0d16] border border-slate-800 p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 rounded-xl focus:border-indigo-500 focus:outline-none"
              />

              <div className="flex justify-between items-center mt-3 text-xs text-slate-500">
                <span className="font-mono">Words drafted: {draftText.trim() ? draftText.trim().split(/\s+/).length : 0}</span>
                <button
                  id="clear-draft-btn"
                  onClick={() => setDraftText('')}
                  className="hover:text-slate-300 underline underline-offset-2 cursor-pointer"
                >
                  Clear Sheet
                </button>
              </div>
            </div>

            {/* Folder Thread & Chapter Portfolio Manager */}
            <div id="story-portfolio-manager" className="rounded-2xl bg-slate-950/65 border border-slate-800/80 p-5 mt-6 space-y-4">
              <div>
                <h3 className="text-md font-extrabold text-white flex items-center gap-2">
                  <BookOpen className="text-pink-400 w-5 h-5" />
                  E-Book Portfolios & Chapter Threads
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Manage your e-book folders, thread new chapters, crop custom cover pages using in-app preset images, or delete books.
                </p>
              </div>

              {/* Story selector buttons */}
              <div className="flex flex-wrap gap-2 py-2">
                {userStories.map(s => {
                  const isSelected = activeStoryFolderId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setActiveStoryFolderId(s.id === activeStoryFolderId ? null : s.id);
                        setActiveStoryCoverEditingId(null);
                        setChapterCoverImageSelectorOpen(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-950/40 border-purple-500 text-purple-300 font-bold shadow-md' 
                          : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      📁 {s.title}
                    </button>
                  );
                })}
              </div>

              {/* Opened folder mockup container */}
              {activeStoryFolderId && (() => {
                const story = stories.find(s => s.id === activeStoryFolderId);
                if (!story) return null;

                return (
                  <div className="border-l-4 border-amber-500 bg-[#0d0a14] rounded-r-xl p-5 border border-slate-900 border-l-0 text-left space-y-6">
                    {/* Folder Tab styled header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono tracking-widest text-amber-400 bg-amber-950/20 border border-amber-500/20 px-2 py-0.5 rounded uppercase">
                            FOLDER PREVIEW
                          </span>
                          <span className="text-xs text-slate-500">Read Time: {story.readTime}</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-100 mt-1">
                          {story.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xl italic">
                          "{story.description}"
                        </p>
                      </div>

                      {/* Cover preview and edit button */}
                      <div className="flex items-center gap-3">
                        <img 
                          src={story.coverUrl} 
                          alt="Book Cover" 
                          referrerPolicy="no-referrer"
                          className="w-12 h-16 object-cover rounded border border-slate-800 shadow-lg"
                        />
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveStoryCoverEditingId(story.id === activeStoryCoverEditingId ? null : story.id);
                              setChapterCoverImageSelectorOpen(false);
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 rounded font-semibold border border-slate-850 cursor-pointer text-center whitespace-nowrap"
                          >
                            Edit Cover Page
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete the whole storybook "${story.title}"?`)) {
                                if (onDeleteStoryBook) onDeleteStoryBook(story.id);
                                setActiveStoryFolderId(null);
                                triggerNotification(`Deleted story book "${story.title}"`);
                              }
                            }}
                            className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/30 text-red-400 hover:text-red-350 text-[10px] rounded font-mono font-bold border border-red-950 cursor-pointer"
                          >
                            Delete Book
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* STORY COVER PRESET SELECTOR DRAWER */}
                    {activeStoryCoverEditingId === story.id && (
                      <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3">
                        <span className="block text-[10px] text-purple-400 uppercase font-mono font-bold">Select Whole Book Cover Image</span>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {PRESET_IMAGES.map((preset) => {
                            const isSelected = story.coverUrl === preset.url;
                            return (
                              <button
                                type="button"
                                key={preset.title}
                                onClick={() => {
                                  if (onUpdateStoryCover) {
                                    onUpdateStoryCover(story.id, preset.url);
                                    triggerNotification(`Cover artwork of "${story.title}" updated!`);
                                  }
                                }}
                                className={`group/cv relative aspect-[4/5] rounded overflow-hidden border transition cursor-pointer ${
                                  isSelected ? 'border-purple-500 scale-[1.02]' : 'border-slate-850 hover:border-slate-600'
                                }`}
                              >
                                <img src={preset.url} alt={preset.title} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover/cv:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/60 flex items-end p-1">
                                  <span className="text-[7.5px] font-bold text-white block truncate w-full">{preset.title}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* THREAD CONTAINER (Thread-like chapter timelines) */}
                    <div className="space-y-6 relative pl-6">
                      {/* Vertical vector connecting line representing thread corridors */}
                      <div className="absolute left-[11px] top-4 bottom-4 w-0.5 border-l border-dashed border-purple-500/30 pointer-events-none" />

                      <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-2 font-bold select-none">
                        CONNECTED CHAPTER TIMELINE THREAD
                      </span>

                      {story.chapters.map((chapter, index) => (
                        <div 
                          key={index}
                          className="relative bg-slate-950/50 p-4 rounded-xl border border-slate-900/80 hover:border-slate-800 transition"
                        >
                          {/* Circle thread node */}
                          <div className="absolute -left-8 top-5 w-4 h-4 rounded-full bg-[#07070d] border border-purple-500 flex items-center justify-center z-10">
                            <span className="text-[7.5px] font-mono font-bold text-purple-400">{index + 1}</span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-xs font-bold text-white tracking-tight">
                                  {chapter.title}
                                </h5>
                                <span className="text-[8px] font-mono text-slate-500 uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/80">
                                  🔒 Published (Locked)
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-relaxed font-sans font-light line-clamp-3 italic">
                                "{chapter.paragraphs[0] || 'Empty content...'}"
                              </p>
                              {chapter.paragraphs.length > 1 && (
                                <span className="text-[9px] text-slate-500 font-mono italic block">+{chapter.paragraphs.length - 1} more paragraph segments</span>
                              )}
                            </div>

                            {/* Chapter title page photo */}
                            <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
                              {chapter.chapterCoverUrl ? (
                                <img
                                  src={chapter.chapterCoverUrl}
                                  alt="Chapter illustration"
                                  referrerPolicy="no-referrer"
                                  className="w-14 h-10 object-cover rounded border border-slate-800 shadow"
                                />
                              ) : (
                                <div className="w-14 h-10 bg-slate-900 border border-slate-850 rounded flex items-center justify-center text-[8px] text-slate-500 font-mono">
                                  No Cover
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  // Chapter deletion
                                  if (confirm(`Delete chapter "${chapter.title}" from this storybook thread?`)) {
                                    const updatedChaps = story.chapters.filter((_, idx) => idx !== index);
                                    if (onUpdateStoryChapters) {
                                      onUpdateStoryChapters(story.id, updatedChaps);
                                      triggerNotification(`Deleted chapter "${chapter.title}"`);
                                    }
                                  }
                                }}
                                className="p-1 text-slate-500 hover:text-red-400 font-mono text-[9px] uppercase font-bold tracking-wider cursor-pointer"
                                title="Remove chapter from thread"
                              >
                                Delete Chapter
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* ADD NEW CHAPTER FORM INSIDE THREAD */}
                      <div className="bg-slate-950 p-4 border border-dashed border-purple-500/25 rounded-xl space-y-4">
                        <span className="block text-[10px] text-purple-400 font-mono uppercase font-bold">
                          + Thread New Chapter inside Folder
                        </span>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-[8.5px] text-slate-500 font-mono uppercase mb-1">Chapter Title / Heading</label>
                            <input
                              type="text"
                              value={newChapterName}
                              onChange={(e) => setNewChapterName(e.target.value)}
                              placeholder="e.g. Chapter II: The Event Horizon Leap"
                              className="w-full bg-[#07070c] border border-slate-850 p-2.5 text-xs text-slate-100 rounded focus:border-purple-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[8.5px] text-slate-500 font-mono uppercase mb-1">Chapter Storytelling Content</label>
                            <textarea
                              value={newChapterBody}
                              onChange={(e) => setNewChapterBody(e.target.value)}
                              placeholder="Enter the next timeline log paragraphs here. Use direct spacing..."
                              rows={3}
                              className="w-full bg-[#07070c] border border-slate-850 p-2.5 text-xs text-slate-100 rounded focus:border-purple-500 focus:outline-none font-sans"
                            />
                          </div>

                          {/* Cover preset selector for chapter title page */}
                          <div>
                            <label className="block text-[8.5px] text-slate-500 font-mono uppercase mb-1.5 flex justify-between">
                              <span>Chapter Cover Title Image preset Choice</span>
                              <button
                                type="button"
                                onClick={() => setChapterCoverImageSelectorOpen(!chapterCoverImageSelectorOpen)}
                                className="text-purple-400 hover:text-purple-300 underline font-semibold cursor-pointer"
                              >
                                {chapterCoverImageSelectorOpen ? 'Close Choice [×]' : 'Pick from app pictures'}
                              </button>
                            </label>

                            {newChapterPicUrl && (
                              <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-slate-900 rounded mb-2 w-max">
                                <img src={newChapterPicUrl} alt="Cover selected" referrerPolicy="no-referrer" className="w-8 h-6 object-cover rounded" />
                                <span className="text-[8px] font-mono text-cyan-300">Preset selected</span>
                              </div>
                            )}

                            {chapterCoverImageSelectorOpen && (
                              <div className="p-3 bg-[#06060c] border border-slate-900 rounded-lg grid grid-cols-3 gap-1.5 mt-1">
                                {PRESET_IMAGES.map((preset) => (
                                  <button
                                    type="button"
                                    key={preset.title}
                                    onClick={() => {
                                      setNewChapterPicUrl(preset.url);
                                      setChapterCoverImageSelectorOpen(false);
                                    }}
                                    className="group text-left relative aspect-[4/3] rounded overflow-hidden border border-slate-850 hover:border-purple-500 transition cursor-pointer"
                                  >
                                    <img src={preset.url} alt={preset.title} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    <div className="absolute inset-0 bg-black/50 flex items-end p-1">
                                      <span className="text-[7.5px] text-white block truncate leading-tight">{preset.title}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (!newChapterName.trim() || !newChapterBody.trim()) {
                                alert("Please provide both Chapter heading and story paragraph lines!");
                                return;
                              }
                              const paragraphArray = newChapterBody.split('\n\n').filter(p => p.trim() !== '');
                              const currentChapters = [...story.chapters];
                              currentChapters.push({
                                title: newChapterName,
                                paragraphs: paragraphArray,
                                chapterCoverUrl: newChapterPicUrl || undefined
                              });

                              if (onUpdateStoryChapters) {
                                onUpdateStoryChapters(story.id, currentChapters);
                                triggerNotification(`Chapter "${newChapterName}" successfully uploaded to "${story.title}" thread!`);
                              }

                              // Reset
                              setNewChapterName('');
                              setNewChapterBody('');
                              setNewChapterPicUrl('');
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded font-mono font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            🔒 Upload to Thread (Cannot edit later)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>

          {/* COL-3: PROMPT GENERATOR MATRIX */}
          <div className="col-span-1 space-y-6">
            
            <div id="ai-speculator-box" className="rounded-2xl bg-[#090912] border border-purple-950/40 p-5">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Prompt Speculator
              </h3>
              
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-2">Distortion Class</label>
                  <select
                    id="speculate-genre-select"
                    value={speculatingGenre}
                    onChange={(e) => setSpeculatingGenre(e.target.value)}
                    className="w-full bg-[#0d0d17] border border-slate-850 p-2 text-slate-300 rounded cursor-pointer focus:outline-none"
                  >
                    <option value="Cosmic Fantasy">Cosmic Fantasy</option>
                    <option value="Industrial Cyberpunk">Industrial Cyberpunk</option>
                    <option value="Spacetime Loops">Spacetime Loops</option>
                    <option value="Surrealist Speculation">Surrealist Speculation</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 relative">
                  <p className="text-[11px] text-slate-300 leading-relaxed italic select-all font-sans">
                    {generatedPrompt}
                  </p>
                </div>

                <button
                  type="button"
                  id="generate-prompt-btn"
                  onClick={handleGeneratePrompt}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all duration-300"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate High-Concept Prompt
                </button>

                {generatedPrompt !== 'Select a speculative genre and activate the Speculating Matrix to generate high-concept worldbuilding prompts.' && (
                  <button
                    type="button"
                    onClick={() => setDraftText(prev => prev ? prev + '\n\n' + generatedPrompt : generatedPrompt)}
                    className="w-full py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    Send to Drafting Workspace
                  </button>
                )}
              </div>
            </div>

            {/* INSTAGRAM MUSIC SOUND RANGER GUILD */}
            <div id="instagram-audio-speculate" className="rounded-2xl bg-slate-950/40 border border-slate-800/80 p-5">
              <div className="mb-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Music className="w-3.5 h-3.5 text-pink-400" />
                  Editor's Guild Soundtrack Library
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">Play curated background tones to build proper story atmospheres.</p>
              </div>

              <div className="space-y-2.5">
                {MOCK_MUSIC_TRACKS.map((track) => (
                  <div 
                    key={track.id} 
                    className={`p-2.5 rounded-lg border transition duration-250 flex items-center justify-between ${
                      playingTrackId === track.id 
                        ? 'bg-purple-950/20 border-purple-500/50' 
                        : 'bg-[#0a0a14]/60 border-slate-900/80 hover:bg-slate-900'
                    }`}
                  >
                    <div className="min-w-0 flex-grow">
                      <span className="text-[11px] font-bold text-white block truncate">{track.title}</span>
                      <span className="text-[9px] text-slate-400 font-mono block uppercase tracking-wider">{track.genre} • {track.artist}</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => toggleStudioSynth(track.id)}
                      className={`p-1.5 rounded-full cursor-pointer transition ${
                        playingTrackId === track.id 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {playingTrackId === track.id ? (
                        <Volume2 className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-slate-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll Analytics Insights Dashboard */}
            <div id="scroll-analytics-insights" className="rounded-2xl bg-slate-950/40 border border-slate-800/80 p-5 mt-6">
              <div className="mb-4">
                <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <span className="inline-flex w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  Scroll Teasers Live Insights
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">Live audience feedback and performance telemetry metrics on short videos posted.</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="p-2.5 bg-[#0a0a14]/60 border border-slate-900 rounded-lg text-left">
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase block">Views Total</span>
                  <span className="text-sm font-bold text-white block">12,845</span>
                </div>
                <div className="p-2.5 bg-[#0a0a14]/60 border border-slate-900 rounded-lg text-left">
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase block">Share Ratio</span>
                  <span className="text-sm font-bold text-pink-400 block">21.8%</span>
                </div>
                <div className="p-2.5 bg-[#0a0a14]/60 border border-slate-900 rounded-lg text-left">
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase block">Avg Completion</span>
                  <span className="text-sm font-bold text-cyan-300 block">84.5%</span>
                </div>
                <div className="p-2.5 bg-[#0a0a14]/60 border border-slate-900 rounded-lg text-left">
                  <span className="text-[8.5px] font-mono text-slate-500 uppercase block">Engagement</span>
                  <span className="text-sm font-bold text-purple-400 block">9.4/10</span>
                </div>
              </div>

              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Active Scroll Standings</span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                <div className="p-1.5 bg-[#050508] border border-slate-900 rounded flex justify-between items-center text-[10px]">
                  <span className="text-slate-300 font-semibold truncate max-w-[130px]">Touch Her and Die</span>
                  <span className="text-cyan-400 font-mono">1.2k views • 88% compl.</span>
                </div>
                <div className="p-1.5 bg-[#050508] border border-slate-900 rounded flex justify-between items-center text-[10px]">
                  <span className="text-slate-300 font-semibold truncate max-w-[130px]">Regression Hunter</span>
                  <span className="text-cyan-400 font-mono">3.4k views • 74% compl.</span>
                </div>
                <div className="p-1.5 bg-[#050508] border border-slate-900 rounded flex justify-between items-center text-[10px]">
                  <span className="text-slate-300 font-semibold truncate max-w-[130px]">Time Loop Realization</span>
                  <span className="text-cyan-400 font-mono">1.8k views • 82% compl.</span>
                </div>
              </div>
            </div>

            <div id="studio-live-synced-panel" className="rounded-2xl bg-slate-950/40 border border-slate-800/80 p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 font-mono">Interactive Signals</h3>
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-[#0e0e15]/60 border border-slate-900 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-200 block">Kaelen Vox</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Wants sound design feedback on Neon Core</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                </div>

                <div className="p-3 bg-[#0e0e15]/60 border border-slate-900 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-200 block">Lyra Vance</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Ready to map Antarctica Antarctic Coordinates</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
