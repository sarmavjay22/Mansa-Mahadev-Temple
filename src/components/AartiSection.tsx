import { useState, useEffect } from 'react';
import { db, subscribeToDBUpdates } from '../lib/db';
import { AartiItem } from '../types';
import { 
  BookOpen, 
  Search, 
  Sun, 
  Moon, 
  Type, 
  Plus, 
  Minus, 
  Copy, 
  Share2, 
  X, 
  Check, 
  Sparkles,
  FlameKindling
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AartiSection() {
  const [aartis, setAartis] = useState<AartiItem[]>([]);
  const [activeAarti, setActiveAarti] = useState<AartiItem | null>(null);
  
  // Popup controls
  const [fontSize, setFontSize] = useState(18); // Default 18px
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setAartis(db.getAartis());

    const unsubscribe = subscribeToDBUpdates(() => {
      setAartis(db.getAartis());
      // Sync active item if it got edited in admin panel
      if (activeAarti) {
        const fresh = db.getAartis().find(a => a.id === activeAarti.id);
        if (fresh) setActiveAarti(fresh);
      }
    });
    return unsubscribe;
  }, [activeAarti]);

  const handleCopy = () => {
    if (!activeAarti) return;
    navigator.clipboard.writeText(`${activeAarti.hindiTitle}\n\n${activeAarti.text}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleShare = async () => {
    if (!activeAarti) return;
    const shareText = `🚩 ${activeAarti.hindiTitle} 🚩\n\n${activeAarti.text.substring(0, 150)}...\n\nपूर्ण आरती यहाँ पढ़ें: ${window.location.href}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeAarti.hindiTitle,
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        console.log("Sharing failed", err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("आरती कॉपी हो गई है! आप इसे शेयर कर सकते हैं।");
    }
  };

  // Function to render text with highlighted search terms
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) {
      return text.split('\n').map((line, i) => (
        <p key={i} className="mb-2 leading-relaxed">
          {line}
        </p>
      ));
    }

    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    return text.split('\n').map((line, i) => {
      if (!line.match(regex)) {
        return <p key={i} className="mb-2 leading-relaxed">{line}</p>;
      }

      const parts = line.split(regex);
      return (
        <p key={i} className="mb-2 leading-relaxed">
          {parts.map((part, index) => 
            regex.test(part) ? (
              <mark key={index} className="bg-yellow-300 text-slate-900 rounded-sm px-0.5 font-bold">
                {part}
              </mark>
            ) : (
              part
            )
          )}
        </p>
      );
    });
  };

  return (
    <section id="aarti-section" className="w-full max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 flex items-center gap-2 mb-6">
        <span>नित्य आरती संग्रह</span>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">स्तुति वंदना</span>
      </h2>

      {/* Grid of Aarti Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {aartis.map((aarti, index) => (
          <motion.div
            key={aarti.id}
            whileHover={{ y: -4, scale: 1.01 }}
            className={`cursor-pointer bg-white/70 backdrop-blur-md border border-white/50 rounded-3xl shadow-lg shadow-sky-100/30 flex flex-col justify-between group relative overflow-hidden ${
              (aarti.deity === 'Shiv' || aarti.deity === 'Hanuman') ? 'p-4 self-center sm:self-stretch' : 'p-6'
            }`}
            onClick={() => {
              setActiveAarti(aarti);
              setSearchQuery('');
            }}
          >
            {/* Decorative Saffron Arch & Diya Indicator */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
            
            {!(aarti.deity === 'Shiv' || aarti.deity === 'Hanuman') && (
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md shadow-orange-500/20 group-hover:rotate-6 transition-all duration-300">
                  <FlameKindling className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100">
                  {aarti.deity === 'Shiv' ? 'महादेव वंदना' : 'हनुमान चालीसा/आरती'}
                </span>
              </div>
            )}

            <div className={(aarti.deity === 'Shiv' || aarti.deity === 'Hanuman') ? 'mt-0 text-center w-full' : 'mt-5 w-full'}>
              <h3 className={`text-lg md:text-xl font-bold text-slate-800 tracking-wide font-sans mb-0 ${
                (aarti.deity === 'Shiv' || aarti.deity === 'Hanuman') ? 'text-center w-full' : ''
              }`}>
                {(aarti.deity === 'Hanuman' || aarti.deity === 'Shiv') ? (
                  <span className="inline-block bg-[#fffdf5] border border-amber-300 text-slate-800 px-6 py-2.5 rounded-full shadow-sm">
                    {aarti.hindiTitle}
                  </span>
                ) : (
                  aarti.hindiTitle
                )}
              </h3>
              {!(aarti.deity === 'Shiv' || aarti.deity === 'Hanuman') && (
                <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {aarti.text.substring(0, 100)}...
                </p>
              )}
            </div>

            {!(aarti.deity === 'Shiv' || aarti.deity === 'Hanuman') && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600 group-hover:text-orange-700 transition">
                <span>आरती पाठ आरंभ करें</span>
                <span>→</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Aarti Reading Fullscreen Modal Popup */}
      <AnimatePresence>
        {activeAarti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 ${
              isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-900/40 text-slate-800 backdrop-blur-sm'
            }`}
          >
            {/* Container */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-slate-100' 
                  : 'bg-white border-sky-100 text-slate-800'
              }`}
            >
              {/* Header */}
              <div className={`p-5 flex flex-col gap-3 border-b shrink-0 ${
                isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-sky-100 bg-sky-50/50'
              }`}>
                <div className="relative flex items-center justify-between w-full">
                  <div className={`flex items-center gap-2 ${
                    (activeAarti.deity === 'Shiv' || activeAarti.deity === 'Hanuman') ? 'w-full justify-center pr-9' : ''
                  }`}>
                    <FlameKindling className="w-5 h-5 text-orange-500 animate-bounce" />
                    {(activeAarti.deity === 'Hanuman' || activeAarti.deity === 'Shiv') ? (
                      <span className="inline-block bg-[#fffdf5] dark:bg-slate-800/90 border border-amber-300 dark:border-amber-500/50 text-red-600 dark:text-red-500 px-6 py-2 rounded-full shadow-md font-extrabold tracking-wide text-center">
                        {activeAarti.hindiTitle}
                      </span>
                    ) : (
                      <h3 className="text-lg font-extrabold tracking-wide text-center">{activeAarti.hindiTitle}</h3>
                    )}
                  </div>
                  
                  {/* Close */}
                  <button
                    onClick={() => setActiveAarti(null)}
                    className={`absolute right-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {/* Toolbar HUD (Controls) */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-1 text-xs">
                  {/* Font Sizer */}
                  <div className={`flex items-center gap-2 px-2.5 py-1 rounded-xl ${
                    isDarkMode ? 'bg-slate-800/80' : 'bg-slate-100'
                  }`}>
                    <Type className="w-3.5 h-3.5 text-slate-500" />
                    <button
                      onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
                      className="w-5 h-5 font-extrabold hover:scale-110 active:scale-95 text-center flex items-center justify-center text-base"
                    >
                      <Minus className="w-4 h-4 stroke-[3]" />
                    </button>
                    <span className="font-mono font-extrabold px-1.5 select-none text-sm">{fontSize}px</span>
                    <button
                      onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
                      className="w-5 h-5 font-extrabold hover:scale-110 active:scale-95 text-center flex items-center justify-center text-base"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>

                  {/* Dark Mode toggle & clipboard actions */}
                  <div className="flex items-center gap-1.5">
                    {/* Dark Mode Toggle */}
                    <button
                      onClick={() => setIsDarkMode(prev => !prev)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                        isDarkMode ? 'bg-amber-400 hover:bg-amber-500 text-slate-900' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                      title={isDarkMode ? 'लाइट मोड' : 'डार्क मोड (रात्रि पाठ)'}
                    >
                      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>

                    {/* Copy */}
                    <button
                      onClick={handleCopy}
                      className={`h-8 px-2.5 rounded-xl flex items-center gap-1 transition ${
                        isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {copySuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs text-emerald-500 font-extrabold">कॉपी हो गया!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-xs font-extrabold">आरती कॉपी करें</span>
                        </>
                      )}
                    </button>

                    {/* Share */}
                    <button
                      onClick={handleShare}
                      className={`h-8 px-2.5 rounded-xl flex items-center gap-1 text-white font-extrabold transition bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="text-xs font-extrabold">शेयर</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="आरती शब्द खोजें (उदा. सदाशिव, अंजनी पुत्र)..."
                    className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 transition ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500' 
                        : 'bg-white border border-sky-100 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold font-mono"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Scrolling Content */}
              <div 
                className="flex-1 overflow-y-auto p-6 md:p-8 text-center"
                style={{ fontSize: `${fontSize}px` }}
              >
                {/* Traditional mangal kalash graphic indicator */}
                <div className="text-amber-500 mb-6 flex justify-center text-xl select-none">
                  ॐ • 🚩 • मंसा महादेव • 🚩 • ॐ
                </div>

                <div className="font-sans font-medium tracking-wide">
                  {renderHighlightedText(activeAarti.text, searchQuery)}
                </div>

                <div className="text-amber-500 mt-8 mb-4 flex justify-center text-xl select-none">
                  ॥ हर हर महादेव ॥
                </div>
              </div>

              {/* Status footer bar */}
              <div className={`p-4 shrink-0 text-center text-xs font-extrabold border-t select-none ${
                isDarkMode ? 'border-slate-800 bg-slate-950/30 text-slate-500' : 'border-sky-100 bg-sky-50/20 text-slate-400'
              }`}>
                श्री मंसा महादेव मँदिर तितरडी, उदयपुर (राजस्थान) नित्य स्तुति
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
