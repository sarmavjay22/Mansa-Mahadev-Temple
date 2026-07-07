import { useState, useEffect } from 'react';
import { db, subscribeToDBUpdates } from '../lib/db';
import { DonationSettings } from '../types';
import { X, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface CommitteePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommitteePopup({ isOpen, onClose }: CommitteePopupProps) {
  const [settings, setSettings] = useState<DonationSettings>(db.getDonationSettings());

  useEffect(() => {
    setSettings(db.getDonationSettings());
    const unsubscribe = subscribeToDBUpdates(() => {
      setSettings(db.getDonationSettings());
    });
    return unsubscribe;
  }, [isOpen]);

  if (!isOpen) return null;

  const members = settings.members || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      {/* Backdrop clickable */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <motion.div
        initial={{ scale: 0.95, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 30, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-lg bg-gradient-to-b from-[#fffdf5] to-[#fcfaf2] border border-amber-200/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] text-slate-800 z-10"
      >
        {/* Top Decorative Border */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shrink-0"></div>

        {/* Modal Header */}
        <div className="p-5 border-b border-amber-200/40 bg-gradient-to-r from-amber-500/5 to-amber-600/10 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl text-white shadow-md shadow-orange-500/10">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-extrabold tracking-wide text-slate-800">
                👥 मंदिर प्रबंधन समिति / ट्रस्टी
              </h2>
              <p className="text-xs md:text-sm text-amber-700 font-bold">
                Mansa Mahadev Mandir Committee & Trustees
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-amber-200/30 shadow-md flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 text-slate-500 transition duration-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Recipient Details Card */}
          {(settings.committeeName || settings.trusteeName) && (
            <div className="bg-amber-50/40 border border-amber-200/30 rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm">
              <span className="text-[15px] font-extrabold uppercase tracking-wider text-amber-800 border-b border-amber-200/20 pb-1.5 flex items-center gap-1 select-none">
                🚩 मंदिर प्रबंधन एवं दायित्व
              </span>
              {settings.committeeName && (
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">समिति नाम:</span>
                  <span className="text-base font-black text-slate-800 leading-tight mt-0.5">{settings.committeeName}</span>
                </div>
              )}
              {settings.trusteeName && (
                <div className="flex flex-col mt-1">
                  <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">अधिकृत व्यक्ति / Trustee:</span>
                  <span className="text-base font-black text-slate-800 leading-tight mt-0.5">{settings.trusteeName}</span>
                </div>
              )}
            </div>
          )}

          {/* Members List */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-black text-slate-500 uppercase tracking-wider select-none px-1">
              👥 समिति सदस्य सूची ({members.length})
            </span>

            {members.length === 0 ? (
              <div className="text-center p-8 bg-amber-50/10 border border-dashed border-amber-200/30 rounded-2xl text-sm text-slate-400 font-medium select-none">
                कोई सदस्य उपलब्ध नहीं है।
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {members.map((member) => (
                  <div 
                    key={member.id} 
                    className="bg-white border border-amber-200/20 rounded-2xl p-4 flex flex-col gap-1 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-amber-200 hover:shadow-md transition duration-300"
                  >
                    <span className="text-[15px] font-black text-slate-800 leading-tight">{member.name}</span>
                    <span className="text-sm font-black text-amber-700">{member.designation}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Text */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-200 to-transparent my-1"></div>
          <p className="text-xs md:text-sm text-slate-500 font-black text-center leading-relaxed max-w-sm mx-auto">
            🙏 "श्री मंसा महादेव मंदिर सेवा समिति सदैव श्रद्धालुओं की सेवा में समर्पित है।"
          </p>
        </div>
      </motion.div>
    </div>
  );
}
