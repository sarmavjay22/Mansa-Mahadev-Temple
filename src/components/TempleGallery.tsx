import { useState, useEffect, useRef, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { db, subscribeToDBUpdates } from '../lib/db';
import { TempleGalleryItem } from '../types';
import { 
  X, 
  Calendar, 
  Sparkles, 
  Maximize2, 
  Image as ImageIcon,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TempleGallery() {
  const [items, setItems] = useState<TempleGalleryItem[]>([]);
  
  // Modals state
  const [isOpen, setIsOpen] = useState(false); // Main popup
  const [selectedCategory, setSelectedCategory] = useState<'mandir_parisar' | 'utsav' | 'bhaktimay' | null>(null); // Sub popup
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null); // Fullscreen lightbox
  
  // Zoom & Pan for Lightbox
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const touchStartRef = useRef<{ dist: number; x: number; y: number } | null>(null);

  useEffect(() => {
    // Initial fetch
    setItems(db.getTempleGallery());

    // Live subscription to updates
    const unsubscribe = subscribeToDBUpdates(() => {
      setItems(db.getTempleGallery());
    });

    return unsubscribe;
  }, []);

  // Filter active images
  const activeItems = items.filter(item => item.isActive);

  // Latest 3 preview images
  const previewImages = activeItems.slice(0, 3);

  // Filter items in the current active category
  const filteredItems = selectedCategory 
    ? activeItems.filter(item => item.category === selectedCategory)
    : [];

  // Helper to format Hindi date
  const formatGalleryDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      const months = [
        'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 
        'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
      ];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return dateStr;
    }
  };

  // Image downloader helper
  const handleDownloadImage = async (url: string, caption?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${caption || 'mansa-mahadev-darshan'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseLightbox();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'ArrowLeft') handlePrevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, selectedCategory, items]);

  const handlePrevImage = () => {
    if (lightboxIndex === null || filteredItems.length <= 1) return;
    setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + filteredItems.length) % filteredItems.length));
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleNextImage = () => {
    if (lightboxIndex === null || filteredItems.length <= 1) return;
    setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % filteredItems.length));
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleCloseLightbox = () => {
    setLightboxIndex(null);
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Zoom Handlers
  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => {
    setZoomScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };
  const handleResetZoom = () => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Mouse drag handlers
  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isDragging || zoomScale <= 1) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch handlers
  const handleTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - panPosition.x, y: touch.clientY - panPosition.y });
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartRef.current = { 
        dist, 
        x: (t1.clientX + t2.clientX) / 2, 
        y: (t1.clientY + t2.clientY) / 2 
      };
    }
  };

  const handleTouchMove = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isDragging && zoomScale > 1) {
      const touch = e.touches[0];
      setPanPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    } else if (e.touches.length === 2 && touchStartRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      
      const factor = dist / touchStartRef.current.dist;
      setZoomScale(prev => {
        const target = Math.min(Math.max(prev * (factor > 1 ? 1.03 : 0.97), 1), 4);
        if (target === 1) setPanPosition({ x: 0, y: 0 });
        return target;
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartRef.current = null;
  };

  const handleShare = async (item: TempleGalleryItem) => {
    const shareText = `ॐ नमः शिवाय! मंसा महादेव मंदिर तितरड़ी, उदयपुर मँदिर दर्शन दीर्घा:\n\nदर्शन के लिए यहाँ देखें: ${window.location.origin}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'मंसा महादेव मंदिर दर्शन दीर्घा',
          text: shareText,
          url: window.location.origin,
        });
      } catch (error) {
        console.log("Sharing failed", error);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("दर्शन लिंक क्लिपबोर्ड पर कॉपी हो गया है! आप इसे व्हाट्सएप पर शेयर कर सकते हैं।");
    }
  };

  // Cover image helpers for the categories menu
  const getCategoryCover = (cat: 'mandir_parisar' | 'utsav' | 'bhaktimay') => {
    const catItems = activeItems.filter(item => item.category === cat);
    return catItems.length > 0 ? catItems[0].imageUrl : null;
  };

  if (activeItems.length === 0) {
    return null;
  }

  return (
    <section id="temple-gallery-section" className="w-full max-w-4xl mx-auto px-4">
      {/* "भोलेनाथ के श्रृंगार दर्शन" style Accent Card */}
      <div 
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-br from-amber-50 to-orange-50/90 border-2 border-amber-200 rounded-3xl shadow-xl shadow-amber-100/40 p-8 flex flex-col items-center justify-center gap-4 text-center cursor-pointer select-none transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
      >
        <h2 className="text-2xl md:text-3xl font-black text-amber-950 flex flex-col items-center justify-center gap-3 flex-wrap w-full">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-amber-500 fill-amber-500 animate-pulse shrink-0" />
            <span>मँदिर दर्शन दीर्घा</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            title="मँदिर दर्शन दीर्घा (गैलरी) देखने के लिए यहाँ क्लिक करें"
            className="inline-flex items-center gap-2 bg-white hover:bg-amber-100 border-2 border-amber-300 hover:border-amber-400 text-amber-950 px-8 py-3.5 rounded-full shadow-md hover:shadow-lg text-lg md:text-xl font-black tracking-wider cursor-pointer transition duration-300 transform hover:scale-105 active:scale-95 group"
          >
            <span>📸 मँदिर दर्शन दीर्घा (गैलरी) देखें</span>
          </button>
        </h2>

        <p className="text-base md:text-lg text-amber-950 font-black mt-2 text-center max-w-lg px-4 leading-relaxed">
          मँदिर परिसर, उत्सवों एवं सुंदर भक्तिमय क्षणों की अलौकिक सुंदर छवियों का संग्रह
        </p>
      </div>

      {/* Main Gallery Popup Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none cursor-pointer"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fffdf9] rounded-3xl w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-hidden shadow-2xl flex flex-col border border-amber-100 cursor-default"
            >
              {/* Header */}
              <div className="p-5 border-b border-amber-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h2 className="text-lg md:text-xl font-black text-slate-800">📸 मँदिर दर्शन दीर्घा (गैलरी)</h2>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-full bg-white border border-amber-200/50 flex items-center justify-center hover:bg-amber-100 text-slate-500 transition duration-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Popup Content: 3 Big Options */}
              <div className="p-6 flex flex-col gap-4 flex-1 overflow-y-auto">
                <p className="text-sm text-amber-800 font-bold text-center mb-1">
                  मंसा महादेव मंदिर दर्शन दीर्घा की पावन श्रेणियां:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category 1: मँदिर एवं परिसर */}
                  <motion.button
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory('mandir_parisar')}
                    className="flex flex-col items-center bg-white border border-amber-200/60 p-5 rounded-2xl shadow-sm text-center transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200/60 mb-3 flex items-center justify-center shadow-inner">
                      <span className="text-3xl">🛕</span>
                    </div>
                    <span className="font-extrabold text-slate-800 text-sm">मँदिर एवं परिसर</span>
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold mt-2">
                      {activeItems.filter(item => item.category === 'mandir_parisar').length} चित्र
                    </span>
                  </motion.button>

                  {/* Category 2: उत्सव */}
                  <motion.button
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory('utsav')}
                    className="flex flex-col items-center bg-white border border-amber-200/60 p-5 rounded-2xl shadow-sm text-center transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200/60 mb-3 flex items-center justify-center shadow-inner">
                      <span className="text-3xl">🎉</span>
                    </div>
                    <span className="font-extrabold text-slate-800 text-sm">उत्सव</span>
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold mt-2">
                      {activeItems.filter(item => item.category === 'utsav').length} चित्र
                    </span>
                  </motion.button>

                  {/* Category 3: भक्तिमय क्षण */}
                  <motion.button
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory('bhaktimay')}
                    className="flex flex-col items-center bg-white border border-amber-200/60 p-5 rounded-2xl shadow-sm text-center transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-200/60 mb-3 flex items-center justify-center shadow-inner">
                      <span className="text-3xl">🙏</span>
                    </div>
                    <span className="font-extrabold text-slate-800 text-sm">भक्तिमय क्षण</span>
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold mt-2">
                      {activeItems.filter(item => item.category === 'bhaktimay').length} चित्र
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-amber-50/50 border-t border-amber-100 text-center flex justify-center shrink-0">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 rounded-xl bg-amber-600 text-[#fffdf5] font-bold text-xs hover:bg-amber-700 transition duration-200 cursor-pointer"
                >
                  बंद करें
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nested Category Photos View / Sub Popup */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCategory(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none cursor-pointer"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fffdf9] rounded-3xl w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-hidden shadow-2xl flex flex-col border border-amber-100 cursor-default"
            >
              {/* Header with Back button */}
              <div className="p-5 border-b border-amber-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="p-1.5 rounded-lg bg-white border border-amber-200 text-amber-800 hover:bg-amber-50 transition cursor-pointer"
                    title="श्रेणी मेनू पर वापस जाएं"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-md md:text-lg font-black text-slate-800">
                      {selectedCategory === 'mandir_parisar' ? '🛕 मँदिर एवं परिसर' : selectedCategory === 'utsav' ? '🎉 उत्सव' : '🙏 भक्तिमय क्षण'}
                    </h2>
                    <p className="text-[11px] text-slate-500 font-bold">मनमोहक झांकियों की सुंदर सूची</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedCategory(null); setIsOpen(false); }}
                  className="w-9 h-9 rounded-full bg-white border border-amber-200/50 flex items-center justify-center hover:bg-amber-100 text-slate-500 transition duration-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Photo Grid container */}
              <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-amber-50/20">
                {filteredItems.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25 }}
                        whileHover={{ y: -3 }}
                        onClick={() => setLightboxIndex(index)}
                        className="group relative bg-white border border-amber-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition duration-300 aspect-square"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.caption || 'मंसा महादेव मंदिर तितरड़ी उदयपुर गैलरी चित्र'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 pointer-events-none"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-3 pointer-events-none">
                          {item.caption && (
                            <p className="text-xs text-white font-bold line-clamp-2 leading-snug">
                              {item.caption}
                            </p>
                          )}
                          <span className="text-[10px] text-amber-200 mt-1 flex items-center gap-1 font-semibold">
                            <Calendar className="w-3 h-3 shrink-0" />
                            {formatGalleryDate(item.uploadDate)}
                          </span>
                        </div>
                        {/* Expand Icon */}
                        <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md text-white p-1.5 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center flex flex-col items-center justify-center bg-white/50 rounded-2xl border border-amber-100/50 p-6">
                    <ImageIcon className="w-12 h-12 text-amber-300/80 mb-3" />
                    <p className="text-slate-600 font-bold text-sm">इस श्रेणी में अभी कोई तस्वीर उपलब्ध नहीं है।</p>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs transition shadow-sm cursor-pointer"
                    >
                      अन्य श्रेणी चुनें
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-amber-100 bg-amber-50/40 flex items-center justify-between gap-3 shrink-0">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-5 py-2 rounded-xl border border-amber-200 bg-white text-amber-800 font-bold text-xs hover:bg-amber-50 transition cursor-pointer"
                >
                  श्रेणी मेनू
                </button>
                <button
                  onClick={() => { setSelectedCategory(null); setIsOpen(false); }}
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition cursor-pointer"
                >
                  बंद करें
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Fullscreen Lightbox Overlay */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredItems[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4 select-none cursor-pointer"
          >
            {/* Top Back Action Bar */}
            <div className="absolute top-4 left-4 z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-full backdrop-blur-md transition duration-200 text-sm font-semibold border border-white/10 shadow-lg cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>वापस जाएँ</span>
              </button>
            </div>

            {/* Immersive Image Display Container */}
            <div className="relative flex flex-col items-center justify-center max-w-4xl w-full h-full pointer-events-none">
              <motion.img
                key={filteredItems[lightboxIndex].id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                src={filteredItems[lightboxIndex].imageUrl}
                alt={filteredItems[lightboxIndex].caption || 'महादेव दर्शन'}
                referrerPolicy="no-referrer"
                className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-none"
              />
              {filteredItems[lightboxIndex].caption && (
                <p className="mt-6 text-sm md:text-base font-bold text-slate-200 text-center max-w-2xl px-6 leading-relaxed bg-black/40 py-2 px-4 rounded-xl backdrop-blur-sm pointer-events-none">
                  {filteredItems[lightboxIndex].caption}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
