import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';
import DashboardLayout, { IconBox } from './DashboardLayout';
import { clearSession, loadSession } from '../utils/activationSession';
import iconHelp from '../assets/images/dashboard/icon-help.svg';
import iconReportDoc from '../assets/images/dashboard/icon-report-doc.svg';
import iconBinders from '../assets/images/dashboard/icon-binders.svg';
import iconCalendar from '../assets/images/activation/icon-calendar.svg';
import iconHourglass from '../assets/images/activation/icon-hourglass.svg';
import iconSeverity from '../assets/images/activation/icon-severity.svg';
import iconActivator from '../assets/images/activation/icon-activator.svg';
import iconPendingLeaf from '../assets/images/activation/icon-pending-leaf.svg';
import iconAnnounce from '../assets/images/activation/icon-announce.svg';
import iconHistory from '../assets/images/activation/icon-history.svg';
import iconData from '../assets/images/activation/icon-data.svg';
import iconLatestReport from '../assets/images/activation/icon-latest-report.svg';
import iconInfoSession from '../assets/images/activation/icon-info-session.svg';
import iconEdit from '../assets/images/activation/icon-edit.svg';
import iconClose from '../assets/images/activation/icon-close.svg';
import './ActivationDashboard.scss';

const COLLECTED = [
    { id: 'fieldPhoto', labelKey: 'activationDashboard.collectedPhoto' },
    { id: 'fieldNeeds', labelKey: 'activationDashboard.collectedNeeds' },
    { id: 'fieldUpdate', labelKey: 'activationDashboard.collectedUpdate' },
    { id: 'hiresImage', labelKey: 'activationDashboard.collectedHires' },
];

const formatDate = (value) => {
    if (!value) return '—';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
};

const MetaItem = ({ icon, box = 18, leaf = 18, iconClass = '', label, value, valueClass = '' }) => (
    <div className="adash-meta">
        <div className="adash-meta-label">
            <span className={`adash-icon ${iconClass}`.trim()} style={{ width: box, height: box }}>
                <img src={icon} alt="" width={leaf} height={leaf} />
            </span>
            <span>{label}</span>
        </div>
        <strong className={valueClass}>{value}</strong>
    </div>
);

const ActivationDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const session = useMemo(() => loadSession(), []);
    const [announcement, setAnnouncement] = useState('');
    const [sent, setSent] = useState([]);

    if (!session) {
        return <Navigate to="/dashboard/activation" replace />;
    }

    const closeSession = () => {
        if (!window.confirm(t('activationDashboard.closeConfirm'))) return;
        clearSession();
        navigate('/dashboard');
    };

    const sendAnnouncement = () => {
        if (!announcement.trim()) return;
        setSent((prev) => [announcement.trim(), ...prev]);
        setAnnouncement('');
    };

    const categoryLabel = session.category ? t(`activation.categories.${session.category}`) : '—';
    const severityLabel = session.severity ? t(`activation.severities.${session.severity}`) : '—';
    const durationLabel = t('activationDashboard.durationValue')
        .replace('{current}', String(session.dayCurrent || 1).padStart(2, '0'))
        .replace('{total}', String(session.duration || 0).padStart(2, '0'));

    return (
        <DashboardLayout activeNav="session">
            <div className="adash">
                <section className="adash-hero">
                    <div className="adash-hero-top">
                        <div>
                            <div className="adash-title-row">
                                <h1>{session.title}</h1>
                                <span className="adash-badge">
                                    <span className="adash-badge-dot" />
                                    {t('activationDashboard.active')}
                                </span>
                            </div>
                            <p>
                                {t('activationDashboard.sessionId')}: {session.id}
                            </p>
                        </div>
                        <button type="button" className="adash-close" onClick={closeSession}>
                            <img src={iconClose} alt="" width={16} height={16} />
                            {t('activationDashboard.closeSession')}
                        </button>
                    </div>
                    <div className="adash-hero-meta">
                        <MetaItem
                            icon={iconCalendar}
                            label={t('activationDashboard.startDate')}
                            value={formatDate(session.startDate)}
                        />
                        <MetaItem
                            icon={iconHourglass}
                            box={18}
                            leaf={9}
                            iconClass="adash-icon--hourglass"
                            label={t('activationDashboard.duration')}
                            value={durationLabel}
                        />
                        <MetaItem
                            icon={iconSeverity}
                            box={16}
                            leaf={16}
                            label={t('activationDashboard.severity')}
                            value={severityLabel}
                            valueClass="is-severity"
                        />
                        <MetaItem
                            icon={iconActivator}
                            box={16}
                            leaf={16}
                            label={t('activationDashboard.activator')}
                            value={session.activatorName}
                        />
                    </div>
                </section>

                <section className="adash-stats">
                    <article className="adash-stat adash-stat--reports">
                        <div>
                            <IconBox src={iconReportDoc} box={39} leaf={39} />
                            <p>{t('activationDashboard.statReports')}</p>
                        </div>
                        <strong>0</strong>
                    </article>
                    <article className="adash-stat adash-stat--contributors">
                        <div>
                            <IconBox src={iconBinders} box={39} leaf={39} />
                            <p>{t('activationDashboard.statContributors')}</p>
                        </div>
                        <strong>0</strong>
                    </article>
                    <article className="adash-stat adash-stat--pending">
                        <div>
                            <span className="adash-icon adash-icon--alert">
                                <img src={iconPendingLeaf} alt="" width={26.23} height={35.45} />
                            </span>
                            <p>{t('activationDashboard.statPending')}</p>
                        </div>
                        <strong>0</strong>
                    </article>
                    <article className="adash-stat adash-stat--approved">
                        <div>
                            <span className="adash-icon adash-icon--alert">
                                <img src={iconPendingLeaf} alt="" width={26.23} height={35.45} />
                            </span>
                            <p>{t('activationDashboard.statApproved')}</p>
                        </div>
                        <strong>0</strong>
                    </article>
                </section>

                <div className="adash-grid">
                    <div className="adash-col">
                        <section className="adash-card">
                            <div className="adash-card-title">
                                <IconBox src={iconLatestReport} box={24} leaf={24} />
                                <h2>{t('activationDashboard.latestReports')}</h2>
                            </div>
                            <div className="adash-table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>{t('activationDashboard.colCode')}</th>
                                            <th>{t('activationDashboard.colUser')}</th>
                                            <th>{t('activationDashboard.colDate')}</th>
                                            <th>{t('activationDashboard.colStatus')}</th>
                                        </tr>
                                    </thead>
                                </table>
                                <p className="adash-empty">{t('activationDashboard.emptyReports')}</p>
                            </div>
                        </section>

                        <section className="adash-card">
                            <div className="adash-card-title">
                                <IconBox src={iconAnnounce} box={24} leaf={24} />
                                <h2>{t('activationDashboard.announcement')}</h2>
                                <span className="adash-help" title={t('activationDashboard.announcement')}>
                                    <img src={iconHelp} alt="" width={16} height={16} />
                                </span>
                            </div>
                            <textarea
                                rows={3}
                                value={announcement}
                                placeholder={t('activationDashboard.announcementPlaceholder')}
                                onChange={(event) => setAnnouncement(event.target.value)}
                            />
                            <div className="adash-announce-row">
                                <button type="button" className="adash-history">
                                    <img src={iconHistory} alt="" width={20} height={20} />
                                    {t('activationDashboard.announcementHistory')}
                                    {sent.length ? ` (${sent.length})` : ''}
                                </button>
                                <button
                                    type="button"
                                    className="adash-send"
                                    disabled={!announcement.trim()}
                                    onClick={sendAnnouncement}
                                >
                                    {t('activationDashboard.send')}
                                </button>
                            </div>
                        </section>
                    </div>

                    <div className="adash-col">
                        <section className="adash-card">
                            <div className="adash-card-title">
                                <IconBox src={iconData} box={24} leaf={24} />
                                <h2>{t('activationDashboard.collected')}</h2>
                            </div>
                            <ul className="adash-collected">
                                {COLLECTED.map((item) => (
                                    <li key={item.id}>
                                        <span>{t(item.labelKey)}</span>
                                        <span className="adash-bar" />
                                        <strong>0</strong>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="adash-card">
                            <div className="adash-card-title">
                                <IconBox src={iconInfoSession} box={24} leaf={24} />
                                <h2>{t('activationDashboard.infoTitle')}</h2>
                                <button type="button" className="adash-edit" onClick={() => navigate('/dashboard/activation')}>
                                    {t('activation.edit')}
                                    <img src={iconEdit} alt="" width={16} height={16} />
                                </button>
                            </div>
                            <dl className="adash-info">
                                <div>
                                    <dt>{t('activationDashboard.category')}</dt>
                                    <dd>{categoryLabel}</dd>
                                </div>
                                <div>
                                    <dt>{t('activationDashboard.severity')}</dt>
                                    <dd>{severityLabel}</dd>
                                </div>
                                <div>
                                    <dt>{t('activationDashboard.description')}</dt>
                                    <dd>{session.description}</dd>
                                </div>
                                <div>
                                    <dt>{t('activationDashboard.estimate')}</dt>
                                    <dd>
                                        {session.duration} {t('activation.days').toLowerCase()}
                                    </dd>
                                </div>
                            </dl>
                            <h3>{t('activationDashboard.administrative')}</h3>
                            <dl className="adash-info">
                                <div>
                                    <dt>{t('activation.province')}</dt>
                                    <dd>{session.province}</dd>
                                </div>
                                {session.cities?.map((cityItem, cityIndex) => (
                                    <React.Fragment key={`${cityItem.city}-${cityIndex}`}>
                                        <div>
                                            <dt>{t('activation.city')}</dt>
                                            <dd>{cityItem.city}</dd>
                                        </div>
                                        {cityItem.districts?.filter(Boolean).map((district, index) => (
                                            <div key={`${cityItem.city}-${district}`}>
                                                <dt>
                                                    {t('activation.district')} {index + 1}
                                                </dt>
                                                <dd>{district}</dd>
                                            </div>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </dl>
                        </section>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ActivationDashboard;
