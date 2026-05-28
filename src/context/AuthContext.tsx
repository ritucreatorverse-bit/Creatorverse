import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, CreatorRole } from '../types';

interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  role: CreatorRole;
  avatar: string;
}

interface AuthContextType {
  currentUser: UserSession | null;
  usersList: UserSession[];
  login: (emailOrPhone: string) => boolean;
  signup: (data: RegisterData) => boolean;
  logout: () => void;
  updateCurrentUserRole: (newRole: CreatorRole) => void;
  openAuthModal: boolean;
  setOpenAuthModal: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Preset avatars for signing up
export const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80", // Cyber female
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80", // Male beard
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80", // Female smile
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80", // Male spects
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80", // Tech traveler
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&h=120&q=80", // Elegant portrait
];

// Prepopulated demo users for instantaneous review
const DEMO_USERS: UserSession[] = [
  {
    name: "Arthur Pendelton",
    email: "author@creatorverse.com",
    handle: "@arthur_author",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
    role: "Author"
  },
  {
    name: "Rachel Readwell",
    email: "reader@creatorverse.com",
    handle: "@rachel_reads",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
    role: "Reader"
  },
  {
    name: "Gavin Shutter",
    email: "photographer@creatorverse.com",
    handle: "@gavin_lens",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
    role: "Photographer"
  },
  {
    name: "Evelyn Reviewer",
    email: "editor@creatorverse.com",
    handle: "@evelyn_edits",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
    role: "Editor"
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [usersList, setUsersList] = useState<UserSession[]>([]);
  const [openAuthModal, setOpenAuthModal] = useState<boolean>(false);

  // Local storage binding
  useEffect(() => {
    const storedUsers = localStorage.getItem('creatorverse_users');
    let parsedUsers: UserSession[] = [];
    
    if (storedUsers) {
      parsedUsers = JSON.parse(storedUsers);
    } else {
      parsedUsers = DEMO_USERS;
      localStorage.setItem('creatorverse_users', JSON.stringify(DEMO_USERS));
    }
    setUsersList(parsedUsers);

    // Fetch last session if saved
    const activeSession = localStorage.getItem('creatorverse_active_session');
    if (activeSession) {
      setCurrentUser(JSON.parse(activeSession));
    } else {
      // First encounter: do not auto-login, force open auth modal
      setCurrentUser(null);
      setOpenAuthModal(true);
    }
  }, []);

  const login = (emailOrPhone: string): boolean => {
    const clean = emailOrPhone.toLowerCase().trim();
    const user = usersList.find(u => 
      u.email.toLowerCase().trim() === clean || 
      (u.phone && u.phone.toLowerCase().trim() === clean)
    );
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('creatorverse_active_session', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const signup = (data: RegisterData): boolean => {
    // Check if user with email or phone already exists
    const cleanEmail = data.email.toLowerCase().trim();
    const cleanPhone = data.phone?.toLowerCase().trim();

    const exists = usersList.some(u => {
      const emailIsSame = u.email.toLowerCase().trim() === cleanEmail;
      const phoneIsSame = cleanPhone && u.phone && u.phone.toLowerCase().trim() === cleanPhone;
      return emailIsSame || phoneIsSame;
    });

    if (exists) {
      return false;
    }

    const cleanedHandle = '@' + data.name.toLowerCase().replace(/\s+/g, '_');
    const newUser: UserSession = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      handle: cleanedHandle,
      avatar: data.avatar || AVATAR_PRESETS[0],
      role: data.role,
      isCustom: true
    };

    const updated = [...usersList, newUser];
    setUsersList(updated);
    localStorage.setItem('creatorverse_users', JSON.stringify(updated));

    // Sign them in instantly
    setCurrentUser(newUser);
    localStorage.setItem('creatorverse_active_session', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('creatorverse_active_session');
  };

  const updateCurrentUserRole = (newRole: CreatorRole) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, role: newRole };
    setCurrentUser(updatedUser);
    localStorage.setItem('creatorverse_active_session', JSON.stringify(updatedUser));

    // Also update in usersList repository
    const updatedUsersList = usersList.map(u => 
      u.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim() 
        ? { ...u, role: newRole } 
        : u
    );
    setUsersList(updatedUsersList);
    localStorage.setItem('creatorverse_users', JSON.stringify(updatedUsersList));
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      usersList, 
      login, 
      signup, 
      logout, 
      updateCurrentUserRole,
      openAuthModal,
      setOpenAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
