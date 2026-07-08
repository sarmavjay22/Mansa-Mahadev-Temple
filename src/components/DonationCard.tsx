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

  const getDisplayMessage = (msg: string) => {
    if (!msg || msg === "मंदिर के धार्मिक कार्यों, सेवा एवं विकास में अपना सहयोग प्रदान करें।" || msg === "मंदिर के धार्मिक कार्यों, सेवा एवं विकास में अपना Online आर्थिक सहयोग प्रदान कर धार्मिक लाभ लेवें") {
      return "मंदिर के धार्मिक कार्यों, सेवा एवं विकास में अपना Online आर्थिक सहयोग प्रदान कर धर्म लाभ लेवें";
    }
    return msg;
  };

  if (!settings.isEnabled) {
    return null;
  }

  if (mode === 'donation') {
    return (
      <section id="donation-card-section" className="w-full max-w-4xl mx-auto px-4">
        <div 
          className="bg-gradient-to-br from-amber-50 to-orange-50/90 border-2 border-amber-200 rounded-3xl shadow-xl shadow-amber-100/40 p-4 md:p-5 flex flex-col items-center justify-center gap-2 text-center select-none transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
        >
          <h2 className="text-xl md:text-2xl font-black text-amber-950 flex flex-col items-center justify-center gap-3 flex-wrap w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
              title="मँदिर सेवा एवं दान निधि"
              className="inline-flex items-center gap-2 bg-white hover:bg-amber-100 border-2 border-amber-300 hover:border-amber-400 text-amber-950 px-5 py-2 rounded-full shadow-sm hover:shadow-md text-sm md:text-base font-extrabold tracking-wider cursor-pointer transition duration-300 transform hover:scale-105 active:scale-95 group text-center"
            >
              <span>❤️ मँदिर सेवा एवं दान निधि</span>
            </button>
          </h2>
   
          <p className="text-xs md:text-sm text-slate-700 font-medium mt-0 text-center max-w-lg px-4 leading-relaxed">
            {getDisplayMessage(settings.message)}
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
      <section id="committee-section" className="w-full max-w-4xl mx-auto px-4 select-none">
        {/* Golden Accented Title Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/90 border-2 border-amber-200 rounded-2xl shadow-lg shadow-amber-100/30 p-3 relative flex flex-wrap items-center justify-center gap-3">
          <h2 className="text-xl md:text-2xl font-black text-amber-950 flex flex-col items-center justify-center gap-3 flex-wrap w-full">
            <button
              onClick={() => setIsCommitteeOpen(true)}
              className="inline-flex items-center gap-2 bg-white hover:bg-amber-100 border-2 border-amber-300 hover:border-amber-400 text-amber-950 px-5 py-2 rounded-full shadow-sm hover:shadow-md text-sm md:text-base font-extrabold tracking-wider cursor-pointer transition duration-300 transform hover:scale-105 active:scale-95 group text-center"
            >
              <Users className="w-4 h-4 text-amber-600 group-hover:rotate-6 transition-transform duration-300" />
              <span>👥 मँदिर प्रबंधन समिति/ट्रस्टी</span>
            </button>
          </h2>
        </div>

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
        className="bg-gradient-to-br from-amber-50 to-orange-50/90 border-2 border-amber-200 rounded-3xl shadow-xl shadow-amber-100/40 pt-5 pb-5 px-6 md:px-8 flex flex-col items-center justify-center gap-2 text-center select-none transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
      >
        <h2 className="text-2xl md:text-3xl font-black text-amber-950 flex flex-col items-center justify-center gap-3 flex-wrap w-full">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            title="मँदिर सेवा एवं दान निधि"
            className="inline-flex items-center gap-2 bg-white hover:bg-amber-100 border-2 border-amber-300 hover:border-amber-400 text-amber-950 px-6 py-2.5 rounded-full shadow-sm hover:shadow-md text-base font-black tracking-wider cursor-pointer transition duration-300 transform hover:scale-105 active:scale-95 group text-center"
          >
            <span className="font-black">❤️ मँदिर सेवा एवं दान निधि</span>
          </button>
        </h2>
 
        <p className="text-sm md:text-base text-black font-normal mt-0 text-center max-w-lg px-4 leading-relaxed">
          {getDisplayMessage(settings.message)}
        </p>
      </div>

      {/* Premium separate capsule/button for Committee & Trustees */}
      <div className="select-none w-full max-w-4xl mx-auto px-4 mt-2">
        {/* Golden Accented Title Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/90 border-2 border-amber-200 rounded-2xl shadow-lg shadow-amber-100/30 p-4 relative flex flex-wrap items-center justify-center gap-3 w-full">
          <h2 className="text-xl md:text-2xl font-black text-amber-950 flex flex-col items-center justify-center gap-3 flex-wrap w-full">
            <button
              onClick={() => setIsCommitteeOpen(true)}
              className="inline-flex items-center gap-2 bg-white hover:bg-amber-100 border-2 border-amber-300 hover:border-amber-400 text-amber-950 px-6 py-2.5 rounded-full shadow-sm hover:shadow-md text-base font-black tracking-wider cursor-pointer transition duration-300 transform hover:scale-105 active:scale-95 group text-center"
            >
              <Users className="w-5 h-5 text-amber-600 group-hover:rotate-6 transition-transform duration-300" />
              <span className="font-black">👥 मँदिर प्रबंधन समिति/ट्रस्टी</span>
            </button>
          </h2>
        </div>
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
