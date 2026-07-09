import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { firestoreDb } from './firebase';
import { TempleSettings } from '../types';

export const DEFAULT_SETTINGS: TempleSettings = {
  templeNameHindi: "मंसा महादेव मंदिर",
  templeNameEnglish: "Mansa Mahadev Temple",
  templeLogo: "/src/assets/images/temple_logo_1782657591698.jpg",
  templeCoverImage: "/src/assets/images/today_shringar_1782657607504.jpg",
  templeAddress: "उपला फलां, तितरड़ी, उदयपुर, राजस्थान - 313002",
  village: "उपला फलां",
  city: "उदयपुर",
  state: "राजस्थान",
  pincode: "313002",
  contactPerson: "सुरेश शर्मा",
  phone: "+91 94142 35890",
  whatsApp: "9414235890",
  email: "contact@mansamahadevtemple.org",
  googleMapsLink: "https://maps.google.com/?q=Mansa+Mahadev+Temple,+Upla+Phalan,+Titrardi,+Udaipur,+Rajasthan",
  facebook: "",
  instagram: "",
  youtube: "",
  donationQR: "",
  upiId: "",
  morningDarshanTime: "05:00 AM",
  eveningDarshanTime: "04:00 PM",
  templeHistory: "यह मंदिर सदियों पुराना माना जाता है, जहाँ पूर्व काल में संतों ने घोर तपस्या की थी। तितरड़ी पहाड़ी और प्राकृतिक चट्टानों के बीच स्थित इस स्थान पर स्वयं महादेव प्रकट हुए थे। स्थानीय ग्रामीणों और दानदाताओं के सहयोग से मंदिर का भव्य जीर्णोद्धार किया गया, जिससे यह आज उदयपुर संभाग के प्रमुख धार्मिक और आध्यात्मिक स्थलों में से एक बन गया है। यहाँ सावन मास, महाशिवरात्रि और प्रत्येक प्रदोष पर विशेष उत्सवों का आयोजन किया जाता है।",
  aboutTemple: "श्री मंसा महादेव मंदिर उदयपुर के तितरड़ी क्षेत्र के उपला फलां में स्थित एक प्राचीन और जागृत शिव धाम है। यहाँ महादेव की पिंडी दिव्य और अलौकिक है। ऐसी मान्यता है कि यहाँ सच्चे मन से मांगी गई हर मन्नत (मंसा) अवश्य पूरी होती है। मंदिर परिसर प्राकृतिक सुंदरता से घिरा हुआ है और श्रद्धालुओं के लिए असीम शांति का केंद्र है।",
  shortDescription: "मंसा महादेव का अलौकिक शिव धाम",
  primaryThemeColor: "#fdf8f5",
  secondaryThemeColor: "#fffbeb",
  accentColor: "#f97316",
  footerCopyright: "श्री मंसा महादेव मंदिर सेवा समिति, तितरड़ी, उदयपुर (राज.)",
  developerName: "Chirag Pharma Software Development Team",
  templeLogoUrl: "",
  festivalBannerUrl: "",
  timingPatKhulna: "05:00 AM",
  timingMangalaAarti: "05:30 AM",
  timingJalabhishek: "06:00 AM - 11:30 AM",
  timingNoonClosing: "12:00 PM - 04:00 PM",
  timingEveningOpening: "04:00 PM",
  timingSandhyaAarti: "07:00 PM",
  timingShayanAarti: "09:00 PM"
};

let currentSettings: TempleSettings = { ...DEFAULT_SETTINGS };

try {
  const cached = localStorage.getItem('mm_templeSettings');
  if (cached) {
    currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
  }
} catch (e) {
  console.error("Failed to load cached settings", e);
}

function handleFirestoreError(error: unknown, operationType: string, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  console.error(`Firestore Error (${operationType} @ ${path}):`, errMsg);
}

export function getCachedTempleSettings(): TempleSettings {
  return currentSettings;
}

export async function updateTempleSettings(settings: Partial<TempleSettings>): Promise<void> {
  const docRef = doc(firestoreDb, 'settings', 'temple');
  const updated = { ...currentSettings, ...settings };
  try {
    await setDoc(docRef, updated, { merge: true });
  } catch (error) {
    handleFirestoreError(error, 'WRITE', 'settings/temple');
  }
}

export function subscribeToTempleSettings(callback: (settings: TempleSettings) => void) {
  const docRef = doc(firestoreDb, 'settings', 'temple');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data() as Partial<TempleSettings>;
      currentSettings = { ...DEFAULT_SETTINGS, ...data };
      localStorage.setItem('mm_templeSettings', JSON.stringify(currentSettings));
      callback(currentSettings);
    } else {
      // If the document does not exist yet, we seed it with the default settings
      setDoc(docRef, DEFAULT_SETTINGS).catch(err => {
        console.error("Error creating default settings doc:", err);
      });
      callback(currentSettings);
    }
  }, (error) => {
    handleFirestoreError(error, 'GET', 'settings/temple');
  });
}
