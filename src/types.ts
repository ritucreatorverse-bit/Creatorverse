export type TabType = 'explore' | 'reader' | 'community' | 'studio';

export type CreatorRole = 'Reader' | 'Author' | 'Photographer' | 'Editor';

export interface UserSession {
  name: string;
  email: string;
  phone?: string;
  handle: string;
  avatar: string;
  role: CreatorRole;
  isCustom?: boolean;
}

export interface Author {
  name: string;
  avatar: string;
  handle: string;
  role: string;
}

export interface Story {
  id: string;
  title: string;
  author: Author;
  description: string;
  category: 'Sci-Fi' | 'Fantasy' | 'Cyberpunk' | 'Surrealism';
  coverUrl: string;
  readTime: string;
  likes: number;
  wordCount: number;
  avgRating?: number;
  ratingCount?: number;
  tropes: string[];
  chapters: {
    title: string;
    paragraphs: string[];
    chapterCoverUrl?: string;
  }[];
}

export interface ScrollTeaser {
  id: string;
  title: string;
  text: string;
  tropes: string[];
  author: Author;
  bgGradient: string; // Tailwind class combo
  musicTrackId: string;
  likes: number;
  commentsCount: number;
  timestamp: string;
  duration?: number; // range 20 to 80 seconds
  videoType?: 'trailer' | 'update';
  views?: number;
  shares?: number;
  completionRate?: number; // e.g. 75%
  watchTime?: number; // total watched hours e.g. 15.4
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
}

export interface FeedPost {
  id: string;
  author: Author;
  timestamp: string;
  content: string;
  likes: number;
  commentsCount: number;
  isLiked?: boolean;
  shares: number;
  imageUrl?: string;
  attachedStory?: {
    id: string;
    title: string;
    preview: string;
  };
}

export interface DirectMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isMe: boolean;
}

export interface CollabMission {
  id: string;
  title: string;
  host: string;
  category: string;
  reward: string;
  description: string;
  spotsFilled: number;
  totalSpots: number;
  status: 'Open' | 'Applied';
}

export interface CreatorProject {
  id: string;
  title: string;
  type: 'Novel' | 'Screenplay' | 'Art Collection' | 'Short Story';
  status: 'Drafting' | 'Editing' | 'Published';
  completion: number;
  lastUpdated: string;
  metrics: string;
}

export interface InspirationItem {
  id: string;
  imageUrl: string;
  title: string;
  creator: string;
  category: 'Artwork' | 'Concept Art' | 'Character Design' | 'World Map';
}
