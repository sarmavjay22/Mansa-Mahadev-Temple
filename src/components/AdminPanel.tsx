import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { db, subscribeToDBUpdates, formatDateDMY } from '../lib/db';
import { NotificationItem, GalleryItem, DailyDarshan, VideoDarshan } from '../types';
import { uploadToImageKit } from '../lib/imagekit';
import { 
  ShieldCheck, 
  X, 
  LogIn, 
  LogOut, 
  Database, 
  Bell, 
  Plus, 
  Trash2, 
  BarChart3, 
  Image, 
  Upload, 
  Check, 
  Loader2, 
  Lock,
  Eye,
  Info,
  Sliders,
  Sparkles,
  Settings,
  Edit2,
  Youtube,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TempleSettingsTab from './TempleSettingsTab';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(db.isAdminLoggedIn());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'notifications' | 'upload_gallery' | 'upload_video' | 'temple_settings'>('overview');

  // Stats State
  const [stats, setStats] = useState({
    galleryCount: 0,
    videoCount: 0,
    bhajanCount: 0,
    notificationCount: 0,
  });

  // Gallery order states
  const [galOrder, setGalOrder] = useState<number>(0);
  const [editGalOrder, setEditGalOrder] = useState<number>(0);

  // Notifications State
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [newNotifTitle, setNewNotifTitle] = useState('');
  const [newNotifMsg, setNewNotifMsg] = useState('');
  const [newNotifType, setNewNotifType] = useState<'general' | 'festival' | 'alert'>('general');

  // Gallery Uploader State
  const [galDate, setGalDate] = useState(new Date().toISOString().split('T')[0]);
  const [galFestival, setGalFestival] = useState('');
  const [galDesc, setGalDesc] = useState('');
  const [galImage, setGalImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [galSuccess, setGalSuccess] = useState(false);

  // Today's Darshan (दैनिक श्रृंगार दर्शन) State
  const [todayDate, setTodayDate] = useState('');
  const [todayFestival, setTodayFestival] = useState('');
  const [todayDesc, setTodayDesc] = useState('');
  const [todayImage, setTodayImage] = useState('');
  const [todayUploading, setTodayUploading] = useState(false);
  const [todaySuccess, setTodaySuccess] = useState(false);
  const [shringarTabMode, setShringarTabMode] = useState<'today' | 'gallery'>('today');

  // Video Uploader State
  const [videoTodayDate, setVideoTodayDate] = useState('');
  const [videoTodayTitle, setVideoTodayTitle] = useState('');
  const [videoTodayUrl, setVideoTodayUrl] = useState('');
  const [videoTodaySuccess, setVideoTodaySuccess] = useState(false);

  const [videoGalDate, setVideoGalDate] = useState(new Date().toISOString().split('T')[0]);
  const [videoGalTitle, setVideoGalTitle] = useState('');
  const [videoGalUrl, setVideoGalUrl] = useState('');
  const [videoGalSuccess, setVideoGalSuccess] = useState(false);

  const [videoTabMode, setVideoTabMode] = useState<'today' | 'gallery'>('today');

  // Video list and inline editing states
  const [videoList, setVideoList] = useState<VideoDarshan[]>([]);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editVideoTitle, setEditVideoTitle] = useState('');
  const [editVideoDate, setEditVideoDate] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editVideoIsToday, setEditVideoIsToday] = useState(false);
  const [deleteConfirmVideoId, setDeleteConfirmVideoId] = useState<string | null>(null);

  // Gallery list and inline editing states
  const [galList, setGalList] = useState<GalleryItem[]>([]);
  const [editingGalId, setEditingGalId] = useState<string | null>(null);
  const [editGalFestival, setEditGalFestival] = useState('');
  const [editGalDate, setEditGalDate] = useState('');
  const [editGalDesc, setEditGalDesc] = useState('');
  const [editGalImage, setEditGalImage] = useState('');
  const [deleteConfirmGalId, setDeleteConfirmGalId] = useState<string | null>(null);
  const [deleteConfirmNotifId, setDeleteConfirmNotifId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoggedIn(db.isAdminLoggedIn());
    loadDashboardData();

    const unsubscribe = subscribeToDBUpdates(() => {
      setIsLoggedIn(db.isAdminLoggedIn());
      loadDashboardData();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (activeTab === 'upload_gallery') {
      const current = db.getDailyDarshan();
      if (current) {
        setTodayDate(current.date);
        setTodayFestival(current.festivalName || '');
        setTodayDesc(current.description || '');
        setTodayImage(current.imageUrl || '');
      }
    } else if (activeTab === 'upload_video') {
      const currentVideo = db.getTodayVideo();
      if (currentVideo) {
        setVideoTodayDate(currentVideo.date);
        setVideoTodayTitle(currentVideo.title || '');
        setVideoTodayUrl(currentVideo.youtubeUrl || '');
      } else {
        setVideoTodayDate(new Date().toISOString().split('T')[0]);
        setVideoTodayTitle('');
        setVideoTodayUrl('');
      }
    }
  }, [activeTab]);

  const loadDashboardData = () => {
    const galleryItems = db.getGallery();
    const videoItems = db.getVideos();
    const bhajanItems = db.getBhajans();
    const notificationItems = db.getNotifications();

    setStats({
      galleryCount: galleryItems.length,
      videoCount: videoItems.length,
      bhajanCount: bhajanItems.length,
      notificationCount: notificationItems.length,
    });

    setNotifs(notificationItems);
    setGalList(galleryItems);
    setVideoList(videoItems);
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const success = db.loginAdmin(email, password);
    if (success) {
      setEmail('');
      setPassword('');
    } else {
      setLoginError('अमान्य ईमेल या पासवर्ड! कृपया दोबारा प्रयास करें।');
    }
  };

  const handleLogout = () => {
    db.logoutAdmin();
    setActiveTab('overview');
  };

  // Add notification
  const handleAddNotification = () => {
    if (!newNotifTitle.trim() || !newNotifMsg.trim()) {
      alert("शीर्षक और विवरण दोनों भरना आवश्यक है।");
      return;
    }

    db.addNotification({
      title: newNotifTitle.trim(),
      message: newNotifMsg.trim(),
      type: newNotifType
    });

    setNewNotifTitle('');
    setNewNotifMsg('');
    alert("नई घोषणा (Notification) सफलतापूर्वक प्रकाशित हो गई है!");
  };

  const handleDeleteNotification = (id: string) => {
    db.deleteNotification(id);
  };

  // Upload today's darshan image
  const handleTodayImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setTodayUploading(true);
      const url = await uploadToImageKit(file);
      setTodayImage(url);
    } catch (err) {
      console.error(err);
      alert("आज का चित्र अपलोड विफल हुआ!");
    } finally {
      setTodayUploading(false);
    }
  };

  const handleSaveTodayDarshan = () => {
    if (!todayImage || !todayDate) {
      alert("कृपया आज का दर्शन चित्र और तारीख दर्ज करें।");
      return;
    }

    db.updateDailyDarshan({
      imageUrl: todayImage,
      date: todayDate,
      festivalName: todayFestival.trim() || "दैनिक श्रृंगार दर्शन",
      description: todayDesc.trim() || "मंसा महादेव का आज का अलौकिक श्रृंगार दर्शन।"
    });

    setTodaySuccess(true);
    setTodayImage(""); // Clear the image link column as requested
    setTimeout(() => {
      setTodaySuccess(false);
    }, 1500);
    alert("भोलेनाथ के श्रृंगार दर्शन सफलतापूर्वक अपडेट हो गए हैं!");
  };

  // Upload gallery item
  const handleGalleryImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadToImageKit(file);
      setGalImage(url);
    } catch (err) {
      console.error(err);
      alert("चित्र अपलोड विफल हुआ!");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveGalleryItem = () => {
    if (!galImage || !galDate) {
      alert("चित्र और तारीख का चयन करना आवश्यक है।");
      return;
    }

    db.addGalleryItem({
      imageUrl: galImage,
      date: galDate,
      festivalName: galFestival.trim() || "दैनिक श्रृंगार दर्शन",
      description: galDesc.trim() || "मंसा महादेव का अलौकिक दर्शन।",
      order: Number(galOrder) || 0
    });

    setGalSuccess(true);
    setTimeout(() => {
      setGalSuccess(false);
      setGalFestival('');
      setGalDesc('');
      setGalImage('');
      setGalOrder(0);
    }, 1500);
  };

  const handleStartEditGal = (item: GalleryItem) => {
    setEditingGalId(item.id);
    setEditGalFestival(item.festivalName || '');
    setEditGalDate(item.date || '');
    setEditGalDesc(item.description || '');
    setEditGalImage(item.imageUrl || '');
    setEditGalOrder((item as any).order || 0);
  };

  const handleCancelEditGal = () => {
    setEditingGalId(null);
  };

  const handleSaveEditGal = () => {
    if (!editGalImage || !editGalDate) {
      alert("कृपया चित्र और तारीख का चयन करें।");
      return;
    }

    db.updateGalleryItem(editingGalId!, {
      festivalName: editGalFestival.trim(),
      date: editGalDate,
      description: editGalDesc.trim(),
      imageUrl: editGalImage,
      order: Number(editGalOrder) || 0
    });

    setEditingGalId(null);
    alert("श्रृंगार चित्र सफलतापूर्वक अपडेट किया गया!");
  };

  const handleDeleteGal = (id: string) => {
    db.deleteGalleryItem(id);
  };

  const handleMoveGallery = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galList.length) return;
    
    const currentItem = galList[index];
    const otherItem = galList[targetIndex];
    
    const currentOrder = currentItem.order !== undefined ? currentItem.order : index;
    const otherOrder = otherItem.order !== undefined ? otherItem.order : targetIndex;
    
    await db.updateGalleryItem(currentItem.id, { order: otherOrder });
    await db.updateGalleryItem(otherItem.id, { order: currentOrder });
  };

  const handleEditGalImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadToImageKit(file);
      setEditGalImage(url);
    } catch (err) {
      console.error(err);
      alert("चित्र अपलोड विफल हुआ!");
    } finally {
      setUploading(false);
    }
  };

  // Save today's video
  const handleSaveTodayVideo = () => {
    if (!videoTodayUrl || !videoTodayDate) {
      alert("कृपया आज का वीडियो लिंक और तारीख दर्ज करें।");
      return;
    }

    db.addVideo({
      title: videoTodayTitle.trim() || "दैनिक आरती वीडियो",
      youtubeUrl: videoTodayUrl.trim(),
      date: videoTodayDate,
      isToday: true
    });

    setVideoTodaySuccess(true);
    setTimeout(() => {
      setVideoTodaySuccess(false);
    }, 1500);
    alert("भोलेनाथ की आज की आरती वीडियो सफलतापूर्वक अपडेट हो गई है!");
  };

  // Add past/gallery video
  const handleSaveGalleryVideo = () => {
    if (!videoGalUrl || !videoGalDate) {
      alert("कृपया वीडियो लिंक और तारीख दर्ज करें।");
      return;
    }

    db.addVideo({
      title: videoGalTitle.trim() || "दिव्य आरती वीडियो",
      youtubeUrl: videoGalUrl.trim(),
      date: videoGalDate,
      isToday: false
    });

    setVideoGalSuccess(true);
    setTimeout(() => {
      setVideoGalSuccess(false);
      setVideoGalTitle('');
      setVideoGalUrl('');
    }, 1500);
    alert("आरती वीडियो सफलतापूर्वक गैलरी में जोड़ दिया गया है!");
  };

  // Start editing video
  const handleStartEditVideo = (item: VideoDarshan) => {
    setEditingVideoId(item.id);
    setEditVideoTitle(item.title || '');
    setEditVideoDate(item.date || '');
    setEditVideoUrl(item.youtubeUrl || '');
    setEditVideoIsToday(item.isToday || false);
  };

  // Cancel edit
  const handleCancelEditVideo = () => {
    setEditingVideoId(null);
  };

  // Save edit
  const handleSaveEditVideo = () => {
    if (!editVideoUrl || !editVideoDate) {
      alert("कृपया वीडियो लिंक और तारीख का चयन करें।");
      return;
    }

    db.updateVideo(editingVideoId!, {
      title: editVideoTitle.trim(),
      date: editVideoDate,
      youtubeUrl: editVideoUrl.trim(),
      isToday: editVideoIsToday
    });

    setEditingVideoId(null);
    alert("आरती वीडियो सफलतापूर्वक अपडेट किया गया!");
  };

  // Delete video
  const handleDeleteVideo = (id: string) => {
    db.deleteVideo(id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        className="w-full max-w-2xl bg-white border border-sky-100 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] text-slate-700"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-sky-100 bg-gradient-to-r from-amber-50 to-orange-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500 fill-amber-100 animate-pulse" />
            <h2 className={`text-md md:text-lg font-extrabold tracking-wide ${isLoggedIn ? 'text-orange-500' : 'text-slate-800'}`}>
              {isLoggedIn ? 'मंसा महादेव प्रबंधन पैनल (Dashboard)' : 'सुरक्षित प्रबंधक लॉगिन'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto">
          {/* A. NOT LOGGED IN - SHOW LOGIN FORM */}
          {!isLoggedIn ? (
            <div className="p-6 md:p-8 flex flex-col items-center">
              {/* Shield/Lock Aura */}
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 shadow">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>

              <p className="text-xs text-slate-500 text-center max-w-sm mb-6 font-medium">
                यह अनुभाग केवल मंसा महादेव मंदिर के अधिकृत पुजारियों एवं प्रबंधकों के लिए सुरक्षित है।
              </p>

              <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">प्रबंधक ईमेल:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@mansamahadev.com"
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">पासवर्ड:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>

                {/* Login hint credentials so that developer testing is extremely simple */}
                <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl text-[10px] text-sky-700 font-bold">
                  🔐 परीक्षण क्रेडेंशियल्स (Testing Credentials):<br />
                  • ईमेल: <span className="font-mono text-slate-900 select-all">admin@mansamahadev.com</span><br />
                  • पासवर्ड: <span className="font-mono text-slate-900 select-all">admin</span>
                </div>

                {/* Error */}
                {loginError && (
                  <p className="text-xs text-rose-500 font-bold bg-rose-50 border border-rose-100 p-2.5 rounded-xl">{loginError}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-xl shadow-md transition duration-300 hover:scale-[1.01] active:scale-99 flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>प्रवेश करें</span>
                </button>
              </form>
            </div>
          ) : (
            
            // B. LOGGED IN - SHOW CENTRALIZED DASHBOARD
            <div className="flex flex-col">
              
              {/* Dashboard Sub Tabs Navigation */}
              <div className="flex border-b border-sky-100 bg-sky-50/20 text-xs font-bold shrink-0 select-none">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-3.5 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'overview' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>सांख्यिकी एवं निर्देश</span>
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex-1 py-3.5 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'notifications' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>उत्सव सूचनाएं ({stats.notificationCount})</span>
                </button>

                <button
                  onClick={() => setActiveTab('upload_gallery')}
                  className={`flex-1 py-3.5 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'upload_gallery' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Image className="w-4 h-4" />
                  <span>श्रृंगार दर्शन</span>
                </button>

                <button
                  onClick={() => setActiveTab('upload_video')}
                  className={`flex-1 py-3.5 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'upload_video' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Youtube className="w-4 h-4 text-red-600 fill-red-100" />
                  <span>आरती वीडियो</span>
                </button>

                <button
                  onClick={() => setActiveTab('temple_settings')}
                  className={`flex-1 py-3.5 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'temple_settings' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>मँदिर सेटिंग्स</span>
                </button>
              </div>

              {/* Subtab Contents Container */}
              <div className="p-6">
                
                {/* 1. OVERVIEW & DIRECTIONS SUBTAB */}
                {activeTab === 'overview' && (
                  <div className="flex flex-col gap-6">
                    {/* Database stats bento grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-800">
                      
                      <div className="p-3 bg-sky-50 border border-sky-100 rounded-2xl flex flex-col items-center shadow-sm">
                        <span className="text-xs text-slate-400 font-bold font-mono">कुल गैलरी</span>
                        <span className="text-xl font-mono font-black text-sky-600">{stats.galleryCount}</span>
                      </div>

                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col items-center shadow-sm">
                        <span className="text-xs text-slate-400 font-bold font-mono">यूट्यूब वीडियो</span>
                        <span className="text-xl font-mono font-black text-rose-600">{stats.videoCount}</span>
                      </div>

                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl flex flex-col items-center shadow-sm">
                        <span className="text-xs text-slate-400 font-bold font-mono">भजन/आरती</span>
                        <span className="text-xl font-mono font-black text-amber-600">{stats.bhajanCount}</span>
                      </div>

                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center shadow-sm">
                        <span className="text-xs text-slate-400 font-bold font-mono">सक्रिय सूचनाएं</span>
                        <span className="text-xl font-mono font-black text-emerald-600">{stats.notificationCount}</span>
                      </div>
                    </div>

                    {/* How to use guidelines */}
                    <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex flex-col gap-2">
                      <h4 className="text-xs font-bold text-sky-900 flex items-center gap-1">
                        <Sliders className="w-4 h-4 text-sky-600" />
                        <span>सुविधाजनक इनलाइन संपादन निर्देश:</span>
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-600 font-medium">
                        आपके लिए मंदिर का प्रबंधन अति-सरल बना दिया गया है! 
                        लॉगिन रहने पर, आप सीधे मंदिर की वेबसाइट के मुख्य पृष्ठ (Homepage) पर घूमते हुए निम्नलिखित संपादित कर सकते हैं:
                      </p>
                      <ul className="list-disc list-inside text-xs text-slate-500 font-semibold space-y-1 pl-1">
                        <li>भोलेनाथ के श्रृंगार दर्शन: "श्रृंगार बदलें" बटन पर क्लिक करके बदलें।</li>
                        <li>यूट्यूब वीडियो: सीधे यूट्यूब वीडियो के ऊपर "वीडियो जोड़ें" पर क्लिक करें।</li>
                        <li>आरती के बोल: आरती खोलने पर दिखाई देने वाले फ़ील्ड्स में सीधे संपादन कर सकते हैं।</li>
                        <li>भजन प्लेलिस्ट: सीधे प्लेलिस्ट के नीचे "भजन जोड़ें" बटन दबाएं।</li>
                        <li>इतिहास, समय सारणी और संपर्क: विवरणों के ऊपर "जानकारी बदलें" पर क्लिक करके अपडेट करें।</li>
                      </ul>
                      <p className="text-[10px] text-amber-700 font-black mt-2">
                        🚩 आपके किए गए सभी बदलाव तात्कालिक (Realtime) रूप से सुरक्षित हो जाते हैं!
                      </p>
                    </div>

                    {/* Log out section */}
                    <button
                      onClick={handleLogout}
                      className="self-center flex items-center gap-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold px-5 py-2 rounded-xl border border-rose-200/50 transition duration-300"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>प्रबंधन सत्र समाप्त करें (Logout)</span>
                    </button>
                  </div>
                )}

                {/* 2. NOTIFICATIONS SECTION */}
                {activeTab === 'notifications' && (
                  <div className="flex flex-col gap-5 text-xs text-slate-700">
                    {/* Add Notice Panel */}
                    <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                        <Plus className="w-4 h-4 text-emerald-600" />
                        <span>नई उत्सव/महत्वपूर्ण घोषणा प्रकाशित करें</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">घोषणा का शीर्षक (Title):</label>
                          <input
                            type="text"
                            value={newNotifTitle}
                            onChange={(e) => setNewNotifTitle(e.target.value)}
                            placeholder="उदा. सावन सोमवार रुद्राभिषेक..."
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">श्रेणी (Type):</label>
                          <select
                            value={newNotifType}
                            onChange={(e: any) => setNewNotifType(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                          >
                            <option value="festival">पर्व/उत्सव (Festival)</option>
                            <option value="general">सामान्य सूचना (General)</option>
                            <option value="alert">महत्वपूर्ण चेतावनी (Alert)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">घोषणा का संदेश विवरण (Message):</label>
                        <textarea
                          value={newNotifMsg}
                          onChange={(e) => setNewNotifMsg(e.target.value)}
                          placeholder="सभी श्रद्धालुओं को सूचित किया जाता है कि..."
                          rows={2}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none resize-none"
                        />
                      </div>

                      <button
                        onClick={handleAddNotification}
                        className="self-end px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
                      >
                        प्रकाशित करें
                      </button>
                    </div>

                    {/* Active list queue */}
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest px-1">सक्रिय घोषणाएं ({notifs.length}):</p>
                      <div className="max-h-52 overflow-y-auto flex flex-col gap-2 pr-1 text-[11px] font-medium">
                        {notifs.map(n => (
                          <div 
                            key={n.id}
                            className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${
                                  n.type === 'festival' ? 'bg-amber-500' : n.type === 'alert' ? 'bg-rose-500' : 'bg-sky-500'
                                }`}></span>
                                <span className="font-bold text-slate-800">{n.title}</span>
                                <span className="text-[9px] text-slate-400 font-mono">({formatDateDMY(n.date)})</span>
                              </div>
                              <p className="text-slate-500 mt-1 pl-3.5 leading-relaxed">{n.message}</p>
                            </div>

                            {deleteConfirmNotifId === n.id ? (
                              <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 p-1 rounded-xl shrink-0">
                                <span className="text-[9px] text-rose-600 font-bold px-1 select-none">हटाएं?</span>
                                <button
                                  onClick={() => {
                                    handleDeleteNotification(n.id);
                                    setDeleteConfirmNotifId(null);
                                  }}
                                  className="px-1.5 py-0.5 bg-rose-500 text-white font-extrabold text-[9px] rounded-lg shadow-sm hover:bg-rose-600 transition"
                                >
                                  हाँ
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmNotifId(null)}
                                  className="px-1.5 py-0.5 bg-slate-200 text-slate-700 font-extrabold text-[9px] rounded-lg hover:bg-slate-300 transition"
                                >
                                  नहीं
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmNotifId(n.id)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition shrink-0"
                                title="हटाएं"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. UPLOAD PAST GALLERY ITEM */}
                {activeTab === 'upload_gallery' && (
                  <div className="flex flex-col gap-4 text-xs text-slate-700">
                    {/* Shringar Sub-tabs Selection */}
                    <div className="flex bg-amber-50/40 p-1 rounded-xl border border-amber-100/50">
                      <button
                        type="button"
                        onClick={() => setShringarTabMode('today')}
                        className={`flex-1 py-2 text-center rounded-lg font-bold text-[13px] transition duration-300 ${
                          shringarTabMode === 'today'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-amber-800 hover:bg-amber-50/80'
                        }`}
                      >
                        भोलेनाथ के श्रृंगार दर्शन
                      </button>
                      <button
                        type="button"
                        onClick={() => setShringarTabMode('gallery')}
                        className={`flex-1 py-2 text-center rounded-lg font-bold text-[13px] transition duration-300 ${
                          shringarTabMode === 'gallery'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-amber-800 hover:bg-amber-50/80'
                        }`}
                      >
                        श्रृंगार दर्शन गैलरी में जोड़ें
                      </button>
                    </div>

                    {shringarTabMode === 'today' ? (
                      /* A. UPDATE TODAY'S DARSHAN FORM */
                      <div className="bg-amber-50/60 border border-amber-200/60 p-4 rounded-2xl flex flex-col gap-4">
                        <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>मुख्य पृष्ठ का दैनिक श्रृंगार दर्शन बदलें</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {/* Date */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">दिनांक (Date):</label>
                            <input
                              type="date"
                              value={todayDate}
                              onChange={(e) => setTodayDate(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>

                           {/* Festival */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">विशेष पर्व/शृंगार नाम (Festival):</label>
                            <input
                              type="text"
                              value={todayFestival}
                              onChange={(e) => setTodayFestival(e.target.value)}
                              placeholder="उदा. सावन सोमवार, प्रदोष व्रत श्रृंगार"
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-xs font-bold text-amber-900 mb-1">दर्शन का भक्तिमय विवरण (Description):</label>
                          <textarea
                            value={todayDesc}
                            onChange={(e) => setTodayDesc(e.target.value)}
                            placeholder="आज के दिव्य श्रृंगार दर्शन का वर्णन लिखें..."
                            rows={5}
                            className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none resize-none"
                          />
                        </div>

                        {/* Image Source Input (Link Only) */}
                        <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-200/40">
                          <label className="block text-xs font-bold text-amber-900 mb-1.5">आज का दर्शन चित्र (Image Selection):</label>
                          
                          <div className="flex flex-col gap-2">
                            {/* Link Paste - Highly Recommended */}
                            <div>
                              <span className="block text-[11px] font-black text-amber-800 mb-1 uppercase tracking-wider">🔗 चित्र का सीधा लिंक डालें:</span>
                              <input
                                type="text"
                                value={todayImage}
                                onChange={(e) => setTodayImage(e.target.value)}
                                placeholder="https://example.com/image.jpg (यहाँ चित्र का सीधा लिंक पेस्ट करें)"
                                className="w-full px-3 py-2 bg-white border border-amber-200/80 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Submit */}
                        <button
                          onClick={handleSaveTodayDarshan}
                          className="self-end px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow transition"
                        >
                          {todaySuccess ? (
                            <span className="flex items-center gap-1"><Check className="w-4 h-4" /> मुख्य पृष्ठ पर बदल गया!</span>
                          ) : (
                            <span>दैनिक दर्शन अपडेट करें</span>
                          )}
                        </button>
                      </div>
                    ) : (
                      /* B. UPLOAD PAST GALLERY ITEM FORM */
                      <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl flex flex-col gap-4">
                        <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1">
                          <Upload className="w-4 h-4 text-amber-600" />
                          <span>गैलरी में श्रृंगार दर्शन जोड़ें</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                           {/* Date */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">दिनांक (Date):</label>
                            <input
                              type="date"
                              value={galDate}
                              onChange={(e) => setGalDate(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>

                           {/* Festival */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">विशेष पर्व/शृंगार नाम (Festival):</label>
                            <input
                              type="text"
                              value={galFestival}
                              onChange={(e) => setGalFestival(e.target.value)}
                              placeholder="उदा. प्रदोष व्रत विशेष, सावन सोमवार..."
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>

                           {/* Order */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">क्रम संख्या (Order):</label>
                            <input
                              type="number"
                              value={galOrder}
                              onChange={(e) => setGalOrder(Number(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-xs font-bold text-amber-900 mb-1">दर्शन का भक्तिमय विवरण (Description):</label>
                          <textarea
                            value={galDesc}
                            onChange={(e) => setGalDesc(e.target.value)}
                            placeholder="महादेव के इस अलौकिक शृंगार का वर्णन करें..."
                            rows={5}
                            className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none resize-none"
                          />
                        </div>

                        {/* Image Source Input (Link Only) */}
                        <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-200/40">
                          <label className="block text-xs font-bold text-amber-900 mb-1.5">दर्शन चित्र (Image Selection):</label>
                          
                          <div className="flex flex-col gap-2">
                            {/* Link Paste - Highly Recommended */}
                            <div>
                              <span className="block text-[11px] font-black text-amber-800 mb-1 uppercase tracking-wider">🔗 चित्र का सीधा लिंक डालें:</span>
                              <input
                                type="text"
                                value={galImage}
                                onChange={(e) => setGalImage(e.target.value)}
                                placeholder="https://example.com/image.jpg (यहाँ चित्र का सीधा लिंक पेस्ट करें)"
                                className="w-full px-3 py-2 bg-white border border-amber-200/80 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Submit */}
                        <button
                          onClick={handleSaveGalleryItem}
                          className="self-end px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow transition"
                        >
                          {galSuccess ? (
                            <span className="flex items-center gap-1"><Check className="w-4 h-4" /> गैलरी में जुड़ गया!</span>
                          ) : (
                            <span>गैलरी में जोड़े</span>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Preview box */}
                    {((shringarTabMode === 'today' && todayImage) || (shringarTabMode === 'gallery' && galImage)) && (
                      <div className="mt-2 flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 font-bold">चित्र पूर्वावलोकन (Preview):</span>
                        <img 
                          src={shringarTabMode === 'today' ? todayImage : galImage} 
                          alt="preview" 
                          className="w-40 h-32 object-cover rounded-xl mt-1 border border-slate-200 shadow-sm"
                        />
                      </div>
                    )}

                    {/* List of uploaded Shringar images with update/delete options */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h4 className="text-sm font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-100" />
                        <span>अपलोड किए गए श्रृंगार चित्र प्रबंधन ({galList.length})</span>
                      </h4>

                      <div className="max-h-72 overflow-y-auto flex flex-col gap-3 pr-1">
                        {galList.map((item, index) => {
                          const isCurrentlyEditing = editingGalId === item.id;

                          return (
                            <div 
                              key={item.id}
                              className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col gap-3 text-left"
                            >
                              {isCurrentlyEditing ? (
                                /* Inline Editing State */
                                <div className="flex flex-col gap-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 mb-0.5">दिनांक:</label>
                                      <input
                                        type="date"
                                        value={editGalDate}
                                        onChange={(e) => setEditGalDate(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 mb-0.5">विशेष पर्व/शृंगार नाम:</label>
                                      <input
                                        type="text"
                                        value={editGalFestival}
                                        onChange={(e) => setEditGalFestival(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 mb-0.5">क्रम संख्या (Order):</label>
                                      <input
                                        type="number"
                                        value={editGalOrder}
                                        onChange={(e) => setEditGalOrder(Number(e.target.value) || 0)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none font-bold"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">दर्शन का विवरण:</label>
                                    <textarea
                                      value={editGalDesc}
                                      onChange={(e) => setEditGalDesc(e.target.value)}
                                      rows={5}
                                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none resize-none"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">चित्र अपलोड/URL:</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="file"
                                        onChange={handleEditGalImageUpload}
                                        accept="image/*"
                                        className="text-[10px]"
                                      />
                                      {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500 shrink-0" />}
                                    </div>
                                    <input
                                      type="text"
                                      value={editGalImage}
                                      onChange={(e) => setEditGalImage(e.target.value)}
                                      placeholder="चित्र का सीधा URL"
                                      className="w-full px-2 py-1 mt-1 bg-white border border-slate-100 rounded-lg text-xs"
                                    />
                                  </div>

                                  <div className="flex justify-end gap-2 mt-1">
                                    <button
                                      onClick={handleCancelEditGal}
                                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-[10px] transition"
                                    >
                                      रद्द करें
                                    </button>
                                    <button
                                      onClick={handleSaveEditGal}
                                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-[10px] transition"
                                    >
                                      सहेजें
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* View/Read State with Edit/Delete Buttons */
                                <div className="flex items-start gap-3">
                                  <img 
                                    src={item.imageUrl} 
                                    alt="thumbnail" 
                                    className="w-16 h-16 object-cover rounded-xl border border-slate-200/50 shadow-sm shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                                        {formatDateDMY(item.date)}
                                      </span>
                                      <span className="font-bold text-slate-800 text-xs truncate">
                                        {item.festivalName || "दैनिक श्रृंगार दर्शन"}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                      {item.description}
                                    </p>
                                  </div>

                                  {deleteConfirmGalId === item.id ? (
                                    <div className="flex items-center gap-1.5 shrink-0 bg-rose-50 border border-rose-100 p-1 rounded-xl">
                                      <span className="text-[9px] text-rose-600 font-bold px-1 select-none">हटाएं?</span>
                                      <button
                                        onClick={() => {
                                          handleDeleteGal(item.id);
                                          setDeleteConfirmGalId(null);
                                        }}
                                        className="px-2 py-1 bg-rose-500 text-white font-extrabold text-[9px] rounded-lg shadow-sm hover:bg-rose-600 transition"
                                      >
                                        हाँ
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmGalId(null)}
                                        className="px-2 py-1 bg-slate-200 text-slate-700 font-extrabold text-[9px] rounded-lg hover:bg-slate-300 transition"
                                      >
                                        नहीं
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 shrink-0 bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/40">
                                      <button
                                        onClick={() => handleMoveGallery(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-[11px] text-slate-500 hover:text-amber-600 hover:bg-white rounded transition disabled:opacity-30 disabled:hover:bg-transparent"
                                        title="ऊपर ले जाएं"
                                      >
                                        ▲
                                      </button>
                                      <button
                                        onClick={() => handleMoveGallery(index, 'down')}
                                        disabled={index === galList.length - 1}
                                        className="p-1 text-[11px] text-slate-500 hover:text-amber-600 hover:bg-white rounded transition disabled:opacity-30 disabled:hover:bg-transparent"
                                        title="नीचे ले जाएं"
                                      >
                                        ▼
                                      </button>
                                      <span className="w-px h-3.5 bg-slate-200 mx-1"></span>
                                      <button
                                        onClick={() => handleStartEditGal(item)}
                                        className="p-1 text-slate-500 hover:text-amber-600 hover:bg-white rounded transition"
                                        title="संपादित करें"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmGalId(item.id)}
                                        className="p-1 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition"
                                        title="हटाएं"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'upload_video' && (
                  <div className="flex flex-col gap-4 text-xs text-slate-700">
                    {/* Video Sub-tabs Selection */}
                    <div className="flex bg-amber-50/40 p-1 rounded-xl border border-amber-100/50">
                      <button
                        type="button"
                        onClick={() => setVideoTabMode('today')}
                        className={`flex-1 py-2 text-center rounded-lg font-bold text-[13px] transition duration-300 ${
                          videoTabMode === 'today'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-amber-800 hover:bg-amber-50/80'
                        }`}
                      >
                        मुख्य आरती वीडियो
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoTabMode('gallery')}
                        className={`flex-1 py-2 text-center rounded-lg font-bold text-[13px] transition duration-300 ${
                          videoTabMode === 'gallery'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-amber-800 hover:bg-amber-50/80'
                        }`}
                      >
                        आरती वीडियो गैलरी में जोड़ें
                      </button>
                    </div>

                    {videoTabMode === 'today' ? (
                      /* A. UPDATE TODAY'S VIDEO FORM */
                      <div className="bg-amber-50/60 border border-amber-200/60 p-4 rounded-2xl flex flex-col gap-4">
                        <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1">
                          <Youtube className="w-4 h-4 text-red-600 fill-red-100" />
                          <span>मुख्य पृष्ठ का दैनिक आरती वीडियो बदलें</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {/* Date */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">दिनांक (Date):</label>
                            <input
                              type="date"
                              value={videoTodayDate}
                              onChange={(e) => setVideoTodayDate(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>

                           {/* Title */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">वीडियो का शीर्षक/नाम:</label>
                            <input
                              type="text"
                              value={videoTodayTitle}
                              onChange={(e) => setVideoTodayTitle(e.target.value)}
                              placeholder="उदा. संध्या महा आरती एवं दीपमालिका दर्शन"
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* YouTube URL */}
                        <div>
                          <label className="block text-xs font-bold text-amber-900 mb-1">यूट्यूब वीडियो लिंक (YouTube Link):</label>
                          <input
                            type="text"
                            value={videoTodayUrl}
                            onChange={(e) => setVideoTodayUrl(e.target.value)}
                            placeholder="उदा. https://www.youtube.com/watch?v=... या https://youtu.be/..."
                            className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        {/* Submit */}
                        <button
                          onClick={handleSaveTodayVideo}
                          className="self-end px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow transition"
                        >
                          {videoTodaySuccess ? (
                            <span className="flex items-center gap-1"><Check className="w-4 h-4" /> मुख्य पृष्ठ पर बदल गया!</span>
                          ) : (
                            <span>दैनिक वीडियो अपडेट करें</span>
                          )}
                        </button>
                      </div>
                    ) : (
                      /* B. UPLOAD PAST VIDEO FORM */
                      <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl flex flex-col gap-4">
                        <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1">
                          <Plus className="w-4 h-4 text-amber-600" />
                          <span>आरती वीडियो गैलरी में जोड़ें</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {/* Date */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">दिनांक (Date):</label>
                            <input
                              type="date"
                              value={videoGalDate}
                              onChange={(e) => setVideoGalDate(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>

                           {/* Title */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">वीडियो का शीर्षक/नाम:</label>
                            <input
                              type="text"
                              value={videoGalTitle}
                              onChange={(e) => setVideoGalTitle(e.target.value)}
                              placeholder="उदा. सावन सोमवार महाआरती दर्शन"
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* YouTube URL */}
                        <div>
                          <label className="block text-xs font-bold text-amber-900 mb-1">यूट्यूब वीडियो लिंक (YouTube Link):</label>
                          <input
                            type="text"
                            value={videoGalUrl}
                            onChange={(e) => setVideoGalUrl(e.target.value)}
                            placeholder="उदा. https://www.youtube.com/watch?v=... या https://youtu.be/..."
                            className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        {/* Submit */}
                        <button
                          onClick={handleSaveGalleryVideo}
                          className="self-end px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow transition"
                        >
                          {videoGalSuccess ? (
                            <span className="flex items-center gap-1"><Check className="w-4 h-4" /> गैलरी में जुड़ गया!</span>
                          ) : (
                            <span>गैलरी में जोड़े</span>
                          )}
                        </button>
                      </div>
                    )}

                    {/* List of uploaded Videos with update/delete options */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h4 className="text-sm font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-1.5">
                        <Youtube className="w-3.5 h-3.5 text-amber-500 fill-amber-100" />
                        <span>अपलोड किए गए आरती वीडियो प्रबंधन ({videoList.length})</span>
                      </h4>

                      <div className="max-h-72 overflow-y-auto flex flex-col gap-3 pr-1">
                        {videoList.map(item => {
                          const isCurrentlyEditing = editingVideoId === item.id;
                          const youtubeIdMatch = item.youtubeUrl?.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
                          const youtubeId = (youtubeIdMatch && youtubeIdMatch[2].length === 11) ? youtubeIdMatch[2] : null;
                          const thumbUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/0.jpg` : null;

                          return (
                            <div 
                              key={item.id}
                              className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col gap-3 text-left"
                            >
                              {isCurrentlyEditing ? (
                                /* Inline Editing State */
                                <div className="flex flex-col gap-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 mb-0.5">दिनांक:</label>
                                      <input
                                        type="date"
                                        value={editVideoDate}
                                        onChange={(e) => setEditVideoDate(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 mb-0.5">वीडियो शीर्षक:</label>
                                      <input
                                        type="text"
                                        value={editVideoTitle}
                                        onChange={(e) => setEditVideoTitle(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">यूट्यूब वीडियो लिंक (YouTube Link):</label>
                                    <input
                                      type="text"
                                      value={editVideoUrl}
                                      onChange={(e) => setEditVideoUrl(e.target.value)}
                                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                                    />
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="checkbox"
                                      id={`isToday-${item.id}`}
                                      checked={editVideoIsToday}
                                      onChange={(e) => setEditVideoIsToday(e.target.checked)}
                                      className="w-3.5 h-3.5 accent-amber-500 rounded"
                                    />
                                    <label htmlFor={`isToday-${item.id}`} className="text-[10px] font-bold text-slate-600 cursor-pointer">
                                      मुख्य आरती वीडियो बनाएं (Make this today's video)
                                    </label>
                                  </div>

                                  <div className="flex justify-end gap-2 mt-1">
                                    <button
                                      onClick={handleCancelEditVideo}
                                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-[10px] transition"
                                    >
                                      रद्द करें
                                    </button>
                                    <button
                                      onClick={handleSaveEditVideo}
                                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-[10px] transition"
                                    >
                                      सहेजें
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* View/Read State with Edit/Delete Buttons */
                                <div className="flex items-start gap-3">
                                  {thumbUrl ? (
                                    <img 
                                      src={thumbUrl} 
                                      alt="thumbnail" 
                                      className="w-16 h-12 object-cover rounded-lg border border-slate-200/50 shadow-sm shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-16 h-12 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                                      <Youtube className="w-5 h-5 text-red-500" />
                                    </div>
                                  )}
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                                        {formatDateDMY(item.date)}
                                      </span>
                                      {item.isToday && (
                                        <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-extrabold flex items-center gap-0.5 animate-pulse">
                                          ★ मुख्य वीडियो
                                        </span>
                                      )}
                                      <span className="font-bold text-slate-800 text-xs truncate">
                                        {item.title || "आरती दर्शन वीडियो"}
                                      </span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 mt-1 truncate">
                                      {item.youtubeUrl}
                                    </p>
                                  </div>

                                  {deleteConfirmVideoId === item.id ? (
                                    <div className="flex items-center gap-1.5 shrink-0 bg-rose-50 border border-rose-100 p-1 rounded-xl">
                                      <span className="text-[9px] text-rose-600 font-bold px-1 select-none">हटाएं?</span>
                                      <button
                                        onClick={() => {
                                          handleDeleteVideo(item.id);
                                          setDeleteConfirmVideoId(null);
                                        }}
                                        className="px-2 py-1 bg-rose-500 text-white font-extrabold text-[9px] rounded-lg shadow-sm hover:bg-rose-600 transition"
                                      >
                                        हाँ
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmVideoId(null)}
                                        className="px-2 py-1 bg-slate-200 text-slate-700 font-extrabold text-[9px] rounded-lg hover:bg-slate-300 transition"
                                      >
                                        नहीं
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => handleStartEditVideo(item)}
                                        className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition"
                                        title="संपादित करें"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmVideoId(item.id)}
                                        className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-lg transition"
                                        title="हटाएं"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'temple_settings' && (
                  <TempleSettingsTab />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-sky-50 text-center text-[10px] font-bold text-slate-400 shrink-0 flex items-center justify-center gap-1 select-none">
          <Database className="w-3 h-3 text-sky-400" />
          <span>श्री मंसा महादेव मंदिर • TITRARDI, UDAIPUR © 2026</span>
        </div>
      </motion.div>
    </div>
  );
}
