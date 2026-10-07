import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';
import pattern from '../assets/images/disclaimer/pattern.png';
import iconResearch from '../assets/images/disclaimer/icon-research.svg';
import iconEducation from '../assets/images/disclaimer/icon-education.svg';
import iconVolcano from '../assets/images/disclaimer/icon-volcano.svg';
import iconHelp from '../assets/images/disclaimer/icon-help.svg';
import iconPaper from '../assets/images/disclaimer/icon-paper.svg';
import iconCommercial from '../assets/images/disclaimer/icon-commercial.svg';
import iconCriminal from '../assets/images/disclaimer/icon-criminal.svg';
import iconRedistribute from '../assets/images/disclaimer/icon-redistribute.svg';
import iconModify from '../assets/images/disclaimer/icon-modify.svg';
import iconMilitary from '../assets/images/disclaimer/icon-military.svg';
import iconEmail from '../assets/images/disclaimer/icon-email.svg';
import iconContact from '../assets/images/disclaimer/icon-contact.svg';
import iconWarn from '../assets/images/disclaimer/icon-warn.svg';
import iconCopy from '../assets/images/disclaimer/icon-copy.svg';
import './Disclaimer.scss';

const REPORT_EMAIL = 'prgi@brin.go.id';

const TOC_ITEMS = [
    { id: 'tujuan', labelKey: 'disclaimer.toc1' },
    { id: 'ketentuan', labelKey: 'disclaimer.toc2' },
    { id: 'ketentuan-diizinkan', labelKey: 'disclaimer.toc21', nested: true },
    { id: 'ketentuan-dilarang', labelKey: 'disclaimer.toc22', nested: true },
    { id: 'atribusi', labelKey: 'disclaimer.toc3' },
    { id: 'akurasi', labelKey: 'disclaimer.toc4' },
    { id: 'akurasi-jaminan', labelKey: 'disclaimer.toc41', nested: true },
    { id: 'akurasi-teknis', labelKey: 'disclaimer.toc42', nested: true },
    { id: 'tanggung-jawab', labelKey: 'disclaimer.toc5' },
    { id: 'hki', labelKey: 'disclaimer.toc6' },
    { id: 'mitra', labelKey: 'disclaimer.toc7' },
    { id: 'pelaporan', labelKey: 'disclaimer.toc8' },
    { id: 'perubahan', labelKey: 'disclaimer.toc9' },
    { id: 'hukum', labelKey: 'disclaimer.toc10' },
];

const ALLOWED_USES = [
    { icon: iconResearch, key: 'disclaimer.allowedResearch' },
    { icon: iconEducation, key: 'disclaimer.allowedEducation' },
    { icon: iconVolcano, key: 'disclaimer.allowedMitigation' },
    { icon: iconHelp, key: 'disclaimer.allowedHumanitarian' },
    { icon: iconPaper, key: 'disclaimer.allowedPublication' },
];

const PROHIBITED_USES = [
    { icon: iconCommercial, key: 'disclaimer.prohibitedCommercial' },
    { icon: iconCriminal, key: 'disclaimer.prohibitedIllegal' },
    { icon: iconRedistribute, key: 'disclaimer.prohibitedRedistribute' },
    { icon: iconModify, key: 'disclaimer.prohibitedModify' },
    { icon: iconMilitary, key: 'disclaimer.prohibitedMilitary' },
];

const SOURCE_FIELDS = [
    { labelKey: 'disclaimer.sourceLabel', valueKey: 'disclaimer.sourceValue' },
    { labelKey: 'disclaimer.attributionLabel', valueKey: 'disclaimer.attributionValue' },
    { labelKey: 'disclaimer.accessDateLabel', valueKey: 'disclaimer.accessDateValue' },
    { labelKey: 'disclaimer.sourceUrlLabel', valueKey: 'disclaimer.sourceUrlValue' },
];

const ACCURACY_ITEMS = [
    'disclaimer.accuracyItem1',
    'disclaimer.accuracyItem2',
    'disclaimer.accuracyItem3',
];

const TECHNICAL_ITEMS = [
    'disclaimer.technicalItem1',
    'disclaimer.technicalItem2',
    'disclaimer.technicalItem3',
    'disclaimer.technicalItem4',
];

const LIABILITY_ITEMS = [
    'disclaimer.liabilityItem1',
    'disclaimer.liabilityItem2',
    'disclaimer.liabilityItem3',
    'disclaimer.liabilityItem4',
];

