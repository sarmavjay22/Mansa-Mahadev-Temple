import { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import NotificationBanner from './components/NotificationBanner';
import TodayDarshan from './components/TodayDarshan';
import FestivalBannerSlider from './components/FestivalBannerSlider';
import TodayVideo from './components/TodayVideo';
import AartiSection from './components/AartiSection';
import BhajanSection from './components/BhajanSection';
import TempleGallery from './components/TempleGallery';
import DonationCard from './components/DonationCard';
import TempleInfoSection from './components/TempleInfoSection';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { subscribeToTempleSettings, getCachedTempleSettings } from './lib/settings';
import { TempleSettings } from './types';
import { db, subscribeToDBUpdates } from './lib/db';
import NotificationManager from './components/NotificationManager';

const AdminPanel = lazy(() => import('./components/AdminPanel'));

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [settings, setSettings] = useState<TempleSettings>(getCachedTempleSettings());

  useEffect(() => {
    const unsubscribe = subscribeToTempleSettings((fetched) => {
      setSettings(fetched);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const applySocialShareSettings = () => {
      const shareSettings = db.getSocialShareSettings();
      const currentSettings = getCachedTempleSettings();
      
      const title = shareSettings.websiteTitle || currentSettings.templeNameHindi || "मंसा महादेव मंदिर तितरड़ी, उदयपुर";
      const desc = shareSettings.websiteDescription || currentSettings.aboutTemple || currentSettings.shortDescription || "श्री मंसा महादेव मंदिर तितरड़ी, उदयपुर - दर्शन, आरती, भजन, और दिव्य मंदिर की जानकारी।";
      const image = shareSettings.websiteShareImageUrl || currentSettings.templeCoverImage || "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=1200&auto=format&fit=crop";
      const url = shareSettings.defaultShareUrl || window.location.origin;
      const favicon = shareSettings.faviconUrl || currentSettings.templeLogoUrl;
      const primaryThemeColor = currentSettings.primaryThemeColor || '#e3f2fd';

      // 1. Dynamic Page Title
      document.title = title;

      // Dynamic Meta Tag helper
      const updateMeta = (nameOrProperty: string, content: string, isProperty = true) => {
        const attribute = isProperty ? 'property' : 'name';
        let element = document.querySelector(`meta[${attribute}="${nameOrProperty}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute(attribute, nameOrProperty);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      };

      // 2. Dynamic Meta Description
      updateMeta('description', desc, false);

      // 3. Meta Keywords
      const keywords = `${title}, मंसा महादेव, मनसा महादेव, तितरड़ी, उदयपुर, Mansa Mahadev, Mansa Mahadev Udaipur, Mansa Mahadev Mandir, Mansa Mahadev Titardi, Shiva Temple Udaipur, Shiv Mandir Udaipur`;
      updateMeta('keywords', keywords, false);

      // 4. Canonical URL
      let canonicalLink = document.querySelector("link[rel='canonical']");
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', url);

      // 5. Robots Meta Tag
      updateMeta('robots', 'index, follow', false);

      // 6. Open Graph Metas
      updateMeta('og:type', 'website', true);
      updateMeta('og:title', title, true);
      updateMeta('og:description', desc, true);
      updateMeta('og:image', image, true);
      updateMeta('og:url', url, true);

      // 7. Twitter Card Metas
      updateMeta('twitter:card', 'summary_large_image', false);
      updateMeta('twitter:title', title, false);
      updateMeta('twitter:description', desc, false);
      updateMeta('twitter:image', image, false);

      // 8. Theme Color Meta
      updateMeta('theme-color', primaryThemeColor, false);

      // 9. Favicon & Apple Touch Icon
      if (favicon && favicon.trim()) {
        const cleanedFavicon = favicon.trim();
        // Favicon
        let linkFavicon: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!linkFavicon) {
          linkFavicon = document.createElement('link');
          linkFavicon.rel = 'icon';
          document.head.appendChild(linkFavicon);
        }
        linkFavicon.href = cleanedFavicon;

        // Apple Touch Icon
        let linkApple: HTMLLinkElement | null = document.querySelector("link[rel~='apple-touch-icon']");
        if (!linkApple) {
          linkApple = document.createElement('link');
          linkApple.rel = 'apple-touch-icon';
          document.head.appendChild(linkApple);
        }
        linkApple.href = cleanedFavicon;
      }

      // 10. Structured Data (JSON-LD) for Hindu Temple / Organization
      let jsonLdScript = document.getElementById('temple-jsonld');
      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.id = 'temple-jsonld';
        jsonLdScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(jsonLdScript);
      }
      
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "HinduTemple",
        "name": currentSettings.templeNameHindi || "श्री मंसा महादेव मंदिर",
        "alternateName": currentSettings.templeNameEnglish || "Shree Mansa Mahadev Mandir",
        "description": desc,
        "url": url,
        "logo": currentSettings.templeLogoUrl || favicon || image,
        "image": currentSettings.templeCoverImage || image,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": currentSettings.templeAddress || "तितरड़ी",
          "addressLocality": currentSettings.city || "उदयपुर",
          "addressRegion": currentSettings.state || "राजस्थान",
          "postalCode": currentSettings.pincode || "313001",
          "addressCountry": "IN"
        },
        "telephone": currentSettings.phone || "",
        "email": currentSettings.email || "",
        "sameAs": [
          currentSettings.facebook || "",
          currentSettings.instagram || "",
          currentSettings.youtube || ""
        ].filter(Boolean),
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday"
            ],
            "opens": currentSettings.morningDarshanTime || "05:00",
            "closes": currentSettings.eveningDarshanTime || "21:00"
          }
        ]
      };
      jsonLdScript.innerHTML = JSON.stringify(structuredData);

      // 11. Breadcrumb Schema (JSON-LD)
      let breadcrumbScript = document.getElementById('breadcrumb-jsonld');
      if (!breadcrumbScript) {
        breadcrumbScript = document.createElement('script');
        breadcrumbScript.id = 'breadcrumb-jsonld';
        breadcrumbScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(breadcrumbScript);
      }
      const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": currentSettings.templeNameHindi || "मंसा महादेव मंदिर",
            "item": url
          }
        ]
      };
      breadcrumbScript.innerHTML = JSON.stringify(breadcrumbData);
    };

    // Apply immediately on mount
    applySocialShareSettings();

    // Subscribe to real-time changes
    const unsubscribe = subscribeToDBUpdates(applySocialShareSettings);
    return unsubscribe;
  }, [settings]);

  return (
    <div 
      className="relative min-h-screen text-slate-800 font-sans selection:bg-amber-200 selection:text-amber-950 pb-16 overflow-x-hidden transition-colors duration-500"
      style={{
        background: `linear-gradient(to bottom, ${settings.primaryThemeColor || '#e3f2fd'}, ${settings.secondaryThemeColor || '#f7f9fc'}, ${settings.primaryThemeColor || '#e3f2fd'})`
      }}
    >
      <NotificationManager />
      
      {/* Decorative Aura Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-sky-400/5 via-sky-300/2 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-[30%] left-[-10%] w-72 h-72 bg-amber-400/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-96 h-96 bg-sky-400/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* 1. Header Section */}
      <Header onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* 3. Main Multi-Module Content Stack */}
      <main className="w-full relative z-10 flex flex-col gap-6 mt-2">
        
        {/* 1. "भोलेनाथ के श्रृंगार दर्शन" */}
        <TodayDarshan mode="title" />

        {/* 2. "भोलेनाथ की आरती वीडियो" */}
        <TodayVideo />

        {/* 3. "Image banner" */}
        <TodayDarshan mode="main" />

        {/* 4. "उत्सव बैनर" */}
        <FestivalBannerSlider />

        {/* 5. "उत्सव सूचनाएं" */}
        <NotificationBanner />

        <div className="h-4 md:h-6" />

        {/* 6. "नित्य आरती एवं पाठ संग्रह" */}
        <AartiSection />

        {/* 8. "भक्तिमय भजन संग्रह" */}
        <BhajanSection mode="collection" />

        <div className="h-4 md:h-6" />

        {/* 7. "शिव भजन एवं मंत्र" */}
        <BhajanSection mode="player" />

        {/* 9. "मँदिर दर्शन दीर्घा" */}
        <TempleGallery />

        {/* 10. "मँदिर सेवा एवं दान निधि" */}
        <DonationCard mode="donation" />

        {/* 11. "मँदिर प्रबंधन समिति/ट्रस्टी" */}
        <DonationCard mode="committee" />

        <div className="h-4 md:h-6" />

        {/* 12. "मंदिर परिचय एवं समय सारणी" */}
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
          <h2 className="text-xl md:text-2xl font-black text-amber-700 tracking-widest font-serif drop-shadow-sm">
            ॥ ॐ नमः शिवाय ॥
          </h2>

          {/* Credits */}
          <div className="text-[11px] md:text-xs space-y-1.5">
            <p className="font-black text-slate-700">{settings.footerCopyright || "श्री मंसा महादेव मंदिर सेवा समिति, तितरड़ी, उदयपुर (राज.)"}</p>
            <p className="text-slate-500 font-black">सर्व सुखिनः भवन्तु • समस्त मंगल कामनाएं</p>
            {settings.developerName && (
              <p className="text-amber-800 font-mono text-[10px] md:text-xs font-black mt-2">डिजाइन एवं विकसित: {settings.developerName}</p>
            )}
          </div>
        </div>
      </footer>

      {/* 5. Secure Admin Dashboard Overlay Modal */}
      <AnimatePresence>
        {isAdminOpen && (
          <Suspense fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md text-white font-bold text-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <span>एडमिन पैनल लोड हो रहा है...</span>
              </div>
            </div>
          }>
            <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
