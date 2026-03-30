import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LicenseProvider, useLicense } from './context/LicenseContext';
import { SettingsProvider } from './context/SettingsContext';
import MainLayout from './components/layout/MainLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import ActivationPage from './pages/ActivationPage';

// Direct imports for instant navigation (no lazy loading = no loading spinner flicker)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import CreateSalesOrder from './pages/CreateSalesOrder';
import EditSalesOrder from './pages/EditSalesOrder';
import CreateInvoice from './pages/CreateInvoice';
import Purchase from './pages/Purchase';
import CreatePurchaseOrder from './pages/CreatePurchaseOrder';
import EditPurchaseOrder from './pages/EditPurchaseOrder';
import Accounting from './pages/Accounting';
import HR from './pages/HR';
import Reports from './pages/Reports';
import MediaManager from './pages/MediaManager';
import Customers from './pages/Customers';
import Vendors from './pages/Vendors';
import Analytics from './pages/Analytics';
import AuditLogs from './pages/AuditLogs';

/**
 * LicenseGate — wraps the entire application.
 * If no valid license → shows ActivationPage.
 * If license active → shows normal app routes.
 */
const LicenseGate = ({ children }) => {
    const { isLicenseActive } = useLicense();

    if (!isLicenseActive) {
        return <ActivationPage />;
    }

    return children;
};

function App() {
    return (
        <LicenseProvider>
            <LicenseGate>
                <AuthProvider>
                    <SettingsProvider>
                    <BrowserRouter future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                        v7_fetcherPersist: true,
                        v7_normalizeFormMethod: true,
                        v7_partialHydration: true,
                        v7_skipActionErrorRevalidation: true
                    }}>
                        <ErrorBoundary>
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/login" element={<Login />} />

                                {/* Protected Routes (wrapped in MainLayout) */}
                                <Route path="/" element={<MainLayout />}>
                                    <Route index element={<Navigate to="/dashboard" replace />} />
                                    <Route path="dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                                    <Route path="admin" element={<ErrorBoundary><Admin /></ErrorBoundary>} />
                                    <Route path="inventory" element={<ErrorBoundary><Inventory /></ErrorBoundary>} />
                                    <Route path="sales" element={<ErrorBoundary><Sales /></ErrorBoundary>} />
                                    <Route path="sales/new" element={<ErrorBoundary><CreateSalesOrder /></ErrorBoundary>} />
                                    <Route path="sales/:id/edit" element={<ErrorBoundary><EditSalesOrder /></ErrorBoundary>} />
                                    <Route path="invoices/new" element={<ErrorBoundary><CreateInvoice /></ErrorBoundary>} />
                                    <Route path="purchases" element={<ErrorBoundary><Purchase /></ErrorBoundary>} />
                                    <Route path="purchases/new" element={<ErrorBoundary><CreatePurchaseOrder /></ErrorBoundary>} />
                                    <Route path="purchases/:id/edit" element={<ErrorBoundary><EditPurchaseOrder /></ErrorBoundary>} />
                                    <Route path="accounting" element={<ErrorBoundary><Accounting /></ErrorBoundary>} />
                                    <Route path="hr" element={<ErrorBoundary><HR /></ErrorBoundary>} />
                                    <Route path="reports" element={<ErrorBoundary><Reports /></ErrorBoundary>} />
                                    <Route path="media" element={<ErrorBoundary><MediaManager /></ErrorBoundary>} />
                                    <Route path="customers" element={<ErrorBoundary><Customers /></ErrorBoundary>} />
                                    <Route path="vendors" element={<ErrorBoundary><Vendors /></ErrorBoundary>} />
                                    <Route path="analytics" element={<ErrorBoundary><Analytics /></ErrorBoundary>} />
                                    <Route path="audit-logs" element={<ErrorBoundary><AuditLogs /></ErrorBoundary>} />
                                </Route>

                                {/* Catch-all redirect */}
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </ErrorBoundary>
                    </BrowserRouter>
                    </SettingsProvider>
                </AuthProvider>
            </LicenseGate>
        </LicenseProvider>
    );
}

export default App;
