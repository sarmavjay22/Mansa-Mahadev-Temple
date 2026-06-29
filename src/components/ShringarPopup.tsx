import { useState, useEffect, MouseEvent } from 'react';
import { db, subscribeToDBUpdates } from '../lib/db';
import { GalleryItem } from '../types';
import { 
  X, 
  Calendar, 
  Search, 
  Share2, 
  Sparkles, 
  Heart,
  Smile,
  RefreshCw,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShringarPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function getHindiDayAndDate(dateStr: string): { day: string; date: string } {
  if (!dateStr) return { day: '', date: '' };
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0].substring(2);
      const month = parts[1];
      const day = parts[2];
      
      const d = new Date(dateStr);
      const days = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
      const hindiDay = isNaN(d.getTime()) ? "" : days[d.getDay()];
      
      return {
        day: hindiDay,
        date: `${day}/${month}/${year}`
      };
    }
    
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { day: '', date: dateStr };
    
    const days = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
    const hindiDay = days[d.getDay()];

    const dayNum = String(d.getDate()).padStart(2, '0');
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    const yearNum = String(d.getFullYear()).substring(2);

    return {
      day: hindiDay,
      date: `${dayNum}/${monthNum}/${yearNum}`
    };
  } catch (e) {
    return { day: '', date: dateStr };
  }
}

