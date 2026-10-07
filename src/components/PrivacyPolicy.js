import React, { useEffect, useState } from 'react';
import { useTranslation } from '../utils/i18n';
import pattern from '../assets/images/disclaimer/pattern.png';
import iconPerson from '../assets/images/privacy/icon-person.svg';
import iconGlobe from '../assets/images/privacy/icon-globe.svg';
import iconUsage from '../assets/images/privacy/icon-usage.svg';
import iconGeo from '../assets/images/privacy/icon-geo.svg';
import iconTeam from '../assets/images/privacy/icon-team.svg';
import iconJustice from '../assets/images/privacy/icon-justice.svg';
import iconProtect from '../assets/images/privacy/icon-protect.svg';
import iconPersonKey from '../assets/images/privacy/icon-person-key.svg';
import iconDenied from '../assets/images/privacy/icon-denied.svg';
import iconCorrection from '../assets/images/privacy/icon-correction.svg';
import iconFeedback from '../assets/images/privacy/icon-feedback.svg';
import iconDelete from '../assets/images/privacy/icon-delete.svg';
import './PrivacyPolicy.scss';

const TOC_ITEMS = [
    { id: 'pendahuluan', labelKey: 'privacy.toc1' },
    { id: 'informasi', labelKey: 'privacy.toc2' },
    { id: 'penggunaan', labelKey: 'privacy.toc3' },
    { id: 'perlindungan', labelKey: 'privacy.toc4' },
    { id: 'pembagian', labelKey: 'privacy.toc5' },
    { id: 'hak', labelKey: 'privacy.toc6' },
    { id: 'cookie', labelKey: 'privacy.toc7' },
    { id: 'perubahan', labelKey: 'privacy.toc8' },
    { id: 'kontak', labelKey: 'privacy.toc9' },
];

const COLLECTED_ITEMS = [
    { icon: iconPerson, titleKey: 'privacy.personalTitle', bodyKey: 'privacy.personalBody' },
    { icon: iconGlobe, titleKey: 'privacy.technicalTitle', bodyKey: 'privacy.technicalBody' },
    { icon: iconUsage, titleKey: 'privacy.usageTitle', bodyKey: 'privacy.usageBody' },
    { icon: iconGeo, titleKey: 'privacy.geoTitle', bodyKey: 'privacy.geoBody' },
];

const SHARE_ITEMS = [
    { icon: iconTeam, key: 'privacy.sharePartner' },
    { icon: iconJustice, key: 'privacy.shareLegal' },
    { icon: iconProtect, key: 'privacy.shareProtect' },
];

const RIGHTS_ITEMS = [
    { icon: iconPersonKey, key: 'privacy.rightAccess' },
    { icon: iconDenied, key: 'privacy.rightRefuse' },
    { icon: iconCorrection, key: 'privacy.rightCorrect' },
    { icon: iconFeedback, key: 'privacy.rightComplain' },
    { icon: iconDelete, key: 'privacy.rightDelete' },
];

const USE_ITEMS = [
    'privacy.useItem1',
    'privacy.useItem2',
    'privacy.useItem3',
    'privacy.useItem4',
    'privacy.useItem5',
];

const PrivacyIcon = ({ src }) => (
    <span className="privacy-icon">
        <img src={src} alt="" />
    </span>
);

const PrivacyPolicy = () => {
    const { t } = useTranslation();
    const [activeId, setActiveId] = useState('pendahuluan');

    useEffect(() => {
        const nodes = TOC_ITEMS
            .map((item) => document.getElementById(item.id))
            .filter(Boolean);

        if (!nodes.length) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

                if (visible[0]?.target?.id) {
                    setActiveId(visible[0].target.id);
                }
            },
            { rootMargin: '-120px 0px -55% 0px', threshold: 0.05 }
        );

        nodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, []);

    const handleTocClick = (event, id) => {
        event.preventDefault();
        const target = document.getElementById(id);
        if (!target) {
            return;
        }
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', `#${id}`);
        setActiveId(id);
    };

    return (
        <main className="privacy-page">
            <header className="privacy-hero">
                <img src={pattern} alt="" className="privacy-hero-pattern" />
                <div className="privacy-hero-copy">
                    <h1 id="privacy-title">{t('privacy.title')}</h1>
                    <p>{t('privacy.lastUpdated')}</p>
                </div>
            </header>

            <div className="privacy-layout">
                <article className="privacy-article" aria-labelledby="privacy-title">
                    <section id="pendahuluan" className="privacy-section">
                        <h2>{t('privacy.s1Title')}</h2>
                        <p>{t('privacy.s1Body')}</p>
                    </section>

                    <section id="informasi" className="privacy-section">
                        <h2>{t('privacy.s2Title')}</h2>
                        <ul className="privacy-detail-list">
                            {COLLECTED_ITEMS.map((item) => (
                                <li key={item.titleKey}>
                                    <PrivacyIcon src={item.icon} />
                                    <div>
                                        <strong>{t(item.titleKey)}</strong>
                                        <p>{t(item.bodyKey)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section id="penggunaan" className="privacy-section">
                        <h2>{t('privacy.s3Title')}</h2>
                        <div className="privacy-block">
                            <p>{t('privacy.s3Intro')}</p>
                            <ul className="privacy-bullets">
                                {USE_ITEMS.map((key) => (
                                    <li key={key}>{t(key)}</li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section id="perlindungan" className="privacy-section">
                        <h2>{t('privacy.s4Title')}</h2>
                        <p>{t('privacy.s4Body')}</p>
                    </section>

                    <section id="pembagian" className="privacy-section">
                        <h2>{t('privacy.s5Title')}</h2>
                        <div className="privacy-block">
                            <p>{t('privacy.s5Intro')}</p>
                            <ul className="privacy-icon-list">
                                {SHARE_ITEMS.map((item) => (
                                    <li key={item.key}>
                                        <PrivacyIcon src={item.icon} />
                                        <span>{t(item.key)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section id="hak" className="privacy-section">
                        <h2>{t('privacy.s6Title')}</h2>
                        <ul className="privacy-rights">
                            {RIGHTS_ITEMS.map((item) => (
                                <li key={item.key}>
                                    <PrivacyIcon src={item.icon} />
                                    <span>{t(item.key)}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section id="cookie" className="privacy-section">
                        <h2>{t('privacy.s7Title')}</h2>
                        <p>{t('privacy.s7Body')}</p>
                    </section>

                    <section id="perubahan" className="privacy-section">
                        <h2>{t('privacy.s8Title')}</h2>
                        <p>{t('privacy.s8Body')}</p>
                    </section>

                    <section id="kontak" className="privacy-section">
                        <h2>{t('privacy.s9Title')}</h2>
                        <p>{t('privacy.s9Body')}</p>
                    </section>
                </article>

                <nav className="privacy-toc" aria-label={t('privacy.tocLabel')}>
                    {TOC_ITEMS.map((item) => (
                        <a
                            key={item.id}
                            href={`#${item.id}`}
                            className={activeId === item.id ? 'is-active' : ''}
                            onClick={(event) => handleTocClick(event, item.id)}
                        >
                            {t(item.labelKey)}
                        </a>
                    ))}
                </nav>
            </div>
        </main>
    );
};

export default PrivacyPolicy;
