import { useState, useEffect } from 'react';
import { db, subscribeToDBUpdates } from '../lib/db';
import { NotificationItem } from '../types';
import { Bell, ChevronRight, X, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NotificationBanner() {
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setNotifs(db.getNotifications());

    const unsubscribe = subscribeToDBUpdates(() => {
      setNotifs(db.getNotifications());
    });
    return unsubscribe;
  }, []);

  // Auto-rotate notices every 7 seconds
  useEffect(() => {
    if (notifs.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % notifs.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [notifs]);

  if (isDismissed || notifs.length === 0) return null;

  const currentNotif = notifs[currentIndex];

  return (
    <AnimatePresence mode="wait">
      {currentNotif && (
        <motion.div
          key={currentNotif.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`w-full max-w-4xl mx-auto px-4 py-1.5`}
        >
          {/* Glassmorphic notices bar */}
          <div className={`relative overflow-hidden flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border backdrop-blur-md shadow-sm transition ${
            currentNotif.type === 'alert' 
              ? 'bg-rose-50/95 border-rose-200/60 text-rose-800' 
              : 'bg-amber-50/95 border-amber-200/50 text-slate-700'
          }`}>
            
            {/* Saffron side trim glow */}
            <div className={`absolute top-0 bottom-0 left-0 w-1 ${
              currentNotif.type === 'alert' ? 'bg-rose-500' : 'bg-amber-500'
            }`}></div>

            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Animated bell or alert icon */}
              <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                {currentNotif.type === 'alert' ? (
                  <AlertCircle className="w-4 h-4 text-rose-500 animate-bounce" />
                ) : (
                  <>
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75"></span>
                    <Bell className="relative w-4 h-4 text-amber-500 animate-swing" />
                  </>
                )}
              </span>

              {/* Title and message */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs font-semibold leading-normal min-w-0 flex-1">
                <span className={`font-extrabold truncate uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-md ${
                  currentNotif.type === 'alert' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {currentNotif.type === 'festival' ? '🚩 पर्व विशेष' : currentNotif.type === 'alert' ? '🚨 ध्यान दें' : '📢 घोषणा'}
                </span>
                
                <span className="text-slate-800 font-bold truncate max-w-[150px] md:max-w-[200px]">
                  {currentNotif.title}:
                </span>

                <p className="text-slate-600 truncate font-medium flex-1">
                  {currentNotif.message}
                </p>
              </div>
            </div>

            {/* Pagination details & close trigger */}
            <div className="flex items-center gap-2 shrink-0 pl-1 text-slate-400">
              {notifs.length > 1 && (
                <span className="text-[9px] font-mono font-bold text-slate-400">
                  {currentIndex + 1}/{notifs.length}
                </span>
              )}

              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 rounded-full hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition"
                title="हटाएं"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
