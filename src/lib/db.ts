import { 
  DailyDarshan, 
  GalleryItem, 
  VideoDarshan, 
  AartiItem, 
  BhajanItem, 
  TempleInfo, 
  TempleTiming, 
  NotificationItem 
} from '../types';

// Default / Seed Data using the generated high-quality spiritual assets
const DEFAULT_TEMPLE_INFO: TempleInfo = {
  about: "श्री मंसा महादेव मंदिर उदयपुर के तितरड़ी क्षेत्र के उपला फलां में स्थित एक प्राचीन और जागृत शिव धाम है। यहाँ महादेव की पिंडी दिव्य और अलौकिक है। ऐसी मान्यता है कि यहाँ सच्चे मन से मांगी गई हर मन्नत (मंसा) अवश्य पूरी होती है। मंदिर परिसर प्राकृतिक सुंदरता से घिरा हुआ है और श्रद्धालुओं के लिए असीम शांति का केंद्र है।",
  history: "यह मंदिर सदियों पुराना माना जाता है, जहाँ पूर्व काल में संतों ने घोर तपस्या की थी। तितरड़ी पहाड़ी और प्राकृतिक चट्टानों के बीच स्थित इस स्थान पर स्वयं महादेव प्रकट हुए थे। स्थानीय ग्रामीणों और दानदाताओं के सहयोग से मंदिर का भव्य जीर्णोद्धार किया गया, जिससे यह आज उदयपुर संभाग के प्रमुख धार्मिक और आध्यात्मिक स्थलों में से एक बन गया है। यहाँ सावन मास, महाशिवरात्रि और प्रत्येक प्रदोष पर विशेष उत्सवों का आयोजन किया जाता है।",
  contact: {
    phone: "+91 94142 35890",
    email: "contact@mansamahadevtemple.org",
    whatsApp: "9414235890",
    googleMapsLink: "https://maps.google.com/?q=Mansa+Mahadev+Temple,+Upla+Phalan,+Titrardi,+Udaipur,+Rajasthan",
    address: "उपला फलां, तितरड़ी, उदयपुर, राजस्थान - 313002"
  }
};

const DEFAULT_TIMINGS: TempleTiming[] = [
  { id: "1", event: "पट खुलना (Morning Opening)", time: "05:00 AM", description: "मंदिर के कपाट खुलने का समय" },
  { id: "2", event: "मंगला आरती (Mangala Aarti)", time: "05:30 AM", description: "प्रातः काल की प्रथम दिव्य आरती" },
  { id: "3", event: "जलाभिषेक एवं श्रृंगार (Abhishek & Shringar)", time: "06:00 AM - 11:30 AM", description: "भक्तों द्वारा जलाभिषेक एवं दूध अभिषेक" },
  { id: "4", event: "मध्याह्न भोग एवं विश्राम (Noon Closing)", time: "12:00 PM - 04:00 PM", description: "दोपहर विश्राम समय (कपाट बंद)" },
  { id: "5", event: "संध्या पट खुलना (Evening Opening)", time: "04:00 PM", description: "कपाट पुनः दर्शनार्थ खुलना" },
  { id: "6", event: "संध्या आरती (Sandhya Aarti)", time: "07:00 PM", description: "दीपमाला एवं धूप के साथ महाआरती" },
  { id: "7", event: "शयन आरती एवं पट बंद (Closing)", time: "09:00 PM", description: "महादेव की शयन आरती और कपाट बंद" }
];

