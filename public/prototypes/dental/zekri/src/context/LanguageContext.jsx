import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  fr: {
    nav_home: 'Accueil',
    nav_services: 'Services',
    nav_gallery: 'Galerie',
    nav_contact: 'Contact',
    nav_reserve: 'Réserver',
    nav_admin: 'Admin',
    hero_title: "L'Excellence du Sourire",
    hero_subtitle: "Notre clinique vous accueille pour des soins dentaires d'exception dans un cadre moderne.",
    cta_book: 'Prendre Rendez-vous',
    team_title: 'Notre Équipe Expert',
    area_care: 'Zone de Soin',
    loading: 'Chargement de l\'excellence...',
    contact_title: 'Envoyez-nous un Message',
    contact_name: 'Nom Complet',
    contact_email: 'Adresse Email',
    contact_subject: 'Sujet',
    contact_message: 'Votre Message',
    contact_send: 'Envoyer le Message',
    contact_placeholder_name: 'Votre nom',
    contact_placeholder_email: 'votre@email.com',
    contact_placeholder_subject: 'Comment pouvons-nous vous aider ?',
    contact_placeholder_message: 'Décrivez votre demande...',
    contact_info_title: 'Informations de la Clinique',
    contact_info_clinic: 'Clinique',
    contact_info_desc: "Notre clinique vous accueille dans un cadre confidentiel et moderne pour tous vos besoins en dentisterie d'excellence.",
    contact_label_location: 'Localisation',
    contact_address: 'Alger, Algérie',
    contact_label_phone: 'Téléphone',
    contact_label_email: 'Email',
    contact_label_hours: 'Horaires d\'Ouverture',
    contact_hours_week: 'Sam — Jeu',
    contact_hours_weekend: 'Ven',
    contact_hours_closed: 'Fermé',
    contact_socials: 'Réseaux Sociaux Officiels',
    res_title: 'Réservez Votre Expérience',
    res_subtitle: 'Planifiez votre visite dans notre clinique d\'élite. Notre équipe vous contactera pour confirmer les détails.',
    res_header: 'Consultation Privée',
    res_success_title: 'Demande de Réservation Reçue',
    res_success_desc: 'Un membre de notre équipe vous appellera sous peu.',
    res_label_name: 'Votre Nom Complet',
    res_label_phone: 'Téléphone (WhatsApp de préférence)',
    res_label_date: 'Date Souhaitée',
    res_label_time: 'Créneau Horaire',
    res_label_service: 'Type de Traitement',
    res_label_motivation: 'Pourquoi nous ?',
    res_label_zone: 'Zone Concernée / Problème',
    res_label_notes: 'Notes ou Précisions',
    res_btn_send: 'Envoyer la Demande',
    res_placeholder_name: 'Ex: Sarah Benallal',
    res_placeholder_notes: 'Décrivez brièvement vos attentes...',
    res_motivation_1: 'Qualité Supérieure',
    res_motivation_2: 'Recommandation',
    res_motivation_3: 'Résultats Galerie',
    res_motivation_4: 'Réputation',
    res_zone_1: 'Dent de sagesse',
    res_zone_2: 'Douleur / Urgence',
    res_zone_3: 'Esthétique / Taches',
    res_zone_4: 'Dent manquante'
  },
  ar: {
    nav_home: 'الرئيسية',
    nav_services: 'خدماتنا',
    nav_gallery: 'المعرض',
    nav_contact: 'اتصال',
    nav_reserve: 'حجز موعد',
    nav_admin: 'لوحة التحكم',
    hero_title: "تميز الابتسامة",
    hero_subtitle: "تستقبلكم عيادتنا الراقية للحصول على أفضل رعاية للأسنان في بيئة حديثة.",
    cta_book: 'احجز موعدك الآن',
    team_title: 'طاقمنا الطبي الخبير',
    area_care: 'منطقة العلاج',
    loading: 'جاري تحميل التميز...',
    contact_title: 'أرسل لنا رسالة',
    contact_name: 'الاسم الكامل',
    contact_email: 'البريد الإلكتروني',
    contact_subject: 'الموضوع',
    contact_message: 'رسالتك',
    contact_send: 'إرسال الرسالة',
    contact_placeholder_name: 'اسمك',
    contact_placeholder_email: 'بريدك الإلكتروني',
    contact_placeholder_subject: 'كيف يمكننا مساعدتك؟',
    contact_placeholder_message: 'صف طلبك هنا...',
    contact_info_title: 'معلومات العيادة',
    contact_info_clinic: 'العيادة',
    contact_info_desc: 'تستقبلكم عيادتنا في بيئة حديثة وسرية لجميع احتياجاتكم في طب الأسنان المتميز.',
    contact_label_location: 'الموقع',
    contact_address: 'الجزائر العاصمة، الجزائر',
    contact_label_phone: 'الهاتف',
    contact_label_email: 'البريد الإلكتروني',
    contact_label_hours: 'ساعات العمل',
    contact_hours_week: 'السبت — الخميس',
    contact_hours_weekend: 'الجمعة',
    contact_hours_closed: 'مغلق',
    contact_socials: 'وسائل التواصل الاجتماعي الرسمية',
    res_title: 'احجز تجربتك الخاصة',
    res_subtitle: 'خطط لزيارتك لعيادتنا المتميزة. سيتصل بك فريقنا لتأكيد التفاصيل.',
    res_header: 'استشارة خاصة',
    res_success_title: 'تم استلام طلب الحجز',
    res_success_desc: 'سيتصل بك أحد أفراد طاقمنا قريباً.',
    res_label_name: 'الاسم الكامل',
    res_label_phone: 'رقم الهاتف (يفضل واتساب)',
    res_label_date: 'التاريخ المطلوب',
    res_label_time: 'الوقت المفضل',
    res_label_service: 'نوع العلاج',
    res_label_motivation: 'لماذا اخترتنا؟',
    res_label_zone: 'المنطقة المعنية / المشكلة',
    res_label_notes: 'ملاحظات أو تفاصيل إضافية',
    res_btn_send: 'إرسال طلب الحجز',
    res_placeholder_name: 'مثال: سارة بن علال',
    res_placeholder_notes: 'صف بإيجاز ما تتوقعه...',
    res_motivation_1: 'جودة عالية',
    res_motivation_2: 'توصية',
    res_motivation_3: 'نتائج المعرض',
    res_motivation_4: 'السمعة الطيبة',
    res_zone_1: 'ضرس العقل',
    res_zone_2: 'ألم / طوارئ',
    res_zone_3: 'تجميل / بقع',
    res_zone_4: 'سن مفقود'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('preferredLang') || 'fr');

  useEffect(() => {
    localStorage.setItem('preferredLang', lang);
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className={lang === 'ar' ? 'font-arabic' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
