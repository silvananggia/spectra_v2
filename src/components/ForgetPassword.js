import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';
import logoSpectra from '../assets/images/login/logo-spectra.png';
import patternA from '../assets/images/login/pattern-a.png';
import patternB from '../assets/images/login/pattern-b.png';
import mailFloor from '../assets/images/forgot-password/mail-floor.svg';
import mailShadow from '../assets/images/forgot-password/mail-shadow.svg';
import mailPaperPlanes from '../assets/images/forgot-password/mail-paper-planes.svg';
import mailMailbox from '../assets/images/forgot-password/mail-mailbox.svg';
import mailPlants from '../assets/images/forgot-password/mail-plants.svg';
import mailEnvelopes from '../assets/images/forgot-password/mail-envelopes.svg';
import mailNotifications from '../assets/images/forgot-password/mail-notifications.svg';
import mailCharacter from '../assets/images/forgot-password/mail-character.svg';
import iconCheck from '../assets/images/forgot-password/icon-check.svg';
import './ForgetPassword.scss';

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

const MAIL_LAYERS = [
    { name: 'floor', src: mailFloor, left: 0, top: 74.34, boxWidth: 309.02, boxHeight: 183.71, width: 309.086, height: 161.474 },
    { name: 'shadow', src: mailShadow, left: 179.42, top: 175.62, boxWidth: 72.72, boxHeight: 47.72, width: 72.697, height: 41.971 },
    { name: 'planes', src: mailPaperPlanes, left: 11.52, top: 7.99, boxWidth: 308.45, boxHeight: 114.38, width: 308.498, height: 100.482 },
    { name: 'mailbox', src: mailMailbox, left: 233.42, top: 32.36, boxWidth: 40.18, boxHeight: 77.01, width: 40.179, height: 67.698 },
    { name: 'plants', src: mailPlants, left: 12.38, top: 83.56, boxWidth: 237.89, boxHeight: 112.74, width: 237.83, height: 99.123 },
    { name: 'envelopes', src: mailEnvelopes, left: 35.28, top: 0, boxWidth: 191.95, boxHeight: 210.02, width: 191.918, height: 184.636 },
    { name: 'notifications', src: mailNotifications, left: 48.67, top: 90.52, boxWidth: 33.41, boxHeight: 43.52, width: 33.373, height: 38.236 },
    { name: 'character', src: mailCharacter, left: 186.77, top: 111.31, boxWidth: 59.62, boxHeight: 123.6, width: 59.65, height: 108.65 },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
    { id: 'length', test: (value) => value.length >= 6, labelKey: 'forgotPassword.ruleLength' },
    { id: 'upper', test: (value) => /[A-Z]/.test(value), labelKey: 'forgotPassword.ruleUpper' },
    { id: 'number', test: (value) => /\d/.test(value), labelKey: 'forgotPassword.ruleNumber' },
    { id: 'symbol', test: (value) => /[^A-Za-z0-9]/.test(value), labelKey: 'forgotPassword.ruleSymbol' },
];