const DEFAULT_DARSHAN: DailyDarshan = {
  id: "today",
  imageUrl: "/src/assets/images/today_shringar_1782657607504.jpg",
  date: new Date().toISOString().split('T')[0],
  festivalName: "सावन विशेष श्रृंगार",
  description: "मंसा महादेव का आज का अलौकिक श्रृंगार। महादेव का पंचामृत स्नान के पश्चात मदार पुष्पों, बिल्व पत्रों, चंदन त्रिपुंड और सुंदर स्वर्ण मुकुट से श्रृंगार किया गया है। सभी भक्तों पर मंसा महादेव अपनी असीम कृपा बनाए रखें। हर हर महादेव!",
  uploadedAt: new Date().toISOString()
};

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: "gal_1",
    imageUrl: "/src/assets/images/today_shringar_1782657607504.jpg",
    date: "2026-06-27",
    festivalName: "प्रदोष व्रत श्रृंगार",
    description: "प्रदोष काल में महादेव का अति मनोहारी श्रृंगार। भांग, चंदन और कमल गट्टे के पुष्पों से दिव्य श्रृंगार दर्शन।",
    uploadedAt: "2026-06-27T19:00:00.000Z"
  },
  {
    id: "gal_2",
    imageUrl: "https://images.unsplash.com/photo-1609137144814-7d526e959ec2?q=80&w=600&auto=format&fit=crop",
    date: "2026-06-25",
    festivalName: "गंगाजल अभिषेक",
    description: "शुद्ध गंगाजल और केवड़ा जल से महादेव का अभिषेक और गुलाब फूलों की पंखुड़ियों से दिव्य श्रृंगार।",
    uploadedAt: "2026-06-25T19:00:00.000Z"
  },
  {
    id: "gal_3",
    imageUrl: "https://images.unsplash.com/photo-1634547565985-78e718fe4f8b?q=80&w=600&auto=format&fit=crop",
    date: "2026-06-20",
    festivalName: "अमरनाथ झांकी दर्शन",
    description: "बर्फ की सुंदर झांकी के बीच मंसा महादेव के हिम-स्वरूप के अलौकिक दर्शन।",
    uploadedAt: "2026-06-20T19:00:00.000Z"
  }
];

const DEFAULT_VIDEOS: VideoDarshan[] = [
  {
    id: "vid_1",
    title: "मंसा महादेव मंदिर महाशिवरात्रि महाआरती दिव्य दर्शन 2026",
    youtubeUrl: "https://www.youtube.com/watch?v=FisXpL29-c8",
    date: new Date().toISOString().split('T')[0],
    isToday: true,
    uploadedAt: new Date().toISOString()
  },
  {
    id: "vid_2",
    title: "सावन सोमवार रुद्र अभिषेक मंसा महादेव उदयपुर",
    youtubeUrl: "https://www.youtube.com/watch?v=H7Zg-HmsD1Q",
    date: "2026-06-22",
    isToday: false,
    uploadedAt: "2026-06-22T12:00:00Z"
  }
];

