import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { db, subscribeToDBUpdates } from '../lib/db';
import { NotificationItem, GalleryItem } from '../types';
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
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(db.isAdminLoggedIn());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'notifications' | 'upload_gallery'>('overview');

  // Stats State
  const [stats, setStats] = useState({
    galleryCount: 0,
    videoCount: 0,
    bhajanCount: 0,
    notificationCount: 0,
  });

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

  useEffect(() => {
    setIsLoggedIn(db.isAdminLoggedIn());
    loadDashboardData();

    const unsubscribe = subscribeToDBUpdates(() => {
      setIsLoggedIn(db.isAdminLoggedIn());
      loadDashboardData();
    });
    return unsubscribe;
  }, []);

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
    if (confirm("क्या आप वाकई इस घोषणा को हटाना चाहते हैं?")) {
      db.deleteNotification(id);
    }
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
      description: galDesc.trim() || "मंसा महादेव का अलौकिक दर्शन।"
    });

    setGalSuccess(true);
    setTimeout(() => {
      setGalSuccess(false);
      setGalFestival('');
      setGalDesc('');
      setGalImage('');
    }, 1500);
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
            <h2 className="text-md md:text-lg font-extrabold tracking-wide text-slate-800">
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
                  <span>विगत गैलरी अपलोड</span>
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
                        <li>आज का श्रृंगार दर्शन: "श्रृंगार बदलें" बटन पर क्लिक करके बदलें।</li>
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
                                <span className="text-[9px] text-slate-400 font-mono">({n.date})</span>
                              </div>
                              <p className="text-slate-500 mt-1 pl-3.5 leading-relaxed">{n.message}</p>
                            </div>

                            <button
                              onClick={() => handleDeleteNotification(n.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                              title="हटाएं"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. UPLOAD PAST GALLERY ITEM */}
                {activeTab === 'upload_gallery' && (
                  <div className="flex flex-col gap-4 text-xs text-slate-700">
                    <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl flex flex-col gap-4">
                      <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1">
                        <Upload className="w-4 h-4 text-amber-600" />
                        <span>गैलरी में विगत श्रृंगार दर्शन जोड़ें (ImageKit)</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Date */}
                        <div>
                          <label className="block text-[10px] font-bold text-amber-900 mb-1">दिनांक (Date):</label>
                          <input
                            type="date"
                            value={galDate}
                            onChange={(e) => setGalDate(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        {/* Festival */}
                        <div>
                          <label className="block text-[10px] font-bold text-amber-900 mb-1">विशेष पर्व/शृंगार नाम (Festival):</label>
                          <input
                            type="text"
                            value={galFestival}
                            onChange={(e) => setGalFestival(e.target.value)}
                            placeholder="उदा. प्रदोष व्रत विशेष, सावन सोमवार..."
                            className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-[10px] font-bold text-amber-900 mb-1">दर्शन का भक्तिमय विवरण (Description):</label>
                        <textarea
                          value={galDesc}
                          onChange={(e) => setGalDesc(e.target.value)}
                          placeholder="महादेव के इस अलौकिक शृंगार का वर्णन करें..."
                          rows={2}
                          className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none resize-none"
                        />
                      </div>

                      {/* Image Kit Upload trigger */}
                      <div>
                        <label className="block text-[10px] font-bold text-amber-900 mb-1">दर्शन चित्र अपलोड (Image File):</label>
                        <div className="flex gap-2">
                          <input
                            type="file"
                            onChange={handleGalleryImageUpload}
                            accept="image/*"
                            className="text-xs"
                          />
                          {uploading && <Loader2 className="w-4 h-4 animate-spin text-amber-500 shrink-0" />}
                        </div>
                        {/* URL paste */}
                        <input
                          type="text"
                          value={galImage}
                          onChange={(e) => setGalImage(e.target.value)}
                          placeholder="या सीधा चित्र का URL यहाँ डालें"
                          className="w-full px-3 py-1.5 mt-2 bg-white border border-amber-100 rounded-xl"
                        />
                      </div>

                      {/* Submit */}
                      <button
                        onClick={handleSaveGalleryItem}
                        disabled={uploading}
                        className="self-end px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-slate-950 font-black rounded-xl shadow transition"
                      >
                        {galSuccess ? (
                          <span className="flex items-center gap-1"><Check className="w-4 h-4" /> गैलरी में जुड़ गया!</span>
                        ) : (
                          <span>गैलरी में जोड़े</span>
                        )}
                      </button>
                    </div>

                    {/* Preview box */}
                    {galImage && (
                      <div className="mt-2 flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 font-bold">चित्र पूर्वावलोकन (Preview):</span>
                        <img 
                          src={galImage} 
                          alt="preview" 
                          className="w-40 h-32 object-cover rounded-xl mt-1 border border-slate-200 shadow-sm"
                        />
                      </div>
                    )}
                  </div>
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
