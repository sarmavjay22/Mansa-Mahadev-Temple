import { useState, useEffect, ChangeEvent } from 'react';
import { TempleSettings } from '../types';
import { subscribeToTempleSettings, updateTempleSettings, DEFAULT_SETTINGS } from '../lib/settings';
import { uploadToImageKit } from '../lib/imagekit';
import { 
  Loader2, 
  Save, 
  Upload, 
  Check, 
  Image as ImageIcon, 
  Sparkles, 
  Settings, 
  Globe, 
  Palette, 
  Smartphone,
  BookOpen,
  MapPin,
  MessageSquare
} from 'lucide-react';

export default function TempleSettingsTab() {
  const [settings, setSettings] = useState<TempleSettings>(DEFAULT_SETTINGS);
  const [form, setForm] = useState<TempleSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [formTab, setFormTab] = useState<'general' | 'contact' | 'spiritual' | 'styling'>('general');

  useEffect(() => {
    const unsubscribe = subscribeToTempleSettings((fetched) => {
      setSettings(fetched);
      setForm(fetched);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, fieldName: keyof TempleSettings) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingField(fieldName);
      const url = await uploadToImageKit(file);
      setForm(prev => ({ ...prev, [fieldName]: url }));
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("चित्र अपलोड करने में त्रुटि हुई!");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateTempleSettings(form);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("सेटिंग्स सहेजने में विफल!");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (confirm("क्या आप सेटिंग्स को उनके मूल डिफ़ॉल्ट मानों पर रीसेट करना चाहते हैं?")) {
      setForm(DEFAULT_SETTINGS);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <span className="text-xs font-bold font-mono">सेटिंग्स लोड की जा रही हैं...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 text-xs text-slate-700">
      
      {/* Settings Form Categories Header Tab Row */}
      <div className="flex border-b border-sky-100 bg-sky-50/10 text-[10px] sm:text-xs font-bold shrink-0 select-none rounded-xl overflow-hidden border">
        <button
          onClick={() => setFormTab('general')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1 transition ${
            formTab === 'general' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>सामान्य</span>
        </button>

        <button
          onClick={() => setFormTab('contact')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1 transition ${
            formTab === 'contact' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>संपर्क व सोशल</span>
        </button>

        <button
          onClick={() => setFormTab('spiritual')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1 transition ${
            formTab === 'spiritual' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>धार्मिक व समय</span>
        </button>

        <button
          onClick={() => setFormTab('styling')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1 transition ${
            formTab === 'styling' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>थीम व लेआउट</span>
        </button>
      </div>

      <div className="bg-slate-50/50 p-4 border border-slate-150 rounded-2xl flex flex-col gap-4">
        
        {/* TAB 1: GENERAL INFO */}
        {formTab === 'general' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>मंदिर का मुख्य विवरण (General Identity)</span>
              </h3>
            </div>

            {/* Temple Name Hindi */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">मंदिर का नाम (हिंदी में):</label>
              <input
                type="text"
                name="templeNameHindi"
                value={form.templeNameHindi}
                onChange={handleChange}
                placeholder="उदा. श्री मंसा महादेव मंदिर"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none font-semibold text-slate-800"
              />
            </div>

            {/* Temple Name English */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Temple Name (In English):</label>
              <input
                type="text"
                name="templeNameEnglish"
                value={form.templeNameEnglish}
                onChange={handleChange}
                placeholder="e.g. Mansa Mahadev Temple"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none font-semibold text-slate-800"
              />
            </div>

            {/* Short Description */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 mb-1">संक्षिप्त विवरण (Short Description):</label>
              <input
                type="text"
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                placeholder="उदा. मंसा महादेव का अलौकिक शिव धाम"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            {/* Temple Logo */}
            <div className="p-3 bg-white border border-slate-200/60 rounded-xl flex flex-col gap-2">
              <label className="block text-[10px] font-bold text-slate-500">मंदिर लोगो (Temple Logo):</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  onChange={(e) => handleImageUpload(e, 'templeLogo')}
                  accept="image/*"
                  className="text-[10px] max-w-[150px]"
                />
                {uploadingField === 'templeLogo' && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />}
              </div>
              <input
                type="text"
                name="templeLogo"
                value={form.templeLogo}
                onChange={handleChange}
                placeholder="लोगो चित्र URL"
                className="w-full px-2 py-1 bg-slate-50 border rounded-lg text-[10px]"
              />
              {form.templeLogo && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-400">पूर्वावलोकन:</span>
                  <img src={form.templeLogo} className="w-7 h-7 object-cover rounded-full border shadow-xs" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>

            {/* Temple Cover Image */}
            <div className="p-3 bg-white border border-slate-200/60 rounded-xl flex flex-col gap-2">
              <label className="block text-[10px] font-bold text-slate-500">मंदिर मुख्य आवरण चित्र (Cover Image):</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  onChange={(e) => handleImageUpload(e, 'templeCoverImage')}
                  accept="image/*"
                  className="text-[10px] max-w-[150px]"
                />
                {uploadingField === 'templeCoverImage' && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />}
              </div>
              <input
                type="text"
                name="templeCoverImage"
                value={form.templeCoverImage}
                onChange={handleChange}
                placeholder="आवरण चित्र URL"
                className="w-full px-2 py-1 bg-slate-50 border rounded-lg text-[10px]"
              />
              {form.templeCoverImage && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-400">पूर्वावलोकन:</span>
                  <img src={form.templeCoverImage} className="w-10 h-7 object-cover rounded-md border shadow-xs" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>

            {/* 🖼️ Media URL Management Section */}
            <div className="col-span-1 md:col-span-2 border-t border-slate-200/60 pt-4 mt-2">
              <h4 className="text-xs font-bold text-amber-600 mb-3 flex items-center gap-1.5">
                <span>🖼️ मीडिया यूआरएल प्रबंधन (Media URL Management)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* 1. Temple Logo URL */}
                <div className="p-3 bg-white border border-slate-200/60 rounded-xl flex flex-col gap-1.5">
                  <label className="block text-[10px] font-bold text-slate-500">मंदिर लोगो यूआरएल (Temple Logo URL):</label>
                  <input
                    type="text"
                    name="templeLogoUrl"
                    value={form.templeLogoUrl || ''}
                    onChange={handleChange}
                    placeholder="लोगो का सीधा इमेज यूआरएल (उदा. ImgBB, ImageKit)"
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  <p className="text-[9px] text-slate-400">खाली होने पर, मुख्य अपलोडेड लोगो का उपयोग होगा।</p>
                  {(form.templeLogoUrl || form.templeLogo) && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] text-slate-400">वर्तमान सक्रिय:</span>
                      <img src={form.templeLogoUrl || form.templeLogo} className="w-6 h-6 object-cover rounded-full border shadow-xs" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>

                {/* 2. Header Image URL */}
                <div className="p-3 bg-white border border-slate-200/60 rounded-xl flex flex-col gap-1.5">
                  <label className="block text-[10px] font-bold text-slate-500">हेडर बैकग्राउंड यूआरएल (Header Image URL):</label>
                  <input
                    type="text"
                    name="headerImageUrl"
                    value={form.headerImageUrl || ''}
                    onChange={handleChange}
                    placeholder="हेडर बैकग्राउंड का सीधा इमेज यूआरएल"
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  <p className="text-[9px] text-slate-400">खाली होने पर, मुख्य अपलोडेड आवरण चित्र का उपयोग होगा।</p>
                  {(form.headerImageUrl || form.templeCoverImage) && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] text-slate-400">वर्तमान सक्रिय:</span>
                      <img src={form.headerImageUrl || form.templeCoverImage} className="w-10 h-6 object-cover rounded border shadow-xs" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>

                {/* 3. Cover Image URL */}
                <div className="p-3 bg-white border border-slate-200/60 rounded-xl flex flex-col gap-1.5">
                  <label className="block text-[10px] font-bold text-slate-500">कवर इमेज यूआरएल (Cover Image URL):</label>
                  <input
                    type="text"
                    name="templeCoverImageUrl"
                    value={form.templeCoverImageUrl || ''}
                    onChange={handleChange}
                    placeholder="मुख्य कवर इमेज का सीधा यूआरएल"
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  <p className="text-[9px] text-slate-400">खाली होने पर, मुख्य अपलोडेड आवरण चित्र का उपयोग होगा।</p>
                  {(form.templeCoverImageUrl || form.templeCoverImage) && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] text-slate-400">वर्तमान सक्रिय:</span>
                      <img src={form.templeCoverImageUrl || form.templeCoverImage} className="w-10 h-6 object-cover rounded border shadow-xs" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>

                {/* 4. Festival Banner URL */}
                <div className="p-3 bg-white border border-slate-200/60 rounded-xl flex flex-col gap-1.5">
                  <label className="block text-[10px] font-bold text-slate-500">पर्व/उत्सव बैनर यूआरएल (Festival Banner URL):</label>
                  <input
                    type="text"
                    name="festivalBannerUrl"
                    value={form.festivalBannerUrl || ''}
                    onChange={handleChange}
                    placeholder="उत्सव के विशेष बैनर का सीधा इमेज यूआरएल"
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  <p className="text-[9px] text-slate-400">यहाँ यूआरएल देने पर यह वेबसाइट के सबसे ऊपर सुंदर बैनर के रूप में दिखेगा।</p>
                  {form.festivalBannerUrl && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] text-slate-400">पूर्वावलोकन:</span>
                      <img src={form.festivalBannerUrl} className="w-10 h-6 object-cover rounded border shadow-xs" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Developer Details & Copyright */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">फुटर कॉपीराइट संदेश (Footer Copyright):</label>
              <input
                type="text"
                name="footerCopyright"
                value={form.footerCopyright}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">डेवलपर नाम (Developer Name):</label>
              <input
                type="text"
                name="developerName"
                value={form.developerName}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

          </div>
        )}

        {/* TAB 2: CONTACTS & SOCIALS */}
        {formTab === 'contact' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-1.5 mb-2">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>स्थान, संपर्क व सोशल मीडिया लिंक्स (Contacts & Socials)</span>
              </h3>
            </div>

            {/* Contact Person Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">संपर्क व्यक्ति का नाम (Contact Person Name):</label>
              <input
                type="text"
                name="contactPerson"
                value={form.contactPerson || ''}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">फ़ोन नंबर (Phone):</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none font-mono"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">व्हाट्सएप (WhatsApp Number - No country code):</label>
              <input
                type="text"
                name="whatsApp"
                value={form.whatsApp}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none font-mono"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">ईमेल आईडी (Email ID):</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none font-mono"
              />
            </div>

            {/* Maps Link */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">गूगल मैप्स लिंक (Google Maps Link):</label>
              <input
                type="text"
                name="googleMapsLink"
                value={form.googleMapsLink}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none font-mono"
              />
            </div>

            {/* Physical Address */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 mb-1">पूरा पता (Full Temple Address):</label>
              <input
                type="text"
                name="templeAddress"
                value={form.templeAddress}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            {/* Village & City */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">गाँव / क्षेत्र (Village/Area):</label>
              <input
                type="text"
                name="village"
                value={form.village}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">शहर (City):</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            {/* State & Pincode */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">राज्य (State):</label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">पिनकोड (Pincode):</label>
              <input
                type="text"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none font-mono"
              />
            </div>

            {/* Socials Divider */}
            <div className="sm:col-span-2 border-t pt-3 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">सोशल मीडिया एवं डोनेशन (Socials & Donation)</span>
            </div>

            {/* Facebook */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">फेसबुक पेज लिंक (Facebook URL):</label>
              <input
                type="text"
                name="facebook"
                value={form.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">इंस्टाग्राम प्रोफाइल लिंक (Instagram URL):</label>
              <input
                type="text"
                name="instagram"
                value={form.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            {/* YouTube */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">यूट्यूब चैनल लिंक (YouTube Channel):</label>
              <input
                type="text"
                name="youtube"
                value={form.youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            {/* UPI ID */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">यूपीआई आईडी (Donation UPI ID):</label>
              <input
                type="text"
                name="upiId"
                value={form.upiId}
                onChange={handleChange}
                placeholder="e.g. mansa.mahadev@upi"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none font-mono"
              />
            </div>

            {/* Donation QR Code */}
            <div className="p-3 bg-white border border-slate-200/60 rounded-xl flex flex-col gap-2 sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500">दान क्यूआर कोड इमेज (Donation QR Image):</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  onChange={(e) => handleImageUpload(e, 'donationQR')}
                  accept="image/*"
                  className="text-[10px] max-w-[200px]"
                />
                {uploadingField === 'donationQR' && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />}
              </div>
              <input
                type="text"
                name="donationQR"
                value={form.donationQR}
                onChange={handleChange}
                placeholder="दान क्यूआर चित्र URL"
                className="w-full px-2 py-1 bg-slate-50 border rounded-lg text-[10px]"
              />
              {form.donationQR && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-400">पूर्वावलोकन:</span>
                  <img src={form.donationQR} className="w-14 h-14 object-cover rounded border" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: SPIRITUALS & TIMES */}
        {formTab === 'spiritual' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-1.5 mb-2">
                <BookOpen className="w-4 h-4 text-sky-500" />
                <span>धार्मिक विवरण व आरती दर्शन समय (Spiritual Details)</span>
              </h3>
            </div>

            {/* Morning Opening Time */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">सुबह पट खुलने का समय (Morning Opening):</label>
              <input
                type="text"
                name="morningDarshanTime"
                value={form.morningDarshanTime}
                onChange={handleChange}
                placeholder="उदा. 05:00 AM"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            {/* Evening Opening Time */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">शाम पट खुलने का समय (Evening Opening):</label>
              <input
                type="text"
                name="eveningDarshanTime"
                value={form.eveningDarshanTime}
                onChange={handleChange}
                placeholder="उदा. 04:00 PM"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            {/* About Temple (Hindi description) */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 mb-1">मंदिर के बारे में विवरण (About Temple):</label>
              <textarea
                name="aboutTemple"
                value={form.aboutTemple}
                onChange={handleChange}
                rows={4}
                placeholder="मंदिर का दिव्य आध्यात्मिक परिचय..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Temple History */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 mb-1">मंदिर का इतिहास व धार्मिक मान्यता (Temple History):</label>
              <textarea
                name="templeHistory"
                value={form.templeHistory}
                onChange={handleChange}
                rows={4}
                placeholder="मंदिर का इतिहास और दिव्य मान्यता की गाथा..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none leading-relaxed"
              />
            </div>

          </div>
        )}

        {/* TAB 4: STYLING & COLORS */}
        {formTab === 'styling' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-1.5 mb-2">
                <Palette className="w-4 h-4 text-orange-500" />
                <span>वेबसाइट कस्टमाइजेशन व थीम कलर्स (Styling & Theme Colors)</span>
              </h3>
            </div>

            {/* Primary Theme Color */}
            <div className="p-3 bg-white border border-slate-200/60 rounded-xl flex items-center justify-between">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">प्राथमिक रंग (Primary Theme Color):</label>
                <span className="text-[10px] font-mono font-bold text-slate-400">{form.primaryThemeColor}</span>
              </div>
              <input
                type="color"
                name="primaryThemeColor"
                value={form.primaryThemeColor}
                onChange={handleChange}
                className="w-10 h-8 rounded border cursor-pointer bg-transparent"
              />
            </div>

            {/* Secondary Theme Color */}
            <div className="p-3 bg-white border border-slate-200/60 rounded-xl flex items-center justify-between">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">माध्यमिक रंग (Secondary Theme Color):</label>
                <span className="text-[10px] font-mono font-bold text-slate-400">{form.secondaryThemeColor}</span>
              </div>
              <input
                type="color"
                name="secondaryThemeColor"
                value={form.secondaryThemeColor}
                onChange={handleChange}
                className="w-10 h-8 rounded border cursor-pointer bg-transparent"
              />
            </div>

            {/* Accent Color */}
            <div className="p-3 bg-white border border-slate-200/60 rounded-xl flex items-center justify-between sm:col-span-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">एक्सेंट रंग / केसरिया (Accent / Highlights Color):</label>
                <span className="text-[10px] font-mono font-bold text-slate-400">{form.accentColor}</span>
              </div>
              <input
                type="color"
                name="accentColor"
                value={form.accentColor}
                onChange={handleChange}
                className="w-10 h-8 rounded border cursor-pointer bg-transparent"
              />
            </div>

            {/* Hint details */}
            <div className="sm:col-span-2 bg-amber-50 border border-amber-100 p-3 rounded-xl">
              <p className="text-[10px] leading-relaxed text-amber-800 font-bold">
                🎨 थीम के रंगों को बदलने से मंसा महादेव वेबसाइट का बैकग्राउंड ग्रेडिएंट, बटन्स और हाइलाइट्स वास्तविक समय (Realtime) में बदल जाएंगे!
              </p>
            </div>

          </div>
        )}

        {/* Action Panel Buttons Row */}
        <div className="flex justify-between items-center gap-3 mt-2 pt-3 border-t border-slate-200/50">
          <button
            onClick={resetToDefault}
            className="px-4 py-2 hover:bg-slate-200 text-slate-500 font-bold rounded-xl border border-slate-300 transition"
          >
            मूल डिफ़ॉल्ट रीसेट
          </button>

          <button
            onClick={handleSave}
            disabled={saving || uploadingField !== null}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-emerald-400 disabled:to-teal-400 text-white font-extrabold rounded-xl shadow-md hover:scale-[1.01] transition active:scale-99"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>सहेजा जा रहा है...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-100 fill-emerald-800 animate-bounce" />
                <span>सफलतापूर्वक सुरक्षित हो गया!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>सेटिंग्स सहेजें (Save Settings)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
