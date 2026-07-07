import { useState, useEffect } from 'react';
import { db, subscribeToDBUpdates } from '../lib/db';
import { TempleInfo, TempleTiming, TempleSettings } from '../types';
import { subscribeToTempleSettings, getCachedTempleSettings } from '../lib/settings';
import { 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare, 
  Map, 
  Info, 
  BookOpen, 
  Sparkles, 
  Edit2, 
  Check, 
  CheckCircle,
  Clock3,
  ExternalLink,
  User
} from 'lucide-react';
import { motion } from 'motion/react';

export default function TempleInfoSection() {
  const [info, setInfo] = useState<TempleInfo | null>(null);
  const [timings, setTimings] = useState<TempleTiming[]>([]);
  const [activeTab, setActiveTab] = useState<'timings' | 'about' | 'contact'>('timings');
  const [isAdmin, setIsAdmin] = useState(db.isAdminLoggedIn());

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editAbout, setEditAbout] = useState('');
  const [editHistory, setEditHistory] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWhatsApp, setEditWhatsApp] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editMapLink, setEditMapLink] = useState('');
  
  const [editedTimings, setEditedTimings] = useState<TempleTiming[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState<TempleSettings>(getCachedTempleSettings());

  useEffect(() => {
    setInfo(db.getTempleInfo());
    setTimings(db.getTempleTimings());
    setIsAdmin(db.isAdminLoggedIn());

    const unsubscribe = subscribeToDBUpdates(() => {
      setInfo(db.getTempleInfo());
      setTimings(db.getTempleTimings());
      setIsAdmin(db.isAdminLoggedIn());
    });

    const unsubSettings = subscribeToTempleSettings((fetched) => {
      setSettings(fetched);
    });

    return () => {
      unsubscribe();
      unsubSettings();
    };
  }, []);

  const handleStartEdit = () => {
    if (!info) return;
    setEditAbout(info.about);
    setEditHistory(info.history);
    setEditPhone(info.contact.phone);
    setEditEmail(info.contact.email);
    setEditWhatsApp(info.contact.whatsApp);
    setEditAddress(info.contact.address);
    setEditMapLink(info.contact.googleMapsLink);
    setEditedTimings(JSON.parse(JSON.stringify(timings))); // Deep copy
    setIsEditing(true);
  };

  const handleTimingChange = (id: string, field: 'time' | 'event', val: string) => {
    setEditedTimings(prev => 
      prev.map(t => t.id === id ? { ...t, [field]: val } : t)
    );
  };

  const handleSaveInfo = () => {
    if (!info) return;

    // Update Temple Info
    db.updateTempleInfo({
      about: editAbout.trim(),
      history: editHistory.trim(),
      contact: {
        phone: editPhone.trim(),
        email: editEmail.trim(),
        whatsApp: editWhatsApp.trim(),
        address: editAddress.trim(),
        googleMapsLink: editMapLink.trim()
      }
    });

    // Update Temple Timings
    editedTimings.forEach(t => {
      db.updateTempleTiming(t.id, {
        event: t.event,
        time: t.time
      });
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 1500);
  };

  if (!info) return null;

  const displayAbout = settings.aboutTemple || info.about;
  const displayHistory = settings.templeHistory || info.history;
  const displayPhone = settings.phone || info.contact.phone;
  const displayEmail = settings.email || info.contact.email;
  const displayWhatsApp = settings.whatsApp || info.contact.whatsApp;
  const displayAddress = settings.templeAddress || info.contact.address;
  const displayMapLink = settings.googleMapsLink || info.contact.googleMapsLink;

  const displayTimings = timings.map(t => {
    if (t.id === "1") {
      return { ...t, time: settings.timingPatKhulna || settings.morningDarshanTime || t.time };
    }
    if (t.id === "2") {
      return { ...t, time: settings.timingMangalaAarti || t.time };
    }
    if (t.id === "3") {
      return { ...t, time: settings.timingJalabhishek || t.time };
    }
    if (t.id === "4") {
      return { ...t, time: settings.timingNoonClosing || t.time };
    }
    if (t.id === "5") {
      return { ...t, time: settings.timingEveningOpening || settings.eveningDarshanTime || t.time };
    }
    if (t.id === "6") {
      return { ...t, time: settings.timingSandhyaAarti || t.time };
    }
    if (t.id === "7") {
      return { ...t, time: settings.timingShayanAarti || t.time };
    }
    return t;
  });

  return (
    <section id="temple-info" className="w-full max-w-4xl mx-auto px-4">
      
      {/* Title Header Row */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[22px] md:text-[26px] font-black text-amber-950 flex items-center gap-2">
          <Info className="w-5 h-5 text-sky-500 fill-sky-100" />
          <span>मंदिर परिचय एवं समय सारणी</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-600">सम्पर्क सूत्र</span>
        </h2>
      </div>

      {/* ADMIN INLINE INFORMATION EDITOR */}
      {isAdmin && isEditing && (
        <div className="mb-6 bg-sky-50/90 border border-sky-200/50 p-4 rounded-3xl shadow-inner text-slate-800 text-xs">
          <h3 className="text-sm font-bold text-sky-800 mb-3 flex items-center gap-1.5">
            <Edit2 className="w-4 h-4 text-sky-600" />
            <span>मंदिर की जानकारी संपादित करें</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: textfields about and history */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] font-bold text-sky-900 mb-1">मंदिर के बारे में (About):</label>
                <textarea
                  value={editAbout}
                  onChange={(e) => setEditAbout(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-sky-100 rounded-xl focus:ring-1 focus:ring-sky-500 text-slate-700 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-sky-900 mb-1">मंदिर का इतिहास (History):</label>
                <textarea
                  value={editHistory}
                  onChange={(e) => setEditHistory(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-sky-100 rounded-xl focus:ring-1 focus:ring-sky-500 text-slate-700 resize-none"
                />
              </div>

              {/* Contacts */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-sky-900 mb-0.5">फ़ोन नंबर:</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-sky-100 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-sky-900 mb-0.5">व्हाट्सएप:</label>
                  <input
                    type="text"
                    value={editWhatsApp}
                    onChange={(e) => setEditWhatsApp(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-sky-100 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-sky-900 mb-0.5">ईमेल:</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-sky-100 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-sky-900 mb-0.5">नक्शा लिंक (Maps):</label>
                  <input
                    type="text"
                    value={editMapLink}
                    onChange={(e) => setEditMapLink(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-sky-100 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-sky-900 mb-1">पता (Address):</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-sky-100 rounded-xl"
                />
              </div>
            </div>

            {/* Right Column: editing timings */}
            <div className="flex flex-col gap-3 justify-between">
              <div>
                <label className="block text-[10px] font-bold text-sky-900 mb-2">समय सारणी (Temple Timings):</label>
                <div className="max-h-[220px] overflow-y-auto flex flex-col gap-2 border border-sky-100 p-2 rounded-2xl bg-white/50">
                  {editedTimings.map(t => (
                    <div key={t.id} className="grid grid-cols-2 gap-2 items-center bg-white p-2 rounded-xl shadow-sm border border-sky-50">
                      <span className="font-bold text-[10px] text-slate-500 truncate">{t.event}</span>
                      <input
                        type="text"
                        value={t.time}
                        onChange={(e) => handleTimingChange(t.id, 'time', e.target.value)}
                        className="px-2 py-1 border border-sky-100 rounded text-[11px] text-right"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-sky-100">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-xl transition"
                >
                  रद्द करें
                </button>
                <button
                  onClick={handleSaveInfo}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 rounded-xl shadow flex items-center justify-center gap-1 transition"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>अद्यतित हो गया!</span>
                    </>
                  ) : (
                    <span>जानकारी सुरक्षित करें</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tabbed Glassmorphism Layout */}
      <div className="w-full bg-gradient-to-br from-amber-50 to-orange-50/90 border-2 border-amber-200 rounded-3xl shadow-xl shadow-amber-100/40 overflow-hidden">
        
        {/* Navigation Tab Header Row */}
        <div className="flex flex-wrap md:flex-nowrap gap-3 p-4 justify-center border-b border-amber-200/60 bg-amber-100/20 select-none">
          <button
            onClick={() => setActiveTab('timings')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-full transition-all duration-200 hover:scale-[1.02] cursor-pointer text-base font-black tracking-wider ${
              activeTab === 'timings' 
                ? 'bg-amber-100 border-2 border-amber-500 text-amber-950 shadow-md' 
                : 'bg-white hover:bg-amber-100/50 border-2 border-amber-300 hover:border-amber-400 text-amber-950 shadow-sm'
            }`}
          >
            <Clock3 className="w-4 h-4 text-amber-800" />
            <span>आरती एवं पट समय</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-full transition-all duration-200 hover:scale-[1.02] cursor-pointer text-base font-black tracking-wider ${
              activeTab === 'about' 
                ? 'bg-amber-100 border-2 border-amber-500 text-amber-950 shadow-md' 
                : 'bg-white hover:bg-amber-100/50 border-2 border-amber-300 hover:border-amber-400 text-amber-950 shadow-sm'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-800" />
            <span>इतिहास एवं परिचय</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-full transition-all duration-200 hover:scale-[1.02] cursor-pointer text-base font-black tracking-wider ${
              activeTab === 'contact' 
                ? 'bg-amber-100 border-2 border-amber-500 text-amber-950 shadow-md' 
                : 'bg-white hover:bg-amber-100/50 border-2 border-amber-300 hover:border-amber-400 text-amber-950 shadow-sm'
            }`}
          >
            <MapPin className="w-4 h-4 text-amber-800" />
            <span>स्थान एवं संपर्क</span>
          </button>
        </div>

        {/* Tab Contents Frame */}
        <div className="p-6 md:p-8">
          
          {/* 1. TIMINGS VIEW */}
          {activeTab === 'timings' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-lg md:text-xl font-bold text-amber-700 bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl self-start">
                <Clock className="w-4 h-4" />
                <span>नित्य दर्शन समय सारणी (दैनिक)</span>
              </div>

              {/* Timings List */}
              <div className="flex flex-col gap-2.5">
                {displayTimings.map(item => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3.5 bg-white/60 hover:bg-white rounded-2xl border border-sky-100/50 shadow-sm transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-xs md:text-sm font-bold text-slate-800">{item.event}</p>
                        {item.description && <p className="text-[10px] text-slate-400 font-medium">{item.description}</p>}
                      </div>
                    </div>

                    <span className="font-mono font-black text-xs md:text-sm text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-lg">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. ABOUT & HISTORY VIEW */}
          {activeTab === 'about' && (
            <div className="flex flex-col gap-6 text-slate-600 font-medium">
              
              {/* About description */}
              <div className="flex flex-col gap-2">
                <h3 className="text-lg md:text-xl font-bold text-orange-600 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 fill-current" />
                  <span>मंदिर परिचय</span>
                </h3>
                <p className="text-xl md:text-2xl leading-relaxed text-justify bg-white/40 p-4 rounded-2xl border border-sky-100/30 whitespace-pre-wrap">
                  {displayAbout}
                </p>
              </div>

              {/* History details */}
              <div className="flex flex-col gap-2">
                <h3 className="text-lg md:text-xl font-bold text-orange-600 flex items-center gap-1.5">
                  <BookOpen className="w-5 h-5" />
                  <span>धार्मिक मान्यता एवं इतिहास</span>
                </h3>
                <p className="text-xl md:text-2xl leading-relaxed text-justify bg-white/40 p-4 rounded-2xl border border-sky-100/30 whitespace-pre-wrap">
                  {displayHistory}
                </p>
              </div>
            </div>
          )}

          {/* 3. CONTACT & LOCATION DIRECTIONS VIEW */}
          {activeTab === 'contact' && (
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* Left hand details list */}
              <div className="flex-1 flex flex-col gap-4">

                {/* Contact Person Card */}
                {settings.contactPerson && (
                  <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                    <p className="text-[16px] font-bold text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <User className="w-4 h-4 text-amber-500" />
                      <span>मुख्य संपर्क व्यक्ति</span>
                    </p>
                    <p className="text-lg md:text-xl font-normal text-slate-700">
                      {settings.contactPerson}
                    </p>
                  </div>
                )}
                
                {/* Physical address card */}
                <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100/50">
                  <p className="text-[16px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span>मंदिर का मुख्य पता</span>
                  </p>
                  <p className="text-lg md:text-xl font-normal text-slate-700">
                    {displayAddress}
                  </p>
                </div>

                {/* Direct Action triggers row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Dial Phone Button */}
                  <a
                    href={`tel:${displayPhone}`}
                    className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white border border-sky-100 hover:border-sky-300 transition text-slate-700"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-slate-500 uppercase">फ़ोन संपर्क</p>
                      <p className="text-lg font-normal font-mono">{displayPhone}</p>
                    </div>
                  </a>

                  {/* Direct WhatsApp trigger */}
                  <a
                    href={`https://wa.me/91${displayWhatsApp}?text=जय+मंसा+महादेव+जी+मंगला+दर्शन+आरती+की+जानकारी+चाहिए।`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white border border-sky-100 hover:border-sky-300 transition text-slate-700"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-slate-500 uppercase">व्हाट्सएप संपर्क</p>
                      <p className="text-lg font-normal font-mono">चैट शुरू करें</p>
                    </div>
                  </a>

                  {/* Direct Email trigger */}
                  <a
                    href={`mailto:${displayEmail}`}
                    className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white border border-sky-100 hover:border-sky-300 transition text-slate-700"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-slate-500 uppercase">ईमेल आईडी</p>
                      <p className="text-lg font-normal font-mono truncate max-w-[220px]">{displayEmail}</p>
                    </div>
                  </a>

                  {/* Google maps link button */}
                  <a
                    href={displayMapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow hover:scale-101 transition"
                  >
                    <div className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
                      <Map className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-amber-100 uppercase">नेविगेशन रूट</p>
                      <p className="text-sm font-black flex items-center gap-0.5">नक्शा खोलें <ExternalLink className="w-3 h-3" /></p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Right Hand Embedded/Responsive Google Maps Iframe simulation */}
              <div className="w-full md:w-80 aspect-video md:aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-sky-100 relative group shrink-0">
                <iframe
                  title="Mansa Mahadev Google Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3629.418296181792!2d73.7291114!3d24.5401344!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3967e54f9a0c3ff5%3A0xc391b156b820980c!2sTitrardi%2C%20Udaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-500"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                
                {/* Floating Map directions badge */}
                <a
                  href={displayMapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 right-3 bg-black/80 hover:bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md backdrop-blur-sm transition"
                >
                  <MapPin className="w-3 h-3 text-red-500 fill-current" />
                  <span>दिशानिर्देश (Directions)</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
