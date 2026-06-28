import { useState } from 'react';
import Header from './components/Header';
import NotificationBanner from './components/NotificationBanner';
import TodayDarshan from './components/TodayDarshan';
import TodayVideo from './components/TodayVideo';
import AartiSection from './components/AartiSection';
import BhajanSection from './components/BhajanSection';
import GallerySection from './components/GallerySection';
import TempleInfoSection from './components/TempleInfoSection';
import AdminPanel from './components/AdminPanel';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#e3f2fd] via-[#f7f9fc] to-[#e3f2fd] text-slate-800 font-sans selection:bg-amber-200 selection:text-amber-950 pb-16 overflow-x-hidden">
      
      {/* Decorative Aura Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-sky-400/5 via-sky-300/2 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-[30%] left-[-10%] w-72 h-72 bg-amber-400/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-96 h-96 bg-sky-400/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* 1. Header Section */}
      <Header onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* 2. Notification Announcements Ticker */}
      <NotificationBanner />

      {/* 3. Main Multi-Module Content Stack */}
      <main className="w-full relative z-10 flex flex-col gap-8 mt-2">
        
        {/* Today's Shringar Darshan (Visual Core) */}
        <TodayDarshan />

        {/* Today's Video Darshan (YouTube Core) */}
        <TodayVideo />

        {/* Nitya Aarti collection popups */}
        <AartiSection />

        {/* Bhajan Audio Player */}
        <BhajanSection />

        {/* Filterable Past Darshan Gallery */}
        <GallerySection />

        {/* Temple Timings, History, Maps, & Direct Contacts */}
        <TempleInfoSection />

      </main>

      {/* 4. Elegant Spiritual Footer */}
      <footer className="w-full max-w-4xl mx-auto px-4 mt-16 text-center select-none relative z-10">
        <div className="flex flex-col items-center gap-4">
          
          {/* Saffron Divider Accent with Flower Symbol */}
          <div className="flex items-center gap-4 w-full max-w-xs">
            <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-amber-400"></span>
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="h-[1px] flex-1 bg-gradient-to-r from-amber-400 to-transparent"></span>
          </div>

          {/* Calligraphic Mantra */}
          <h2 className="text-xl md:text-2xl font-extrabold text-amber-700 tracking-widest font-serif drop-shadow-sm">
            ॥ ॐ नमः शिवाय ॥
          </h2>

          {/* Credits */}
          <div className="text-[10px] md:text-xs text-slate-500 font-semibold space-y-1">
            <p>श्री मंसा महादेव मंदिर सेवा समिति, तितरड़ी, उदयपुर (राज.)</p>
            <p className="text-slate-400 font-medium">सर्व सुखिनः भवन्तु • समस्त मंगल कामनाएं</p>
          </div>
        </div>
      </footer>

      {/* 5. Secure Admin Dashboard Overlay Modal */}
      <AnimatePresence>
        {isAdminOpen && (
          <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
