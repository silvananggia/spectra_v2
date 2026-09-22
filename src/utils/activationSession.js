const DRAFT_KEY = 'spectra.activationDraft';
const SESSION_KEY = 'spectra.activationSession';

export const INSTITUTION_BNPB = 'Badan Nasional Penanggulangan Bencana (BNPB)';

export const ACTIVATORS = [
    {
        id: 'nasipa',
        name: 'Nasipa Dangenak',
        position: 'Penata Penanggulangan Bencana',
        nip: '198808182014121015',
        contact: '082211987688',
        authCode: 'BNPB002',
    },
];

export const REGION_TREE = {
    'DKI Jakarta': {
        'Jakarta Utara': ['Koja', 'Cilincing', 'Tanjung Priok', 'Kelapa Gading', 'Pademangan'],
        'Jakarta Pusat': ['Gambir', 'Menteng', 'Sawah Besar'],
        'Jakarta Barat': ['Tambora', 'Grogol Petamburan'],
        'Jakarta Selatan': ['Kebayoran Baru', 'Tebet'],
        'Jakarta Timur': ['Cakung', 'Jatinegara'],
    },
    'Jawa Barat': {
        Bandung: ['Coblong', 'Sukajadi', 'Cicendo'],
        Bekasi: ['Bekasi Utara', 'Bekasi Selatan'],
    },
    Riau: {
        Pekanbaru: ['Sukajadi', 'Marpoyan Damai'],
        Bengkalis: ['Bengkalis', 'Mandau'],
    },
};

export const INDONESIA_CENTER = [118, -2.5];
export const INDONESIA_EXTENT = [95, -11, 141, 6];

export const REGION_EXTENTS = {
    'DKI Jakarta': [106.686, -6.374, 106.973, -6.089],
    'Jakarta Utara': [106.76, -6.175, 106.98, -6.087],
    'Jakarta Pusat': [106.79, -6.2, 106.88, -6.15],
    'Jakarta Barat': [106.68, -6.22, 106.8, -6.13],
    'Jakarta Selatan': [106.74, -6.35, 106.87, -6.22],
    'Jakarta Timur': [106.85, -6.3, 106.97, -6.17],
    'Jakarta Utara::Koja': [106.89, -6.135, 106.935, -6.1],
    'Jakarta Utara::Cilincing': [106.91, -6.155, 106.97, -6.09],
    'Jakarta Utara::Tanjung Priok': [106.85, -6.145, 106.9, -6.1],
    'Jakarta Utara::Kelapa Gading': [106.88, -6.175, 106.92, -6.145],
    'Jakarta Utara::Pademangan': [106.82, -6.15, 106.86, -6.115],
    'Jakarta Pusat::Gambir': [106.81, -6.185, 106.835, -6.16],
    'Jakarta Pusat::Menteng': [106.83, -6.205, 106.85, -6.185],
    'Jakarta Pusat::Sawah Besar': [106.82, -6.17, 106.845, -6.145],
    'Jakarta Barat::Tambora': [106.79, -6.16, 106.82, -6.135],
    'Jakarta Barat::Grogol Petamburan': [106.77, -6.18, 106.8, -6.155],
    'Jakarta Selatan::Kebayoran Baru': [106.78, -6.255, 106.82, -6.23],
    'Jakarta Selatan::Tebet': [106.84, -6.245, 106.87, -6.22],
    'Jakarta Timur::Cakung': [106.92, -6.205, 106.97, -6.165],
    'Jakarta Timur::Jatinegara': [106.86, -6.235, 106.89, -6.205],
    'Jawa Barat': [106.36, -7.83, 108.78, -5.93],
    Bandung: [107.55, -6.98, 107.73, -6.84],
    'Bandung::Coblong': [107.6, -6.9, 107.63, -6.86],
    'Bandung::Sukajadi': [107.58, -6.9, 107.61, -6.87],
    'Bandung::Cicendo': [107.57, -6.92, 107.61, -6.89],
    Bekasi: [106.94, -6.32, 107.08, -6.18],
    'Bekasi::Bekasi Utara': [106.97, -6.24, 107.04, -6.18],
    'Bekasi::Bekasi Selatan': [106.97, -6.3, 107.04, -6.25],
    Riau: [100.02, -1.08, 103.55, 2.55],
    Pekanbaru: [101.38, 0.44, 101.55, 0.58],
    'Pekanbaru::Sukajadi': [101.42, 0.5, 101.46, 0.54],
    'Pekanbaru::Marpoyan Damai': [101.43, 0.46, 101.48, 0.5],
    Bengkalis: [102.07, 1.45, 102.15, 1.52],
    'Bengkalis::Bengkalis': [102.07, 1.45, 102.15, 1.52],
    'Bengkalis::Mandau': [101.15, 1.2, 101.35, 1.4],
};

export const resolveRegionExtent = (province, cities = []) => {
    const lastCity = [...cities].reverse().find((item) => item.city);
    const lastDistrict = lastCity?.districts?.filter(Boolean).slice(-1)[0];
    if (lastCity?.city && lastDistrict) {
        const districtExtent = REGION_EXTENTS[`${lastCity.city}::${lastDistrict}`];
        if (districtExtent) return districtExtent;
    }
    if (lastCity?.city && REGION_EXTENTS[lastCity.city]) return REGION_EXTENTS[lastCity.city];
    if (province && REGION_EXTENTS[province]) return REGION_EXTENTS[province];
    return INDONESIA_EXTENT;
};

export const NEEDED_INFO = [
    { id: 'fieldPhoto', labelKey: 'activation.needed.fieldPhoto' },
    { id: 'fieldNeeds', labelKey: 'activation.needed.fieldNeeds' },
    { id: 'fieldUpdate', labelKey: 'activation.needed.fieldUpdate' },
    { id: 'hiresImage', labelKey: 'activation.needed.hiresImage' },
];

export const EMPTY_FORM = {
    institution: INSTITUTION_BNPB,
    activatorId: '',
    activatorName: '',
    position: '',
    nip: '',
    contact: '',
    authCode: '',
    category: '',
    title: '',
    description: '',
    startDate: '',
    duration: '',
    severity: '',
    needed: [],
    province: '',
    cities: [{ city: '', districts: [''] }],
    aoiExtent: null,
    aoiManual: false,
};

const readJson = (key) => {
    try {
        const raw = sessionStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
};

export const loadDraft = () => readJson(DRAFT_KEY);
export const saveDraft = (form) => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
};
export const clearDraft = () => sessionStorage.removeItem(DRAFT_KEY);

export const loadSession = () => readJson(SESSION_KEY);
export const saveSession = (session) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    sessionStorage.removeItem(DRAFT_KEY);
};
export const clearSession = () => sessionStorage.removeItem(SESSION_KEY);

export const applyActivator = (form, activatorId) => {
    const activator = ACTIVATORS.find((item) => item.id === activatorId);
    if (!activator) {
        return {
            ...form,
            activatorId: '',
            activatorName: '',
            position: '',
            nip: '',
            contact: '',
            authCode: '',
        };
    }

    return {
        ...form,
        activatorId: activator.id,
        activatorName: activator.name,
        position: activator.position,
        nip: activator.nip,
        contact: activator.contact,
        authCode: activator.authCode,
    };
};

export const buildSessionId = (category, startDate) => {
    const prefix = {
        banjir: 'BJR',
        longsor: 'LGS',
        kekeringan: 'KRG',
        kebakaran: 'KHL',
    }[category] || 'SSN';
    const stamp = (startDate || '').replace(/-/g, '').slice(-4) || String(Date.now()).slice(-4);
    return `${prefix}${stamp}`;
};