const DEFAULT_AARTIS: AartiItem[] = [
  {
    id: "aarti_shiv",
    title: "Shiv Aarti",
    deity: "Shiv",
    hindiTitle: "भगवान् भोलेनाथ की आरती",
    text: `जय शिव ओंकारा, हर ॐ जय शिव ओंकारा।
ब्रह्मा, विष्णु, सदाशिव, अर्द्धांगी धारा॥ ॐ जय...

एकानन चतुरानन पंचानन राजे।
हंसासन गरुड़ासन वृषवाहन साजे॥ ॐ जय...

दो भुज चार चतुर्भुज दसभुज अति सोहे।
तीनों रूप निरखते त्रिभुवन जन मोहे॥ ॐ जय...

अक्षमाला वनमाला मुंडमाला धारी।
त्रिपुराारी कंसारी कर माला धारी॥ ॐ जय...

श्वेतांबर पीतांबर बाघंबर अंगे।
सनकादिक गरुड़ादिक भूतादिक संगे॥ ॐ जय...

कर के मध्य कमंडलु चक्र त्रिशूलधारी।
सुखकारी दुखहारी जगपालनकारी॥ ॐ जय...

ब्रह्मा विष्णु सदाशिव जानत अविवेका।
प्रणवाक्षर के मध्ये ये तीनों एका॥ ॐ जय...

काशी में विश्वनाथ विराजत नंदी ब्रह्मचारी।
नित उठ दर्शन पावत महिमा अति भारी॥ ॐ जय...

त्रिगुण शिवजी की आरती जो कोई नर गावे।
कहत शिवानंद स्वामी मनवांछित फल पावे॥ ॐ जय...`
  },
  {
    id: "aarti_hanuman",
    title: "Hanuman Aarti",
    deity: "Hanuman",
    hindiTitle: "हनुमान जी की आरती",
    text: `आरती कीजै हनुमान लला की। दुष्ट दलन रघुनाथ कला की॥

जाके बल से गिरिवर कांपे। रोग दोष जाके निकट न झांके॥
अंजनी पुत्र महा बलदाई। संतन के प्रभु सदा सहाई॥ आरती कीजै...

दे बीरा रघुनाथ पठाए। लंका जारि सिया सुधि लाए॥
लंका सो कोट समुद्र सी खाई। जात पवनसुत बार न लाई॥ आरती कीजै...

लंका जारि असुर संहारे। सियारामजी के काज सवारे॥
लक्ष्मण मूर्छित पड़े सकारे। आनि सजीवन प्रान उबारे॥ आरती कीजै...

पैठि पाताल तोरि जमकारे। अहिरावन की भुजा उखारे॥
बाएं भुजा असुर दल मारे। दहिने भुजा संत जन तारे॥ आरती कीजै...

सुर नर मुनि आरती उतारें। जय जय जय हनुमान उचारें॥
कंचन थार कपूर लौ छाई। आरती करत अंजना माई॥ आरती कीजै...

जो हनुमानजी की आरती गावे। बसि बैकुंठ परम पद पावे॥
मम हृदय कंज निवास कुरु, कामादि खल दल गंजनम्॥ आरती कीजै...`
  },
  {
    id: "chalisa_hanuman",
    title: "Hanuman Chalisa",
    deity: "HanumanChalisa",
    hindiTitle: "हनुमान चालीसा",
    text: `॥ श्री हनुमान चालीसा ॥

दोहा:
श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि।
बरनउँ रघुबर बिमल जसु जो दायकु फल चारि॥

बुद्धिहीन तनु जानिके सुमिरौ पवन-कुमार।
बल बुधि बिद्या देहु मोहि हरहु कलेस बिकार॥

चौपाई:
जय हनुमान ज्ञान गुन सागर।
जय कपीस तिहुँ लोक उजागर॥१॥

राम दूत अतुलित बल धामा।
अंजनि-पुत्र पवनसुत नामा॥२॥

महाबीर बिक्रम बजरंगी।
कुमति निवार सुमति के संगी॥३॥

कंचन बरन बिराज सुबेसा।
कानन कुंडल कुंचित केसा॥४॥

हाथ बज्र औ ध्वजा बिराजै।
काँधे मूँज जनेऊ साजै॥५॥

शंकर सुवन केसरी नंदन।
तेज प्रताप महा जग बंदन॥६॥

बिद्यावान गुनी अति चातुर।
राम काज करिबे को आतुर॥७॥

प्रभु चरित्र सुनिबे को रसिया।
राम लखन सीता मन बसिया॥८॥

सूक्ष्म रूप धरि सियहिं दिखावा।
बिकट रूप धरि लंक जरावा॥९॥

भीम रूप धरि असुर सँहारे।
रामचंद्र के काज सँवारे॥१०॥

लाय सजीवन लखन जियाए।
श्रीरघुबीर हरषि उर लाए॥११॥

रघुपति कीन्ही बहुत बड़ाई।
तुम मम प्रिय भरतहि सम भाई॥१२॥

सहस बदन तुम्हरो जस गावैं।
अस कहि श्रीपति कंठ लगावैं॥१३॥

सनकादिक ब्रह्मादि मुनीसा।
नारद सारद सहित अहीसा॥१४॥

जम कुबेर दिगपाल जहाँ ते।
कबि कोबिद कहि सके कहाँ ते॥१५॥

तुम उपकार सुग्रीवहिं कीन्हा।
राम मिलाय राज पद दीन्हा॥१६॥

तुम्हरो मंत्र बिभीषन माना।
लंकेस्वर भए सब जग जाना॥१७॥

जुग सहस्र जोजन पर भानू।
लील्यो ताहि मधुर फल जानू॥१८॥

प्रभु मुद्रिका मेलि मुख माहीं।
जलधि लाँघि गये अचरज नाहीं॥१९॥

दुर्गम काज जगत के जेते।
सुगम अनुग्रह तुम्हरे तेते॥२०॥

राम दुआरे तुम रखवारे।
होत न आग्या बिनु पैसारे॥२१॥

सब सुख लहै तुम्हारी सरना।
तुम रक्षक काहू को डर ना॥२२॥

आपन तेज सम्हारो आपै।
तीनों लोक हाँक तें काँपै॥२३॥

भूत पिसाच निकट नहिं आवै।
महाबीर जब नाम सुनावै॥२४॥

नासै रोग हरै सब पीरा।
जपत निरंतर हनुमत बीरा॥२५॥

संकट तें हनुमान छुड़ावै।
मन क्रम बचन ध्यान जो लावै॥२६॥

सब पर राम तपस्वी राजा।
तिन के काज सकल तुम साजा॥२७॥

और मनोरथ जो कोई लावै।
सोइ अमित जीवन फल पावै॥२८॥

चारों जुग परताप तुम्हारा।
है परसिद्ध जगत उजियारा॥२९॥

साधु संत के तुम रखवारे।
असुर निकंदन राम दुलारे॥३०॥

अष्टसिद्धि नौ निधि के दाता।
अस बर दीन्ह जानकी माता॥३१॥

राम रसायन तुम्हरे पासा।
Sada Raho Raghupati Ke Dasa (सदा रहो रघुपति के दासा)॥३२॥

तुम्हरे भजन राम को पावै।
जनम जनम के दुख बिसरावै॥३३॥

अंत काल रघुबर पुर जाई।
जहाँ जन्म हरी भक्त कहाई॥३४॥

और देवता चित्त न धरई।
हनुमत सेइ सर्ब सुख करई॥३५॥

संकट कटै मिटै सब पीरा।
जो सुमिरै हनुमत बलबीरा॥३६॥

जै जै जै हनुमान गोसाईं।
कृपा करहु गुरुदेव की नाईं॥३७॥

जो सत बार पाठ कर कोई।
छूटहि बंदि महा सुख होई॥३८॥

जो यह पढ़ै हनुमान चालीसा।
होय सिद्ध साखी गौरीसा॥३९॥

तुलसीदास सदा हरी चेरा।
कीजै नाथ हृदय मँह डेरा॥४०॥

दोहा:
पवनतनय संकट हरन मंगल मूरति रूप।
राम लखन सीता सहित हृदय बसहु सुर भूप॥

॥ इति श्री हनुमान चालीसा ॥`
  },
  {
    id: "stuti_ram",
    title: "Ram Stuti",
    deity: "Ram",
    hindiTitle: "भगवान् श्री राम स्तुति",
    text: `श्री रामचन्द्र कृपालु भजु मन हरण भवभय दारुणम्।
नवकंज लोचन, कंज मुख, कर कंज, पद कंजारुणम्॥

कंदर्प अगणित अमित छवि, नवनील नीरद सुंदरम्।
पट पीत मानहु तड़ित रुचि शुचि नौमि जनक सुतावरम्॥

भजु दीनबंधु दिनेश दानव दैत्य वंश निकंदनम्।
रघुनंद आनंदकंद कोशलचंद दशरथ नंदनम्॥

सिर मुकुट कुंडल तिलक चारु उदारु अंग विभूषणम्।
आजानुभुज शर चाप धर, संग्राम जित खर दूषणम्॥

इति वदति तुलसीदास शंकर शेष मुनि मन रंजनम्।
मम हृदय कंज निवास कुरु, कामादि खल दल गंजनम्॥

मनु जाहि राचेउ मिलिहि सो बरु सहज सुंदर सांवरो।
करुना निधान सुजान सीलु सनेहु जानत रावरो॥

एही भांति गौरी असीस सुनि सिय सहित हिय हरषीं अली।
तुलसी भवानिहि पूजि पुनि पुनि मुदित मन मन्दिर चली॥

॥ जानकीनाथ सहाय रहे ॥`
  },
  {
    id: "path_sundarkand",
    title: "Sundarkand Path",
    deity: "Sundarkand",
    hindiTitle: "सुंदरकांड पाठ",
    text: `॥ श्री गणेशाय नमः ॥
॥ श्री जानकीवल्लभो विजयते ॥
॥ श्री रामचरितमानस ॥
॥ पञ्चम सोपान (सुन्दरकाण्ड) ॥

श्लोक:
शांतं शाश्वतमप्रमेयमनघं निर्वाणशान्तिप्रदं
ब्रह्माशम्भुफणीन्द्रसेव्यमनिशं वेदान्तवेद्यं विभुम्।
रामाख्यं जगदीश्वरं सुरगुरुं मायामनुष्यं हरिं
वन्देऽहं करुणाकरं रघुवरं भूपालचूडामणिम्॥१॥

नान्यस्पृहा रघुपते हृदयेऽस्मदीये
सत्यं वदामि च भवानखिलान्तरात्मा।
भक्तिं प्रयच्छ रघुपुङ्गव निर्भरां मे
कामादिदोषरहितं कुरु मानसं च॥२॥

अतुलितबलधामं हेमशैलाभदेहं
दनुजवनकृशानुं ज्ञानिनामग्रगण्यम्।
सकलगुणनिधानं वानराणामधीशं
रघुपतिप्रियभक्तं वातजातं नमामि॥३॥

चौपाई:
जामवंत के बचन सुहाए। सुनि हनुमंत हृदय अति भाए॥
तब लगि मोहि परिखेहु तुम्ह भाई। सहि दुख कंद मूल फल खाई॥

जब लगि आवौं सीतहि देखी। होइहि काजु मोहि हरष बिसेषी॥
यह कहि नाइ सबन्हि कहुँ माथा। चलेउ हरषि हियँ धरि रघुनाथा॥

सिंधु तीर एक भूधर सुंदर। कौतुक कूदि चढ़ेउ ता ऊपर॥
बार-बार रघुबीर सँभारी। तरकेउ पवनतनय बल भारी॥

जेहिं गिरि चरन देइ हनुमंता। चलेउ सो गा पाताल तुरंता॥
जिमि अमोघ रघुपति कर बाना। एही भाँति चलेउ हनुमाना॥

जलनिधि रघुपति दूत बिचारी। तैं मैनाक होहि श्रमहारी॥

हनुमान तेहि परसा कर पुनि कीन्ह प्रनाम।
राम काजु कीन्हें बिना मोहि कहाँ बिश्राम॥

॥ जय श्री राम ॥
॥ जय पवनपुत्र हनुमान ॥`
  }
];

