export interface DailyDarshan {
  id: string;
  imageUrl: string;
  date: string; // YYYY-MM-DD or formatted
  festivalName: string;
  description: string;
  uploadedAt: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  date: string;
  festivalName: string;
  description: string;
  uploadedAt: string;
}

export interface VideoDarshan {
  id: string;
  title: string;
  youtubeUrl: string;
  date: string;
  isToday: boolean;
  uploadedAt: string;
}

export interface AartiItem {
  id: string;
  title: string;
  deity: 'Shiv' | 'Hanuman' | 'Ram' | 'Sundarkand' | 'HanumanChalisa' | 'Other';
  hindiTitle: string;
  text: string; // The complete lyrics/text in Hindi
}

export interface BhajanItem {
  id: string;
  title: string;
  singer: string;
  audioUrl: string;
  thumbnailUrl: string;
  duration: string; // e.g., "5:12"
}

export interface TempleInfo {
  about: string;
  history: string;
  contact: {
    phone: string;
    email: string;
    whatsApp: string;
    googleMapsLink: string;
    address: string;
  };
}

export interface TempleTiming {
  id: string;
  event: string;
  time: string;
  description?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'general' | 'festival' | 'alert';
}

export interface TempleSettings {
  templeNameHindi: string;
  templeNameEnglish: string;
  templeLogo: string;
  templeCoverImage: string;
  templeAddress: string;
  village: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  whatsApp: string;
  email: string;
  googleMapsLink: string;
  facebook: string;
  instagram: string;
  youtube: string;
  donationQR: string;
  upiId: string;
  morningDarshanTime: string;
  eveningDarshanTime: string;
  templeHistory: string;
  aboutTemple: string;
  shortDescription: string;
  primaryThemeColor: string;
  secondaryThemeColor: string;
  accentColor: string;
  footerCopyright: string;
  developerName: string;
}

