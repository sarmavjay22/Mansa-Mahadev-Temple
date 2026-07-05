import { useState, useEffect } from 'react';
import { db, subscribeToDBUpdates } from '../lib/db';
import { DonationSettings } from '../types';
import { Heart, Users } from 'lucide-react';
import DonationPopup from './DonationPopup';
import CommitteePopup from './CommitteePopup';
import { AnimatePresence } from 'motion/react';

export default function DonationCard() {
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

  return (
    <section id="donation-card-section" className="w-full max-w-4xl mx-auto px-4 py-2 flex flex-col gap-3">
      <div 
        onClick={() => setIsOpen(true)}
        className="bg-white/70 backdrop-blur-md border border-white/50 rounded-3xl shadow-lg shadow-sky-100/30 p-6 flex flex-col items-center justify-center gap-4 text-center cursor-pointer select-none transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
      >
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 flex items-center justify-center gap-2 flex-wrap">
          <Heart className="w-6 h-6 text-red-500 fill-red-100 shrink-0" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            title="मंदिर सेवा एवं दान"
            className="inline-flex items-center gap-2 bg-[#fffdf5] hover:bg-amber-50/80 dark:bg-slate-800 border border-amber-300 dark:border-amber-500/50 hover:border-amber-400 text-slate-800 dark:text-slate-100 px-6 py-2.5 rounded-full shadow-sm hover:shadow-md text-md md:text-lg font-bold tracking-wide font-sans cursor-pointer transition duration-300 transform active:scale-95 group"
          >
            <span>मंदिर सेवा एवं दान</span>
          </button>
        </h2>

        <p className="text-sm md:text-base text-slate-500 font-bold mt-1 text-center max-w-md px-4 leading-relaxed">
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
