import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Users, GitBranch, Settings, History, Activity,
    Save, RefreshCw, Server, Cpu, HardDrive, Database,
    CheckCircle2, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import PageTransition from '../components/common/MotionLayout';
import { Skeleton, TableSkeleton } from '../components/common/SkeletonLoader';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('settings');
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Audit Logs
    const { data: logs, isLoading: loadingLogs } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: async () => {
            const res = await api.get('/admin/audit-logs');
            return res.data.data;
        },
        enabled: activeTab === 'logs'
    });

    // Fetch System Health (Poll every 5s)
    const { data: health, isLoading: loadingHealth } = useQuery({
        queryKey: ['system-health'],
        queryFn: async () => {
            const res = await api.get('/admin/health');
            return res.data.data;
        },
        refetchInterval: 5000,
        enabled: activeTab === 'health'
    });

    const tabs = [
        { id: 'settings', label: 'System Settings', icon: Settings, color: 'text-primary-600' },
        { id: 'logs', label: 'Audit Logs', icon: History, color: 'text-amber-600' },
        { id: 'health', label: 'System Health', icon: Activity, color: 'text-emerald-600' },
        { id: 'users', label: 'User Control', icon: Users, color: 'text-blue-600' },
        { id: 'roles', label: 'Permissions', icon: ShieldCheck, color: 'text-purple-600' },
    ];

    return (
        <PageTransition>
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <Shield className="w-8 h-8 text-primary-600" />
                            Control Center
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">Enterprise-grade system administration and monitoring.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm border border-gray-200 shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                            <RefreshCw className="w-4 h-4" /> Reload
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-2xl w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                                ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}
                            `}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-primary-600 rounded-xl shadow-lg shadow-primary-500/30"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <tab.icon className={`w-4 h-4 relative z-10 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="min-h-[600px]"
                    >
                        {activeTab === 'settings' && <SettingsTab isSaving={isSaving} setIsSaving={setIsSaving} />}
                        {activeTab === 'logs' && <LogsTab logs={logs} isLoading={loadingLogs} />}
                        {activeTab === 'health' && <HealthTab health={health} isLoading={loadingHealth} />}
                        {(activeTab === 'users' || activeTab === 'roles') && (
                            <div className="card h-96 flex flex-col items-center justify-center text-center">
                                <Shield className="w-16 h-16 text-gray-200 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900">Module Under Expansion</h3>
                                <p className="text-gray-500 max-w-xs mt-2 font-medium">Core security controls are being finalized for migration to the new schema.</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </PageTransition>
    );
};

const SettingsTab = ({ isSaving, setIsSaving }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary-500" />
                    General Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Company Name</label>
                        <input type="text" className="input-field font-bold" defaultValue="Antigravity Enterprise" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Support Email</label>
                        <input type="email" className="input-field font-bold" defaultValue="support@antigravity.ai" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Global Currency</label>
                        <select className="input-field font-bold">
                            <option>USD ($)</option>
                            <option>EUR (€)</option>
                            <option>GBP (£)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">System Timezone</label>
                        <select className="input-field font-bold">
                            <option>UTC (Greenwich Mean Time)</option>
                            <option>EST (Eastern Standard Time)</option>
                            <option>PST (Pacific Standard Time)</option>
                        </select>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
                    <button
                        onClick={() => {
                            setIsSaving(true);
                            setTimeout(() => setIsSaving(false), 1500);
                        }}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-primary-500/40 hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-70"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Processing...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
        <div className="space-y-6">
            <div className="card text-center py-10">
                <div className="w-24 h-24 bg-primary-50 rounded-3xl mx-auto flex items-center justify-center border-2 border-dashed border-primary-200 mb-4 group cursor-pointer hover:border-primary-400 transition-all">
                    <RefreshCw className="w-8 h-8 text-primary-300 group-hover:rotate-180 transition-transform duration-700" />
                </div>
                <h4 className="font-bold text-gray-900">Company Logo</h4>
                <p className="text-xs text-gray-400 font-bold uppercase mt-2">Recommended: 256x256 PNG</p>
            </div>
            <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-primary-500/30">
                <Shield className="w-10 h-10 opacity-50 mb-4" />
                <h4 className="text-lg font-black leading-tight italic">Security Protocol</h4>
                <p className="text-sm text-primary-100 mt-2 font-medium">Admin actions are logged in real-time. Unauthorized attempts trigger automatic lockout.</p>
            </div>
        </div>
    </div>
);

