import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../utils/i18n';
import heroPhoto from '../assets/images/services/hero.png';
import heroIntersect from '../assets/images/services/hero-intersect.png';
import pattern from '../assets/images/services/pattern.png';
import ilusBgComplete from '../assets/images/services/ilus-bg-complete.svg';
import ilusBgSimple from '../assets/images/services/ilus-bg-simple.svg';
import ilusShadow from '../assets/images/services/ilus-shadow.svg';
import ilusLamp from '../assets/images/services/ilus-lamp.svg';
import ilusPlant from '../assets/images/services/ilus-plant.svg';
import ilusFloor from '../assets/images/services/ilus-floor.svg';
import ilusPaperPlane from '../assets/images/services/ilus-paper-plane.svg';
import ilusCharacter from '../assets/images/services/ilus-character.svg';
import ilusMailBadge from '../assets/images/services/ilus-mail-badge.svg';
import iconMail from '../assets/images/services/icon-mail.svg';
import iconDoc from '../assets/images/services/icon-doc.svg';
import iconSend from '../assets/images/services/icon-send.svg';
import iconClose from '../assets/images/services/icon-close.svg';
import iconCheckWfs from '../assets/images/services/icon-check-wfs-1.svg';
import iconCheckWcs from '../assets/images/services/icon-check-wcs.svg';
import iconAbc from '../assets/images/services/icon-abc.svg';
import iconMinus from '../assets/images/services/icon-minus.svg';
import iconCode from '../assets/images/services/icon-code.svg';
import iconPositive from '../assets/images/services/icon-positive.svg';
import './Services.scss';

const BASE_URL = 'https://spectra.brin.go.id/services';
const WMS_URL = `${BASE_URL}/wms`;
const WCS_URL = `${BASE_URL}/wcs`;
const WFS_URL = `${BASE_URL}/wfs`;

const ILUS_LAYERS = [
    { name: 'bg-complete', src: ilusBgComplete, left: 16.02, top: 54.85, width: 336.551, height: 154.94 },
    { name: 'bg-simple', src: ilusBgSimple, left: 8.87, top: 36.31, width: 351.283, height: 239.305 },
    { name: 'shadow', src: ilusShadow, left: 46.07, top: 380.45, width: 252.384, height: 19.547 },
    { name: 'lamp', src: ilusLamp, left: 118.52, top: 0, width: 132, height: 162.272 },
    { name: 'plant', src: ilusPlant, left: 263.59, top: 242.92, width: 101.793, height: 133.646 },
    { name: 'floor', src: ilusFloor, left: 0, top: 376.26, width: 369.032, height: 0.881 },
    { name: 'paper-plane', src: ilusPaperPlane, left: 150.6, top: 104.84, width: 212.859, height: 156.988 },
    { name: 'character', src: ilusCharacter, left: 0.41, top: 162.65, width: 304.971, height: 231.321 },
    { name: 'mail-badge', src: ilusMailBadge, left: 135.21, top: 169.29, width: 63.165, height: 63.165 },
];

const COPY = {
    id: {
        heroTitle: 'Spectra Web Services',
        heroBody:
            'Akses peta tematik dan informasi geospasial dengan lebih terbuka dan terintegrasi. Melalui layanan WMS (Web Map Services), WCS (Web Coverage Services) dan WFS (Web Features Services), data geospasial disajikan dalam format yang telah distandarisasi dan dapat langsung digunakan untuk mendukung analisis dan pengambilan keputusan.',
        heroCta: 'Temukan perbedaannya >>>',
        accessTitle: 'Bagaimana Cara Akses Service Spectra?',
        step1Title: 'Kirim Email',
        step1Body:
            'Permintaan link services dapat diakses dengan mengirimkan email dengan lampiran surat resmi melalui pejabat setingkat eselon-2 kepada kepala Pusat Data dan Informasi BRIN.',
        step2Title: 'Substansi Email',
        step2Before: 'Lampirkan keterangan ',
        step2Purpose: 'tujuan penggunaan services',
        step2Mid: ' dan lampirkan detail narahubung berupa: ',
        step2Name: 'Nama',
        step2Email: 'Email',
        step2Whatsapp: 'Nomor WhatsApp',
        step2And: ' dan ',
        step3Title: 'Kirim Email',
        step3Line: 'Kirim surat Anda ke alamat email:',
        usageTitle: 'Cara Menggunakan Layanan Services Spectra',
        tipsPrefix: 'Cari tau tips dalam menggunakan ',
        infoTitle: 'Informasi Umum:',
        howTo: 'How To',
        qgis: 'QGIS',
        arcgis: 'ArcGIS',
        exampleUrl: 'Contoh URL',
        explanation: 'Penjelasan',
        guideTitle: 'Panduan Services',
        compareTitle: 'Ringkasan Perbedaan Utama',
        explainTitle: 'Penjelasan Umum',
        colAspect: 'Aspek',
        rowData: 'Jenis Data',
        rowAnalysis: 'Analisis',
        rowEdit: 'Edit',
        rowGoal: 'Tujuan Utama',
        rowSize: 'Ukuran Data',
        charTitle: 'Karakteristik Utama',
        consTitle: 'Kekurangan',
        useTitle: 'Contoh Penggunaan',
        prosTitle: 'Kelebihan',
        close: 'Tutup',
    },
    en: {
        heroTitle: 'Spectra Web Services',
        heroBody:
            'Access thematic maps and geospatial information more openly and in an integrated way. Through WMS (Web Map Services), WCS (Web Coverage Services) and WFS (Web Feature Services), geospatial data is provided in standardized formats that can be used directly to support analysis and decision-making.',
        heroCta: 'See the differences >>>',
        accessTitle: 'How do I access Spectra services?',
        step1Title: 'Send an email',
        step1Body:
            'Service links can be requested by sending an email with an official letter, through an echelon-2 official, to the Head of the BRIN Data and Information Center.',
        step2Title: 'Email contents',
        step2Before: 'Include the ',
        step2Purpose: 'purpose of using the services',
        step2Mid: ' and contact details: ',
        step2Name: 'Name',
        step2Email: 'Email',
        step2Whatsapp: 'WhatsApp number',
        step2And: ' and ',
        step3Title: 'Send an email',
        step3Line: 'Send your letter to:',
        usageTitle: 'How to use Spectra services',
        tipsPrefix: 'See tips for using ',
        infoTitle: 'General information:',
        howTo: 'How To',
        qgis: 'QGIS',
        arcgis: 'ArcGIS',
        exampleUrl: 'Example URL',
        explanation: 'Notes',
        guideTitle: 'Services guide',
        compareTitle: 'Main differences at a glance',
        explainTitle: 'Overview',
        colAspect: 'Aspect',
        rowData: 'Data type',
        rowAnalysis: 'Analysis',
        rowEdit: 'Edit',
        rowGoal: 'Primary purpose',
        rowSize: 'Data size',
        charTitle: 'Key characteristics',
        consTitle: 'Limitations',
        useTitle: 'Typical uses',
        prosTitle: 'Advantages',
        close: 'Close',
    },
};

