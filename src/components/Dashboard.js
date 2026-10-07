import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';
import DashboardLayout, { IconBox } from './DashboardLayout';
import iconChevron from '../assets/images/dashboard/icon-chevron.svg';
import iconHelp from '../assets/images/dashboard/icon-help.svg';
import iconReportDoc from '../assets/images/dashboard/icon-report-doc.svg';
import iconBinders from '../assets/images/dashboard/icon-binders.svg';
import iconAlert from '../assets/images/dashboard/icon-alert.svg';
import iconLineChart from '../assets/images/dashboard/icon-line-chart.svg';
import iconBarChart from '../assets/images/dashboard/icon-bar-chart.svg';
import iconReportTitle from '../assets/images/dashboard/icon-report-title.svg';
import chartArea from '../assets/images/dashboard/chart-area.svg';
import './Dashboard.scss';

const REPORT_TABS = [
    { id: 'all', labelKey: 'dashboard.tabAll' },
    { id: 'banjir', labelKey: 'dashboard.tabFlood' },
    { id: 'longsor', labelKey: 'dashboard.tabLandslide' },
    { id: 'kekeringan', labelKey: 'dashboard.tabDrought' },
    { id: 'kebakaran', labelKey: 'dashboard.tabFire' },
];

const REPORTS = [
    { code: 'BJLG0312', username: 'tniad001', session: 'Banjir dan Longsor Kalimantan 2026', date: '15 Mei 2026', status: 'verified', category: 'banjir' },
    { code: 'BJLG0311', username: 'pemda023', session: 'Banjir dan Longsor Kalimantan 2026', date: '15 Mei 2026', status: 'verified', category: 'longsor' },
    { code: 'BJLG0310', username: 'pemda005', session: 'Banjir dan Longsor Kalimantan 2026', date: '15 Mei 2026', status: 'verified', category: 'banjir' },
    { code: 'BJLG0309', username: 'polda023', session: 'Banjir dan Longsor Kalimantan 2026', date: '15 Mei 2026', status: 'verified', category: 'longsor' },
    { code: 'BJLG0308', username: 'pemko189', session: 'Banjir dan Longsor Kalimantan 2026', date: '15 Mei 2026', status: 'rejected', category: 'banjir' },
    { code: 'BJLG0309', username: 'polda023', session: 'Banjir dan Longsor Kalimantan 2026', date: '15 Mei 2026', status: 'verified', category: 'longsor' },
    { code: 'BJLG0308', username: 'pemko189', session: 'Banjir dan Longsor Kalimantan 2026', date: '15 Mei 2026', status: 'rejected', category: 'kekeringan' },
    { code: 'BJLG0309', username: 'polda023', session: 'Banjir dan Longsor Kalimantan 2026', date: '15 Mei 2026', status: 'verified', category: 'banjir' },
    { code: 'BJLG0308', username: 'pemko189', session: 'Banjir dan Longsor Kalimantan 2026', date: '15 Mei 2026', status: 'rejected', category: 'kebakaran' },
    { code: 'BJLG0309', username: 'polda023', session: 'Banjir dan Longsor Kalimantan 2026', date: '15 Mei 2026', status: 'verified', category: 'longsor' },
];

const BAR_SERIES = [
    { key: 'banjir', labelKey: 'dashboard.tabFlood', height: 282 },
    { key: 'longsor', labelKey: 'dashboard.tabLandslide', height: 153 },
    { key: 'kekeringan', labelKey: 'dashboard.tabDrought', height: 59 },
];

const LINE_TICKS = [40, 30, 20, 10, 0];
const BAR_TICKS = [70, 60, 50, 40, 30, 20, 10, 0];

const HelpHint = ({ label }) => (
    <span className="dash-help" title={label} aria-label={label}>
        <img src={iconHelp} alt="" width={16} height={16} />
    </span>
);

const SectionTitle = ({ children, hint }) => (
    <div className="dash-section-title">
        <h1>{children}</h1>
        <HelpHint label={hint} />
    </div>
);

const CardTitle = ({ icon, iconSize = 20, children, hint }) => (
    <div className="dash-card-title">
        <IconBox src={icon} box={iconSize} leaf={iconSize} />
        <h2>{children}</h2>
        <HelpHint label={hint} />
    </div>
);

const Dashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [sessionFilter, setSessionFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const filteredReports = useMemo(
        () => (activeTab === 'all' ? REPORTS : REPORTS.filter((row) => row.category === activeTab)),
        [activeTab]
    );

    return (
        <DashboardLayout activeNav="dashboard">
                <section className="dash-block">
                    <SectionTitle hint={t('dashboard.sessionHint')}>
                        {t('dashboard.sessionTitle')}
                    </SectionTitle>
                    <div className="dash-session-banner">
                        <p>
                            {t('dashboard.sessionEmpty')}
                            <br />
                            {t('dashboard.sessionEmptyHint')}
                        </p>
                        <button type="button" className="dash-primary-btn" onClick={() => navigate('/dashboard/activation')}>
                            {t('dashboard.activateSession')}
                        </button>
                    </div>
                </section>

                <section className="dash-block">
                    <SectionTitle hint={t('dashboard.overviewHint')}>
                        {t('dashboard.overviewTitle')}
                    </SectionTitle>
                    <div className="dash-stat-row">
                        <article className="dash-stat dash-stat--reports">
                            <div className="dash-stat-copy">
                                <IconBox src={iconReportDoc} box={39} leaf={39} />
                                <p>{t('dashboard.statReports')}</p>
                            </div>
                            <strong>354</strong>
                        </article>
                        <article className="dash-stat dash-stat--products">
                            <div className="dash-stat-copy">
                                <IconBox src={iconBinders} box={39} leaf={39} />
                                <p>{t('dashboard.statProducts')}</p>
                            </div>
                            <strong>4</strong>
                        </article>
                        <article className="dash-stat dash-stat--sessions">
                            <div className="dash-stat-copy">
                                <span className="dash-icon dash-icon--alert">
                                    <img src={iconAlert} alt="" width={26.23} height={35.45} />
                                </span>
                                <p>{t('dashboard.statSessions')}</p>
                            </div>
                            <strong>6</strong>
                        </article>
                    </div>
                </section>

                <section className="dash-split">
                    <div className="dash-split-left">
                        <article className="dash-panel dash-panel--line">
                            <CardTitle icon={iconLineChart} hint={t('dashboard.lineHint')}>
                                {t('dashboard.lineTitle')}
                            </CardTitle>
                            <div className="dash-filters">
                                <label className="dash-select">
                                    <span className="sr-only">{t('dashboard.selectSession')}</span>
                                    <select
                                        value={sessionFilter}
                                        onChange={(event) => setSessionFilter(event.target.value)}
                                    >
                                        <option value="">{t('dashboard.selectSession')}</option>
                                        <option value="kalimantan-2026">Banjir dan Longsor Kalimantan 2026</option>
                                    </select>
                                    <img src={iconChevron} alt="" width={20} height={20} />
                                </label>
                                <label className="dash-select">
                                    <span className="sr-only">{t('dashboard.selectDate')}</span>
                                    <select
                                        value={dateFilter}
                                        onChange={(event) => setDateFilter(event.target.value)}
                                    >
                                        <option value="">{t('dashboard.selectDate')}</option>
                                        <option value="mei-2026">Mei 2026</option>
                                    </select>
                                    <img src={iconChevron} alt="" width={20} height={20} />
                                </label>
                            </div>
                            <div className="dash-line-chart">
                                <div className="dash-chart-grid">
                                    {LINE_TICKS.map((tick) => (
                                        <div key={tick} className="dash-chart-grid-row">
                                            <span className="dash-chart-line" />
                                            <span className="dash-chart-tick">{tick}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="dash-area-chart">
                                    <img src={chartArea} alt="" width={534.437} height={134.048} />
                                </div>
                                <div className="dash-legend">
                                    <span className="dash-legend-swatch dash-legend-swatch--earth" />
                                    <span>{t('dashboard.reportCount')}</span>
                                </div>
                            </div>
                        </article>

                        <article className="dash-panel dash-panel--table">
                            <CardTitle icon={iconReportTitle} hint={t('dashboard.latestHint')}>
                                {t('dashboard.latestTitle')}
                            </CardTitle>
                            <div className="dash-tabs" role="tablist">
                                {REPORT_TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={activeTab === tab.id}
                                        className={`dash-tab${activeTab === tab.id ? ' is-active' : ''}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        {t(tab.labelKey)}
                                    </button>
                                ))}
                            </div>
                            <div className="dash-table-wrap">
                                <table className="dash-table">
                                    <thead>
                                        <tr>
                                            <th>{t('dashboard.colCode')}</th>
                                            <th>{t('dashboard.colUser')}</th>
                                            <th>{t('dashboard.colSession')}</th>
                                            <th>{t('dashboard.colDate')}</th>
                                            <th>{t('dashboard.colStatus')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReports.map((row, index) => (
                                            <tr key={`${row.code}-${row.username}-${index}`}>
                                                <td>{row.code}</td>
                                                <td>{row.username}</td>
                                                <td>{row.session}</td>
                                                <td>{row.date}</td>
                                                <td>
                                                    <span className={`dash-badge dash-badge--${row.status}`}>
                                                        {row.status === 'verified'
                                                            ? t('dashboard.statusVerified')
                                                            : t('dashboard.statusRejected')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </article>
                    </div>

                    <article className="dash-panel dash-panel--bar">
                        <CardTitle icon={iconBarChart} hint={t('dashboard.barHint')}>
                            {t('dashboard.barTitle')}
                        </CardTitle>
                        <div className="dash-bar-chart">
                            <div className="dash-bar-plot">
                                <div className="dash-chart-grid dash-chart-grid--bar">
                                    {BAR_TICKS.map((tick) => (
                                        <div key={tick} className="dash-chart-grid-row">
                                            <span className="dash-chart-line" />
                                            <span className="dash-chart-tick">{tick}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="dash-bars">
                                    {BAR_SERIES.map((bar) => (
                                        <div key={bar.key} className="dash-bar-col">
                                            <span className="dash-bar" style={{ height: bar.height }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="dash-bar-labels">
                                {BAR_SERIES.map((bar) => (
                                    <span key={bar.key} className="dash-bar-label">{t(bar.labelKey)}</span>
                                ))}
                            </div>
                            <div className="dash-legend">
                                <span className="dash-legend-swatch dash-legend-swatch--water" />
                                <span>{t('dashboard.reportCount')}</span>
                            </div>
                        </div>
                    </article>
                </section>
        </DashboardLayout>
    );
};

export default Dashboard;