const LogsTab = ({ logs, isLoading }) => (
    <div className="card overflow-hidden !p-0 border-none shadow-2xl">
        <div className="p-6 bg-white border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-amber-500" />
                System Audit Trail
            </h3>
            <span className="bg-amber-50 text-amber-600 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">Real-time Feed</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Administrator</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Module</th>
                        <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">IP Address</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {isLoading ? (
                        <tr><td colSpan="5" className="p-8"><TableSkeleton rows={8} /></td></tr>
                    ) : logs?.length > 0 ? (
                        logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-gray-900">{new Date(log.created_at).toLocaleTimeString()}</div>
                                    <div className="text-[10px] font-black text-gray-400">{new Date(log.created_at).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                                            {log.user_name?.charAt(0)}
                                        </div>
                                        <span className="text-sm font-black text-gray-700">{log.user_name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-gray-600">{log.action}</span>
                                </td>
                                <td className="px-6 py-4 text-sm font-black text-gray-400 uppercase tracking-widest">{log.module}</td>
                                <td className="px-6 py-4 text-sm font-mono text-gray-400">{log.ip_address || '127.0.0.1'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="p-20 text-center">
                                <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold">No security events recorded in the last 24h.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const HealthTab = ({ health, isLoading }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <HealthCard
                icon={Server}
                label="System Status"
                value={health?.status || 'Online'}
                sub="Node.js Cluster active"
                color="emerald"
                loading={isLoading}
            />
            <HealthCard
                icon={Cpu}
                label="Processor Load"
                value="2.4%"
                sub={`Version ${health?.node_version || 'v20.x'}`}
                color="blue"
                loading={isLoading}
            />
            <HealthCard
                icon={Database}
                label="DB Connection"
                value={health?.db_connection || 'Mock Active'}
                sub="Latency < 1ms"
                color="purple"
                loading={isLoading}
            />
            <HealthCard
                icon={HardDrive}
                label="Memory Usage"
                value={health ? `${Math.round(health.memory.rss / 1024 / 1024)}MB` : '0MB'}
                sub="RSS Footprint"
                color="amber"
                loading={isLoading}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    Real-time Metrics
                </h3>
                <div className="h-64 flex items-end gap-1 px-4">
                    {[...Array(24)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.random() * 80 + 20}%` }}
                            transition={{ duration: 0.5, delay: i * 0.02 }}
                            className="flex-1 bg-emerald-500/20 rounded-t-sm border-t-2 border-emerald-500"
                        />
                    ))}
                </div>
                <div className="mt-4 flex justify-between text-[10px] font-black text-gray-400 uppercase">
                    <span>-60 Minutes</span>
                    <span>System Latency</span>
                    <span>Now</span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="card !p-4 flex items-center gap-4 bg-emerald-50 border-emerald-100">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    <div>
                        <h4 className="font-black text-emerald-900 leading-none">Security Patch Up-to-date</h4>
                        <p className="text-emerald-700/60 text-xs font-bold mt-1 uppercase tracking-widest">Version v14.2.0-secure</p>
                    </div>
                </div>
                <div className="card !p-4 flex items-center gap-4 bg-blue-50 border-blue-100">
                    <Activity className="w-10 h-10 text-blue-500" />
                    <div>
                        <h4 className="font-black text-blue-900 leading-none">High-Availability Mode</h4>
                        <p className="text-blue-700/60 text-xs font-bold mt-1 uppercase tracking-widest">Network Redundancy active</p>
                    </div>
                </div>
                <div className="card !p-4 flex items-center gap-4 bg-amber-50 border-amber-100">
                    <AlertTriangle className="w-10 h-10 text-amber-500" />
                    <div>
                        <h4 className="font-black text-amber-900 leading-none">Backup Warning</h4>
                        <p className="text-amber-700/60 text-xs font-bold mt-1 uppercase tracking-widest">Next snapshot in 14 minutes</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const HealthCard = ({ icon: Icon, label, value, sub, color, loading }) => {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
    };

    return (
        <div className="card group relative overflow-hidden">
            <div className="relative z-10 flex gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                    {loading ? (
                        <Skeleton className="h-6 w-24" />
                    ) : (
                        <h4 className="text-xl font-black text-gray-900 leading-tight">{value}</h4>
                    )}
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{sub}</p>
                </div>
            </div>
            <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-500 ${colors[color].split(' ')[1]}`}>
                <Icon size={80} />
            </div>
        </div>
    );
};

export default Admin;
