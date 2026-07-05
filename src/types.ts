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
  order?: number;
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
  contactPerson: string;
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
  templeLogoUrl?: string;
  festivalBannerUrl?: string;
  timingPatKhulna?: string;
  timingMangalaAarti?: string;
  timingJalabhishek?: string;
  timingNoonClosing?: string;
  timingEveningOpening?: string;
  timingSandhyaAarti?: string;
  timingShayanAarti?: string;
}

export interface TempleEvent {
  id: string;
  bannerUrl: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  isActive: boolean;
  order: number;
  uploadedAt: string;
}

export interface CommitteeMember {
  id: string;
  photoUrl: string;
  name: string;
  designation: string;
  mobile?: string;
  description?: string;
  order: number;
  uploadedAt: string;
}

export interface FestivalBanner {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isEnabled: boolean;
  uploadedAt: string;
  time?: string;
  location?: string;
  specialNote?: string;
}

export interface TempleGalleryItem {
  id: string;
  imageUrl: string;
  caption: string;
  category: 'mandir_parisar' | 'utsav' | 'bhaktimay';
  uploadDate: string; // YYYY-MM-DD
  isActive: boolean;
  uploadedAt: string;
}

export interface SocialShareSettings {
  websiteTitle: string;
  websiteDescription: string;
  websiteShareImageUrl: string;
  faviconUrl?: string;
  defaultShareUrl?: string;
}

export interface DonationMember {
  id: string;
  name: string;
  designation: string;
}

export interface BhajanDocument {
  id: string;
  title: string;
  mediaType: 'pdf' | 'jpg' | 'png';
  mediaUrl: string;
  isOn: boolean;
  uploadedAt: string;
}

export interface DonationSettings {
  isEnabled: boolean;
  qrCodeUrl: string;
  upiId: string;
  upiLink: string;
  message: string;
  committeeName?: string;
  trusteeName?: string;
  members?: DonationMember[];
}

export interface PushNotificationPayload {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  targetUrl?: string;
  sentAt: string;
}

export interface PushNotificationSubscription {
  id: string;
  subscribedAt: string;
  userAgent?: string;
}



