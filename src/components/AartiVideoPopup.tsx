import { useState, useEffect, useRef, MouseEvent } from 'react';
import { db, subscribeToDBUpdates, formatDateDMY } from '../lib/db';
import { VideoDarshan } from '../types';
import { 
  X, 
  Calendar, 
  Search, 
  RefreshCw, 
  Sparkles, 
  Maximize2, 
  Youtube, 
  Heart, 
  Share2, 
  Minimize2, 
  Play 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getHindiDayAndDate } from './ShringarPopup';

interface AartiVideoPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AartiVideoPopup({ isOpen, onClose }: AartiVideoPopupProps) {
  const [videos, setVideos] = useState<VideoDarshan[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchDateQuery, setSearchDateQuery] = useState<string>('');
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [fullscreenVideo, setFullscreenVideo] = useState<VideoDarshan | null>(null);

  const loadVideos = () => {
    const list = db.getVideos();
    // Sorted by date in descending order (newest first)
    list.sort((a, b) => b.date.localeCompare(a.date));
    setVideos(list);
  };

  useEffect(() => {
    loadVideos();

    const unsubscribe = subscribeToDBUpdates(() => {
      loadVideos();
    });

    // Load likes from localStorage
    const savedLikes = localStorage.getItem('mm_video_likes');
    if (savedLikes) {
      try {
        setLikedVideos(JSON.parse(savedLikes));
      } catch (e) {
        console.error(e);
      }
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadVideos();
    }
  }, [isOpen]);

