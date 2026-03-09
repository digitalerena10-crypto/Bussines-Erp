import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';

// Direct imports for instant navigation (no lazy loading = no loading spinner flicker)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import CreateSalesOrder from './pages/CreateSalesOrder';
import CreateInvoice from './pages/CreateInvoice';
import Purchase from './pages/Purchase';
import CreatePurchaseOrder from './pages/CreatePurchaseOrder';
import Accounting from './pages/Accounting';
import HR from './pages/HR';
import Reports from './pages/Reports';
import MediaManager from './pages/MediaManager';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
                v7_fetcherPersist: true,
                v7_normalizeFormMethod: true,
                v7_partialHydration: true,
                v7_skipActionErrorRevalidation: true
            }}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes (wrapped in MainLayout) */}
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="admin" element={<Admin />} />
                        <Route path="inventory" element={<Inventory />} />
                        <Route path="sales" element={<Sales />} />
                        <Route path="sales/new" element={<CreateSalesOrder />} />
                        <Route path="invoices/new" element={<CreateInvoice />} />
                        <Route path="purchases" element={<Purchase />} />
                        <Route path="purchases/new" element={<CreatePurchaseOrder />} />
                        <Route path="accounting" element={<Accounting />} />
                        <Route path="hr" element={<HR />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="media" element={<MediaManager />} />
                    </Route>

                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
