import React from 'react';
import { useTranslation } from '../utils/i18n';
import heroPhoto from '../assets/images/contact/hero.png';
import pattern from '../assets/images/contact/pattern.png';
import officeMap from '../assets/images/contact/map.png';
import iconLocation from '../assets/images/contact/icon-location.svg';
import './Contact.scss';

const SERVICES = [
    { titleKey: 'contact.technicalSupport', bodyKey: 'contact.technicalSupportBody' },
    { titleKey: 'contact.training', bodyKey: 'contact.trainingBody' },
    { titleKey: 'contact.dataAccess', bodyKey: 'contact.dataAccessBody' },
    { titleKey: 'contact.collaboration', bodyKey: 'contact.collaborationBody' },
];

const EMAILS = ['yenn004@brin.go.id', 'indonesia_rso_unspider@brin.go.id'];

const Contact = () => {
    const { t } = useTranslation();

    return (
        <main className="contact-page">
            <section className="contact-hero" aria-labelledby="contact-title">
                <div className="contact-hero-media" aria-hidden="true">
                    <img src={heroPhoto} alt="" className="contact-hero-photo" />
                    <div className="contact-hero-overlay" />
                    <img src={pattern} alt="" className="contact-hero-pattern contact-hero-pattern--bottom" />
                    <div className="contact-hero-pattern contact-hero-pattern--top">
                        <img src={pattern} alt="" />
                    </div>
                </div>

                <div className="contact-hero-copy">
                    <div className="contact-hero-intro">
                        <h1 id="contact-title">{t('contact.title')}</h1>
                        <p>{t('contact.intro')}</p>
                    </div>

                    <div className="contact-hero-details">
                        <div>
                            <p className="contact-label">{t('contact.contactPerson')}</p>
                            <p className="contact-value">{t('contact.personName')}</p>
                        </div>
                        <div>
                            <p className="contact-label">{t('contact.email')}</p>
                            <p className="contact-value contact-emails">
                                {EMAILS.map((email) => (
                                    <a key={email} href={`mailto:${email}`}>
                                        {email}
                                    </a>
                                ))}
                            </p>
                        </div>
                    </div>

                    <div className="contact-hours-block">
                        <div className="contact-hours">
                            <p className="contact-hours-title">{t('contact.operatingHours')}</p>
                            <p>
                                {t('contact.hoursWeekday')}
                                <br />
                                {t('contact.hoursWeekend')}
                            </p>
                        </div>
                        <p className="contact-hours-note">{t('contact.urgentNote')}</p>
                    </div>
                </div>
            </section>

            <section className="contact-services" aria-labelledby="contact-services-title">
                <h2 id="contact-services-title">{t('contact.availableServices')}</h2>
                <div className="contact-services-grid">
                    {SERVICES.map((item) => (
                        <article key={item.titleKey} className="contact-service-card">
                            <h3>{t(item.titleKey)}</h3>
                            <p>{t(item.bodyKey)}</p>
                        </article>
                    ))}
                </div>
            </section>

            <div className="contact-stripe" aria-hidden="true" />

            <section className="contact-office" aria-labelledby="contact-office-title">
                <div className="contact-office-map">
                    <img src={officeMap} alt={t('contact.officeMapAlt')} />
                </div>
                <div className="contact-office-copy">
                    <div className="contact-office-heading">
                        <h2 id="contact-office-title">{t('contact.officeTitle')}</h2>
                        <p>{t('contact.officeCampus')}</p>
                    </div>
                    <div className="contact-office-address">
                        <img src={iconLocation} alt="" width={24} height={24} />
                        <div>
                            <p className="contact-office-building">{t('contact.officeBuilding')}</p>
                            <p>
                                {t('contact.officeStreet')}
                                <br />
                                {t('contact.officeCity')}
                                <br />
                                {t('contact.officeCountry')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Contact;
