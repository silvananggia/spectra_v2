import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLanguage } from '../redux/slices/language';
import { logout } from '../redux/slices/auth';
import { useTranslation } from '../utils/i18n';
import '../assets/style/ColorPalette.css';
import logoSpectra from '../assets/images/logo/logo-spectra.png';
import './Header.scss';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t, currentLanguage } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated } = useSelector((state) => state.auth);

    const handleLanguageToggle = () => {
        dispatch(toggleLanguage());
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        dispatch(logout());
        closeMobileMenu();
        navigate('/login');
    };

    // Close mobile menu when route changes
    useEffect(() => {
        closeMobileMenu();
    }, [location.pathname]);

    return (
        <header className="spectra-header">
            <div className="header-container">
                <div className="logo">
                    <Link to="/" className="logo-link">
                        <img src={logoSpectra} alt="SPECTRA Logo" className="logo-icon" />
                    </Link>
                </div>
                <div className="header-top">
                    <div className="logo">
                        <Link to="/" className="logo-link">
                            <img src={logoSpectra} alt="SPECTRA Logo" className="logo-icon" />
                        </Link>
                    </div>
                    <button 
                        className="hamburger-button"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle menu"
                    >
                        <span className={`hamburger-icon ${isMobileMenuOpen ? 'active' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                    </button>
                </div>
                <div className={`header-right ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <nav className="nav">
                        <NavLink to="/howto" className="nav-link" onClick={closeMobileMenu}>{t('header.services')}</NavLink>
                        <NavLink to="/profile" className="nav-link" onClick={closeMobileMenu}>{t('header.about')}</NavLink>
                        <NavLink to="/contact" className="nav-link" onClick={closeMobileMenu}>{t('header.contact')}</NavLink>
                    </nav>
                    <div className="header-actions">
                        {isAuthenticated ? (
                            <button type="button" className="btn-login" onClick={handleLogout}>
                                {t('header.logout')}
                            </button>
                        ) : (
                            <Link to="/login" className="btn-login">{t('header.login')}</Link>
                        )}
                        <button 
                            className="btn-lang" 
                            onClick={handleLanguageToggle}
                            title={currentLanguage === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
                        >
                            <span className={currentLanguage === 'id' ? 'lang-active' : 'lang-inactive'}>ID</span> | <span className={currentLanguage === 'en' ? 'lang-active' : 'lang-inactive'}>EN</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
