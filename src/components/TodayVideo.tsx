import { useState, useEffect } from 'react';
import { db, subscribeToDBUpdates, formatDateDMY } from '../lib/db';
import { VideoDarshan } from '../types';
import { Video, Youtube, Calendar, Sparkles, Plus, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AartiVideoPopup from './AartiVideoPopup';

export default function TodayVideo() {
  const [todayVideo, setTodayVideo] = useState<VideoDarshan | null>(null);
  const [isAdmin, setIsAdmin] = useState(db.isAdminLoggedIn());
  const [isEditing, setIsEditing] = useState(false);
  const [isAartiVideoOpen, setIsAartiVideoOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setTodayVideo(db.getTodayVideo());
    setIsAdmin(db.isAdminLoggedIn());

    const unsubscribe = subscribeToDBUpdates(() => {
      setTodayVideo(db.getTodayVideo());
      setIsAdmin(db.isAdminLoggedIn());
    });
    return unsubscribe;
  }, []);

  // Helper to extract YouTube Video ID from any URL
  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    // Check for shorts
    if (url.includes('/shorts/')) {
      const parts = url.split('/shorts/');
      if (parts[1]) {
        return parts[1].substring(0, 11);
      }
    }
    return null;
  };

  const handleSaveVideo = () => {
    if (!title.trim() || !youtubeUrl.trim()) {
      alert("कृपया वीडियो का शीर्षक और यूट्यूब लिंक दोनों भरें।");
      return;
    }

    const videoId = getYouTubeId(youtubeUrl);
    if (!videoId) {
      alert("अमान्य यूट्यूब लिंक! कृपया एक सही लिंक दर्ज करें (उदा. https://www.youtube.com/watch?v=FisXpL29-c8)");
      return;
    }

    db.addVideo({
      title: title.trim(),
      youtubeUrl: youtubeUrl.trim(),
      date,
      isToday: true // Sets this as the current today's video
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
      setTitle('');
      setYoutubeUrl('');
    }, 1500);
  };

  const activeVideoId = todayVideo ? getYouTubeId(todayVideo.youtubeUrl) : null;

  return (
    <section id="today-video" className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-3xl shadow-lg shadow-sky-100/30 p-4 mb-6 relative flex flex-wrap items-center justify-center gap-3">
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 flex items-center justify-center gap-2 flex-wrap w-full">
          <Youtube className="w-5 h-5 text-red-600 fill-red-100 shrink-0" />
          <button
            onClick={() => setIsAartiVideoOpen(true)}
            title="आरती वीडियो गैलरी देखने के लिए यहाँ क्लिक करें"
            className="inline-flex items-center gap-2 bg-[#fffdf5] hover:bg-amber-50/80 dark:bg-slate-800 border border-amber-300 dark:border-amber-500/50 hover:border-amber-400 text-slate-800 dark:text-slate-100 px-6 py-2.5 rounded-full shadow-sm hover:shadow-md text-md md:text-lg font-bold tracking-wide font-sans cursor-pointer transition duration-300 transform active:scale-95 group text-center"
          >
            <span>भोलेनाथ की आरती वीडियो</span>
          </button>
        </h2>
      </div>

      {/* Admin Panel video uploader */}
      <AnimatePresence>
        {isAdmin && isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-red-50/90 border border-red-200/50 p-4 rounded-3xl shadow-inner text-slate-800"
          >
            <h3 className="text-md font-bold text-red-800 mb-3 flex items-center gap-1.5">
              <Youtube className="w-4 h-4 text-red-600" />
              <span>नया वीडियो दर्शन अपलोड करें</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-red-900 mb-1">वीडियो शीर्षक (Title):</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="उदा. संध्या आरती एवं दीपमालिका दर्शन..."
                    className="w-full px-3 py-2 text-sm bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-red-900 mb-1">दिनांक (Date):</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 justify-between">
                {/* YouTube Link */}
                <div>
                  <label className="block text-xs font-bold text-red-900 mb-1">यूट्यूब लिंक (YouTube URL):</label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="उदा. https://www.youtube.com/watch?v=FisXpL29-c8"
                    className="w-full px-3 py-2 text-sm bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-xl text-xs transition"
                  >
                    रद्द करें
                  </button>
                  <button
                    onClick={handleSaveVideo}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow transition"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>सुरक्षित हो गया!</span>
                      </>
                    ) : (
                      <span>अपलोड करें</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AartiVideoPopup isOpen={isAartiVideoOpen} onClose={() => setIsAartiVideoOpen(false)} />
    </section>
  );
}