const DEFAULT_BHAJANS: BhajanItem[] = [
  {
    id: "bhajan_1",
    title: "Shiv Tandav Stotram (शिव ताण्डव स्तोत्रम्)",
    singer: "पंडित हरिहरनाथ",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    thumbnailUrl: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=200&auto=format&fit=crop",
    duration: "6:12"
  },
  {
    id: "bhajan_2",
    title: "Har Har Shambhu Shiv Mahadeva",
    singer: "पार्वती कृपालु",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    thumbnailUrl: "https://images.unsplash.com/photo-1609137144814-7d526e959ec2?q=80&w=200&auto=format&fit=crop",
    duration: "7:05"
  },
  {
    id: "bhajan_3",
    title: "Mera Bhola Hai Bhandari",
    singer: "दिनेश गिरी",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    thumbnailUrl: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=200&auto=format&fit=crop",
    duration: "5:44"
  },
  {
    id: "bhajan_4",
    title: "Namo Namo Ji Shankara",
    singer: "अमित त्रिवेदी (Cover)",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    thumbnailUrl: "https://images.unsplash.com/photo-1634547565985-78e718fe4f8b?q=80&w=200&auto=format&fit=crop",
    duration: "5:02"
  }
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    title: "सावन मास महोत्सव",
    message: "सावन मास के प्रत्येक सोमवार को मंसा महादेव मंदिर में विशेष रुद्राभिषेक और रात्रि दीपमालिका का आयोजन किया जाएगा। सभी श्रद्धालु सादर आमंत्रित हैं।",
    date: new Date().toISOString().split('T')[0],
    type: "festival"
  },
  {
    id: "notif_2",
    title: "महा शिवरात्रि पर्व तैयारी",
    message: "महाशिवरात्रि पर मंसा महादेव मंदिर में चार प्रहर की विशेष पूजा और भव्य पालकी यात्रा निकाली जाएगी। मंदिर को आकर्षक रोशनी से सजाया जाएगा।",
    date: "2026-06-25",
    type: "general"
  }
];

