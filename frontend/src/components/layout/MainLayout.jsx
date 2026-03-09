import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
    const { isAuthenticated, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-surface-dark">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-surface-dark">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                {/* Page content */}
                <main className="flex-1 overflow-y-auto px-4 lg:px-6 pt-2 pb-6">
                    <div>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
