import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Compass, 
  Layers, 
  Activity, 
  Info, 
  X, 
  Send, 
  Check, 
  Loader2, 
  AlertCircle, 
  ChevronRight, 
  ArrowRight,
  ShoppingBag,
  RefreshCw,
  Maximize2
} from 'lucide-react';

// Type declarations
interface Marker {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  type: 'clutter' | 'suggestion' | 'tip';
  title: string;
  description: string;
}

interface Suggestion {
  id: string;
  category: 'Urgent' | 'Balance' | 'Storage';
  scoreBenefit: string;
  title: string;
  description: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface Room {
  id: string;
  name: string;
  image?: string; // base64 encoded or unsplash URL
  isUnsplash?: boolean; // to check if it's a default loaded room
  lastScanned?: string;
  stats?: {
    flowScore: number;
    itemCount: number;
    visualNoise: 'Low' | 'Medium' | 'High';
  };
  markers?: Marker[];
  suggestions?: Suggestion[];
  chatHistory?: ChatMessage[];
}

// Initial Preloaded Rooms matching the Natural Tones Design Layout
const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-living',
    name: 'Living Room',
    image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    isUnsplash: true,
    lastScanned: '12 mins ago',
    stats: {
      flowScore: 7.2,
      itemCount: 42,
      visualNoise: 'High'
    },
    markers: [
      {
        id: 'm-living-1',
        x: 33,
        y: 28,
        type: 'clutter',
        title: 'Constraint Detected',
        description: 'Surface clutter density is 64%. Stacking of books and objects is blocking visual paths on the sideboard.'
      },
      {
        id: 'm-living-2',
        x: 72,
        y: 65,
        type: 'tip',
        title: 'Textile Balance',
        description: 'Corner is visually heavy with blankets. Add a slender tall botanical element or wood basket to restore balance.'
      }
    ],
    suggestions: [
      {
        id: 's-living-1',
        category: 'Urgent',
        scoreBenefit: '+15 Flow',
        title: 'Clear the Sideboard',
        description: 'Stacking of magazines and mail is creating heavy visual weight. Move them to a dedicated folder inside a cabinet or recycle them.'
      },
      {
        id: 's-living-2',
        category: 'Balance',
        scoreBenefit: '+5 Aesthetic',
        title: 'Verticality Opportunity',
        description: 'The wall behind the sofa is 80% negative space. Consider adding a minimalist floating oak shelf to lift the eye and create interest.'
      },
      {
        id: 's-living-3',
        category: 'Storage',
        scoreBenefit: '+8 Order',
        title: 'Textile Containment',
        description: 'Three throws are scattered in disarray. Add a hand-woven reed basket next to the sofa for a cleaner, warmer texture transition.'
      }
    ],
    chatHistory: [
      {
        role: 'model',
        text: "Hello! I am Vesta, your space-organization counselor. I've analyzed your Living Room's photo. We have a visual flow score of 7.2. The sideboard clutter is creating significant visual noise, but we can easily bring serenity back. How can I help you organize your Living Room today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  },
  {
    id: 'room-bedroom',
    name: 'Primary Bedroom',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    isUnsplash: true,
    lastScanned: '2 hours ago',
    stats: {
      flowScore: 8.8,
      itemCount: 14,
      visualNoise: 'Low'
    },
    markers: [
      {
        id: 'm-bed-1',
        x: 20,
        y: 45,
        type: 'suggestion',
        title: 'Bedside Clearance',
        description: 'Keep nightstand surfaces 90% clear. Stash cords, jewelry trays, and small loose items in a nightstand drawer.'
      }
    ],
    suggestions: [
      {
        id: 's-bed-1',
        category: 'Storage',
        scoreBenefit: '+10 Order',
        title: 'Concealed Underbed Storage',
        description: 'Implement linen-wrapped zip bins under the frame to keep seasonal clothes fully out of sight while maintaining clean floor lines.'
      },
      {
        id: 's-bed-2',
        category: 'Balance',
        scoreBenefit: '+12 Aesthetic',
        title: 'Symmetrical Lamps',
        description: 'Install matching warm brass wall sconces or matching ceramic lamps to balance visual weight across the bed.'
      },
      {
        id: 's-bed-3',
        category: 'Balance',
        scoreBenefit: '+4 Flow',
        title: 'Diffuse Harsh Light',
        description: 'Incorporate sheer organic cotton drapes to soften early morning solar rays and foster a serene sleep sanctuary.'
      }
    ],
    chatHistory: [
      {
        role: 'model',
        text: "Welcome back! Your Bedroom is in beautiful shape with an 8.8 flow score. It has excellent negative space and a very low item density. Let's talk about styling details, lighting, or bedding to optimize your sanctuary.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  },
  {
    id: 'room-office',
    name: 'Home Office',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    isUnsplash: true,
    lastScanned: 'Yesterday',
    stats: {
      flowScore: 6.5,
      itemCount: 29,
      visualNoise: 'Medium'
    },
    markers: [
      {
        id: 'm-off-1',
        x: 52,
        y: 58,
        type: 'clutter',
        title: 'Cable Nest Detected',
        description: 'Desk cords are tangled and highly visible. Secure them in a tray beneath the desktop to minimize cognitive clutter.'
      },
      {
        id: 'm-off-2',
        x: 82,
        y: 22,
        type: 'suggestion',
        title: 'Bookshelf Rhythm',
        description: 'Mix horizontal stackings with vertical book alignments on the shelf to introduce breathing room.'
      }
    ],
    suggestions: [
      {
        id: 's-off-1',
        category: 'Urgent',
        scoreBenefit: '+18 Flow',
        title: 'Lift and Mount Cables',
        description: 'Utilize an under-desk wire basket. Mount power strips off the floor to create an unobstructed, sweeping leg area.'
      },
      {
        id: 's-off-2',
        category: 'Storage',
        scoreBenefit: '+10 Order',
        title: 'Maple Document Tray',
        description: 'Keep active work documents contained inside a warm wood desktop tray. Never let printouts form loose random piles.'
      },
      {
        id: 's-off-3',
        category: 'Balance',
        scoreBenefit: '+6 Aesthetic',
        title: 'Desk Alignment Shift',
        description: 'Angle the desk closer to natural side light from the window to elevate daytime productivity and mitigate heavy shadows.'
      }
    ],
    chatHistory: [
      {
        role: 'model',
        text: "Hi there! Let's optimize your workspace flow. Right now it has a flow score of 6.5, largely due to exposed cables and active desktop papers. How would you like to streamline your work surfaces today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  }
];

// Shopping list matching the theme
const RECOMMENDED_SUPPLIES = [
  { name: 'Hand-woven Reed Basket', category: 'Containment', price: '$28', icon: ShoppingBag, desc: 'Great for blankets, throws and toys.' },
  { name: 'Under-Desk Wire Basket', category: 'Cable Control', price: '$18', icon: Compass, desc: 'Mounts power strips off the floor.' },
  { name: 'Minimalist Maple Desktop Tray', category: 'Storage', price: '$34', icon: Layers, desc: 'Keeps loose paperwork consolidated.' },
  { name: 'Slender Brass Table Lamp', category: 'Lighting', price: '$65', icon: Sparkles, desc: 'Adds warm secondary focal point light.' }
];

// Fallback modeling generator when API key is missing
function generateFallbackAnalysis(roomName: string) {
  const name = roomName.toLowerCase();
  let stats: { flowScore: number; itemCount: number; visualNoise: 'Low' | 'Medium' | 'High' } = { 
    flowScore: 7.0, 
    itemCount: 25, 
    visualNoise: 'Medium' 
  };
  let markers: Marker[] = [];
  let suggestions: Suggestion[] = [];

  if (name.includes('living')) {
    stats = { flowScore: 6.8, itemCount: 38, visualNoise: 'High' as const };
    markers = [
      { id: 'f1', x: 25, y: 35, type: 'clutter' as const, title: 'Surface Accumulation', description: 'Stacking of media items and daily items on the coffee table is blocking visual paths.' },
      { id: 'f2', x: 70, y: 60, type: 'suggestion' as const, title: 'Blanket Organization', description: 'Throw blankets are scattered across chairs. Use a linen or woven chest for storage.' }
    ];
    suggestions = [
      { id: 'fs1', category: 'Urgent' as const, scoreBenefit: '+15 Flow', title: 'Streamline Coffee Table', description: 'Limit items on the central table to a single botanical element and a maximum of two books.' },
      { id: 'fs2', category: 'Balance' as const, scoreBenefit: '+8 Aesthetic', title: 'Balanced Lighting Heights', description: 'Elevate dark corners with a tall warm brass lamp to draw the eyes upward.' },
      { id: 'fs3', category: 'Storage' as const, scoreBenefit: '+6 Order', title: 'Textile Containment Basket', description: 'Incorporate a hand-woven reed basket adjacent to the sofa for soft throw storage.' }
    ];
  } else if (name.includes('bed')) {
    stats = { flowScore: 8.2, itemCount: 18, visualNoise: 'Low' as const };
    markers = [
      { id: 'f1', x: 40, y: 75, type: 'clutter' as const, title: 'Underbed Clutter', description: 'Unsealed cardboard boxes are peaking out. Replace with uniform linen storage bins.' }
    ];
    suggestions = [
      { id: 'fs1', category: 'Storage' as const, scoreBenefit: '+10 Order', title: 'Introduce Linen Chests', description: 'Replace plastic containers under the frame with dust-proof cotton zip dividers.' },
      { id: 'fs2', category: 'Balance' as const, scoreBenefit: '+12 Aesthetic', title: 'Symmetrical Bedside Anchors', description: 'Align dual lamps on nightstands to establish a calming symmetry and encourage restful sleep.' },
      { id: 'fs3', category: 'Balance' as const, scoreBenefit: '+4 Flow', title: 'Clear Dresser Surfaces', description: 'Reduce active displays on the chest of drawers down to 3 high-value objects (e.g., vase, candle, bowl).' }
    ];
  } else if (name.includes('office') || name.includes('work') || name.includes('desk')) {
    stats = { flowScore: 5.9, itemCount: 42, visualNoise: 'High' as const };
    markers = [
      { id: 'f1', x: 50, y: 70, type: 'clutter' as const, title: 'Cable Tangling', description: 'Power strips and adapter wires form a dense knot under the desk, creating physical and mental friction.' },
      { id: 'f2', x: 80, y: 30, type: 'suggestion' as const, title: 'Reference Book Overload', description: 'Reference guides are leaning at angles, causing vertical instability on the upper shelf.' }
    ];
    suggestions = [
      { id: 'fs1', category: 'Urgent' as const, scoreBenefit: '+18 Flow', title: 'Under-desk Cable Conduit', description: 'Affix a cable management tray underneath the desk surface to lift all power strips off the floor.' },
      { id: 'fs2', category: 'Storage' as const, scoreBenefit: '+12 Order', title: 'Vertical Document Tray', description: 'Store active folders upright in a maple wood organiser rather than stacking them horizontally.' },
      { id: 'fs3', category: 'Balance' as const, scoreBenefit: '+7 Aesthetic', title: 'Acoustic & Softness Shift', description: 'Add a wool-felt desk mat underneath the keyboard to soften the workspace acoustics and texture.' }
    ];
  } else {
    stats = { flowScore: 7.1, itemCount: 20, visualNoise: 'Medium' as const };
    markers = [
      { id: 'f1', x: 50, y: 50, type: 'suggestion' as const, title: 'Focal Point Balance', description: 'Create a singular central visual anchor in this space to establish a natural visual entry.' }
    ];
    suggestions = [
      { id: 'fs1', category: 'Urgent' as const, scoreBenefit: '+12 Flow', title: 'Surface Clearing', description: 'Remove all daily miscellaneous items and allocate dedicated drawers for them.' },
      { id: 'fs2', category: 'Storage' as const, scoreBenefit: '+8 Order', title: 'Dedicated Basket', description: 'Add a medium canvas organizer to group loose tools or objects.' },
      { id: 'fs3', category: 'Balance' as const, scoreBenefit: '+5 Aesthetic', title: 'Negative Space Check', description: 'Leave at least 30% of flat shelves entirely empty to let the room breathe.' }
    ];
  }

  return { stats, markers, suggestions };
}

export default function App() {
  // Application states
  const [rooms, setRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem('vesta_ai_rooms');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading rooms from localStorage', e);
    }
    return INITIAL_ROOMS;
  });

  const [activeRoomId, setActiveRoomId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem('vesta_ai_active_id');
      if (savedActive) {
        const parsed = JSON.parse(savedActive);
        return parsed;
      }
    } catch {}
    return 'room-living';
  });

  const [activeTab, setActiveTab] = useState<'suggestions' | 'chat'>('suggestions');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<{ type: string; message: string } | null>(null);
  
  // Chat input and loading states
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // New room naming state
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  // Selected Marker state for overlay popups
  const [activeMarker, setActiveMarker] = useState<Marker | null>(null);

  // Shopping list slider toggle
  const [showShoppingOverlay, setShowShoppingOverlay] = useState(false);

  // File Upload Drag & Drop State
  const [isDragging, setIsDragging] = useState(false);

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('vesta_ai_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('vesta_ai_active_id', JSON.stringify(activeRoomId));
  }, [activeRoomId]);

  // Scroll to bottom of chat whenever history changes or is loading
  useEffect(() => {
    if (activeTab === 'chat') {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }, [rooms, activeRoomId, activeTab, isChatLoading]);

  // Retrieve active room object safely
  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];

  // Room fallback generator when API key is missing
  const applyFallbackScan = (room: Room, customImage?: string) => {
    const fallback = generateFallbackAnalysis(room.name);
    
    const updatedRooms = rooms.map(r => {
      if (r.id === room.id) {
        return {
          ...r,
          image: customImage || r.image,
          isUnsplash: customImage ? false : r.isUnsplash,
          lastScanned: 'Just now',
          stats: fallback.stats,
          markers: fallback.markers,
          suggestions: fallback.suggestions,
          chatHistory: [
            ...(r.chatHistory || []),
            {
              role: 'model',
              text: `I have completed a localized Natural Tones scanning algorithm of your ${r.name}. Your flow score is analyzed at ${fallback.stats.flowScore}/10 with ${fallback.stats.itemCount} distinct objects. What would you like to focus on first?`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return r;
    });

    setRooms(updatedRooms);
    setAnalysisError(null);
  };

  // Trigger Image File Reading and API analysis
  const handleImageFile = async (file: File) => {
    if (!file) return;

    // Check size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image is too large. Please select an image smaller than 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target?.result as string;
      if (!base64Image) return;

      // Start Analysis
      setIsAnalyzing(true);
      setAnalysisError(null);
      setActiveMarker(null);

      // Optimistically show the image immediately in the room
      setRooms(prev => prev.map(r => {
        if (r.id === activeRoomId) {
          return { ...r, image: base64Image, isUnsplash: false };
        }
        return r;
      }));

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Image,
            roomName: activeRoom.name
          })
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error === 'GEMINI_API_KEY_MISSING') {
            setAnalysisError({
              type: 'GEMINI_API_KEY_MISSING',
              message: data.message || 'API Key is missing.'
            });
            // Automatically keep image, but set loading flag off so they see the banner
            setIsAnalyzing(false);
            return;
          }
          throw new Error(data.message || 'Analysis failed');
        }

        // Successfully received actual AI analysis!
        setRooms(prev => prev.map(r => {
          if (r.id === activeRoomId) {
            return {
              ...r,
              image: base64Image,
              isUnsplash: false,
              lastScanned: 'Just now',
              stats: {
                flowScore: data.flowScore || 7.0,
                itemCount: data.itemCount || 20,
                visualNoise: data.visualNoise || 'Medium'
              },
              markers: (data.markers || []).map((m: any, idx: number) => ({
                id: `m-scan-${idx}`,
                ...m
              })),
              suggestions: (data.suggestions || []).map((s: any, idx: number) => ({
                id: `s-scan-${idx}`,
                ...s
              })),
              chatHistory: [
                ...(r.chatHistory || []),
                {
                  role: 'model',
                  text: `I've finished scanning the uploaded photo of your ${r.name}. The AI detected ${data.itemCount || 'several'} items, scoring the structural visual flow at ${data.flowScore}/10. I've highlighted the clutter points and listed 3 customized Natural Tones Suggestions in your sidebar!`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]
            };
          }
          return r;
        }));

        setActiveTab('suggestions');

      } catch (err: any) {
        console.error('Analysis error:', err);
        setAnalysisError({
          type: 'SERVER_ERROR',
          message: err.message || 'An error occurred during scanning. Would you like to use our local layout modeling as fallback?'
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Re-scan Current Area
  const handleRescan = () => {
    if (activeRoom.isUnsplash) {
      // For preloaded unsplash rooms, we can trigger a short reload scan animation and reset state
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        applyFallbackScan(activeRoom);
      }, 1500);
    } else if (activeRoom.image) {
      // Re-run the actual base64 upload to server
      const mockFile = { size: 1000 } as File; // bypassed
      // Convert base64 back to file or call analysis with existing string
      setIsAnalyzing(true);
      setAnalysisError(null);

      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: activeRoom.image,
          roomName: activeRoom.name
        })
      })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          if (data.error === 'GEMINI_API_KEY_MISSING') {
            setAnalysisError({ type: 'GEMINI_API_KEY_MISSING', message: data.message });
          } else {
            throw new Error(data.message);
          }
          return;
        }

        setRooms(prev => prev.map(r => {
          if (r.id === activeRoomId) {
            return {
              ...r,
              lastScanned: 'Just now',
              stats: {
                flowScore: data.flowScore,
                itemCount: data.itemCount,
                visualNoise: data.visualNoise
              },
              markers: (data.markers || []).map((m: any, idx: number) => ({ id: `m-scan-${idx}`, ...m })),
              suggestions: (data.suggestions || []).map((s: any, idx: number) => ({ id: `s-scan-${idx}`, ...s }))
            };
          }
          return r;
        }));
      })
      .catch(err => {
        setAnalysisError({ type: 'SERVER_ERROR', message: err.message || 'Scan error' });
      })
      .finally(() => {
        setIsAnalyzing(false);
      });
    } else {
      triggerFileInput();
    }
  };

  // Chat message submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsgText = chatInput;
    setChatInput('');
    setAnalysisError(null);

    const userMessage: ChatMessage = {
      role: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update frontend state with User message instantly
    const updatedHistory = [...(activeRoom.chatHistory || []), userMessage];
    setRooms(prev => prev.map(r => {
      if (r.id === activeRoomId) {
        return { ...r, chatHistory: updatedHistory };
      }
      return r;
    }));

    setIsChatLoading(true);

    try {
      // Context to pass to server for smart room awareness
      const roomContext = {
        name: activeRoom.name,
        stats: activeRoom.stats,
        suggestions: activeRoom.suggestions
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map(m => ({ role: m.role, text: m.text })),
          roomContext
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'GEMINI_API_KEY_MISSING') {
          // Provide an engaging simulated declutter counselor response
          setTimeout(() => {
            const simulatedReplies = [
              `As your Natural Tones assistant, I'd suggest starting by grouping similar small objects into single designated areas. In your ${activeRoom.name}, clustering throws or paper reduces the active surface weight. Do you have a cabinet or basket we can allocate for this?`,
              `For a peaceful ${activeRoom.name} feel, let's keep visual focus anchors. Try choosing one main wooden or organic element to remain on the flat surfaces, and clear the surrounding rest. How does that sound?`,
              `To streamline your ${activeRoom.name} storage, remember the 30% rule: leave thirty percent of bookshelves or desks completely blank. This allows air and focus to sweep across the room. What item stands out to you as most cluttering right now?`
            ];
            const chosenReply = simulatedReplies[Math.floor(Math.random() * simulatedReplies.length)];
            
            setRooms(prev => prev.map(r => {
              if (r.id === activeRoomId) {
                return {
                  ...r,
                  chatHistory: [
                    ...updatedHistory,
                    {
                      role: 'model',
                      text: `[Offline Mode] ${chosenReply}\n\n*(Note: To connect Vesta with real live AI capabilities, configure your GEMINI_API_KEY in the Secrets panel)*`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]
                };
              }
              return r;
            }));
            setIsChatLoading(false);
          }, 800);
          return;
        }
        throw new Error(data.message || 'Chat error');
      }

      // Add Model reply to state
      setRooms(prev => prev.map(r => {
        if (r.id === activeRoomId) {
          return {
            ...r,
            chatHistory: [
              ...updatedHistory,
              {
                role: 'model',
                text: data.text || 'I hear you. Let us find an elegant organizational solution together.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
        }
        return r;
      }));

    } catch (err: any) {
      console.error(err);
      setRooms(prev => prev.map(r => {
        if (r.id === activeRoomId) {
          return {
            ...r,
            chatHistory: [
              ...updatedHistory,
              {
                role: 'model',
                text: `I'm having a little trouble connecting right now: "${err.message || 'Server connection failed'}". Let us try again in a moment!`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
        }
        return r;
      }));
    } finally {
      setIsChatLoading(false);
    }
  };

  // Add a brand new room
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const newId = `room-${Date.now()}`;
    const newRoomObj: Room = {
      id: newId,
      name: newRoomName.trim(),
      lastScanned: undefined,
      stats: undefined,
      markers: [],
      suggestions: [],
      chatHistory: [
        {
          role: 'model',
          text: `Welcome to your newly defined ${newRoomName.trim()} workspace! 🌿 I am ready to help you optimize the flow. Upload a photograph of the space to begin, or let me know what issues you're experiencing!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setRooms([...rooms, newRoomObj]);
    setActiveRoomId(newId);
    setNewRoomName('');
    setShowAddRoomModal(false);
    setActiveMarker(null);
    setAnalysisError(null);
  };

  // Delete a room safely
  const handleDeleteRoom = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (rooms.length <= 1) {
      alert("You must keep at least one room.");
      return;
    }
    
    const confirmDelete = window.confirm("Are you sure you want to delete this room?");
    if (!confirmDelete) return;

    const filtered = rooms.filter(r => r.id !== roomId);
    setRooms(filtered);
    
    // Switch active room if deleting current one
    if (activeRoomId === roomId) {
      setActiveRoomId(filtered[0].id);
    }
    setActiveMarker(null);
    setAnalysisError(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F6] text-[#4A443F] flex flex-col md:flex-row overflow-hidden font-sans select-none antialiased">
      
      {/* 1. Sidebar Navigation */}
      <aside className="w-full md:w-80 bg-[#F2EDE9] border-b md:border-b-0 md:border-r border-[#E6E0D9] flex flex-col p-6 md:p-8 shrink-0 md:h-screen overflow-y-auto">
        
        {/* Title Logo */}
        <div className="flex items-center gap-3 mb-8 md:mb-10">
          <div className="w-10 h-10 bg-[#7C876E] rounded-full flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-[#FAF8F6]" />
          </div>
          <div>
            <span className="text-xl font-serif font-semibold tracking-tight text-[#2D2926]">Vesta AI</span>
            <p className="text-[10px] text-[#8C837C] tracking-wide -mt-0.5">MIND-FLOW DECLUTTERING</p>
          </div>
        </div>

        {/* Rooms Listing */}
        <nav className="flex-1 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4 px-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#A69C94] font-bold">My Spaces</p>
              <span className="text-xs text-[#8C837C] italic">{rooms.length} room{rooms.length !== 1 ? 's' : ''}</span>
            </div>
            
            <ul className="space-y-1.5 max-h-[220px] md:max-h-none overflow-y-auto pr-1">
              {rooms.map((room) => {
                const isActive = room.id === activeRoomId;
                return (
                  <li 
                    key={room.id}
                    onClick={() => {
                      setActiveRoomId(room.id);
                      setActiveMarker(null);
                      setAnalysisError(null);
                    }}
                    className={`group flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#E5E1DB] text-[#2D2926]' 
                        : 'text-[#7D746D] hover:bg-[#EAE5DF] hover:text-[#2D2926]'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`w-2 h-2 rounded-full shrink-0 transition-all ${
                        isActive ? 'bg-[#7C876E] scale-110' : 'bg-transparent'
                      }`} />
                      <span className="truncate">{room.name}</span>
                    </div>

                    {/* Delete Icon shown on hover */}
                    <button 
                      onClick={(e) => handleDeleteRoom(room.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-[#D69F7E] p-1 rounded transition-opacity"
                      title="Delete Space"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Add New Room Trigger */}
          <button 
            onClick={() => setShowAddRoomModal(true)}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#CFC9C3] text-[#8C837C] py-3.5 rounded-2xl hover:border-[#7C876E] hover:text-[#7C876E] transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add New Room
          </button>
        </nav>

        {/* Plus Active Promo Card */}
        <div className="mt-8 md:mt-auto pt-6 border-t border-[#E6E0D9]">
          <div className="bg-[#E5E1DB] p-4 rounded-2xl border border-[#DCD7D0]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#7C876E] animate-pulse" />
              <p className="text-[10px] uppercase tracking-wider font-bold text-[#7C876E]">Vesta Professional Active</p>
            </div>
            <p className="text-xs text-[#8C837C] leading-relaxed">
              Infinite room modeling enabled. <br />
              <span className="text-[#2D2926] font-semibold">Gemini 3.1 & 3.5 online.</span>
            </p>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-20 border-b border-[#E6E0D9] px-6 md:px-10 flex items-center justify-between bg-[#FAF8F6] shrink-0">
          <div className="truncate pr-4">
            <h1 className="text-xl md:text-2xl font-serif text-[#2D2926] flex items-center gap-2 truncate">
              {activeRoom.name}
              {activeRoom.stats && (
                <span className="hidden sm:inline text-[#8C837C] text-sm font-light italic ml-2">
                  // {activeRoom.stats.visualNoise} Noise Level
                </span>
              )}
            </h1>
            <p className="text-xs text-[#8C837C] truncate mt-0.5">
              {activeRoom.lastScanned 
                ? `Last scanned ${activeRoom.lastScanned}` 
                : 'No visual scans conducted yet'}
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {/* Input file for custom photo upload */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => e.target.files && handleImageFile(e.target.files[0])}
              accept="image/*" 
              className="hidden" 
            />
            
            <button 
              onClick={triggerFileInput}
              className="border border-[#CFC9C3] text-[#4A443F] hover:bg-[#F2EDE9] px-4 py-2.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Photo
            </button>

            {activeRoom.image && (
              <button 
                onClick={handleRescan}
                disabled={isAnalyzing}
                className="bg-[#7C876E] text-[#FAF8F6] hover:bg-[#68705B] disabled:opacity-50 px-5 py-2.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Analyzing...' : 'Re-scan'}
              </button>
            )}
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-[#FAF8F6]">
          
          {/* Main Grid containing room image + organizational widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full max-w-7xl mx-auto items-stretch">
            
            {/* Left: Room Analysis Canvas Frame */}
            <div className="lg:col-span-8 flex flex-col min-h-[400px] lg:min-h-0 h-full">
              
              {/* Outer frame matching premium shadow & borders */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex-1 rounded-3xl overflow-hidden shadow-md border transition-all duration-300 flex flex-col justify-center items-center ${
                  isDragging 
                    ? 'border-[#7C876E] bg-[#F2F4EF] scale-[0.99] border-2 border-dashed' 
                    : 'border-[#E6E0D9] bg-white'
                }`}
              >
                {activeRoom.image ? (
                  <>
                    {/* The Room Photo */}
                    <img 
                      src={activeRoom.image} 
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        isAnalyzing ? 'opacity-40 blur-[2px]' : 'opacity-100'
                      }`} 
                      alt={activeRoom.name}
                    />

                    {/* Gradient shading to make stat tags highly visible */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {/* AI SCANNER LINE (Visible during scan) */}
                    {isAnalyzing && (
                      <div className="absolute inset-x-0 top-0 h-1.5 bg-[#7C876E] shadow-[0_0_15px_#7C876E] animate-bounce pointer-events-none" />
                    )}

                    {/* INTERACTIVE MARKERS OVERLAY (Not visible when loading) */}
                    {!isAnalyzing && activeRoom.markers?.map((marker) => {
                      const isActive = activeMarker?.id === marker.id;
                      
                      // Map categories to colors
                      const markerBg = marker.type === 'clutter' 
                        ? 'bg-[#D69F7E] text-white' 
                        : marker.type === 'suggestion' 
                          ? 'bg-[#7C876E] text-white' 
                          : 'bg-[#A69C94] text-white';

                      return (
                        <div 
                          key={marker.id}
                          style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                        >
                          {/* Pulsing visual core */}
                          <button 
                            onClick={() => setActiveMarker(isActive ? null : marker)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-all transform hover:scale-125 focus:outline-none ${markerBg} ${
                              isActive ? 'ring-4 ring-[#7C876E]/30 scale-110' : ''
                            }`}
                          >
                            {marker.type === 'clutter' ? (
                              <span className="text-[10px] font-bold">!</span>
                            ) : (
                              <Sparkles className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Hover Tooltip (Always available on hover on desktop, or clicked active state) */}
                          <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur shadow-xl border border-[#E6E0D9] p-4 rounded-2xl w-60 z-30 transition-all pointer-events-auto ${
                            isActive 
                              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                              : 'opacity-0 translate-y-2 scale-95 pointer-events-none md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:scale-100 md:group-hover:pointer-events-auto'
                          }`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                marker.type === 'clutter' 
                                  ? 'bg-[#FDF2ED] text-[#D69F7E]' 
                                  : 'bg-[#F2F4EF] text-[#7C876E]'
                              }`}>
                                {marker.type === 'clutter' ? 'Clutter Detected' : marker.type === 'suggestion' ? 'Suggestion' : 'Flow Tip'}
                              </span>
                              <span className="text-[10px] text-[#A69C94] font-medium">Pos: {Math.round(marker.x)}%, {Math.round(marker.y)}%</span>
                            </div>
                            <h4 className="text-xs font-bold text-[#2D2926] mb-1">{marker.title}</h4>
                            <p className="text-[11px] text-[#4A443F] leading-relaxed font-normal">{marker.description}</p>
                            
                            {/* Mobile action indicator */}
                            <div className="mt-2 pt-1.5 border-t border-[#E6E0D9]/60 flex items-center justify-between">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTab('chat');
                                  setChatInput(`Tell me more about how to resolve "${marker.title}" near the ${activeRoom.name} coordinates...`);
                                  setActiveMarker(null);
                                }}
                                className="text-[10px] text-[#7C876E] hover:text-[#68705B] font-semibold flex items-center gap-0.5"
                              >
                                Ask Vesta
                                <ChevronRight className="w-3 h-3" />
                              </button>
                              
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMarker(null);
                                }}
                                className="text-[10px] text-[#8C837C] hover:text-[#2D2926]"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Stats overlay dashboard float */}
                    <div className="absolute bottom-6 left-6 right-6 z-10">
                      {activeRoom.stats ? (
                        <div className="bg-[#FAF8F6]/90 backdrop-blur-md px-6 py-4 rounded-2xl flex justify-between shadow-lg border border-white/20">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-[#8C837C] mb-1">Flow Score</p>
                            <p className="text-xl md:text-2xl font-serif text-[#7C876E] font-semibold">
                              {activeRoom.stats.flowScore.toFixed(1)} 
                              <span className="text-xs text-[#A69C94] font-normal font-sans ml-1">/ 10</span>
                            </p>
                          </div>
                          
                          <div className="w-px bg-[#E6E0D9]" />
                          
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-[#8C837C] mb-1">Item Count</p>
                            <p className="text-xl md:text-2xl font-serif text-[#2D2926] font-semibold">{activeRoom.stats.itemCount}</p>
                          </div>
                          
                          <div className="w-px bg-[#E6E0D9]" />
                          
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-[#8C837C] mb-1">Visual Noise</p>
                            <p className={`text-xl md:text-2xl font-serif font-semibold ${
                              activeRoom.stats.visualNoise === 'High' 
                                ? 'text-[#D69F7E]' 
                                : activeRoom.stats.visualNoise === 'Medium' 
                                  ? 'text-[#A69C94]' 
                                  : 'text-[#7C876E]'
                            }`}>{activeRoom.stats.visualNoise}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl text-center shadow">
                          <p className="text-xs text-[#7D746D] font-medium">Scans provide room harmony and flow rating.</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* No image uploaded state / Dropzone layout */
                  <div className="text-center p-8 max-w-md flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#F2EDE9] rounded-full flex items-center justify-center mb-6 text-[#7C876E] border border-[#E6E0D9]">
                      <Upload className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-serif font-semibold text-[#2D2926] mb-2">Upload Room View</h3>
                    <p className="text-sm text-[#7D746D] leading-relaxed mb-6">
                      Drag & drop a photo of your {activeRoom.name} here, or click to browse. Let Vesta compute visual density and placement.
                    </p>
                    
                    <button 
                      onClick={triggerFileInput}
                      className="bg-[#2D2926] hover:bg-[#1A1816] text-[#FAF8F6] px-6 py-3 rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm"
                    >
                      Browse Media File
                    </button>
                    
                    <button 
                      onClick={() => applyFallbackScan(activeRoom)}
                      className="mt-4 text-xs text-[#7C876E] hover:text-[#68705B] font-semibold transition-colors flex items-center gap-1"
                    >
                      Start with Natural Tones demo template
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Loading scanning indicator */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-[#FAF8F6]/75 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                    <Loader2 className="w-10 h-10 text-[#7C876E] animate-spin mb-4" />
                    <p className="text-sm font-serif font-semibold text-[#2D2926] animate-pulse">Vesta is analyzing structural balance...</p>
                    <p className="text-xs text-[#8C837C] mt-1.5">Scanning surface density, objects, and visual clutter coordinates</p>
                  </div>
                )}
              </div>

              {/* API Key Missing error popup or warning card */}
              {analysisError && (
                <div className="mt-4 bg-white p-5 rounded-2xl border-l-4 border-[#D69F7E] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-[#D69F7E] shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <p className="text-sm font-bold text-[#2D2926]">API Key Configuration Guide</p>
                      <p className="text-xs text-[#7D746D] mt-0.5 leading-relaxed">
                        {analysisError.type === 'GEMINI_API_KEY_MISSING' 
                          ? 'Vesta requires a valid GEMINI_API_KEY in the user secrets panel of AI Studio to fetch live intelligent analysis of your uploaded photo.' 
                          : analysisError.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                    <button 
                      onClick={() => setAnalysisError(null)}
                      className="text-xs text-[#8C837C] hover:text-[#2D2926] px-3 py-1.5 rounded"
                    >
                      Close
                    </button>
                    <button 
                      onClick={() => applyFallbackScan(activeRoom)}
                      className="bg-[#7C876E] hover:bg-[#68705B] text-white text-xs px-4 py-2 rounded-full font-medium transition-colors"
                    >
                      Use Demo Analysis
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: Protocol & Gemini AI Counselor Chat Feed */}
            <div className="lg:col-span-4 flex flex-col bg-white border border-[#E6E0D9] rounded-3xl overflow-hidden h-[600px] lg:h-full shadow-sm">
              
              {/* Tab Toggles */}
              <div className="flex border-b border-[#E6E0D9] bg-[#FAF8F6]/50 shrink-0">
                <button 
                  onClick={() => setActiveTab('suggestions')}
                  className={`flex-1 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'suggestions' 
                      ? 'border-[#7C876E] text-[#2D2926] bg-white' 
                      : 'border-transparent text-[#8C837C] hover:text-[#4A443F]'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Protocol Feed
                </button>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'chat' 
                      ? 'border-[#7C876E] text-[#2D2926] bg-white' 
                      : 'border-transparent text-[#8C837C] hover:text-[#4A443F]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Ask Vesta (AI Chat)
                </button>
              </div>

              {/* Tab Contents Frame */}
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* A. Suggestions Feed tab */}
                {activeTab === 'suggestions' && (
                  <div className="flex-1 flex flex-col overflow-y-auto p-6 gap-4">
                    
                    <div className="flex justify-between items-center mb-1">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-[#8C837C]">Organization Protocol</h2>
                      {activeRoom.suggestions && activeRoom.suggestions.length > 0 && (
                        <span className="text-[10px] bg-[#F2F4EF] text-[#7C876E] px-2 py-0.5 rounded-full font-medium">3 actions loaded</span>
                      )}
                    </div>

                    {activeRoom.suggestions && activeRoom.suggestions.length > 0 ? (
                      <div className="space-y-4">
                        {activeRoom.suggestions.map((s) => {
                          const isUrgent = s.category === 'Urgent';
                          const badgeBg = isUrgent ? 'bg-[#FDF2ED] text-[#D69F7E]' : 'bg-[#F2F4EF] text-[#7C876E]';

                          return (
                            <div 
                              key={s.id} 
                              className="bg-[#FAF8F6] p-5 rounded-2xl shadow-sm border border-[#E6E0D9] flex flex-col gap-3 group hover:border-[#7C876E]/30 hover:shadow transition-all duration-300"
                            >
                              <div className="flex justify-between items-start">
                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${badgeBg}`}>
                                  {s.category}
                                </span>
                                <span className="text-[10px] text-[#A69C94] font-semibold">{s.scoreBenefit}</span>
                              </div>
                              <p className="text-sm font-serif font-semibold text-[#2D2926]">{s.title}</p>
                              <p className="text-xs text-[#7D746D] leading-relaxed">{s.description}</p>
                              
                              <div className="pt-2 border-t border-[#E6E0D9]/40 mt-1 flex justify-end">
                                <button 
                                  onClick={() => {
                                    setActiveTab('chat');
                                    setChatInput(`Vesta, can you explain step-by-step how to approach this suggestion: "${s.title}"?`);
                                  }}
                                  className="text-[11px] text-[#7C876E] hover:text-[#68705B] font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Discuss Steps
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Order shopping assets widget */}
                        <div className="mt-2 pt-2">
                          <button 
                            onClick={() => setShowShoppingOverlay(!showShoppingOverlay)}
                            className="w-full py-4 bg-[#2D2926] text-[#FAF8F6] rounded-2xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#1A1816] transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            {showShoppingOverlay ? 'Hide Recommendation List' : 'Generate Shopping List'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[#8C837C]">
                        <Compass className="w-10 h-10 mb-3 text-[#A69C94] stroke-[1.5]" />
                        <p className="text-xs leading-relaxed max-w-[200px]">
                          Upload a photo of your room space and scan to generate structural organization guidelines.
                        </p>
                      </div>
                    )}

                    {/* Shopping Overlay list - beautiful natural organic items slide down */}
                    {showShoppingOverlay && activeRoom.suggestions && (
                      <div className="mt-4 border-t border-[#E6E0D9] pt-4 animate-fadeIn">
                        <h3 className="text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <span>🌿</span> Harmonizing Tools (Supply Guide)
                        </h3>
                        <div className="space-y-3">
                          {RECOMMENDED_SUPPLIES.map((supply, idx) => (
                            <div key={idx} className="bg-white p-3.5 rounded-xl border border-[#E6E0D9] flex items-center justify-between gap-3 shadow-2xs">
                              <div className="flex gap-2.5 items-start">
                                <div className="w-8 h-8 rounded-lg bg-[#F2EDE9] flex items-center justify-center text-[#7C876E] shrink-0 mt-0.5">
                                  <supply.icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-[#2D2926]">{supply.name}</p>
                                  <p className="text-[10px] text-[#8C837C]">{supply.desc}</p>
                                </div>
                              </div>
                              <span className="text-xs font-serif font-bold text-[#7C876E] shrink-0">{supply.price}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-[#A69C94] italic mt-3 text-center">
                          Choose containers built of wicker, bamboo, linen, and clay to ground the eye.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* B. Multi-turn AI Counselor Chat thread tab */}
                {activeTab === 'chat' && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    
                    {/* Message Box Scroll Space */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {activeRoom.chatHistory && activeRoom.chatHistory.length > 0 ? (
                        activeRoom.chatHistory.map((msg, index) => {
                          const isUser = msg.role === 'user';
                          return (
                            <div 
                              key={index} 
                              className={`flex flex-col max-w-[85%] ${
                                isUser ? 'ml-auto items-end' : 'mr-auto items-start'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1 px-1">
                                {!isUser && (
                                  <div className="w-5 h-5 bg-[#7C876E] rounded-full flex items-center justify-center text-[10px] text-[#FAF8F6]">
                                    V
                                  </div>
                                )}
                                <span className="text-[9px] text-[#A69C94] uppercase tracking-wider font-semibold">
                                  {isUser ? 'You' : 'Vesta AI'}
                                </span>
                                <span className="text-[8px] text-[#C0B9B2] font-medium ml-1">{msg.timestamp}</span>
                              </div>

                              <div 
                                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                                  isUser 
                                    ? 'bg-[#E5E1DB] text-[#2D2926] rounded-tr-xs' 
                                    : 'bg-[#FAF8F6] text-[#4A443F] border border-[#E6E0D9] rounded-tl-xs shadow-2xs'
                                }`}
                              >
                                {msg.text.split('\n').map((para, idx) => (
                                  <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{para}</p>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-[#8C837C] p-4">
                          <MessageSquare className="w-10 h-10 mb-2 stroke-[1.5]" />
                          <p className="text-xs">Chat is ready. Send a message to discuss your room layout!</p>
                        </div>
                      )}

                      {/* Loading/Typing message indicators */}
                      {isChatLoading && (
                        <div className="flex flex-col max-w-[80%] mr-auto items-start">
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <div className="w-5 h-5 bg-[#7C876E] rounded-full flex items-center justify-center text-[10px] text-[#FAF8F6]">
                              V
                            </div>
                            <span className="text-[9px] text-[#A69C94] uppercase tracking-wider font-semibold">Vesta AI</span>
                          </div>
                          <div className="bg-[#FAF8F6] border border-[#E6E0D9] p-4 rounded-2xl rounded-tl-xs flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 text-[#7C876E] animate-spin" />
                            <span className="text-xs text-[#8C837C] italic">Vesta is contemplating layout flow...</span>
                          </div>
                        </div>
                      )}

                      <div ref={chatBottomRef} />
                    </div>

                    {/* Chat Message Input Container */}
                    <form 
                      onSubmit={handleSendMessage}
                      className="p-4 border-t border-[#E6E0D9] bg-[#FAF8F6]/50 flex items-center gap-2 shrink-0"
                    >
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={`Message Vesta about your ${activeRoom.name}...`}
                        className="flex-1 bg-white border border-[#CFC9C3] rounded-2xl px-4 py-3 text-xs outline-none focus:border-[#7C876E] transition-colors"
                      />
                      <button 
                        type="submit" 
                        disabled={!chatInput.trim() || isChatLoading}
                        className="w-10 h-10 bg-[#2D2926] text-[#FAF8F6] rounded-2xl flex items-center justify-center hover:bg-[#1A1816] disabled:opacity-40 transition-all shadow-xs shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </main>

      {/* 3. Add Room Dialog/Modal */}
      {showAddRoomModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-[#E6E0D9] p-6 max-w-sm w-full shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif font-semibold text-lg text-[#2D2926]">Add Custom Space</h3>
              <button 
                onClick={() => setShowAddRoomModal(false)}
                className="text-[#8C837C] hover:text-[#2D2926] p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8C837C] mb-1.5">Space Name</label>
                <input 
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g., Guest Room, Kitchen, Zen Balcony"
                  className="w-full bg-[#FAF8F6] border border-[#CFC9C3] rounded-xl px-4 py-3 text-xs outline-none focus:border-[#7C876E] transition-colors"
                  maxLength={25}
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2 justify-end">
                <button 
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2 text-xs text-[#8C837C] hover:text-[#2D2926]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-[#7C876E] hover:bg-[#68705B] text-white px-5 py-2.5 rounded-full text-xs font-semibold transition-colors shadow-sm"
                >
                  Create Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
