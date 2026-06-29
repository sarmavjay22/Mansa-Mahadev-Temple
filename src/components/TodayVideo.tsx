import { useState, useEffect } from 'react';
import { db, subscribeToDBUpdates, formatDateDMY } from '../lib/db';
import { VideoDarshan } from '../types';
import { Video, Youtube, Calendar, Sparkles, Plus, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TodayVideo() {
  const [todayVideo, setTodayVideo] = useState<VideoDarshan | null>(null);
  const [isAdmin, setIsAdmin] = useState(db.isAdminLoggedIn());
  const [isEditing, setIsEditing] = useState(false);

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
          <span className="inline-block bg-[#fffdf5] dark:bg-slate-800 border border-amber-300 dark:border-amber-500/50 text-slate-800 dark:text-slate-100 px-6 py-2.5 rounded-full shadow-sm text-lg md:text-xl font-bold tracking-wide font-sans text-center">
            भोलेनाथ की आरती वीडियो
          </span>
        </h2>

        {isAdmin && !isEditing && (
          <div className="md:absolute md:right-4">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-xl transition duration-300 shadow shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>वीडियो जोड़ें</span>
            </button>
          </div>
        )}
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

      {/* Main Video View Box */}
      <div className="w-full bg-white/70 backdrop-blur-md border border-white/50 rounded-3xl shadow-xl shadow-sky-100/40 overflow-hidden p-4 md:p-6">
        {activeVideoId ? (
          <div className="flex flex-col gap-4">
            {/* Aspect ratio frame */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-slate-900">
              <iframe
                title={todayVideo?.title || "Mansa Mahadev Video"}
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=0&rel=0&modestbranding=1`}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>

            {/* Video Metadata */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1">
              <div>
                <h3 className="text-md md:text-lg font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                  <span>{todayVideo?.title}</span>
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  <span>अपलोड तिथि:</span>
                  <span className="font-mono text-slate-700">
                    {todayVideo ? formatDateDMY(todayVideo.date) : ''}
                  </span>
                </p>
              </div>

              {/* Share details badge */}
              <div className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-xl self-start md:self-center">
                🚩 दैनिक सत्संग एवं आरती वीडियो
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Video className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-md font-bold text-slate-700">कोई सक्रिय वीडियो उपलब्ध नहीं है।</h3>
            <p className="text-xs text-slate-400 mt-1">प्रबंधक द्वारा जल्द ही आज की दिव्य आरती या झांकी का वीडियो अपलोड किया जाएगा।</p>
          </div>
        )}
      </div>
    </section>
  );
}
