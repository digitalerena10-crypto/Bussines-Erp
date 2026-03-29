import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Users, GitBranch, Settings, History, Activity,
    RefreshCw, ShieldCheck
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

// Extracted Components
import SettingsTab from '@/components/admin/SettingsTab';
import LogsTab from '@/components/admin/LogsTab';
import HealthTab from '@/components/admin/HealthTab';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('settings');

    // Fetch Audit Logs
    const { data: logs, isLoading: loadingLogs, isError: isLogsError } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: async () => {
            const res = await api.get('/admin/audit-logs');
            return res.data.data;
        },
        enabled: activeTab === 'logs',
        retry: 1
    });

    // Fetch System Health (Poll every 10s)
    const { data: health, isLoading: loadingHealth, isError: isHealthError } = useQuery({
        queryKey: ['system-health'],
        queryFn: async () => {
            const res = await api.get('/admin/health');
            return res.data.data;
        },
        refetchInterval: 10000,
        enabled: activeTab === 'health',
        retry: 1
    });

    const tabs = [
        { id: 'settings', label: 'System Settings', icon: Settings, color: 'text-primary-600' },
        { id: 'logs', label: 'Audit Logs', icon: History, color: 'text-amber-600' },
        { id: 'health', label: 'System Health', icon: Activity, color: 'text-emerald-600' },
        { id: 'users', label: 'User Control', icon: Users, color: 'text-blue-600' },
        { id: 'roles', label: 'Permissions', icon: ShieldCheck, color: 'text-purple-600' },
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 md:gap-3">
                        <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary-600" />
                        Control Center
                    </h1>
                    <p className="text-gray-500 font-medium mt-1 text-sm md:text-base">Enterprise-grade system administration and monitoring.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm border border-gray-200 shadow-sm hover:bg-gray-50 transition-all active:scale-95"
                    >
                        <RefreshCw className="w-4 h-4" /> Reload System
                    </button>
                </div>
            </div>

            {/* Tab Navigation - Scrollable on Mobile */}
            <div className="flex gap-2 p-1.5 bg-white/60 backdrop-blur-md border border-gray-200/50 shadow-sm rounded-2xl w-full overflow-x-auto scroller-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                                relative flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 min-w-max
                                ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-white'}
                            `}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeAdminTab"
                                className="absolute inset-0 bg-primary-600 rounded-xl shadow-md shadow-primary-500/20"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <tab.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 relative z-10 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[600px] w-full">
                {activeTab === 'settings' && <SettingsTab />}
                {activeTab === 'logs' && <LogsTab logs={logs} isLoading={loadingLogs} isError={isLogsError} />}
                {activeTab === 'health' && <HealthTab health={health} isLoading={loadingHealth} isError={isHealthError} />}
                {(activeTab === 'users' || activeTab === 'roles') && (
                    <div className="card h-96 flex flex-col items-center justify-center text-center border border-gray-100 bg-gradient-to-br from-white to-gray-50 mx-2 md:mx-0">
                        <Shield className="w-12 h-12 md:w-16 md:h-16 text-gray-200 mb-4" />
                        <h3 className="text-lg md:text-xl font-bold text-gray-900">Module Under Expansion</h3>
                        <p className="text-gray-500 max-w-xs mt-2 font-medium text-sm md:text-base">Core security controls are being finalized for migration to the new schema.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
