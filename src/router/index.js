import React, { Suspense, lazy } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Skeleton from '../components/Skeleton';
import { ROLE_CONTRIBUTOR, ROLE_STAKEHOLDER, landingPath } from '../utils/authSession';

// Use lazy for importing your components
const Home = lazy(() => import('../components/Home'));
const Profile = lazy(() => import('../components/Profile'));
const MapProducts = lazy(() => import('../components/MapProducts'));
const Products = lazy(() => import('../components/Products'));
const Services = lazy(() => import('../components/Services'));
const Contact = lazy(() => import('../components/Contact'));
const PrivacyPolicy = lazy(() => import('../components/PrivacyPolicy'));
const Disclaimer = lazy(() => import('../components/Disclaimer'));
const DynamicMapViewer = lazy(() => import('../components/DynamicMapViewer'));
const MapAdmin = lazy(() => import('../components/MapAdmin'));
const Login = lazy(() => import('../components/Login'));
const ForgetPassword = lazy(() => import('../components/ForgetPassword'));
const Dashboard = lazy(() => import('../components/Dashboard'));
const Activation = lazy(() => import('../components/Activation'));
const ActivationDashboard = lazy(() => import('../components/ActivationDashboard'));
const MapDashboard = lazy(() => import('../components/MapDashboard'));
const Stakeholder = lazy(() => import('../components/Stakeholder'));
const Contributor = lazy(() => import('../components/Contributor'));
const Monitoring = lazy(() => import('../components/Monitoring'));

// Loading component with skeleton
const LoadingFallback = () => (
    <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        gap: '1rem'
    }}>
        <Skeleton variant="circle" width={60} height={60} />
        <Skeleton variant="text" width={200} height={20} />
    </div>
);

const RoleRoute = ({ role, children }) => {
    const { isAuthenticated, roles } = useSelector((state) => state.auth);
    const currentRole = roles?.[0];

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (currentRole !== role) {
        return <Navigate to={landingPath(currentRole)} replace />;
    }

    return children;
};

function MyRouter() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname.startsWith('/forgot-password');
    const isDashboardPage = location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/');
    const isStakeholderApp = location.pathname.startsWith('/stakeholder');
    const isMonitoringPage = location.pathname === '/monitoring';
    const hideChrome = isAuthPage || isDashboardPage || isStakeholderApp || isMonitoringPage;

    return (
        <>
            {!hideChrome && <Header />}
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgetPassword />} />
                    <Route path="/forgot-password/reset" element={<ForgetPassword />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/activation" element={<Activation />} />
                    <Route path="/dashboard/session" element={<ActivationDashboard />} />
                    <Route path="/dashboard/map" element={<MapDashboard />} />
                    <Route
                        path="/stakeholder"
                        element={
                            <RoleRoute role={ROLE_STAKEHOLDER}>
                                <Stakeholder />
                            </RoleRoute>
                        }
                    />
                    <Route path="/stakeholder/publish" element={<Navigate to="/dashboard/map" replace />} />
                    <Route
                        path="/contributor"
                        element={
                            <RoleRoute role={ROLE_CONTRIBUTOR}>
                                <Contributor />
                            </RoleRoute>
                        }
                    />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/maps" element={<MapProducts />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/howto" element={<Services />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/disclaimer" element={<Disclaimer />} />
                    <Route path="/monitoring" element={<Monitoring />} />
                    <Route path="/dynamic-maps" element={<DynamicMapViewer />} />
                    <Route path="/dynamic-maps/:mapId" element={<DynamicMapViewer />} />
                    <Route path="/admin/maps" element={<MapAdmin />} />
                </Routes>
            </Suspense>
            {!hideChrome && <Footer />}
        </>
    );
}

export default MyRouter;
