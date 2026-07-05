import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { db, subscribeToDBUpdates, formatDateDMY } from '../lib/db';
import { NotificationItem, GalleryItem, DailyDarshan, VideoDarshan, FestivalBanner, TempleGalleryItem, DonationMember, BhajanDocument, PushNotificationPayload, PushNotificationSubscription } from '../types';
import { uploadToImageKit } from '../lib/imagekit';
import { 
  ShieldCheck, 
  X, 
  LogIn, 
  LogOut, 
  Database, 
  Bell, 
  Plus, 
  Trash2, 
  BarChart3, 
  Image, 
  Upload, 
  Check, 
  Loader2, 
  Lock,
  Eye,
  Info,
  Sliders,
  Sparkles,
  Settings,
  Edit2,
  Youtube,
  Video,
  Calendar,
  Share2,
  Heart,
  BookOpen,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TempleSettingsTab from './TempleSettingsTab';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(db.isAdminLoggedIn());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'notifications' | 'upload_gallery' | 'upload_video' | 'temple_settings' | 'festival_banners' | 'temple_gallery' | 'social_share' | 'donation' | 'bhajan_documents' | 'push_notifications'>('overview');

  // Push Notifications Admin State
  const [pushTitle, setPushTitle] = useState('');
  const [pushMsg, setPushMsg] = useState('');
  const [pushImageUrl, setPushImageUrl] = useState('');
  const [pushTargetUrl, setPushTargetUrl] = useState('');
  const [pushSuccess, setPushSuccess] = useState(false);
  const [pushSending, setPushSending] = useState(false);
  const [sentPushList, setSentPushList] = useState<PushNotificationPayload[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);

  // Stats State
  const [stats, setStats] = useState({
    galleryCount: 0,
    videoCount: 0,
    bhajanCount: 0,
    notificationCount: 0,
    bannerCount: 0,
    templeGalleryCount: 0,
    bhajanDocCount: 0,
  });

  // Gallery order states
  const [galOrder, setGalOrder] = useState<number>(0);
  const [editGalOrder, setEditGalOrder] = useState<number>(0);

  // Notifications State
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [newNotifTitle, setNewNotifTitle] = useState('');
  const [newNotifMsg, setNewNotifMsg] = useState('');
  const [newNotifType, setNewNotifType] = useState<'general' | 'festival' | 'alert'>('general');

  // Gallery Uploader State
  const [galDate, setGalDate] = useState(new Date().toISOString().split('T')[0]);
  const [galFestival, setGalFestival] = useState('');
  const [galDesc, setGalDesc] = useState('');
  const [galImage, setGalImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [galSuccess, setGalSuccess] = useState(false);

  // Today's Darshan (दैनिक श्रृंगार दर्शन) State
  const [todayDate, setTodayDate] = useState('');
  const [todayFestival, setTodayFestival] = useState('');
  const [todayDesc, setTodayDesc] = useState('');
  const [todayImage, setTodayImage] = useState('');
  const [todayUploading, setTodayUploading] = useState(false);
  const [todaySuccess, setTodaySuccess] = useState(false);
  const [shringarTabMode, setShringarTabMode] = useState<'today' | 'gallery'>('today');

  // Video Uploader State
  const [videoTodayDate, setVideoTodayDate] = useState('');
  const [videoTodayTitle, setVideoTodayTitle] = useState('');
  const [videoTodayUrl, setVideoTodayUrl] = useState('');
  const [videoTodaySuccess, setVideoTodaySuccess] = useState(false);

  const [videoGalDate, setVideoGalDate] = useState(new Date().toISOString().split('T')[0]);
  const [videoGalTitle, setVideoGalTitle] = useState('');
  const [videoGalUrl, setVideoGalUrl] = useState('');
  const [videoGalSuccess, setVideoGalSuccess] = useState(false);

  const [videoTabMode, setVideoTabMode] = useState<'today' | 'gallery'>('today');

  // Video list and inline editing states
  const [videoList, setVideoList] = useState<VideoDarshan[]>([]);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editVideoTitle, setEditVideoTitle] = useState('');
  const [editVideoDate, setEditVideoDate] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editVideoIsToday, setEditVideoIsToday] = useState(false);
  const [deleteConfirmVideoId, setDeleteConfirmVideoId] = useState<string | null>(null);

  // Gallery list and inline editing states
  const [galList, setGalList] = useState<GalleryItem[]>([]);
  const [editingGalId, setEditingGalId] = useState<string | null>(null);
  const [editGalFestival, setEditGalFestival] = useState('');
  const [editGalDate, setEditGalDate] = useState('');
  const [editGalDesc, setEditGalDesc] = useState('');
  const [editGalImage, setEditGalImage] = useState('');
  const [deleteConfirmGalId, setDeleteConfirmGalId] = useState<string | null>(null);
  const [deleteConfirmNotifId, setDeleteConfirmNotifId] = useState<string | null>(null);

  // Festival Banners State
  const [banners, setBanners] = useState<FestivalBanner[]>([]);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerDesc, setBannerDesc] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerStartDate, setBannerStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [bannerEndDate, setBannerEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [bannerIsEnabled, setBannerIsEnabled] = useState(true);
  const [bannerSuccess, setBannerSuccess] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerTime, setBannerTime] = useState('');
  const [bannerLocation, setBannerLocation] = useState('');
  const [bannerSpecialNote, setBannerSpecialNote] = useState('');

  // Editing Festival Banner States
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [editBannerTitle, setEditBannerTitle] = useState('');
  const [editBannerDesc, setEditBannerDesc] = useState('');
  const [editBannerImageUrl, setEditBannerImageUrl] = useState('');
  const [editBannerStartDate, setEditBannerStartDate] = useState('');
  const [editBannerEndDate, setEditBannerEndDate] = useState('');
  const [editBannerIsEnabled, setEditBannerIsEnabled] = useState(true);
  const [editBannerTime, setEditBannerTime] = useState('');
  const [editBannerLocation, setEditBannerLocation] = useState('');
  const [editBannerSpecialNote, setEditBannerSpecialNote] = useState('');
  const [deleteConfirmBannerId, setDeleteConfirmBannerId] = useState<string | null>(null);

  // Temple Gallery states
  const [templeGalList, setTempleGalList] = useState<TempleGalleryItem[]>([]);
  const [newTgImage, setNewTgImage] = useState('');
  const [newTgCaption, setNewTgCaption] = useState('');
  const [newTgCategory, setNewTgCategory] = useState<'mandir_parisar' | 'utsav' | 'bhaktimay'>('mandir_parisar');
  const [newTgDate, setNewTgDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTgIsActive, setNewTgIsActive] = useState(true);
  const [tgUploading, setTgUploading] = useState(false);
  const [tgSuccess, setTgSuccess] = useState(false);

  const [editingTgId, setEditingTgId] = useState<string | null>(null);
  const [editTgImage, setEditTgImage] = useState('');
  const [editTgCaption, setEditTgCaption] = useState('');
  const [editTgCategory, setEditTgCategory] = useState<'mandir_parisar' | 'utsav' | 'bhaktimay'>('mandir_parisar');
  const [editTgDate, setEditTgDate] = useState('');
  const [editTgIsActive, setEditTgIsActive] = useState(true);
  const [deleteConfirmTgId, setDeleteConfirmTgId] = useState<string | null>(null);

  // Social Share Settings State
  const [ssTitle, setSsTitle] = useState('');
  const [ssDescription, setSsDescription] = useState('');
  const [ssShareImageUrl, setSsShareImageUrl] = useState('');
  const [ssFaviconUrl, setSsFaviconUrl] = useState('');
  const [ssDefaultShareUrl, setSsDefaultShareUrl] = useState('');
  const [ssSuccess, setSsSuccess] = useState(false);
  const [ssUploading, setSsUploading] = useState(false);
  const [ssFaviconError, setSsFaviconError] = useState(false);
  const [ssFaviconValidating, setSsFaviconValidating] = useState(false);

  // Donation Settings State
  const [donationEnabled, setDonationEnabled] = useState(true);
  const [donationQRCode, setDonationQRCode] = useState('');
  const [donationUPIId, setDonationUPIId] = useState('');
  const [donationUPILink, setDonationUPILink] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [donationCommitteeName, setDonationCommitteeName] = useState('');
  const [donationTrusteeName, setDonationTrusteeName] = useState('');
  const [donationMembers, setDonationMembers] = useState<DonationMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberDesignation, setNewMemberDesignation] = useState('');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [donationSuccess, setDonationSuccess] = useState(false);

  // Bhajan Documents State
  const [bhajanDocs, setBhajanDocs] = useState<BhajanDocument[]>([]);
  const [newBdocTitle, setNewBdocTitle] = useState('');
  const [newBdocMediaType, setNewBdocMediaType] = useState<'pdf' | 'jpg' | 'png'>('pdf');
  const [newBdocMediaUrl, setNewBdocMediaUrl] = useState('');
  const [newBdocIsOn, setNewBdocIsOn] = useState(true);
  const [editingBdocId, setEditingBdocId] = useState<string | null>(null);
  const [editBdocTitle, setEditBdocTitle] = useState('');
  const [editBdocMediaType, setEditBdocMediaType] = useState<'pdf' | 'jpg' | 'png'>('pdf');
  const [editBdocMediaUrl, setEditBdocMediaUrl] = useState('');
  const [editBdocIsOn, setEditBdocIsOn] = useState(true);
  const [deleteConfirmBdocId, setDeleteConfirmBdocId] = useState<string | null>(null);
  const [bdocSuccess, setBdocSuccess] = useState(false);

  useEffect(() => {
    const trimmed = ssFaviconUrl.trim();
    if (!trimmed) {
      setSsFaviconError(false);
      setSsFaviconValidating(false);
      return;
    }

    setSsFaviconValidating(true);
    const img = new window.Image();
    img.src = trimmed;
    
    let isMounted = true;
    img.onload = () => {
      if (isMounted) {
        setSsFaviconError(false);
        setSsFaviconValidating(false);
      }
    };
    img.onerror = () => {
      if (isMounted) {
        setSsFaviconError(true);
        setSsFaviconValidating(false);
      }
    };

    return () => {
      isMounted = false;
    };
  }, [ssFaviconUrl]);

  const handleSsImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSsUploading(true);
      const url = await uploadToImageKit(file);
      setSsShareImageUrl(url);
    } catch (err) {
      console.error(err);
      alert("चित्र अपलोड विफल हुआ!");
    } finally {
      setSsUploading(false);
    }
  };

  const handleSaveSocialShareSettings = async () => {
    if (!ssTitle.trim() || !ssDescription.trim() || !ssShareImageUrl.trim()) {
      alert("कृपया वेबसाइट का शीर्षक, विवरण और शेयर चित्र यूआरएल अवश्य दर्ज करें।");
      return;
    }

    if (ssFaviconUrl.trim() && ssFaviconError) {
      const proceed = window.confirm("चेतावनी: दर्ज किया गया फेविकॉन यूआरएल (Favicon URL) अमान्य है या लोड नहीं हो रहा है। क्या आप अभी भी इसे सहेजना चाहते हैं?");
      if (!proceed) return;
    }

    try {
      await db.updateSocialShareSettings({
        websiteTitle: ssTitle.trim(),
        websiteDescription: ssDescription.trim(),
        websiteShareImageUrl: ssShareImageUrl.trim(),
        faviconUrl: ssFaviconUrl.trim(),
        defaultShareUrl: ssDefaultShareUrl.trim()
      });
      setSsSuccess(true);
      setTimeout(() => setSsSuccess(false), 2000);
      alert("सोशल शेयर सेटिंग्स सफलतापूर्वक अपडेट कर दी गई हैं!");
    } catch (err) {
      console.error(err);
      alert("सेटिंग्स सहेजने में त्रुटि आई!");
    }
  };

  const handleSaveDonationSettings = async () => {
    if (!donationUPIId.trim()) {
      alert("कृपया यूपीआई आईडी (UPI ID) दर्ज करें।");
      return;
    }
    try {
      await db.updateDonationSettings({
        isEnabled: donationEnabled,
        qrCodeUrl: donationQRCode.trim(),
        upiId: donationUPIId.trim(),
        upiLink: donationUPILink.trim(),
        message: donationMessage.trim(),
        committeeName: donationCommitteeName.trim(),
        trusteeName: donationTrusteeName.trim(),
        members: donationMembers
      });
      setDonationSuccess(true);
      setTimeout(() => setDonationSuccess(false), 2000);
      alert("मंदिर सेवा एवं दान सेटिंग्स सफलतापूर्वक अपडेट कर दी गई हैं!");
    } catch (err) {
      console.error(err);
      alert("मंदिर सेवा एवं दान सेटिंग्स सहेजने में त्रुटि आई!");
    }
  };

  const handleAddOrEditDonationMember = () => {
    if (!newMemberName.trim() || !newMemberDesignation.trim()) {
      alert("कृपया नाम और पद दोनों दर्ज करें।");
      return;
    }

    if (editingMemberId) {
      // Edit existing
      setDonationMembers(prev => prev.map(m => m.id === editingMemberId ? {
        ...m,
        name: newMemberName.trim(),
        designation: newMemberDesignation.trim()
      } : m));
      setEditingMemberId(null);
    } else {
      // Add new
      const newMember: DonationMember = {
        id: 'dm_' + Date.now(),
        name: newMemberName.trim(),
        designation: newMemberDesignation.trim()
      };
      setDonationMembers(prev => [...prev, newMember]);
    }

    setNewMemberName('');
    setNewMemberDesignation('');
  };

  const handleStartEditDonationMember = (member: DonationMember) => {
    setEditingMemberId(member.id);
    setNewMemberName(member.name);
    setNewMemberDesignation(member.designation);
  };

  const handleDeleteDonationMember = (id: string) => {
    if (confirm("क्या आप इस सदस्य को हटाना चाहते हैं?")) {
      setDonationMembers(prev => prev.filter(m => m.id !== id));
      if (editingMemberId === id) {
        setEditingMemberId(null);
        setNewMemberName('');
        setNewMemberDesignation('');
      }
    }
  };

  const handleCancelEditDonationMember = () => {
    setEditingMemberId(null);
    setNewMemberName('');
    setNewMemberDesignation('');
  };

  useEffect(() => {
    setIsLoggedIn(db.isAdminLoggedIn());
    loadDashboardData();

    const unsubscribe = subscribeToDBUpdates(() => {
      setIsLoggedIn(db.isAdminLoggedIn());
      loadDashboardData();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (activeTab === 'upload_gallery') {
      const current = db.getDailyDarshan();
      if (current) {
        setTodayDate(current.date);
        setTodayFestival(current.festivalName || '');
        setTodayDesc(current.description || '');
        setTodayImage(current.imageUrl || '');
      }
    } else if (activeTab === 'upload_video') {
      const currentVideo = db.getTodayVideo();
      if (currentVideo) {
        setVideoTodayDate(currentVideo.date);
        setVideoTodayTitle(currentVideo.title || '');
        setVideoTodayUrl(currentVideo.youtubeUrl || '');
      } else {
        setVideoTodayDate(new Date().toISOString().split('T')[0]);
        setVideoTodayTitle('');
        setVideoTodayUrl('');
      }
    } else if (activeTab === 'social_share') {
      const settings = db.getSocialShareSettings();
      setSsTitle(settings.websiteTitle || '');
      setSsDescription(settings.websiteDescription || '');
      setSsShareImageUrl(settings.websiteShareImageUrl || '');
      setSsFaviconUrl(settings.faviconUrl || '');
      setSsDefaultShareUrl(settings.defaultShareUrl || '');
    } else if (activeTab === 'donation') {
      const dSettings = db.getDonationSettings();
      setDonationEnabled(dSettings.isEnabled);
      setDonationQRCode(dSettings.qrCodeUrl || '');
      setDonationUPIId(dSettings.upiId || '');
      setDonationUPILink(dSettings.upiLink || '');
      setDonationMessage(dSettings.message || '');
      setDonationCommitteeName(dSettings.committeeName || '');
      setDonationTrusteeName(dSettings.trusteeName || '');
      setDonationMembers(dSettings.members || []);
    }
  }, [activeTab]);

  const loadDashboardData = () => {
    const galleryItems = db.getGallery();
    const videoItems = db.getVideos();
    const bhajanItems = db.getBhajans();
    const notificationItems = db.getNotifications();
    const bannerItems = db.getFestivalBanners();
    const templeGalleryItems = db.getTempleGallery();
    const bhajanDocItems = db.getBhajanDocuments();
    const pushSubscribers = db.getPushSubscriptions();
    const pushList = db.getPushNotifications();

    setStats({
      galleryCount: galleryItems.length,
      videoCount: videoItems.length,
      bhajanCount: bhajanItems.length,
      notificationCount: notificationItems.length,
      bannerCount: bannerItems.length,
      templeGalleryCount: templeGalleryItems.length,
      bhajanDocCount: bhajanDocItems.length,
    });

    setNotifs(notificationItems);
    setGalList(galleryItems);
    setVideoList(videoItems);
    setBanners(bannerItems);
    setTempleGalList(templeGalleryItems);
    setBhajanDocs(bhajanDocItems);
    setSubscriberCount(pushSubscribers.length);
    setSentPushList(pushList);
  };

  const handleTgImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setTgUploading(true);
      const url = await uploadToImageKit(file);
      setNewTgImage(url);
    } catch (err) {
      console.error(err);
      alert("चित्र अपलोड विफल हुआ!");
    } finally {
      setTgUploading(false);
    }
  };

  const handleEditTgImageUpload = async (e: ChangeEvent<HTMLInputElement>, id?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setTgUploading(true);
      const url = await uploadToImageKit(file);
      setEditTgImage(url);
      if (id) {
        await db.updateTempleGalleryItem(id, { imageUrl: url });
      }
    } catch (err) {
      console.error(err);
      alert("चित्र अपलोड विफल हुआ!");
    } finally {
      setTgUploading(false);
    }
  };

  const handleAddTempleGallery = () => {
    if (!newTgImage || !newTgCaption.trim() || !newTgDate) {
      alert("कृपया चित्र का चयन करें, विवरण और तारीख भरें।");
      return;
    }
    db.addTempleGalleryItem({
      imageUrl: newTgImage,
      caption: newTgCaption.trim(),
      category: newTgCategory,
      uploadDate: newTgDate,
      isActive: newTgIsActive
    });
    setNewTgImage('');
    setNewTgCaption('');
    setNewTgCategory('mandir_parisar');
    setNewTgDate(new Date().toISOString().split('T')[0]);
    setNewTgIsActive(true);
    setTgSuccess(true);
    setTimeout(() => setTgSuccess(false), 1500);
    alert("गैलरी चित्र सफलतापूर्वक जोड़ दिया गया है!");
  };

  const handleStartEditTg = (item: TempleGalleryItem) => {
    setEditingTgId(item.id);
    setEditTgImage(item.imageUrl);
    setEditTgCaption(item.caption);
    setEditTgCategory(item.category);
    setEditTgDate(item.uploadDate);
    setEditTgIsActive(item.isActive);
  };

  const handleUpdateTempleGallery = (id: string) => {
    if (!editTgImage || !editTgCaption.trim() || !editTgDate) {
      alert("कृपया चित्र, विवरण और तारीख दर्ज करें।");
      return;
    }
    db.updateTempleGalleryItem(id, {
      imageUrl: editTgImage,
      caption: editTgCaption.trim(),
      category: editTgCategory,
      uploadDate: editTgDate,
      isActive: editTgIsActive
    });
    setEditingTgId(null);
    alert("चित्र विवरण सफलतापूर्वक अपडेट किया गया!");
  };

  const handleDeleteTempleGallery = (id: string) => {
    db.deleteTempleGalleryItem(id);
    setDeleteConfirmTgId(null);
    alert("गैलरी चित्र सफलतापूर्वक हटा दिया गया है!");
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const success = db.loginAdmin(email, password);
    if (success) {
      setEmail('');
      setPassword('');
    } else {
      setLoginError('अमान्य ईमेल या पासवर्ड! कृपया दोबारा प्रयास करें।');
    }
  };

  const handleLogout = () => {
    db.logoutAdmin();
    setActiveTab('overview');
  };

  // Add notification
  const handleAddNotification = () => {
    if (!newNotifTitle.trim() || !newNotifMsg.trim()) {
      alert("शीर्षक और विवरण दोनों भरना आवश्यक है।");
      return;
    }

    db.addNotification({
      title: newNotifTitle.trim(),
      message: newNotifMsg.trim(),
      type: newNotifType
    });

    setNewNotifTitle('');
    setNewNotifMsg('');
    alert("नई घोषणा (Notification) सफलतापूर्वक प्रकाशित हो गई है!");
  };

  const handleDeleteNotification = (id: string) => {
    db.deleteNotification(id);
  };

  // Festival banner image upload
  const handleBannerImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBannerUploading(true);
      const url = await uploadToImageKit(file);
      setBannerImageUrl(url);
    } catch (err) {
      console.error(err);
      alert("उत्सव बैनर चित्र अपलोड विफल हुआ!");
    } finally {
      setBannerUploading(false);
    }
  };

  const handleEditBannerImageUpload = async (e: ChangeEvent<HTMLInputElement>, bannerId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBannerUploading(true);
      const url = await uploadToImageKit(file);
      setEditBannerImageUrl(url);
      if (bannerId) {
        // Persist the updated image URL to the existing database record immediately to preserve all other fields
        await db.updateFestivalBanner(bannerId, { imageUrl: url });
      }
    } catch (err) {
      console.error(err);
      alert("उत्सव बैनर चित्र अपलोड विफल हुआ!");
    } finally {
      setBannerUploading(false);
    }
  };

  const handleAddFestivalBanner = () => {
    if (!bannerTitle.trim() || !bannerImageUrl || !bannerStartDate || !bannerEndDate) {
      alert("कृपया उत्सव बैनर का शीर्षक, चित्र और तारीखें भरें।");
      return;
    }

    db.addFestivalBanner({
      title: bannerTitle.trim(),
      description: bannerDesc.trim() || "",
      imageUrl: bannerImageUrl,
      startDate: bannerStartDate,
      endDate: bannerEndDate,
      isEnabled: bannerIsEnabled,
      time: bannerTime.trim(),
      location: bannerLocation.trim(),
      specialNote: bannerSpecialNote.trim()
    });

    setBannerTitle("");
    setBannerDesc("");
    setBannerImageUrl("");
    setBannerStartDate(new Date().toISOString().split("T")[0]);
    setBannerEndDate(new Date().toISOString().split("T")[0]);
    setBannerIsEnabled(true);
    setBannerTime("");
    setBannerLocation("");
    setBannerSpecialNote("");

    setBannerSuccess(true);
    setTimeout(() => {
      setBannerSuccess(false);
    }, 1500);
    alert("नया उत्सव बैनर सफलतापूर्वक जोड़ दिया गया है!");
  };

  const handleUpdateFestivalBanner = (id: string) => {
    if (!editBannerTitle.trim() || !editBannerImageUrl || !editBannerStartDate || !editBannerEndDate) {
      alert("कृपया उत्सव बैनर का शीर्षक, चित्र और तारीखें भरें।");
      return;
    }

    db.updateFestivalBanner(id, {
      title: editBannerTitle.trim(),
      description: editBannerDesc.trim() || "",
      imageUrl: editBannerImageUrl,
      startDate: editBannerStartDate,
      endDate: editBannerEndDate,
      isEnabled: editBannerIsEnabled,
      time: editBannerTime.trim(),
      location: editBannerLocation.trim(),
      specialNote: editBannerSpecialNote.trim()
    });

    setEditingBannerId(null);
    alert("उत्सव बैनर सफलतापूर्वक अपडेट हो गया है!");
  };

  const handleDeleteFestivalBanner = (id: string) => {
    db.deleteFestivalBanner(id);
    alert("उत्सव बैनर सफलतापूर्वक हटा दिया गया है!");
  };

  // Upload today's darshan image
  const handleTodayImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setTodayUploading(true);
      const url = await uploadToImageKit(file);
      setTodayImage(url);
    } catch (err) {
      console.error(err);
      alert("आज का चित्र अपलोड विफल हुआ!");
    } finally {
      setTodayUploading(false);
    }
  };

  const handleSaveTodayDarshan = () => {
    if (!todayImage || !todayDate) {
      alert("कृपया आज का दर्शन चित्र और तारीख दर्ज करें।");
      return;
    }

    db.updateDailyDarshan({
      imageUrl: todayImage,
      date: todayDate,
      festivalName: todayFestival.trim() || "दैनिक श्रृंगार दर्शन",
      description: todayDesc.trim() || "मंसा महादेव का आज का अलौकिक श्रृंगार दर्शन।"
    });

    setTodaySuccess(true);
    setTodayImage(""); // Clear the image link column as requested
    setTimeout(() => {
      setTodaySuccess(false);
    }, 1500);
    alert("भोलेनाथ के श्रृंगार दर्शन सफलतापूर्वक अपडेट हो गए हैं!");
  };

  // Upload gallery item
  const handleGalleryImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadToImageKit(file);
      setGalImage(url);
    } catch (err) {
      console.error(err);
      alert("चित्र अपलोड विफल हुआ!");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveGalleryItem = () => {
    if (!galImage || !galDate) {
      alert("चित्र और तारीख का चयन करना आवश्यक है।");
      return;
    }

    db.addGalleryItem({
      imageUrl: galImage,
      date: galDate,
      festivalName: galFestival.trim() || "दैनिक श्रृंगार दर्शन",
      description: galDesc.trim() || "मंसा महादेव का अलौकिक दर्शन।",
      order: Number(galOrder) || 0
    });

    setGalSuccess(true);
    setTimeout(() => {
      setGalSuccess(false);
      setGalFestival('');
      setGalDesc('');
      setGalImage('');
      setGalOrder(0);
    }, 1500);
  };

  const handleStartEditGal = (item: GalleryItem) => {
    setEditingGalId(item.id);
    setEditGalFestival(item.festivalName || '');
    setEditGalDate(item.date || '');
    setEditGalDesc(item.description || '');
    setEditGalImage(item.imageUrl || '');
    setEditGalOrder((item as any).order || 0);
  };

  const handleCancelEditGal = () => {
    setEditingGalId(null);
  };

  const handleSaveEditGal = () => {
    if (!editGalImage || !editGalDate) {
      alert("कृपया चित्र और तारीख का चयन करें।");
      return;
    }

    db.updateGalleryItem(editingGalId!, {
      festivalName: editGalFestival.trim(),
      date: editGalDate,
      description: editGalDesc.trim(),
      imageUrl: editGalImage,
      order: Number(editGalOrder) || 0
    });

    setEditingGalId(null);
    alert("श्रृंगार चित्र सफलतापूर्वक अपडेट किया गया!");
  };

  const handleDeleteGal = (id: string) => {
    db.deleteGalleryItem(id);
  };

  const handleMoveGallery = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galList.length) return;
    
    const currentItem = galList[index];
    const otherItem = galList[targetIndex];
    
    const currentOrder = currentItem.order !== undefined ? currentItem.order : index;
    const otherOrder = otherItem.order !== undefined ? otherItem.order : targetIndex;
    
    await db.updateGalleryItem(currentItem.id, { order: otherOrder });
    await db.updateGalleryItem(otherItem.id, { order: currentOrder });
  };

  const handleEditGalImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadToImageKit(file);
      setEditGalImage(url);
    } catch (err) {
      console.error(err);
      alert("चित्र अपलोड विफल हुआ!");
    } finally {
      setUploading(false);
    }
  };

  // Save today's video
  const handleSaveTodayVideo = () => {
    if (!videoTodayUrl || !videoTodayDate) {
      alert("कृपया आज का वीडियो लिंक और तारीख दर्ज करें।");
      return;
    }

    db.addVideo({
      title: videoTodayTitle.trim() || "दैनिक आरती वीडियो",
      youtubeUrl: videoTodayUrl.trim(),
      date: videoTodayDate,
      isToday: true
    });

    setVideoTodaySuccess(true);
    setTimeout(() => {
      setVideoTodaySuccess(false);
    }, 1500);
    alert("भोलेनाथ की आज की आरती वीडियो सफलतापूर्वक अपडेट हो गई है!");
  };

  // Add past/gallery video
  const handleSaveGalleryVideo = () => {
    if (!videoGalUrl || !videoGalDate) {
      alert("कृपया वीडियो लिंक और तारीख दर्ज करें।");
      return;
    }

    db.addVideo({
      title: videoGalTitle.trim() || "दिव्य आरती वीडियो",
      youtubeUrl: videoGalUrl.trim(),
      date: videoGalDate,
      isToday: false
    });

    setVideoGalSuccess(true);
    setTimeout(() => {
      setVideoGalSuccess(false);
      setVideoGalTitle('');
      setVideoGalUrl('');
    }, 1500);
    alert("आरती वीडियो सफलतापूर्वक गैलरी में जोड़ दिया गया है!");
  };

  // Start editing video
  const handleStartEditVideo = (item: VideoDarshan) => {
    setEditingVideoId(item.id);
    setEditVideoTitle(item.title || '');
    setEditVideoDate(item.date || '');
    setEditVideoUrl(item.youtubeUrl || '');
    setEditVideoIsToday(item.isToday || false);
  };

  // Cancel edit
  const handleCancelEditVideo = () => {
    setEditingVideoId(null);
  };

  // Save edit
  const handleSaveEditVideo = () => {
    if (!editVideoUrl || !editVideoDate) {
      alert("कृपया वीडियो लिंक और तारीख का चयन करें।");
      return;
    }

    db.updateVideo(editingVideoId!, {
      title: editVideoTitle.trim(),
      date: editVideoDate,
      youtubeUrl: editVideoUrl.trim(),
      isToday: editVideoIsToday
    });

    setEditingVideoId(null);
    alert("आरती वीडियो सफलतापूर्वक अपडेट किया गया!");
  };

  // Delete video
  const handleDeleteVideo = (id: string) => {
    db.deleteVideo(id);
  };

  // Bhajan Documents CRUD Handlers
  const handleAddBhajanDocument = async () => {
    if (!newBdocTitle.trim() || !newBdocMediaUrl.trim()) {
      alert("कृपया शीर्षक और यूआरएल (URL) दोनों दर्ज करें।");
      return;
    }
    
    await db.addBhajanDocument({
      title: newBdocTitle.trim(),
      mediaType: newBdocMediaType,
      mediaUrl: newBdocMediaUrl.trim(),
      isOn: newBdocIsOn
    });

    setNewBdocTitle('');
    setNewBdocMediaUrl('');
    setNewBdocIsOn(true);
    setBdocSuccess(true);
    setTimeout(() => setBdocSuccess(false), 1500);
    alert("भजन संग्रह दस्तावेज़ सफलतापूर्वक जोड़ा गया!");
  };

  const handleStartEditBdoc = (item: BhajanDocument) => {
    setEditingBdocId(item.id);
    setEditBdocTitle(item.title);
    setEditBdocMediaType(item.mediaType);
    setEditBdocMediaUrl(item.mediaUrl);
    setEditBdocIsOn(item.isOn);
  };

  const handleUpdateBhajanDocument = async (id: string) => {
    if (!editBdocTitle.trim() || !editBdocMediaUrl.trim()) {
      alert("कृपया शीर्षक और यूआरएल (URL) दर्ज करें।");
      return;
    }
    await db.updateBhajanDocument(id, {
      title: editBdocTitle.trim(),
      mediaType: editBdocMediaType,
      mediaUrl: editBdocMediaUrl.trim(),
      isOn: editBdocIsOn
    });
    setEditingBdocId(null);
    alert("भजन संग्रह दस्तावेज़ सफलतापूर्वक अपडेट किया गया!");
  };

  const handleDeleteBhajanDocument = async (id: string) => {
    await db.deleteBhajanDocument(id);
    setDeleteConfirmBdocId(null);
    alert("भजन संग्रह दस्तावेज़ सफलतापूर्वक हटा दिया गया!");
  };

  const handleSendPush = async (e: FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushMsg.trim()) {
      alert("कृपया अधिसूचना का शीर्षक और संदेश दर्ज करें।");
      return;
    }

    try {
      setPushSending(true);
      await db.sendPushNotification({
        title: pushTitle.trim(),
        message: pushMsg.trim(),
        imageUrl: pushImageUrl.trim() || undefined,
        targetUrl: pushTargetUrl.trim() || undefined
      });

      setPushTitle('');
      setPushMsg('');
      setPushImageUrl('');
      setPushTargetUrl('');
      setPushSuccess(true);
      setTimeout(() => setPushSuccess(false), 2000);
      alert("पुश नोटिफिकेशन सफलतापूर्वक भेजा गया!");
    } catch (err) {
      console.error(err);
      alert("पुश नोटिफिकेशन भेजने में त्रुटि हुई!");
    } finally {
      setPushSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        className="w-full max-w-2xl bg-white border border-sky-100 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] text-slate-700"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-sky-100 bg-gradient-to-r from-amber-50 to-orange-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500 fill-amber-100 animate-pulse" />
            <h2 className={`text-md md:text-lg font-extrabold tracking-wide ${isLoggedIn ? 'text-orange-500' : 'text-slate-800'}`}>
              {isLoggedIn ? 'मंसा महादेव प्रबंधन पैनल (Dashboard)' : 'सुरक्षित प्रबंधक लॉगिन'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto">
          {/* A. NOT LOGGED IN - SHOW LOGIN FORM */}
          {!isLoggedIn ? (
            <div className="p-6 md:p-8 flex flex-col items-center">
              {/* Shield/Lock Aura */}
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 shadow">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>

              <p className="text-xs text-slate-500 text-center max-w-sm mb-6 font-medium">
                यह अनुभाग केवल मंसा महादेव मंदिर के अधिकृत पुजारियों एवं प्रबंधकों के लिए सुरक्षित है।
              </p>

              <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">प्रबंधक ईमेल:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@mansamahadev.com"
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">पासवर्ड:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>

                {/* Login hint credentials so that developer testing is extremely simple */}
                <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl text-[10px] text-sky-700 font-bold">
                  🔐 परीक्षण क्रेडेंशियल्स (Testing Credentials):<br />
                  • ईमेल: <span className="font-mono text-slate-900 select-all">admin@mansamahadev.com</span><br />
                  • पासवर्ड: <span className="font-mono text-slate-900 select-all">admin</span>
                </div>

                {/* Error */}
                {loginError && (
                  <p className="text-xs text-rose-500 font-bold bg-rose-50 border border-rose-100 p-2.5 rounded-xl">{loginError}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-xl shadow-md transition duration-300 hover:scale-[1.01] active:scale-99 flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>प्रवेश करें</span>
                </button>
              </form>
            </div>
          ) : (
            
            // B. LOGGED IN - SHOW CENTRALIZED DASHBOARD
            <div className="flex flex-col">
              
              {/* Dashboard Sub Tabs Navigation */}
              <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none border-b border-sky-100 bg-sky-50/20 text-xs font-bold shrink-0 select-none">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 min-w-[100px] py-3.5 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'overview' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>सांख्यिकी एवं निर्देश</span>
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex-1 min-w-[100px] py-3.5 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'notifications' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>उत्सव सूचनाएं ({stats.notificationCount})</span>
                </button>

                <button
                  onClick={() => setActiveTab('upload_gallery')}
                  className={`flex-1 min-w-[100px] py-3.5 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'upload_gallery' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Image className="w-4 h-4" />
                  <span>श्रृंगार दर्शन</span>
                </button>

                <button
                  onClick={() => setActiveTab('upload_video')}
                  className={`flex-1 min-w-[100px] py-3.5 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'upload_video' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Youtube className="w-4 h-4 text-red-600 fill-red-100" />
                  <span>आरती वीडियो</span>
                </button>

                <button
                  onClick={() => setActiveTab('festival_banners')}
                  className={`flex-1 min-w-[100px] py-3.5 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'festival_banners' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>उत्सव बैनर ({stats.bannerCount})</span>
                </button>

                <button
                  onClick={() => setActiveTab('temple_gallery')}
                  className={`flex-1 min-w-[100px] py-3.5 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'temple_gallery' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Image className="w-4 h-4 text-amber-500" />
                  <span>मंदिर गैलरी ({stats.templeGalleryCount})</span>
                </button>

                <button
                  onClick={() => setActiveTab('temple_settings')}
                  className={`flex-1 min-w-[100px] py-3.5 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'temple_settings' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>मँदिर सेटिंग्स</span>
                </button>

                <button
                  onClick={() => setActiveTab('social_share')}
                  className={`flex-1 min-w-[100px] py-3.5 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'social_share' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Share2 className="w-4 h-4 text-orange-500" />
                  <span>सोशल शेयर</span>
                </button>

                <button
                  onClick={() => setActiveTab('donation')}
                  className={`flex-1 min-w-[100px] py-3.5 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'donation' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>दान प्रबंधन</span>
                </button>

                <button
                  onClick={() => setActiveTab('bhajan_documents')}
                  className={`flex-1 min-w-[140px] py-3.5 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'bhajan_documents' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  <span>भजन संग्रह ({stats.bhajanDocCount})</span>
                </button>

                <button
                  onClick={() => setActiveTab('push_notifications')}
                  className={`flex-1 min-w-[140px] py-3.5 flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'push_notifications' ? 'text-amber-600 bg-white border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Bell className="w-4 h-4 text-emerald-500" />
                  <span>पुश नोटिफिकेशन</span>
                </button>
              </div>

              {/* Subtab Contents Container */}
              <div className="p-6">
                
                {/* 1. OVERVIEW & DIRECTIONS SUBTAB */}
                {activeTab === 'overview' && (
                  <div className="flex flex-col gap-6">
                    {/* Database stats bento grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-slate-800">
                      
                      <div className="p-3 bg-sky-50 border border-sky-100 rounded-2xl flex flex-col items-center shadow-sm justify-center text-center">
                        <span className="text-[10px] text-slate-400 font-bold">कुल गैलरी</span>
                        <span className="text-lg font-mono font-black text-sky-600">{stats.galleryCount}</span>
                      </div>

                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col items-center shadow-sm justify-center text-center">
                        <span className="text-[10px] text-slate-400 font-bold">यूट्यूब वीडियो</span>
                        <span className="text-lg font-mono font-black text-rose-600">{stats.videoCount}</span>
                      </div>

                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl flex flex-col items-center shadow-sm justify-center text-center">
                        <span className="text-[10px] text-slate-400 font-bold">भजन/आरती</span>
                        <span className="text-lg font-mono font-black text-amber-600">{stats.bhajanCount}</span>
                      </div>

                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center shadow-sm justify-center text-center">
                        <span className="text-[10px] text-slate-400 font-bold">सक्रिय सूचनाएं</span>
                        <span className="text-lg font-mono font-black text-emerald-600">{stats.notificationCount}</span>
                      </div>

                      <div className="p-3 bg-violet-50 border border-violet-100 rounded-2xl flex flex-col items-center shadow-sm justify-center text-center">
                        <span className="text-[10px] text-slate-400 font-bold">उत्सव बैनर</span>
                        <span className="text-lg font-mono font-black text-violet-600">{stats.bannerCount}</span>
                      </div>

                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl flex flex-col items-center shadow-sm justify-center text-center">
                        <span className="text-[10px] text-slate-400 font-bold">मंदिर गैलरी</span>
                        <span className="text-lg font-mono font-black text-amber-600">{stats.templeGalleryCount}</span>
                      </div>

                      <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl flex flex-col items-center shadow-sm justify-center text-center">
                        <span className="text-[10px] text-slate-400 font-bold">भजन संग्रह</span>
                        <span className="text-lg font-mono font-black text-orange-600">{stats.bhajanDocCount}</span>
                      </div>
                    </div>

                    {/* How to use guidelines */}
                    <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex flex-col gap-2">
                      <h4 className="text-xs font-bold text-sky-900 flex items-center gap-1">
                        <Sliders className="w-4 h-4 text-sky-600" />
                        <span>सुविधाजनक इनलाइन संपादन निर्देश:</span>
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-600 font-medium">
                        आपके लिए मंदिर का प्रबंधन अति-सरल बना दिया गया है! 
                        लॉगिन रहने पर, आप सीधे मंदिर की वेबसाइट के मुख्य पृष्ठ (Homepage) पर घूमते हुए निम्नलिखित संपादित कर सकते हैं:
                      </p>
                      <ul className="list-disc list-inside text-xs text-slate-500 font-semibold space-y-1 pl-1">
                        <li>भोलेनाथ के श्रृंगार दर्शन: "श्रृंगार बदलें" बटन पर क्लिक करके बदलें।</li>
                        <li>यूट्यूब वीडियो: सीधे यूट्यूब वीडियो के ऊपर "वीडियो जोड़ें" पर क्लिक करें।</li>
                        <li>आरती के बोल: आरती खोलने पर दिखाई देने वाले फ़ील्ड्स में सीधे संपादन कर सकते हैं।</li>
                        <li>भजन प्लेलिस्ट: सीधे प्लेलिस्ट के नीचे "भजन जोड़ें" बटन दबाएं।</li>
                        <li>इतिहास, समय सारणी और संपर्क: विवरणों के ऊपर "जानकारी बदलें" पर क्लिक करके अपडेट करें।</li>
                      </ul>
                      <p className="text-[10px] text-amber-700 font-black mt-2">
                        🚩 आपके किए गए सभी बदलाव तात्कालिक (Realtime) रूप से सुरक्षित हो जाते हैं!
                      </p>
                    </div>

                    {/* Log out section */}
                    <button
                      onClick={handleLogout}
                      className="self-center flex items-center gap-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold px-5 py-2 rounded-xl border border-rose-200/50 transition duration-300"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>प्रबंधन सत्र समाप्त करें (Logout)</span>
                    </button>
                  </div>
                )}

                {/* 2. NOTIFICATIONS SECTION */}
                {activeTab === 'notifications' && (
                  <div className="flex flex-col gap-5 text-xs text-slate-700">
                    {/* Add Notice Panel */}
                    <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                        <Plus className="w-4 h-4 text-emerald-600" />
                        <span>नई उत्सव/महत्वपूर्ण घोषणा प्रकाशित करें</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">घोषणा का शीर्षक (Title):</label>
                          <input
                            type="text"
                            value={newNotifTitle}
                            onChange={(e) => setNewNotifTitle(e.target.value)}
                            placeholder="उदा. सावन सोमवार रुद्राभिषेक..."
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">श्रेणी (Type):</label>
                          <select
                            value={newNotifType}
                            onChange={(e: any) => setNewNotifType(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                          >
                            <option value="festival">पर्व/उत्सव (Festival)</option>
                            <option value="general">सामान्य सूचना (General)</option>
                            <option value="alert">महत्वपूर्ण चेतावनी (Alert)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">घोषणा का संदेश विवरण (Message):</label>
                        <textarea
                          value={newNotifMsg}
                          onChange={(e) => setNewNotifMsg(e.target.value)}
                          placeholder="सभी श्रद्धालुओं को सूचित किया जाता है कि..."
                          rows={2}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none resize-none"
                        />
                      </div>

                      <button
                        onClick={handleAddNotification}
                        className="self-end px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
                      >
                        प्रकाशित करें
                      </button>
                    </div>

                    {/* Active list queue */}
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest px-1">सक्रिय घोषणाएं ({notifs.length}):</p>
                      <div className="max-h-52 overflow-y-auto flex flex-col gap-2 pr-1 text-[11px] font-medium">
                        {notifs.map(n => (
                          <div 
                            key={n.id}
                            className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${
                                  n.type === 'festival' ? 'bg-amber-500' : n.type === 'alert' ? 'bg-rose-500' : 'bg-sky-500'
                                }`}></span>
                                <span className="font-bold text-slate-800">{n.title}</span>
                                <span className="text-[9px] text-slate-400 font-mono">({formatDateDMY(n.date)})</span>
                              </div>
                              <p className="text-slate-500 mt-1 pl-3.5 leading-relaxed">{n.message}</p>
                            </div>

                            {deleteConfirmNotifId === n.id ? (
                              <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 p-1 rounded-xl shrink-0">
                                <span className="text-[9px] text-rose-600 font-bold px-1 select-none">हटाएं?</span>
                                <button
                                  onClick={() => {
                                    handleDeleteNotification(n.id);
                                    setDeleteConfirmNotifId(null);
                                  }}
                                  className="px-1.5 py-0.5 bg-rose-500 text-white font-extrabold text-[9px] rounded-lg shadow-sm hover:bg-rose-600 transition"
                                >
                                  हाँ
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmNotifId(null)}
                                  className="px-1.5 py-0.5 bg-slate-200 text-slate-700 font-extrabold text-[9px] rounded-lg hover:bg-slate-300 transition"
                                >
                                  नहीं
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmNotifId(n.id)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition shrink-0"
                                title="हटाएं"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. UPLOAD PAST GALLERY ITEM */}
                {activeTab === 'upload_gallery' && (
                  <div className="flex flex-col gap-4 text-xs text-slate-700">
                    {/* Shringar Sub-tabs Selection */}
                    <div className="flex bg-amber-50/40 p-1 rounded-xl border border-amber-100/50">
                      <button
                        type="button"
                        onClick={() => setShringarTabMode('today')}
                        className={`flex-1 py-2 text-center rounded-lg font-bold text-[13px] transition duration-300 ${
                          shringarTabMode === 'today'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-amber-800 hover:bg-amber-50/80'
                        }`}
                      >
                        भोलेनाथ के श्रृंगार दर्शन
                      </button>
                      <button
                        type="button"
                        onClick={() => setShringarTabMode('gallery')}
                        className={`flex-1 py-2 text-center rounded-lg font-bold text-[13px] transition duration-300 ${
                          shringarTabMode === 'gallery'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-amber-800 hover:bg-amber-50/80'
                        }`}
                      >
                        श्रृंगार दर्शन गैलरी में जोड़ें
                      </button>
                    </div>

                    {shringarTabMode === 'today' ? (
                      /* A. UPDATE TODAY'S DARSHAN FORM */
                      <div className="bg-amber-50/60 border border-amber-200/60 p-4 rounded-2xl flex flex-col gap-4">
                        <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>मुख्य पृष्ठ का दैनिक श्रृंगार दर्शन बदलें</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {/* Date */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">दिनांक (Date):</label>
                            <input
                              type="date"
                              value={todayDate}
                              onChange={(e) => setTodayDate(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>

                           {/* Festival */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">विशेष पर्व/शृंगार नाम (Festival):</label>
                            <input
                              type="text"
                              value={todayFestival}
                              onChange={(e) => setTodayFestival(e.target.value)}
                              placeholder="उदा. सावन सोमवार, प्रदोष व्रत श्रृंगार"
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-xs font-bold text-amber-900 mb-1">दर्शन का भक्तिमय विवरण (Description):</label>
                          <textarea
                            value={todayDesc}
                            onChange={(e) => setTodayDesc(e.target.value)}
                            placeholder="आज के दिव्य श्रृंगार दर्शन का वर्णन लिखें..."
                            rows={5}
                            className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none resize-none"
                          />
                        </div>

                        {/* Image Source Input (Link Only) */}
                        <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-200/40">
                          <label className="block text-xs font-bold text-amber-900 mb-1.5">आज का दर्शन चित्र (Image Selection):</label>
                          
                          <div className="flex flex-col gap-2">
                            {/* Link Paste - Highly Recommended */}
                            <div>
                              <span className="block text-[11px] font-black text-amber-800 mb-1 uppercase tracking-wider">🔗 चित्र का सीधा लिंक डालें:</span>
                              <input
                                type="text"
                                value={todayImage}
                                onChange={(e) => setTodayImage(e.target.value)}
                                placeholder="https://example.com/image.jpg (यहाँ चित्र का सीधा लिंक पेस्ट करें)"
                                className="w-full px-3 py-2 bg-white border border-amber-200/80 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Submit */}
                        <button
                          onClick={handleSaveTodayDarshan}
                          className="self-end px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow transition"
                        >
                          {todaySuccess ? (
                            <span className="flex items-center gap-1"><Check className="w-4 h-4" /> मुख्य पृष्ठ पर बदल गया!</span>
                          ) : (
                            <span>दैनिक दर्शन अपडेट करें</span>
                          )}
                        </button>
                      </div>
                    ) : (
                      /* B. UPLOAD PAST GALLERY ITEM FORM */
                      <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl flex flex-col gap-4">
                        <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1">
                          <Upload className="w-4 h-4 text-amber-600" />
                          <span>गैलरी में श्रृंगार दर्शन जोड़ें</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                           {/* Date */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">दिनांक (Date):</label>
                            <input
                              type="date"
                              value={galDate}
                              onChange={(e) => setGalDate(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>

                           {/* Festival */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">विशेष पर्व/शृंगार नाम (Festival):</label>
                            <input
                              type="text"
                              value={galFestival}
                              onChange={(e) => setGalFestival(e.target.value)}
                              placeholder="उदा. प्रदोष व्रत विशेष, सावन सोमवार..."
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>

                           {/* Order */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">क्रम संख्या (Order):</label>
                            <input
                              type="number"
                              value={galOrder}
                              onChange={(e) => setGalOrder(Number(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-xs font-bold text-amber-900 mb-1">दर्शन का भक्तिमय विवरण (Description):</label>
                          <textarea
                            value={galDesc}
                            onChange={(e) => setGalDesc(e.target.value)}
                            placeholder="महादेव के इस अलौकिक शृंगार का वर्णन करें..."
                            rows={5}
                            className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none resize-none"
                          />
                        </div>

                        {/* Image Source Input (Link Only) */}
                        <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-200/40">
                          <label className="block text-xs font-bold text-amber-900 mb-1.5">दर्शन चित्र (Image Selection):</label>
                          
                          <div className="flex flex-col gap-2">
                            {/* Link Paste - Highly Recommended */}
                            <div>
                              <span className="block text-[11px] font-black text-amber-800 mb-1 uppercase tracking-wider">🔗 चित्र का सीधा लिंक डालें:</span>
                              <input
                                type="text"
                                value={galImage}
                                onChange={(e) => setGalImage(e.target.value)}
                                placeholder="https://example.com/image.jpg (यहाँ चित्र का सीधा लिंक पेस्ट करें)"
                                className="w-full px-3 py-2 bg-white border border-amber-200/80 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Submit */}
                        <button
                          onClick={handleSaveGalleryItem}
                          className="self-end px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow transition"
                        >
                          {galSuccess ? (
                            <span className="flex items-center gap-1"><Check className="w-4 h-4" /> गैलरी में जुड़ गया!</span>
                          ) : (
                            <span>गैलरी में जोड़े</span>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Preview box */}
                    {((shringarTabMode === 'today' && todayImage) || (shringarTabMode === 'gallery' && galImage)) && (
                      <div className="mt-2 flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 font-bold">चित्र पूर्वावलोकन (Preview):</span>
                        <img 
                          src={shringarTabMode === 'today' ? todayImage : galImage} 
                          alt="preview" 
                          className="w-40 h-32 object-cover rounded-xl mt-1 border border-slate-200 shadow-sm"
                        />
                      </div>
                    )}

                    {/* List of uploaded Shringar images with update/delete options */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h4 className="text-sm font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-100" />
                        <span>अपलोड किए गए श्रृंगार चित्र प्रबंधन ({galList.length})</span>
                      </h4>

                      <div className="max-h-72 overflow-y-auto flex flex-col gap-3 pr-1">
                        {galList.map((item, index) => {
                          const isCurrentlyEditing = editingGalId === item.id;

                          return (
                            <div 
                              key={item.id}
                              className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col gap-3 text-left"
                            >
                              {isCurrentlyEditing ? (
                                /* Inline Editing State */
                                <div className="flex flex-col gap-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 mb-0.5">दिनांक:</label>
                                      <input
                                        type="date"
                                        value={editGalDate}
                                        onChange={(e) => setEditGalDate(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 mb-0.5">विशेष पर्व/शृंगार नाम:</label>
                                      <input
                                        type="text"
                                        value={editGalFestival}
                                        onChange={(e) => setEditGalFestival(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 mb-0.5">क्रम संख्या (Order):</label>
                                      <input
                                        type="number"
                                        value={editGalOrder}
                                        onChange={(e) => setEditGalOrder(Number(e.target.value) || 0)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none font-bold"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">दर्शन का विवरण:</label>
                                    <textarea
                                      value={editGalDesc}
                                      onChange={(e) => setEditGalDesc(e.target.value)}
                                      rows={5}
                                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none resize-none"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">चित्र अपलोड/URL:</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="file"
                                        onChange={handleEditGalImageUpload}
                                        accept="image/*"
                                        className="text-[10px]"
                                      />
                                      {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500 shrink-0" />}
                                    </div>
                                    <input
                                      type="text"
                                      value={editGalImage}
                                      onChange={(e) => setEditGalImage(e.target.value)}
                                      placeholder="चित्र का सीधा URL"
                                      className="w-full px-2 py-1 mt-1 bg-white border border-slate-100 rounded-lg text-xs"
                                    />
                                  </div>

                                  <div className="flex justify-end gap-2 mt-1">
                                    <button
                                      onClick={handleCancelEditGal}
                                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-[10px] transition"
                                    >
                                      रद्द करें
                                    </button>
                                    <button
                                      onClick={handleSaveEditGal}
                                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-[10px] transition"
                                    >
                                      सहेजें
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* View/Read State with Edit/Delete Buttons */
                                <div className="flex items-start gap-3">
                                  <img 
                                    src={item.imageUrl} 
                                    alt="thumbnail" 
                                    className="w-16 h-16 object-cover rounded-xl border border-slate-200/50 shadow-sm shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                                        {formatDateDMY(item.date)}
                                      </span>
                                      <span className="font-bold text-slate-800 text-xs truncate">
                                        {item.festivalName || "दैनिक श्रृंगार दर्शन"}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                      {item.description}
                                    </p>
                                  </div>

                                  {deleteConfirmGalId === item.id ? (
                                    <div className="flex items-center gap-1.5 shrink-0 bg-rose-50 border border-rose-100 p-1 rounded-xl">
                                      <span className="text-[9px] text-rose-600 font-bold px-1 select-none">हटाएं?</span>
                                      <button
                                        onClick={() => {
                                          handleDeleteGal(item.id);
                                          setDeleteConfirmGalId(null);
                                        }}
                                        className="px-2 py-1 bg-rose-500 text-white font-extrabold text-[9px] rounded-lg shadow-sm hover:bg-rose-600 transition"
                                      >
                                        हाँ
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmGalId(null)}
                                        className="px-2 py-1 bg-slate-200 text-slate-700 font-extrabold text-[9px] rounded-lg hover:bg-slate-300 transition"
                                      >
                                        नहीं
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 shrink-0 bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/40">
                                      <button
                                        onClick={() => handleMoveGallery(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-[11px] text-slate-500 hover:text-amber-600 hover:bg-white rounded transition disabled:opacity-30 disabled:hover:bg-transparent"
                                        title="ऊपर ले जाएं"
                                      >
                                        ▲
                                      </button>
                                      <button
                                        onClick={() => handleMoveGallery(index, 'down')}
                                        disabled={index === galList.length - 1}
                                        className="p-1 text-[11px] text-slate-500 hover:text-amber-600 hover:bg-white rounded transition disabled:opacity-30 disabled:hover:bg-transparent"
                                        title="नीचे ले जाएं"
                                      >
                                        ▼
                                      </button>
                                      <span className="w-px h-3.5 bg-slate-200 mx-1"></span>
                                      <button
                                        onClick={() => handleStartEditGal(item)}
                                        className="p-1 text-slate-500 hover:text-amber-600 hover:bg-white rounded transition"
                                        title="संपादित करें"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmGalId(item.id)}
                                        className="p-1 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition"
                                        title="हटाएं"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'upload_video' && (
                  <div className="flex flex-col gap-4 text-xs text-slate-700">
                    {/* Video Sub-tabs Selection */}
                    <div className="flex bg-amber-50/40 p-1 rounded-xl border border-amber-100/50">
                      <button
                        type="button"
                        onClick={() => setVideoTabMode('today')}
                        className={`flex-1 py-2 text-center rounded-lg font-bold text-[13px] transition duration-300 ${
                          videoTabMode === 'today'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-amber-800 hover:bg-amber-50/80'
                        }`}
                      >
                        मुख्य आरती वीडियो
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoTabMode('gallery')}
                        className={`flex-1 py-2 text-center rounded-lg font-bold text-[13px] transition duration-300 ${
                          videoTabMode === 'gallery'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-amber-800 hover:bg-amber-50/80'
                        }`}
                      >
                        आरती वीडियो गैलरी में जोड़ें
                      </button>
                    </div>

                    {videoTabMode === 'today' ? (
                      /* A. UPDATE TODAY'S VIDEO FORM */
                      <div className="bg-amber-50/60 border border-amber-200/60 p-4 rounded-2xl flex flex-col gap-4">
                        <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1">
                          <Youtube className="w-4 h-4 text-red-600 fill-red-100" />
                          <span>मुख्य पृष्ठ का दैनिक आरती वीडियो बदलें</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {/* Date */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">दिनांक (Date):</label>
                            <input
                              type="date"
                              value={videoTodayDate}
                              onChange={(e) => setVideoTodayDate(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>

                           {/* Title */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">वीडियो का शीर्षक/नाम:</label>
                            <input
                              type="text"
                              value={videoTodayTitle}
                              onChange={(e) => setVideoTodayTitle(e.target.value)}
                              placeholder="उदा. संध्या महा आरती एवं दीपमालिका दर्शन"
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* YouTube URL */}
                        <div>
                          <label className="block text-xs font-bold text-amber-900 mb-1">यूट्यूब वीडियो लिंक (YouTube Link):</label>
                          <input
                            type="text"
                            value={videoTodayUrl}
                            onChange={(e) => setVideoTodayUrl(e.target.value)}
                            placeholder="उदा. https://www.youtube.com/watch?v=... या https://youtu.be/..."
                            className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        {/* Submit */}
                        <button
                          onClick={handleSaveTodayVideo}
                          className="self-end px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow transition"
                        >
                          {videoTodaySuccess ? (
                            <span className="flex items-center gap-1"><Check className="w-4 h-4" /> मुख्य पृष्ठ पर बदल गया!</span>
                          ) : (
                            <span>दैनिक वीडियो अपडेट करें</span>
                          )}
                        </button>
                      </div>
                    ) : (
                      /* B. UPLOAD PAST VIDEO FORM */
                      <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl flex flex-col gap-4">
                        <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1">
                          <Plus className="w-4 h-4 text-amber-600" />
                          <span>आरती वीडियो गैलरी में जोड़ें</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {/* Date */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">दिनांक (Date):</label>
                            <input
                              type="date"
                              value={videoGalDate}
                              onChange={(e) => setVideoGalDate(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>

                           {/* Title */}
                          <div>
                            <label className="block text-xs font-bold text-amber-900 mb-1">वीडियो का शीर्षक/नाम:</label>
                            <input
                              type="text"
                              value={videoGalTitle}
                              onChange={(e) => setVideoGalTitle(e.target.value)}
                              placeholder="उदा. सावन सोमवार महाआरती दर्शन"
                              className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* YouTube URL */}
                        <div>
                          <label className="block text-xs font-bold text-amber-900 mb-1">यूट्यूब वीडियो लिंक (YouTube Link):</label>
                          <input
                            type="text"
                            value={videoGalUrl}
                            onChange={(e) => setVideoGalUrl(e.target.value)}
                            placeholder="उदा. https://www.youtube.com/watch?v=... या https://youtu.be/..."
                            className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        {/* Submit */}
                        <button
                          onClick={handleSaveGalleryVideo}
                          className="self-end px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow transition"
                        >
                          {videoGalSuccess ? (
                            <span className="flex items-center gap-1"><Check className="w-4 h-4" /> गैलरी में जुड़ गया!</span>
                          ) : (
                            <span>गैलरी में जोड़े</span>
                          )}
                        </button>
                      </div>
                    )}

                    {/* List of uploaded Videos with update/delete options */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h4 className="text-sm font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-1.5">
                        <Youtube className="w-3.5 h-3.5 text-amber-500 fill-amber-100" />
                        <span>अपलोड किए गए आरती वीडियो प्रबंधन ({videoList.length})</span>
                      </h4>

                      <div className="max-h-72 overflow-y-auto flex flex-col gap-3 pr-1">
                        {videoList.map(item => {
                          const isCurrentlyEditing = editingVideoId === item.id;
                          const youtubeIdMatch = item.youtubeUrl?.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
                          const youtubeId = (youtubeIdMatch && youtubeIdMatch[2].length === 11) ? youtubeIdMatch[2] : null;
                          const thumbUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/0.jpg` : null;

                          return (
                            <div 
                              key={item.id}
                              className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col gap-3 text-left"
                            >
                              {isCurrentlyEditing ? (
                                /* Inline Editing State */
                                <div className="flex flex-col gap-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 mb-0.5">दिनांक:</label>
                                      <input
                                        type="date"
                                        value={editVideoDate}
                                        onChange={(e) => setEditVideoDate(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 mb-0.5">वीडियो शीर्षक:</label>
                                      <input
                                        type="text"
                                        value={editVideoTitle}
                                        onChange={(e) => setEditVideoTitle(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">यूट्यूब वीडियो लिंक (YouTube Link):</label>
                                    <input
                                      type="text"
                                      value={editVideoUrl}
                                      onChange={(e) => setEditVideoUrl(e.target.value)}
                                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                                    />
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="checkbox"
                                      id={`isToday-${item.id}`}
                                      checked={editVideoIsToday}
                                      onChange={(e) => setEditVideoIsToday(e.target.checked)}
                                      className="w-3.5 h-3.5 accent-amber-500 rounded"
                                    />
                                    <label htmlFor={`isToday-${item.id}`} className="text-[10px] font-bold text-slate-600 cursor-pointer">
                                      मुख्य आरती वीडियो बनाएं (Make this today's video)
                                    </label>
                                  </div>

                                  <div className="flex justify-end gap-2 mt-1">
                                    <button
                                      onClick={handleCancelEditVideo}
                                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-[10px] transition"
                                    >
                                      रद्द करें
                                    </button>
                                    <button
                                      onClick={handleSaveEditVideo}
                                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-[10px] transition"
                                    >
                                      सहेजें
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* View/Read State with Edit/Delete Buttons */
                                <div className="flex items-start gap-3">
                                  {thumbUrl ? (
                                    <img 
                                      src={thumbUrl} 
                                      alt="thumbnail" 
                                      className="w-16 h-12 object-cover rounded-lg border border-slate-200/50 shadow-sm shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-16 h-12 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                                      <Youtube className="w-5 h-5 text-red-500" />
                                    </div>
                                  )}
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                                        {formatDateDMY(item.date)}
                                      </span>
                                      {item.isToday && (
                                        <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-extrabold flex items-center gap-0.5 animate-pulse">
                                          ★ मुख्य वीडियो
                                        </span>
                                      )}
                                      <span className="font-bold text-slate-800 text-xs truncate">
                                        {item.title || "आरती दर्शन वीडियो"}
                                      </span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 mt-1 truncate">
                                      {item.youtubeUrl}
                                    </p>
                                  </div>

                                  {deleteConfirmVideoId === item.id ? (
                                    <div className="flex items-center gap-1.5 shrink-0 bg-rose-50 border border-rose-100 p-1 rounded-xl">
                                      <span className="text-[9px] text-rose-600 font-bold px-1 select-none">हटाएं?</span>
                                      <button
                                        onClick={() => {
                                          handleDeleteVideo(item.id);
                                          setDeleteConfirmVideoId(null);
                                        }}
                                        className="px-2 py-1 bg-rose-500 text-white font-extrabold text-[9px] rounded-lg shadow-sm hover:bg-rose-600 transition"
                                      >
                                        हाँ
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmVideoId(null)}
                                        className="px-2 py-1 bg-slate-200 text-slate-700 font-extrabold text-[9px] rounded-lg hover:bg-slate-300 transition"
                                      >
                                        नहीं
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => handleStartEditVideo(item)}
                                        className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition"
                                        title="संपादित करें"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmVideoId(item.id)}
                                        className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-lg transition"
                                        title="हटाएं"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'festival_banners' && (
                  <div className="flex flex-col gap-6 text-xs text-slate-700">
                    {/* Add Banner Panel */}
                    <div className="bg-violet-50/60 border border-violet-100 p-4 rounded-2xl flex flex-col gap-4">
                      <h4 className="text-xs font-bold text-violet-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-violet-600" />
                        <span>नया उत्सव बैनर जोड़ें (Add New Festival Banner)</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Title & Description */}
                        <div className="flex flex-col gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">उत्सव बैनर शीर्षक (Title) * :</label>
                            <input
                              type="text"
                              value={bannerTitle}
                              onChange={(e) => setBannerTitle(e.target.value)}
                              placeholder="उदा. महाशिवरात्रि महोत्सव 2026..."
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">विवरण (Description) :</label>
                            <textarea
                              value={bannerDesc}
                              onChange={(e) => setBannerDesc(e.target.value)}
                              placeholder="उदा. इस शिवरात्रि पर बाबा मंसा महादेव के भव्य श्रृंगार एवं महारुद्राभिषेक दर्शन..."
                              rows={2}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">विशेष सूचना (Special Note - Optional) :</label>
                            <input
                              type="text"
                              value={bannerSpecialNote}
                              onChange={(e) => setBannerSpecialNote(e.target.value)}
                              placeholder="उदा. महोत्सव के पश्चात् महाप्रसाद का वितरण रहेगा।"
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Dates & Toggle */}
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">प्रारंभ तिथि (Start Date) * :</label>
                              <div className="relative">
                                <input
                                  type="date"
                                  value={bannerStartDate}
                                  onChange={(e) => setBannerStartDate(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">समाप्ति तिथि (End Date) * :</label>
                              <div className="relative">
                                <input
                                  type="date"
                                  value={bannerEndDate}
                                  onChange={(e) => setBannerEndDate(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">समय (Time) :</label>
                              <input
                                type="text"
                                value={bannerTime}
                                onChange={(e) => setBannerTime(e.target.value)}
                                placeholder="उदा. 06:00 PM"
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">स्थान (Location) :</label>
                              <input
                                type="text"
                                value={bannerLocation}
                                onChange={(e) => setBannerLocation(e.target.value)}
                                placeholder="उदा. मंसा महादेव मंदिर परिसर"
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="checkbox"
                              id="bannerIsEnabledCheckbox"
                              checked={bannerIsEnabled}
                              onChange={(e) => setBannerIsEnabled(e.target.checked)}
                              className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
                            />
                            <label htmlFor="bannerIsEnabledCheckbox" className="text-xs font-bold text-slate-600 cursor-pointer">
                              बैनर को तुरंत सक्रिय (Enable) करें
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div className="border border-dashed border-slate-200 bg-white p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">उत्सव बैनर का चित्र (Image) * :</p>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 hover:bg-violet-200/80 text-violet-700 font-bold rounded-xl cursor-pointer transition">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{bannerUploading ? 'अपलोड हो रहा है...' : 'चित्र अपलोड करें'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleBannerImageUpload}
                                disabled={bannerUploading}
                                className="hidden"
                              />
                            </label>
                            {bannerUploading && <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />}
                          </div>
                          <p className="text-[9px] text-slate-400 mt-1">अनुशंसित आकार: 1200x400 पिक्सल (3:1 अनुपात)</p>
                        </div>

                        {bannerImageUrl && (
                          <div className="relative w-44 h-16 rounded-lg overflow-hidden border border-slate-100 shadow-sm shrink-0">
                            <img src={bannerImageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              onClick={() => setBannerImageUrl('')}
                              className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition"
                              title="हटाएं"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleAddFestivalBanner}
                        disabled={bannerUploading}
                        className="self-end flex items-center gap-1.5 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow transition disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        <span>बैनर जोड़ें</span>
                      </button>
                    </div>

                    {/* Banner list queue */}
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest px-1">मौजूदा उत्सव बैनर ({banners.length}):</p>
                      
                      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                        {banners.length === 0 ? (
                          <p className="text-center text-slate-400 py-6 font-medium bg-slate-50 border border-dashed border-slate-200 rounded-2xl">कोई उत्सव बैनर नहीं मिला।</p>
                        ) : (
                          banners.map(banner => {
                            const isEditing = editingBannerId === banner.id;
                            
                            return (
                              <div
                                key={banner.id}
                                className={`flex flex-col p-4 rounded-2xl border transition ${
                                  isEditing ? 'bg-amber-50/40 border-amber-200' : 'bg-slate-50 hover:bg-slate-100/50 border-slate-200/50'
                                }`}
                              >
                                {isEditing ? (
                                  /* Inline editing form */
                                  <div className="flex flex-col gap-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">शीर्षक :</label>
                                        <input
                                          type="text"
                                          value={editBannerTitle}
                                          onChange={(e) => setEditBannerTitle(e.target.value)}
                                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none font-bold"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">विवरण :</label>
                                        <input
                                          type="text"
                                          value={editBannerDesc}
                                          onChange={(e) => setEditBannerDesc(e.target.value)}
                                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">प्रारंभ तिथि :</label>
                                        <input
                                          type="date"
                                          value={editBannerStartDate}
                                          onChange={(e) => setEditBannerStartDate(e.target.value)}
                                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">समाप्ति तिथि :</label>
                                        <input
                                          type="date"
                                          value={editBannerEndDate}
                                          onChange={(e) => setEditBannerEndDate(e.target.value)}
                                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                                        />
                                      </div>
                                      <div className="flex items-center gap-1.5 self-end py-2">
                                        <input
                                          type="checkbox"
                                          id={`editBannerCheckbox-${banner.id}`}
                                          checked={editBannerIsEnabled}
                                          onChange={(e) => setEditBannerIsEnabled(e.target.checked)}
                                          className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
                                        />
                                        <label htmlFor={`editBannerCheckbox-${banner.id}`} className="text-xs font-bold text-slate-600 cursor-pointer">
                                          सक्रिय (Enabled) है
                                        </label>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">समय (Time) :</label>
                                        <input
                                          type="text"
                                          value={editBannerTime}
                                          onChange={(e) => setEditBannerTime(e.target.value)}
                                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">स्थान (Location) :</label>
                                        <input
                                          type="text"
                                          value={editBannerLocation}
                                          onChange={(e) => setEditBannerLocation(e.target.value)}
                                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">विशेष सूचना (Special Note) :</label>
                                        <input
                                          type="text"
                                          value={editBannerSpecialNote}
                                          onChange={(e) => setEditBannerSpecialNote(e.target.value)}
                                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                                        />
                                      </div>
                                    </div>

                                    <div className="border border-dashed border-amber-200 bg-white/50 p-3 rounded-xl flex flex-col sm:flex-row items-center gap-4">
                                      <div className="flex-1">
                                        <span className="text-[10px] font-bold text-slate-500 block mb-1">चित्र बदलें :</span>
                                        <div className="flex items-center gap-2">
                                          <label className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-xl cursor-pointer font-bold transition">
                                            <Upload className="w-3 h-3" />
                                            <span>अपलोड करें</span>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) => handleEditBannerImageUpload(e, banner.id)}
                                              disabled={bannerUploading}
                                              className="hidden"
                                            />
                                          </label>
                                          {bannerUploading && <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />}
                                        </div>
                                      </div>

                                      {editBannerImageUrl && (
                                        <div className="w-24 h-10 rounded-lg overflow-hidden border border-amber-200 shrink-0">
                                          <img src={editBannerImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex justify-end gap-1.5 mt-2">
                                      <button
                                        onClick={() => handleUpdateFestivalBanner(banner.id)}
                                        disabled={bannerUploading}
                                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center gap-1"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>सुरक्षित करें</span>
                                      </button>
                                      <button
                                        onClick={() => setEditingBannerId(null)}
                                        disabled={bannerUploading}
                                        className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-700 font-bold rounded-lg transition flex items-center gap-1"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                        <span>रद्द करें</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  /* Display Mode */
                                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                      {/* Banner thumbnail */}
                                      <div className="w-24 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-200">
                                        <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                                      </div>

                                      <div className="flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-bold text-slate-900 text-xs">{banner.title}</span>
                                          {banner.isEnabled ? (
                                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[8px] rounded-md">सक्रिय</span>
                                          ) : (
                                            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-500 font-bold text-[8px] rounded-md">निष्क्रिय</span>
                                          )}
                                        </div>
                                        <p className="text-slate-500 text-[10px] mt-0.5 line-clamp-1">{banner.description || 'कोई विवरण नहीं'}</p>
                                        <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold font-mono mt-1">
                                          <span className="flex items-center gap-0.5">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            <span>{formatDateDMY(banner.startDate)} से {formatDateDMY(banner.endDate)}</span>
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                      {deleteConfirmBannerId === banner.id ? (
                                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 p-1 rounded-xl">
                                          <span className="text-[9px] text-rose-600 font-bold px-1 select-none">हटाएं?</span>
                                          <button
                                            onClick={() => {
                                              handleDeleteFestivalBanner(banner.id);
                                              setDeleteConfirmBannerId(null);
                                            }}
                                            className="px-2 py-1 bg-rose-500 text-white font-extrabold text-[9px] rounded-lg shadow-sm hover:bg-rose-600 transition"
                                          >
                                            हाँ
                                          </button>
                                          <button
                                            onClick={() => setDeleteConfirmBannerId(null)}
                                            className="px-2 py-1 bg-slate-200 text-slate-700 font-extrabold text-[9px] rounded-lg hover:bg-slate-300 transition"
                                          >
                                            नहीं
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() => {
                                              setEditingBannerId(banner.id);
                                              setEditBannerTitle(banner.title);
                                              setEditBannerDesc(banner.description || '');
                                              setEditBannerImageUrl(banner.imageUrl);
                                              setEditBannerStartDate(banner.startDate);
                                              setEditBannerEndDate(banner.endDate);
                                              setEditBannerIsEnabled(banner.isEnabled);
                                              setEditBannerTime(banner.time || '');
                                              setEditBannerLocation(banner.location || '');
                                              setEditBannerSpecialNote(banner.specialNote || '');
                                            }}
                                            className="p-1.5 text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                                            title="संपादित करें"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => setDeleteConfirmBannerId(banner.id)}
                                            className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                                            title="हटाएं"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'temple_gallery' && (
                  <div className="flex flex-col gap-5 text-xs text-slate-700">
                    <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1">
                        <Plus className="w-4 h-4 text-amber-600" />
                        <span>मंदिर गैलरी में नया चित्र जोड़ें</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">चित्र का विवरण (Caption):</label>
                          <input
                            type="text"
                            value={newTgCaption}
                            onChange={(e) => setNewTgCaption(e.target.value)}
                            placeholder="उदा. गर्भगृह का मनमोहक श्रृंगार..."
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none font-bold text-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">श्रेणी (Category):</label>
                          <select
                            value={newTgCategory}
                            onChange={(e: any) => setNewTgCategory(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none font-bold text-slate-700"
                          >
                            <option value="mandir_parisar">🛕 मंदिर एवं परिसर</option>
                            <option value="utsav">🎉 उत्सव</option>
                            <option value="bhaktimay">🙏 भक्तिमय क्षण</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">अपलोड तिथि (Upload Date):</label>
                          <input
                            type="date"
                            value={newTgDate}
                            onChange={(e) => setNewTgDate(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-slate-700"
                          />
                        </div>

                        <div className="flex items-center gap-2 self-end py-2">
                          <input
                            type="checkbox"
                            id="newTgIsActive"
                            checked={newTgIsActive}
                            onChange={(e) => setNewTgIsActive(e.target.checked)}
                            className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                          />
                          <label htmlFor="newTgIsActive" className="text-xs font-bold text-slate-600 cursor-pointer">
                            सक्रिय (Active Status) है
                          </label>
                        </div>
                      </div>

                      <div className="border border-dashed border-amber-200 bg-white p-3 rounded-xl flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex-1 w-full">
                          <span className="text-[10px] font-bold text-slate-500 block mb-1">गैलरी चित्र अपलोड करें (Image URL/Upload):</span>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-xl cursor-pointer font-bold transition shrink-0 select-none">
                              <Upload className="w-3 h-3" />
                              <span>फाइल चुनें</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleTgImageUpload}
                                disabled={tgUploading}
                                className="hidden"
                              />
                            </label>
                            <input
                              type="text"
                              value={newTgImage}
                              onChange={(e) => setNewTgImage(e.target.value)}
                              placeholder="या सीधे इमेज यूआरएल (URL) दर्ज करें..."
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs text-slate-700"
                            />
                            {tgUploading && <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />}
                          </div>
                        </div>

                        {newTgImage && (
                          <div className="w-20 h-14 rounded-lg overflow-hidden border border-amber-200 shrink-0 relative bg-slate-50 select-none">
                            <img src={newTgImage} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setNewTgImage('')}
                              className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/75"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleAddTempleGallery}
                        disabled={tgUploading}
                        className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-xl shadow-md transition duration-300 hover:scale-[1.01] active:scale-99 flex items-center justify-center gap-1.5 select-none"
                      >
                        {tgSuccess ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        <span>{tgSuccess ? 'सफलतापूर्वक जोड़ा गया!' : 'नया चित्र जोड़ें'}</span>
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest px-1 select-none">गैलरी चित्रों की सूची ({templeGalList.length}):</p>
                      
                      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                        {templeGalList.length === 0 ? (
                          <p className="text-center text-slate-400 py-6 font-medium bg-slate-50 border border-dashed border-slate-200 rounded-2xl select-none">कोई गैलरी चित्र नहीं मिला।</p>
                        ) : (
                          templeGalList.map(item => {
                            const isEditing = editingTgId === item.id;
                            return (
                              <div
                                key={item.id}
                                className={`flex flex-col p-4 rounded-2xl border transition ${
                                  isEditing ? 'bg-amber-50/40 border-amber-200' : 'bg-slate-50 hover:bg-slate-100/50 border-slate-200/50'
                                }`}
                              >
                                {isEditing ? (
                                  <div className="flex flex-col gap-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">विवरण (Caption):</label>
                                        <input
                                          type="text"
                                          value={editTgCaption}
                                          onChange={(e) => setEditTgCaption(e.target.value)}
                                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none font-bold text-slate-700"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">श्रेणी (Category):</label>
                                        <select
                                          value={editTgCategory}
                                          onChange={(e: any) => setEditTgCategory(e.target.value)}
                                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none font-bold text-slate-700"
                                        >
                                          <option value="mandir_parisar">🛕 मंदिर एवं परिसर</option>
                                          <option value="utsav">🎉 उत्सव</option>
                                          <option value="bhaktimay">🙏 भक्तिमय क्षण</option>
                                        </select>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">अपलोड तिथि (Upload Date):</label>
                                        <input
                                          type="date"
                                          value={editTgDate}
                                          onChange={(e) => setEditTgDate(e.target.value)}
                                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-slate-700"
                                        />
                                      </div>

                                      <div className="flex items-center gap-1.5 self-end py-2 select-none">
                                        <input
                                          type="checkbox"
                                          id={`editTgIsActive-${item.id}`}
                                          checked={editTgIsActive}
                                          onChange={(e) => setEditTgIsActive(e.target.checked)}
                                          className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                                        />
                                        <label htmlFor={`editTgIsActive-${item.id}`} className="text-xs font-bold text-slate-600 cursor-pointer">
                                          सक्रिय (Active Status) है
                                        </label>
                                      </div>
                                    </div>

                                    <div className="border border-dashed border-amber-200 bg-white/50 p-3 rounded-xl flex flex-col sm:flex-row items-center gap-4">
                                      <div className="flex-1 w-full">
                                        <span className="text-[10px] font-bold text-slate-500 block mb-1">चित्र बदलें (Upload or URL):</span>
                                        <div className="flex items-center gap-2">
                                          <label className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-xl cursor-pointer font-bold transition shrink-0 select-none">
                                            <Upload className="w-3 h-3" />
                                            <span>अपलोड करें</span>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) => handleEditTgImageUpload(e, item.id)}
                                              disabled={tgUploading}
                                              className="hidden"
                                            />
                                          </label>
                                          <input
                                            type="text"
                                            value={editTgImage}
                                            onChange={(e) => setEditTgImage(e.target.value)}
                                            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs text-slate-700"
                                          />
                                          {tgUploading && <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />}
                                        </div>
                                      </div>

                                      {editTgImage && (
                                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-amber-200 shrink-0 select-none bg-slate-50">
                                          <img src={editTgImage} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex justify-end gap-1.5 mt-2 select-none">
                                      <button
                                        onClick={() => handleUpdateTempleGallery(item.id)}
                                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl transition"
                                      >
                                        अपडेट करें
                                      </button>
                                      <button
                                        onClick={() => setEditingTgId(null)}
                                        className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold rounded-xl transition"
                                      >
                                        रद्द करें
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-16 h-12 rounded-xl overflow-hidden border border-slate-200/50 shrink-0 bg-slate-100 select-none">
                                        <img src={item.imageUrl} alt={item.caption} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <p className="font-bold text-slate-800 line-clamp-1">{item.caption}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold select-none">
                                          <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
                                            {item.category === 'mandir_parisar' ? '🛕 मंदिर परिसर' : item.category === 'utsav' ? '🎉 उत्सव' : '🙏 भक्तिमय'}
                                          </span>
                                          <span>• {item.uploadDate}</span>
                                          <span className={`px-1.5 py-0.5 rounded font-black ${
                                            item.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                          }`}>
                                            {item.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1 z-10 shrink-0 select-none">
                                      {deleteConfirmTgId === item.id ? (
                                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 rounded-xl p-1 shrink-0">
                                          <span className="text-[9px] text-rose-600 font-bold px-1 select-none">हटाएं?</span>
                                          <button
                                            onClick={() => handleDeleteTempleGallery(item.id)}
                                            className="px-2 py-1 bg-rose-500 text-white font-extrabold text-[9px] rounded-lg shadow-sm hover:bg-rose-600 transition"
                                          >
                                            हाँ
                                          </button>
                                          <button
                                            onClick={() => setDeleteConfirmTgId(null)}
                                            className="px-2 py-1 bg-slate-200 text-slate-700 font-extrabold text-[9px] rounded-lg hover:bg-slate-300 transition"
                                          >
                                            नहीं
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() => handleStartEditTg(item)}
                                            className="p-1.5 text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                                            title="संपादित करें"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => setDeleteConfirmTgId(item.id)}
                                            className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                                            title="हटाएं"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                 {activeTab === 'temple_settings' && (
                  <TempleSettingsTab />
                )}

                {activeTab === 'social_share' && (
                  <div className="flex flex-col gap-5 text-xs text-slate-700">
                    <div className="bg-amber-50/60 border border-amber-100 p-5 rounded-2xl flex flex-col gap-4">
                      <h4 className="text-sm font-bold text-amber-950 flex items-center gap-1.5 border-b border-amber-100 pb-2">
                        <Share2 className="w-5 h-5 text-orange-500" />
                        <span>सोशल मीडिया शेयर एवं रिच सोशल प्रीव्यू सेटिंग्स (WhatsApp Open Graph)</span>
                      </h4>

                      <p className="text-[11px] text-slate-500 font-medium -mt-2 leading-relaxed">
                        यहाँ से आप मंसा महादेव मंदिर वेबसाइट का सोशल मीडिया प्रीव्यू (Social Preview Card) कस्टमाइज़ कर सकते हैं। जब भी कोई इस वेबसाइट को WhatsApp, Facebook या Twitter पर साझा करेगा, तो यही जानकारी और चित्र दिखाई देंगे।
                      </p>

                      <div className="grid grid-cols-1 gap-4">
                        {/* Title */}
                        <div>
                          <label className="block text-xs font-bold text-amber-950 mb-1">वेबसाइट का शीर्षक (Website Share Title):</label>
                          <input
                            type="text"
                            value={ssTitle}
                            onChange={(e) => setSsTitle(e.target.value)}
                            placeholder="उदा. मंसा महादेव मंदिर"
                            className="w-full px-4 py-2 bg-white border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800 text-xs"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-xs font-bold text-amber-950 mb-1">वेबसाइट का विवरण (Website Description / Rich Snippet):</label>
                          <textarea
                            value={ssDescription}
                            onChange={(e) => setSsDescription(e.target.value)}
                            placeholder="वेबसाइट का आकर्षक और भक्तिमय छोटा विवरण लिखें..."
                            rows={4}
                            className="w-full px-4 py-2 bg-white border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-700 leading-relaxed font-semibold resize-none"
                          />
                        </div>

                        {/* Image URL & Upload */}
                        <div className="border border-dashed border-amber-200 bg-amber-50/20 p-4 rounded-xl flex flex-col gap-3">
                          <div>
                            <span className="block text-xs font-bold text-amber-950 mb-1.5">सोशल प्रीव्यू इमेज यूआरएल (Website Share Image URL):</span>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-800 px-3.5 py-2 rounded-xl cursor-pointer font-bold transition shrink-0 select-none">
                                <Upload className="w-3.5 h-3.5" />
                                <span>अपलोड करें</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleSsImageUpload}
                                  disabled={ssUploading}
                                  className="hidden"
                                />
                              </label>
                              <input
                                type="text"
                                value={ssShareImageUrl}
                                onChange={(e) => setSsShareImageUrl(e.target.value)}
                                placeholder="https://example.com/share-preview.jpg"
                                className="flex-1 px-3 py-2 bg-white border border-amber-200 rounded-xl focus:outline-none text-xs text-slate-700"
                              />
                              {ssUploading && <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />}
                            </div>
                            <span className="block text-[10px] text-slate-400 font-bold mt-1.5 leading-normal">
                              ⚠️ महत्वपूर्ण: इमेज का साइज़ चौड़ाई में बड़ा (जैसे 1200x630 पिक्सल) होना चाहिए ताकि WhatsApp सोशल प्रीव्यू में पूरा बैनर दिखाई दे। यह इमेज केवल बाहरी लिंक से ही लोड होगी।
                            </span>
                          </div>

                          {ssShareImageUrl && (
                            <div className="max-w-md border border-amber-100 rounded-2xl overflow-hidden shadow-sm bg-white p-2">
                              <span className="text-[10px] font-black text-slate-400 block mb-1 px-1 uppercase tracking-wider">सोशल शेयर प्रीव्यू चित्र:</span>
                              <img src={ssShareImageUrl} alt="Social Preview" className="w-full h-40 object-cover rounded-xl" />
                            </div>
                          )}
                        </div>

                        {/* Two Columns for Favicon & Default URL */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-amber-950 mb-1">फेविकॉन इमेज लिंक (Favicon URL - Optional):</label>
                            <input
                              type="text"
                              value={ssFaviconUrl}
                              onChange={(e) => setSsFaviconUrl(e.target.value)}
                              placeholder="https://example.com/favicon.ico"
                              className="w-full px-4 py-2 bg-white border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-700 font-medium"
                            />
                            {ssFaviconValidating && (
                              <p className="text-[10px] text-amber-600 font-bold mt-1.5 animate-pulse">फेविकॉन जाँचा जा रहा है...</p>
                            )}
                            {!ssFaviconValidating && ssFaviconError && ssFaviconUrl.trim() && (
                              <p className="text-[10px] text-red-600 font-bold mt-1.5">Invalid Favicon URL</p>
                            )}
                            {!ssFaviconValidating && !ssFaviconError && ssFaviconUrl.trim() && (
                              <div className="mt-2.5 flex items-center gap-2.5 border border-amber-200/60 rounded-xl p-2 bg-amber-50/20 max-w-xs shadow-sm">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">फेविकॉन प्रीव्यू:</span>
                                <div className="w-8 h-8 rounded-lg bg-white border border-amber-200/60 shadow-inner flex items-center justify-center p-1.5">
                                  <img src={ssFaviconUrl} alt="Favicon Preview" className="w-full h-full object-contain" />
                                </div>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-amber-950 mb-1">डिफ़ॉल्ट शेयर यूआरएल (Default Share URL - Optional):</label>
                            <input
                              type="text"
                              value={ssDefaultShareUrl}
                              onChange={(e) => setSsDefaultShareUrl(e.target.value)}
                              placeholder="https://mansamahadevtemple.org"
                              className="w-full px-4 py-2 bg-white border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-700 font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      <button
                        type="button"
                        onClick={handleSaveSocialShareSettings}
                        disabled={ssUploading}
                        className="mt-2 w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black rounded-xl shadow-md hover:scale-[1.01] active:scale-99 transition duration-300 flex items-center justify-center gap-2 select-none"
                      >
                        {ssSuccess ? (
                          <>
                            <Check className="w-5 h-5 text-slate-950" />
                            <span>सेटिंग्स सफलतापूर्वक सुरक्षित कर दी गईं!</span>
                          </>
                        ) : (
                          <>
                            <Database className="w-5 h-5 text-slate-950" />
                            <span>सोशल शेयर सेटिंग्स सुरक्षित करें</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'donation' && (
                  <div className="flex flex-col gap-5 text-xs text-slate-700">
                    <div className="bg-amber-50/60 border border-amber-100 p-5 rounded-2xl flex flex-col gap-4">
                      <h4 className="text-sm font-bold text-amber-950 flex items-center gap-1.5 border-b border-amber-100 pb-2">
                        <Heart className="w-5 h-5 text-red-500 fill-red-100" />
                        <span>मंदिर सेवा एवं दान प्रबंधन</span>
                      </h4>

                      <p className="text-[11px] text-slate-500 font-medium -mt-2 leading-relaxed">
                        यहाँ से आप मंसा महादेव मंदिर के "मंदिर सेवा एवं दान" अनुभाग को कस्टमाइज़ कर सकते हैं। सभी इमेज केवल यूआरएल द्वारा लोड होंगी।
                      </p>

                      <div className="grid grid-cols-1 gap-4">
                        {/* Display ON/OFF Toggle */}
                        <div className="flex items-center gap-2.5 bg-white border border-amber-200/80 p-4 rounded-xl shadow-sm">
                          <input
                            type="checkbox"
                            id="donationEnabledCheckbox"
                            checked={donationEnabled}
                            onChange={(e) => setDonationEnabled(e.target.checked)}
                            className="w-4.5 h-4.5 accent-amber-500 cursor-pointer"
                          />
                          <label htmlFor="donationEnabledCheckbox" className="text-xs font-bold text-amber-950 cursor-pointer select-none">
                            मुख्य स्क्रीन पर "मंदिर सेवा एवं दान" कार्ड दिखाएं (Display ON/OFF)
                          </label>
                        </div>

                        {/* Donation QR Code Image URL */}
                        <div>
                          <label className="block text-xs font-bold text-amber-950 mb-1">क्यूआर कोड इमेज यूआरएल (QR Code Image URL):</label>
                          <input
                            type="text"
                            value={donationQRCode}
                            onChange={(e) => setDonationQRCode(e.target.value)}
                            placeholder="https://example.com/qr-code.png"
                            className="w-full px-4 py-2 bg-white border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-700 font-medium font-mono"
                          />
                          {donationQRCode.trim() && (
                            <div className="mt-2.5 flex items-center gap-2.5 border border-amber-200/60 rounded-xl p-2 bg-white max-w-xs shadow-sm">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">क्यूआर प्रीव्यू:</span>
                              <div className="w-16 h-16 rounded-lg border border-amber-100 flex items-center justify-center p-1.5 bg-slate-50">
                                <img src={donationQRCode} alt="QR Preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* UPI ID */}
                        <div>
                          <label className="block text-xs font-bold text-amber-950 mb-1">यूपीआई आईडी (UPI ID):</label>
                          <input
                            type="text"
                            value={donationUPIId}
                            onChange={(e) => setDonationUPIId(e.target.value)}
                            placeholder="mansamahadev@upi"
                            className="w-full px-4 py-2 bg-white border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-700 font-bold font-mono"
                          />
                        </div>

                        {/* UPI Payment Link */}
                        <div>
                          <label className="block text-xs font-bold text-amber-950 mb-1">यूपीआई पेमेंट लिंक (UPI Payment Link / URI):</label>
                          <input
                            type="text"
                            value={donationUPILink}
                            onChange={(e) => setDonationUPILink(e.target.value)}
                            placeholder="upi://pay?pa=mansamahadev@upi&pn=Mansa%20Mahadev%20Temple..."
                            className="w-full px-4 py-2 bg-white border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-700 font-medium font-mono"
                          />
                        </div>

                        {/* Donation Message */}
                        <div>
                          <label className="block text-xs font-bold text-amber-950 mb-1">सहयोग संदेश (Donation Message):</label>
                          <textarea
                            value={donationMessage}
                            onChange={(e) => setDonationMessage(e.target.value)}
                            placeholder="मंदिर के धार्मिक कार्यों, सेवा एवं विकास में अपना सहयोग प्रदान करें।"
                            rows={3}
                            className="w-full px-4 py-2 bg-white border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-700 font-medium"
                          />
                        </div>

                        {/* Temple Committee Name */}
                        <div>
                          <label className="block text-xs font-bold text-amber-950 mb-1">मंदिर प्रबंधन समिति (Temple Committee Name):</label>
                          <input
                            type="text"
                            value={donationCommitteeName}
                            onChange={(e) => setDonationCommitteeName(e.target.value)}
                            placeholder="श्री मंसा महादेव मंदिर विकास एवं प्रबंधन समिति"
                            className="w-full px-4 py-2 bg-white border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-700 font-medium"
                          />
                        </div>

                        {/* Authorized Person / Trustee */}
                        <div>
                          <label className="block text-xs font-bold text-amber-950 mb-1">अधिकृत व्यक्ति / Trustee (Authorized Person / Trustee Name):</label>
                          <input
                            type="text"
                            value={donationTrusteeName}
                            onChange={(e) => setDonationTrusteeName(e.target.value)}
                            placeholder="श्री मंसा महादेव मंदिर मुख्य ट्रस्टी"
                            className="w-full px-4 py-2 bg-white border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-700 font-medium"
                          />
                        </div>

                        {/* Temple Committee Members dynamic list manager */}
                        <div className="border-t border-amber-200/40 pt-4 mt-2">
                          <label className="block text-xs font-bold text-amber-950 mb-2 flex items-center gap-1.5 select-none">
                            <span>👥 मंदिर प्रबंधन समिति सदस्य (Committee / Trustee Members List):</span>
                          </label>
                          
                          {/* Add/Edit member form */}
                          <div className="bg-white border border-amber-200/50 rounded-2xl p-4 flex flex-col gap-3 shadow-sm mb-4">
                            <h5 className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider select-none">
                              {editingMemberId ? "✍️ सदस्य विवरण संपादित करें" : "➕ नया समिति सदस्य जोड़ें"}
                            </h5>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">सदस्य का नाम (Member Name):</label>
                                <input
                                  type="text"
                                  value={newMemberName}
                                  onChange={(e) => setNewMemberName(e.target.value)}
                                  placeholder="उदा. श्री रामलाल जी पटेल"
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-700 font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">पद (Designation / Role):</label>
                                <input
                                  type="text"
                                  value={newMemberDesignation}
                                  onChange={(e) => setNewMemberDesignation(e.target.value)}
                                  placeholder="उदा. अध्यक्ष, सचिव, कोषाध्यक्ष आदि"
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-700 font-bold"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <button
                                type="button"
                                onClick={handleAddOrEditDonationMember}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-sm active:scale-95 transition"
                              >
                                {editingMemberId ? "अपडेट करें" : "सूची में जोड़ें"}
                              </button>
                              {editingMemberId && (
                                <button
                                  type="button"
                                  onClick={handleCancelEditDonationMember}
                                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition"
                                >
                                  रद्द करें
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Members List Table/List */}
                          {donationMembers.length === 0 ? (
                            <div className="text-center p-6 bg-amber-50/10 border border-dashed border-amber-200/30 rounded-2xl text-slate-400 font-medium select-none">
                              कोई सदस्य नहीं जोड़ा गया है। कृपया ऊपर से जोड़ें।
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                              {donationMembers.map((member, idx) => (
                                <div key={member.id} className="flex items-center justify-between gap-3 bg-white border border-amber-200/30 rounded-xl p-3 shadow-sm hover:border-amber-200/60 transition duration-200">
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 w-5 h-5 rounded-full flex items-center justify-center select-none">{idx + 1}</span>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-extrabold text-slate-800 leading-tight">{member.name}</span>
                                      <span className="text-[10px] text-amber-700 font-bold mt-0.5">{member.designation}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditDonationMember(member)}
                                      title="संपादित करें"
                                      className="w-7 h-7 rounded-lg hover:bg-amber-50 text-amber-600 flex items-center justify-center transition"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDonationMember(member.id)}
                                      title="हटाएं"
                                      className="w-7 h-7 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center transition"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="text-[10px] text-slate-400 font-bold mt-2 leading-relaxed">
                            💡 ध्यान दें: सूची में बदलाव करने के बाद नीचे दिए गए "दान सेटिंग्स सुरक्षित करें" बटन पर क्लिक करना न भूलें ताकि सभी परिवर्तन सुरक्षित हो सकें।
                          </p>
                        </div>
                      </div>

                      {/* Save Button */}
                      <button
                        type="button"
                        onClick={handleSaveDonationSettings}
                        className="mt-2 w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black rounded-xl shadow-md hover:scale-[1.01] active:scale-99 transition duration-300 flex items-center justify-center gap-2 select-none"
                      >
                        {donationSuccess ? (
                          <>
                            <Check className="w-5 h-5 text-slate-950" />
                            <span>सेटिंग्स सफलतापूर्वक सुरक्षित कर दी गईं!</span>
                          </>
                        ) : (
                          <>
                            <Database className="w-5 h-5 text-slate-950" />
                            <span>दान सेटिंग्स सुरक्षित करें</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'bhajan_documents' && (
                  <div className="flex flex-col gap-5 text-xs text-slate-700">
                    <div className="bg-amber-50/60 border border-amber-100 p-5 rounded-2xl flex flex-col gap-4">
                      <h4 className="text-sm font-bold text-amber-950 flex items-center gap-1.5 border-b border-amber-100 pb-2">
                        <BookOpen className="w-5 h-5 text-orange-500" />
                        <span>📖 भक्तिमय भजन संग्रह प्रबंधन (Bhajan Documents)</span>
                      </h4>

                      <p className="text-[11px] text-slate-500 font-medium -mt-2 leading-relaxed">
                        यहाँ से आप "भक्तिमय भजन संग्रह" में प्रदर्शित होने वाले भजन दस्तावेज़ों (PDF, JPG, PNG) को जोड़, संपादित और हटा सकते हैं। सभी फाइलें केवल बाहरी यूआरएल (URL) द्वारा लोड होंगी।
                      </p>

                      <div className="bg-white border border-amber-200/50 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
                        <h5 className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider">
                          {editingBdocId ? "✍️ भजन दस्तावेज़ विवरण संपादित करें" : "➕ नया भजन दस्तावेज़ जोड़ें"}
                        </h5>

                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">भजन का शीर्षक (Bhajan Title):</label>
                            <input
                              type="text"
                              value={editingBdocId ? editBdocTitle : newBdocTitle}
                              onChange={(e) => editingBdocId ? setEditBdocTitle(e.target.value) : setNewBdocTitle(e.target.value)}
                              placeholder="उदा. शिव चालीसा, मनसा महादेव महिमा..."
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-700 font-bold"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">फाइल का प्रकार (Media Type):</label>
                              <select
                                value={editingBdocId ? editBdocMediaType : newBdocMediaType}
                                onChange={(e) => editingBdocId ? setEditBdocMediaType(e.target.value as any) : setNewBdocMediaType(e.target.value as any)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-700 font-bold"
                              >
                                <option value="pdf">📄 PDF Document</option>
                                <option value="jpg">🖼️ JPG Image</option>
                                <option value="png">🖼️ PNG Image</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2 py-2">
                              <input
                                type="checkbox"
                                id="bdocIsOnCheckbox"
                                checked={editingBdocId ? editBdocIsOn : newBdocIsOn}
                                onChange={(e) => editingBdocId ? setEditBdocIsOn(e.target.checked) : setNewBdocIsOn(e.target.checked)}
                                className="w-4.5 h-4.5 accent-amber-500 cursor-pointer"
                              />
                              <label htmlFor="bdocIsOnCheckbox" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                                वेबसाइट पर दिखाएं (Display ON/OFF)
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">मीडिया फ़ाइल यूआरएल (Media URL):</label>
                            <input
                              type="text"
                              value={editingBdocId ? editBdocMediaUrl : newBdocMediaUrl}
                              onChange={(e) => editingBdocId ? setEditBdocMediaUrl(e.target.value) : setNewBdocMediaUrl(e.target.value)}
                              placeholder="https://example.com/files/shiv-chalisa.pdf"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-700 font-bold font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={editingBdocId ? () => handleUpdateBhajanDocument(editingBdocId) : handleAddBhajanDocument}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm hover:scale-[1.01] active:scale-95 transition"
                          >
                            {editingBdocId ? "अपडेट करें" : "संग्रह में जोड़ें"}
                          </button>
                          {editingBdocId && (
                            <button
                              type="button"
                              onClick={() => setEditingBdocId(null)}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition"
                            >
                              रद्द करें
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest px-1">
                          भजन संग्रह सूची ({bhajanDocs.length}):
                        </p>

                        {bhajanDocs.length === 0 ? (
                          <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 font-medium">
                            कोई भजन दस्तावेज़ नहीं मिला। कृपया ऊपर से जोड़ें।
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
                            {bhajanDocs.map((doc, idx) => (
                              <div
                                key={doc.id}
                                className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition ${
                                  editingBdocId === doc.id
                                    ? 'bg-amber-50/40 border-amber-200'
                                    : 'bg-white border-slate-200/50 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="text-[10px] font-extrabold text-orange-600 bg-orange-50 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                                    {idx + 1}
                                  </span>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-extrabold text-slate-800 truncate">{doc.title}</span>
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 mt-1">
                                      <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-100 rounded">
                                        {doc.mediaType.toUpperCase()}
                                      </span>
                                      <span className={`px-1.5 py-0.5 rounded ${
                                        doc.isOn ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                      }`}>
                                        {doc.isOn ? 'सक्रिय (ON)' : 'निष्क्रिय (OFF)'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {deleteConfirmBdocId === doc.id ? (
                                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 p-1 rounded-xl">
                                      <span className="text-[9px] text-rose-600 font-bold px-1">हटाएं?</span>
                                      <button
                                        onClick={() => handleDeleteBhajanDocument(doc.id)}
                                        className="px-2 py-1 bg-rose-500 text-white font-extrabold text-[9px] rounded-lg shadow-sm hover:bg-rose-600 transition"
                                      >
                                        हाँ
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmBdocId(null)}
                                        className="px-2 py-1 bg-slate-200 text-slate-700 font-extrabold text-[9px] rounded-lg hover:bg-slate-300 transition"
                                      >
                                        नहीं
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditBdoc(doc)}
                                        className="w-7 h-7 rounded-lg hover:bg-amber-50 text-amber-600 flex items-center justify-center transition"
                                        title="संपादित करें"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeleteConfirmBdocId(doc.id)}
                                        className="w-7 h-7 rounded-lg hover:bg-rose-50 text-rose-500 flex items-center justify-center transition"
                                        title="हटाएं"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 11. PUSH NOTIFICATIONS TAB PANEL */}
                {activeTab === 'push_notifications' && (
                  <div className="flex flex-col gap-6 text-xs text-slate-700">
                    
                    {/* Subscriber count widget & info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3.5 shadow-sm">
                        <div className="w-11 h-11 bg-emerald-500 text-white flex items-center justify-center rounded-xl font-bold shrink-0">
                          <Bell className="w-5 h-5 animate-bounce" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">सक्रिय ग्राहक (Subscribers)</span>
                          <span className="text-xl font-mono font-black text-emerald-700">{subscriberCount} उपकरण</span>
                        </div>
                      </div>

                      <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl flex items-center gap-3.5 shadow-sm">
                        <div className="w-11 h-11 bg-sky-500 text-white flex items-center justify-center rounded-xl font-bold shrink-0">
                          <Send className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">कुल भेजे गए नोटिफिकेशन</span>
                          <span className="text-xl font-mono font-black text-sky-700">{sentPushList.length} भेजे गए</span>
                        </div>
                      </div>
                    </div>

                    {/* Send notification form */}
                    <form onSubmit={handleSendPush} className="bg-orange-50/40 border border-orange-100 p-5 rounded-3xl flex flex-col gap-4">
                      <h3 className="text-sm font-bold text-orange-900 flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-orange-600" />
                        <span>नया लाइव पुश नोटिफिकेशन भेजें (Send Push Notification)</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">नोटिफिकेशन का शीर्षक (Title) *:</label>
                          <input
                            type="text"
                            value={pushTitle}
                            onChange={(e) => setPushTitle(e.target.value)}
                            placeholder="उदा: आज की शाम की भव्य महाआरती दर्शन"
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs text-slate-700 font-extrabold"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">क्लिक करने पर लक्ष्य यूआरएल (Target URL):</label>
                          <input
                            type="text"
                            value={pushTargetUrl}
                            onChange={(e) => setPushTargetUrl(e.target.value)}
                            placeholder="उदा: https://example.com/live-darshan"
                            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs text-slate-700 font-bold font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">नोटिफिकेशन संदेश (Message) *:</label>
                        <textarea
                          value={pushMsg}
                          onChange={(e) => setPushMsg(e.target.value)}
                          placeholder="उदा: मंसा महादेव मंदिर तितरड़ी से आज की शाम की आरती का विशेष प्रसारण लाइव देखें। महाप्रसाद वितरण 7:30 बजे से।"
                          rows={3}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs text-slate-700 font-bold leading-relaxed"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">नोटिफिकेशन बैनर चित्र यूआरएल (Image URL) - वैकल्पिक:</label>
                        <input
                          type="text"
                          value={pushImageUrl}
                          onChange={(e) => setPushImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs text-slate-700 font-bold font-mono"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-1">
                        <p className="text-[10px] text-orange-700 font-black">
                          🚩 बटन दबाते ही यह नोटिफिकेशन सभी सब्सक्राइबर्स को तुरंत (Realtime) प्राप्त हो जाएगा।
                        </p>
                        <button
                          type="submit"
                          disabled={pushSending}
                          className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs rounded-xl shadow-md hover:scale-[1.01] active:scale-95 transition shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {pushSending ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>भेजा जा रहा है...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Send Notification</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Notification History list */}
                    <div className="flex flex-col gap-3">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest px-1">
                        प्रसारित नोटिफिकेशन इतिहास (Sent History - {sentPushList.length}):
                      </p>

                      {sentPushList.length === 0 ? (
                        <div className="text-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-slate-400 font-medium">
                          अभी तक कोई पुश नोटिफिकेशन नहीं भेजा गया है।
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
                          {sentPushList.map((notif) => (
                            <div key={notif.id} className="bg-white border border-slate-200/60 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-start hover:shadow-sm transition">
                              {notif.imageUrl && (
                                <img
                                  src={notif.imageUrl}
                                  alt=""
                                  className="w-full sm:w-20 h-16 object-cover rounded-xl border border-slate-100 shrink-0 bg-slate-50"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                  <h4 className="text-xs font-black text-slate-800">{notif.title}</h4>
                                  <span className="text-[9px] font-mono text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-full">
                                    {new Date(notif.sentAt).toLocaleString('hi-IN')}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1.5">{notif.message}</p>
                                
                                {notif.targetUrl && (
                                  <a
                                    href={notif.targetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] text-sky-600 font-extrabold mt-2.5 hover:underline"
                                  >
                                    <span>लक्ष्य पृष्ठ पर जाएं (Target URL)</span>
                                    <X className="w-3 h-3 rotate-45" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-sky-50 text-center text-[10px] font-bold text-slate-400 shrink-0 flex items-center justify-center gap-1 select-none">
          <Database className="w-3 h-3 text-sky-400" />
          <span>श्री मंसा महादेव मंदिर • TITRARDI, UDAIPUR © 2026</span>
        </div>
      </motion.div>
    </div>
  );
}
