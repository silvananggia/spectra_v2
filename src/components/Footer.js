import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';
import '../assets/style/ColorPalette.css';
import logoBrin from '../assets/images/logo/Logo BRIN_Lanscape_White.png';
import './Footer.scss';

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="spectra-footer">
      <div className="footer-content">
        <div className="footer-logo">
          <img src={logoBrin} alt="BRIN Logo" className="footer-logo-img" />
        </div>
        <nav className="footer-nav" aria-label={t('footer.disclaimer')}>
          <Link to="/disclaimer" className="footer-link">
            {t('footer.disclaimer')}
          </Link>
        </nav>
        <p className="footer-copyright">
          {t('footer.copyright')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
