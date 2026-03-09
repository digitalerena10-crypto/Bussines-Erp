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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
    { name: 'Inventory', to: '/inventory', icon: Package, permission: 'view_inventory' },
    { name: 'Sales', to: '/sales', icon: ShoppingCart, permission: 'view_sales' },
    { name: 'Purchases', to: '/purchases', icon: Truck, permission: 'view_purchases' },
    { name: 'Accounting', to: '/accounting', icon: Calculator, permission: 'view_accounting' },
    { name: 'HR Management', to: '/hr', icon: Users, permission: 'view_hr' },
    { name: 'Reports', to: '/reports', icon: BarChart3, permission: 'view_reports' },
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
                style={{ width: isOpen ? 256 : 80, transition: 'width 0.2s ease' }}
                className="fixed top-0 left-0 z-40 h-screen bg-sidebar lg:relative lg:translate-x-0 shadow-2xl border-r border-white/5 overflow-hidden"
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-white" />
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
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? 'active' : ''} ${!isOpen ? 'justify-center px-2' : ''}`
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
                            v1.0.0 · Phase 1
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
