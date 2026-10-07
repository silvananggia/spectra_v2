const AUTH_KEY = 'spectra.auth';

export const ROLE_STAKEHOLDER = 'stakeholder';
export const ROLE_CONTRIBUTOR = 'contributor';

const readAuth = () => {
    try {
        const raw = sessionStorage.getItem(AUTH_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
};

export const loadAuth = () => readAuth();

export const saveAuth = (session) => {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
};

export const clearAuth = () => {
    sessionStorage.removeItem(AUTH_KEY);
};

export const landingPath = (role) =>
    role === ROLE_CONTRIBUTOR ? '/contributor' : '/stakeholder';
