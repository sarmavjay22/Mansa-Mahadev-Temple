import { useState, useEffect, useRef, ChangeEvent, MouseEvent } from 'react';
import { db, subscribeToDBUpdates } from '../lib/db';
import { BhajanItem } from '../types';
import { uploadToImageKit } from '../lib/imagekit';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX, 
  Music, 
  Trash2, 
  Plus, 
  Upload, 
  Loader2, 
  Check, 
  Disc,
  Disc3,
  Calendar,
  Sparkles,
  Youtube,
  Video,
  Edit,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Helper to extract YouTube Video ID from any watch link or iframe embed code
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  // If it's an iframe embed string
  if (url.includes('<iframe')) {
    const srcMatch = url.match(/src=["']([^"']+)["']/);
    if (srcMatch) {
      url = srcMatch[1];
    }
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Global Singleton Audio instance to enable "Background Play" safely
// across component mounts and prevent multiple audio elements clashing.
let globalAudioInstance: HTMLAudioElement | null = null;

export default function BhajanSection() {
  const [bhajans, setBhajans] = useState<BhajanItem[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  
  // Derived active track state to keep displays and audio in 100% synchronization
  const activeTrack = (currentTrackId && bhajans.find(b => b.id === currentTrackId)) || bhajans[0];
  const currentTrackIndex = activeTrack ? bhajans.findIndex(b => b.id === activeTrack.id) : 0;
  const activeYtId = activeTrack ? getYouTubeId(activeTrack.audioUrl) : null;

  // Audio state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState('none'); // 'none' | 'one' | 'all'
  
  // Admin upload states
  const [isAdmin, setIsAdmin] = useState(db.isAdminLoggedIn());
  const [isEditing, setIsEditing] = useState(false);
  const [editingBhajanId, setEditingBhajanId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newSinger, setNewSinger] = useState('');
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Custom alert and delete confirmation states
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load playlists & auth state
  useEffect(() => {
    const loadedBhajans = db.getBhajans();
    setBhajans(loadedBhajans);
    if (loadedBhajans.length > 0 && !currentTrackId) {
      setCurrentTrackId(loadedBhajans[0].id);
    }
    setIsAdmin(db.isAdminLoggedIn());

    const unsubscribe = subscribeToDBUpdates(() => {
      const freshBhajans = db.getBhajans();
      setBhajans(freshBhajans);
      setIsAdmin(db.isAdminLoggedIn());
    });
    return unsubscribe;
  }, [currentTrackId]);

  // Sync playing state once on mount if already playing in background
  useEffect(() => {
    if (globalAudioInstance) {
      setIsPlaying(!globalAudioInstance.paused);
    }
  }, []);

  // Initialize or attach global audio element
  useEffect(() => {
    if (!globalAudioInstance) {
      globalAudioInstance = new Audio();
    }
    audioRef.current = globalAudioInstance;
    
    // Setup listeners
    const audio = audioRef.current;
    
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      handleNextTrack(true); // Auto-advancing ended song
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    // Sync initial state
    setVolume(audio.volume);
    setIsMuted(audio.muted);
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration || 0);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [bhajans, currentTrackId, isShuffle, isRepeat]);

  // Handle source changes and playback sync
  useEffect(() => {
    if (bhajans.length === 0 || !audioRef.current) return;
    const currentTrack = activeTrack;
    if (!currentTrack) return;

    const audio = audioRef.current;
    const cleanUrl = currentTrack.audioUrl;

    // Reset error state
    setPlaybackError(null);

    // If active track is a YouTube video, pause standard audio and skip loading audio source
    const ytId = getYouTubeId(cleanUrl);
    if (ytId) {
      audio.pause();
      if (audio.src) {
        audio.src = "";
      }
      return;
    }

    // Validate audio URL
    if (!cleanUrl || cleanUrl.trim() === "") {
      setPlaybackError("भजन ऑडियो उपलब्ध नहीं है (Audio URL is missing)");
      setIsPlaying(false);
      audio.pause();
      audio.src = "";
      return;
    }

    if (!/^(https?:\/\/|\/|data:)/i.test(cleanUrl.trim())) {
      setPlaybackError("अमान्य ऑडियो यूआरएल (Invalid Audio URL)");
      setIsPlaying(false);
      audio.pause();
      audio.src = "";
      return;
    }

    // Update src and load
    try {
      let absoluteCleanUrl = cleanUrl;
      if (cleanUrl.startsWith('/')) {
        absoluteCleanUrl = window.location.origin + cleanUrl;
      }

      if (audio.src !== absoluteCleanUrl) {
        audio.src = cleanUrl;
        audio.load();
      }

      // Sync play/pause state
      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            // Ignore benign AbortError/interruption from intentional navigation
            if (e.name !== 'AbortError' && e.name !== 'InterruptedError') {
              console.warn("Audio playback warning:", e);
              setPlaybackError("ऑडियो लोड करने में असमर्थ (Unable to load audio)");
              setIsPlaying(false);
            }
          });
        }
      } else {
        audio.pause();
      }
    } catch (err) {
      console.warn("Warning setting audio source:", err);
      setPlaybackError("ऑडियो त्रुटि (Audio Source Error)");
      setIsPlaying(false);
    }
  }, [activeTrack?.id, activeTrack?.audioUrl, isPlaying]);

  // Audio actions
  const togglePlay = () => {
    if (!audioRef.current || bhajans.length === 0) return;
    const audio = audioRef.current;
    
    // Clear any previous error
    setPlaybackError(null);

    const currentTrack = activeTrack;
    const cleanUrl = currentTrack?.audioUrl;

    if (cleanUrl && getYouTubeId(cleanUrl)) {
      // YouTube videos have their own embedded play/pause controls.
      return;
    }

    if (!cleanUrl || cleanUrl.trim() === "" || !/^(https?:\/\/|\/|data:)/i.test(cleanUrl.trim())) {
      setPlaybackError("अमान्य या अनुपलब्ध ऑडियो यूआरएल (Invalid or missing Audio URL)");
      alert("त्रुटि: इस भजन का ऑडियो लिंक अमान्य या अनुपलब्ध है।");
      setIsPlaying(false);
      audio.pause();
      return;
    }

    setIsPlaying(prev => !prev);
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newVol = parseFloat(e.target.value);
    audioRef.current.volume = newVol;
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    audioRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  const handleNextTrack = (autoPlayNext = false) => {
    if (bhajans.length === 0) return;

    if (isRepeat === 'one' && autoPlayNext) {
      // Repeat current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log(e));
      }
      return;
    }

    let nextIndex = currentTrackIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * bhajans.length);
    } else {
      if (currentTrackIndex === bhajans.length - 1) {
        nextIndex = isRepeat === 'all' || autoPlayNext ? 0 : currentTrackIndex;
      } else {
        nextIndex = currentTrackIndex + 1;
      }
    }
    
    // Ensure index is valid and safe
    const track = bhajans[nextIndex];
    if (!track) return;

    if (getYouTubeId(track.audioUrl)) {
      setCurrentTrackId(track.id);
      setIsPlaying(false);
      return;
    }

    if (!track.audioUrl || track.audioUrl.trim() === "" || !/^(https?:\/\/|\/|data:)/i.test(track.audioUrl.trim())) {
      setCurrentTrackId(track.id);
      setIsPlaying(false);
      setPlaybackError("अमान्य या अनुपलब्ध ऑडियो यूआरएल (Invalid or missing Audio URL)");
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      return;
    }

    setCurrentTrackId(track.id);
    if (isPlaying || autoPlayNext) {
      setIsPlaying(true);
    }
  };

  const handlePrevTrack = () => {
    if (bhajans.length === 0) return;
    
    if (currentTime > 4) {
      // Restart current track if played past 4s
      if (audioRef.current) audioRef.current.currentTime = 0;
      return;
    }

    let prevIndex = currentTrackIndex === 0 ? bhajans.length - 1 : currentTrackIndex - 1;
    const track = bhajans[prevIndex];
    if (!track) return;

    if (getYouTubeId(track.audioUrl)) {
      setCurrentTrackId(track.id);
      setIsPlaying(false);
      return;
    }

    if (!track.audioUrl || track.audioUrl.trim() === "" || !/^(https?:\/\/|\/|data:)/i.test(track.audioUrl.trim())) {
      setCurrentTrackId(track.id);
      setIsPlaying(false);
      setPlaybackError("अमान्य या अनुपलब्ध ऑडियो यूआरएल (Invalid or missing Audio URL)");
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      return;
    }

    setCurrentTrackId(track.id);
    if (isPlaying) {
      setIsPlaying(true);
    }
  };

  const handleSelectTrack = (trackId: string) => {
    // Clear previous error
    setPlaybackError(null);
    
    const track = bhajans.find(b => b.id === trackId);
    if (!track) return;

    if (getYouTubeId(track.audioUrl)) {
      setCurrentTrackId(trackId);
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      return;
    }

    if (!track.audioUrl || track.audioUrl.trim() === "" || !/^(https?:\/\/|\/|data:)/i.test(track.audioUrl.trim())) {
      setCurrentTrackId(trackId);
      setIsPlaying(false);
      setPlaybackError("अमान्य या अनुपलब्ध ऑडियो यूआरएल (Invalid or missing Audio URL)");
      alert("त्रुटि: इस भजन का ऑडियो लिंक अमान्य या अनुपलब्ध है।");
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      return;
    }

    if (trackId === currentTrackId) {
      // Toggle play/pause if selecting the active song
      setIsPlaying(prev => !prev);
    } else {
      setCurrentTrackId(trackId);
      setIsPlaying(true);
    }
  };

  const handleRepeatToggle = () => {
    setRepeatState(prev => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  };

  // State wrapper helper for repeat
  const setRepeatState = (fn: (p: string) => string) => {
    const next = fn(isRepeat);
    setIsRepeat(next);
  };

  // Admin upload audio file handler
  const handleAudioUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const audioUrl = await uploadToImageKit(file);
      setNewAudioUrl(audioUrl);
    } catch (err) {
      console.error(err);
      setAlertMessage("ऑडियो अपलोड विफल हुआ। कृपया पुनः प्रयास करें।");
    } finally {
      setUploading(false);
    }
  };

  const handleStartEditBhajan = (track: BhajanItem, e: MouseEvent) => {
    e.stopPropagation();
    setEditingBhajanId(track.id);
    setNewTitle(track.title);
    setNewSinger(track.singer || '');
    setNewAudioUrl(track.audioUrl);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditingBhajanId(null);
    setNewTitle('');
    setNewSinger('');
    setNewAudioUrl('');
  };

  const handleSaveBhajan = async () => {
    if (!newTitle.trim() || !newAudioUrl.trim()) {
      setAlertMessage("कृपया भजन का नाम और ऑडियो फ़ाइल/URL/यूट्यूब लिंक भरें।");
      return;
    }

    const ytId = getYouTubeId(newAudioUrl.trim());
    const finalThumbnail = ytId 
      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      : "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=200&auto=format&fit=crop";

    const bhajanData = {
      title: newTitle.trim(),
      singer: newSinger.trim() || "पारंपरिक",
      audioUrl: newAudioUrl.trim(),
      thumbnailUrl: finalThumbnail,
      duration: ytId ? "वीडियो" : "5:00"
    };

    try {
      if (editingBhajanId) {
        await db.updateBhajan(editingBhajanId, bhajanData);
      } else {
        await db.addBhajan(bhajanData);
      }
      setSaveSuccess(true);
    } catch (err) {
      console.error(err);
      setAlertMessage("सहेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।");
      return;
    }

    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
      setEditingBhajanId(null);
      setNewTitle('');
      setNewSinger('');
      setNewAudioUrl('');
    }, 1500);
  };

  const handleDeleteBhajan = (id: string, e: MouseEvent) => {
    e.stopPropagation(); // Avoid triggering track select
    setDeleteConfirmId(id);
  };

  // Formatting helpers
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <section id="bhajan-section" className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
          <Music className="w-5 h-5 text-amber-500 fill-amber-100 animate-bounce" />
          <span>शिव भजन एवं मंत्र</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">भक्ति रस</span>
        </h2>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 font-bold px-3 py-1.5 rounded-xl transition duration-300"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>भजन जोड़ें</span>
          </button>
        )}
      </div>

      {/* Admin Panel audio uploader */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-amber-50/90 border border-amber-200/50 p-4 rounded-3xl shadow-inner text-slate-800"
          >
            <h3 className="text-md font-bold text-amber-800 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Music className="w-4 h-4 text-amber-600" />
                <span>{editingBhajanId ? 'भजन विवरण संशोधित करें' : 'नया भजन जोड़ें (ऑडियो फ़ाइल या यूट्यूब लिंक)'}</span>
              </span>
              {editingBhajanId && (
                <span className="text-[10px] bg-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded-lg">संशोधन मोड</span>
              )}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">भजन का नाम (Title):</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="उदा. शिव चालीसा, महामृत्युंजय मंत्र..."
                    className="w-full px-3 py-2 text-sm bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Singer */}
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">गायक का नाम (Singer):</label>
                  <input
                    type="text"
                    value={newSinger}
                    onChange={(e) => setNewSinger(e.target.value)}
                    placeholder="उदा. अनुराधा पौडवाल, पारंपरिक"
                    className="w-full px-3 py-2 text-sm bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 justify-between">
                {/* Audio Upload / YouTube Link */}
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">भजन का ऑडियो/यूट्यूब स्रोत (Audio/YouTube Source):</label>
                  <div className="bg-white/80 border border-amber-200/50 rounded-2xl p-3 flex flex-col gap-2.5">
                    {/* File Upload Option */}
                    <div>
                      <span className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">विकल्प 1: ऑडियो फ़ाइल अपलोड करें</span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-1.5 bg-amber-50/50 hover:bg-amber-100/50 border border-dashed border-amber-300 text-amber-800 font-semibold py-1.5 px-3 rounded-xl text-xs cursor-pointer transition"
                      >
                        {uploading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span>{uploading ? 'अपलोड हो रहा है...' : 'फाइल चुनें'}</span>
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAudioUpload}
                        accept="audio/*"
                        className="hidden"
                      />
                    </div>

                    <div className="relative flex py-0.5 items-center">
                      <div className="flex-grow border-t border-amber-200/30"></div>
                      <span className="flex-shrink mx-2 text-[9px] font-bold text-amber-500 uppercase">अथवा</span>
                      <div className="flex-grow border-t border-amber-200/30"></div>
                    </div>

                    {/* URL/YouTube Input */}
                    <div>
                      <span className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">विकल्प 2: ऑडियो URL या YouTube लिंक / एम्बेड कोड</span>
                      <input
                        type="text"
                        value={newAudioUrl}
                        onChange={(e) => setNewAudioUrl(e.target.value)}
                        placeholder="उदा. https://www.youtube.com/watch?v=... या iframe"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleCancelEditing}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-xl text-xs transition"
                  >
                    रद्द करें
                  </button>
                  <button
                    onClick={handleSaveBhajan}
                    disabled={uploading}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow transition"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{editingBhajanId ? 'भजन संशोधित कर दिया गया!' : 'भजन सहेज लिया गया!'}</span>
                      </>
                    ) : (
                      <span>{editingBhajanId ? 'संशोधन सहेजें' : 'सहेजें'}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Devotional Audio Player Frame */}
      <div className="w-full bg-white/70 backdrop-blur-md border border-white/50 rounded-3xl shadow-xl shadow-sky-100/40 p-4 md:p-6 flex flex-col md:flex-row gap-6">
        
        {/* Left Hand: Album / Spinning Diya & Metadata */}
        {activeTrack ? (
          <div className="w-full md:w-2/5 flex flex-col items-center text-center justify-center gap-4 border-b md:border-b-0 md:border-r border-sky-100 pb-6 md:pb-0 md:pr-6 shrink-0">
            {activeYtId ? (
              /* YouTube Video Embed Player */
              <div className="w-full aspect-video rounded-2xl overflow-hidden border-2 border-amber-400/30 shadow-lg bg-slate-950 relative">
                <iframe
                  src={`https://www.youtube.com/embed/${activeYtId}?autoplay=0&rel=0&modestbranding=1`}
                  title={activeTrack.title}
                  className="w-full h-full absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              /* Rotate Vinly Plate Disc */
              <div className="relative group select-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-orange-500/20 rounded-full blur-lg opacity-80 pointer-events-none"></div>
                
                <div className={`w-36 h-36 md:w-44 md:h-44 rounded-full bg-slate-900 border-4 border-amber-100/80 shadow-2xl flex items-center justify-center overflow-hidden relative ${
                  isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''
                }`}>
                  {/* Vinyl Texture Lines */}
                  <div className="absolute inset-2 border border-dashed border-white/10 rounded-full pointer-events-none"></div>
                  <div className="absolute inset-6 border border-white/5 rounded-full pointer-events-none"></div>
                  <div className="absolute inset-10 border border-white/10 rounded-full pointer-events-none"></div>
                  
                  {/* Meditating Shiva center */}
                  <img
                    src={activeTrack.thumbnailUrl}
                    alt="भजन एल्बम"
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-amber-300 z-10"
                    referrerPolicy="no-referrer"
                  />

                  {/* center hole */}
                  <div className="absolute w-3 h-3 bg-white border border-amber-400 rounded-full z-20"></div>
                </div>

                {/* Devotional Ring Overlay */}
                <div className="absolute -inset-1 border-2 border-amber-400/30 rounded-full scale-105 pointer-events-none"></div>
              </div>
            )}

            {/* Title & Singer HUD */}
            <div className="px-1 max-w-full">
              <h3 className="text-md md:text-lg font-bold text-slate-800 line-clamp-1 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                <span>{activeTrack.title}</span>
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-1">स्वर: {activeTrack.singer}</p>
            </div>
            
            {/* Visualizer bars when playing or error message */}
            {playbackError ? (
              <div className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 mt-1 animate-pulse">
                ⚠️ {playbackError}
              </div>
            ) : isPlaying ? (
              <div className="flex items-end gap-1 h-5 mt-1">
                {[...Array(6)].map((_, i) => (
                  <span 
                    key={i} 
                    className="w-1 bg-amber-500 rounded-full animate-[pulse_1s_ease-in-out_infinite]"
                    style={{ 
                      height: `${Math.floor(Math.random() * 16) + 4}px`, 
                      animationDelay: `${i * 0.15}s` 
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-[10px] font-bold text-slate-400">प्लेबैक थमा हुआ है</div>
            )}
          </div>
        ) : (
          <div className="w-full md:w-2/5 flex flex-col items-center text-center justify-center py-8">
            <Disc className="w-12 h-12 text-slate-300 mb-2 animate-spin" />
            <p className="text-xs text-slate-400">भजन सूचि खाली है</p>
          </div>
        )}

        {/* Right Hand: Interactive Controls & Queue List */}
        <div className="flex-1 flex flex-col justify-between gap-4">
          
          {/* Seek Progress Bar Row */}
          {activeTrack && (
            activeYtId ? (
              <div className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50/40 rounded-2xl border border-amber-100/50 text-amber-800 text-[10px] md:text-xs font-bold text-center">
                <Youtube className="w-4 h-4 text-red-600 animate-pulse shrink-0" />
                <span>यूट्यूब भजन सक्रिय: नियंत्रण के लिए ऊपर प्लेयर का उपयोग करें</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1 px-1">
                {/* slider */}
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-100 hover:bg-slate-200 accent-amber-500 rounded-lg appearance-none cursor-pointer"
                />
                {/* timings display */}
                <div className="flex justify-between text-[11px] font-mono font-semibold text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )
          )}

          {/* Action Controllers Row */}
          <div className="flex items-center justify-between gap-3 px-2">
            {/* Shuffle Toggle */}
            <button
              onClick={() => setIsShuffle(prev => !prev)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition active:scale-95 ${
                isShuffle ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="शफ़ल प्ले (Shuffle)"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Skip Back */}
            <button
              onClick={handlePrevTrack}
              className="w-10 h-10 rounded-full text-slate-600 hover:text-slate-800 flex items-center justify-center hover:bg-slate-50 transition active:scale-90"
              title="पिछला ट्रैक"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* MAIN PLAY-PAUSE ROUND CONTROLLER */}
            {activeYtId ? (
              <div 
                className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 border-2 border-white/60"
                title="यूट्यूब प्लेयर सक्रिय है"
              >
                <Youtube className="w-6 h-6 text-white fill-current" />
              </div>
            ) : (
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 hover:scale-105 transition active:scale-95 border-2 border-white/60"
                title={isPlaying ? 'रोकें' : 'बजाएं'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current text-white" />
                ) : (
                  <Play className="w-6 h-6 fill-current text-white translate-x-0.5" />
                )}
              </button>
            )}

            {/* Skip Forward */}
            <button
              onClick={() => handleNextTrack()}
              className="w-10 h-10 rounded-full text-slate-600 hover:text-slate-800 flex items-center justify-center hover:bg-slate-50 transition active:scale-90"
              title="अगला ट्रैक"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            {/* Repeat One / Repeat All / No Repeat */}
            <button
              onClick={handleRepeatToggle}
              className={`w-9 h-9 rounded-xl flex items-center justify-center relative transition active:scale-95 ${
                isRepeat !== 'none' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="रिपीट प्ले (Repeat)"
            >
              <Repeat className="w-4 h-4" />
              {isRepeat === 'one' && (
                <span className="absolute -top-1 -right-1 text-[8px] font-black bg-amber-500 text-slate-900 w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">1</span>
              )}
              {isRepeat === 'all' && (
                <span className="absolute -top-1 -right-1 text-[8px] font-black bg-orange-500 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">A</span>
              )}
            </button>
          </div>

          {/* Volume control slider */}
          {!activeYtId && (
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-2xl px-3.5 py-1.5 self-center">
              <button onClick={toggleMute} className="text-slate-500 hover:text-slate-700">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-slate-200 accent-amber-500 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}

          {/* Playlist Tracks queue list */}
          <div className="flex-1 mt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 select-none tracking-widest px-1">प्लेलिस्ट ट्रैक ({bhajans.length}):</p>
            <div className="max-h-36 overflow-y-auto flex flex-col gap-1.5 pr-1 text-sm scrollbar-thin">
              {bhajans.map((track, idx) => {
                const isTrackYt = !!getYouTubeId(track.audioUrl);
                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectTrack(track.id)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition active:scale-99 ${
                      track.id === activeTrack?.id 
                        ? 'bg-amber-50 border border-amber-200/50 text-amber-800 font-bold' 
                        : 'hover:bg-slate-50/50 text-slate-600 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs text-slate-400 w-4 shrink-0 text-center">
                        {track.id === activeTrack?.id ? (
                          isTrackYt ? (
                            <Youtube className="w-3.5 h-3.5 text-red-500 fill-red-500 mx-auto animate-pulse" />
                          ) : isPlaying ? (
                            <span className="text-amber-500">▶</span>
                          ) : (
                            <span className="text-amber-500">⏸</span>
                          )
                        ) : (
                          idx + 1
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs md:text-sm flex items-center gap-1">
                          <span>{track.title}</span>
                          {isTrackYt && (
                            <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-red-50 text-red-600 text-[8px] font-bold tracking-wide uppercase border border-red-100">
                              यूट्यूब
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{track.singer}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono font-bold text-slate-400 mr-1">{track.duration}</span>
                      <>
                        <button
                          onClick={(e) => handleStartEditBhajan(track, e)}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition"
                          title="संशोधित करें"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteBhajan(track.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Alert Dialog Modal */}
      {alertMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-amber-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-md font-bold text-slate-800 mb-2">सूचना</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">{alertMessage}</p>
            <button
              onClick={() => setAlertMessage(null)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-xl text-xs shadow transition active:scale-95"
            >
              ठीक है (OK)
            </button>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-rose-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 text-rose-500 animate-pulse" />
            </div>
            <h3 className="text-md font-bold text-slate-800 mb-2">भजन हटाएं?</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-5 font-medium">
              क्या आप वाकई इस भजन को प्लेलिस्ट से हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 rounded-xl text-xs transition"
              >
                रद्द करें
              </button>
              <button
                onClick={async () => {
                  try {
                    await db.deleteBhajan(deleteConfirmId);
                    setCurrentTrackId(null);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setDeleteConfirmId(null);
                  }
                }}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 rounded-xl text-xs shadow-lg shadow-rose-500/20 transition active:scale-95"
              >
                हाँ, हटाएं
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
