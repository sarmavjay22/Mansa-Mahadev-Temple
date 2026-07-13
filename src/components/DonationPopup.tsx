import React, { useState, useEffect } from 'react';
import { db, subscribeToDBUpdates } from '../lib/db';
import { DonationSettings } from '../types';
import { X, Copy, Check, Heart, ExternalLink, Info, QrCode, ArrowLeft, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

// Brand Logos
const PhonePeIcon = () => (
  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-md flex items-center justify-center shrink-0 select-none overflow-hidden p-1">
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/512px-PhonePe_Logo.svg.png" 
      alt="PhonePe Logo" 
      referrerPolicy="no-referrer"
      className="w-full h-full object-contain select-none"
    />
  </div>
);

const GPayIcon = () => (
  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-md flex items-center justify-center shrink-0 select-none overflow-hidden p-1">
    <img 
      src="https://img.icons8.com/color/120/google-pay.png" 
      alt="Google Pay Logo" 
      referrerPolicy="no-referrer"
      className="w-full h-full object-contain select-none"
    />
  </div>
);

const PaytmIcon = () => (
  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-md flex items-center justify-center shrink-0 select-none overflow-hidden p-1">
    <img 
      src="https://img.icons8.com/color/120/paytm.png" 
      alt="Paytm Logo" 
      referrerPolicy="no-referrer"
      className="w-full h-full object-contain select-none"
    />
  </div>
);

const RazorpayIcon = () => (
  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-md flex items-center justify-center shrink-0 select-none overflow-hidden p-1">
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" 
      alt="Razorpay Logo" 
      referrerPolicy="no-referrer"
      className="w-full h-full object-contain select-none"
    />
  </div>
);

interface DonationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationPopup({ isOpen, onClose }: DonationPopupProps) {
  const [settings, setSettings] = useState<DonationSettings>(db.getDonationSettings());
  const [copied, setCopied] = useState(false);
  const [copiedApp, setCopiedApp] = useState<string | null>(null);

  // Razorpay secure checkout states
  const [showRazorpayCheckout, setShowRazorpayCheckout] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState('101');
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'payment' | 'success'>('form');

  const getDisplayMessage = (msg: string) => {
    if (!msg || msg === "मंदिर के धार्मिक कार्यों, सेवा एवं विकास में अपना सहयोग प्रदान करें।" || msg === "मंदिर के धार्मिक कार्यों, सेवा एवं विकास में अपना Online आर्थिक सहयोग प्रदान कर धार्मिक लाभ लेवें") {
      return "मंदिर के धार्मिक कार्यों, सेवा एवं विकास में अपना Online आर्थिक सहयोग प्रदान कर धर्म लाभ लेवें";
    }
    return msg;
  };

  useEffect(() => {
    setSettings(db.getDonationSettings());
    const unsubscribe = subscribeToDBUpdates(() => {
      setSettings(db.getDonationSettings());
    });

    if (!isOpen) {
      setShowRazorpayCheckout(false);
      setCheckoutStep('form');
      setCheckoutAmount('101');
      setCheckoutName('');
      setCheckoutPhone('');
    }

    return unsubscribe;
  }, [isOpen]);

  const handleCopyUPI = async () => {
    const upiId = settings.upiId || "9340721968@ybl";
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy UPI ID:", err);
    }
  };

  const getAppUpiLink = (appName: string, amountStr?: string) => {
    const upiId = settings.upiId || "9340721968@ybl";
    const name = encodeURIComponent(settings.trusteeName || "Vijay Sharma");
    // To comply with NPCI and bank security guidelines for peer-to-peer (P2P) personal accounts,
    // we MUST NOT include prefilled amounts ('am') or transaction notes ('tn') in mobile browser deep links.
    // Including them triggers a "Payment declined for security reasons" error in PhonePe, GPay, and Paytm.
    // Instead, we open the clean payee screen, and copy the amount to the user's clipboard/guide them to enter it manually.
    let baseParams = `pa=${upiId}&pn=${name}&cu=INR`;

    if (appName === 'Razorpay') {
      return settings.razorpayLink || "https://razorpay.me/@vijaysharma843";
    }

    const userAgent = navigator.userAgent || '';
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

    if (isAndroid) {
      if (appName === 'PhonePe') {
        return `intent://pay?${baseParams}#Intent;scheme=upi;package=com.phonepe.app;end`;
      }
      if (appName === 'Google Pay' || appName === 'GPay') {
        return `intent://pay?${baseParams}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
      }
      if (appName === 'Paytm') {
        return `intent://pay?${baseParams}#Intent;scheme=upi;package=net.one97.paytm;end`;
      }
    } else if (isIOS) {
      if (appName === 'PhonePe') {
        return `phonepe://pay?${baseParams}`;
      }
      if (appName === 'Google Pay' || appName === 'GPay') {
        return `gpay://upi/pay?${baseParams}`;
      }
      if (appName === 'Paytm') {
        return `paytmmp://pay?${baseParams}`;
      }
    }

    // Default universal fallback
    return `upi://pay?${baseParams}`;
  };

  const handleAppClick = async (appName: string, e: React.MouseEvent<HTMLAnchorElement>, amountStr?: string) => {
    const isMobileDevice = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    
    try {
      await navigator.clipboard.writeText(settings.upiId || "9340721968@ybl");
      setCopied(true);
      setCopiedApp(appName);
      setTimeout(() => {
        setCopied(false);
        setCopiedApp(null);
      }, 5000);
    } catch (err) {
      console.error("Failed to copy UPI ID:", err);
    }

    if (!isMobileDevice) {
      e.preventDefault();
    }
  };

  const handleRazorpayClick = () => {
    window.open(settings.razorpayLink || "https://razorpay.me/@vijaysharma843", '_blank');
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

        {showRazorpayCheckout ? (
          // Razorpay Checkout View
          <div className="flex flex-col overflow-hidden max-h-[90vh]">
            {/* Razorpay Header */}
            <div className="p-4 border-b border-blue-100 bg-blue-50/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    if (checkoutStep === 'payment') {
                      setCheckoutStep('form');
                    } else if (checkoutStep === 'success') {
                      setCheckoutStep('payment');
                    } else {
                      setShowRazorpayCheckout(false);
                    }
                  }}
                  className="p-1.5 hover:bg-blue-100/80 rounded-lg text-blue-800 transition text-left"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="text-left">
                  <h3 className="text-sm font-black text-blue-900 flex items-center gap-1.5 leading-none">
                    <span className="text-blue-600 font-extrabold text-xs uppercase tracking-wide">Razorpay Secured</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">मंसा महादेव मंदिर, उदयपुर</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-blue-100 text-slate-500 hover:text-blue-900 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Steps */}
            {checkoutStep === 'form' && (
              <div className="p-5 overflow-y-auto flex flex-col gap-4">
                {/* Info Card */}
                <div className="bg-amber-50/60 border border-amber-200/40 rounded-2xl p-3 text-center">
                  <p className="text-xs text-amber-900 font-bold leading-relaxed">
                    "आपकी दान राशि मंदिर के विकास, सेवा और धार्मिक उत्सवों में समर्पित होगी।"
                  </p>
                </div>

                {/* Amount Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider text-left">
                    दान राशि चुनिए (Select Amount):
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {['101', '251', '501', '1100', '2100'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCheckoutAmount(amt)}
                        className={`py-2 px-1 rounded-xl text-xs font-black border transition duration-200 ${
                          checkoutAmount === amt 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="relative mt-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      value={checkoutAmount}
                      onChange={(e) => setCheckoutAmount(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="अन्य राशि दर्ज करें (Custom Amount)"
                      className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-slate-800"
                    />
                  </div>
                </div>

                {/* Sender Details */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      दानदाता का नाम (Name - Optional):
                    </label>
                    <input
                      type="text"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      placeholder="उदा. विजय शर्मा"
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      मोबाइल नंबर (Mobile No. - Optional):
                    </label>
                    <input
                      type="tel"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="उदा. 9876543210"
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="button"
                  onClick={() => {
                    const amt = parseInt(checkoutAmount, 10);
                    if (!amt || amt <= 0) {
                      alert("कृपया सही दान राशि दर्ज करें।");
                      return;
                    }
                    setCheckoutStep('payment');
                  }}
                  className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-blue-500/10"
                >
                  <Shield className="w-4 h-4 fill-white/10" />
                  <span>सुरक्षित भुगतान करें / Proceed to Pay</span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold">
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                  <span>Razorpay द्वारा एन्क्रिप्टेड 256-bit SSL सुरक्षित भुगतान</span>
                </div>
              </div>
            )}

            {checkoutStep === 'payment' && (
              <div className="p-5 overflow-y-auto flex flex-col items-center gap-4">
                {/* Summary Box */}
                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">दान प्राप्तकर्ता</span>
                    <span className="text-xs font-extrabold text-slate-800">{settings.committeeName || "मंसा महादेव मंदिर समिति"}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">कुल राशि</span>
                    <span className="text-base font-black text-blue-600">₹{checkoutAmount}</span>
                  </div>
                </div>

                {/* Dynamic QR Code for selected amount */}
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <span className="text-[10px] font-black text-blue-800 uppercase flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Dynamic UPI QR Code (स्कैन करें)</span>
                  </span>
                  
                  <div className="relative bg-white p-2 rounded-2xl border border-blue-100 shadow-md max-w-[170px] w-full aspect-square flex items-center justify-center overflow-hidden">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                        `upi://pay?pa=${settings.upiId || "9340721968@ybl"}&pn=${encodeURIComponent(settings.trusteeName || "Vijay Sharma")}&tn=${encodeURIComponent(`Donation-${checkoutName || 'Devotee'}`)}&am=${checkoutAmount}&cu=INR`
                      )}`} 
                      alt="Razorpay dynamic QR" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <p className="text-[10px] text-slate-500 font-bold max-w-[250px]">
                    इस QR कोड में ₹{checkoutAmount} की राशि पहले से ही सेट है। किसी भी UPI ऐप से स्कैन करके भुगतान करें।
                  </p>
                </div>

                {/* I have paid button */}
                <button
                  type="button"
                  onClick={() => setCheckoutStep('success')}
                  className="mt-1 w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-emerald-500/10"
                >
                  <CheckCircle2 className="w-4 h-4 text-white fill-white/10" />
                  <span>मैंने भुगतान कर दिया है (I have Paid)</span>
                </button>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="p-5 overflow-y-auto flex flex-col items-center text-center gap-4">
                {/* Success Icon */}
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                {/* Success Message */}
                <div>
                  <h4 className="text-lg font-black text-emerald-800">भुगतान अनुरोध दर्ज किया गया!</h4>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    मंसा महादेव जी आपकी समस्त मनोकामनाएं पूर्ण करें।
                  </p>
                </div>

                {/* Digital Receipt Card */}
                <div className="w-full bg-gradient-to-br from-amber-50/40 to-orange-50/20 border border-amber-200/40 rounded-2xl p-4 text-left flex flex-col gap-2.5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-amber-200/30 pb-2">
                    <span className="text-xs font-black text-amber-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      <span>डिजिटल रसीद (Donation Receipt)</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">#{Date.now().toString().slice(-6)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-xs font-bold text-slate-700">
                    <span className="text-slate-400 font-bold">दानदाता:</span>
                    <span className="text-right truncate">{checkoutName.trim() || 'श्रद्धालु (Devotee)'}</span>

                    <span className="text-slate-400 font-bold">मोबाइल नंबर:</span>
                    <span className="text-right">{checkoutPhone.trim() ? `+91 ${checkoutPhone}` : 'N/A'}</span>

                    <span className="text-slate-400 font-bold">दान राशि:</span>
                    <span className="text-right text-emerald-600 font-extrabold">₹{checkoutAmount}</span>

                    <span className="text-slate-400 font-bold">उद्देश्य:</span>
                    <span className="text-right text-amber-800">मंदिर सेवा एवं विकास कार्य</span>

                    <span className="text-slate-400 font-bold">तिथि & समय:</span>
                    <span className="text-right">{new Date().toLocaleDateString('hi-IN')}</span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 active:scale-98 text-white font-black text-sm rounded-xl transition duration-200"
                >
                  बंद करें (Close)
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="p-5 border-b border-amber-200/40 bg-gradient-to-r from-amber-500/5 to-amber-600/10 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-400 to-orange-500 rounded-2xl text-white shadow-md shadow-orange-500/10">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-wide text-slate-800">
                    ❤️ मंदिर सेवा एवं दान
                  </h2>
                  <p className="text-xs md:text-sm text-amber-700 font-bold mt-0.5">
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
            <div className="p-4 md:p-5 overflow-y-auto flex flex-col items-center text-center gap-4">
              
              {/* Donation Message */}
              <div className="bg-amber-50/50 border border-amber-200/30 rounded-2xl p-3 w-full max-w-sm shadow-sm">
                <p className="text-sm md:text-base text-amber-900 font-bold leading-relaxed">
                  🙏 "{getDisplayMessage(settings.message)}"
                </p>
              </div>

              {/* QR Code Container (Dynamic Barcode Scanner) */}
              <div className="flex flex-col items-center gap-1.5 w-full">
                <span className="text-xs font-black text-black uppercase flex items-center gap-1 animate-pulse">
                  <QrCode className="w-4 h-4 text-orange-600 animate-bounce" />
                  <span>स्कैन या स्क्रीनशॉट लेकर भुगतान करें (Barcode Option)</span>
                </span>
                <div className="relative bg-white p-2 rounded-3xl border border-amber-200/80 shadow-md max-w-[200px] w-full aspect-square flex items-center justify-center overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-amber-300">
                  <img 
                    src={settings.qrCodeUrl && settings.qrCodeUrl.startsWith('http') ? settings.qrCodeUrl : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${settings.upiId || '9340721968@ybl'}&pn=${encodeURIComponent(settings.trusteeName || 'Vijay Sharma')}&cu=INR&tn=Donation`)}`} 
                    alt="Donation UPI QR Code" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain select-none"
                  />
                </div>
                <p className="text-[15px] text-slate-900 font-bold max-w-[340px] leading-relaxed">
                  आप QR कोड को स्कैन करके या नीचे दी गई UPI ID कॉपी करके भी भुगतान कर सकते हैं।
                </p>

                {/* UPI ID Display & Copy */}
                <div className="flex items-center gap-2 bg-white border-2 border-amber-300 p-1 pl-4 rounded-full shadow-md w-full max-w-[340px] justify-between">
                  <span className="font-mono text-[15px] md:text-[17px] text-slate-900 font-extrabold truncate flex-1 text-left select-all">
                    {settings.upiId || "9340721968@ybl"}
                  </span>
                  <button
                    onClick={handleCopyUPI}
                    className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[14px] py-2 px-5 rounded-full transition duration-300 shadow-sm shrink-0 active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Dynamic Assistance overlay on Copy UPI ID */}
                {copied && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 text-green-950 rounded-2xl p-3.5 text-left flex flex-col gap-1.5 shadow-md w-full"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black text-green-800 uppercase">
                      <span>📋 UPI ID कॉपी हो गया!</span>
                    </div>
                    <p className="text-[11px] md:text-xs leading-relaxed font-bold text-slate-700">
                      हमने <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-green-200 text-green-900">{settings.upiId || "9340721968@ybl"}</span> को सफलतापूर्वक कॉपी कर लिया है। अब आप अपने मोबाइल के किसी भी UPI ऐप (जैसे PhonePe, Google Pay, Paytm आदि) को खोलकर इस ID पर आसानी से दान राशि भेज सकते हैं!
                    </p>
                  </motion.div>
                )}

              </div>

              {/* Saffron Divider */}
              <div className="w-full max-w-xs h-[1px] bg-gradient-to-r from-transparent via-amber-300 to-transparent my-0.5"></div>

              {/* Closing Message */}
              <p className="text-xs md:text-sm text-slate-700 font-bold leading-relaxed max-w-xs">
                🙏 "आपका सहयोग मंदिर सेवा एवं धार्मिक कार्यों में अमूल्य योगदान है। हर हर महादेव।"
              </p>

            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