const SERVICE_META = {
    id: {
        wms: {
            title: 'Web Map Service (WMS)',
            description:
                'WMS adalah standar OGC untuk melayani peta georeferensi sebagai gambar. WMS menghasilkan peta sebagai gambar statis yang dapat ditampilkan di browser atau aplikasi GIS.',
            info: [
                'Versi yang didukung: 1.1.0, 1.3.0',
                'Format yang didukung: image/png, image/jpeg, image/gif',
                'Sistem Koordinat Default: EPSG:4326 (WGS84)',
            ],
            tips: [
                'Gunakan format image/png dengan transparent=true untuk overlay layer',
                'Parameter bbox harus sesuai dengan SRS yang digunakan',
                'Untuk penggunaan di Leaflet/OpenLayers, gunakan versi 1.1.0 atau 1.3.0',
                'Multiple layers dapat digabungkan dengan koma: layers=layer1,layer2',
            ],
            howTo: [
                {
                    title: 'GetCapabilities',
                    summary: 'Mendapatkan informasi tentang layer yang tersedia di server WMS',
                    code: `${WMS_URL}?service=WMS&version=1.1.0&request=GetCapabilities`,
                    note: 'Request ini mengembalikan dokumen XML yang berisi daftar semua layer yang tersedia, format yang didukung, dan informasi lainnya.',
                },
                {
                    title: 'GetMap',
                    summary: 'Mendapatkan peta sebagai gambar (PNG, JPEG, dll)',
                    code: `${WMS_URL}?service=WMS&version=1.1.0&request=GetMap&layers=nama_layer&styles=&bbox=95.0,-11.0,141.0,6.0&width=800&height=600&srs=EPSG:4326&format=image/png&transparent=true`,
                    note: 'Parameter penting: layers, bbox, width/height, srs, dan format.',
                },
                {
                    title: 'GetFeatureInfo',
                    summary: 'Mendapatkan informasi atribut dari feature pada koordinat tertentu',
                    code: `${WMS_URL}?service=WMS&version=1.1.0&request=GetFeatureInfo&layers=nama_layer&query_layers=nama_layer&x=400&y=300&width=800&height=600&srs=EPSG:4326&bbox=95.0,-11.0,141.0,6.0&info_format=text/html`,
                    note: 'Parameter x dan y adalah koordinat piksel dalam gambar peta.',
                },
            ],
        },
        wcs: {
            title: 'Web Coverage Service (WCS)',
            description:
                'WCS adalah standar OGC untuk mengakses data raster (coverage) dalam format aslinya. Berbeda dengan WMS yang mengembalikan gambar, WCS mengembalikan data raster yang dapat dianalisis lebih lanjut.',
            info: [
                'Versi yang didukung: 2.0.1',
                'Format yang didukung: image/tiff, application/netcdf',
                'Sistem Koordinat Default: EPSG:4326 (WGS84)',
            ],
            tips: [
                'Format image/tiff atau GeoTIFF paling umum digunakan',
                'Gunakan subset untuk membatasi area yang didownload',
                'Data WCS dapat digunakan di QGIS, ArcGIS, atau dianalisis dengan Python (rasterio, GDAL)',
            ],
            howTo: [
                {
                    title: 'GetCapabilities',
                    summary: 'Mendapatkan informasi tentang coverage yang tersedia',
                    code: `${WCS_URL}?service=WCS&version=2.0.1&request=GetCapabilities`,
                    note: 'Mengembalikan dokumen XML berisi daftar coverage, format, dan sistem koordinat yang didukung.',
                },
                {
                    title: 'DescribeCoverage',
                    summary: 'Mendapatkan metadata detail tentang coverage tertentu',
                    code: `${WCS_URL}?service=WCS&version=2.0.1&request=DescribeCoverage&coverageId=nama_coverage`,
                    note: 'Mengembalikan extent, CRS, format, dan struktur data coverage.',
                },
                {
                    title: 'GetCoverage',
                    summary: 'Mendownload data coverage dalam format raster (GeoTIFF, NetCDF, dll)',
                    code: `${WCS_URL}?service=WCS&version=2.0.1&request=GetCoverage&coverageId=nama_coverage&format=image/tiff&subset=Long(95.0,141.0)&subset=Lat(-11.0,6.0)&subsettingCrs=EPSG:4326&outputCrs=EPSG:4326`,
                    note: 'Parameter penting: coverageId, format, subset, subsettingCrs, dan outputCrs.',
                },
            ],
        },
        wfs: {
            title: 'Web Feature Service (WFS)',
            description:
                'WFS adalah standar OGC untuk mengakses data vektor (feature) dalam format aslinya. WFS mengembalikan data geometri dan atribut yang dapat dianalisis dan dimodifikasi.',
            info: [
                'Versi yang didukung: 2.0.0',
                'Format yang didukung: application/json (GeoJSON), text/xml (GML), application/gml+xml',
                'Sistem Koordinat Default: EPSG:4326 (WGS84)',
            ],
            tips: [
                'Format application/json menghasilkan GeoJSON yang mudah digunakan di web',
                'Gunakan maxFeatures untuk membatasi jumlah feature',
                'Untuk query kompleks, gunakan CQL_FILTER',
            ],
            howTo: [
                {
                    title: 'GetCapabilities',
                    summary: 'Mendapatkan informasi tentang feature type yang tersedia',
                    code: `${WFS_URL}?service=WFS&version=2.0.0&request=GetCapabilities`,
                    note: 'Mengembalikan daftar feature type, operasi, dan format output.',
                },
                {
                    title: 'DescribeFeatureType',
                    summary: 'Mendapatkan schema (struktur) dari feature type tertentu',
                    code: `${WFS_URL}?service=WFS&version=2.0.0&request=DescribeFeatureType&typeName=nama_feature_type`,
                    note: 'Mengembalikan nama field dan tipe data atribut.',
                },
                {
                    title: 'GetFeature',
                    summary: 'Mendownload data feature dalam format vektor (GML, GeoJSON, Shapefile, dll)',
                    code: `${WFS_URL}?service=WFS&version=2.0.0&request=GetFeature&typeName=nama_feature_type&outputFormat=application/json&srsName=EPSG:4326&bbox=95.0,-11.0,141.0,6.0,EPSG:4326`,
                    note: 'Parameter penting: typeName, outputFormat, bbox, dan srsName.',
                },
            ],
        },
    },
    en: {
        wms: {
            title: 'Web Map Service (WMS)',
            description:
                'WMS is the OGC standard for serving georeferenced maps as images. WMS returns static map images that can be displayed in a browser or GIS application.',
            info: [
                'Supported versions: 1.1.0, 1.3.0',
                'Supported formats: image/png, image/jpeg, image/gif',
                'Default coordinate system: EPSG:4326 (WGS84)',
            ],
            tips: [
                'Use image/png with transparent=true for overlays',
                'The bbox parameter must match the SRS',
                'Use version 1.1.0 or 1.3.0 with Leaflet/OpenLayers',
                'Combine layers with commas: layers=layer1,layer2',
            ],
            howTo: [
                {
                    title: 'GetCapabilities',
                    summary: 'Get information about layers available on the WMS server',
                    code: `${WMS_URL}?service=WMS&version=1.1.0&request=GetCapabilities`,
                    note: 'Returns XML listing available layers, formats, and other service metadata.',
                },
                {
                    title: 'GetMap',
                    summary: 'Get the map as an image (PNG, JPEG, etc.)',
                    code: `${WMS_URL}?service=WMS&version=1.1.0&request=GetMap&layers=layer_name&styles=&bbox=95.0,-11.0,141.0,6.0&width=800&height=600&srs=EPSG:4326&format=image/png&transparent=true`,
                    note: 'Key parameters: layers, bbox, width/height, srs, and format.',
                },
                {
                    title: 'GetFeatureInfo',
                    summary: 'Get feature attributes at a given coordinate',
                    code: `${WMS_URL}?service=WMS&version=1.1.0&request=GetFeatureInfo&layers=layer_name&query_layers=layer_name&x=400&y=300&width=800&height=600&srs=EPSG:4326&bbox=95.0,-11.0,141.0,6.0&info_format=text/html`,
                    note: 'x and y are pixel coordinates in the map image.',
                },
            ],
        },
        wcs: {
            title: 'Web Coverage Service (WCS)',
            description:
                'WCS is the OGC standard for accessing raster coverage in its original form. Unlike WMS, WCS returns raster data that can be analyzed further.',
            info: [
                'Supported version: 2.0.1',
                'Supported formats: image/tiff, application/netcdf',
                'Default coordinate system: EPSG:4326 (WGS84)',
            ],
            tips: [
                'image/tiff or GeoTIFF is the most common format',
                'Use subset to limit the download extent',
                'WCS data can be used in QGIS, ArcGIS, or Python (rasterio, GDAL)',
            ],
            howTo: [
                {
                    title: 'GetCapabilities',
                    summary: 'Get information about available coverages',
                    code: `${WCS_URL}?service=WCS&version=2.0.1&request=GetCapabilities`,
                    note: 'Returns XML listing coverages, formats, and supported CRS.',
                },
                {
                    title: 'DescribeCoverage',
                    summary: 'Get detailed metadata for a coverage',
                    code: `${WCS_URL}?service=WCS&version=2.0.1&request=DescribeCoverage&coverageId=coverage_name`,
                    note: 'Returns extent, CRS, format, and data structure.',
                },
                {
                    title: 'GetCoverage',
                    summary: 'Download coverage as raster (GeoTIFF, NetCDF, etc.)',
                    code: `${WCS_URL}?service=WCS&version=2.0.1&request=GetCoverage&coverageId=coverage_name&format=image/tiff&subset=Long(95.0,141.0)&subset=Lat(-11.0,6.0)&subsettingCrs=EPSG:4326&outputCrs=EPSG:4326`,
                    note: 'Key parameters: coverageId, format, subset, subsettingCrs, and outputCrs.',
                },
            ],
        },
        wfs: {
            title: 'Web Feature Service (WFS)',
            description:
                'WFS is the OGC standard for accessing vector features in their original form. WFS returns geometry and attributes that can be analyzed and edited.',
            info: [
                'Supported version: 2.0.0',
                'Supported formats: application/json (GeoJSON), text/xml (GML), application/gml+xml',
                'Default coordinate system: EPSG:4326 (WGS84)',
            ],
            tips: [
                'application/json returns GeoJSON that is easy to use on the web',
                'Use maxFeatures to limit the number of features',
                'Use CQL_FILTER for complex queries',
            ],
            howTo: [
                {
                    title: 'GetCapabilities',
                    summary: 'Get information about available feature types',
                    code: `${WFS_URL}?service=WFS&version=2.0.0&request=GetCapabilities`,
                    note: 'Returns feature types, operations, and output formats.',
                },
                {
                    title: 'DescribeFeatureType',
                    summary: 'Get the schema of a feature type',
                    code: `${WFS_URL}?service=WFS&version=2.0.0&request=DescribeFeatureType&typeName=feature_type_name`,
                    note: 'Returns field names and attribute data types.',
                },
                {
                    title: 'GetFeature',
                    summary: 'Download features as vector data (GML, GeoJSON, Shapefile, etc.)',
                    code: `${WFS_URL}?service=WFS&version=2.0.0&request=GetFeature&typeName=feature_type_name&outputFormat=application/json&srsName=EPSG:4326&bbox=95.0,-11.0,141.0,6.0,EPSG:4326`,
                    note: 'Key parameters: typeName, outputFormat, bbox, and srsName.',
                },
            ],
        },
    },
};