const PatternCluster = ({ tiles, rotation, className, flipY = false }) => (
    <div className={`forgot-ornament ${className}`} aria-hidden="true">
        {tiles.map((tile, index) => {
            const asset = PATTERN[tile.variant];
            const transform = flipY
                ? `scaleY(-1) rotate(${rotation}deg)`
                : `rotate(${rotation}deg)`;

            return (
                <div
                    key={`${className}-${index}`}
                    className={`forgot-pattern-wrap forgot-pattern-wrap--${tile.variant}`}
                    style={{ left: tile.left, top: tile.top }}
                >
                    <div className="forgot-pattern-rotator" style={{ transform }}>
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

const MailSentIllustration = () => (
    <div className="forgot-mail" aria-hidden="true">
        {MAIL_LAYERS.map((layer) => (
            <div
                key={layer.name}
                className={`forgot-mail-layer forgot-mail-layer--${layer.name}`}
                style={{
                    left: layer.left,
                    top: layer.top,
                    width: layer.boxWidth,
                    height: layer.boxHeight,
                }}
            >
                <img
                    src={layer.src}
                    alt=""
                    width={layer.width}
                    height={layer.height}
                    style={{ width: layer.width, height: layer.height }}
                />
            </div>
        ))}
    </div>
);

const ForgetPassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const isResetLink = location.pathname.endsWith('/reset') || searchParams.has('token');

    const [step, setStep] = useState(isResetLink ? 'new-password' : 'email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        setStep(isResetLink ? 'new-password' : 'email');
    }, [isResetLink]);

    const canSendLink = EMAIL_PATTERN.test(email.trim());
    const ruleStates = useMemo(
        () => PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) })),
        [password]
    );
    const allRulesMet = ruleStates.every((rule) => rule.met);
    const canResetPassword = allRulesMet && confirmPassword.length > 0 && password === confirmPassword;

    const handleSendLink = (event) => {
        event.preventDefault();
        if (!canSendLink) return;
        setStep('sent');
    };

    const handleResetPassword = (event) => {
        event.preventDefault();
        if (!canResetPassword) return;
        setStep('success');
    };

    const goToLogin = () => navigate('/login');

    return (
        <main className="forgot-page">
            <PatternCluster
                className="forgot-ornament--bl"
                tiles={BOTTOM_LEFT_TILES}
                rotation={-30.92}
            />
            <PatternCluster
                className="forgot-ornament--br"
                tiles={TOP_RIGHT_TILES}
                rotation={-149.08}
                flipY
            />

            <section className={`forgot-card forgot-card--${step}`}>
                {step === 'email' && (
                    <form className="forgot-form" onSubmit={handleSendLink}>
                        <div className="forgot-form-stack">
                            <Link to="/" className="forgot-logo-link">
                                <img
                                    src={logoSpectra}
                                    alt="SPECTRA"
                                    className="forgot-logo"
                                    width={184}
                                    height={38}
                                />
                            </Link>

                            <div className="forgot-form-block">
                                <div className="forgot-form-header">
                                    <h1>{t('forgotPassword.title')}</h1>
                                    <p>{t('forgotPassword.subtitle')}</p>
                                </div>

                                <div className="forgot-form-fields">
                                    <label className="forgot-field">
                                        <span>{t('forgotPassword.emailLabel')}</span>
                                        <input
                                            type="email"
                                            name="email"
                                            autoComplete="email"
                                            placeholder={t('forgotPassword.emailPlaceholder')}
                                            value={email}
                                            onChange={(event) => setEmail(event.target.value)}
                                        />
                                        <span className="forgot-field-hint">
                                            {t('forgotPassword.emailHint')}
                                        </span>
                                    </label>
                                    <button
                                        type="submit"
                                        className="forgot-submit"
                                        disabled={!canSendLink}
                                    >
                                        {t('forgotPassword.sendLink')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Link to="/login" className="forgot-back-link">
                            {t('forgotPassword.backToLoginLink')}
                        </Link>
                    </form>
                )}

                {step === 'sent' && (
                    <div className="forgot-status">
                        <MailSentIllustration />
                        <div className="forgot-status-copy">
                            <h1>{t('forgotPassword.sentTitle')}</h1>
                            <p>{t('forgotPassword.sentBody')}</p>
                        </div>
                        <button type="button" className="forgot-submit is-primary" onClick={goToLogin}>
                            {t('forgotPassword.backToLogin')}
                        </button>
                    </div>
                )}

                {step === 'new-password' && (
                    <form className="forgot-form forgot-form--reset" onSubmit={handleResetPassword}>
                        <div className="forgot-form-block">
                            <div className="forgot-form-header">
                                <h1>{t('forgotPassword.newTitle')}</h1>
                                <p>{t('forgotPassword.newSubtitle')}</p>
                            </div>

                            <div className="forgot-form-fields">
                                <div className="forgot-password-group">
                                    <label className="forgot-field">
                                        <span>{t('forgotPassword.passwordLabel')}</span>
                                        <input
                                            type="password"
                                            name="new-password"
                                            autoComplete="new-password"
                                            placeholder={t('forgotPassword.passwordPlaceholder')}
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                        />
                                    </label>
                                    <div className="forgot-rules">
                                        <p>{t('forgotPassword.rulesIntro')}</p>
                                        <ul>
                                            {ruleStates.map((rule) => (
                                                <li
                                                    key={rule.id}
                                                    className={rule.met ? 'is-met' : ''}
                                                >
                                                    <span>{t(rule.labelKey)}</span>
                                                    {rule.met && (
                                                        <span className="forgot-rule-icon">
                                                            <img
                                                                src={iconCheck}
                                                                alt=""
                                                                width={24}
                                                                height={24}
                                                            />
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <label className="forgot-field">
                                    <span>{t('forgotPassword.confirmLabel')}</span>
                                    <input
                                        type="password"
                                        name="confirm-password"
                                        autoComplete="new-password"
                                        placeholder={t('forgotPassword.confirmPlaceholder')}
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                    />
                                </label>

                                <button
                                    type="submit"
                                    className="forgot-submit"
                                    disabled={!canResetPassword}
                                >
                                    {t('forgotPassword.resetSubmit')}
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {step === 'success' && (
                    <div className="forgot-status forgot-status--success">
                        <div className="forgot-status-copy">
                            <h1>{t('forgotPassword.successTitle')}</h1>
                            <p>{t('forgotPassword.successBody')}</p>
                        </div>
                        <button type="button" className="forgot-submit is-primary" onClick={goToLogin}>
                            {t('forgotPassword.backToLogin')}
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
};

export default ForgetPassword;
