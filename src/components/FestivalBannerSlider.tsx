import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, subscribeToDBUpdates } from '../lib/db';
import { FestivalBanner } from '../types';

const MOCK_BANNERS: FestivalBanner[] = [
  {
    id: "mock_banner_1",
    title: "सावन सोमवार विशेष उत्सव एवं महा रुद्राभिषेक",
    description: "पवित्र श्रावण मास के पावन अवसर पर बाबा मंसा महादेव का दिव्य फूलों, औषधियों एवं पंचामृत से भव्य महा रुद्राभिषेक, विशेष अलौकिक श्रृंगार एवं महाआरती दर्शन।",
    imageUrl: "https://images.unsplash.com/photo-1609137144814-7d526e959ec2?q=80&w=1200&auto=format&fit=crop",
    startDate: "2026-07-01",
    endDate: "2026-08-31",
    isEnabled: true,
    uploadedAt: new Date().toISOString()
  },
  {
    id: "mock_banner_2",
    title: "श्री गुरु पूर्णिमा महोत्सव",
    description: "आराध्य गुरुदेव के पावन सानिध्य में भव्य गुरु पूजन, सुमधुर भजन संध्या, मंगल आरती एवं विशाल भंडारा (महाप्रसाद) का आयोजन। सभी भक्त सादर आमंत्रित हैं।",
    imageUrl: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=1200&auto=format&fit=crop",
    startDate: "2026-07-01",
    endDate: "2026-07-10",
    isEnabled: true,
    uploadedAt: new Date().toISOString()
  },
  {
    id: "mock_banner_3",
    title: "हरियाली अमावस्या दिव्य झाँकी दर्शन",
    description: "प्राकृतिक छटा एवं मनमोहक हरियाली के बीच बाबा मंसा महादेव का नाग-देव स्वरूप में अलौकिक श्रृंगार दर्शन एवं छप्पन भोग का दिव्य आयोजन।",
    imageUrl: "https://images.unsplash.com/photo-1634547565985-78e718fe4f8b?q=80&w=1200&auto=format&fit=crop",
    startDate: "2026-07-01",
    endDate: "2026-07-20",
    isEnabled: true,
    uploadedAt: new Date().toISOString()
  }
];

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
    };
    updateBanners();
    return subscribeToDBUpdates(updateBanners);
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 9000); // Rotate every 9 seconds, resets automatically on manual navigation (index change)
    return () => clearInterval(interval);
  }, [currentIndex, banners.length]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
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
        <div className="relative h-44 sm:h-56 md:h-64 w-full overflow-hidden rounded-2xl bg-slate-900">
          
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
                className="w-full h-full object-cover"
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
                <div className="flex items-center gap-1.5 text-[11px] md:text-[13px] font-bold text-[#222222] tracking-wider mb-1 md:mb-1.5 uppercase">
                  <Sparkles className="w-3 h-3 text-[#222222] fill-[#222222]" />
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

                {/* Date Badge */}
                <div className="flex items-center gap-1.5 mt-2 md:mt-3 text-[9px] sm:text-[10px] font-bold bg-amber-500/20 border border-amber-400/30 px-2.5 py-1 rounded-full self-start text-amber-300">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span>
                    {currentBanner.startDate === currentBanner.endDate
                      ? formatDate(currentBanner.startDate)
                      : `${formatDate(currentBanner.startDate)} से ${formatDate(currentBanner.endDate)}`}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          {banners.length > 1 && (
            <>
              {/* Left Arrow */}
              <button
                onClick={handlePrev}
                className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 z-20 p-1 sm:p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white border border-white/10 backdrop-blur-xs transition"
                title="पिछला"
              >
                <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={handleNext}
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
                    onClick={() => {
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
    </section>
  );
}