const GIS_CONTENT = {
    id: {
        qgis: [
            {
                title: 'Menambahkan WMS Layer',
                summary: 'Membuat koneksi WMS/WMTS baru di panel Browser QGIS',
                steps: [
                    'Buka QGIS dan buat project baru',
                    'Klik kanan pada panel Browser → New Connection → WMS/WMTS',
                    `Name: SPECTRA BRIN WMS, URL: ${WMS_URL}`,
                    'Klik OK, lalu drag layer ke canvas',
                ],
            },
            {
                title: 'Menambahkan WFS Layer',
                summary: 'Menghubungkan QGIS ke layanan vektor SPECTRA',
                steps: [
                    'Klik kanan pada panel Browser → New Connection → WFS',
                    `Name: SPECTRA BRIN WFS, URL: ${WFS_URL}`,
                    'Klik OK dan drag feature type ke canvas',
                ],
            },
            {
                title: 'Menggunakan WCS',
                summary: 'Mengunduh coverage raster ke QGIS',
                steps: [
                    'Menu Layer → Add Layer → Add Raster Layer',
                    'Pilih Protocol: HTTP(s), cloud, etc.',
                    `Masukkan URL GetCoverage: ${WCS_URL}?service=WCS&version=2.0.1&request=GetCoverage&coverageId=nama_coverage&format=image/tiff`,
                ],
            },
        ],
        arcgis: [
            {
                title: 'Menambahkan WMS Layer (ArcMap)',
                summary: 'Menghubungkan ArcMap ke server WMS SPECTRA',
                steps: [
                    'File → Add Data → Add Data from ArcGIS Server → Add WMS Server',
                    `Masukkan URL: ${WMS_URL}`,
                    'Klik Get Layers, pilih layer, lalu Add',
                ],
            },
            {
                title: 'Menambahkan WMS Layer (ArcGIS Pro)',
                summary: 'Membuat koneksi WMS di ArcGIS Pro',
                steps: [
                    'Insert → Connections → New WMS Server Connection',
                    `Masukkan URL server: ${WMS_URL}`,
                    'Expand connection di Catalog pane dan drag layer ke map',
                ],
            },
            {
                title: 'Menambahkan WFS Layer',
                summary: 'Menghubungkan ArcGIS ke layanan vektor SPECTRA',
                steps: [
                    'ArcGIS Pro: Insert → Connections → New WFS Server Connection',
                    `Masukkan URL: ${WFS_URL}`,
                    'Pilih feature type dan tambahkan ke map',
                ],
            },
        ],
    },
    en: {
        qgis: [
            {
                title: 'Add a WMS layer',
                summary: 'Create a new WMS/WMTS connection in the QGIS Browser',
                steps: [
                    'Open QGIS and create a new project',
                    'Right-click Browser → New Connection → WMS/WMTS',
                    `Name: SPECTRA BRIN WMS, URL: ${WMS_URL}`,
                    'Click OK, then drag a layer onto the canvas',
                ],
            },
            {
                title: 'Add a WFS layer',
                summary: 'Connect QGIS to SPECTRA vector services',
                steps: [
                    'Right-click Browser → New Connection → WFS',
                    `Name: SPECTRA BRIN WFS, URL: ${WFS_URL}`,
                    'Click OK and drag a feature type onto the canvas',
                ],
            },
            {
                title: 'Use WCS',
                summary: 'Download raster coverage into QGIS',
                steps: [
                    'Layer → Add Layer → Add Raster Layer',
                    'Choose Protocol: HTTP(s), cloud, etc.',
                    `Enter a GetCoverage URL: ${WCS_URL}?service=WCS&version=2.0.1&request=GetCoverage&coverageId=coverage_name&format=image/tiff`,
                ],
            },
        ],
        arcgis: [
            {
                title: 'Add a WMS layer (ArcMap)',
                summary: 'Connect ArcMap to the SPECTRA WMS server',
                steps: [
                    'File → Add Data → Add Data from ArcGIS Server → Add WMS Server',
                    `URL: ${WMS_URL}`,
                    'Click Get Layers, choose a layer, then Add',
                ],
            },
            {
                title: 'Add a WMS layer (ArcGIS Pro)',
                summary: 'Create a WMS connection in ArcGIS Pro',
                steps: [
                    'Insert → Connections → New WMS Server Connection',
                    `Server URL: ${WMS_URL}`,
                    'Expand the connection in Catalog and drag a layer onto the map',
                ],
            },
            {
                title: 'Add a WFS layer',
                summary: 'Connect ArcGIS to SPECTRA vector services',
                steps: [
                    'ArcGIS Pro: Insert → Connections → New WFS Server Connection',
                    `URL: ${WFS_URL}`,
                    'Choose a feature type and add it to the map',
                ],
            },
        ],
    },
};

