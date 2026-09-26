// Src/utils/PitchGenerator.js
export function cleanBusinessName(name, niche) {
  if (!name) return (niche === 'Dentists' || niche === 'Medical') ? "Docteur" : "there";
  
  // Cut at delimiters: -, |, –, /
  let clean = name.split(/[-|–\/]/)[0].trim();
  
  clean = clean.replace(/cabinet/gi, '').replace(/dentaire/gi, '').replace(/clinique/gi, '').trim();
  
  if (niche === 'Dentists' || niche === 'Medical') {
      if (!clean.toLowerCase().includes('dr')) clean = "Dr. " + clean;
  }
  return clean || "Docteur";
}

const MAGHREB_LOCATIONS = [
  'algeria', 'alger', 'oran', 'constantine', 'annaba', 'blida', 'batna', 'djelfa', 'setif', 'sidi bel abbes', 'biskra', 'tebessa', 'el oued', 'skikda', 'tiaret', 'bejaia', 'tlemcen', 'ouargla', 'bechar', 'mostaganem', 'bordj', 'chlef', 'souk ahras', 'medea', 'el eulma', 'touggourt', 'ghardaia', 'saida', 'laghouat', 'm\'sila', 'jijel', 'relizane', 'guelma', 'ain beida', 'khenchela', 'bousaada', 'mascara', 'tizi ouzou',
  'morocco', 'casablanca', 'rabat', 'fes', 'marrakech', 'tangier', 'agadir', 'meknes', 'oujda', 'kenitra', 'tetouan',
  'tunisia', 'tunis', 'sfax', 'sousse', 'kairouan', 'bizerte', 'gabes', 'ariana',
  'libya', 'tripoli', 'benghazi', 'misrata', 'bayda'
];

function isMaghreb(location) {
  if (!location) return false;
  const loc = location.toLowerCase();
  return MAGHREB_LOCATIONS.some(m => loc.includes(m));
}