// Helper to initialize local storage
function initDB() {
  if (!localStorage.getItem('mm_dailyDarshan')) {
    localStorage.setItem('mm_dailyDarshan', JSON.stringify(DEFAULT_DARSHAN));
  }
  if (!localStorage.getItem('mm_gallery')) {
    localStorage.setItem('mm_gallery', JSON.stringify(DEFAULT_GALLERY));
  }
  if (!localStorage.getItem('mm_videos')) {
    localStorage.setItem('mm_videos', JSON.stringify(DEFAULT_VIDEOS));
  }
  if (!localStorage.getItem('mm_aartis')) {
    localStorage.setItem('mm_aartis', JSON.stringify(DEFAULT_AARTIS));
  }
  if (!localStorage.getItem('mm_bhajans')) {
    localStorage.setItem('mm_bhajans', JSON.stringify(DEFAULT_BHAJANS));
  }
  if (!localStorage.getItem('mm_templeInfo')) {
    localStorage.setItem('mm_templeInfo', JSON.stringify(DEFAULT_TEMPLE_INFO));
  }
  if (!localStorage.getItem('mm_templeTimings')) {
    localStorage.setItem('mm_templeTimings', JSON.stringify(DEFAULT_TIMINGS));
  }
  if (!localStorage.getItem('mm_notifications')) {
    localStorage.setItem('mm_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
  }
  if (!localStorage.getItem('mm_admin_auth')) {
    // Default admin creds
    localStorage.setItem('mm_admin_auth', JSON.stringify({
      email: "admin@mansamahadev.com",
      password: "admin"
    }));
  }
}

// Custom Event dispatching for real-time live database updates
const listeners = new Set<() => void>();

export function subscribeToDBUpdates(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyDBChange() {
  listeners.forEach(cb => {
    try {
      cb();
    } catch (e) {
      console.error(e);
    }
  });
}

// Initialize on import
initDB();

export const db = {
  // Authentication
  loginAdmin(email: string, pass: string): boolean {
    const credsStr = localStorage.getItem('mm_admin_auth');
    if (!credsStr) return false;
    const creds = JSON.parse(credsStr);
    if (creds.email.trim().toLowerCase() === email.trim().toLowerCase() && creds.password === pass) {
      localStorage.setItem('mm_admin_session', 'true');
      notifyDBChange();
      return true;
    }
    return false;
  },

  logoutAdmin() {
    localStorage.removeItem('mm_admin_session');
    notifyDBChange();
  },

  isAdminLoggedIn(): boolean {
    return localStorage.getItem('mm_admin_session') === 'true';
  },

  // Daily Darshan
  getDailyDarshan(): DailyDarshan {
    const data = localStorage.getItem('mm_dailyDarshan');
    return data ? JSON.parse(data) : DEFAULT_DARSHAN;
  },

  updateDailyDarshan(darshan: Omit<DailyDarshan, 'id' | 'uploadedAt'>) {
    const current = this.getDailyDarshan();
    
    // Auto-move yesterday's/previous daily darshan to Past Darshan Gallery!
    if (current && current.imageUrl && current.imageUrl !== darshan.imageUrl && current.date !== darshan.date) {
      const galleryItem: GalleryItem = {
        id: "gal_" + Date.now(),
        imageUrl: current.imageUrl,
        date: current.date,
        festivalName: current.festivalName || "दैनिक श्रृंगार",
        description: current.description,
        uploadedAt: current.uploadedAt
      };
      this.addGalleryItem(galleryItem);
    }

    const updated: DailyDarshan = {
      id: "today",
      ...darshan,
      uploadedAt: new Date().toISOString()
    };
    localStorage.setItem('mm_dailyDarshan', JSON.stringify(updated));
    notifyDBChange();
  },

  // Gallery
  getGallery(): GalleryItem[] {
    const data = localStorage.getItem('mm_gallery');
    const items: GalleryItem[] = data ? JSON.parse(data) : DEFAULT_GALLERY;
    // Return sorted by date descending
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addGalleryItem(item: Omit<GalleryItem, 'id' | 'uploadedAt'> & { id?: string }) {
    const items = this.getGallery();
    const newItem: GalleryItem = {
      id: item.id || "gal_" + Date.now(),
      imageUrl: item.imageUrl,
      date: item.date,
      festivalName: item.festivalName,
      description: item.description,
      uploadedAt: new Date().toISOString()
    };
    items.push(newItem);
    localStorage.setItem('mm_gallery', JSON.stringify(items));
    notifyDBChange();
  },

  updateGalleryItem(id: string, updatedFields: Partial<GalleryItem>) {
    let items = this.getGallery();
    items = items.map(item => {
      if (item.id === id) {
        return { ...item, ...updatedFields };
      }
      return item;
    });
    localStorage.setItem('mm_gallery', JSON.stringify(items));
    notifyDBChange();
  },

  deleteGalleryItem(id: string) {
    let items = this.getGallery();
    items = items.filter(item => item.id !== id);
    localStorage.setItem('mm_gallery', JSON.stringify(items));
    notifyDBChange();
  },

  // Video Darshan (YouTube)
  getVideos(): VideoDarshan[] {
    const data = localStorage.getItem('mm_videos');
    const items: VideoDarshan[] = data ? JSON.parse(data) : DEFAULT_VIDEOS;
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getTodayVideo(): VideoDarshan | null {
    const list = this.getVideos();
    const today = list.find(v => v.isToday);
    return today || (list.length > 0 ? list[0] : null);
  },

  addVideo(video: { title: string; youtubeUrl: string; date: string; isToday: boolean }) {
    const videos = this.getVideos();
    
    // If setting this video as today's video, mark all other videos as NOT isToday (automatically shifts them to Gallery)
    if (video.isToday) {
      videos.forEach(v => { v.isToday = false; });
    }

    const newVideo: VideoDarshan = {
      id: "vid_" + Date.now(),
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      date: video.date,
      isToday: video.isToday,
      uploadedAt: new Date().toISOString()
    };
    videos.push(newVideo);
    localStorage.setItem('mm_videos', JSON.stringify(videos));
    notifyDBChange();
  },

  deleteVideo(id: string) {
    let videos = this.getVideos();
    videos = videos.filter(v => v.id !== id);
    localStorage.setItem('mm_videos', JSON.stringify(videos));
    notifyDBChange();
  },

  updateVideo(id: string, updatedFields: Partial<VideoDarshan>) {
    let videos = this.getVideos();
    if (updatedFields.isToday) {
      videos.forEach(v => { v.isToday = false; });
    }
    videos = videos.map(v => {
      if (v.id === id) {
        return { ...v, ...updatedFields };
      }
      return v;
    });
    localStorage.setItem('mm_videos', JSON.stringify(videos));
    notifyDBChange();
  },

  // Aartis
  getAartis(): AartiItem[] {
    const data = localStorage.getItem('mm_aartis');
    if (!data) return DEFAULT_AARTIS;
    try {
      const aartis = JSON.parse(data) as AartiItem[];
      let modified = false;

      // Ensure 'stuti_ram' exists in local storage
      const hasRam = aartis.some(a => a.id === 'stuti_ram');
      if (!hasRam) {
        const ramItem = DEFAULT_AARTIS.find(a => a.id === 'stuti_ram');
        if (ramItem) {
          aartis.push(ramItem);
          modified = true;
        }
      }

      // Ensure 'path_sundarkand' exists in local storage
      const hasSundarkand = aartis.some(a => a.id === 'path_sundarkand');
      if (!hasSundarkand) {
        const sundarkandItem = DEFAULT_AARTIS.find(a => a.id === 'path_sundarkand');
        if (sundarkandItem) {
          aartis.push(sundarkandItem);
          modified = true;
        }
      }

      // Ensure 'chalisa_hanuman' exists in local storage
      const hasChalisa = aartis.some(a => a.id === 'chalisa_hanuman');
      if (!hasChalisa) {
        const chalisaItem = DEFAULT_AARTIS.find(a => a.id === 'chalisa_hanuman');
        if (chalisaItem) {
          const hanumanIdx = aartis.findIndex(a => a.id === 'aarti_hanuman');
          if (hanumanIdx !== -1) {
            aartis.splice(hanumanIdx + 1, 0, chalisaItem);
          } else {
            aartis.push(chalisaItem);
          }
          modified = true;
        }
      }

      const updatedAartis = aartis.map(a => {
        let changed = false;
        let hindiTitle = a.hindiTitle;
        if (a.id === 'aarti_shiv' && a.hindiTitle !== 'भगवान् भोलेनाथ की आरती') {
          hindiTitle = 'भगवान् भोलेनाथ की आरती';
          changed = true;
        } else if (a.id === 'aarti_hanuman' && a.hindiTitle !== 'हनुमान जी की आरती') {
          hindiTitle = 'हनुमान जी की आरती';
          changed = true;
        } else if (a.id === 'stuti_ram' && a.hindiTitle !== 'भगवान् श्री राम स्तुति') {
          hindiTitle = 'भगवान् श्री राम स्तुति';
          changed = true;
        } else if (a.id === 'path_sundarkand' && a.hindiTitle !== 'सुंदरकांड पाठ') {
          hindiTitle = 'सुंदरकांड पाठ';
          changed = true;
        } else if (a.id === 'chalisa_hanuman' && a.hindiTitle !== 'हनुमान चालीसा') {
          hindiTitle = 'हनुमान चालीसा';
          changed = true;
        }
        if (changed) {
          modified = true;
          return { ...a, hindiTitle };
        }
        return a;
      });
      if (modified) {
        localStorage.setItem('mm_aartis', JSON.stringify(updatedAartis));
      }
      return updatedAartis;
    } catch (e) {
      return DEFAULT_AARTIS;
    }
  },

  updateAarti(id: string, updatedText: string) {
    const aartis = this.getAartis();
    const item = aartis.find(a => a.id === id);
    if (item) {
      item.text = updatedText;
      localStorage.setItem('mm_aartis', JSON.stringify(aartis));
      notifyDBChange();
    }
  },

  // Bhajans
  getBhajans(): BhajanItem[] {
    const data = localStorage.getItem('mm_bhajans');
    return data ? JSON.parse(data) : DEFAULT_BHAJANS;
  },

  addBhajan(bhajan: Omit<BhajanItem, 'id'>) {
    const bhajans = this.getBhajans();
    const newBhajan: BhajanItem = {
      id: "bhajan_" + Date.now(),
      ...bhajan
    };
    bhajans.push(newBhajan);
    localStorage.setItem('mm_bhajans', JSON.stringify(bhajans));
    notifyDBChange();
  },

  deleteBhajan(id: string) {
    let bhajans = this.getBhajans();
    bhajans = bhajans.filter(b => b.id !== id);
    localStorage.setItem('mm_bhajans', JSON.stringify(bhajans));
    notifyDBChange();
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    const data = localStorage.getItem('mm_notifications');
    const items: NotificationItem[] = data ? JSON.parse(data) : DEFAULT_NOTIFICATIONS;
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addNotification(notification: { title: string; message: string; type: 'general' | 'festival' | 'alert' }) {
    const items = this.getNotifications();
    const newItem: NotificationItem = {
      id: "notif_" + Date.now(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      date: new Date().toISOString().split('T')[0]
    };
    items.unshift(newItem); // put at start
    localStorage.setItem('mm_notifications', JSON.stringify(items));
    notifyDBChange();
  },

  deleteNotification(id: string) {
    let items = this.getNotifications();
    items = items.filter(n => n.id !== id);
    localStorage.setItem('mm_notifications', JSON.stringify(items));
    notifyDBChange();
  },

  // Temple Info
  getTempleInfo(): TempleInfo {
    const data = localStorage.getItem('mm_templeInfo');
    return data ? JSON.parse(data) : DEFAULT_TEMPLE_INFO;
  },

  updateTempleInfo(info: TempleInfo) {
    localStorage.setItem('mm_templeInfo', JSON.stringify(info));
    notifyDBChange();
  },

  // Temple Timings
  getTempleTimings(): TempleTiming[] {
    const data = localStorage.getItem('mm_templeTimings');
    return data ? JSON.parse(data) : DEFAULT_TIMINGS;
  },

  updateTempleTiming(id: string, updatedFields: Partial<Omit<TempleTiming, 'id'>>) {
    const timings = this.getTempleTimings();
    const updated = timings.map(t => {
      if (t.id === id) {
        return { ...t, ...updatedFields };
      }
      return t;
    });
    localStorage.setItem('mm_templeTimings', JSON.stringify(updated));
    notifyDBChange();
  }
};

export function formatDateDMY(dateStr: string): string {
  if (!dateStr) return '';
  // If already in DD/MM/YY or DD/MM/YYYY format, return it
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(dateStr)) return dateStr;

  try {
    // Check if format is YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0].substring(2); // last 2 digits
      const month = parts[1];
      const day = parts[2];
      return `${day}/${month}/${year}`;
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).substring(2); // last 2 digits
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateStr;
  }
}