const GUIDE = {
    id: {
        wms: {
            data: 'Gambar Peta (PNG, JPG, GIF)',
            goal: 'Visualisasi',
            size: 'Kecil',
            chars: [
                'Output berupa gambar peta (PNG, JPEG, GIF)',
                'Data tidak bisa diedit atau diolah langsung',
                'Ringan dan Cepat',
                'Konsisten secara visual (style ditentukan oleh server)',
                'Cocok untuk visualisasi',
            ],
            cons: ['Tidak direkomendasikan untuk analisis spasial lanjutan', 'Tidak dapat mengakses data mentah'],
            uses: ['Menampilkan peta tematik di web map', 'Overlay peta referensi', 'Dashboard pemantauan', 'Peta publik'],
            pros: ['Mudah digunakan', 'Beban komputasi rendah di sisi pengguna', 'Tampilan peta seragam'],
        },
        wfs: {
            data: 'Data Vektor (GML, GeoJSON)',
            goal: 'Analisis Vektor',
            size: 'Sedang',
            chars: [
                'Output berupa data vektor (GML, GeoJSON)',
                'Geometri dan atribut dapat diakses',
                'Data dapat dianalisis dan diedit',
                'Cocok untuk query spasial dan atribut',
            ],
            cons: ['Ukuran data lebih besar dari WMS', 'Perlu aplikasi GIS atau library vektor'],
            uses: ['Analisis buffer dan overlay', 'Query atribut', 'Editing feature', 'Ekspor ke GeoJSON/shapefile'],
            pros: ['Akses data mentah', 'Dapat diolah lebih lanjut', 'Mendukung filter spasial dan atribut'],
        },
        wcs: {
            data: 'Raster Numerik (GeoTIFF, NetCDF)',
            goal: 'Analisis raster',
            size: 'Besar',
            chars: [
                'Output berupa raster numerik (GeoTIFF, NetCDF)',
                'Nilai piksel dapat dianalisis',
                'Coverage spasial dalam format asli',
                'Cocok untuk analisis raster',
            ],
            cons: ['Ukuran data besar', 'Download dapat memakan waktu'],
            uses: ['Analisis indeks vegetasi', 'Klasifikasi tutupan lahan', 'Pemodelan raster', 'Pengolahan di Python/GIS'],
            pros: ['Data numerik asli', 'Dapat diolah di GIS dan Python', 'Mendukung subset spasial'],
        },
    },
    en: {
        wms: {
            data: 'Map image (PNG, JPG, GIF)',
            goal: 'Visualization',
            size: 'Small',
            chars: [
                'Output is a map image (PNG, JPEG, GIF)',
                'Data cannot be edited or processed directly',
                'Lightweight and fast',
                'Visually consistent (style is set by the server)',
                'Best for visualization',
            ],
            cons: ['Not recommended for advanced spatial analysis', 'No access to raw data'],
            uses: ['Thematic maps in a web map', 'Reference map overlays', 'Monitoring dashboards', 'Public maps'],
            pros: ['Easy to use', 'Low compute load on the client', 'Consistent map styling'],
        },
        wfs: {
            data: 'Vector data (GML, GeoJSON)',
            goal: 'Vector analysis',
            size: 'Medium',
            chars: [
                'Output is vector data (GML, GeoJSON)',
                'Geometry and attributes are available',
                'Data can be analyzed and edited',
                'Best for spatial and attribute queries',
            ],
            cons: ['Larger payloads than WMS', 'Needs a GIS app or vector library'],
            uses: ['Buffer and overlay analysis', 'Attribute queries', 'Feature editing', 'Export to GeoJSON/shapefile'],
            pros: ['Access to raw data', 'Can be processed further', 'Supports spatial and attribute filters'],
        },
        wcs: {
            data: 'Numeric raster (GeoTIFF, NetCDF)',
            goal: 'Raster analysis',
            size: 'Large',
            chars: [
                'Output is numeric raster (GeoTIFF, NetCDF)',
                'Pixel values can be analyzed',
                'Spatial coverage in native format',
                'Best for raster analysis',
            ],
            cons: ['Large payloads', 'Downloads can take time'],
            uses: ['Vegetation index analysis', 'Land-cover classification', 'Raster modelling', 'Processing in Python/GIS'],
            pros: ['Original numeric data', 'Works in GIS and Python', 'Supports spatial subsets'],
        },
    },
};

