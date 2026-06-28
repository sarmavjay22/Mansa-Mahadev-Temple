import { useState, useEffect, ChangeEvent } from 'react';
import { db, subscribeToDBUpdates } from '../lib/db';
import { GalleryItem } from '../types';
import { uploadToImageKit } from '../lib/imagekit';
import { 
  Search, 
  Calendar, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  X, 
  Trash2, 
  Edit2, 
  Filter, 
  FileText,
  Sparkles,
  Info,
  Check,
  Upload,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function GallerySection() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(db.isAdminLoggedIn());
  
  // Filtering & searching states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('all'); // 'all' | '1' | '2' etc.
  const [yearFilter, setYearFilter] = useState('all'); // 'all' | '2026' | '2025' etc.

  // Active popup carousel states
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Admin edit fields inside gallery card popup
  const [isEditing, setIsEditing] = useState(false);
  const [editFestival, setEditFestival] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editImg, setEditImg] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setGallery(db.getGallery());
    setIsAdmin(db.isAdminLoggedIn());

    const unsubscribe = subscribeToDBUpdates(() => {
      setGallery(db.getGallery());
      setIsAdmin(db.isAdminLoggedIn());
    });
    return unsubscribe;
  }, []);

  // Filter computation
  const filteredGallery = gallery.filter(item => {
    const itemDateObj = new Date(item.date);
    const itemMonth = (itemDateObj.getMonth() + 1).toString(); // 1-12
    const itemYear = itemDateObj.getFullYear().toString();

    // 1. Text Search query (festival name or description)
    const matchesSearch = searchQuery.trim() === '' || 
      (item.festivalName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Specific Date filter
    const matchesDate = dateFilter === '' || item.date === dateFilter;

    // 3. Month Filter
    const matchesMonth = monthFilter === 'all' || itemMonth === monthFilter;

    // 4. Year Filter
    const matchesYear = yearFilter === 'all' || itemYear === yearFilter;

    return matchesSearch && matchesDate && matchesMonth && matchesYear;
  });

  const handleOpenPopup = (index: number) => {
    setActiveIndex(index);
    setIsEditing(false); // Reset edit state
    
    // Seed edit parameters
    const target = filteredGallery[index];
    if (target) {
      setEditFestival(target.festivalName || '');
      setEditDesc(target.description || '');
      setEditDate(target.date || '');
      setEditImg(target.imageUrl || '');
    }
  };

  const handlePrev = () => {
    if (activeIndex === null || filteredGallery.length === 0) return;
    setIsEditing(false); // Close edit
    const nextIdx = activeIndex === 0 ? filteredGallery.length - 1 : activeIndex - 1;
    handleOpenPopup(nextIdx);
  };

  const handleNext = () => {
    if (activeIndex === null || filteredGallery.length === 0) return;
    setIsEditing(false); // Close edit
    const nextIdx = activeIndex === filteredGallery.length - 1 ? 0 : activeIndex + 1;
    handleOpenPopup(nextIdx);
  };

  const handleShare = async () => {
    if (activeIndex === null) return;
    const target = filteredGallery[activeIndex];
    if (!target) return;

    const shareText = `ॐ नमः शिवाय! मंसा महादेव मंदिर तितरड़ी, उदयपुर का विगत दिव्य श्रृंगार दर्शन: ${target.festivalName} (${target.date}). दर्शन के लिए देखें: ${window.location.href}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'मंसा महादेव मंदिर दर्शन गैलरी',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Admin delete handler
  const handleDelete = () => {
    if (activeIndex === null) return;
    const target = filteredGallery[activeIndex];
    if (!target) return;

    if (confirm("चेतावनी: क्या आप सचमुच इस श्रृंगार दर्शन को गैलरी से हमेशा के लिए हटाना चाहते हैं?")) {
      db.deleteGalleryItem(target.id);
      setActiveIndex(null); // Close popup
    }
  };

  // Admin update handler
  const handleUpdate = () => {
    if (activeIndex === null) return;
    const target = filteredGallery[activeIndex];
    if (!target) return;

    if (!editImg || !editDate) {
      alert("कृपया तारीख और चित्र अनिवार्य रूप से भरें।");
      return;
    }

    db.updateGalleryItem(target.id, {
      festivalName: editFestival,
      description: editDesc,
      date: editDate,
      imageUrl: editImg
    });

    setIsEditing(false);
    alert("गैलरी विवरण सफलतापूर्वक अद्यतित हो गया है!");
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadToImageKit(file);
      setEditImg(url);
    } catch (err) {
      console.error(err);
      alert("चित्र अपलोड असफल रहा।");
    } finally {
      setUploading(false);
    }
  };

  const activeItem = activeIndex !== null ? filteredGallery[activeIndex] : null;

  // Month list helper
  const months = [
    { label: "सभी महीने", value: "all" },
    { label: "जनवरी", value: "1" },
    { label: "फरवरी", value: "2" },
    { label: "मार्च", value: "3" },
    { label: "अप्रैल", value: "4" },
    { label: "मई", value: "5" },
    { label: "जून", value: "6" },
    { label: "जुलाई", value: "7" },
    { label: "अगस्त", value: "8" },
    { label: "सितंबर", value: "9" },
    { label: "अक्टूबर", value: "10" },
    { label: "नवंबर", value: "11" },
    { label: "दिसंबर", value: "12" }
  ];

  // Year list helper
  const years = ["all", "2026", "2025", "2024", "2023"];

  return (
    <section id="gallery-section" className="w-full max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-amber-500 fill-amber-100" />
        <span>विगत दिव्य श्रृंगार दर्शन गैलरी</span>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700">दर्शन इतिहास</span>
      </h2>

      {/* FILTER CONTROL HUB BAR */}
      <div className="w-full bg-white/70 backdrop-blur-md border border-white/50 p-4 rounded-3xl shadow-lg shadow-sky-100/30 mb-6 flex flex-col gap-4 text-slate-700">
        
        {/* Search Input Row */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="उत्सव, तिथि, या श्रृंगार विवरण खोजें..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
          />
        </div>

        {/* Multi Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Specific Date Select */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">विशिष्ट तारीख (Date)</span>
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 shadow-sm"
              />
              {dateFilter && (
                <button 
                  onClick={() => setDateFilter('')}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 font-mono text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Month Select */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">महीने के अनुसार (Month)</span>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 shadow-sm"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Year Select */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">वर्ष के अनुसार (Year)</span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 shadow-sm"
            >
              <option value="all">सभी वर्ष</option>
              {years.filter(y => y !== 'all').map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear filters trigger */}
        {(searchQuery || dateFilter || monthFilter !== 'all' || yearFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setDateFilter('');
              setMonthFilter('all');
              setYearFilter('all');
            }}
            className="self-start text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 hover:bg-amber-100"
          >
            सभी फ़िल्टर साफ़ करें
          </button>
        )}
      </div>

      {/* GALLERY GRID */}
      {filteredGallery.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredGallery.map((item, index) => (
            <motion.div
              key={item.id}
              layoutId={`gallery-card-${item.id}`}
              onClick={() => handleOpenPopup(index)}
              className="group cursor-pointer bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl overflow-hidden shadow-md shadow-sky-100/30 hover:shadow-lg transition-shadow"
            >
              {/* Aspect frame image */}
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.festivalName}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                
                {/* Float Date Overlay badge */}
                <div className="absolute bottom-2 left-2 bg-black/60 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                  {new Date(item.date).toLocaleDateString('hi-IN', {
                    day: 'numeric', month: 'short'
                  })}
                </div>
              </div>

              {/* Card Meta details footer */}
              <div className="p-3">
                <h3 className="text-xs font-bold text-slate-800 truncate">
                  {item.festivalName || "दैनिक श्रृंगार दर्शन"}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {item.description || "मंसा महादेव दर्शन..."}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 bg-white/50 rounded-3xl border border-dashed border-sky-200">
          <FileText className="w-10 h-10 text-sky-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-600">कोई श्रृंगार दर्शन नहीं मिला</h3>
          <p className="text-xs text-slate-400 mt-1">कृपया अपनी खोज या फ़िल्टर मानदंड बदलें।</p>
        </div>
      )}

      {/* CAROUSEL SLIDER MODAL OVERLAY */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col md:flex-row items-stretch justify-between p-4"
          >
            {/* Left Carousel Column (The image + control arrows) */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              
              {/* Image box */}
              <motion.img
                key={activeItem.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                src={activeItem.imageUrl}
                alt={activeItem.festivalName}
                className="max-h-[70vh] md:max-h-[85vh] max-w-full object-contain select-none"
                referrerPolicy="no-referrer"
              />

              {/* Navigation Left Arrow */}
              <button
                onClick={handlePrev}
                className="absolute left-2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition active:scale-90"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Navigation Right Arrow */}
              <button
                onClick={handleNext}
                className="absolute right-2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition active:scale-90"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Top Control HUD */}
              <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10">
                <span className="bg-black/55 text-white font-mono text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {activeIndex + 1} / {filteredGallery.length} दर्शन
                </span>

                <button
                  onClick={() => setActiveIndex(null)}
                  className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Metadata Column / Optional Inline Admin Editor Panel */}
            <div className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 text-slate-100 p-6 flex flex-col justify-between shrink-0">
              
              <AnimatePresence mode="wait">
                {isAdmin && isEditing ? (
                  // ADMIN UPDATE FORM INLINE
                  <motion.div
                    key="admin-edit"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col gap-4 text-xs"
                  >
                    <h3 className="text-md font-bold text-amber-400 flex items-center gap-1">
                      <Edit2 className="w-4 h-4" />
                      <span>गैलरी दर्शन विवरण बदलें</span>
                    </h3>

                    {/* Date */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">तारीख (Date):</label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-white"
                      />
                    </div>

                    {/* Festival */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">उत्सव का नाम (Festival Name):</label>
                      <input
                        type="text"
                        value={editFestival}
                        onChange={(e) => setEditFestival(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-white"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">विवरण (Description):</label>
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-white resize-none"
                      />
                    </div>

                    {/* Image Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">चित्र बदलें (Upload or Paste):</label>
                      <input
                        type="file"
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="text-[10px] text-slate-400"
                      />
                      {uploading && <Loader2 className="w-4 h-4 animate-spin text-amber-400 mt-1" />}
                      <input
                        type="text"
                        value={editImg}
                        onChange={(e) => setEditImg(e.target.value)}
                        placeholder="चित्र का सीधा लिंक"
                        className="w-full px-3 py-2 mt-1 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none text-white"
                      />
                    </div>

                    {/* Update Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-xl"
                      >
                        रद्द करें
                      </button>
                      <button
                        onClick={handleUpdate}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2 rounded-xl shadow"
                      >
                        अपडेट करें
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  // STANDARD PUBLIC DISPLAY DETAILS
                  <motion.div
                    key="public-display"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex-1 flex flex-col justify-between"
                  >
                    <div className="flex flex-col gap-4">
                      {/* Date Meta */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold font-mono">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span>दर्शन तिथि:</span>
                        <span className="text-white bg-slate-800 px-2 py-0.5 rounded">
                          {new Date(activeItem.date).toLocaleDateString('hi-IN', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </span>
                      </div>

                      {/* Line divider */}
                      <div className="h-[1px] w-full bg-slate-800"></div>

                      {/* Text */}
                      <div>
                        <h4 className="text-md font-bold text-amber-400 flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>{activeItem.festivalName || "दैनिक श्रृंगार दर्शन"}</span>
                        </h4>
                        <p className="text-xs leading-relaxed text-slate-300 mt-2 whitespace-pre-wrap">
                          {activeItem.description || "मंसा महादेव का विगत दर्शन। प्रभु के चरणों में सादर प्रणाम।"}
                        </p>
                      </div>
                    </div>

                    {/* Admin Delete & Update Triggers */}
                    {isAdmin && (
                      <div className="flex gap-2 mt-6 pt-4 border-t border-slate-800">
                        {/* Edit button */}
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex-1 flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-xs transition"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>संपादन</span>
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={handleDelete}
                          className="flex-1 flex items-center justify-center gap-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 rounded-xl text-xs transition shadow shadow-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>हटाएं</span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Share & Help Footer inside Carousel popup */}
              {!isEditing && (
                <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col gap-2 shrink-0">
                  <div className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
                    <Info className="w-3 h-3 text-sky-500" />
                    <span>व्हाट्सएप या अन्यत्र शेयर कर सकते हैं।</span>
                  </div>
                  
                  <button
                    onClick={handleShare}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold py-2.5 rounded-xl text-xs transition duration-300 shadow flex items-center justify-center gap-1.5"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>लिंक कॉपी हो गया!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>व्हाट्सएप पर दर्शन भेजें</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
