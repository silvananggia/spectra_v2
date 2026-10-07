const PUBLISH_KEY = 'spectra.publishedByActivation';

const readAll = () => {
    try {
        const raw = sessionStorage.getItem(PUBLISH_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
        return {};
    }
};

export const loadPublishedIds = (activationKey) => {
    if (!activationKey) return [];
    const ids = readAll()[activationKey];
    return Array.isArray(ids) ? ids : [];
};

export const savePublishedIds = (activationKey, ids) => {
    if (!activationKey) return [];
    const unique = [...new Set(ids)];
    const next = { ...readAll(), [activationKey]: unique };
    sessionStorage.setItem(PUBLISH_KEY, JSON.stringify(next));
    return unique;
};