const ChevronIcon = ({ open }) => (
    <svg className={`services-accordion-chevron ${open ? 'is-open' : ''}`} viewBox="0 0 20 20" aria-hidden="true">
        <path
            d="M5.2 7.4 10 12.1l4.8-4.7 1.2 1.2L10 14.5 4 8.6l1.2-1.2z"
            fill="currentColor"
        />
    </svg>
);

const ArrowUpRight = () => (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path
            d="M6 4.5h9.5V14H14V7.1L6.8 14.3 5.7 13.2 12.9 6H6V4.5z"
            fill="currentColor"
        />
    </svg>
);

const AccessIllustration = () => (
    <div className="services-ilus" aria-hidden="true">
        {ILUS_LAYERS.map((layer) => (
            <div
                key={layer.name}
                className={`services-ilus-layer services-ilus-layer--${layer.name}`}
                style={{
                    left: layer.left,
                    top: layer.top,
                    width: layer.width,
                    height: layer.height,
                }}
            >
                <img src={layer.src} alt="" width={layer.width} height={layer.height} />
            </div>
        ))}
    </div>
);

const AccordionItem = ({ index, item, open, onToggle, extra }) => (
    <div className="services-accordion">
        <button
            type="button"
            className="services-accordion-trigger"
            onClick={onToggle}
            aria-expanded={open}
        >
            <div className="services-accordion-head">
                <p className="services-accordion-title">
                    {index + 1}. {item.title}
                </p>
                <ChevronIcon open={open} />
            </div>
            <p className="services-accordion-summary">{item.summary}</p>
        </button>
        {open ? extra : null}
    </div>
);

