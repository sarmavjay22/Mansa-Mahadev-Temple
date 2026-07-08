import { useState, useEffect } from 'react';
import { db, subscribeToDBUpdates } from '../lib/db';
import { LogIn, LogOut, ShieldCheck, Database, Calendar, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { subscribeToTempleSettings, getCachedTempleSettings } from '../lib/settings';
import { TempleSettings } from '../types';

interface HeaderProps {
  onOpenAdmin: () => void;
}

export default function Header({ onOpenAdmin }: HeaderProps) {
  const [isAdmin, setIsAdmin] = useState(db.isAdminLoggedIn());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settings, setSettings] = useState<TempleSettings>(getCachedTempleSettings());
  const [latestShringar, setLatestShringar] = useState(db.getLatestShringar());

  useEffect(() => {
    const unsubscribe = subscribeToDBUpdates(() => {
      setIsAdmin(db.isAdminLoggedIn());
      setLatestShringar(db.getLatestShringar());
    });
    
    const unsubSettings = subscribeToTempleSettings((fetched) => {
      setSettings(fetched);
    });

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      unsubscribe();
      unsubSettings();
      clearInterval(timer);
    };
  }, []);

  const handleLogout = () => {
    db.logoutAdmin();
  };

  const formattedDate = currentTime.toLocaleDateString('hi-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('hi-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <header 
      className="relative w-full overflow-hidden pt-2 pb-3 px-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(227, 242, 253, 0.92), rgba(247, 249, 252, 0.96)), url(${latestShringar?.imageUrl || "/src/assets/images/today_shringar_1782657607504.jpg"})`
      }}
    >
      {/* Decorative Traditional Border Arch */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400"></div>

      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Top Admin Button Row - Right Aligned for Clean Margins */}
        <div className="w-full flex justify-end items-center mb-0 text-xs font-medium px-2">
          {/* Admin Control */}
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-3 py-1.5 rounded-full transition-all duration-300 shadow-md hover:shadow-rose-500/20 active:scale-95 text-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-black font-bold text-xs px-3 py-1.5 rounded-full transition-all duration-300 shadow-md hover:shadow-slate-200 active:scale-95 border border-slate-300 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-black" />
              <span>प्रबंधक लॉगिन</span>
            </button>
          )}
        </div>

        {/* Temple Brand Logo & Typography */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          {/* Circular Glassmorphic Logo Frame */}
          <div className="relative group mb-0.5">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full p-1 bg-white/90 backdrop-blur shadow-lg border-2 border-amber-300/60 overflow-hidden flex items-center justify-center">
              <img
                src={settings.templeLogoUrl || settings.templeLogo || "/src/assets/images/temple_logo_1782657591698.jpg"}
                alt={`${settings.templeNameHindi || "मंसा महादेव मंदिर"} - मंदिर लोगो`}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
                loading="eager"
              />
            </div>
            {/* Spiritual Aura Ripple */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[10px] text-white flex items-center justify-center font-bold">ॐ</span>
            </span>
          </div>

          {/* Hindi Name */}
          <h1 className="text-[19px] md:text-[29px] font-extrabold text-red-600 tracking-wide font-sans drop-shadow-sm select-none">
            {settings.templeNameHindi || "मंसा महादेव मंदिर"}
          </h1>

          {/* Location details */}
          <p className="flex items-center gap-1 mt-0 text-[10px] md:text-[12px] text-slate-600 font-semibold">
            <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
            <span>
              {settings.village === "उपला फलां" && settings.city === "उदयपुर"
                ? "उपला फलां, तितरडी, उदयपुर, 313002   (राज.)"
                : settings.village && settings.city 
                  ? `${settings.village}, ${settings.city} (${settings.state})` 
                  : "उपला फलां, तितरडी, उदयपुर, 313002   (राज.)"}
            </span>
          </p>

          {/* Subtitle in english */}
          <p className="text-[8px] md:text-[10px] font-extrabold text-amber-600 tracking-widest mt-0.5 uppercase">
            {(settings.templeNameEnglish || "MANSA MAHADEV TEMPLE").toUpperCase()}
          </p>
        </motion.div>

        {/* Floating Date-Time Glassmorphic Bar */}
        <div className="mt-3.5 inline-flex items-center gap-2.5 bg-white/60 backdrop-blur-md border border-white/50 px-3 py-1.5 rounded-2xl shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs font-semibold text-slate-700">
            {formattedDate}
          </span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span className="text-xs font-mono font-bold text-amber-700">
            {formattedTime}
          </span>
        </div>
      </div>
    </header>
  );
}