export default function ShringarPopup({ isOpen, onClose }: ShringarPopupProps) {
  const [shringars, setShringars] = useState<GalleryItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchDateQuery, setSearchDateQuery] = useState<string>('');
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});

  const loadShringars = () => {
    const galleryItems = db.getGallery();
    const todayItem = db.getDailyDarshan();
    const combined: GalleryItem[] = [];

    let todayToPush: GalleryItem | null = null;
    if (todayItem && todayItem.imageUrl) {
      todayToPush = {
        id: todayItem.id || "today",
        imageUrl: todayItem.imageUrl,
        date: todayItem.date,
        festivalName: todayItem.festivalName || "दैनिक श्रृंगार दर्शन",
        description: todayItem.description || "मंसा महादेव का आज का अलौकिक श्रृंगार दर्शन।",
        uploadedAt: todayItem.uploadedAt
      };
    }

    const matchingGalItem = galleryItems.find(item => item.date === todayItem?.date);
    if (matchingGalItem && todayToPush) {
      todayToPush.festivalName = matchingGalItem.festivalName || todayToPush.festivalName;
      todayToPush.description = matchingGalItem.description || todayToPush.description;
      todayToPush.imageUrl = matchingGalItem.imageUrl || todayToPush.imageUrl;
    }

    if (todayToPush) {
      combined.push(todayToPush);
    }

    galleryItems.forEach(item => {
      if (item.id !== "today" && item.date !== todayItem?.date) {
        combined.push(item);
      }
    });

    setShringars(combined);
  };

  useEffect(() => {
    loadShringars();

    const unsubscribe = subscribeToDBUpdates(() => {
      loadShringars();
    });

    // Load likes from localStorage
    const savedLikes = localStorage.getItem('mm_shringar_likes');
    if (savedLikes) {
      try {
        setLikedItems(JSON.parse(savedLikes));
      } catch (e) {
        console.error(e);
      }
    }

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadShringars();
    }
  }, [isOpen]);

  const handleLike = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const newLikes = { ...likedItems, [id]: !likedItems[id] };
    setLikedItems(newLikes);
    localStorage.setItem('mm_shringar_likes', JSON.stringify(newLikes));
  };

  const handleShare = async (item: GalleryItem, e: MouseEvent) => {
    e.stopPropagation();
    const info = getHindiDayAndDate(item.date);
    const shareText = `ॐ नमः शिवाय! मंसा महादेव मंदिर तितरड़ी, उदयपुर का दिव्य श्रृंगार दर्शन:\nपर्व: ${item.festivalName || 'दैनिक श्रृंगार'}\nदिन: ${info.day}, तिथि: ${info.date}\n\nदर्शन के लिए यहाँ देखें: ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'मंसा महादेव मंदिर दर्शन',
          text: shareText,
          url: window.location.origin,
        });
      } catch (error) {
        console.log("Sharing failed", error);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("दर्शन संदेश और लिंक क्लिपबोर्ड पर कॉपी हो गया है! आप इसे व्हाट्सएप पर शेयर कर सकते हैं।");
    }
  };

  const handleSearchClick = () => {
    setSearchDateQuery(selectedDate);
  };

  const handleResetSearch = () => {
    setSelectedDate('');
    setSearchDateQuery('');
  };

  // Filter shringars based on searched date
  const displayedShringars = shringars.filter(item => {
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
          <div className="h-2 w-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 shrink-0"></div>

          {/* Modal Header */}
          <div className="p-5 border-b border-amber-200/40 bg-gradient-to-r from-amber-500/5 to-amber-600/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl text-white shadow-md shadow-orange-500/10">
                <Sparkles className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-extrabold tracking-wide text-slate-800 flex items-center gap-2">
                  भोलेनाथ के विगत श्रृंगार दर्शन
                </h2>
                <p className="text-[10px] md:text-xs text-amber-700 font-bold">
                  मंसा महादेव मंदिर उदयपुर के दिव्य एवं अलौकिक रूपों की संग्रह गैलरी
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
            <div className="flex items-center gap-2 text-xs text-amber-800 font-bold shrink-0">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>तिथि अनुसार दर्शन खोजें:</span>
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

          {/* Modal Scroll Content (Images list) */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6">
            <AnimatePresence mode="popLayout">
              {displayedShringars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayedShringars.map((item, idx) => {
                    const info = getHindiDayAndDate(item.date);
                    const isLiked = likedItems[item.id] || false;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white border border-amber-200/30 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
                      >
                        {/* Image Frame with zoom hover */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.festivalName || "श्रृंगार दर्शन"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 referrer-policy='no-referrer'"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition duration-300"></div>

                          {/* Float Badge for Date & Day */}
                          <div className="absolute top-3 left-3 bg-[#fffdf5]/95 backdrop-blur-md border border-amber-300 px-3 py-1.5 rounded-2xl shadow-md text-slate-800 flex flex-col items-center select-none shrink-0 min-w-[70px]">
                            <span className="text-[10px] font-bold text-orange-600 tracking-wider">
                              {info.day}
                            </span>
                            <span className="text-[9px] font-extrabold text-slate-700">
                              {info.date}
                            </span>
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
                              <span>{item.festivalName || "दिव्य श्रृंगार दर्शन"}</span>
                            </div>
                            
                            <h3 className="text-md font-bold text-slate-800 mb-2 leading-snug">
                              {item.festivalName || "मंसा महादेव अलौकिक श्रृंगार"}
                            </h3>

                            <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">
                              {item.description || "मंसा महादेव का आज का अति मनोहारी एवं मनवांछित फलदायक दिव्य श्रृंगार दर्शन। नमन करें और पुण्य लाभ कमाएं।"}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>प्रातः श्रृंगार</span>
                            </span>
                            <span>#मंसा_महादेव</span>
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
                  <h3 className="text-md font-bold text-slate-700">कोई श्रृंगार दर्शन नहीं मिला</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                    {searchDateQuery 
                      ? `${getHindiDayAndDate(searchDateQuery).date} (${getHindiDayAndDate(searchDateQuery).day}) का कोई श्रृंगार चित्र उपलब्ध नहीं है।`
                      : "अभी तक कोई दिव्य श्रृंगार दर्शन गैलरी में अपलोड नहीं किया गया है।"
                    }
                  </p>
                  
                  {searchDateQuery && (
                    <button
                      onClick={handleResetSearch}
                      className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs shadow transition"
                    >
                      सभी श्रृंगार चित्र देखें
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
    </div>
  );
}
