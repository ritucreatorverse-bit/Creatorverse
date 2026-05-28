import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Mail, User, Shield, Check, Phone, BookOpen, PenTool, Image, Edit3, Volume2 } from 'lucide-react';
import { useAuth, AVATAR_PRESETS } from '../context/AuthContext';
import { CreatorRole } from '../types';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { login, signup, usersList } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<CreatorRole>('Reader');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Role details metadata for premium onboarding cards
  const ROLE_CARDS: { role: CreatorRole; desc: string; icon: any; color: string; perk: string }[] = [
    {
      role: 'Reader',
      desc: 'Deep cosmic traveler with full library viewing rights and active ratings.',
      icon: BookOpen,
      color: 'border-emerald-500/20 text-emerald-400 bg-emerald-950/20 hover:border-emerald-500/50',
      perk: 'Unlocks library comments and story star rating panels.'
    },
    {
      role: 'Author',
      desc: 'Connected digital writer with deep worldbuilding drafting permissions.',
      icon: PenTool,
      color: 'border-purple-500/20 text-purple-400 bg-purple-950/20 hover:border-purple-500/50',
      perk: 'Unlocks story creations, trope mapping, and connected chapter threads.'
    },
    {
      role: 'Photographer',
      desc: 'Visual art director curating stunning telemetry portfolios.',
      icon: Image,
      color: 'border-amber-500/20 text-amber-400 bg-amber-950/20 hover:border-amber-500/50',
      perk: 'Unlocks high-relevance asset presets submission and camera specifications.'
    },
    {
      role: 'Editor',
      desc: 'Elite reviewer with physical proofreading and direct textual editing permissions.',
      icon: Edit3,
      color: 'border-cyan-500/20 text-cyan-400 bg-cyan-950/20 hover:border-cyan-500/50',
      perk: 'Unlocks the Editorial Desk: edit current book chapters in real-time.'
    }
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() && (!isSignUp || !phone.trim())) {
      setErrorMsg('Please specify some credentials (Email, Gmail, or Phone Line).');
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setErrorMsg('Please specify a username.');
        return;
      }
      
      const ok = signup({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role: selectedRole,
        avatar: selectedAvatar
      });

      if (ok) {
        setSuccessMsg(`Welcome to the Guild, ${name}! Your transmission has been authorized.`);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg('An operative with this credential already exists.');
      }
    } else {
      const ok = login(email.trim());
      if (ok) {
        setSuccessMsg(`Access Granted! Securing transmission stream...`);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg('No matches found for this credential. Try another address/phone, or one of our Speed-Access Cards below!');
      }
    }
  };

  const handleGoogleSignIn = () => {
    setErrorMsg('');
    setSuccessMsg('');
    
    // Auto-onboard or fast-connect Ritu's Google account
    const rituEmail = 'ritucreatorverse@gmail.com';
    const userExists = usersList.some(u => u.email.toLowerCase().trim() === rituEmail);
    if (!userExists) {
      signup({
        name: 'Ritu RV',
        email: rituEmail,
        role: 'Author',
        avatar: AVATAR_PRESETS[2] // warm pink/red highlight avatar
      });
    } else {
      login(rituEmail);
    }
    
    setSuccessMsg('Google account (Ritu RV) authenticated successfully! Entering Creatorverse...');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleDemoLogin = (demoEmail: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    const ok = login(demoEmail);
    if (ok) {
      setSuccessMsg(`Fast login active! Connecting profile...`);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      
      {/* Container card */}
      <motion.div 
        id="auth-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-[#090912]/95 border border-slate-800 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col md:flex-row"
      >
        {/* Left pane: Brand aesthetic */}
        <div className="md:w-5/12 bg-gradient-to-b from-purple-950/40 via-[#0a0614] to-slate-950 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-900">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1 bg-purple-900/40 rounded border border-purple-500/30">
                <Shield className="w-4 h-4 text-purple-400" />
              </span>
              <span className="text-[10px] font-mono tracking-widest text-purple-300 uppercase font-bold">GUILD ACCESS SYSTEM</span>
            </div>
            
            <h1 className="text-xl font-extrabold tracking-tight text-white font-sans mt-2">
              Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">Creator Role</span>
            </h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Creatorverse uses decentralized profiles. Join to access live connected storytelling assets as custom roles.
            </p>
          </div>

          {/* Speed login list */}
          <div className="mt-8">
            <span className="text-[9px] font-mono text-slate-500 tracking-wider uppercase block mb-2.5 font-bold">
              ⚡ SPEED-ACCESS DEMO KEYCARDS
            </span>
            <div className="space-y-1.5">
              {usersList.slice(0, 4).map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => handleDemoLogin(user.email)}
                  className="w-full text-left p-2 rounded bg-slate-950/80 hover:bg-slate-900 border border-slate-900 hover:border-purple-900/40 transition flex items-center gap-2 text-[10px] font-mono group cursor-pointer"
                >
                  <img src={user.avatar} referrerPolicy="no-referrer" alt={user.name} className="w-5 h-5 rounded-full object-cover group-hover:scale-105 transition" />
                  <div className="flex-grow min-w-0">
                    <span className="text-slate-300 block font-bold truncate leading-none">{user.name}</span>
                    <span className="text-slate-500 text-[8.5px] truncate block leading-none mt-1">{user.role} • {user.email}</span>
                  </div>
                  <span className="text-[8px] text-purple-400 font-bold opacity-0 group-hover:opacity-100 transition whitespace-nowrap">CONNECT →</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right pane: Action form */}
        <div className="flex-grow p-6 flex flex-col justify-between">
          
          {/* Close button */}
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-4">
            
            {/* Google Fast Connect */}
            <div className="w-full">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 bg-[#0c0d1e] hover:bg-[#141530] text-slate-200 hover:text-white border border-[#212349] hover:border-purple-500/50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md hover:scale-[1.01]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#ea4335" d="M12.24 10.285V14.4h6.887C18.2 16.514 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.821 0 3.473.7 4.73 1.847l3.14-3.14C18.17 1.053 15.358 0 12.24 0 6.033 0 1 5.033 1 11.24s5.033 11.24 11.24 11.24c5.84 0 10.74-4.238 10.74-11.24 0-.745-.078-1.464-.22-2.155H12.24z"/>
                </svg>
                Continue with Google Account
              </button>
            </div>

            <div className="flex items-center gap-2 py-0.5">
              <div className="h-[1px] bg-slate-900/60 flex-grow" />
              <span className="text-[8.5px] font-mono text-slate-550 uppercase tracking-widest font-bold">OR CONTROL ACCESS DIRECTLY</span>
              <div className="h-[1px] bg-slate-900/60 flex-grow" />
            </div>

            {/* Form Mode Selector tabs */}
            <div className="flex gap-2 p-1 bg-slate-950 rounded-lg border border-slate-900 w-max">
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
                className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition ${!isSignUp ? 'bg-purple-900/30 border border-purple-800 text-purple-200 font-bold' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
                className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition ${isSignUp ? 'bg-purple-900/30 border border-purple-800 text-purple-200 font-bold' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}
              >
                Register
              </button>
            </div>

            {/* Error & Success indicators */}
            {errorMsg && (
              <div className="p-2.5 text-xs text-red-400 bg-red-950/20 border border-red-950 rounded-lg text-left font-mono font-bold">
                ⚠️ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-2.5 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900 rounded-lg text-left font-mono font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 animate-bounce" />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
              
              {/* Field 1: Email */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-1">
                  {isSignUp ? 'Gmail or Email Address' : 'Gmail, Email, or Phone Number'}
                </label>
                <div id="email-field-container" className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isSignUp ? "e.g. pilot@gmail.com" : "e.g. pilot@gmail.com or +1 234 567 890"}
                    className="w-full bg-[#050508] border border-slate-900 focus:border-purple-500 p-2.5 pl-10 text-xs text-white rounded-lg focus:outline-none placeholder-slate-600 font-mono"
                  />
                </div>
              </div>

              {/* Field 2: Username (Registry only) */}
              {isSignUp && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-1 font-sans">Unique Username / Name</label>
                    <div id="name-field-container" className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Commander Arthur"
                        className="w-full bg-[#050508] border border-slate-900 focus:border-purple-500 p-2.5 pl-10 text-xs text-white rounded-lg focus:outline-none placeholder-slate-600 font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-1 font-sans">Phone Number (Optional)</label>
                    <div id="phone-field-container" className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +1 555 123 4567"
                        className="w-full bg-[#050508] border border-slate-900 focus:border-purple-500 p-2.5 pl-10 text-xs text-white rounded-lg focus:outline-none placeholder-slate-600 font-mono"
                      />
                    </div>
                  </div>

                  {/* FIELD 3: ROLE COORDINATOR SELECTION */}
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-mono font-bold mb-1.5 flex justify-between">
                      <span>CHOOSE PATHWAY CREATOR ROLE</span>
                      <span className="text-[9px] text-purple-400 normal-case font-normal">Limits permissions accordingly</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLE_CARDS.map((item) => {
                        const Icon = item.icon;
                        const isChosen = selectedRole === item.role;
                        return (
                          <button
                            type="button"
                            key={item.role}
                            onClick={() => setSelectedRole(item.role)}
                            className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                              isChosen 
                                ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500/25' 
                                : 'bg-[#050508] border-slate-900 hover:border-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <Icon className={`w-3.5 h-3.5 ${isChosen ? 'text-purple-400' : 'text-slate-400'}`} />
                              <span className={`text-xs font-bold ${isChosen ? 'text-white' : 'text-slate-300'}`}>{item.role}</span>
                              {isChosen && <Check className="w-3 h-3 text-purple-400 ml-auto" />}
                            </div>
                            <span className="text-[9px] text-slate-500 leading-tight block">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                    {/* Dynamic perk announcement */}
                    <div className="mt-2.5 p-2 bg-[#06060c] rounded border border-slate-900 text-[9.5px] font-mono text-slate-400">
                      🗝️ <span className="font-bold text-slate-350">{selectedRole} Perk:</span> {ROLE_CARDS.find(r => r.role === selectedRole)?.perk}
                    </div>
                  </div>

                  {/* FIELD 4: AVATAR CHOICE */}
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold mb-1.5">Select Profile Portrait</label>
                    <div className="flex gap-2 py-1 overflow-x-auto">
                      {AVATAR_PRESETS.map((url, i) => {
                        const isChosen = selectedAvatar === url;
                        return (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setSelectedAvatar(url)}
                            className={`relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer border-2 transition ${isChosen ? 'border-purple-500 scale-105' : 'border-transparent hover:border-slate-700'}`}
                          >
                            <img src={url} alt="preset-avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            {isChosen && (
                              <div className="absolute inset-0 bg-purple-950/40 flex items-center justify-center">
                                <Check className="w-4.5 h-4.5 text-white stroke-[3.5px]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs rounded-xl tracking-wider uppercase transition shadow-md hover:shadow-purple-700/10 cursor-pointer"
              >
                {isSignUp ? '🧬 Initiate Cosmic Feed Profile' : '🔓 Terminate Credential Lock'}
              </button>

            </form>
          </div>

          <div id="auth-legal-footer" className="mt-4 border-t border-slate-900 pt-3 text-center">
            <span className="text-[8.5px] text-slate-500 font-mono">
              SECURE DECENTRALIZED PROTOCOL DESK // ENCRYPT 256B
            </span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