const Disclaimer = () => {
    const { t } = useTranslation();
    const [activeId, setActiveId] = useState('tujuan');
    const [copied, setCopied] = useState(false);

    const attributionSample = t('disclaimer.attributionSample');

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

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(attributionSample);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <main className="disclaimer-page">
            <header className="disclaimer-hero">
                <img src={pattern} alt="" className="disclaimer-hero-pattern" />
                <div className="disclaimer-hero-copy">
                    <h1 id="disclaimer-title">{t('disclaimer.title')}</h1>
                    <p>{t('disclaimer.lastUpdated')}</p>
                </div>
            </header>

            <div className="disclaimer-layout">
                <article className="disclaimer-article" aria-labelledby="disclaimer-title">
                    <section id="tujuan" className="disclaimer-section">
                        <h2>{t('disclaimer.s1Title')}</h2>
                        <p>{t('disclaimer.s1Body')}</p>
                    </section>

                    <section id="ketentuan" className="disclaimer-section">
                        <h2>{t('disclaimer.s2Title')}</h2>

                        <div id="ketentuan-diizinkan" className="disclaimer-block">
                            <h3>{t('disclaimer.s21Title')}</h3>
                            <ul className="disclaimer-icon-list">
                                {ALLOWED_USES.map((item) => (
                                    <li key={item.key}>
                                        <img src={item.icon} alt="" />
                                        <span>{t(item.key)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div id="ketentuan-dilarang" className="disclaimer-block">
                            <h3>{t('disclaimer.s22Title')}</h3>
                            <ul className="disclaimer-icon-list">
                                {PROHIBITED_USES.map((item) => (
                                    <li key={item.key}>
                                        <img src={item.icon} alt="" />
                                        <span>{t(item.key)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section id="atribusi" className="disclaimer-section">
                        <h2>{t('disclaimer.s3Title')}</h2>
                        <p>{t('disclaimer.s3Body')}</p>
                        <div className="disclaimer-source-card">
                            {SOURCE_FIELDS.map((field) => (
                                <p key={field.labelKey}>
                                    <strong>{t(field.labelKey)}</strong> {t(field.valueKey)}
                                </p>
                            ))}
                        </div>
                        <div className="disclaimer-example-card">
                            <div className="disclaimer-example-head">
                                <p>{t('disclaimer.exampleTitle')}</p>
                                <button
                                    type="button"
                                    className="disclaimer-copy"
                                    onClick={handleCopy}
                                    aria-label={t('disclaimer.copyAria')}
                                >
                                    <img src={iconCopy} alt="" width={16} height={16} />
                                </button>
                            </div>
                            <p>{copied ? t('disclaimer.copied') : `“${attributionSample}”`}</p>
                        </div>
                    </section>

                    <section id="akurasi" className="disclaimer-section">
                        <h2>{t('disclaimer.s4Title')}</h2>
                        <div id="akurasi-jaminan" className="disclaimer-block">
                            <h3>{t('disclaimer.s41Title')}</h3>
                            <p>{t('disclaimer.s41Body')}</p>
                            <ul className="disclaimer-bullets">
                                {ACCURACY_ITEMS.map((key) => (
                                    <li key={key}>{t(key)}</li>
                                ))}
                            </ul>
                        </div>
                        <div id="akurasi-teknis" className="disclaimer-block">
                            <h3>{t('disclaimer.s42Title')}</h3>
                            <p>{t('disclaimer.s42Body')}</p>
                            <ul className="disclaimer-bullets">
                                {TECHNICAL_ITEMS.map((key) => (
                                    <li key={key}>{t(key)}</li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section id="tanggung-jawab" className="disclaimer-section">
                        <h2>{t('disclaimer.s5Title')}</h2>
                        <p>{t('disclaimer.s5Body')}</p>
                        <ul className="disclaimer-bullets">
                            {LIABILITY_ITEMS.map((key) => (
                                <li key={key}>{t(key)}</li>
                            ))}
                        </ul>
                    </section>

                    <section id="hki" className="disclaimer-section">
                        <h2>{t('disclaimer.s6Title')}</h2>
                        <p>{t('disclaimer.s6Body')}</p>
                    </section>

                    <section id="mitra" className="disclaimer-section">
                        <h2>{t('disclaimer.s7Title')}</h2>
                        <p>
                            {t('disclaimer.s7BodyStart')}<strong>{t('disclaimer.s7Partners')}</strong>{t('disclaimer.s7BodyEnd')}
                        </p>
                    </section>

                    <section id="pelaporan" className="disclaimer-section">
                        <h2>{t('disclaimer.s8Title')}</h2>
                        <p>{t('disclaimer.s8Intro')}</p>
                        <ul className="disclaimer-icon-list">
                            <li>
                                <img src={iconEmail} alt="" />
                                <a href={`mailto:${REPORT_EMAIL}`}>{REPORT_EMAIL}</a>
                            </li>
                            <li>
                                <img src={iconContact} alt="" />
                                <span>
                                    <Link to="/contact">{t('disclaimer.contactPageLink')}</Link>
                                    {t('disclaimer.contactPageRest')}
                                </span>
                            </li>
                        </ul>
                        <p>{t('disclaimer.s8Outro')}</p>
                    </section>

                    <section id="perubahan" className="disclaimer-section">
                        <h2>{t('disclaimer.s9Title')}</h2>
                        <p>{t('disclaimer.s9Body')}</p>
                    </section>

                    <section id="hukum" className="disclaimer-section">
                        <h2>{t('disclaimer.s10Title')}</h2>
                        <p>{t('disclaimer.s10Body')}</p>
                    </section>

                    <aside className="disclaimer-warning" role="note">
                        <div className="disclaimer-warning-head">
                            <img src={iconWarn} alt="" width={24} height={24} />
                            <p>{t('disclaimer.warningTitle')}</p>
                        </div>
                        <p>{t('disclaimer.warningBody')}</p>
                    </aside>
                </article>

                <nav className="disclaimer-toc" aria-label={t('disclaimer.tocLabel')}>
                    {TOC_ITEMS.map((item) => (
                        <a
                            key={item.id}
                            href={`#${item.id}`}
                            className={`${item.nested ? 'is-nested' : ''}${activeId === item.id ? ' is-active' : ''}`}
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

export default Disclaimer;
