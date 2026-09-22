import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLanguage } from '../redux/slices/language';
import { loginSuccess } from '../redux/slices/auth';
import { ROLE_CONTRIBUTOR, ROLE_STAKEHOLDER, landingPath } from '../utils/authSession';
import { useTranslation } from '../utils/i18n';
import logoSpectra from '../assets/images/login/logo-spectra.png';
import patternA from '../assets/images/login/pattern-a.png';
import patternB from '../assets/images/login/pattern-b.png';
import iconGlobe from '../assets/images/login/icon-globe.svg';
import './Login.scss';

const PATTERN = {
    a: { src: patternA, width: 65, height: 74 },
    b: { src: patternB, width: 60, height: 74 },
};

const TR_STEP = { x: 51.76, y: -30.83 };
const BL_STEP = { x: -51.47, y: 30.83 };

const buildRow = (startX, startY, count, step) =>
    Array.from({ length: count }, (_, index) => ({
        variant: index === 0 ? 'a' : 'b',
        left: startX + index * step.x,
        top: startY + index * step.y,
    }));

const TOP_RIGHT_TILES = [
    ...buildRow(0, 154.16, 6, TR_STEP),
    ...buildRow(186, 221.16, 6, TR_STEP),
    ...buildRow(186, 312.16, 6, TR_STEP),
    ...buildRow(186, 403.16, 6, TR_STEP),
    ...buildRow(287, 431.16, 6, TR_STEP),
    ...buildRow(70, 204.16, 6, TR_STEP),
];

const BOTTOM_LEFT_TILES = [
    ...buildRow(123.36, 0, 3, BL_STEP),
    ...buildRow(188.36, 47, 4, BL_STEP),
    ...buildRow(257.36, 96, 6, BL_STEP),
    ...buildRow(205.89, 129.4, 5, BL_STEP),
    ...buildRow(154.42, 160.23, 4, BL_STEP),
];

const PatternCluster = ({ tiles, rotation, className }) => (
    <div className={`login-ornament ${className}`} aria-hidden="true">
        {tiles.map((tile, index) => {
            const asset = PATTERN[tile.variant];
            return (
                <div
                    key={`${className}-${index}`}
                    className={`login-pattern-wrap login-pattern-wrap--${tile.variant}`}
                    style={{ left: tile.left, top: tile.top }}
                >
                    <div className="login-pattern-rotator" style={{ transform: `rotate(${rotation}deg)` }}>
                        <img
                            src={asset.src}
                            alt=""
                            width={asset.width}
                            height={asset.height}
                        />
                    </div>
                </div>
            );
        })}
    </div>
);

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t, currentLanguage } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');

    const canSubmit = username.trim().length > 0 && password.length > 0 && Boolean(role);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!canSubmit) return;
        dispatch(
            loginSuccess({
                user: { username: username.trim() },
                role,
            })
        );
        navigate(landingPath(role));
    };

    return (
        <main className="login-page">
            <PatternCluster
                className="login-ornament--tr"
                tiles={TOP_RIGHT_TILES}
                rotation={149.08}
            />
            <PatternCluster
                className="login-ornament--bl"
                tiles={BOTTOM_LEFT_TILES}
                rotation={-30.92}
            />

            <div className="login-lang" role="group" aria-label={t('login.language')}>
                <span className="login-lang-icon">
                    <img src={iconGlobe} alt="" width={20} height={20} />
                </span>
                <div className="login-lang-options">
                    <button
                        type="button"
                        className={currentLanguage === 'id' ? 'is-active' : ''}
                        onClick={() => dispatch(setLanguage('id'))}
                    >
                        ID
                    </button>
                    <span className="login-lang-divider">|</span>
                    <button
                        type="button"
                        className={currentLanguage === 'en' ? 'is-active' : ''}
                        onClick={() => dispatch(setLanguage('en'))}
                    >
                        EN
                    </button>
                </div>
            </div>

            <div className="login-body">
                <section className="login-promo">
                    <div className="login-promo-inner">
                        <Link to="/" className="login-logo-link">
                            <img
                                src={logoSpectra}
                                alt="SPECTRA"
                                className="login-logo"
                                width={184}
                                height={38}
                            />
                        </Link>
                        <div className="login-promo-copy">
                            <h1>{t('login.promoTitle')}</h1>
                            <p>{t('login.promoBody')}</p>
                        </div>
                        <Link to="/contact" className="login-contact-btn">
                            {t('login.contact')}
                        </Link>
                    </div>
                </section>

                <section className="login-card">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-form-header">
                            <h2>{t('login.welcome')}</h2>
                            <p>{t('login.subtitle')}</p>
                        </div>

                        <div className="login-form-fields">
                            <label className="login-field">
                                <span>{t('login.usernameLabel')}</span>
                                <input
                                    type="text"
                                    name="username"
                                    autoComplete="username"
                                    placeholder={t('login.usernamePlaceholder')}
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                />
                            </label>
                            <label className="login-field">
                                <span>{t('login.passwordLabel')}</span>
                                <input
                                    type="password"
                                    name="password"
                                    autoComplete="current-password"
                                    placeholder={t('login.passwordPlaceholder')}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                />
                            </label>
                            <fieldset className="login-role">
                                <legend>{t('login.roleLabel')}</legend>
                                <div className="login-role-options">
                                    <button
                                        type="button"
                                        className={role === ROLE_STAKEHOLDER ? 'is-active' : ''}
                                        onClick={() => setRole(ROLE_STAKEHOLDER)}
                                    >
                                        {t('login.roleStakeholder')}
                                    </button>
                                    <button
                                        type="button"
                                        className={role === ROLE_CONTRIBUTOR ? 'is-active' : ''}
                                        onClick={() => setRole(ROLE_CONTRIBUTOR)}
                                    >
                                        {t('login.roleContributor')}
                                    </button>
                                </div>
                            </fieldset>
                            <button
                                type="submit"
                                className="login-submit"
                                disabled={!canSubmit}
                            >
                                {t('login.submit')}
                            </button>
                            <Link to="/forgot-password" className="login-forgot">
                                {t('login.forgot')}
                            </Link>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
};

export default Login;
