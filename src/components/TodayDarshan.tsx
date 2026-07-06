import { useState, useEffect, useRef, ChangeEvent, MouseEvent, TouchEvent } from 'react';
import { db, subscribeToDBUpdates, formatDateDMY } from '../lib/db';
import { DailyDarshan } from '../types';
import { uploadToImageKit } from '../lib/imagekit';
import ShringarPopup from './ShringarPopup';
import { 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  Share2, 
  Edit2, 
  Upload, 
  Loader2, 
  Check, 
  Calendar, 
  Info,
  Sparkles,
  Move
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function formatDateHindi(dateStr: string): string {
  if (!dateStr) return '';
  try {
    let d: Date;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      d = new Date(dateStr);
    }
    
    if (isNaN(d.getTime())) return dateStr;
    
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    const hindiMonths = [
      'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
    ];
    const monthName = hindiMonths[d.getMonth()] || '';
    return `${day} ${monthName} ${year}`;
  } catch (e) {
    return dateStr;
  }
}

export default function TodayDarshan({ mode }: { mode?: 'title' | 'main' } = {}) {
  const [darshan, setDarshan] = useState<DailyDarshan | null>(null);
  const [isAdmin, setIsAdmin] = useState(db.isAdminLoggedIn());
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editFestival, setEditFestival] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImage, setEditImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Viewer States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isShringarOpen, setIsShringarOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setDarshan(db.getLatestShringar());
    setIsAdmin(db.isAdminLoggedIn());

    const unsubscribe = subscribeToDBUpdates(() => {
      setDarshan(db.getLatestShringar());
      setIsAdmin(db.isAdminLoggedIn());
    });
    return unsubscribe;
  }, []);

  // Initialize edit fields when edit button clicked
  const handleStartEdit = () => {
    if (!darshan) return;
    setEditDate(darshan.date);
    setEditFestival(darshan.festivalName || '');
    setEditDesc(darshan.description || '');
    setEditImage(darshan.imageUrl || '');
    setIsEditing(true);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploadedUrl = await uploadToImageKit(file);
      setEditImage(uploadedUrl);
    } catch (error) {
      console.error("Upload error: ", error);
      alert("चित्र अपलोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!editImage || !editDate) {
      alert("कृपया चित्र और तारीख का चयन करें।");
      return;
    }

    db.updateDailyDarshan({
      imageUrl: editImage,
      date: editDate,
      festivalName: editFestival,
      description: editDesc,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 1500);
  };

  // Zoom and Pan Controls
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

  // Drag-to-pan handlers (active when zoomed in)
  const handleMouseDown = (e: MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || zoomScale <= 1) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch controls for Pinch-Zoom and Pan on mobile
  const touchStartRef = useRef<{ dist: number; x: number; y: number } | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      // Single finger pan
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - panPosition.x, y: touch.clientY - panPosition.y });
    } else if (e.touches.length === 2) {
      // Pinch zoom initiation
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

  const handleTouchMove = (e: TouchEvent) => {
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

  // Share functionality
  const handleShare = async () => {
    // Get latest social share settings dynamically every time (no cached values)
    const settings = db.getSocialShareSettings();
    const title = settings.websiteTitle || 'मंसा महादेव मंदिर तितरड़ी, उदयपुर';
    const desc = settings.websiteDescription || '';
    const shareImageUrl = settings.websiteShareImageUrl || '';
    const shareUrl = settings.defaultShareUrl || window.location.origin;

    // Construct the share text exactly as requested (without direct image URL as text, which gets previewed automatically by WhatsApp):
    // 🛕 {Website Title}
    //
    // {Website Description}
    //
    // 🌐 {Website URL}
    let shareParts: string[] = [];
    shareParts.push(`🛕 ${title}`);
    if (desc && desc.trim()) {
      shareParts.push(desc.trim());
    }
    shareParts.push(`🌐 ${shareUrl}`);

    const shareText = shareParts.join('\n\n');

    if (navigator.share) {
      try {
        const shareData: ShareData = {
          title: title,
          text: shareText,
        };

        // If a share image URL is set, fetch it and convert to a File to share directly as an attachment.
        // This displays a full high-resolution image preview in WhatsApp with the text as the caption,
        // without printing the image URL as text.
        if (shareImageUrl && shareImageUrl.trim()) {
          try {
            const response = await fetch(shareImageUrl.trim(), { mode: 'cors' });
            if (response.ok) {
              const blob = await response.blob();
              const mimeType = blob.type || 'image/png';
              const ext = mimeType.split('/')[1] || 'png';
              const file = new File([blob], `temple_darshan.${ext}`, { type: mimeType });

              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                shareData.files = [file];
              }
            }
          } catch (fileErr) {
            console.warn("Could not fetch share image file, falling back to text-only share", fileErr);
          }
        }

        await navigator.share(shareData);
      } catch (error) {
        console.log("Error sharing", error);
      }
    } else {
      // Fallback for desktop / clipboard copy
      navigator.clipboard.writeText(shareText);
      alert("विवरण और लिंक क्लिपबोर्ड पर कॉपी हो गया है! आप इसे व्हाट्सएप या अन्य कहीं भी शेयर कर सकते हैं।");
    }
  };

  if (mode === 'title') {
    return (
      <section id="today-darshan-title" className="w-full max-w-4xl mx-auto px-4">
        {/* Golden Accented Title Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/90 border-2 border-amber-200 rounded-2xl shadow-lg shadow-amber-100/30 p-3 flex items-center justify-center gap-3 text-center">
          <h2 className="text-lg md:text-xl font-extrabold text-slate-800 flex items-center justify-center gap-2 flex-wrap">
            <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse shrink-0" />
            <button
              onClick={() => setIsShringarOpen(true)}
              title="दिव्य श्रृंगार दर्शन देखने के लिए यहाँ क्लिक करें"
              className="inline-flex items-center gap-2 bg-white hover:bg-amber-100 border-2 border-amber-300 hover:border-amber-400 text-amber-950 px-6 py-2.5 rounded-full shadow-sm hover:shadow-md text-base font-black tracking-wider cursor-pointer transition duration-300 transform hover:scale-105 active:scale-95 group"
            >
              <span>भोलेनाथ के श्रृंगार दर्शन</span>
            </button>
          </h2>
        </div>

        {/* Shringar Popup Gallery Modal */}
        <AnimatePresence>
          {isShringarOpen && (
            <ShringarPopup isOpen={isShringarOpen} onClose={() => setIsShringarOpen(false)} />
          )}
        </AnimatePresence>
      </section>
    );
  }

  if (mode === 'main') {
    if (!darshan || !darshan.imageUrl) return null;
    return (
      <section id="today-darshan-main" className="w-full max-w-4xl mx-auto px-4">
        {/* Admin Quick Editor Panel inside Today's Darshan */}
        <AnimatePresence>
          {isAdmin && isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-amber-50/90 border border-amber-200/60 p-4 rounded-3xl shadow-inner text-slate-800"
            >
              <h3 className="text-md font-bold text-amber-800 mb-3 flex items-center gap-1">
                <Upload className="w-4 h-4 text-amber-600" />
                <span>दैनिक दर्शन अपलोड/बदलाव (ImageKit)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  {/* Date Input */}
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">तारीख (Date):</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Festival Input */}
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">विशेष पर्व/झांकी का नाम (Festival):</label>
                    <input
                      type="text"
                      value={editFestival}
                      onChange={(e) => setEditFestival(e.target.value)}
                      placeholder="उदा. सावन सोमवार, प्रदोष व्रत श्रृंगार"
                      className="w-full px-3 py-2 text-sm bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Image upload selector */}
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">श्रृंगार चित्र (Image):</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-dashed border-amber-300 text-amber-700 font-semibold py-2 px-3 rounded-xl text-xs cursor-pointer transition"
                      >
                        {uploading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                        ) : (
                          <Upload className="w-4 h-4 text-amber-500" />
                        )}
                        <span>{uploading ? 'अपलोड हो रहा है...' : 'फाइल चुनें'}</span>
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    {/* Or paste direct URL */}
                    <div className="mt-2">
                      <input
                        type="text"
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        placeholder="या चित्र का URL यहाँ पेस्ट करें"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Description */}
                  <div className="flex-1 flex flex-col">
                    <label className="block text-xs font-bold text-amber-900 mb-1">दर्शन का भक्तिमय विवरण (Description):</label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="आज के श्रृंगार के बारे में कुछ भक्तिमय शब्द लिखें..."
                      rows={5}
                      className="w-full px-3 py-2 text-sm bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-xl text-xs transition"
                    >
                      रद्द करें
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={uploading}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow transition"
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

              {/* Preview image */}
              {editImage && (
                <div className="mt-4 flex flex-col items-center">
                  <p className="text-[10px] font-bold text-amber-800 mb-1">अपलोड किया गया चित्र पूर्वावलोकन:</p>
                  <img
                    src={editImage}
                    alt="श्रृंगार पूर्वावलोकन"
                    className="w-40 h-30 object-cover rounded-xl border border-amber-200 shadow-sm"
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Darshan Card */}
        <motion.div
          layout
          className="w-full bg-gradient-to-br from-amber-50 to-orange-50/90 border-2 border-amber-200 rounded-3xl shadow-xl shadow-amber-100/40 overflow-hidden flex flex-col md:flex-row gap-0 group"
        >
          {/* Left Side: Interactive Premium Image Box */}
          <div className="relative w-full md:w-1/2 aspect-square md:aspect-[4/5] bg-slate-900 overflow-hidden">
            {/* Overlay Soft Light effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none z-10"></div>
            
            <img
              ref={imageRef}
              src={darshan.imageUrl}
              alt="श्री मंसा महादेव मंदिर तितरड़ी उदयपुर - आज के दिव्य श्रृंगार दर्शन"
              className="w-full h-full object-cover select-none transition-transform duration-300"
              style={{
                transform: `scale(${zoomScale}) translate(${panPosition.x / zoomScale}px, ${panPosition.y / zoomScale}px)`,
                cursor: zoomScale > 1 ? 'grab' : 'zoom-in',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              referrerPolicy="no-referrer"
              loading="eager"
            />

            {/* Saffron Floating Indicator Tag */}
            {darshan.festivalName && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-md z-20 flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-spin text-white" />
                <span>{darshan.festivalName}</span>
              </div>
            )}

            {/* Top-Right Tools HUD */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
              {/* Interactive Zoom Controls Indicator (When Zoomed) */}
              {zoomScale > 1 && (
                <button
                  onClick={handleResetZoom}
                  className="bg-black/60 hover:bg-black/80 text-white font-bold text-[10px] px-2 py-1 rounded-lg backdrop-blur-sm transition"
                >
                  रीसेट (1x)
                </button>
              )}

              {/* Zoom In */}
              <button
                onClick={handleZoomIn}
                title="ज़ूम इन करें"
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition active:scale-95"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Zoom Out */}
              <button
                onClick={handleZoomOut}
                disabled={zoomScale === 1}
                title="ज़ूम आउट करें"
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 disabled:opacity-40 text-white flex items-center justify-center backdrop-blur-sm transition active:scale-95"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={() => setIsFullscreen(true)}
                title="पूर्ण स्क्रीन"
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition active:scale-95"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Swipe/Drag hint for zoom */}
            {zoomScale > 1 && (
              <div className="absolute bottom-3 left-3 bg-black/60 text-white/90 text-[10px] font-medium px-2 py-1 rounded-lg backdrop-blur-sm pointer-events-none z-20 flex items-center gap-1 animate-bounce">
                <Move className="w-3.5 h-3.5" />
                <span>खिसकाकर दर्शन करें (पैन)</span>
              </div>
            )}
          </div>

          {/* Right Side: Description and Spiritual Meta */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-start gap-1 text-slate-700 bg-amber-50/50 backdrop-blur-sm border-l border-amber-100/60">
            <div className="flex flex-col gap-1.5">
              {/* Date Header */}
              <div className="flex items-center gap-2 text-amber-800/80 font-bold text-sm">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>दर्शन तिथि:</span>
                <span className="font-mono text-amber-950 bg-amber-100 px-3 py-1 rounded-lg border border-amber-200 shadow-xs font-extrabold text-[13px]">
                  {darshan ? formatDateHindi(darshan.date) : ''}
                </span>
              </div>

              {/* Devotional content */}
              <div className="flex flex-col gap-1">
                <h3 className="text-[17px] md:text-[23px] font-black text-amber-900 tracking-tight flex items-center gap-2">
                  <span className="text-amber-500 text-[20px] animate-pulse">⚜</span>
                  {darshan.festivalName || "दैनिक दिव्य दर्शन"}
                </h3>
                <p className="text-[12px] md:text-[14px] leading-relaxed text-slate-800 whitespace-pre-wrap font-medium">
                  {darshan.description || "मंसा महादेव का आज का अति मनोहारी एवं मनवांछित फलदायक दिव्य श्रृंगार दर्शन। नमन करें और पुण्य लाभ कमाएं।"}
                </p>
              </div>
            </div>

            {/* Quick Share / Information HUD */}
            <div className="mt-1 pt-2 border-t border-sky-100 flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold text-black flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span>मोबाइल पर पिंच ज़ूम उपलब्ध</span>
              </span>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-4 py-2 rounded-xl transition duration-300 shadow-md shadow-orange-500/10 active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>व्हाट्सएप पर शेयर करें</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Fullscreen Modal Image Viewer with Zoom, Drag, Gestures */}
        <AnimatePresence>
          {isFullscreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 touch-none"
            >
              {/* Top Bar inside modal */}
              <div className="flex justify-between items-center text-white z-25">
                <div>
                  <p className="text-xs text-amber-400 font-bold font-mono">
                    {darshan ? formatDateHindi(darshan.date) : ''}
                  </p>
                  <h4 className="text-sm font-bold truncate max-w-[200px]">{darshan.festivalName}</h4>
                </div>

                {/* Action row */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoomScale === 1}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 transition"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleZoomIn}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  {zoomScale > 1 && (
                    <button
                      onClick={handleResetZoom}
                      className="bg-white/10 text-white font-bold text-xs px-3 py-1.5 rounded-full hover:bg-white/20 transition"
                    >
                      100%
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsFullscreen(false);
                      handleResetZoom();
                    }}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                  >
                    <Minimize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Immersive Image Display Container */}
              <div 
                className="relative flex-1 flex items-center justify-center overflow-hidden w-full h-full"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={darshan.imageUrl}
                  alt="महादेव दर्शन"
                  className="max-h-[80vh] max-w-full object-contain select-none transition-transform duration-200"
                  style={{
                    transform: `scale(${zoomScale}) translate(${panPosition.x / zoomScale}px, ${panPosition.y / zoomScale}px)`,
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Footer with touch instruction */}
              <div className="flex flex-col items-center gap-2 text-white/60 text-xs pb-4">
                <p className="flex items-center gap-1 text-center text-[11px] text-amber-300">
                  <Move className="w-3.5 h-3.5" />
                  <span>ज़ूम करने पर खिसकाएं। मोबाइल पर 2 उंगलियों से पिंच ज़ूम करें।</span>
                </p>
                <button
                  onClick={handleShare}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold px-5 py-2.5 rounded-full transition duration-300 shadow flex items-center gap-1.5"
                >
                  <Share2 className="w-4 h-4 text-slate-900" />
                  <span>व्हाट्सएप दर्शन शेयर करें</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    );
  }

  if (!darshan || !darshan.imageUrl) {
    return (
      <section id="today-darshan" className="w-full max-w-4xl mx-auto px-4 pt-4 pb-0">
        {/* Golden Accented Title Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/90 border-2 border-amber-200 rounded-2xl shadow-lg shadow-amber-100/30 p-3 mb-4 flex items-center justify-center gap-3 text-center">
          <h2 className="text-lg md:text-xl font-extrabold text-slate-800 flex items-center justify-center gap-2 flex-wrap">
            <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse shrink-0" />
            <button
              onClick={() => setIsShringarOpen(true)}
              title="दिव्य श्रृंगार दर्शन देखने के लिए यहाँ क्लिक करें"
              className="inline-flex items-center gap-2 bg-white hover:bg-amber-100 border-2 border-amber-300 hover:border-amber-400 text-amber-950 px-6 py-2.5 rounded-full shadow-sm hover:shadow-md text-base font-black tracking-wider cursor-pointer transition duration-300 transform hover:scale-105 active:scale-95 group"
            >
              <span>भोलेनाथ के श्रृंगार दर्शन</span>
            </button>
          </h2>
        </div>


        <ShringarPopup isOpen={isShringarOpen} onClose={() => setIsShringarOpen(false)} />
      </section>
    );
  }

  return (
    <section id="today-darshan" className="w-full max-w-4xl mx-auto px-4 pt-4 pb-0">
      {/* Golden Accented Title Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/90 border-2 border-amber-200 rounded-2xl shadow-lg shadow-amber-100/30 p-3 mb-4 flex items-center justify-center gap-3 text-center">
        <h2 className="text-lg md:text-xl font-extrabold text-slate-800 flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse shrink-0" />
          <button
            onClick={() => setIsShringarOpen(true)}
            title="दिव्य श्रृंगार दर्शन देखने के लिए यहाँ क्लिक करें"
            className="inline-flex items-center gap-2 bg-white hover:bg-amber-100 border-2 border-amber-300 hover:border-amber-400 text-amber-950 px-6 py-2.5 rounded-full shadow-sm hover:shadow-md text-base font-black tracking-wider cursor-pointer transition duration-300 transform hover:scale-105 active:scale-95 group"
          >
            <span>भोलेनाथ के श्रृंगार दर्शन</span>
          </button>
        </h2>
      </div>

      {/* Admin Quick Editor Panel inside Today's Darshan */}
      <AnimatePresence>
        {isAdmin && isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-amber-50/90 border border-amber-200/60 p-4 rounded-3xl shadow-inner text-slate-800"
          >
            <h3 className="text-md font-bold text-amber-800 mb-3 flex items-center gap-1">
              <Upload className="w-4 h-4 text-amber-600" />
              <span>दैनिक दर्शन अपलोड/बदलाव (ImageKit)</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                {/* Date Input */}
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">तारीख (Date):</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Festival Input */}
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">विशेष पर्व/झांकी का नाम (Festival):</label>
                  <input
                    type="text"
                    value={editFestival}
                    onChange={(e) => setEditFestival(e.target.value)}
                    placeholder="उदा. सावन सोमवार, प्रदोष व्रत श्रृंगार"
                    className="w-full px-3 py-2 text-sm bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Image upload selector */}
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">श्रृंगार चित्र (Image):</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-dashed border-amber-300 text-amber-700 font-semibold py-2 px-3 rounded-xl text-xs cursor-pointer transition"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      ) : (
                        <Upload className="w-4 h-4 text-amber-500" />
                      )}
                      <span>{uploading ? 'अपलोड हो रहा है...' : 'फाइल चुनें'}</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  {/* Or paste direct URL */}
                  <div className="mt-2">
                    <input
                      type="text"
                      value={editImage}
                      onChange={(e) => setEditImage(e.target.value)}
                      placeholder="या चित्र का URL यहाँ पेस्ट करें"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {/* Description */}
                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-bold text-amber-900 mb-1">दर्शन का भक्तिमय विवरण (Description):</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="आज के श्रृंगार के बारे में कुछ भक्तिमय शब्द लिखें..."
                    rows={5}
                    className="w-full px-3 py-2 text-sm bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-xl text-xs transition"
                  >
                    रद्द करें
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={uploading}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow transition"
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

            {/* Preview image */}
            {editImage && (
              <div className="mt-4 flex flex-col items-center">
                <p className="text-[10px] font-bold text-amber-800 mb-1">अपलोड किया गया चित्र पूर्वावलोकन:</p>
                <img
                  src={editImage}
                  alt="श्रृंगार पूर्वावलोकन"
                  className="w-40 h-30 object-cover rounded-xl border border-amber-200 shadow-sm"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Darshan Card */}
      <motion.div
        layout
        className="w-full bg-gradient-to-br from-amber-50 to-orange-50/90 border-2 border-amber-200 rounded-3xl shadow-xl shadow-amber-100/40 overflow-hidden flex flex-col md:flex-row gap-0 group"
      >
        {/* Left Side: Interactive Premium Image Box */}
        <div className="relative w-full md:w-1/2 aspect-square md:aspect-[4/5] bg-slate-900 overflow-hidden">
          {/* Overlay Soft Light effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none z-10"></div>
          
          <img
            ref={imageRef}
            src={darshan.imageUrl}
            alt="श्री मंसा महादेव मंदिर तितरड़ी उदयपुर - आज के दिव्य श्रृंगार दर्शन"
            className="w-full h-full object-cover select-none transition-transform duration-300"
            style={{
              transform: `scale(${zoomScale}) translate(${panPosition.x / zoomScale}px, ${panPosition.y / zoomScale}px)`,
              cursor: zoomScale > 1 ? 'grab' : 'zoom-in',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            referrerPolicy="no-referrer"
            loading="eager"
          />

          {/* Saffron Floating Indicator Tag */}
          {darshan.festivalName && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-md z-20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-spin text-white" />
              <span>{darshan.festivalName}</span>
            </div>
          )}

          {/* Top-Right Tools HUD */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
            {/* Interactive Zoom Controls Indicator (When Zoomed) */}
            {zoomScale > 1 && (
              <button
                onClick={handleResetZoom}
                className="bg-black/60 hover:bg-black/80 text-white font-bold text-[10px] px-2 py-1 rounded-lg backdrop-blur-sm transition"
              >
                रीसेट (1x)
              </button>
            )}

            {/* Zoom In */}
            <button
              onClick={handleZoomIn}
              title="ज़ूम इन करें"
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition active:scale-95"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Zoom Out */}
            <button
              onClick={handleZoomOut}
              disabled={zoomScale === 1}
              title="ज़ूम आउट करें"
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 disabled:opacity-40 text-white flex items-center justify-center backdrop-blur-sm transition active:scale-95"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={() => setIsFullscreen(true)}
              title="पूर्ण स्क्रीन"
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition active:scale-95"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Swipe/Drag hint for zoom */}
          {zoomScale > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/60 text-white/90 text-[10px] font-medium px-2 py-1 rounded-lg backdrop-blur-sm pointer-events-none z-20 flex items-center gap-1 animate-bounce">
              <Move className="w-3.5 h-3.5" />
              <span>खिसकाकर दर्शन करें (पैन)</span>
            </div>
          )}
        </div>

        {/* Right Side: Description and Spiritual Meta */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-start gap-1 text-slate-700 bg-amber-50/50 backdrop-blur-sm border-l border-amber-100/60">
          <div className="flex flex-col gap-1.5">
            {/* Date Header */}
            <div className="flex items-center gap-2 text-amber-800/80 font-bold text-sm">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>दर्शन तिथि:</span>
              <span className="font-mono text-amber-950 bg-amber-100 px-3 py-1 rounded-lg border border-amber-200 shadow-xs font-extrabold text-[13px]">
                {darshan ? formatDateHindi(darshan.date) : ''}
              </span>
            </div>

            {/* Devotional content */}
            <div className="flex flex-col gap-1">
              <h3 className="text-[17px] md:text-[23px] font-black text-amber-900 tracking-tight flex items-center gap-2">
                <span className="text-amber-500 text-[20px] animate-pulse">⚜</span>
                {darshan.festivalName || "दैनिक दिव्य दर्शन"}
              </h3>
              <p className="text-[12px] md:text-[14px] leading-relaxed text-slate-800 whitespace-pre-wrap font-medium">
                {darshan.description || "मंसा महादेव का आज का अति मनोहारी एवं मनवांछित फलदायक दिव्य श्रृंगार दर्शन। नमन करें और पुण्य लाभ कमाएं।"}
              </p>
            </div>
          </div>

          {/* Quick Share / Information HUD */}
          <div className="mt-1 pt-2 border-t border-sky-100 flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold text-black flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>मोबाइल पर पिंच ज़ूम उपलब्ध</span>
            </span>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-4 py-2 rounded-xl transition duration-300 shadow-md shadow-orange-500/10 active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>व्हाट्सएप पर शेयर करें</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Modal Image Viewer with Zoom, Drag, Gestures */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 touch-none"
          >
            {/* Top Bar inside modal */}
            <div className="flex justify-between items-center text-white z-25">
              <div>
                <p className="text-xs text-amber-400 font-bold font-mono">
                  {darshan ? formatDateHindi(darshan.date) : ''}
                </p>
                <h4 className="text-sm font-bold truncate max-w-[200px]">{darshan.festivalName}</h4>
              </div>

              {/* Action row */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomScale === 1}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 transition"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button
                  onClick={handleZoomIn}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                {zoomScale > 1 && (
                  <button
                    onClick={handleResetZoom}
                    className="bg-white/10 text-white font-bold text-xs px-3 py-1.5 rounded-full hover:bg-white/20 transition"
                  >
                    100%
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsFullscreen(false);
                    handleResetZoom();
                  }}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Immersive Image Display Container */}
            <div 
              className="relative flex-1 flex items-center justify-center overflow-hidden w-full h-full"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={darshan.imageUrl}
                alt="महादेव दर्शन"
                className="max-h-[80vh] max-w-full object-contain select-none transition-transform duration-200"
                style={{
                  transform: `scale(${zoomScale}) translate(${panPosition.x / zoomScale}px, ${panPosition.y / zoomScale}px)`,
                }}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Footer with touch instruction */}
            <div className="flex flex-col items-center gap-2 text-white/60 text-xs pb-4">
              <p className="flex items-center gap-1 text-center text-[11px] text-amber-300">
                <Move className="w-3.5 h-3.5" />
                <span>ज़ूम करने पर खिसकाएं। मोबाइल पर 2 उंगलियों से पिंच ज़ूम करें।</span>
              </p>
              <button
                onClick={handleShare}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold px-5 py-2.5 rounded-full transition duration-300 shadow flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4 text-slate-900" />
                <span>व्हाट्सएप दर्शन शेयर करें</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shringar Popup Gallery Modal */}
      <AnimatePresence>
        {isShringarOpen && (
          <ShringarPopup isOpen={isShringarOpen} onClose={() => setIsShringarOpen(false)} />
        )}
      </AnimatePresence>
    </section>
  );
}