const GuideModal = ({ open, onClose, copy, lang }) => {
    const [explainTab, setExplainTab] = useState('wms');
    const guide = GUIDE[lang] || GUIDE.id;
    const active = guide[explainTab];

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', onKey);
        };
    }, [open, onClose]);

    if (!open) return null;

    const sections = [
        { icon: iconAbc, title: copy.charTitle, items: active.chars },
        { icon: iconMinus, title: copy.consTitle, items: active.cons },
        { icon: iconCode, title: copy.useTitle, items: active.uses },
        { icon: iconPositive, title: copy.prosTitle, items: active.pros },
    ];

    return (
        <div className="services-guide-overlay" onClick={onClose} role="presentation">
            <div
                className="services-guide"
                role="dialog"
                aria-modal="true"
                aria-labelledby="services-guide-title"
                onClick={(event) => event.stopPropagation()}
            >
                <button type="button" className="services-guide-close" onClick={onClose} aria-label={copy.close}>
                    ×
                </button>
                <h2 id="services-guide-title" className="services-guide-title">
                    {copy.guideTitle}
                </h2>

                <div>
                    <p className="services-guide-label">{copy.compareTitle}</p>
                    <div className="services-compare">
                        <table className="services-compare-table">
                            <thead>
                                <tr>
                                    <th>{copy.colAspect}</th>
                                    <th>WMS</th>
                                    <th>WFS</th>
                                    <th>WCS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{copy.rowData}</td>
                                    <td>{guide.wms.data}</td>
                                    <td>{guide.wfs.data}</td>
                                    <td>{guide.wcs.data}</td>
                                </tr>
                                <tr>
                                    <td>{copy.rowAnalysis}</td>
                                    <td className="is-icon">
                                        <img src={iconClose} alt="" width="22" height="22" />
                                    </td>
                                    <td className="is-icon">
                                        <img src={iconCheckWfs} alt="" width="22" height="22" />
                                    </td>
                                    <td className="is-icon">
                                        <img src={iconCheckWcs} alt="" width="22" height="22" />
                                    </td>
                                </tr>
                                <tr>
                                    <td>{copy.rowEdit}</td>
                                    <td className="is-icon">
                                        <img src={iconClose} alt="" width="22" height="22" />
                                    </td>
                                    <td className="is-icon">
                                        <img src={iconCheckWfs} alt="" width="22" height="22" />
                                    </td>
                                    <td className="is-icon">
                                        <img src={iconCheckWcs} alt="" width="22" height="22" />
                                    </td>
                                </tr>
                                <tr>
                                    <td>{copy.rowGoal}</td>
                                    <td>{guide.wms.goal}</td>
                                    <td>{guide.wfs.goal}</td>
                                    <td>{guide.wcs.goal}</td>
                                </tr>
                                <tr>
                                    <td>{copy.rowSize}</td>
                                    <td>{guide.wms.size}</td>
                                    <td>{guide.wfs.size}</td>
                                    <td>{guide.wcs.size}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="services-explain">
                    <p className="services-guide-label">{copy.explainTitle}</p>
                    <div className="services-tags" role="tablist" aria-label={copy.explainTitle}>
                        {['wms', 'wfs', 'wcs'].map((id) => (
                            <button
                                key={id}
                                type="button"
                                role="tab"
                                className={`services-tag ${explainTab === id ? 'is-on' : ''}`}
                                aria-selected={explainTab === id}
                                onClick={() => setExplainTab(id)}
                            >
                                {id.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <div className="services-explain-grid">
                        {sections.map((section) => (
                            <div key={section.title} className="services-explain-block">
                                <div className="services-explain-head">
                                    <img src={section.icon} alt="" width="24" height="24" />
                                    <h3>{section.title}</h3>
                                </div>
                                <ul className="services-explain-list">
                                    {section.items.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Services = () => {
    const { currentLanguage } = useTranslation();
    const lang = COPY[currentLanguage] ? currentLanguage : 'id';
    const copy = COPY[lang];
    const meta = SERVICE_META[lang];
    const gis = GIS_CONTENT[lang];

    const [activeService, setActiveService] = useState('wms');
    const [tutorialTab, setTutorialTab] = useState('howTo');
    const [openItem, setOpenItem] = useState(-1);
    const [showTips, setShowTips] = useState(false);
    const [guideOpen, setGuideOpen] = useState(false);

    const service = meta[activeService];
    const tutorialItems = useMemo(() => {
        if (tutorialTab === 'qgis') return gis.qgis;
        if (tutorialTab === 'arcgis') return gis.arcgis;
        return service.howTo;
    }, [tutorialTab, gis, service]);

    useEffect(() => {
        setOpenItem(-1);
        setShowTips(false);
        setTutorialTab('howTo');
    }, [activeService]);

    return (
        <main className="services-page">
            <section className="services-hero">
                <div className="services-hero-media" aria-hidden="true">
                    <img className="services-hero-photo" src={heroPhoto} alt="" />
                    <div className="services-hero-overlay" />
                    <div className="services-hero-intersect">
                        <img src={heroIntersect} alt="" width="136.666" height="155" />
                    </div>
                    <div className="services-hero-pattern">
                        <img src={pattern} alt="" width="211.611" height="240" />
                    </div>
                </div>
                <div className="services-hero-content">
                    <h1 className="services-hero-title">{copy.heroTitle}</h1>
                    <p className="services-hero-body">{copy.heroBody}</p>
                    <button type="button" className="services-hero-cta" onClick={() => setGuideOpen(true)}>
                        {copy.heroCta}
                    </button>
                </div>
            </section>

            <section className="services-access">
                <div className="services-ornament services-ornament--tr" aria-hidden="true">
                    <img src={pattern} alt="" width="78" height="88" />
                </div>
                <div className="services-ornament services-ornament--tr2" aria-hidden="true">
                    <img src={pattern} alt="" width="126" height="143" />
                </div>
                <div className="services-ornament services-ornament--bl" aria-hidden="true">
                    <img src={pattern} alt="" width="112" height="127" />
                </div>
                <div className="services-ornament services-ornament--bl2" aria-hidden="true">
                    <img src={pattern} alt="" width="61" height="69" />
                </div>

                <div className="services-access-inner">
                    <AccessIllustration />
                    <div className="services-access-copy">
                        <h2 className="services-access-title">{copy.accessTitle}</h2>
                        <div className="services-access-steps">
                            <div className="services-access-rail" aria-hidden="true">
                                <span className="services-access-icon">
                                    <img src={iconMail} alt="" width="15" height="12" />
                                </span>
                                <span className="services-access-connector" />
                                <span className="services-access-icon">
                                    <img src={iconDoc} alt="" width="15" height="12" />
                                </span>
                                <span className="services-access-connector" />
                                <span className="services-access-icon services-access-icon--send">
                                    <img src={iconSend} alt="" width="36" height="36" />
                                </span>
                            </div>
                            <div className="services-access-list">
                                <div className="services-access-item">
                                    <h3 className="services-access-item-title">{copy.step1Title}</h3>
                                    <p className="services-access-item-text">{copy.step1Body}</p>
                                </div>
                                <div className="services-access-item">
                                    <h3 className="services-access-item-title">{copy.step2Title}</h3>
                                    <p className="services-access-item-text">
                                        {copy.step2Before}
                                        <strong>{copy.step2Purpose}</strong>
                                        {copy.step2Mid}
                                        <strong>{copy.step2Name}</strong>, <strong>{copy.step2Email}</strong>
                                        {copy.step2And}
                                        <strong>{copy.step2Whatsapp}</strong>.
                                    </p>
                                </div>
                                <div className="services-access-item">
                                    <h3 className="services-access-item-title">{copy.step3Title}</h3>
                                    <p className="services-access-item-text">
                                        {copy.step3Line}
                                        <br />
                                        <a className="services-access-mail" href="mailto:data@brin.go.id">
                                            data@brin.go.id
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="services-divider" />

            <section className="services-usage">
                <h2 className="services-usage-title">{copy.usageTitle}</h2>
                <div className="services-tags" role="tablist" aria-label={copy.usageTitle}>
                    {['wms', 'wcs', 'wfs'].map((id) => (
                        <button
                            key={id}
                            type="button"
                            role="tab"
                            className={`services-tag ${activeService === id ? 'is-on' : ''}`}
                            aria-selected={activeService === id}
                            onClick={() => setActiveService(id)}
                        >
                            {id.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="services-card">
                    <div className="services-card-intro">
                        <h3 className="services-card-title">{service.title}</h3>
                        <div>
                            <p className="services-card-desc">{service.description}</p>
                            <button
                                type="button"
                                className="services-tips-link"
                                onClick={() => setShowTips((prev) => !prev)}
                            >
                                {`${copy.tipsPrefix}${activeService.toUpperCase()}.`}
                                <ArrowUpRight />
                            </button>
                            {showTips ? (
                                <div className="services-tips-panel">
                                    <h4>
                                        {copy.tipsPrefix}
                                        {activeService.toUpperCase()}
                                    </h4>
                                    <ul>
                                        {service.tips.map((tip) => (
                                            <li key={tip}>{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="services-info">
                        <p className="services-info-title">{copy.infoTitle}</p>
                        <ul className="services-info-list">
                            {service.info.map((line) => (
                                <li key={line}>{line}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="services-tutorial">
                        <div className="services-tabs" role="tablist">
                            {[
                                { id: 'howTo', label: copy.howTo },
                                { id: 'qgis', label: copy.qgis },
                                { id: 'arcgis', label: copy.arcgis },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    className={`services-tab ${tutorialTab === tab.id ? 'is-on' : ''}`}
                                    aria-selected={tutorialTab === tab.id}
                                    onClick={() => {
                                        setTutorialTab(tab.id);
                                        setOpenItem(-1);
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="services-accordions">
                            {tutorialItems.map((item, index) => (
                                <AccordionItem
                                    key={`${tutorialTab}-${item.title}`}
                                    index={index}
                                    item={item}
                                    open={openItem === index}
                                    onToggle={() => setOpenItem((prev) => (prev === index ? -1 : index))}
                                    extra={
                                        <div className="services-accordion-extra">
                                            {item.code ? (
                                                <>
                                                    <pre className="services-code">
                                                        <code>{item.code}</code>
                                                    </pre>
                                                    {item.note ? <p className="services-accordion-note">{item.note}</p> : null}
                                                </>
                                            ) : null}
                                            {item.steps ? (
                                                <ol className="services-steps">
                                                    {item.steps.map((step) => (
                                                        <li key={step}>{step}</li>
                                                    ))}
                                                </ol>
                                            ) : null}
                                        </div>
                                    }
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} copy={copy} lang={lang} />
        </main>
    );
};

export default Services;
