export const generateContractHTML = (contractData, config) => {
  const {
    ref,
    date,
    client,
    project,
    pricing,
    languages,
    timeline,
    hourlyRate,
    warrantyDays
  } = contractData;

  // Determine Language Combo ID
  const langs = languages.map(l => l.toUpperCase());
  let combo = 'en_fr';
  if (langs.includes('EN') && langs.length === 1) combo = 'en';
  if (langs.includes('EN') && langs.includes('FR') && langs.includes('AR')) combo = 'en_fr_ar';
  if (langs.includes('EN') && langs.includes('ES')) combo = 'en_es';
  if (langs.includes('EN') && langs.includes('FR') && langs.length === 2) combo = 'en_fr';

  // Helper: format currency
  const formatCurrency = (val) => new Intl.NumberFormat('fr-FR').format(val);

  // Dual Currency Logic
  const zoneCurrency = pricing.currency; // 'DA', 'USD', 'EUR'
  const isDA = zoneCurrency === 'DA';
  const usdRate = config?.blackMarketRates?.USD || 250;
  
  const getPriceDisplay = (daVal) => {
    if (isDA) {
      const usdVal = Math.round(daVal / usdRate);
      return `${formatCurrency(daVal)} DZD (≈ $${formatCurrency(usdVal)} USD)`;
    } else {
      let foreignVal = 0;
      let symbol = '';
      if (zoneCurrency === 'USD') {
        foreignVal = Math.round(daVal / usdRate);
        symbol = '$';
      } else if (zoneCurrency === 'EUR') {
        const eurRate = config?.blackMarketRates?.EUR || 270;
        foreignVal = Math.round(daVal / eurRate);
        symbol = '€';
      }
      return `${symbol}${formatCurrency(foreignVal)} ${zoneCurrency} (≈ ${formatCurrency(daVal)} DZD)`;
    }
  };

  // Tranches Math
  const totalDA = pricing.totalDA;
  const is2Tranches = pricing.tranchesSplit === 2;
  const t1DA = is2Tranches ? Math.round(totalDA * 0.5) : Math.round(totalDA * 0.3);
  const t2DA = is2Tranches ? Math.round(totalDA * 0.5) : Math.round(totalDA * 0.3);
  const t3DA = is2Tranches ? 0 : Math.round(totalDA * 0.4);

  // Dynamic Multi-Language Strings
  const L = {
    coverAgency: 'Hammaz Abdelhadi — Ingénierie Web & Logicielle',
    coverTitle: 'Contrat de Développement Web<br/>' + project.title,
    coverSub: {
      'en': project.title + ' Agreement',
      'en_fr': 'Contrat ' + project.title + ' · ' + project.title + ' Agreement',
      'en_fr_ar': 'Contrat ' + project.title + ' · ' + project.title + ' Agreement · عقد تطوير ' + project.title,
      'en_es': 'Contrato ' + project.title + ' · ' + project.title + ' Agreement'
    }[combo],
    art1Title: {
      'en': { fr: '', en: 'Subject of Contract', ar: '' },
      'en_fr': { fr: 'Objet du Contrat', en: 'Subject of Contract', ar: '' },
      'en_fr_ar': { fr: 'Objet du Contrat', en: 'Subject of Contract', ar: 'موضوع العقد' },
      'en_es': { fr: 'Objeto del Contrato', en: 'Subject of Contract', ar: '' }
    }[combo],
    art2Title: {
      'en': { fr: '', en: 'Technical Scope & Cost Breakdown', ar: '' },
      'en_fr': { fr: 'Périmètre Technique et Détail de Facturation', en: 'Technical Scope & Cost Breakdown', ar: '' },
      'en_fr_ar': { fr: 'Périmètre Technique et Détail de Facturation', en: 'Technical Scope & Cost Breakdown', ar: 'النطاق التقني وتفاصيل التكلفة' },
      'en_es': { fr: 'Alcance Técnico y Desglose de Costos', en: 'Technical Scope & Cost Breakdown', ar: '' }
    }[combo],
    art3Title: {
      'en': { fr: '', en: `Payment Terms (${is2Tranches?'2':'3'} Installments)`, ar: '' },
      'en_fr': { fr: `Conditions Financières (Paiement en ${is2Tranches?'2':'3'} Tranches)`, en: `Payment Terms (${is2Tranches?'2':'3'} Installments)`, ar: '' },
      'en_fr_ar': { fr: `Conditions Financières (Paiement en ${is2Tranches?'2':'3'} Tranches)`, en: `Payment Terms (${is2Tranches?'2':'3'} Installments)`, ar: 'الشروط المالية' },
      'en_es': { fr: `Condiciones Financieras (${is2Tranches?'2':'3'} Cuotas)`, en: `Payment Terms (${is2Tranches?'2':'3'} Installments)`, ar: '' }
    }[combo],
    art4Title: {
      'en': { fr: '', en: 'Execution Timeline', ar: '' },
      'en_fr': { fr: 'Calendrier d\'Exécution et Livraison', en: 'Execution Timeline', ar: '' },
      'en_fr_ar': { fr: 'Calendrier d\'Exécution et Livraison', en: 'Execution Timeline', ar: 'الجدول الزمني والتسليم' },
      'en_es': { fr: 'Cronograma de Ejecución y Entrega', en: 'Execution Timeline', ar: '' }
    }[combo],
    art5Title: {
      'en': { fr: '', en: 'Revisions & Scope Limits', ar: '' },
      'en_fr': { fr: 'Révisions & Limites du Forfait', en: 'Revisions & Scope Limits', ar: '' },
      'en_fr_ar': { fr: 'Révisions & Limites du Forfait', en: 'Revisions & Scope Limits', ar: 'المراجعات ونطاق الباقة' },
      'en_es': { fr: 'Revisiones y Límites del Alcance', en: 'Revisions & Scope Limits', ar: '' }
    }[combo],
    art6Title: {
      'en': { fr: '', en: 'IP Rights & Hosting', ar: '' },
      'en_fr': { fr: 'Propriété Intellectuelle & Hébergement', en: 'IP Rights & Hosting', ar: '' },
      'en_fr_ar': { fr: 'Propriété Intellectuelle & Hébergement', en: 'IP Rights & Hosting', ar: 'الملكية الفكرية والاستضافة' },
      'en_es': { fr: 'Propiedad Intelectual y Alojamiento', en: 'IP Rights & Hosting', ar: '' }
    }[combo],
    art7Title: {
      'en': { fr: '', en: 'Termination Rules', ar: '' },
      'en_fr': { fr: 'Résiliation et Retenues', en: 'Termination Rules', ar: '' },
      'en_fr_ar': { fr: 'Résiliation et Retenues', en: 'Termination Rules', ar: 'شروط إلغاء العقد' },
      'en_es': { fr: 'Terminación y Retenciones', en: 'Termination Rules', ar: '' }
    }[combo],
    art8Title: {
      'en': { fr: '', en: 'Confidentiality', ar: '' },
      'en_fr': { fr: 'Confidentialité', en: 'Confidentiality', ar: '' },
      'en_fr_ar': { fr: 'Confidentialité', en: 'Confidentiality', ar: 'السرية' },
      'en_es': { fr: 'Confidencialidad', en: 'Confidentiality', ar: '' }
    }[combo],
    art9Title: {
      'en': { fr: '', en: 'Technical Warranty', ar: '' },
      'en_fr': { fr: 'Garantie Technique Ponctuelle', en: 'Technical Warranty', ar: '' },
      'en_fr_ar': { fr: 'Garantie Technique Ponctuelle', en: 'Technical Warranty', ar: 'الضمان التقني' },
      'en_es': { fr: 'Garantía Técnica', en: 'Technical Warranty', ar: '' }
    }[combo],
    sigRead: {
      'en': 'Read and approved',
      'en_fr': 'Lu et approuvé · Read and approved',
      'en_fr_ar': 'Lu et approuvé · Read and approved · قرأت وأوافق',
      'en_es': 'Leído y aprobado · Read and approved'
    }[combo]
  };

  const renderArticleHeader = (num, titles) => {
    if (combo === 'en') {
      return `
      <div class="article-header" style="justify-content: center;">
        <div style="text-align: center;">
          <div class="article-num" style="margin-bottom:4px;">Article ${num}</div>
          <div class="article-title-fr" style="font-size: 19px;">${titles.en}</div>
        </div>
      </div>`;
    }
    return `
    <div class="article-header">
      <div>
        <div class="article-num">Article ${num}</div>
        <div class="article-title-fr">${titles.fr}</div>
      </div>
      <div class="article-title-right">
        <div class="article-title-en">${titles.en}</div>
        ${titles.ar ? `<div class="article-title-ar">${titles.ar}</div>` : ''}
      </div>
    </div>`;
  };

  const renderTriBlock = (textFr, textEn, textAr, textEs) => {
    if (combo === 'en') {
      return `
      <div class="tri" style="grid-template-columns: 1fr;">
        <div class="tri-en" style="border:none; padding:0;">
          <div class="lang-text" style="font-size:14.5px;">${textEn}</div>
        </div>
      </div>`;
    }
    if (combo === 'en_fr') {
      return `
      <div class="tri" style="grid-template-columns: 1fr 1fr;">
        <div class="tri-fr">
          <div class="lang-label">Français</div>
          <div class="lang-text">${textFr}</div>
        </div>
        <div class="tri-en" style="border:none; padding:0;">
          <div class="lang-label">English</div>
          <div class="lang-text">${textEn}</div>
        </div>
      </div>`;
    }
    if (combo === 'en_es') {
      return `
      <div class="tri" style="grid-template-columns: 1fr 1fr;">
        <div class="tri-fr">
          <div class="lang-label">Español</div>
          <div class="lang-text">${textEs}</div>
        </div>
        <div class="tri-en" style="border:none; padding:0;">
          <div class="lang-label">English</div>
          <div class="lang-text">${textEn}</div>
        </div>
      </div>`;
    }
    // en_fr_ar
    return `
    <div class="tri">
      <div class="tri-fr">
        <div class="lang-label">Français</div>
        <div class="lang-text">${textFr}</div>
      </div>
      <div class="tri-en">
        <div class="lang-label">English</div>
        <div class="lang-text">${textEn}</div>
      </div>
      <div class="tri-ar">
        <div class="lang-label">العربية</div>
        <div class="lang-text">${textAr}</div>
      </div>
    </div>`;
  };

  let scopeRows = '';
  pricing.breakdown.forEach(item => {
    scopeRows += `
    <tr>
      <td><strong>${item.label}</strong></td>
      <td class="scope-price">${getPriceDisplay(item.priceDA)}</td>
    </tr>`;
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Contract - ${project.title}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Source+Sans+3:wght@300;400;600&display=swap" rel="stylesheet"/>
<style>
  :root {
    --bg: #FAFAF8;
    --card: #FFFFFF;
    --ink: #111111;
    --muted: #666666;
    --accent: #1a1a1a; 
    --accent-light: #f5f5f5;
    --border: #DDDBD5;
    --red: #C0392B;
    --gold: #FFD700;
    --ar: 'Segoe UI', 'Tahoma', Arial, sans-serif;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: var(--bg); font-family: 'Source Sans 3', sans-serif; color: var(--ink); font-size: 14px; line-height: 1.7; }
  .page { max-width: 1000px; margin: 0 auto; padding: 60px 40px; background: #fff; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
  .cover { text-align: center; padding: 40px 0 50px; border-bottom: 2px solid var(--accent); margin-bottom: 50px; }
  .cover-agency { font-size: 11px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: var(--accent); margin-bottom: 24px; }
  .cover-title { font-family: 'Playfair Display', serif; font-size: 38px; font-weight: 700; line-height: 1.2; color: var(--ink); margin-bottom: 8px; }
  .cover-subtitle { font-family: 'Playfair Display', serif; font-style: italic; font-size: 18px; color: var(--muted); margin-bottom: 32px; }
  .cover-meta { display: inline-flex; gap: 40px; background: var(--accent-light); padding: 16px 32px; border-radius: 6px; border: 1px solid var(--border); }
  .cover-meta-item { text-align: center; }
  .cover-meta-label { font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
  .cover-meta-value { font-size: 13px; font-weight: 600; color: var(--accent); }
  
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
  .party-card { border: 1px solid var(--border); border-radius: 8px; padding: 22px 24px; background: var(--card); }
  .party-role { font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #D4AF37; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
  .party-role::before { content: ''; display: inline-block; width: 20px; height: 2px; background: #D4AF37; }
  .party-name { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
  .party-detail { font-size: 12.5px; color: var(--muted); line-height: 1.8; }
  
  .article { background: var(--card); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 25px; overflow: hidden; }
  .article-header { background: var(--accent); padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; }
  .article-num { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #D4AF37; }
  .article-title-fr { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700; color: #fff; }
  .article-title-right { text-align: right; }
  .article-title-en { font-size: 11px; color: rgba(255,255,255,0.65); font-style: italic; }
  .article-title-ar { font-family: var(--ar); font-size: 14px; color: rgba(255,255,255,0.85); direction: rtl; }
  .article-body { padding: 24px 28px; }
  
  .tri { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .tri-fr { border-right: 1px solid var(--border); padding-right: 20px; }
  .tri-en { border-right: 1px solid var(--border); padding-right: 20px; }
  .tri-ar { direction: rtl; text-align: right; }
  .lang-label { font-size: 9px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
  .tri-fr .lang-text, .tri-en .lang-text { font-size: 13.5px; line-height: 1.75; color: #333; }
  .tri-ar .lang-text { font-family: var(--ar); font-size: 14px; line-height: 2; color: #333; }
  
  .scope-category { background: #f8f9fa; padding: 10px 15px; border: 1px solid var(--border); border-bottom: none; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; font-size: 12px; margin-top: 20px; }
  .scope-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
  .scope-table th { background: var(--accent-light); color: var(--ink); font-size: 11px; font-weight: 600; padding: 10px 14px; text-align: left; border: 1px solid var(--border); }
  .scope-table td { padding: 12px 14px; border: 1px solid var(--border); font-size: 13px; color: #333; vertical-align: top; }
  .scope-price { font-weight: bold; color: var(--accent); text-align: right; white-space: nowrap; width: 30%; }
  .module-total { background: #fcfcfc; text-align: right; padding: 10px 14px; border: 1px solid var(--border); border-top: none; font-weight: bold; font-size: 13px; color: var(--accent); }
  
  .pay-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  .pay-table th { background: var(--accent-light); color: var(--accent); font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 10px 14px; text-align: left; border: 1px solid var(--border); }
  .pay-table td { padding: 12px 14px; border: 1px solid var(--border); font-size: 13.5px; vertical-align: top; }
  .pay-amount { font-weight: 700; color: var(--accent); font-size: 15px; }
  .pay-total td { background: var(--accent) !important; color: #D4AF37; font-weight: 700; font-size: 16px; }
  
  .notice { background: #FEF9E7; border: 1px solid #F0C030; border-radius: 6px; padding: 14px 18px; font-size: 13px; margin-top: 20px; color: #7B5800; }
  .notice-red { background: #FDEDEC; border-color: var(--red); color: var(--red); }
  
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 40px; padding-top: 30px; border-top: 2px solid var(--border); }
  .sig-block { border: 1px solid var(--border); border-radius: 8px; padding: 22px 24px; background: var(--card); }
  .sig-role { font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #D4AF37; margin-bottom: 10px; }
  .sig-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
  .sig-line { margin-top: 40px; border-top: 1px solid var(--ink); padding-top: 6px; font-size: 11px; color: var(--muted); }
  .sig-date { margin-top: 14px; font-size: 12px; color: var(--muted); }
  
  .doc-footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--muted); }
  
  @media print { body { background: white; } .page { padding: 0; box-shadow: none; max-width: 100%; } .article { break-inside: avoid; } }
</style>
</head>
<body>
<div class="page">
  <div class="cover">
    <div class="cover-agency">${L.coverAgency}</div>
    <div class="cover-title">${L.coverTitle}</div>
    <div class="cover-subtitle">${L.coverSub}</div>
    <div class="cover-meta">
      <div class="cover-meta-item">
        <div class="cover-meta-label">Référence</div>
        <div class="cover-meta-value">${ref}</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">Date de Signature</div>
        <div class="cover-meta-value">${date}</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">Montant Total</div>
        <div class="cover-meta-value">${getPriceDisplay(totalDA)}</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">Délai Estimé</div>
        <div class="cover-meta-value">${timeline}</div>
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party-card">
      <div class="party-role">Prestataire / Developer</div>
      <div class="party-name">Hammaz Abdelhadi</div>
      <div class="party-detail">
        Développeur Full-Stack<br/>
        Alger, Algérie<br/>
        Contact : +213 555 123 456
      </div>
    </div>
    <div class="party-card">
      <div class="party-role">Client${combo==='en_fr_ar' ? ' / العميل' : ''}</div>
      <div class="party-name">${client.name}</div>
      <div class="party-detail">
        Société : ${client.company}<br/>
        Type d'activité : ${client.activity || 'N/A'}<br/>
        Pays : ${client.country}<br/>
        Téléphone : ${client.phone}
      </div>
    </div>
  </div>

  <div class="article">
    ${renderArticleHeader('01', L.art1Title)}
    <div class="article-body">
      ${renderTriBlock(
        `Le présent contrat a pour objet le développement complet et le déploiement de : ${project.title}. <br/><br/>${project.description || ''}`,
        `This contract covers the full development and deployment of: ${project.title}. <br/><br/>${project.description || ''}`,
        `يهدف هذا العقد إلى التطوير الكامل والدمج الرقمي لمشروع : ${project.title}. <br/><br/>${project.description || ''}`,
        `Este contrato cubre el desarrollo completo y despliegue de: ${project.title}. <br/><br/>${project.description || ''}`
      )}
    </div>
  </div>

  <div class="article">
    ${renderArticleHeader('02', L.art2Title)}
    <div class="article-body">
      <div class="scope-category">Modules du Projet</div>
      <table class="scope-table">
        <tbody>
          ${scopeRows}
        </tbody>
      </table>
      <div class="module-total">Total Global : ${getPriceDisplay(totalDA)}</div>
    </div>
  </div>

  <div class="article">
    ${renderArticleHeader('03', L.art3Title)}
    <div class="article-body">
      <table class="pay-table">
        <thead>
          <tr>
            <th>Tranche / Installment</th>
            <th>Condition / Échéance</th>
            <th>Montant / Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1ère Tranche — Acompte (${is2Tranches ? '50%' : '30%'})</strong></td>
            <td>À la signature du présent contrat.</td>
            <td class="pay-amount">${getPriceDisplay(t1DA)}</td>
          </tr>
          <tr>
            <td><strong>2ème Tranche — Jalon (${is2Tranches ? '50%' : '30%'})</strong></td>
            <td>${is2Tranches ? 'À la livraison finale du projet.' : 'À la validation de la structure visuelle Front-End.'}</td>
            <td class="pay-amount">${getPriceDisplay(t2DA)}</td>
          </tr>
          ${!is2Tranches ? `
          <tr>
            <td><strong>3ème Tranche — Solde (40%)</strong></td>
            <td>À la livraison finale du projet et mise en ligne.</td>
            <td class="pay-amount">${getPriceDisplay(t3DA)}</td>
          </tr>` : ''}
          <tr class="pay-total">
            <td colspan="2"><strong>TOTAL GLOBAL</strong></td>
            <td><strong>${getPriceDisplay(totalDA)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="article">
    ${renderArticleHeader('04', L.art4Title)}
    <div class="article-body">
      ${renderTriBlock(
        `Le temps de développement estimé est de <strong>${timeline}</strong> à compter de la réception de l'acompte initial.`,
        `The estimated development time is <strong>${timeline}</strong> from the receipt of the initial deposit.`,
        `الوقت المقدر لتطوير هذا النظام هو <strong>${timeline}</strong> بدءاً من تاريخ استلام الدفعة الأولى.`,
        `El tiempo estimado de desarrollo es de <strong>${timeline}</strong> a partir de la recepción del pago inicial.`
      )}
    </div>
  </div>

  <div class="article">
    ${renderArticleHeader('05', L.art5Title)}
    <div class="article-body">
      ${renderTriBlock(
        `Ce forfait intègre <strong>1 cycle complet de révisions</strong>. Tout ajout fonctionnel majeur hors périmètre fera l'objet d'un avenant tarifé à ${formatCurrency(hourlyRate)} DZD/heure.`,
        `This package includes <strong>1 complete review cycle</strong>. Any heavy functional changes outside scope will be billed at ${formatCurrency(hourlyRate)} DZD/hour.`,
        `تتضمن هذه الباقة <strong>جولة مراجعة وتعديل واحدة كاملة</strong>. أي إضافات وظيفية جذرية خارج النطاق ستخضع لملحق مالي بـ ${formatCurrency(hourlyRate)} دج/ساعة.`,
        `Este paquete incluye <strong>1 ciclo completo de revisión</strong>. Cualquier cambio funcional mayor fuera del alcance será facturado a ${formatCurrency(hourlyRate)} DZD/hora.`
      )}
    </div>
  </div>

  <div class="article">
    ${renderArticleHeader('06', L.art6Title)}
    <div class="article-body">
      ${renderTriBlock(
        `Le Client obtient le droit d'exploitation exclusif dès le versement intégral du solde.`,
        `The Client gains exclusive operational rights strictly after the final balance clearance.`,
        `يمتلك العميل ترخيص استخدام الكود المصدري حصريًا فور سداد الدفعة النهائية.`,
        `El cliente obtiene derechos de explotación exclusivos tras el pago del saldo final.`
      )}
      <div class="notice notice-red">
        <strong>Avertissement :</strong> Aucun code source ne sera transféré avant le paiement intégral du solde.
      </div>
    </div>
  </div>

  <div class="article">
    ${renderArticleHeader('07', L.art7Title)}
    <div class="article-body">
      ${renderTriBlock(
        `En cas d'annulation du projet par le Client, l'acompte initial reste non remboursable.`,
        `In case of project cancellation by the Client, the initial advance payment remains non-refundable.`,
        `في حالة إلغاء المشروع من قبل العميل، فإن الدفعة الأولى غير قابلة للاسترداد.`,
        `En caso de cancelación por parte del cliente, el pago inicial no es reembolsable.`
      )}
    </div>
  </div>

  <div class="article">
    ${renderArticleHeader('08', L.art8Title)}
    <div class="article-body">
      ${renderTriBlock(
        `Les deux parties s'engagent à préserver le secret le plus strict sur les données applicatives.`,
        `Both parties agree to treat all business records and security systems with strict confidentiality.`,
        `يتعهد الطرفان بالحفاظ الصارم على سرية البيانات طوال فترة العمل.`,
        `Ambas partes acuerdan tratar todos los registros comerciales con estricta confidencialidad.`
      )}
    </div>
  </div>

  <div class="article">
    ${renderArticleHeader('09', L.art9Title)}
    <div class="article-body">
      ${renderTriBlock(
        `Garantie gratuite de tout bug lié au périmètre fonctionnel pendant <strong>${warrantyDays} jours</strong>.`,
        `Free patching of blockages strictly linked to the initial scope for <strong>${warrantyDays} days</strong>.`,
        `ضمان مجاني لإصلاح أي أخطاء برمجية لمدة <strong>${warrantyDays} يومًا</strong>.`,
        `Parcheo gratuito de errores vinculados al alcance inicial durante <strong>${warrantyDays} días</strong>.`
      )}
    </div>
  </div>

  <div class="signatures">
    <div class="sig-block">
      <div class="sig-role">Prestataire / Developer</div>
      <div class="sig-name">Hammaz Abdelhadi</div>
      <div class="party-detail">Développeur Software Indépendant</div>
      <div class="sig-date">Date : ${date}</div>
      <div class="sig-line">Signature</div>
    </div>
    <div class="sig-block">
      <div class="sig-role">Client${combo==='en_fr_ar' ? ' / العميل' : ''}</div>
      <div class="sig-name">${client.name}</div>
      <div class="party-detail">${L.sigRead}</div>
      <div class="sig-date">Date : ${date}</div>
      <div class="sig-line">Signature (Cachet de l'Entreprise)</div>
    </div>
  </div>

  <div class="doc-footer">
    <div>
      <strong>Enterprise Web System Agreement</strong> · Réf. ${ref}<br/>
      Ce document constitue un accord légalement contraignant.
    </div>
    ${combo === 'en_fr_ar' ? `
    <div style="text-align:right; font-family: var(--ar); direction: rtl;">
      <strong>اتفاقية تطوير نظام إلكتروني مؤسسي</strong> · المرجع ${ref}<br/>
      تُعدّ هذه الوثيقة اتفاقية ملزمة قانونيًا.
    </div>` : ''}
  </div>

</div>
</body>
</html>`;
};
