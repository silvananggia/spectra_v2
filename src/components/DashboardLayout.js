import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from '../utils/i18n';
import { logout } from '../redux/slices/auth';
import { loadSession } from '../utils/activationSession';
import logoSpectra from '../assets/images/dashboard/logo-spectra.png';
import avatarUser from '../assets/images/dashboard/avatar.png';
import iconHome from '../assets/images/dashboard/icon-home.svg';
import iconDashboard from '../assets/images/dashboard/icon-dashboard.svg';
import iconSession from '../assets/images/dashboard/icon-session.svg';
import iconLaporan from '../assets/images/dashboard/icon-laporan.svg';
import iconProduk from '../assets/images/dashboard/icon-produk.svg';
import iconChevron from '../assets/images/dashboard/icon-chevron.svg';
import iconSettings from '../assets/images/dashboard/icon-settings.svg';
import iconNotification from '../assets/images/dashboard/icon-notification.svg';
import iconMessage from '../assets/images/dashboard/icon-message.svg';
import iconLogout from '../assets/images/dashboard/icon-logout.svg';
import './Dashboard.scss';

export const IconBox = ({ src, box, leaf, className = '', alt = '' }) => (
    <span className={`dash-icon ${className}`.trim()} style={{ width: box, height: box }}>
        <img src={src} alt={alt} width={leaf} height={leaf} />
    </span>
);

const DashboardLayout = ({ activeNav = 'dashboard', children }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const hasSession = Boolean(loadSession());
    const sessionPath = hasSession ? '/dashboard/session' : '/dashboard/activation';

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="dashboard-page">
            <aside className="dash-sidebar">
                <div className="dash-sidebar-brand">
                    <Link to="/" className="dash-logo" aria-label="SPECTRA">
                        <img src={logoSpectra} alt="SPECTRA" width={137} height={28} />
                    </Link>
                </div>

                <div className="dash-sidebar-body">
                    <div className="dash-sidebar-top">
                        <Link to="/" className="dash-nav-item">
                            <IconBox src={iconHome} box={24} leaf={24} />
                            <span className="dash-nav-label">{t('dashboard.goSpectra')}</span>
                        </Link>

                        <div className="dash-nav-divider" />

                        <nav className="dash-nav-group" aria-label={t('dashboard.navLabel')}>
                            <NavLink
                                to="/dashboard"
                                end
                                className={({ isActive }) =>
                                    `dash-nav-item${isActive && activeNav === 'dashboard' ? ' dash-nav-item--active' : ''}`
                                }
                            >
                                <IconBox src={iconDashboard} box={24} leaf={24} />
                                <span className="dash-nav-label">{t('dashboard.navDashboard')}</span>
                            </NavLink>
                            <NavLink
                                to={sessionPath}
                                className={`dash-nav-item${activeNav === 'session' ? ' dash-nav-item--active' : ''}`}
                            >
                                <IconBox src={iconSession} box={24} leaf={24} />
                                <span className="dash-nav-label">{t('dashboard.navSession')}</span>
                            </NavLink>
                            <button type="button" className="dash-nav-item">
                                <IconBox src={iconLaporan} box={24} leaf={24} />
                                <span className="dash-nav-label">{t('dashboard.navReports')}</span>
                                <span className="dash-nav-chevron">
                                    <img src={iconChevron} alt="" width={20} height={20} />
                                </span>
                            </button>
                            <button type="button" className="dash-nav-item">
                                <IconBox src={iconProduk} box={24} leaf={24} />
                                <span className="dash-nav-label">{t('dashboard.navProducts')}</span>
                                <span className="dash-nav-chevron">
                                    <img src={iconChevron} alt="" width={20} height={20} />
                                </span>
                            </button>
                        </nav>
                    </div>

                    <div className="dash-sidebar-bottom">
                        <nav className="dash-nav-group" aria-label={t('dashboard.accountLabel')}>
                            <button type="button" className="dash-nav-item">
                                <IconBox src={iconSettings} box={24} leaf={24} />
                                <span className="dash-nav-label">{t('dashboard.navSettings')}</span>
                            </button>
                            <button type="button" className="dash-nav-item">
                                <IconBox src={iconNotification} box={24} leaf={24} />
                                <span className="dash-nav-label">{t('dashboard.navNotifications')}</span>
                            </button>
                            <button type="button" className="dash-nav-item">
                                <IconBox src={iconMessage} box={24} leaf={24} />
                                <span className="dash-nav-label">{t('dashboard.navMessages')}</span>
                            </button>
                            <button type="button" className="dash-nav-item" onClick={handleLogout}>
                                <IconBox src={iconLogout} box={24} leaf={24} />
                                <span className="dash-nav-label">{t('dashboard.navLogout')}</span>
                            </button>
                        </nav>

                        <div className="dash-user">
                            <span className="dash-user-avatar">
                                <img src={avatarUser} alt="" width={40} height={40} />
                            </span>
                            <div className="dash-user-meta">
                                <p>BNPB1234</p>
                                <p>{t('dashboard.roleActivator')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="dash-main">{children}</main>
        </div>
    );
};

export default DashboardLayout;
