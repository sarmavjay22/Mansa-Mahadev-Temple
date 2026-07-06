import { collection, onSnapshot, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { firestoreDb } from './firebase';
import { 
  DailyDarshan, 
  GalleryItem, 
  VideoDarshan, 
  AartiItem, 
  BhajanItem, 
  TempleInfo, 
  TempleTiming, 
  NotificationItem,
  TempleEvent,
  CommitteeMember,
  FestivalBanner,
  TempleGalleryItem,
  SocialShareSettings,
  DonationSettings,
  BhajanDocument,
  PushNotificationPayload,
  PushNotificationSubscription
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
    hindiTitle: "भोलेनाथ की आरती",
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
    hindiTitle: "श्रीराम स्तुति",
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

जानी गौरी अनुकूल सिय हिय हरषु न जाइ कहि।
मंजुल मंगल मूल बाम अंग फरकन लगे॥`
  },
  {
    id: "path_sundarkand",
    title: "Sundarkand Path",
    deity: "Sundarkand",
    hindiTitle: "शिव स्तुति",
    text: `शिव स्तुति

आशुतोष शशांक शेखर, चन्द्र मौली चिदंबरा,
कोटि कोटि प्रणाम शम्भू, कोटि नमन दिगम्बरा।।
निर्विकार ओमकार अविनाशी, तुम्ही देवाधि देव,
जगत सर्जक प्रलय करता, शिवम सत्यम सुंदरा।।
निरंकार स्वरूप कालेश्वर, महा योगीश्वरा,
दयानिधि दानिश्वर जय, जटाधार अभयंकरा।।
शूल पानी त्रिशूल धारी, औगड़ी बाघम्बरी,
जय महेश त्रिलोचनाय, विश्वनाथ विशम्भरा।।
नाथ नागेश्वर हरो हर, पाप साप अभिशाप तम,
महादेव महान भोले, सदा शिव शिव संकरा।।
जगत पति अनुरकती भक्ति, सदैव तेरे चरण हो,
क्षमा हो अपराध सब, जय जयति जगदीश्वरा।।
जनम जीवन जगत का संताप ताप मिटे सभी,
ओम नमः शिवाय मन, जपता रहे पञ्चाक्षरा।।
आशुतोष शशांक शेखर, चन्द्र मौली चिदंबरा,
कोटि कोटि प्रणाम शम्भू, कोटि नमन दिगम्बरा।।
कोटि नमन दिगम्बरा.. कोटि नमन दिगम्बरा..`
  },
  {
    id: "path_rudrashtakam",
    title: "Shri Rudrashtakam",
    deity: "Shiv",
    hindiTitle: "शिव रुद्राष्टकम",
    text: `शिव रुद्राष्टकम

नमामीशमीशान निर्वाणरूपं।
विभुं व्यापकं ब्रह्मवेदस्वरूपम्॥
निजं निर्गुणं निर्विकल्पं निरीहं।
चिदाकाशमाकाशवासं भजेऽहम्॥ १ ॥

निराकारमोङ्कारमूलं तुरीयं।
गिराज्ञानगोतीतमीशं गिरीशम्॥
करालं महाकालकालं कृपालं।
गुणागारसंसारपारं नतोऽहम्॥ २ ॥

तुषाराद्रिसङ्काशगौरं गभीरं।
मनोभूतकोटिप्रभाश्रीशरीरम्॥
स्फुरन्मौलिकल्लोलिनीचारुगङ्गा।
लसद्भालबालेन्दु कण्ठे भुजङ्गा॥ ३ ॥

चलत्कुण्डलं भ्रूसुनेत्रं विशालं।
प्रसन्नाननं नीलकण्ठं दयालम्॥
मृगाधीशचर्माम्बरं मुण्डमालं।
प्रियं शङ्करं सर्वनाथं भजामि॥ ४ ॥

प्रचण्डं प्रकृष्टं प्रगल्भं परेशं।
अखण्डं अजं भानुकोटिप्रकाशम्॥
त्रयःशूलनिर्मूलनं शूलपाणिं।
भजेऽहं भवानीपतिं भावगम्यम्॥ ५ ॥

कलातीतकल्याण कल्पान्तकारी।
सदा सज्जनानन्ददाता पुरारी॥
चिदानन्दसन्दोह मोहापहारी।
प्रसीद प्रसीद प्रभो मन्मथारी॥ ६ ॥

न यावद् उमानाथपादारविन्दं।
भजन्तीह लोके परे वा नराणाम्॥
न तावत्सुखं शान्ति सन्तापनाशं।
प्रसीद प्रभो सर्वभूताधिवासम्॥ ७ ॥

न जानामि योगं जपं नैव पूजां।
नतोऽहं सदा सर्वदा शम्भु तुभ्यम्॥
जराजन्मदुःखौघ तातप्यमानं।
प्रभो पाहि आपन्नमामीश शम्भो॥ ८ ॥

रुद्राष्टकमिदं प्रोक्तं विप्रेण हरतोषये।
ये पठन्ति नरा भक्त्या तेषां शम्भुः प्रसीदति॥`
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

export function sanitizeBhajans(items: BhajanItem[]): BhajanItem[] {
  return items.map(item => {
    if (!item.audioUrl) return item;
    const url = item.audioUrl.toLowerCase();
    
    // Check if it's one of the defunct google actions sound urls or old soundhelix urls
    if (url.includes('morning_breeze') || url.includes('song-1')) {
      return { ...item, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" };
    } else if (url.includes('floating_abstract') || url.includes('song-2')) {
      return { ...item, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" };
    } else if (url.includes('acoustic_guitar_strum') || url.includes('song-3')) {
      return { ...item, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" };
    } else if (url.includes('piano_romance') || url.includes('song-4')) {
      return { ...item, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" };
    }
    
    return item;
  });
}

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

export const DEFAULT_FESTIVAL_BANNERS: FestivalBanner[] = [
  {
    id: "fbn_savan",
    title: "सावन सोमवार विशेष उत्सव एवं महा रुद्राभिषेक",
    description: "पवित्र श्रावण मास के पावन अवसर पर बाबा मंसा महादेव का दिव्य फूलों, औषधियों एवं पंचामृत से भव्य महा रुद्राभिषेक, विशेष अलौकिक श्रृंगार एवं महाआरती दर्शन।",
    imageUrl: "https://images.unsplash.com/photo-1609137144814-7d526e959ec2?q=80&w=1200&auto=format&fit=crop",
    startDate: "2026-07-01",
    endDate: "2026-08-31",
    isEnabled: true,
    uploadedAt: new Date().toISOString(),
    time: "06:00 PM",
    location: "मुख्य मंदिर गर्भगृह, मंसा महादेव मंदिर",
    specialNote: "कृपया अपने साथ शुद्ध जल, दूध और विल्व पत्र अवश्य लाएं।"
  },
  {
    id: "fbn_guru",
    title: "श्री गुरु पूर्णिमा महोत्सव",
    description: "आराध्य गुरुदेव के पावन सानिध्य में भव्य गुरु पूजन, सुमधुर भजन संध्या, मंगल आरती एवं विशाल भंडारा (महाप्रसाद) का आयोजन। सभी भक्त सादर आमंत्रित हैं।",
    imageUrl: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=1200&auto=format&fit=crop",
    startDate: "2026-07-01",
    endDate: "2026-07-10",
    isEnabled: true,
    uploadedAt: new Date().toISOString(),
    time: "05:00 PM",
    location: "महादेव मंदिर सभाकक्ष एवं प्रांगण",
    specialNote: "महोत्सव के पश्चात् विशाल भंडारा (प्रसाद वितरण) रहेगा।"
  },
  {
    id: "fbn_haryali",
    title: "हरियाली अमावस्या दिव्य झाँकी दर्शन",
    description: "प्राकृतिक छटा एवं मनमोहक हरियाली के बीच बाबा मंसा महादेव का नाग-देव स्वरूप में अलौकिक श्रृंगार दर्शन एवं छप्पन भोग का दिव्य आयोजन।",
    imageUrl: "https://images.unsplash.com/photo-1634547565985-78e718fe4f8b?q=80&w=1200&auto=format&fit=crop",
    startDate: "2026-07-01",
    endDate: "2026-07-20",
    isEnabled: true,
    uploadedAt: new Date().toISOString(),
    time: "07:30 PM",
    location: "मंसा महादेव मंदिर परिसर",
    specialNote: "विशेष महाआरती रात्रि 8:00 बजे होगी।"
  }
];

export const DEFAULT_SOCIAL_SHARE_SETTINGS: SocialShareSettings = {
  websiteTitle: "मंसा महादेव मंदिर",
  websiteDescription: "दैनिक श्रृंगार दर्शन, आरती वीडियो, उत्सव, सुंदरकांड, मंदिर दर्शन दीर्घा (गैलरी) एवं मंदिर की सम्पूर्ण जानकारी।",
  websiteShareImageUrl: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=1200&auto=format&fit=crop",
  faviconUrl: "",
  defaultShareUrl: ""
};

export const DEFAULT_DONATION_SETTINGS: DonationSettings = {
  isEnabled: true,
  qrCodeUrl: "https://i.ibb.co/DfckK8Pf/file-0000000073a471fbac7baf3abda72214.png", // A high-quality default QR code image
  upiId: "mansamahadev@upi",
  upiLink: "upi://pay?pa=mansamahadev@upi&pn=Mansa%20Mahadev%20Temple&tn=Temple%20Donation",
  message: "मंदिर के धार्मिक कार्यों, सेवा एवं विकास में अपना सहयोग प्रदान करें।",
  committeeName: "श्री मंसा महादेव मंदिर विकास एवं प्रबंधन समिति",
  trusteeName: "श्री मंसा महादेव मंदिर मुख्य ट्रस्टी",
  members: [
    { id: "dm_1", name: "श्री रामलाल जी पटेल", designation: "अध्यक्ष" },
    { id: "dm_2", name: "श्री मोहन लाल जी शर्मा", designation: "सचिव" },
    { id: "dm_3", name: "श्री दिनेश जी वैष्णव", designation: "कोषाध्यक्ष" },
    { id: "dm_4", name: "श्री शांतिलाल जी डांगी", designation: "उपाध्यक्ष" }
  ]
};

export const DEFAULT_TEMPLE_GALLERY: TempleGalleryItem[] = [
  {
    id: "temple_gal_1",
    imageUrl: "/src/assets/images/today_shringar_1782657607504.jpg",
    caption: "मंसा महादेव मुख्य मंदिर एवं दिव्य गर्भगृह का विहंगम दृश्य",
    category: "mandir_parisar",
    uploadDate: "2026-07-04",
    isActive: true,
    uploadedAt: "2026-07-04T00:00:00.000Z"
  },
  {
    id: "temple_gal_2",
    imageUrl: "https://images.unsplash.com/photo-1609137144814-7d526e959ec2?q=80&w=600&auto=format&fit=crop",
    caption: "श्रावण सोमवार एवं भव्य महाआरती उत्सव",
    category: "utsav",
    uploadDate: "2026-07-02",
    isActive: true,
    uploadedAt: "2026-07-02T00:00:00.000Z"
  },
  {
    id: "temple_gal_3",
    imageUrl: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=600&auto=format&fit=crop",
    caption: "श्रद्धालुओं द्वारा शिव नाम संकीर्तन एवं भक्तिमय क्षण",
    category: "bhaktimay",
    uploadDate: "2026-07-03",
    isActive: true,
    uploadedAt: "2026-07-03T00:00:00.000Z"
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
  if (!localStorage.getItem('mm_festival_banners')) {
    localStorage.setItem('mm_festival_banners', JSON.stringify(DEFAULT_FESTIVAL_BANNERS));
  }
  if (!localStorage.getItem('mm_temple_gallery')) {
    localStorage.setItem('mm_temple_gallery', JSON.stringify(DEFAULT_TEMPLE_GALLERY));
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

export let firestoreBhajans: BhajanItem[] = [];

// Subscribe to firestore 'bhajans' collection for real-time sync
onSnapshot(collection(firestoreDb, 'bhajans'), (snapshot) => {
  const items: BhajanItem[] = [];
  snapshot.forEach((docSnap) => {
    items.push({
      id: docSnap.id,
      ...docSnap.data()
    } as BhajanItem);
  });
  
  if (items.length === 0) {
    // If empty in Firestore, seed the Firestore database with default bhajans
    firestoreBhajans = DEFAULT_BHAJANS;
    localStorage.setItem('mm_bhajans', JSON.stringify(DEFAULT_BHAJANS));
    notifyDBChange();

    DEFAULT_BHAJANS.forEach(async (b) => {
      try {
        await setDoc(doc(firestoreDb, 'bhajans', b.id), {
          title: b.title,
          singer: b.singer,
          audioUrl: b.audioUrl,
          thumbnailUrl: b.thumbnailUrl,
          duration: b.duration
        });
      } catch (err) {
        console.error("Failed to seed bhajan to Firestore:", err);
      }
    });
  } else {
    const sanitized = sanitizeBhajans(items);
    firestoreBhajans = sanitized;
    localStorage.setItem('mm_bhajans', JSON.stringify(sanitized));
    notifyDBChange();
  }
}, (error) => {
  console.error("Firestore bhajans subscription error:", error);
});

export let firestoreDailyDarshan: DailyDarshan | null = null;
export let firestoreGallery: GalleryItem[] = [];
export let firestoreVideos: VideoDarshan[] = [];
export let firestoreEvents: TempleEvent[] = [];
export let firestoreCommittee: CommitteeMember[] = [];
export let firestoreFestivalBanners: FestivalBanner[] = [];
export let firestoreTempleGallery: TempleGalleryItem[] = [];
export let firestoreSocialShareSettings: SocialShareSettings | null = null;
export let firestoreDonationSettings: DonationSettings | null = null;
export let firestoreBhajanDocuments: BhajanDocument[] = [];

try {
  const cachedSocialShare = localStorage.getItem('mm_social_share');
  if (cachedSocialShare) {
    firestoreSocialShareSettings = JSON.parse(cachedSocialShare);
  }
} catch (e) {
  console.error("Failed to load cached social share settings", e);
}

try {
  const cachedDonation = localStorage.getItem('mm_donation');
  if (cachedDonation) {
    firestoreDonationSettings = JSON.parse(cachedDonation);
  }
} catch (e) {
  console.error("Failed to load cached donation settings", e);
}

try {
  const cachedBhajanDocs = localStorage.getItem('mm_bhajan_documents');
  if (cachedBhajanDocs) {
    firestoreBhajanDocuments = JSON.parse(cachedBhajanDocs);
  }
} catch (e) {
  console.error("Failed to load cached bhajan documents", e);
}

try {
  const cachedDarshan = localStorage.getItem('mm_dailyDarshan');
  if (cachedDarshan) {
    firestoreDailyDarshan = JSON.parse(cachedDarshan);
  }
} catch (e) {
  console.error("Failed to load cached dailyDarshan", e);
}

try {
  const cachedGallery = localStorage.getItem('mm_gallery');
  if (cachedGallery) {
    firestoreGallery = JSON.parse(cachedGallery);
  }
} catch (e) {
  console.error("Failed to load cached gallery", e);
}

try {
  const cachedTempleGallery = localStorage.getItem('mm_temple_gallery');
  if (cachedTempleGallery) {
    firestoreTempleGallery = JSON.parse(cachedTempleGallery);
  }
} catch (e) {
  console.error("Failed to load cached temple_gallery", e);
}

try {
  const cachedVideos = localStorage.getItem('mm_videos');
  if (cachedVideos) {
    firestoreVideos = JSON.parse(cachedVideos);
  }
} catch (e) {
  console.error("Failed to load cached videos", e);
}

try {
  const cachedEvents = localStorage.getItem('mm_events');
  if (cachedEvents) {
    firestoreEvents = JSON.parse(cachedEvents);
  }
} catch (e) {
  console.error("Failed to load cached events", e);
}

try {
  const cachedCommittee = localStorage.getItem('mm_committee');
  if (cachedCommittee) {
    firestoreCommittee = JSON.parse(cachedCommittee);
  }
} catch (e) {
  console.error("Failed to load cached committee", e);
}

try {
  const cachedBanners = localStorage.getItem('mm_festival_banners');
  if (cachedBanners) {
    firestoreFestivalBanners = JSON.parse(cachedBanners);
  }
} catch (e) {
  console.error("Failed to load cached festival banners", e);
}

// Subscribe to firestore 'dailyDarshan'
onSnapshot(doc(firestoreDb, 'dailyDarshan', 'today'), (docSnap) => {
  if (docSnap.exists()) {
    firestoreDailyDarshan = {
      id: docSnap.id,
      ...docSnap.data()
    } as DailyDarshan;
    localStorage.setItem('mm_dailyDarshan', JSON.stringify(firestoreDailyDarshan));
  } else {
    firestoreDailyDarshan = null;
    localStorage.removeItem('mm_dailyDarshan');
  }
  notifyDBChange();
}, (error) => {
  console.error("Firestore dailyDarshan subscription error:", error);
});

// Subscribe to firestore 'gallery'
onSnapshot(collection(firestoreDb, 'gallery'), (snapshot) => {
  const items: GalleryItem[] = [];
  snapshot.forEach((docSnap) => {
    items.push({
      id: docSnap.id,
      ...docSnap.data()
    } as GalleryItem);
  });
  firestoreGallery = items;
  localStorage.setItem('mm_gallery', JSON.stringify(items));
  notifyDBChange();
}, (error) => {
  console.error("Firestore gallery subscription error:", error);
});

// Subscribe to firestore 'videos'
onSnapshot(collection(firestoreDb, 'videos'), (snapshot) => {
  const items: VideoDarshan[] = [];
  snapshot.forEach((docSnap) => {
    items.push({
      id: docSnap.id,
      ...docSnap.data()
    } as VideoDarshan);
  });
  firestoreVideos = items;
  localStorage.setItem('mm_videos', JSON.stringify(items));
  notifyDBChange();
}, (error) => {
  console.error("Firestore videos subscription error:", error);
});

// Subscribe to firestore 'events'
onSnapshot(collection(firestoreDb, 'events'), (snapshot) => {
  const items: TempleEvent[] = [];
  snapshot.forEach((docSnap) => {
    items.push({
      id: docSnap.id,
      ...docSnap.data()
    } as TempleEvent);
  });
  firestoreEvents = items;
  localStorage.setItem('mm_events', JSON.stringify(items));
  notifyDBChange();
}, (error) => {
  console.error("Firestore events subscription error:", error);
});

// Subscribe to firestore 'committee'
onSnapshot(collection(firestoreDb, 'committee'), (snapshot) => {
  const items: CommitteeMember[] = [];
  snapshot.forEach((docSnap) => {
    items.push({
      id: docSnap.id,
      ...docSnap.data()
    } as CommitteeMember);
  });
  firestoreCommittee = items;
  localStorage.setItem('mm_committee', JSON.stringify(items));
  notifyDBChange();
}, (error) => {
  console.error("Firestore committee subscription error:", error);
});

// Subscribe to firestore 'festival_banners'
onSnapshot(collection(firestoreDb, 'festival_banners'), (snapshot) => {
  const items: FestivalBanner[] = [];
  snapshot.forEach((docSnap) => {
    items.push({
      id: docSnap.id,
      ...docSnap.data()
    } as FestivalBanner);
  });
  if (items.length === 0) {
    // Seed Firestore with default banners if empty
    firestoreFestivalBanners = DEFAULT_FESTIVAL_BANNERS;
    localStorage.setItem('mm_festival_banners', JSON.stringify(DEFAULT_FESTIVAL_BANNERS));
    notifyDBChange();

    DEFAULT_FESTIVAL_BANNERS.forEach(async (b) => {
      try {
        await setDoc(doc(firestoreDb, 'festival_banners', b.id), {
          title: b.title,
          description: b.description || "",
          imageUrl: b.imageUrl,
          startDate: b.startDate,
          endDate: b.endDate,
          isEnabled: b.isEnabled,
          uploadedAt: b.uploadedAt,
          time: b.time || "",
          location: b.location || "",
          specialNote: b.specialNote || ""
        });
      } catch (err) {
        console.error("Failed to seed festival banner to Firestore:", err);
      }
    });
  } else {
    firestoreFestivalBanners = items;
    localStorage.setItem('mm_festival_banners', JSON.stringify(items));
    notifyDBChange();
  }
}, (error) => {
  console.error("Firestore festival_banners subscription error:", error);
});

// Subscribe to firestore 'temple_gallery'
onSnapshot(collection(firestoreDb, 'temple_gallery'), (snapshot) => {
  const items: TempleGalleryItem[] = [];
  snapshot.forEach((docSnap) => {
    items.push({
      id: docSnap.id,
      ...docSnap.data()
    } as TempleGalleryItem);
  });
  if (items.length === 0) {
    firestoreTempleGallery = DEFAULT_TEMPLE_GALLERY;
    localStorage.setItem('mm_temple_gallery', JSON.stringify(DEFAULT_TEMPLE_GALLERY));
    notifyDBChange();

    DEFAULT_TEMPLE_GALLERY.forEach(async (b) => {
      try {
        await setDoc(doc(firestoreDb, 'temple_gallery', b.id), {
          imageUrl: b.imageUrl,
          caption: b.caption,
          category: b.category,
          uploadDate: b.uploadDate,
          isActive: b.isActive,
          uploadedAt: b.uploadedAt
        });
      } catch (err) {
        console.error("Failed to seed temple gallery to Firestore:", err);
      }
    });
  } else {
    firestoreTempleGallery = items;
    localStorage.setItem('mm_temple_gallery', JSON.stringify(items));
    notifyDBChange();
  }
}, (error) => {
  console.error("Firestore temple_gallery subscription error:", error);
});

// Subscribe to firestore 'settings/social_share' document
onSnapshot(doc(firestoreDb, 'settings', 'social_share'), (docSnap) => {
  if (docSnap.exists()) {
    firestoreSocialShareSettings = docSnap.data() as SocialShareSettings;
    localStorage.setItem('mm_social_share', JSON.stringify(firestoreSocialShareSettings));
  } else {
    firestoreSocialShareSettings = DEFAULT_SOCIAL_SHARE_SETTINGS;
    localStorage.setItem('mm_social_share', JSON.stringify(DEFAULT_SOCIAL_SHARE_SETTINGS));
    setDoc(doc(firestoreDb, 'settings', 'social_share'), DEFAULT_SOCIAL_SHARE_SETTINGS).catch(err => {
      console.error("Failed to seed social share settings to Firestore:", err);
    });
  }
  notifyDBChange();
}, (error) => {
  console.error("Firestore social_share subscription error:", error);
});

// Subscribe to firestore 'settings/donation' document
onSnapshot(doc(firestoreDb, 'settings', 'donation'), (docSnap) => {
  if (docSnap.exists()) {
    firestoreDonationSettings = docSnap.data() as DonationSettings;
    localStorage.setItem('mm_donation', JSON.stringify(firestoreDonationSettings));
  } else {
    firestoreDonationSettings = DEFAULT_DONATION_SETTINGS;
    localStorage.setItem('mm_donation', JSON.stringify(DEFAULT_DONATION_SETTINGS));
    setDoc(doc(firestoreDb, 'settings', 'donation'), DEFAULT_DONATION_SETTINGS).catch(err => {
      console.error("Failed to seed donation settings to Firestore:", err);
    });
  }
  notifyDBChange();
}, (error) => {
  console.error("Firestore donation subscription error:", error);
});

// Subscribe to firestore 'bhajan_documents' collection
onSnapshot(collection(firestoreDb, 'bhajan_documents'), (snapshot) => {
  const items: BhajanDocument[] = [];
  snapshot.forEach((docSnap) => {
    items.push({
      id: docSnap.id,
      ...docSnap.data()
    } as BhajanDocument);
  });
  firestoreBhajanDocuments = items;
  localStorage.setItem('mm_bhajan_documents', JSON.stringify(items));
  notifyDBChange();
}, (error) => {
  console.error("Firestore bhajan_documents subscription error:", error);
});

export let firestorePushSubscriptions: PushNotificationSubscription[] = [];
export let firestorePushNotifications: PushNotificationPayload[] = [];

// Subscribe to firestore 'notification_subscriptions' collection
onSnapshot(collection(firestoreDb, 'notification_subscriptions'), (snapshot) => {
  const items: PushNotificationSubscription[] = [];
  snapshot.forEach((docSnap) => {
    items.push({
      id: docSnap.id,
      ...docSnap.data()
    } as PushNotificationSubscription);
  });
  firestorePushSubscriptions = items;
  localStorage.setItem('mm_push_subscriptions', JSON.stringify(items));
  notifyDBChange();
}, (error) => {
  console.error("Firestore notification_subscriptions subscription error:", error);
});

// Subscribe to firestore 'push_notifications' collection
onSnapshot(collection(firestoreDb, 'push_notifications'), (snapshot) => {
  const items: PushNotificationPayload[] = [];
  snapshot.forEach((docSnap) => {
    items.push({
      id: docSnap.id,
      ...docSnap.data()
    } as PushNotificationPayload);
  });
  firestorePushNotifications = items;
  localStorage.setItem('mm_push_notifications', JSON.stringify(items));
  notifyDBChange();
}, (error) => {
  console.error("Firestore push_notifications subscription error:", error);
});



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
  getDailyDarshan(): DailyDarshan | null {
    return firestoreDailyDarshan;
  },

  getLatestShringar(): GalleryItem | null {
    const galleryItems = this.getGallery();
    const todayItem = this.getDailyDarshan();
    const combined: GalleryItem[] = [];

    if (todayItem && todayItem.imageUrl) {
      combined.push({
        id: todayItem.id || "today",
        imageUrl: todayItem.imageUrl,
        date: todayItem.date,
        festivalName: todayItem.festivalName || "दैनिक श्रृंगार दर्शन",
        description: todayItem.description || "मंसा महादेव का आज का अलौकिक श्रृंगार दर्शन।",
        uploadedAt: todayItem.uploadedAt
      });
    }

    galleryItems.forEach(item => {
      if (item.imageUrl) {
        combined.push(item);
      }
    });

    if (combined.length === 0) {
      return null;
    }

    // Sort by uploadedAt descending first. If uploadedAt is same or missing, sort by date descending.
    combined.sort((a, b) => {
      const timeA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
      const timeB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      const dateA = a.date || '';
      const dateB = b.date || '';
      return dateB.localeCompare(dateA);
    });

    return combined[0];
  },

  async updateDailyDarshan(darshan: Omit<DailyDarshan, 'id' | 'uploadedAt'>) {
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
      await this.addGalleryItem(galleryItem);
    }

    const updated: DailyDarshan = {
      id: "today",
      ...darshan,
      uploadedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(firestoreDb, 'dailyDarshan', 'today'), updated);
    } catch (e) {
      console.error("Failed to update dailyDarshan in Firestore:", e);
    }
  },

  // Gallery
  getGallery(): GalleryItem[] {
    // Return sorted by order if available, else date descending
    return [...firestoreGallery].sort((a, b) => {
      const orderA = (a as any).order !== undefined ? (a as any).order : 999999;
      const orderB = (b as any).order !== undefined ? (b as any).order : 999999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });
  },

  async addGalleryItem(item: Omit<GalleryItem, 'id' | 'uploadedAt'> & { id?: string }) {
    const id = item.id || "gal_" + Date.now();
    const newItem: GalleryItem = {
      id,
      imageUrl: item.imageUrl,
      date: item.date,
      festivalName: item.festivalName,
      description: item.description,
      uploadedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(firestoreDb, 'gallery', id), newItem);
    } catch (e) {
      console.error("Failed to add gallery item to Firestore:", e);
    }
  },

  async updateGalleryItem(id: string, updatedFields: Partial<GalleryItem>) {
    try {
      await setDoc(doc(firestoreDb, 'gallery', id), updatedFields, { merge: true });
    } catch (e) {
      console.error("Failed to update gallery item in Firestore:", e);
    }
  },

  async deleteGalleryItem(id: string) {
    try {
      await deleteDoc(doc(firestoreDb, 'gallery', id));
    } catch (e) {
      console.error("Failed to delete gallery item from Firestore:", e);
    }
  },

  // Temple Gallery
  getTempleGallery(): TempleGalleryItem[] {
    return [...firestoreTempleGallery].sort((a, b) => {
      const dateA = a.uploadDate ? new Date(a.uploadDate).getTime() : 0;
      const dateB = b.uploadDate ? new Date(b.uploadDate).getTime() : 0;
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });
  },

  async addTempleGalleryItem(item: Omit<TempleGalleryItem, 'id' | 'uploadedAt'> & { id?: string }) {
    const id = item.id || "temple_gal_" + Date.now();
    const newItem: TempleGalleryItem = {
      id,
      imageUrl: item.imageUrl,
      caption: item.caption,
      category: item.category,
      uploadDate: item.uploadDate,
      isActive: item.isActive,
      uploadedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(firestoreDb, 'temple_gallery', id), newItem);
    } catch (e) {
      console.error("Failed to add temple gallery item to Firestore:", e);
    }
  },

  async updateTempleGalleryItem(id: string, updatedFields: Partial<TempleGalleryItem>) {
    try {
      await setDoc(doc(firestoreDb, 'temple_gallery', id), updatedFields, { merge: true });
    } catch (e) {
      console.error("Failed to update temple gallery item in Firestore:", e);
    }
  },

  async deleteTempleGalleryItem(id: string) {
    try {
      await deleteDoc(doc(firestoreDb, 'temple_gallery', id));
    } catch (e) {
      console.error("Failed to delete temple gallery item from Firestore:", e);
    }
  },

  // Video Darshan (YouTube)
  getVideos(): VideoDarshan[] {
    return [...firestoreVideos].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });
  },

  getTodayVideo(): VideoDarshan | null {
    const list = this.getVideos();
    const today = list.find(v => v.isToday);
    return today || (list.length > 0 ? list[0] : null);
  },

  async addVideo(video: { title: string; youtubeUrl: string; date: string; isToday: boolean }) {
    const id = "vid_" + Date.now();
    const newVideo: VideoDarshan = {
      id,
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      date: video.date,
      isToday: video.isToday,
      uploadedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(firestoreDb, 'videos', id), newVideo);
      if (video.isToday) {
        // Find other videos that are isToday and update them to false
        for (const v of firestoreVideos) {
          if (v.id !== id && v.isToday) {
            await setDoc(doc(firestoreDb, 'videos', v.id), { isToday: false }, { merge: true });
          }
        }
      }
    } catch (e) {
      console.error("Failed to add video to Firestore:", e);
    }
  },

  async deleteVideo(id: string) {
    try {
      await deleteDoc(doc(firestoreDb, 'videos', id));
    } catch (e) {
      console.error("Failed to delete video from Firestore:", e);
    }
  },

  async updateVideo(id: string, updatedFields: Partial<VideoDarshan>) {
    try {
      await setDoc(doc(firestoreDb, 'videos', id), updatedFields, { merge: true });
      if (updatedFields.isToday) {
        for (const v of firestoreVideos) {
          if (v.id !== id && v.isToday) {
            await setDoc(doc(firestoreDb, 'videos', v.id), { isToday: false }, { merge: true });
          }
        }
      }
    } catch (e) {
      console.error("Failed to update video in Firestore:", e);
    }
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

      // Ensure 'path_rudrashtakam' exists in local storage
      const hasRudrashtakam = aartis.some(a => a.id === 'path_rudrashtakam');
      if (!hasRudrashtakam) {
        const rudrashtakamItem = DEFAULT_AARTIS.find(a => a.id === 'path_rudrashtakam');
        if (rudrashtakamItem) {
          const skIdx = aartis.findIndex(a => a.id === 'path_sundarkand');
          if (skIdx !== -1) {
            aartis.splice(skIdx + 1, 0, rudrashtakamItem);
          } else {
            aartis.push(rudrashtakamItem);
          }
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
        let text = a.text;
        if (a.id === 'aarti_shiv' && a.hindiTitle !== 'भोलेनाथ की आरती') {
          hindiTitle = 'भोलेनाथ की आरती';
          changed = true;
        } else if (a.id === 'aarti_hanuman' && a.hindiTitle !== 'हनुमान जी की आरती') {
          hindiTitle = 'हनुमान जी की आरती';
          changed = true;
        } else if (a.id === 'stuti_ram') {
          if (a.hindiTitle !== 'श्रीराम स्तुति') {
            hindiTitle = 'श्रीराम स्तुति';
            changed = true;
          }
          if (a.text.includes('जानकीनाथ')) {
            const ramItem = DEFAULT_AARTIS.find(item => item.id === 'stuti_ram');
            if (ramItem) {
              text = ramItem.text;
              changed = true;
            }
          }
        } else if (a.id === 'path_sundarkand') {
          if (a.hindiTitle !== 'शिव स्तुति') {
            hindiTitle = 'शिव स्तुति';
            changed = true;
          }
          if (!a.text.includes('आशुतोष शशांक शेखर')) {
            const skItem = DEFAULT_AARTIS.find(item => item.id === 'path_sundarkand');
            if (skItem) {
              text = skItem.text;
              changed = true;
            }
          }
        } else if (a.id === 'path_rudrashtakam') {
          if (a.hindiTitle !== 'शिव रुद्राष्टकम') {
            hindiTitle = 'शिव रुद्राष्टकम';
            changed = true;
          }
          if (!a.text.includes('नमामीशमीशान निर्वाणरूपं')) {
            const rudraItem = DEFAULT_AARTIS.find(item => item.id === 'path_rudrashtakam');
            if (rudraItem) {
              text = rudraItem.text;
              changed = true;
            }
          }
        } else if (a.id === 'chalisa_hanuman' && a.hindiTitle !== 'हनुमान चालीसा') {
          hindiTitle = 'हनुमान चालीसा';
          changed = true;
        }
        if (changed) {
          modified = true;
          return { ...a, hindiTitle, text };
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
    const list = data ? JSON.parse(data) : (firestoreBhajans.length > 0 ? firestoreBhajans : DEFAULT_BHAJANS);
    return sanitizeBhajans(list);
  },

  async addBhajan(bhajan: Omit<BhajanItem, 'id'>) {
    try {
      await addDoc(collection(firestoreDb, 'bhajans'), bhajan);
    } catch (error) {
      console.error("Failed to add bhajan to Firestore:", error);
    }
  },

  async deleteBhajan(id: string) {
    try {
      await deleteDoc(doc(firestoreDb, 'bhajans', id));
    } catch (error) {
      console.error("Failed to delete bhajan from Firestore:", error);
    }
  },

  async updateBhajan(id: string, updatedFields: Partial<BhajanItem>) {
    try {
      await setDoc(doc(firestoreDb, 'bhajans', id), updatedFields, { merge: true });
    } catch (error) {
      console.error("Failed to update bhajan in Firestore:", error);
    }
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
  },

  // Events
  getEvents(): TempleEvent[] {
    return [...firestoreEvents].sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  async addEvent(event: Omit<TempleEvent, 'id' | 'uploadedAt'>) {
    const id = "evt_" + Date.now();
    const newEvent: TempleEvent = {
      id,
      ...event,
      uploadedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(firestoreDb, 'events', id), newEvent);
    } catch (e) {
      console.error("Failed to add event to Firestore:", e);
    }
  },

  async updateEvent(id: string, updatedFields: Partial<TempleEvent>) {
    try {
      await setDoc(doc(firestoreDb, 'events', id), updatedFields, { merge: true });
    } catch (e) {
      console.error("Failed to update event in Firestore:", e);
    }
  },

  async deleteEvent(id: string) {
    try {
      await deleteDoc(doc(firestoreDb, 'events', id));
    } catch (e) {
      console.error("Failed to delete event from Firestore:", e);
    }
  },

  // Committee Members
  getCommittee(): CommitteeMember[] {
    return [...firestoreCommittee].sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  async addCommitteeMember(member: Omit<CommitteeMember, 'id' | 'uploadedAt'>) {
    const id = "cmm_" + Date.now();
    const newMember: CommitteeMember = {
      id,
      ...member,
      uploadedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(firestoreDb, 'committee', id), newMember);
    } catch (e) {
      console.error("Failed to add committee member to Firestore:", e);
    }
  },

  async updateCommitteeMember(id: string, updatedFields: Partial<CommitteeMember>) {
    try {
      await setDoc(doc(firestoreDb, 'committee', id), updatedFields, { merge: true });
    } catch (e) {
      console.error("Failed to update committee member in Firestore:", e);
    }
  },

  async deleteCommitteeMember(id: string) {
    try {
      await deleteDoc(doc(firestoreDb, 'committee', id));
    } catch (e) {
      console.error("Failed to delete committee member from Firestore:", e);
    }
  },

  // Festival Banners
  getFestivalBanners(): FestivalBanner[] {
    return [...firestoreFestivalBanners].sort((a, b) => {
      const timeA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
      const timeB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
      return timeB - timeA;
    });
  },

  async addFestivalBanner(banner: Omit<FestivalBanner, 'id' | 'uploadedAt'>) {
    const id = "fbn_" + Date.now();
    const newBanner: FestivalBanner = {
      id,
      ...banner,
      uploadedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(firestoreDb, 'festival_banners', id), newBanner);
    } catch (e) {
      console.error("Failed to add festival banner to Firestore:", e);
    }
  },

  async updateFestivalBanner(id: string, updatedFields: Partial<FestivalBanner>) {
    try {
      await setDoc(doc(firestoreDb, 'festival_banners', id), updatedFields, { merge: true });
    } catch (e) {
      console.error("Failed to update festival banner in Firestore:", e);
    }
  },

  async deleteFestivalBanner(id: string) {
    try {
      await deleteDoc(doc(firestoreDb, 'festival_banners', id));
    } catch (e) {
      console.error("Failed to delete festival banner from Firestore:", e);
    }
  },

  // Social Share Settings
  getSocialShareSettings(): SocialShareSettings {
    const data = localStorage.getItem('mm_social_share');
    if (!data) return firestoreSocialShareSettings || DEFAULT_SOCIAL_SHARE_SETTINGS;
    try {
      return JSON.parse(data) as SocialShareSettings;
    } catch (e) {
      return firestoreSocialShareSettings || DEFAULT_SOCIAL_SHARE_SETTINGS;
    }
  },

  async updateSocialShareSettings(settings: SocialShareSettings) {
    try {
      await setDoc(doc(firestoreDb, 'settings', 'social_share'), settings);
    } catch (e) {
      console.error("Failed to update social share settings in Firestore:", e);
    }
  },

  // Donation Settings
  getDonationSettings(): DonationSettings {
    const data = localStorage.getItem('mm_donation');
    if (!data) return firestoreDonationSettings || DEFAULT_DONATION_SETTINGS;
    try {
      return JSON.parse(data) as DonationSettings;
    } catch (e) {
      return firestoreDonationSettings || DEFAULT_DONATION_SETTINGS;
    }
  },

  async updateDonationSettings(settings: DonationSettings) {
    try {
      await setDoc(doc(firestoreDb, 'settings', 'donation'), settings);
    } catch (e) {
      console.error("Failed to update donation settings in Firestore:", e);
    }
  },

  // Bhajan Documents
  getBhajanDocuments(): BhajanDocument[] {
    const cached = localStorage.getItem('mm_bhajan_documents');
    return cached ? JSON.parse(cached) : firestoreBhajanDocuments;
  },

  async addBhajanDocument(docItem: Omit<BhajanDocument, 'id' | 'uploadedAt'>) {
    const id = "bdoc_" + Date.now();
    const newDoc: BhajanDocument = {
      id,
      ...docItem,
      uploadedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(firestoreDb, 'bhajan_documents', id), newDoc);
    } catch (e) {
      console.error("Failed to add bhajan document to Firestore:", e);
    }
  },

  async deleteBhajanDocument(id: string) {
    try {
      await deleteDoc(doc(firestoreDb, 'bhajan_documents', id));
    } catch (e) {
      console.error("Failed to delete bhajan document from Firestore:", e);
    }
  },

  async updateBhajanDocument(id: string, updatedFields: Partial<BhajanDocument>) {
    try {
      await setDoc(doc(firestoreDb, 'bhajan_documents', id), updatedFields, { merge: true });
    } catch (e) {
      console.error("Failed to update bhajan document in Firestore:", e);
    }
  },

  // Push Notifications API
  getPushSubscriptions(): PushNotificationSubscription[] {
    const cached = localStorage.getItem('mm_push_subscriptions');
    return cached ? JSON.parse(cached) : firestorePushSubscriptions;
  },

  async addPushSubscription(subscriptionId: string) {
    const subscription: PushNotificationSubscription = {
      id: subscriptionId,
      subscribedAt: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    try {
      await setDoc(doc(firestoreDb, 'notification_subscriptions', subscriptionId), subscription);
    } catch (e) {
      console.error("Failed to add push subscription to Firestore:", e);
    }
  },

  getPushNotifications(): PushNotificationPayload[] {
    const cached = localStorage.getItem('mm_push_notifications');
    const items: PushNotificationPayload[] = cached ? JSON.parse(cached) : firestorePushNotifications;
    return items.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  },

  async sendPushNotification(notification: Omit<PushNotificationPayload, 'id' | 'sentAt'>) {
    const id = "pnotif_" + Date.now();
    const newNotification: PushNotificationPayload = {
      id,
      title: notification.title,
      message: notification.message,
      imageUrl: notification.imageUrl || '',
      targetUrl: notification.targetUrl || '',
      sentAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(firestoreDb, 'push_notifications', id), newNotification);
    } catch (e) {
      console.error("Failed to send push notification to Firestore:", e);
    }
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

