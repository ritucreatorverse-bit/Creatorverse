import { Story, FeedPost, CollabMission, CreatorProject, InspirationItem, Author } from '../types';

export const AUTHORS: Record<string, Author> = {
  vesper: {
    name: 'Vesper Thorne',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    handle: '@vesper_t',
    role: 'Writer'
  },
  kaelen: {
    name: 'Kaelen Vox',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    handle: '@kaelen_v',
    role: 'Designer'
  },
  lyra: {
    name: 'Lyra Vance',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
    handle: '@lyra_v',
    role: 'Artist'
  },
  zane: {
    name: 'Zane Vector',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
    handle: '@z_vector',
    role: 'Visionary'
  }
};

export const MOCK_STORIES: Story[] = [
  {
    id: 'story-1',
    title: "The Architect's Dream",
    author: AUTHORS.vesper,
    description: "An infinite skyscraper suspended in the upper atmosphere. Each floor contains an entire synthetic ecosystem, but something is causing the boundaries to dissolve.",
    category: 'Fantasy',
    coverUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&h=500&q=80',
    readTime: '8 min read',
    likes: 342,
    wordCount: 1840,
    avgRating: 4.8,
    ratingCount: 124,
    tropes: ['Fantasy', 'Cosmic', 'Corrupted kingdom', 'Enemies to lovers', 'Slow burn', 'Chosen one', 'Kingdom betrayal', 'Epic'],
    chapters: [
      {
        title: 'I. The Floating Monolith',
        paragraphs: [
          'The sky-spire did not rest on pillars of stone. It hung suspended on magnetic grids, a giant obsidian needle threading the violent clouds of Venus. Below, the yellow-sulfur haze raged in an endless hurricane. Above, the solar panels caught the unfiltered rays of the distant sun, drinking light and spitting back enough power to suspend three billion tons of steel and soil.',
          'Nolan stood at the edge of Floor 412, known to the residents as the "Borean Basin." Beneath his custom boots, the synthetic topsoil was damp with artificial dew. Cedar trees, engineered to survive under artificial ultraviolet lighting, stretched their deep green needles toward silver ceiling panels.',
          '“The glass is weeping,” Nolan muttered, tapping his earpiece. A dull static hummed back in response lines. "Evelyn, can you hear me? The condensation on the western barrier shouldn\'t be three millimeters thick. It means the humidity exchange system on Floor 411 is spilling upward.”',
          'He wiped the cold humidity from his forehead. It tasted of metallic minerals—not the clean distilled rainfall promised by the upper-deck scrubbers. Something was shifting in the structure of the dream. Nolan reached into his heavy trench coat and pulled out his digital surveyor. The blue laser grid registered an impossible variance.'
        ]
      },
      {
        title: 'II. Dissolving Boundaries',
        paragraphs: [
          '“Nolan, you need to get to the elevator shaft,” Evelyn’s voice finally punched through the static. She sounded breathless, her speech clipped by the frantic rhythm of warning alarms. “We have a catastrophic mesh failure on 410. The biological containment shields are phasing out. The savannah grass from the Serengetis biome is literally occupying the same physical space as your cedar forest.”',
          'He started to run, his boots kicking up clods of dark dirt. As he raced through the woodland path, the trees began to look pixelated, their branches vibrating with the high frequency of failing holographic matrices.',
          'Then, he saw it. A clean line of dry yellow savannah grass was slicing directly through an ancient cedar trunk. The two objects did not press against each other; they overlapped, turning into a nightmarish, flickering composite of organic forms. The cedar scent was overwhelmed by the dry, musk aroma of heated clay and wild beasts.',
          '“Containment isn’t just leaking,” Nolan cried, skidding to a halt as a golden-maned shadow materialized briefly in the canopy, let out a silent roar, and vanished. “The reality layers are compressing. We’re losing the vertical separation!”'
        ]
      }
    ]
  },
  {
    id: 'story-2',
    title: "A Galactic Odyssey: The Chronos Breach",
    author: AUTHORS.zane,
    description: "Deep in the unmapped sectors of the Cygnus Rift, a research crew discovers a tear in spacetime that repeats the last 45 minutes of their lives.",
    category: 'Sci-Fi',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&h=500&q=80',
    readTime: '12 min read',
    likes: 512,
    wordCount: 2240,
    avgRating: 4.9,
    ratingCount: 215,
    tropes: ['Sci-fi', 'Time-travel', 'Multiverse', 'Thriller', 'Unreliable narrator', 'Opposites attract', 'Loop ending', 'Obsessed genius'],
    chapters: [
      {
        title: 'I. The Repeating Hour',
        paragraphs: [
          'The coffee pot was half empty. Lieutenant Danvers knew this because he had filled it exactly forty-five minutes ago, watched the indicator light glow amber, and poured himself a cup. He also knew he was about to do it again.',
          '“Danvers, look at the sensor readouts for Sector 4,” Captain Sterling ordered from the command deck. Her gray eyes reflected the amber pulses of the main drive.',
          'Danvers didn\'t look. He already knew what they said. “Spacetime distortion radiating in a perfect sphere. Diameter is 12 light-seconds. No electromagnetic signature, just a raw gravity canyon that refuses to balance inside our gauges.”',
          'Sterling turned around slowly, her eyebrows knitting. “How did you—the sensor sweep only completed ten seconds ago. Did you run a pre-emptive predictive model?”',
          '“No, Captain,” Danvers sighed, holding up his mug. The ceramic surface had a slight hairline crack near the handle. “This is the fourth time we’ve had this exact conversation. In about thirty seconds, the chronometer on the bulkhead will flicker, backwards, and we’ll be standing right here with a half-empty coffee pot.”'
        ]
      }
    ]
  },
  {
    id: 'story-3',
    title: "Neon Dreams of the Core",
    author: AUTHORS.kaelen,
    description: "In the neon-drenched levels of the Undergrid, a sensory coder discovers a memory file that doesn't belong to any human.",
    category: 'Cyberpunk',
    coverUrl: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&h=500&q=80',
    readTime: '6 min read',
    likes: 418,
    wordCount: 1200,
    avgRating: 4.7,
    ratingCount: 98,
    tropes: ['Cyberpunk', 'Futuristic', 'Dystopian', 'Hidden power', 'Opposites attract', 'Found family', 'Hacker genius', 'Touch her and die'],
    chapters: [
      {
        title: 'I. The Ghost File',
        paragraphs: [
          'The rain in the Undergrid was chemically colored, leaving bright pink streaks on the matte black walls of Sector 9. Kaelen sat in his cocoon office, sensory rigs strapped to his temples, his fingers dancing across the holographic input deck.',
          'His job was simple: scrub illegal emotional residues from black-market cognitive chips before they were sold to the corporatized sectors. If a client wanted a high-society luxury vacation package, they didn\'t want to feel the raw panic of the street-urchin extraction phase.',
          'But chip code LF-9004 was different. It carried no biometrics, no standard brainwave rhythms, and no cerebral code stamps. When Kaelen loaded the preview track, he didn\'t see the usual sensory feedback loops. He felt a cold, deep dark, illuminated by secondary moons that did not belong to any systemic star chart.'
        ]
      }
    ]
  },
  {
    id: 'story-4',
    title: "Vector Silence",
    author: AUTHORS.lyra,
    description: "A mysterious artist goes silent, leaving behind a series of vector files that secretly map the location of the world's last unpolluted seed vault.",
    category: 'Surrealism',
    coverUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&h=500&q=80',
    readTime: '10 min read',
    likes: 289,
    wordCount: 1600,
    avgRating: 4.5,
    ratingCount: 64,
    tropes: ['Surrealism', 'Surreal', 'Mysterious', 'Gothic', 'Silent protector', 'Found family', 'Touch-starved character'],
    chapters: [
      {
        title: 'I. The Final Canvas',
        paragraphs: [
          'The files were simple line drawings—white strokes on pitch-black backgrounds, devoid of metadata. Yet to the mathematical eye, each curvature was an equations map. When superimposed, the abstract shapes resolved into a topographical contour of the Antarctic rim.',
          'Lyra traced the vector paths with her digital stylus. Each curve had a mathematically precise frequency, humming in a quiet geometric whisper when processed by the rendering suite.'
        ]
      }
    ]
  }
];

