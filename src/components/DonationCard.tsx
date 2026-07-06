import { useState, useEffect } from 'react';
import { db, subscribeToDBUpdates } from '../lib/db';
import { DonationSettings } from '../types';
import { Heart, Users } from 'lucide-react';
import DonationPopup from './DonationPopup';
import CommitteePopup from './CommitteePopup';
import { AnimatePresence } from 'motion/react';

export default function DonationCard({ mode }: { mode?: 'donation' | 'committee' } = {}) {
  const [settings, setSettings] = useState<DonationSettings>(db.getDonationSettings());
  const [isOpen, setIsOpen] = useState(false);
  const [isCommitteeOpen, setIsCommitteeOpen] = useState(false);

  useEffect(() => {
    setSettings(db.getDonationSettings());
    const unsubscribe = subscribeToDBUpdates(() => {
      setSettings(db.getDonationSettings());
    });
    return unsubscribe;
  }, []);

  if (!settings.isEnabled) {
    return null;
  }

  if (mode === 'donation') {
    return (
      <section id="donation-card-section" className="w-full max-w-4xl mx-auto px-4">
        <div 
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-br from-amber-50 to-orange-50/90 border-2 border-amber-200 rounded-3xl shadow-xl shadow-amber-100/40 p-8 flex flex-col items-center justify-center gap-4 text-center cursor-pointer select-none transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
        >
          <h2 className="text-2xl md:text-3xl font-black text-amber-950 flex flex-col items-center justify-center gap-3 flex-wrap w-full">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-orange-600 fill-orange-100 animate-bounce shrink-0" />
              <span>मंदिर सेवा एवं दान निधि</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
              title="मंदिर सेवा एवं दान"
              className="inline-flex items-center gap-2 bg-white hover:bg-amber-100 border-2 border-amber-300 hover:border-amber-400 text-amber-950 px-8 py-3.5 rounded-full shadow-md hover:shadow-lg text-lg md:text-xl font-black tracking-wider cursor-pointer transition duration-300 transform hover:scale-105 active:scale-95 group"
            >
              <span>❤️ मंदिर हेतु ऑनलाइन सहयोग / दान करें</span>
            </button>
          </h2>
   
          <p className="text-base md:text-lg text-amber-950 font-black mt-2 text-center max-w-lg px-4 leading-relaxed">
            {settings.message || "मंदिर के धार्मिक कार्यों, सेवा एवं विकास में अपना सहयोग प्रदान करें।"}
          </p>
        </div>

        <AnimatePresence>
          {isOpen && (
            <DonationPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
          )}
        </AnimatePresence>
      </section>
    );
  }

  if (mode === 'committee') {
    return (
      <section id="committee-section" className="w-full max-w-4xl mx-auto px-4 flex justify-center select-none">
        <button
          onClick={() => setIsCommitteeOpen(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-900 font-extrabold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md text-xs md:text-sm tracking-wide cursor-pointer transition duration-300 transform active:scale-95 group"
        >
          <Users className="w-4 h-4 text-orange-600" />
          <span>👥 मंदिर समिति / ट्रस्टी</span>
        </button>

        <AnimatePresence>
          {isCommitteeOpen && (
            <CommitteePopup isOpen={isCommitteeOpen} onClose={() => setIsCommitteeOpen(false)} />
          )}
        </AnimatePresence>
      </section>
    );
  }

  return (
    <section id="donation-card-section" className="w-full max-w-4xl mx-auto px-4 py-2 flex flex-col gap-3">
      <div 
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-br from-amber-50 to-orange-50/90 border-2 border-amber-200 rounded-3xl shadow-xl shadow-amber-100/40 p-8 flex flex-col items-center justify-center gap-4 text-center cursor-pointer select-none transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
      >
        <h2 className="text-2xl md:text-3xl font-black text-amber-950 flex flex-col items-center justify-center gap-3 flex-wrap w-full">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-orange-600 fill-orange-100 animate-bounce shrink-0" />
            <span>मंदिर सेवा एवं दान निधि</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            title="मंदिर सेवा एवं दान"
            className="inline-flex items-center gap-2 bg-white hover:bg-amber-100 border-2 border-amber-300 hover:border-amber-400 text-amber-950 px-8 py-3.5 rounded-full shadow-md hover:shadow-lg text-lg md:text-xl font-black tracking-wider cursor-pointer transition duration-300 transform hover:scale-105 active:scale-95 group"
          >
            <span>❤️ मंदिर हेतु ऑनलाइन सहयोग / दान करें</span>
          </button>
        </h2>
 
        <p className="text-base md:text-lg text-amber-950 font-black mt-2 text-center max-w-lg px-4 leading-relaxed">
          {settings.message || "मंदिर के धार्मिक कार्यों, सेवा एवं विकास में अपना सहयोग प्रदान करें।"}
        </p>
      </div>

      {/* Premium separate capsule/button for Committee & Trustees */}
      <div className="flex justify-center select-none">
        <button
          onClick={() => setIsCommitteeOpen(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-900 font-extrabold px-5 py-2 rounded-full shadow-sm hover:shadow-md text-xs md:text-sm tracking-wide cursor-pointer transition duration-300 transform active:scale-95 group"
        >
          <Users className="w-4 h-4 text-orange-600" />
          <span>👥 मंदिर समिति / ट्रस्टी</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <DonationPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCommitteeOpen && (
          <CommitteePopup isOpen={isCommitteeOpen} onClose={() => setIsCommitteeOpen(false)} />
        )}
      </AnimatePresence>
    </section>
  );
}
