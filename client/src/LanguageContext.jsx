import React, { createContext, useState, useContext } from 'react';

// Translation data
const translations = {
  english: {
    // Navbar
    periodCare: "Period Care",
    periodTracker: "Period Tracker",
    padLocator: "Pad Locator",
    aiHealth: "Mental Health",
    aiChatbot: "Sakhi AI",
    healthAdvice: "Health Advice",
    governmentSchemes: "Government Schemes",
    community: "Community",
    logout: "Logout",
    signUp: "Sign Up",
    login: "Login",
    
    // Home page
    heroTitle: "Your Complete Women's Health Companion",
    heroDescription: "AI-powered health tracking, secure blockchain records, and personalized care for menstrual health, pregnancy, and mental wellness.",
    getStarted: "Get Started",
    chatWithAI: "Chat with AI Assistant",
    
    // Features section
    keyFeatures: "Key Features",
    comprehensiveSolutions: "Comprehensive Women's Health Solutions",
    solutionsDescription: "SheWell provides a complete suite of tools and resources to support women's health needs",
    learnMore: "Learn more",
    
    // Feature cards
    menstrualHealth: "Menstrual & Reproductive Health",
    menstrualDescription: "AI-powered period tracking and reproductive health support",
    pregnancyCare: "Pregnancy & Maternal Care",
    pregnancyDescription: "Comprehensive support throughout pregnancy and beyond",
    mentalHealth: "Mental Health & Wellness",
    mentalDescription: "Tools and resources for emotional wellbeing",
    safetyAssistance: "Safety & Emergency Assistance",
    safetyDescription: "Quick access to help when you need it most",
    aiBlockchain: "AI & Blockchain Integration",
    aiBlockchainDescription: "Advanced technology for personalized care and security",
    educationCommunity: "Education & Community",
    educationDescription: "Learn and connect with others on your health journey",
    
    // ...existing translations...
    // Feature cards list items
    aiPeriodTracker: "AI-powered period & ovulation tracker",
    pcosSupport: "PCOS/endometriosis support",
    padLocator: "Sanitary pad locator",
    birthControl: "Birth control guidance",
    aiPregnancyRisk: "AI-driven pregnancy risk assessment",
    fetalMonitoring: "Fetal health monitoring",
    postpartumWellness: "Postpartum wellness",
    breastfeedingSupport: "Breastfeeding support",
    aiChatbot: "Sakhi AI",
    guidedMeditation: "Guided meditation",
    sleepTracking: "Sleep tracking",
    anonymousForums: "Anonymous forums",
    sosAlerts: "One-tap SOS alerts",
    freeSanitaryProducts: "Real-time access to free sanitary products",
    secureConsultations: "Secure doctor consultations",
    emergencyLocator: "Emergency resource locator",
    multilingualAI: "Multilingual AI assistant",
    blockchainStorage: "Blockchain-powered secure health record storage",
    realTimeMonitoring: "Real-time menstrual health monitoring",
    personalizedInsights: "Personalized health insights",
    expertWebinars: "Expert webinars",
    healthBlogs: "Women's health blogs",
    periodEducation: "Period hygiene education",
    peerSupport: "Interactive peer support forums",

    // Sanitary pad section
    freeResources: "Free Resources",
    sanitaryPadLocator: "Sanitary Pad Locator",
    sanitaryPadDescription: "Quickly locate free sanitary products near you. SheWell partners with government initiatives and NGOs to ensure access to menstrual hygiene products for all women.",
    realTimeMapping: "Real-time mapping",
    emergencyDelivery: "Emergency delivery",
    communityUpdates: "Community updates",
    healthcareIntegration: "Healthcare integration",
    findResources: "Find Nearby Resources",
    
    // Crisis section
    crisisTitle: "Menstrual Health and Hygiene Crisis",
    crisisDescription: "The issue of menstrual hygiene management (MHM) and practices among adolescent females is a pressing matter. Research indicates that over 50% of the girls employ inadequate MHM, and rural regions exhibit a higher prevalence compared to urban areas.",
    millionWomen: "Over 355 Million",
    womenIndia: "Women & girls in India experience menstruation, but millions still face barriers to proper menstrual hygiene management.",
    percentGirls: "Over 23%",
    girlsSchool: "Young adolescent girls in India are forced out of school permanently as soon as they start menstruating.",
    
    // Testimonials section
    testimonials: "Testimonials",
    hearUsers: "Hear from Our Users",
    testimonialDescription: "Women around the world are experiencing the benefits of SheWell",
    sarahTestimonial: "The period tracker has been incredibly accurate, and I love how the app notifies me about potential symptoms based on my cycle. The blockchain security gives me peace of mind about my data.",
    priyaTestimonial: "The sanitary pad locator feature helped me find free products when I was in an emergency situation. This app is truly making a difference in women's lives.",
    elenaTestimonial: "The mental health resources and community forums have been a lifeline during my postpartum journey. I feel supported and understood thanks to SheWell.",
    
    // CTA section
    joinToday: "Join SheWell Today",
    takeControl: "Take control of your health with secure, AI-powered tools designed specifically for women",
    signUpNow: "Sign Up Now",
    learnMore: "Learn More",
    
    // Footer
    securePrivate: "Secure, private, and comprehensive healthcare for every woman.",
    features: "Features",
    resources: "Resources",
    legal: "Legal",
    privacyPolicy: "Privacy Policy",
    termsService: "Terms of Service",
    contact: "Contact",
    periodTracker: "Period Tracker",
    padLocator: "Pad Locator",
    healthAdvice: "Health Advice",
    aiAssistant: "AI Assistant",
    education: "Education",
    blog: "Blog",

    // Impact section
    ourImpact: "Our Impact",
    impactDescription: "Discover the lasting change your support brings to SheWell, advancing menstrual health one period at a time.",
    viewAll: "View All",
    sanitaryPadsDistributed: "Sanitary Pads distributed",
    menstruatorsSupported: "Menstruators supported",
    periodCyclesSupported: "Period Cycles supported",
    periodWorkshopsConducted: "Period Workshops conducted",
  },
  hindi: {
    // Navbar
    periodCare: "मासिक धर्म देखभाल",
    periodTracker: "मासिक धर्म ट्रैकर",
    padLocator: "पैड लोकेटर",
    aiHealth: "एआई और स्वास्थ्य",
    aiChatbot: "एआई चैटबॉट",
    healthAdvice: "स्वास्थ्य सलाह",
    governmentSchemes: "सरकारी योजनाएं",
    community: "समुदाय",
    logout: "लॉगआउट",
    signUp: "साइन अप करें",
    login: "लॉग इन करें",
    
    // Home page
    heroTitle: "आपका संपूर्ण महिला स्वास्थ्य साथी",
    heroDescription: "एआई-संचालित स्वास्थ्य ट्रैकिंग, सुरक्षित ब्लॉकचेन रिकॉर्ड, और मासिक धर्म स्वास्थ्य, गर्भावस्था और मानसिक स्वास्थ्य के लिए व्यक्तिगत देखभाल।",
    getStarted: "शुरू करें",
    chatWithAI: "एआई असिस्टेंट से चैट करें",
    
    // Features section
    keyFeatures: "मुख्य विशेषताएं",
    comprehensiveSolutions: "व्यापक महिला स्वास्थ्य समाधान",
    solutionsDescription: "शीवेल महिलाओं की स्वास्थ्य जरूरतों का समर्थन करने के लिए उपकरण और संसाधनों का एक पूरा सेट प्रदान करता है",
    learnMore: "और जानें",
    
    // Feature cards
    menstrualHealth: "मासिक धर्म और प्रजनन स्वास्थ्य",
    menstrualDescription: "एआई-संचालित मासिक धर्म ट्रैकिंग और प्रजनन स्वास्थ्य समर्थन",
    pregnancyCare: "गर्भावस्था और मातृ देखभाल",
    pregnancyDescription: "गर्भावस्था और उसके बाद के दौरान व्यापक समर्थन",
    mentalHealth: "मानसिक स्वास्थ्य और कल्याण",
    mentalDescription: "भावनात्मक कल्याण के लिए उपकरण और संसाधन",
    safetyAssistance: "सुरक्षा और आपातकालीन सहायता",
    safetyDescription: "जब आपको सबसे ज्यादा जरूरत हो तब मदद तक त्वरित पहुंच",
    aiBlockchain: "एआई और ब्लॉकचेन एकीकरण",
    aiBlockchainDescription: "व्यक्तिगत देखभाल और सुरक्षा के लिए उन्नत प्रौद्योगिकी",
    educationCommunity: "शिक्षा और समुदाय",
    educationDescription: "अपनी स्वास्थ्य यात्रा पर दूसरों से सीखें और जुड़ें",
    
    // ...existing translations...
    // Feature cards list items
    aiPeriodTracker: "एआई-संचालित मासिक धर्म और ओव्यूलेशन ट्रैकर",
    pcosSupport: "पीसीओएस/एंडोमेट्रियोसिस समर्थन",
    padLocator: "सैनिटरी पैड लोकेटर",
    birthControl: "जन्म नियंत्रण मार्गदर्शन",
    aiPregnancyRisk: "एआई-संचालित गर्भावस्था जोखिम मूल्यांकन",
    fetalMonitoring: "भ्रूण स्वास्थ्य निगरानी",
    postpartumWellness: "प्रसवोत्तर कल्याण",
    breastfeedingSupport: "स्तनपान समर्थन",
    aiChatbot: "भावनात्मक समर्थन के लिए एआई-संचालित चैटबॉट",
    guidedMeditation: "निर्देशित ध्यान",
    sleepTracking: "नींद ट्रैकिंग",
    anonymousForums: "गुमनाम मंच",
    sosAlerts: "वन-टैप एसओएस अलर्ट",
    freeSanitaryProducts: "मुफ्त सैनिटरी उत्पादों तक वास्तविक समय की पहुंच",
    secureConsultations: "सुरक्षित डॉक्टर परामर्श",
    emergencyLocator: "आपातकालीन संसाधन लोकेटर",
    multilingualAI: "बहुभाषी एआई सहायक",
    blockchainStorage: "ब्लॉकचेन-संचालित सुरक्षित स्वास्थ्य रिकॉर्ड भंडारण",
    realTimeMonitoring: "वास्तविक समय मासिक धर्म स्वास्थ्य निगरानी",
    personalizedInsights: "व्यक्तिगत स्वास्थ्य अंतर्दृष्टि",
    expertWebinars: "विशेषज्ञ वेबिनार",
    healthBlogs: "महिलाओं के स्वास्थ्य ब्लॉग",
    periodEducation: "मासिक धर्म स्वच्छता शिक्षा",
    peerSupport: "इंटरएक्टिव पीयर समर्थन मंच",

    // Sanitary pad section
    freeResources: "मुफ्त संसाधन",
    sanitaryPadLocator: "सैनिटरी पैड लोकेटर",
    sanitaryPadDescription: "अपने पास मुफ्त सैनिटरी उत्पाद जल्दी से ढूंढें। शीवेल सरकारी पहल और गैर-सरकारी संगठनों के साथ भागीदारी करता है ताकि सभी महिलाओं के लिए मासिक धर्म स्वच्छता उत्पादों तक पहुंच सुनिश्चित हो सके।",
    realTimeMapping: "वास्तविक समय मानचित्रण",
    emergencyDelivery: "आपातकालीन वितरण",
    communityUpdates: "समुदाय अपडेट",
    healthcareIntegration: "स्वास्थ्य सेवा एकीकरण",
    findResources: "नजदीकी संसाधन ढूंढें",
    
    // Crisis section
    crisisTitle: "मासिक धर्म स्वास्थ्य और स्वच्छता संकट",
    crisisDescription: "किशोर लड़कियों के बीच मासिक धर्म स्वच्छता प्रबंधन (MHM) और प्रथाओं का मुद्दा एक गंभीर मामला है। शोध से पता चलता है कि 50% से अधिक लड़कियां अपर्याप्त MHM का उपयोग करती हैं, और ग्रामीण क्षेत्रों में शहरी क्षेत्रों की तुलना में अधिक प्रसार होता है।",
    millionWomen: "355 मिलियन से अधिक",
    womenIndia: "भारत में महिलाएं और लड़कियां मासिक धर्म का अनुभव करती हैं, लेकिन लाखों लोग अभी भी उचित मासिक धर्म स्वच्छता प्रबंधन के लिए बाधाओं का सामना करते हैं।",
    percentGirls: "23% से अधिक",
    girlsSchool: "भारत में युवा किशोरी लड़कियों को मासिक धर्म शुरू होते ही स्कूल से स्थायी रूप से बाहर कर दिया जाता है।",
    
    // Testimonials section
    testimonials: "प्रशंसापत्र",
    hearUsers: "हमारे उपयोगकर्ताओं से सुनें",
    testimonialDescription: "दुनिया भर की महिलाएं शीवेल के लाभों का अनुभव कर रही हैं",
    sarahTestimonial: "मासिक धर्म ट्रैकर अविश्वसनीय रूप से सटीक रहा है, और मुझे पसंद है कि ऐप मुझे मेरे चक्र के आधार पर संभावित लक्षणों के बारे में सूचित करता है। ब्लॉकचेन सुरक्षा मुझे मेरे डेटा के बारे में शांति देती है।",
    priyaTestimonial: "सैनिटरी पैड लोकेटर फीचर ने मुझे आपात स्थिति में मुफ्त उत्पाद खोजने में मदद की। यह ऐप वास्तव में महिलाओं के जीवन में बदलाव ला रहा है।",
    elenaTestimonial: "मानसिक स्वास्थ्य संसाधन और सामुदायिक मंच मेरे प्रसवोत्तर यात्रा के दौरान जीवन रेखा रहे हैं। मैं शीवेल के लिए समर्थित और समझी हुई महसूस करती हूं।",
   
    // CTA section
    joinToday: "आज ही शीवेल से जुड़ें",
    takeControl: "विशेष रूप से महिलाओं के लिए डिज़ाइन किए गए सुरक्षित, एआई-संचालित उपकरणों के साथ अपने स्वास्थ्य को नियंत्रित करें",
    signUpNow: "अभी साइन अप करें",
    learnMore: "और जानें",
    
    // Footer
    securePrivate: "हर महिला के लिए सुरक्षित, निजी और व्यापक स्वास्थ्य देखभाल।",
    features: "विशेषताएं",
    resources: "संसाधन",
    legal: "कानूनी",
    privacyPolicy: "गोपनीयता नीति",
    termsService: "सेवा की शर्तें",
    contact: "संपर्क करें",
    periodTracker: "मासिक धर्म ट्रैकर",
    padLocator: "पैड लोकेटर",
    healthAdvice: "स्वास्थ्य सलाह",
    aiAssistant: "एआई सहायक",
    education: "शिक्षा",
    blog: "ब्लॉग",

    // Impact section
    ourImpact: "हमारा प्रभाव",
    impactDescription: "शीवेल को आपके समर्थन से होने वाले स्थायी परिवर्तन की खोज करें, एक समय में मासिक धर्म स्वास्थ्य को आगे बढ़ाएं।",
    viewAll: "सभी देखें",
    sanitaryPadsDistributed: "वितरित सैनिटरी पैड",
    menstruatorsSupported: "समर्थित मासिक धर्म",
    periodCyclesSupported: "समर्थित मासिक धर्म चक्र",
    periodWorkshopsConducted: "आयोजित मासिक धर्म कार्यशालाएं",
  }
};

// Create context
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('english');
  
  const t = (key) => {
    return translations[language][key] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;