export function generatePitches(lead, settings = null) {
  const shortName = cleanBusinessName(lead.Businessname, lead.Niche);
  const scoreStr = (lead.Googlemapsscore || '0').replace(',', '.');
  const googleScore = parseFloat(scoreStr) || 0;
  const hasWebsite = !!lead.Website;
  const webScore = lead.WebsiteScore !== undefined ? lead.WebsiteScore : (hasWebsite ? 5 : null);
  const weaknesses = lead.Weaknesses || [];
  const location = lead.Wilaya || lead.Address || '';
  const maghreb = isMaghreb(location);
  
  let status = 'General Lead';
  let badgeClass = 'bg-blue-500/20 text-blue-400 border-blue-500';
  let priority = false;

  let pitchEng = '';
  let pitchFr = '';
  let pitchAr = '';
  let scenarioId = '';

  // SCENARIO 5 — No website + Google rating above 4.5 stars (PRIORITY)
  if (!hasWebsite && googleScore > 4.5) {
      scenarioId = 'priority_no_site';
      status = 'Priority - No Site High Rating';
      badgeClass = 'bg-purple-500/20 text-purple-400 border-purple-500 font-bold';
      priority = true;
      pitchEng = `Hi ${shortName}, I saw your amazing reviews on Google! However, when I tried to find your official website to look at your past work, I couldn't find one. In 2026, when high-ticket clients can't find a professional website, they often assume the business is closed or untrustworthy, and they end up calling a competitor. I build digital storefronts that make you look like the #1 authority in your city. Can I send you a quick example?`;
      pitchFr = `Bonjour ${shortName}, j'ai vu vos superbes avis sur Google ! Cependant, en cherchant votre site officiel pour voir votre travail, je n'en ai pas trouvé. En 2026, si les clients haut de gamme ne trouvent pas de site professionnel, ils pensent souvent que l'entreprise est fermée et appellent un concurrent. Je crée des vitrines digitales qui font de vous l'autorité n°1 dans votre ville. Puis-je vous envoyer un exemple ?`;
      pitchAr = maghreb 
        ? `السلام عليكم ${shortName}، شفت التقييمات ديالكم على جوجل ما شاء الله! بصح حوست على السيت ديالكم باش نشوف خدمتكم مالقيتوش. في وقتنا، الكليون لي عندهم دراهم كي ما يلقاوش سيت بروفيسيونال يروحو ديريكت للمنافسين. أنا نخدم دي سيت لي يرجعوكم رقم واحد في السوق. نقدر نبعتلك مثال تشوفو؟`
        : `أهلاً ${shortName}، رأيت تقييماتكم الممتازة على جوجل! لكن عندما بحثت عن موقعكم الرسمي لم أتمكن من العثور عليه. حالياً، العملاء المتميزون يذهبون للمنافسين إذا لم يجدوا موقعاً احترافياً. أنا أصمم مواقع تجعلك الخيار الأول في مدينتك. هل يمكنني إرسال نموذج سريع؟`;
  }
  // SCENARIO 1 — No website at all
  else if (!hasWebsite) {
      scenarioId = 'no_site';
      status = 'No Website';
      badgeClass = 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      pitchEng = `Hi ${shortName}, I found your business on Google Maps. You have a great rating, but when clients can't find a professional website, they often assume the business is untrustworthy and call a competitor instead. I build digital storefronts that make you look like the #1 authority in your area. Can I send you a quick example?`;
      pitchFr = `Bonjour ${shortName}, j'ai trouvé votre entreprise sur Google Maps. Vous avez de très bons avis, mais quand les clients ne trouvent pas de site professionnel, ils appellent souvent un concurrent. Je crée des sites qui font de vous l'autorité n°1 dans votre domaine. Puis-je vous envoyer un exemple ?`;
      pitchAr = maghreb
        ? `السلام عليكم ${shortName}، شفتكم في جوجل مابس، مليح بصح بلا سيت ويب بروفيسيونال، الكليون يقدر يروح للمنافسين. أنا نخدم دي سيت يرجعوكم رقم واحد. نقدر نبعتلك مثال؟`
        : `أهلاً ${shortName}، وجدت عملكم على خرائط جوجل — تقييمات جيدة، ولكن عندما لا يجد العملاء موقعاً احترافياً، غالباً ما يتجهون للمنافسين. أنا أصمم مواقع تجعلك الخيار الأول. هل يمكنني إرسال نموذج سريع؟`;
  }
  // SCENARIO 4 — Has website, score 1-3/10 (bad site)
  else if (webScore >= 1 && webScore <= 3) {
      scenarioId = 'bad_site';
      status = 'Bad Website (Redesign)';
      badgeClass = 'bg-red-500/20 text-red-400 border-red-500';
      pitchEng = `Hi ${shortName}, I was looking for services in your area and your company popped up. Your Google reviews are fantastic. However, I tried to open your website on my phone and it took way too long to load, and it's hard to navigate. When people are panicking and searching on their phone, they will press back and call a competitor instead if it doesn't load instantly. I build lead-generation systems for local businesses and can rebuild this so it forces people to call you immediately. Can I send you a quick sketch of how it should look?`;
      pitchFr = `Bonjour ${shortName}, vos avis Google sont super. Cependant, j'ai essayé d'ouvrir votre site sur mon téléphone et il est très lent. Quand les gens sont pressés, ils quittent le site et appellent un concurrent s'il ne charge pas instantanément. Je crée des systèmes de génération de leads qui forcent les clients à vous appeler. Puis-je vous envoyer un croquis rapide ?`;
      pitchAr = maghreb
        ? `السلام عليكم ${shortName}، التقييمات تاعكم في جوجل هايلة! بصح كي سييت نفتح السيت ديالكم في التليفون لقيتو ثقيل بزاف. الكليون كي يكون مزروب والسيت ما يفتحش تم تم، يروح ديريكت يعيط للمنافسين تاعكم وتخسرو دراهم كبار. أنا نخدم سيتات سريعة تجيب الكليون ديريكت. نقدر نبعتلك موديل تشوفو؟`
        : `أهلاً ${shortName}، تقييماتكم على جوجل رائعة. لكن حاولت فتح موقعكم على هاتفي وكان بطيئاً جداً. عندما يبحث العملاء بهواتفهم والموقع لا يفتح فوراً، فإنهم يتصلون بمنافسيك وتخسر الكثير من الصفقات. أنا أصمم أنظمة لجلب العملاء تجعلهم يتصلون بك فوراً. هل يمكنني إرسال رسم توضيحي سريع؟`;
  }
  // SCENARIO 3 — Has website, score 4-6/10 + specific weaknesses
  else if (webScore >= 4 && webScore <= 6 && weaknesses.length > 0) {
      scenarioId = 'weak_site';
      status = 'Website Weaknesses';
      badgeClass = 'bg-orange-500/20 text-orange-400 border-orange-500';
      const w0 = weaknesses[0].toLowerCase();
      
      let wEng = `it has an issue: ${weaknesses[0]}`;
      let wFr = `il a un problème : ${weaknesses[0]}`;
      let wArM = `فيه مشكل: ${weaknesses[0]}`;
      let wArG = `يوجد به مشكلة: ${weaknesses[0]}`;

      if (w0.includes('meta description')) {
          wEng = "your clinic doesn't appear in Google search results";
          wFr = "votre clinique n'apparaît pas dans les résultats de recherche Google";
          wArM = "العيادة ديالكم ماتبانش في نتائج البحث تاع جوجل";
          wArG = "عيادتك لا تظهر في نتائج بحث جوجل";
      } else if (w0.includes('ssl')) {
          wEng = "your website shows as Not Secure which scares patients away";
          wFr = "votre site est marqué comme Non Sécurisé, ce qui fait fuir les patients";
          wArM = "السيت ديالكم يبان غير آمن (Not Secure) وهذا يخلي المرضى يهربو";
          wArG = "موقعك يظهر كغير آمن مما قد يخيف المرضى ويجعلهم يغادرون";
      } else if (w0.includes('h1')) {
          wEng = "Google can't understand what your website is about";
          wFr = "Google n'arrive pas à comprendre de quoi parle votre site";
          wArM = "جوجل مايقدرش يفهم السيت ديالكم على واش يهدر";
          wArG = "جوجل لا يستطيع فهم محتوى موقعك الإلكتروني";
      } else if (w0.includes('alt text') || w0.includes('images missing')) {
          wEng = "your website is invisible to Google image search";
          wFr = "votre site est invisible sur la recherche d'images Google";
          wArM = "السيت ديالكم مايبانش في البحث تاع التصاور في جوجل";
          wArG = "موقعك غير مرئي في بحث صور جوجل";
      } else if (w0.includes('favicon')) {
          wEng = "your website looks unfinished in the browser tab";
          wFr = "votre site a l'air inachevé dans l'onglet du navigateur";
          wArM = "السيت ديالكم يبان ناقص وموش مكمول في المتصفح";
          wArG = "موقعك يبدو غير مكتمل في علامة تبويب المتصفح";
      } else if (w0.includes('open graph')) {
          wEng = "your site looks broken when shared on WhatsApp";
          wFr = "votre site a l'air cassé quand on le partage sur WhatsApp";
          wArM = "السيت يبان خاسر كي تبارطاجيه في واتساب";
          wArG = "موقعك يبدو غير منظم عند مشاركته على واتساب";
      } else if (w0.includes('contact form')) {
          wEng = "patients have no way to book online directly";
          wFr = "les patients n'ont aucun moyen de réserver en ligne directement";
          wArM = "المرضى ماعندهمش كيفاش يريزيرفيو أونلاين ديريكت";
          wArG = "لا يوجد للزوار طريقة لحجز موعد عبر الإنترنت مباشرة";
      } else if (w0.includes('testimonials') || w0.includes('reviews')) {
          wEng = "new patients can't see social proof before visiting";
          wFr = "les nouveaux patients ne voient aucune preuve sociale avant de venir";
          wArM = "المرضى الجدد مايشوفوش آراء الناس قبل ما يجيكم";
          wArG = "المرضى الجدد لا يمكنهم رؤية تجارب الآخرين قبل زيارة العيادة";
      } else if (w0.includes('analytics')) {
          wEng = "you have no way to track where your patients come from";
          wFr = "vous n'avez aucun moyen de savoir d'où viennent vos patients";
          wArM = "ماعندكمش كيفاش تعرفو منين راهم يجيو المرضى ديالكم";
          wArG = "ليس لديك طريقة لتتبع من أين يأتي مرضاك";
      }
      
      pitchEng = `Hi ${shortName}, your business has a great reputation. I was checking out your website and it looks nice, but I noticed a major technical leak: ${wEng}. Little errors like this scare off high-paying clients at the last second. I specialize in fixing these conversion leaks. Worth a quick chat?`;
      pitchFr = `Bonjour ${shortName}, votre entreprise a une excellente réputation. Votre site est beau, mais j'ai remarqué une fuite technique majeure : ${wFr}. De petites erreurs comme celle-ci font fuir les clients haut de gamme à la dernière seconde. Je suis spécialisé dans la résolution de ces problèmes. On en discute ?`;
      pitchAr = maghreb
        ? `السلام عليكم ${shortName}، سمعتكم مليحة بزاف! شفت السيت ديالكم شباب بصح لقيت فيه مشكل تقني كبير: ${wArM}. هاد الغلطات الصغار يهربو الكليون لي عندهم دراهم في آخر لحظة. أنا سبيسياليست نصلح هاد المشاكل باش تزيدو المبيعات. مهتم نحكيو فيها؟`
        : `أهلاً ${shortName}، سمعة عملكم ممتازة! تفقدت موقعكم وهو يبدو جيداً، لكني لاحظت تسريباً تقنياً كبيراً: ${wArG}. أخطاء صغيرة مثل هذه تخيف العملاء ذوي الدخل المرتفع في اللحظة الأخيرة. أنا متخصص في سد هذه الثغرات لزيادة المبيعات. هل يستحق الأمر محادثة سريعة؟`;
  }
  // SCENARIO 2 — Website score 7-10 (good site)
  else if (webScore >= 7 || (hasWebsite && weaknesses.length === 0)) {
      scenarioId = 'good_site';
      status = 'Good Website (Upgrade)';
      badgeClass = 'bg-green-500/20 text-green-400 border-green-500';
      pitchEng = `Hi ${shortName}, I was researching top businesses in the area and your website caught my eye. It looks very solid. I specialize in Conversion Rate Optimization, and I noticed two minor tweaks that could easily increase the number of phone calls you get from the traffic you already have. Would you be open to a 5-minute video where I show you what I mean?`;
      pitchFr = `Bonjour ${shortName}, je faisais des recherches sur les meilleures entreprises de la région et votre site a attiré mon attention. Il est très bien fait. Je suis spécialisé en optimisation du taux de conversion (CRO), et j'ai remarqué deux petites modifications qui pourraient facilement augmenter vos appels entrants avec le trafic actuel. Accepteriez-vous que je vous envoie une vidéo de 5 minutes pour vous montrer ?`;
      pitchAr = maghreb
        ? `السلام عليكم ${shortName}، كنت نحوس على أحسن الشركات في المنطقة والسيت ديالكم عجبني. راهو مخدوم غاية! أنا سبيسياليست في زيادة المبيعات (CRO)، ولقيت زوج عفايس صغار يقدرو يزيدولكم عدد المكالمات لي تجيكم من السيت. تقبلو نبعتلكم فيديو تاع 5 دقايق نشرحلكم فيها الفكرة؟`
        : `أهلاً ${shortName}، كنت أبحث عن أفضل الشركات في المنطقة ولفت موقعكم انتباهي. يبدو قوياً جداً! أنا متخصص في تحسين معدل التحويل، ولاحظت تعديلين بسيطين يمكنهما زيادة عدد المكالمات التي تتلقاها بسهولة من زوارك الحاليين. هل تقبل أن أرسل لك مقطع فيديو مدته 5 دقائق لأوضح لك ما أقصده؟`;
  }
  // Instagram fallback
  else if (lead.Username || (lead.Instagramlink && lead.Instagramlink.includes('instagram.com'))) {
      status = 'Instagram Prospect';
      badgeClass = 'bg-pink-500/20 text-pink-400 border-pink-500';
      pitchEng = `Hi ${shortName}, I checked out your Instagram. Love your work! I have an idea to help you get more clients using Reels. Can we chat?`;
      pitchFr = `Bonjour ${shortName}, j'ai vu votre profil Instagram. J'adore votre travail ! J'ai une idée pour vous aider à avoir plus de clients avec des Reels. On en parle ?`;
      pitchAr = maghreb
        ? `السلام عليكم ${shortName}، شفت حسابكم في إنستغرام. خدمة شابة! عندي فكرة باش تجيبو كليون كتر بـ Reels. نقدر نبعتلك التفاصيل؟`
        : `أهلاً ${shortName}، تصفحت حسابك على إنستغرام. عمل رائع! لدي فكرة لمساعدتك في الحصول على المزيد من العملاء باستخدام Reels. هل يمكننا التحدث؟`;
  } 
  // LinkedIn fallback
  else {
      status = 'LinkedIn/General Prospect';
      badgeClass = 'bg-blue-600/20 text-blue-500 border-blue-600';
      pitchEng = `Hi ${shortName}, I found your professional profile. I help businesses in your space get more clients. Can we chat?`;
      pitchFr = `Bonjour ${shortName}, j'ai vu votre profil professionnel. J'aide les entreprises de votre secteur à acquérir plus de clients. On peut en parler ?`;
      pitchAr = maghreb
        ? `السلام عليكم ${shortName}، لقيت البروفايل المهني ديالكم. أنا نعاون الشركات اللي كيما نتوما باش يجيبو كليون. مهتم نحكيو؟`
        : `أهلاً ${shortName}، وجدت ملفك المهني. أساعد الشركات في مجالك على اكتساب المزيد من العملاء. هل يمكننا التحدث؟`;
  }

  // Override with user settings if they exist
  if (settings && settings.pitchTemplates && scenarioId) {
      const overrides = settings.pitchTemplates[scenarioId];
      if (overrides) {
          if (overrides.en && overrides.en.trim() !== '') {
              pitchEng = overrides.en.replace(/{shortName}/g, shortName).replace(/{scoreStr}/g, scoreStr);
          }
          if (overrides.fr && overrides.fr.trim() !== '') {
              pitchFr = overrides.fr.replace(/{shortName}/g, shortName).replace(/{scoreStr}/g, scoreStr);
          }
          if (overrides.ar && overrides.ar.trim() !== '') {
              pitchAr = overrides.ar.replace(/{shortName}/g, shortName).replace(/{scoreStr}/g, scoreStr);
          }
      }
  }

  return {
      status,
      badgeClass,
      priority,
      pitches: {
          en: pitchEng,
          fr: pitchFr,
          ar: pitchAr
      }
  };
}
