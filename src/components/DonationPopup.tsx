import { useState, useEffect } from 'react';
import { db, subscribeToDBUpdates } from '../lib/db';
import { DonationSettings } from '../types';
import { X, Copy, Check, Heart, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface DonationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationPopup({ isOpen, onClose }: DonationPopupProps) {
  const [settings, setSettings] = useState<DonationSettings>(db.getDonationSettings());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSettings(db.getDonationSettings());
    const unsubscribe = subscribeToDBUpdates(() => {
      setSettings(db.getDonationSettings());
    });
    return unsubscribe;
  }, [isOpen]);

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(settings.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy UPI ID:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      {/* Backdrop clickable */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <motion.div
        initial={{ scale: 0.95, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 30, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-md bg-gradient-to-b from-[#fffdf5] to-[#fcfaf2] border border-amber-200/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[95vh] text-slate-800 z-10 animate-fade-in"
      >
        {/* Top Decorative Border */}
        <div className="h-2 w-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 shrink-0"></div>

        {/* Modal Header */}
        <div className="p-5 border-b border-amber-200/40 bg-gradient-to-r from-amber-500/5 to-amber-600/10 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-400 to-orange-500 rounded-2xl text-white shadow-md shadow-orange-500/10">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-extrabold tracking-wide text-slate-800">
                ❤️ मंदिर सेवा एवं दान
              </h2>
              <p className="text-[10px] md:text-xs text-amber-700 font-bold">
                Mansa Mahadev Mandir Seva & Donation
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-amber-200/30 shadow-md flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 text-slate-500 transition duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col items-center text-center gap-6">
          
          {/* Donation Message */}
          <div className="bg-amber-50/50 border border-amber-200/30 rounded-2xl p-4 w-full max-w-sm shadow-sm">
            <p className="text-xs md:text-sm text-amber-900 font-bold leading-relaxed">
              🙏 "{settings.message || "मंदिर के धार्मिक कार्यों, सेवा एवं विकास में अपना सहयोग प्रदान करें।"}"
            </p>
          </div>

          {/* QR Code Container */}
          <div className="relative bg-white p-4 rounded-3xl border border-amber-200/40 shadow-md max-w-[200px] w-full aspect-square flex items-center justify-center overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-amber-300">
            {settings.qrCodeUrl ? (
              <img 
                src={settings.qrCodeUrl} 
                alt="Donation QR Code" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain select-none"
              />
            ) : (
              <div className="text-slate-400 font-medium text-xs text-center p-4">
                कोई QR Code उपलब्ध नहीं है।
              </div>
            )}
          </div>

          {/* Recipient Details Section */}
          {(settings.committeeName || settings.trusteeName) && (
            <div className="w-full max-w-sm bg-amber-50/40 border border-amber-200/30 rounded-2xl p-3.5 text-left flex flex-col gap-2 shadow-sm">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 border-b border-amber-200/30 pb-1 flex items-center gap-1 select-none">
                🚩 दान प्राप्तकर्ता (Donation Recipient)
              </span>
              {settings.committeeName && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">मंदिर प्रबंधन समिति</span>
                  <span className="text-xs font-black text-slate-800 leading-tight mt-0.5">{settings.committeeName}</span>
                </div>
              )}
              {settings.trusteeName && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">अधिकृत व्यक्ति / Trustee</span>
                  <span className="text-xs font-black text-slate-800 leading-tight mt-0.5">{settings.trusteeName}</span>
                </div>
              )}
            </div>
          )}



          {/* UPI Section */}
          <div className="w-full max-w-sm flex flex-col gap-3">
            
            {/* UPI ID Display & Copy */}
            <div className="flex items-center gap-2 bg-white border border-amber-200/40 p-1 pl-3.5 rounded-full shadow-sm">
              <span className="font-mono text-xs text-slate-600 font-semibold truncate flex-1 text-left">
                {settings.upiId || "mansamahadev@upi"}
              </span>
              <button
                onClick={handleCopyUPI}
                className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] py-1.5 px-3 rounded-full transition duration-300 shadow-sm shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>UPI ID Copy Karein</span>
                  </>
                )}
              </button>
            </div>

            {/* Pay with UPI App Button */}
            {settings.upiLink && (
              <a
                href={settings.upiLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs md:text-sm py-2.5 px-5 rounded-full transition duration-300 shadow-md shadow-orange-500/10 hover:shadow-lg active:scale-[0.98]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>UPI App Se Donate Karein</span>
              </a>
            )}

          </div>

          {/* Saffron Divider */}
          <div className="w-full max-w-xs h-[1px] bg-gradient-to-r from-transparent via-amber-300 to-transparent my-1"></div>

          {/* Closing Message */}
          <p className="text-[10px] md:text-xs text-slate-500 font-semibold leading-relaxed max-w-xs">
            🙏 "आपका सहयोग मंदिर सेवा एवं धार्मिक कार्यों में अमूल्य योगदान है। हर हर महादेव।"
          </p>

        </div>
      </motion.div>
    </div>
  );
}
