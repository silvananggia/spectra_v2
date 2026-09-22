import React from 'react';
import '../assets/style/ColorPalette.css';
import './Profile.scss';

const Profile = () => {
  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <div className="profile-hero-icon" aria-hidden="true" />
          <div className="profile-hero-text">
            <h1 className="profile-title">Tentang Kami</h1>
            <p className="profile-subtitle">
              SPECTRA (Satellite Platform for Emergency Crisis, Tracking and Remote Analytic) BRIN
            </p>
          </div>
        </header>

        <div className="profile-content">
          <section className="profile-section">
            <h2 className="section-heading">SPECTRA (Satellite Platform for Emergency Crisis, Tracking and Remote Analytic) BRIN</h2>
            <p>
              SPECTRA adalah platform informasi kebencanaan berbasis teknologi penginderaan jauh yang dikembangkan oleh Pusat Riset Geoinformatika, Badan Riset dan
              Inovasi Nasional (BRIN) sebagai bagian dari Regional Support Office (RSO) Indonesia untuk UNSPIDER (United
              Nations Platform for Space-based Information for Disaster Management and Emergency Response) yang juga didukung oleh Pusat Data dan Informasi BRIN.
            </p>
          </section>

          <section className="profile-section">
            <h2 className="section-heading">Sejarah dan Latar Belakang</h2>
            <p>
              SPECTRA dibangun seiring dengan pembentukan Task Force Tanggap Darurat Bencana BRIN pada kejadian banjir dan longsor yang melanda Provinsi Aceh, Sumatera Utara, dan Sumatera Barat pada akhir November 2025. Adapun RSO UNSPIDER-Indonesia dibentuk pada <strong>19 Februari 2013</strong> selama sesi kelima puluh Subkomite Ilmiah dan
              Teknis UNOOSA di Wina, Austria. Sebelum September 2021, Lembaga Penerbangan dan Antariksa
              Nasional (LAPAN) menjadi host untuk RSO-Indonesia. Kemudian, organisasi ini bergabung dengan
              badan riset di Indonesia lainnya di bawah koordinasi sekretariat badan keantariksaan (INASA), BRIN.
            </p>
          </section>

          <section className="profile-section">
            <h2 className="section-heading">Misi dan Tujuan</h2>
            <ul>
              <li>Berkontribusi pada upaya peningkatan kapasitas di bidang manajemen bencana dan tanggap darurat</li>
              <li>Mengembangkan dan menyediakan data geospasial untuk monitoring dan mitigasi bencana</li>
              <li>Meningkatkan kesiapsiagaan dan respon bencana melalui teknologi penginderaan jauh</li>
            </ul>
          </section>

          <section className="profile-section">
            <h2 className="section-heading">Tim pakar dan keahlian</h2>
            <p>
              Di bawah BRIN, RSO-Indonesia dikoordinasikan oleh INASA yang didukung oleh Pusat Riset Geoinformatika, Pusat Data dan Informasi serta unit lain yang terkait. Saat ini terdapat tidak kurang dari <strong>40 peneliti, perekayasa dan analis data</strong> yang bertanggung jawab untuk melakukan semua fase pengolahan penginderaan jauh, termasuk penerimaan data, pengolahan dan manajemen data, serta analisis data menggunakan Sistem Informasi Geografis. Anggota tim berpengalaman dalam berbagai aplikasi penginderaan jauh, seperti mitigasi bencana, penilaian kerentanan dan risiko bencana, monitoring lingkungan atau monitoring sumber daya alam.
            </p>
            <p>Kapasitas yang dimiliki meliputi:</p>
            <ul>
              <li>Dasar Penginderaan Jauh dan Pengolahan Data Citra</li>
              <li>
                Aplikasi penginderaan jauh untuk lingkungan (degradasi hutan, tumpahan minyak, polusi air, penambangan
                ilegal, penurunan tanah, kawasan kumuh, dll) dan bencana (kekeringan, banjir, longsor, kebakaran hutan,
                letusan gunung berapi, tsunami)
              </li>
              <li>Advanced Remote Sensing (Machine Learning, SAR processing)</li>
            </ul>

            
          </section>

          <section className="profile-section">
            <h2 className="section-heading">Kolaborasi</h2>
            <p>
              BRIN berkoordinasi dengan Badan Nasional Penanggulangan Bencana (BNPB) sebagai pemangku kepentingan bidang kebencanaan, untuk mendukung penyediaan data dan informasi terkait. Oleh karena itu, pengguna diharapkan menggunakan dengan bijak data/informasi yang tersedia di website ini, dengan tetap mengacu pada laporan yang dikeluarkan oleh BNPB.
            </p>
            <p>
              Di lingkup nasional, BRIN juga bekerjasama dengan pemerintah pusat dan daerah serta universitas. BRIN juga memiliki mitra internasional termasuk dengan UNOOSA/UNSPIDER, Sentinel Asia, serta mitra organisasi internasional lainnya.
            </p>
          </section>

         
        </div>
      </div>
    </main>
  );
};

export default Profile;

