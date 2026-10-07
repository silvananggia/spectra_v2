import React, { useEffect } from 'react';
import './DisclaimerModal.scss';
import disclaimerIllustration from '../assets/images/Ilustrasi/disclaimer.png';
import alertLogo from '../assets/images/Ilustrasi/alert.png';

const DisclaimerModal = ({ isOpen, onClose }) => {
    // Close modal on ESC key press and prevent body scroll when modal is open
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="disclaimer-modal-overlay" onClick={onClose}>
            <div className="disclaimer-modal" onClick={(e) => e.stopPropagation()}>
                <div className="disclaimer-header">
                    <div className="disclaimer-title-row">
                        <div className="disclaimer-logo">
                            <img src={alertLogo} alt="SPECTRA Logo" />
                        </div>
                        <h2 className="disclaimer-title">Pernyataan Penafian</h2>
                        <p className="disclaimer-subtitle">(Disclaimer)</p>
                    </div>
                </div>
                
                <div className="disclaimer-content">
                    <div className="disclaimer-text">
                        <p>
                            Seluruh data dan informasi yang disajikan dalam platform ini merupakan hasil 
                            pengolahan citra satelit untuk keperluan tanggap darurat bencana. Kami berupaya 
                            menjaga kualitas data, namun perlu dipahami bahwa hasil analisis ini memiliki 
                            keterbatasan tingkat akurasi yang dipengaruhi oleh resolusi sensor, kondisi 
                            tutupan awan, dan algoritma pemrosesan.
                        </p>
                        <p>
                            Data ini dimaksudkan sebagai referensi awal dan pendukung, bukan sebagai 
                            satu-satunya dasar tunggal dalam pengambilan kebijakan atau keputusan krusial 
                            di lapangan. Pengguna sangat diwajibkan untuk melakukan verifikasi lapangan 
                            (ground check) dan memadukan informasi ini dengan data primer lainnya sebelum 
                            menentukan langkah penanganan bencana. Kami tidak bertanggung jawab atas 
                            kerugian yang timbul akibat penggunaan informasi ini tanpa validasi tambahan.
                        </p>
                    </div>
                    <div className="disclaimer-illustration">
                        <img src={disclaimerIllustration} alt="Disclaimer Illustration" />
                    </div>
                </div>

                <div className="disclaimer-footer">
                    <button className="btn-understand" onClick={onClose}>
                        Saya Mengerti
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DisclaimerModal;