export const MOCK_FEED: FeedPost[] = [
  {
    id: 'post-1',
    author: AUTHORS.vesper,
    timestamp: '2 hours ago',
    content: 'Just finalized Chapter II of "The Architect\'s Dream"! The boundary collapse dynamic is incredibly fun to write. I\'m trying to explore how people react to literal spatial overlaps of completely disparate ecosystems. What if a polar ice shelf occupied the same room as a volcanic magma vent? Let me know what you think!',
    likes: 54,
    commentsCount: 12,
    shares: 3,
    attachedStory: {
      id: 'story-1',
      title: "The Architect's Dream",
      preview: "An infinite skyscraper suspended in the upper atmosphere..."
    }
  },
  {
    id: 'post-2',
    author: AUTHORS.kaelen,
    timestamp: '4 hours ago',
    content: 'Uploaded some cybernetic conceptual art boards for the Undergrid setting in "Neon Dreams of the Core." The visual palette consists of high-energy chemical pink, matte industrial obsidian, and cobalt blue. Feel free to check them out in the Inspiration Gallery!',
    likes: 92,
    commentsCount: 18,
    isLiked: true,
    shares: 8
  },
  {
    id: 'post-3',
    author: AUTHORS.zane,
    timestamp: '1 day ago',
    content: 'Just uploaded "A Galactic Odyssey: The Chronos Breach" to Creatorverse! If you love time-loop mechanics, spacetime ruptures, and psychological sci-fi, please jump into Chapter I. Would love feedback on the pacing of Lieutenant Danvers\' realization.',
    likes: 128,
    commentsCount: 24,
    shares: 11,
    attachedStory: {
      id: 'story-2',
      title: "A Galactic Odyssey: The Chronos Breach",
      preview: "Deep in the unmapped sectors of the Cygnus Rift..."
    }
  }
];

