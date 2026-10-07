export const SATELLITE_META = [
    {
        id: 'sentinel-2',
        sensor: 'Sentinel-2',
        typeKey: 'mapDashboard.sensorOptical',
        platform: 'MSI L2A',
        resolution: '10 m',
        revisitDays: 5,
        sceneCount: 7,
        color: '#2e9b4a',
    },
    {
        id: 'sentinel-1',
        sensor: 'Sentinel-1',
        typeKey: 'mapDashboard.sensorSar',
        platform: 'IW GRD',
        resolution: '10 m',
        revisitDays: 6,
        sceneCount: 6,
        color: '#2563eb',
    },
    {
        id: 'landsat',
        sensor: 'Landsat-8/9',
        typeKey: 'mapDashboard.sensorOptical',
        platform: 'OLI/TIRS',
        resolution: '30 m',
        revisitDays: 8,
        sceneCount: 5,
        color: '#d97706',
    },
];

const completedProduct = (id, nameKey, completedAt) => ({
    id,
    nameKey,
    checked: true,
    status: 'completed',
    completedAt,
    downloadable: true,
});

const impactProducts = (prefix, times) => [
    completedProduct(`${prefix}-affected`, 'mapDashboard.productAffectedArea', times[0]),
    completedProduct(`${prefix}-buildings`, 'mapDashboard.productDamagedBuildings', times[1]),
    completedProduct(`${prefix}-roads`, 'mapDashboard.productDamagedRoads', times[2]),
];

export const ANALYSIS_AREAS = [
    { id: 'area-01', nameKey: 'mapDashboard.areas.north', expanded: false, products: [] },
    { id: 'area-02', nameKey: 'mapDashboard.areas.west', expanded: false, products: [] },
    {
        id: 'area-03',
        nameKey: 'mapDashboard.areas.east',
        expanded: true,
        products: impactProducts('p-east', [
            '27/09/2026, 04:47 (UTC)',
            '27/09/2026, 04:22 (UTC)',
            '27/09/2026, 04:05 (UTC)',
        ]),
    },
    {
        id: 'area-04',
        nameKey: 'mapDashboard.areas.south',
        expanded: true,
        products: [
            {
                id: 'p-south-affected',
                nameKey: 'mapDashboard.productAffectedArea',
                checked: true,
                status: 'notProduced',
                downloadable: false,
                detailsOpen: true,
                details: {
                    sensor: 'optical/VHR1',
                    acquisitionKey: 'mapDashboard.waitingConfirmation',
                    reasonKey: 'mapDashboard.cloudReason',
                },
            },
            completedProduct('p-south-buildings', 'mapDashboard.productDamagedBuildings', '26/09/2026, 11:18 (UTC)'),
            completedProduct('p-south-roads', 'mapDashboard.productDamagedRoads', '26/09/2026, 10:54 (UTC)'),
        ],
    },
    {
        id: 'area-05',
        nameKey: 'mapDashboard.areas.center',
        expanded: true,
        products: impactProducts('p-center', [
            '05/09/2026, 06:32 (UTC)',
            '31/08/2026, 05:27 (UTC)',
            '31/08/2026, 05:12 (UTC)',
        ]),
    },
    { id: 'area-06', nameKey: 'mapDashboard.areas.islands', expanded: false, products: [] },
    {
        id: 'src-brin',
        kind: 'source',
        nameKey: 'mapDashboard.sources.brin',
        expanded: true,
        products: impactProducts('p-brin', [
            '27/09/2026, 04:47 (UTC)',
            '27/09/2026, 04:22 (UTC)',
            '27/09/2026, 04:05 (UTC)',
        ]),
    },
    {
        id: 'src-university',
        kind: 'source',
        nameKey: 'mapDashboard.sources.university',
        expanded: true,
        products: impactProducts('p-univ', [
            '26/09/2026, 09:15 (UTC)',
            '26/09/2026, 08:40 (UTC)',
            '26/09/2026, 08:18 (UTC)',
        ]),
    },
    {
        id: 'src-community',
        kind: 'source',
        nameKey: 'mapDashboard.sources.community',
        expanded: true,
        products: impactProducts('p-community', [
            '25/09/2026, 14:08 (UTC)',
            '25/09/2026, 13:51 (UTC)',
            '25/09/2026, 13:30 (UTC)',
        ]),
    },
];

const toIsoDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const resolveStartDate = (startDate) => {
    const parsed = startDate ? new Date(`${startDate}T00:00:00`) : new Date();
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export const buildTimeSeries = (startDate) => {
    const start = resolveStartDate(startDate);
    return SATELLITE_META.flatMap((sat) =>
        Array.from({ length: sat.sceneCount }, (_, index) => {
            const date = new Date(start);
            date.setDate(start.getDate() - index * sat.revisitDays);
            const iso = toIsoDate(date);
            return {
                id: `ts-${sat.id}-${iso}`,
                satelliteId: sat.id,
                sensor: sat.sensor,
                platform: sat.platform,
                resolution: sat.resolution,
                typeKey: sat.typeKey,
                color: sat.color,
                date: iso,
            };
        })
    ).sort((left, right) => {
        if (left.date === right.date) {
            return (
                SATELLITE_META.findIndex((sat) => sat.id === left.satelliteId) -
                SATELLITE_META.findIndex((sat) => sat.id === right.satelliteId)
            );
        }
        return left.date < right.date ? 1 : -1;
    });
};
