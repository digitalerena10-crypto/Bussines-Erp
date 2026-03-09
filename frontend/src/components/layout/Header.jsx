import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Menu,
    Bell,
    Search,
    ChevronDown,
    User,
    LogOut,
    Settings,
} from 'lucide-react';
import Modal from '../common/Modal';
import SettingsModal from '../forms/SettingsModal';

const Header = ({ onMenuToggle }) => {
    const { user, logout } = useAuth();
    const [showProfile, setShowProfile] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const profileRef = useRef(null);
    const notifRef = useRef(null);

    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Low Stock Alert', message: 'Product "Wireless Mouse" is below minimum threshold.', time: '10m ago', unread: true },
        { id: 2, title: 'New Sale Order', message: 'Order #SO-1001 created by John Doe.', time: '1h ago', unread: true },
        { id: 3, title: 'System Warning', message: 'Database backup completed successfully.', time: '1d ago', unread: false }
    ]);
    const unreadCount = notifications.filter(n => n.unread).length;

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        setShowNotifications(false);
    };

    return (
        <header className="sticky top-0 z-20 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
            {/* Left side */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    id="menu-toggle"
                >
                    <Menu size={20} />
                </button>

                {/* Search */}
                <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-72">
                    <Search size={16} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
                        id="global-search"
                    />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        id="notifications-btn"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-fadeIn z-50">
                            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                <p className="text-sm font-semibold text-gray-800">Notifications ({unreadCount})</p>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700">Mark all read</button>
                                )}
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length > 0 ? notifications.map(notif => (
                                    <div key={notif.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${notif.unread ? 'bg-blue-50/50' : ''}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{notif.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-2">{notif.message}</p>
                                    </div>
                                )) : (
                                    <div className="px-4 py-6 text-center text-sm text-gray-500">No new notifications</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        id="profile-btn"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                                {user?.name?.charAt(0) || 'A'}
                            </span>
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-gray-700">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-gray-500">{user?.role || 'Super Admin'}</p>
                        </div>
                        <ChevronDown size={14} className="hidden md:block text-gray-400" />
                    </button>

                    {/* Dropdown */}
                    {showProfile && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-fadeIn z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                            </div>
                            <div className="py-1">
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    <User size={16} className="text-gray-400" />
                                    My Profile
                                </button>
                                <button
                                    onClick={() => {
                                        setShowProfile(false);
                                        setIsSettingsModalOpen(true);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Settings size={16} className="text-gray-400" />
                                    Settings
                                </button>
                            </div>
                            <div className="border-t border-gray-100 pt-1">
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    id="logout-btn"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Settings Modal */}
            <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Global Settings" maxWidth="max-w-xl">
                <SettingsModal onSuccess={() => setIsSettingsModalOpen(false)} onCancel={() => setIsSettingsModalOpen(false)} />
            </Modal>
        </header>
    );
};

export default Header;