export const MOCK_MISSION: CollabMission[] = [
  {
    id: 'mission-1',
    title: 'Chronos Breach Cover Art Match',
    host: 'Zane Vector',
    category: 'Artwork',
    reward: 'Guild Spotlight & Co-Author Credit',
    description: 'Looking for a digital artist to create a cover illustration capturing the repeating temporal distortion waves inside a spacecraft cockpit.',
    spotsFilled: 3,
    totalSpots: 5,
    status: 'Open'
  },
  {
    id: 'mission-2',
    title: 'The Architect\'s Ecosystem Specifiers',
    host: 'Vesper Thorne',
    category: 'Worldbuilding',
    reward: 'Featured Partnership & Co-Author Credits',
    description: 'Need biology-focused sci-fi writers to help design the synth-biomes on floors 200 through 300 of the spires.',
    spotsFilled: 2,
    totalSpots: 3,
    status: 'Open'
  },
  {
    id: 'mission-3',
    title: 'Undergrid Soundtrack Assembly',
    host: 'Kaelen Vox',
    category: 'Sound Design',
    reward: 'Co-creator rights',
    description: 'Looking for synthwave and industrial glitch producers to assemble a dark 6-track audio background for the interactive release.',
    spotsFilled: 1,
    totalSpots: 4,
    status: 'Open'
  }
];

export const MOCK_PROJECTS: CreatorProject[] = [
  {
    id: 'proj-1',
    title: 'Ethereal Flux',
    type: 'Novel',
    status: 'Drafting',
    completion: 45,
    lastUpdated: 'May 28, 2026',
    metrics: '24.2K words • 4 chapters'
  },
  {
    id: 'proj-2',
    title: 'The Last Archive',
    type: 'Screenplay',
    status: 'Editing',
    completion: 80,
    lastUpdated: 'May 24, 2026',
    metrics: '92 pages • Draft v3'
  },
  {
    id: 'proj-3',
    title: 'Cybernetic Gardens',
    type: 'Art Collection',
    status: 'Published',
    completion: 100,
    lastUpdated: 'May 12, 2026',
    metrics: '12 prints • 14.2K Views'
  }
];

export const INSPIRATIONS: InspirationItem[] = [
  {
    id: 'insp-1',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    title: 'Failing Holographic Grid',
    creator: 'Lyra Vance',
    category: 'Artwork'
  },
  {
    id: 'insp-2',
    imageUrl: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&w=400&q=80',
    title: 'Obsidian Sky-Spire Conceptualizer',
    creator: 'Kaelen Vox',
    category: 'Concept Art'
  },
  {
    id: 'insp-3',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    title: 'Spacetime Ripple Patterns',
    creator: 'Zane Vector',
    category: 'World Map'
  },
  {
    id: 'insp-4',
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=400&q=80',
    title: 'Lithium Dust Storms on Venus',
    creator: 'Vesper Thorne',
    category: 'Concept Art'
  }
];

export const INITIAL_DMS = [
  {
    id: 'msg-1',
    senderName: 'Vesper Thorne',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80',
    content: 'Hey! Loved your feedback on "The Architect\'s Dream". Would you be down to collaborate on the lower level designs?',
    timestamp: '1:32 PM',
    isMe: false
  },
  {
    id: 'msg-2',
    senderName: 'You',
    senderAvatar: '',
    content: 'Absolutely! I was thinking Floor 150 could be a fully liquid neon reef with bioluminescent flora.',
    timestamp: '1:45 PM',
    isMe: true
  },
  {
    id: 'msg-3',
    senderName: 'Vesper Thorne',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80',
    content: 'Wow, that is wild! Let\'s draft a microspec and post it in the Mission Board so we can find an artist.',
    timestamp: '1:47 PM',
    isMe: false
  }
];