  const handleLike = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const newLikes = { ...likedVideos, [id]: !likedVideos[id] };
    setLikedVideos(newLikes);
    localStorage.setItem('mm_video_likes', JSON.stringify(newLikes));
  };

  // Helper to extract YouTube Video ID from any URL
  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    if (url.includes('/shorts/')) {
      const parts = url.split('/shorts/');
      if (parts[1]) {
        return parts[1].substring(0, 11);
      }
    }
    return null;
  };

  const handleShare = async (item: VideoDarshan, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    const info = getHindiDayAndDate(item.date);
    const shareText = `ॐ नमः शिवाय! मंसा महादेव मंदिर तितरड़ी, उदयपुर का दिव्य आरती वीडियो:\nशीर्षक: ${item.title}\nदिन: ${info.day}, तिथि: ${info.date}\n\nवीडियो दर्शन के लिए यहाँ देखें: ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'मंसा महादेव मंदिर आरती वीडियो',
          text: shareText,
          url: window.location.origin,
        });
      } catch (error) {
        console.log("Sharing failed", error);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("वीडियो दर्शन लिंक क्लिपबोर्ड पर कॉपी हो गया है! आप इसे व्हाट्सएप पर शेयर कर सकते हैं।");
    }
  };

  const handleSearchClick = () => {
    setSearchDateQuery(selectedDate);
  };

  const handleResetSearch = () => {
    setSelectedDate('');
    setSearchDateQuery('');
  };

  // Filter videos based on searched date
  const displayedVideos = videos.filter(item => {
    if (!searchDateQuery) return true;
    return item.date === searchDateQuery;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      {/* Backdrop clickable */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <motion.div
        initial={{ scale: 0.95, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 30, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#fffdf5] to-[#fcfaf2] border border-amber-200/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] text-slate-800 z-10"
      >
        {/* Top Decorative Border */}
        <div className="h-2 w-full bg-gradient-to-r from-red-500 via-orange-400 to-amber-500 shrink-0"></div>

        {/* Modal Header */}
        <div className="p-5 border-b border-amber-200/40 bg-gradient-to-r from-amber-500/5 to-amber-600/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl text-white shadow-md shadow-red-500/10">
              <Youtube className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-extrabold tracking-wide text-slate-800 flex items-center gap-2">
                भोलेनाथ की आरती वीडियो
              </h2>
              <p className="text-xs md:text-sm text-amber-700 font-bold">
                मंसा महादेव के आरती एवं सत्संग वीडियो की गैलरी
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:static w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-amber-200/30 shadow-md flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 text-slate-500 transition duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar / Date Selector */}
        <div className="px-5 py-4 bg-amber-50/40 border-b border-amber-200/30 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-base text-amber-800 font-bold shrink-0">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span>तिथि अनुसार वीडियो खोजें:</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-44 px-3 py-1.5 text-xs bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-bold text-slate-800 shadow-sm"
            />
            
            <button
              onClick={handleSearchClick}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs shadow-sm transition flex items-center gap-1 shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>खोजें</span>
            </button>

            {(searchDateQuery || selectedDate) && (
              <button
                onClick={handleResetSearch}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition shrink-0"
                title="साफ़ करें"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Scroll Content (Videos list) */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          <AnimatePresence mode="popLayout">
            {displayedVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedVideos.map((item, idx) => {
                  const info = getHindiDayAndDate(item.date);
                  const isLiked = likedVideos[item.id] || false;
                  const videoId = getYouTubeId(item.youtubeUrl);
                  const thumbnailUrl = videoId 
                    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                    : '';

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white border border-amber-200/30 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                      onClick={() => setFullscreenVideo(item)}
                    >
                      {/* Video Thumbnail Frame */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-slate-900 shrink-0">
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 referrer-policy='no-referrer'"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                            <Youtube className="w-12 h-12" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition duration-300"></div>

                        {/* Floating Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition duration-300">
                            <Play className="w-6 h-6 fill-white ml-0.5" />
                          </div>
                        </div>

                        {/* Float Badge for Date & Day */}
                        <div className="absolute top-3 left-3 bg-[#fffdf5]/95 backdrop-blur-md border border-amber-300 px-3 py-1.5 rounded-2xl shadow-md text-slate-800 flex flex-col items-center select-none shrink-0 min-w-[70px]">
                          <span className="text-[10px] font-bold text-orange-600 tracking-wider">
                            {info.day}
                          </span>
                          <span className="text-[9px] font-extrabold text-slate-700">
                            {info.date}
                          </span>
                        </div>

                        {/* Float Badge for Zoom/Expand on Top Right */}
                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md border border-white/20 p-2 rounded-full shadow-md text-white hover:scale-110 hover:bg-black/75 transition duration-300">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>

                        {/* Floating Like & Share Buttons */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                          <button
                            onClick={(e) => handleLike(item.id, e)}
                            className={`p-2.5 rounded-full backdrop-blur-md border shadow-md transition duration-300 ${
                              isLiked 
                                ? 'bg-rose-500 border-rose-600 text-white hover:bg-rose-600 scale-110' 
                                : 'bg-white/85 border-amber-200/50 text-rose-500 hover:bg-rose-50'
                            }`}
                            title={isLiked ? "पसंद किया गया" : "लाइक करें"}
                          >
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                          </button>

                          <button
                            onClick={(e) => handleShare(item, e)}
                            className="p-2.5 rounded-full bg-white/85 backdrop-blur-md border border-amber-200/50 text-orange-600 hover:bg-orange-50 shadow-md transition duration-300"
                            title="साझा करें"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Description Panel */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>दिव्य आरती वीडियो</span>
                          </div>
                          
                          <h3 className="text-md font-bold text-slate-800 mb-2 leading-snug line-clamp-2">
                            {item.title || "मंसा महादेव आरती वीडियो"}
                          </h3>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-4 shadow">
                  <Search className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-md font-bold text-slate-700">कोई आरती वीडियो नहीं मिला</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                  {searchDateQuery 
                    ? `${getHindiDayAndDate(searchDateQuery).date} (${getHindiDayAndDate(searchDateQuery).day}) का कोई आरती वीडियो उपलब्ध नहीं है।`
                    : "अभी तक कोई आरती वीडियो गैलरी में अपलोड नहीं किया गया है।"
                  }
                </p>
                
                {searchDateQuery && (
                  <button
                    onClick={handleResetSearch}
                    className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs shadow transition"
                  >
                    सभी आरती वीडियो देखें
                  </button>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-amber-50/50 border-t border-amber-200/30 text-center text-[10px] font-bold text-slate-400 shrink-0 flex items-center justify-center gap-1 select-none">
          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span>श्री मंसा महादेव मंदिर तितरड़ी, उदयपुर • दिव्य दर्शन सेवा</span>
        </div>
      </motion.div>

      {/* Fullscreen Video Player */}
      <AnimatePresence>
        {fullscreenVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-between p-4 md:p-6"
          >
            {/* Top Bar */}
            <div className="flex justify-between items-center text-white z-10">
              <div>
                <p className="text-xs text-amber-400 font-bold font-mono">
                  {formatDateDMY(fullscreenVideo.date)}
                </p>
                <h4 className="text-sm md:text-base font-bold truncate max-w-[280px] sm:max-w-md md:max-w-xl">
                  {fullscreenVideo.title}
                </h4>
              </div>

              <button
                onClick={() => setFullscreenVideo(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                title="बंद करें"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Centered Iframe Player Container */}
            <div className="flex-1 flex items-center justify-center py-4 w-full">
              <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                {getYouTubeId(fullscreenVideo.youtubeUrl) ? (
                  <iframe
                    title={fullscreenVideo.title}
                    src={`https://www.youtube.com/embed/${getYouTubeId(fullscreenVideo.youtubeUrl)}?autoplay=1&rel=0&modestbranding=1`}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    अमान्य यूट्यूब वीडियो
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls / Share */}
            <div className="flex flex-col items-center gap-3 pb-2">
              <button
                onClick={() => handleShare(fullscreenVideo)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold px-6 py-2.5 rounded-full transition duration-300 shadow-lg flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4 text-slate-900" />
                <span>व्हाट्सएप वीडियो शेयर करें</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
