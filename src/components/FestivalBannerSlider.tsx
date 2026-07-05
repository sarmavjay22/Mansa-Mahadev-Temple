import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Share2, X, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, subscribeToDBUpdates } from '../lib/db';
import { FestivalBanner } from '../types';

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthNum = parseInt(parts[1], 10);
  const day = parts[2].padStart(2, '0');
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[monthNum - 1] || 'Jan';
  
  return `${day} ${monthName} ${year}`;
};

export default function FestivalBannerSlider() {
  const [banners, setBanners] = useState<FestivalBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [selectedBanner, setSelectedBanner] = useState<FestivalBanner | null>(null);

  useEffect(() => {
    const updateBanners = () => {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      const allEnabledBanners = db.getFestivalBanners().filter(b => b.isEnabled);
      let activeBanners = allEnabledBanners.filter(b => {
        if (!b.startDate || !b.endDate) return true;
        return b.startDate <= todayStr && b.endDate >= todayStr;
      });

      // If at least one valid (enabled) festival banner exists, the Festival Banner Slider must always be displayed.
      if (activeBanners.length === 0 && allEnabledBanners.length > 0) {
        activeBanners = allEnabledBanners;
      }
      setBanners(activeBanners);

      // Support dynamic URL loading
      const params = new URLSearchParams(window.location.search);
      const eventId = params.get('event');
      if (eventId) {
        const found = allEnabledBanners.find(b => b.id === eventId);
        if (found) {
          setSelectedBanner(found);
        }
      }
    };
    updateBanners();
    return subscribeToDBUpdates(updateBanners);
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (banners.length <= 1 || selectedBanner) return;
    const interval = setInterval(() => {
      handleNext();
    }, 9000); // Rotate every 9 seconds
    return () => clearInterval(interval);
  }, [currentIndex, banners.length, selectedBanner]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  const handleWhatsAppShare = (banner: FestivalBanner) => {
    const dateText = banner.startDate === banner.endDate ? formatDate(banner.startDate) : `${formatDate(banner.startDate)} से ${formatDate(banner.endDate)}`;
    const timeText = banner.time ? `🕒 समय: ${banner.time}\n` : '';
    const locText = banner.location ? `📍 स्थान: ${banner.location}\n` : '';
    const noteText = banner.specialNote ? `📌 विशेष सूचना: ${banner.specialNote}\n` : '';
    
    const text = `🚩 *${banner.title}* 🚩\n\n${banner.description || ''}\n\n📅 तिथि: ${dateText}\n${timeText}${locText}${noteText}\n🙏 आप सभी सादर आमंत्रित हैं। हर हर महादेव!\n\nविवरण देखने एवं दर्शन के लिए मंदिर की वेबसाइट पर जाएं:\n${window.location.origin}?event=${banner.id}`;
    
    const encodedText = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex] || banners[0];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <section id="festival-banners-slider" className="w-full max-w-4xl mx-auto px-4 select-none relative z-10">
      {/* Container with gold traditional border glow */}
      <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-amber-200/50 rounded-3xl shadow-xl shadow-amber-100/20 p-2">
        <div 
          onClick={() => setSelectedBanner(currentBanner)}
          className="relative h-44 sm:h-56 md:h-64 w-full overflow-hidden rounded-2xl bg-slate-900 cursor-pointer group"
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentBanner.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Banner Image (not darkened) */}
              <img
                src={currentBanner.imageUrl}
                alt={currentBanner.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                referrerPolicy="no-referrer"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

              {/* Traditional Floral Corner Decors */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-400/60 rounded-tl-lg pointer-events-none" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-400/60 rounded-tr-lg pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-400/60 rounded-bl-lg pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-400/60 rounded-br-lg pointer-events-none" />

              {/* Banner Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 pl-[40px] md:p-8 md:pl-[52px] text-white">
                <div className="flex items-center gap-1.5 text-[11px] md:text-[13px] font-bold text-amber-300 tracking-wider mb-1 md:mb-1.5 uppercase">
                  <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
                  <span>पर्व एवं विशेष उत्सव</span>
                </div>

                <h3 className="text-base sm:text-lg md:text-2xl font-black text-amber-100 tracking-wide drop-shadow-md">
                  {currentBanner.title}
                </h3>

                {currentBanner.description && (
                  <p className="text-[13px] sm:text-sm md:text-base text-white mt-1 line-clamp-2 font-bold max-w-2xl drop-shadow-md leading-relaxed">
                    {currentBanner.description}
                  </p>
                )}

                {/* Badge & CTA Button Row */}
                <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-3">
                  {/* Date Badge */}
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold bg-amber-500/20 border border-amber-400/30 px-2.5 py-1 rounded-full text-amber-300">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span>
                      {currentBanner.startDate === currentBanner.endDate
                        ? formatDate(currentBanner.startDate)
                        : `${formatDate(currentBanner.startDate)} से ${formatDate(currentBanner.endDate)}`}
                    </span>
                  </div>

                  {/* Premium CTA Info Button */}
                  <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black bg-white text-orange-600 border border-amber-400 px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.4)] hover:bg-orange-50 active:scale-95 transition-all duration-300 shrink-0 select-none animate-pulse">
                    <span>ℹ️</span>
                    <span className="hidden sm:inline">पूरी जानकारी</span>
                    <span className="sm:hidden">विवरण</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          {banners.length > 1 && (
            <>
              {/* Left Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 z-20 p-1 sm:p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white border border-white/10 backdrop-blur-xs transition"
                title="पिछला"
              >
                <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 z-20 p-1 sm:p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white border border-white/10 backdrop-blur-xs transition"
                title="अगला"
              >
                <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-3 right-6 z-10 flex gap-1.5">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDirection(idx > currentIndex ? 1 : -1);
                      setCurrentIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Premium Full-Screen Event Details Popup */}
      <AnimatePresence>
        {selectedBanner && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg bg-white border border-amber-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]"
            >
              {/* Header Banner Image */}
              <div className="relative h-44 sm:h-52 w-full bg-slate-900 shrink-0">
                <img 
                  src={selectedBanner.imageUrl} 
                  alt={selectedBanner.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />
                
                {/* Close Button top right */}
                <button
                  onClick={() => setSelectedBanner(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition"
                  title="बंद करें"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Decorative Traditional Border bottom inside Image */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
              </div>

              {/* Scrollable Event Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-4 text-slate-700">
                
                {/* Event Name */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full mb-1 border border-amber-100 select-none">
                    <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>उत्सव आमंत्रण • Festival Invitation</span>
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-wide leading-tight">
                    {selectedBanner.title}
                  </h2>
                </div>

                {/* Date, Time, Location Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 select-none">
                  {/* Date Card */}
                  <div className="bg-amber-50/40 border border-amber-200/50 p-2.5 rounded-2xl flex flex-col items-center justify-center text-center">
                    <Calendar className="w-4 h-4 text-orange-500 mb-1" />
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">दिनांक / Date</span>
                    <span className="text-[11px] sm:text-xs font-black text-slate-800 mt-0.5">
                      {selectedBanner.startDate === selectedBanner.endDate
                        ? formatDate(selectedBanner.startDate)
                        : `${formatDate(selectedBanner.startDate)} से ${formatDate(selectedBanner.endDate)}`}
                    </span>
                  </div>

                  {/* Time Card */}
                  <div className="bg-amber-50/40 border border-amber-200/50 p-2.5 rounded-2xl flex flex-col items-center justify-center text-center">
                    <Clock className="w-4 h-4 text-orange-500 mb-1" />
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">समय / Time</span>
                    <span className="text-[11px] sm:text-xs font-black text-slate-800 mt-0.5">
                      {selectedBanner.time || 'प्रातः आरती से'}
                    </span>
                  </div>

                  {/* Location Card */}
                  <div className="bg-amber-50/40 border border-amber-200/50 p-2.5 rounded-2xl flex flex-col items-center justify-center text-center">
                    <MapPin className="w-4 h-4 text-orange-500 mb-1" />
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">स्थान / Location</span>
                    <span className="text-[11px] sm:text-xs font-black text-slate-800 mt-0.5 truncate max-w-full">
                      {selectedBanner.location || 'मंदिर परिसर'}
                    </span>
                  </div>
                </div>

                {/* Description Text */}
                {selectedBanner.description && (
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 select-none">उत्सव विवरण / Description:</span>
                    {selectedBanner.description}
                  </div>
                )}

                {/* Special Note Box (Optional) */}
                {selectedBanner.specialNote && (
                  <div className="bg-amber-50/30 border border-dashed border-amber-300 p-3.5 rounded-2xl flex items-start gap-2.5">
                    <span className="text-base select-none shrink-0 mt-0.5">📌</span>
                    <div>
                      <span className="block text-[9px] font-bold text-amber-700 uppercase tracking-wider mb-0.5 select-none">विशेष सूचना / Special Note:</span>
                      <p className="text-xs font-bold text-amber-900 leading-relaxed">{selectedBanner.specialNote}</p>
                    </div>
                  </div>
                )}

                {/* Traditional Invitation Text */}
                <div className="text-center py-2 select-none border-t border-slate-100 mt-1">
                  <p className="font-extrabold text-sm text-orange-600 tracking-wider">
                    🙏 आप सभी धर्मप्रेमी बंधु सादर आमंत्रित हैं। 🙏
                  </p>
                  <p className="font-black text-xs text-amber-600 tracking-widest mt-1">
                    ॥ हर हर महादेव ॥
                  </p>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0 flex gap-3 select-none">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedBanner(null)}
                  className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-extrabold rounded-xl shadow-sm transition duration-300"
                >
                  बंद करें
                </button>

                {/* WhatsApp Share Button */}
                <button
                  onClick={() => handleWhatsAppShare(selectedBanner)}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-md transition duration-300 hover:scale-[1.01] active:scale-99 flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp पर साझा करें</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
