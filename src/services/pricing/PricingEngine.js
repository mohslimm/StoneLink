/**
 * Pricing Engine Utilities
 */

export const detectMarketZone = (country, config) => {
    if (!config || !config.marketZones) return null;
    if (!country) return config.marketZones.find(z => z.zone === "Western EU") || null;
    
    for (const zone of config.marketZones) {
        if (zone.countries.some(c => c.toLowerCase() === country.toLowerCase())) {
            return zone;
        }
    }
    // Default to Western EU
    return config.marketZones.find(z => z.zone === "Western EU") || null;
};

export const calculatePrice = (baseProjectId, selectedModuleIds, zone, config) => {
    if (!config || !zone) return null;
    
    const baseProject = config.baseProjects.find(p => p.id === baseProjectId);
    if (!baseProject) return null;
    
    let baseSumDA = baseProject.baseDA;
    const breakdown = [
        { id: baseProject.id, label: baseProject.label, priceDA: baseProject.baseDA }
    ];
    
    for (const modId of (selectedModuleIds || [])) {
        const mod = config.modules.find(m => m.id === modId);
        if (mod) {
            baseSumDA += mod.baseDA;
            breakdown.push({ id: mod.id, label: mod.label, priceDA: mod.baseDA });
        }
    }
    
    // Apply zone multiplier
    const totalDA = baseSumDA * (zone.multiplier || 1);
    
    const finalBreakdown = breakdown.map(item => ({
        ...item,
        priceDA: item.priceDA * (zone.multiplier || 1)
    }));
    
    let totalForeign = 0;
    if (zone.currency === 'USD') {
        totalForeign = totalDA / config.blackMarketRates.USD;
    } else if (zone.currency === 'EUR') {
        totalForeign = totalDA / config.blackMarketRates.EUR;
    } else if (zone.currency === 'GBP') {
        totalForeign = totalDA / config.blackMarketRates.GBP;
    }
    
    return {
        totalDA,
        totalForeign: Math.round(totalForeign),
        currency: zone.currency,
        zone: zone.zone,
        breakdown: finalBreakdown
    };
};

export const getCompetitorRange = (baseProjectId, zone) => {
    // Rough reference ranges
    const ranges = {
        "DZ Local": { min: 400, max: 1000, currency: "USD" },
        "MENA": { min: 1000, max: 3000, currency: "USD" },
        "Southern EU": { min: 1500, max: 4000, currency: "EUR" },
        "Western EU": { min: 3000, max: 10000, currency: "EUR" },
        "North America": { min: 5000, max: 25000, currency: "USD" },
        "Australia": { min: 4000, max: 20000, currency: "USD" },
        "Latin America": { min: 800, max: 2500, currency: "USD" }
    };
    
    const base = ranges[zone?.zone] || ranges["Western EU"];
    
    const complexityMultiplier = {
        vitrine: 1,
        vitrine_seo: 1.5,
        ecommerce: 2.5,
        custom_admin: 3.5,
        full_platform: 5,
        mobile_app: 6,
        saas: 8
    };
    
    const mult = complexityMultiplier[baseProjectId] || 1;
    
    return {
        min: Math.round(base.min * mult),
        max: Math.round(base.max * mult),
        currency: base.currency
    };
};

export const getProfitabilityEstimate = (totalDA, estimatedHours, config) => {
    if (!estimatedHours || estimatedHours <= 0) return null;
    
    const hourlyRateDA = totalDA / estimatedHours;
    const hourlyRateUSD = hourlyRateDA / config.blackMarketRates.USD;
    
    let verdict = "Low";
    if (hourlyRateUSD >= 20) {
        verdict = "Excellent";
    } else if (hourlyRateUSD >= 8) {
        verdict = "Good";
    }
    
    return {
        hourlyRateDA: Math.round(hourlyRateDA),
        hourlyRateUSD: parseFloat(hourlyRateUSD.toFixed(1)),
        verdict
    };
};

export const detectLanguages = (country) => {
    if (!country) return ["EN", "FR"];
    const c = country.toLowerCase();
    
    const arabCountries = ['algeria', 'saudi arabia', 'uae', 'qatar', 'jordan', 'morocco', 'tunisia', 'egypt', 'lebanon', 'kuwait', 'oman', 'bahrain'];
    const latamCountries = ['brazil', 'mexico', 'colombia', 'argentina', 'chile', 'peru', 'venezuela', 'ecuador', 'guatemala', 'cuba', 'bolivia', 'dominican republic', 'honduras', 'paraguay', 'el salvador', 'nicaragua', 'costa rica', 'panama', 'uruguay'];
    const englishOnly = ['usa', 'canada', 'australia', 'new zealand', 'uk', 'united kingdom', 'ireland'];
    
    if (arabCountries.includes(c)) return ["EN", "FR", "AR"];
    if (latamCountries.includes(c)) return ["EN", "ES"];
    if (englishOnly.includes(c)) return ["EN"];
    
    return ["EN", "FR"];
};
