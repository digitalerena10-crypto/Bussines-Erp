import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Truck,
    Calculator,
    Users,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    Building2,
    HardDrive,
    UserCircle,
    Factory,
    TrendingUp,
    History,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
    { name: 'Inventory', to: '/inventory', icon: Package, permission: 'view_inventory' },
    { name: 'Sales', to: '/sales', icon: ShoppingCart, permission: 'view_sales' },
    { name: 'Purchases', to: '/purchases', icon: Truck, permission: 'view_purchases' },
    { name: 'Customers', to: '/customers', icon: UserCircle, permission: 'view_sales' },
    { name: 'Vendors', to: '/vendors', icon: Factory, permission: 'view_purchases' },
    { name: 'Accounting', to: '/accounting', icon: Calculator, permission: 'view_accounting' },
    { name: 'Analytics', to: '/analytics', icon: TrendingUp, permission: 'view_reports' },
    { name: 'HR Management', to: '/hr', icon: Users, permission: 'view_hr' },
    { name: 'Reports', to: '/reports', icon: BarChart3, permission: 'view_reports' },
    { name: 'Audit Logs', to: '/audit-logs', icon: History, permission: 'manage_users' },
    { name: 'Media Manager', to: '/media', icon: HardDrive, permission: 'view_media' },
    { name: 'Admin', to: '/admin', icon: Settings, permission: 'manage_users' },
];

const Sidebar = ({ isOpen, onToggle }) => {
    const { user } = useAuth();

    const hasAccess = (permission) => {
        if (!permission) return true;
        if (user?.role === 'Super Admin') return true;
        return user?.permissions?.includes(permission);
    };

    const filteredNavigation = navigation.filter(item => hasAccess(item.permission));

    return (
        <>
            {/* Mobile overlay - pure CSS */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar - CSS transition instead of framer-motion */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen bg-sidebar lg:relative lg:translate-x-0 shadow-2xl border-r border-white/5 overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:w-20'
                }`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <img src="/logo.png" alt="ERP Logo" className="w-full h-full object-cover rounded-lg shadow-inner" />
                        </div>
                        {isOpen && (
                            <span className="text-white font-bold text-lg tracking-tight whitespace-nowrap">
                                ERP System
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onToggle}
                        className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-white hover:bg-sidebar-hover transition-colors"
                    >
                        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-6 px-3 space-y-1">
                    {filteredNavigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.to}
                                onClick={() => {
                                    if (window.innerWidth < 1024 && isOpen) {
                                        onToggle();
                                    }
                                }}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? 'active' : ''} ${!isOpen ? 'lg:justify-center lg:px-2' : ''}`
                                }
                                title={!isOpen ? item.name : undefined}
                            >
                                <Icon size={20} className="flex-shrink-0" />
                                {isOpen && (
                                    <span className="whitespace-nowrap">{item.name}</span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Version badge */}
                {isOpen && (
                    <div className="absolute bottom-4 left-0 right-0 px-4">
                        <div className="text-center text-xs text-gray-600">
                            v2.0.0 · Enterprise
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
