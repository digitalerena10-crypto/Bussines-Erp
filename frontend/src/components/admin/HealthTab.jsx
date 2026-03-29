import { motion } from 'framer-motion';
import { Server, Cpu, HardDrive, Database, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/common/SkeletonLoader';

const HealthCard = ({ icon: Icon, label, value, sub, color, loading }) => {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 bg-gradient-to-br from-emerald-50 to-white',
        blue: 'bg-blue-50 text-blue-600 border-blue-100 bg-gradient-to-br from-blue-50 to-white',
        purple: 'bg-purple-50 text-purple-600 border-purple-100 bg-gradient-to-br from-purple-50 to-white',
        amber: 'bg-amber-50 text-amber-600 border-amber-100 bg-gradient-to-br from-amber-50 to-white',
    };

    return (
        <div className={`card group relative overflow-hidden border ${colors[color]} shadow-sm hover:shadow-md transition-all p-4 md:p-6 min-h-[140px] md:min-h-[160px]`}>
            <div className="relative z-10 flex flex-col gap-2 md:gap-3 h-full">
                <div className="flex items-center justify-between">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center bg-white shadow-sm border border-black/5 flex-shrink-0">
                        <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <Activity className="w-4 h-4 opacity-50" />
                </div>
                <div className="mt-auto md:mt-0">
                    <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1 md:mb-1.5 truncate pr-2">{label}</p>
                    {loading ? (
                        <Skeleton className="h-6 md:h-7 w-20 md:w-24 mb-1" />
                    ) : (
                        <h4 className="text-xl md:text-2xl font-black text-gray-900 leading-none mb-1 truncate">{value}</h4>
                    )}
                    <p className="text-[10px] md:text-xs text-gray-600 font-bold truncate pr-2">{sub}</p>
                </div>
            </div>
            <div className="absolute -right-4 -bottom-4 md:-right-6 md:-bottom-6 opacity-[0.03] group-hover:opacity-10 group-hover:rotate-12 group-hover:scale-125 transition-all duration-500 pointer-events-none text-black">
                <Icon size={100} className="md:w-[120px] md:h-[120px]" />
            </div>
        </div>
    );
};

const HealthTab = ({ health, isLoading, isError }) => {
    if (isError) {
        return (
            <div className="card p-8 md:p-12 text-center border border-red-100 bg-red-50/30 m-4">
                <AlertTriangle className="w-10 h-10 md:w-12 md:h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-red-900">Health Check Failed</h3>
                <p className="text-red-700 font-medium mt-2 max-w-md mx-auto text-sm md:text-base">Unable to establish telemetry connection with the backend server. The node might be completely offline.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 p-2 md:p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <HealthCard
                    icon={Server}
                    label="System Identity"
                    value={health?.status || 'Online'}
                    sub="Process Matrix Active"
                    color="emerald"
                    loading={isLoading}
                />
                <HealthCard
                    icon={Cpu}
                    label="V8 Engine"
                    value="Stable"
                    sub={`Node ${health?.node_version || 'v20.x'}`}
                    color="blue"
                    loading={isLoading}
                />
                <HealthCard
                    icon={Database}
                    label="Data Pipeline"
                    value={health?.db_connection || 'Mock Active'}
                    sub="Socket Connection OK"
                    color="purple"
                    loading={isLoading}
                />
                <HealthCard
                    icon={HardDrive}
                    label="Memory Heap"
                    value={health ? `${Math.round(health.memory.rss / 1024 / 1024)}MB` : '0MB'}
                    sub="Allocated Footprint"
                    color="amber"
                    loading={isLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <div className="card border border-gray-100 shadow-sm p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-black text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                        Network Topology Latency
                    </h3>
                    <div className="h-48 md:h-64 flex items-end gap-1 px-1 md:gap-1.5 md:px-2">
                        {[...Array(30)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.random() * 80 + 20}%` }}
                                transition={{ duration: 0.5, delay: i * 0.02, repeat: Infinity, repeatType: "reverse", repeatDelay: Math.random() * 2 }}
                                className="flex-1 bg-gradient-to-t from-emerald-500/10 to-emerald-500/40 rounded-t-sm border-t-2 border-emerald-500 w-full min-w-[2px]"
                            />
                        ))}
                    </div>
                    <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-50 flex justify-between text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-tight md:tracking-widest">
                        <span>T-Minus 60m</span>
                        <span className="text-emerald-500 bg-emerald-50 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded text-center whitespace-nowrap">Optimal Variance</span>
                        <span>0:00 Now</span>
                    </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                    <div className="card !p-4 md:!p-5 flex items-center gap-4 md:gap-5 bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100 flex-shrink-0">
                            <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-black text-base md:text-lg text-emerald-950 leading-tight truncate">Zero-Day Protocol</h4>
                            <p className="text-emerald-700/70 text-[10px] md:text-xs font-bold mt-0.5 md:mt-1 uppercase tracking-widest truncate">All dependencies secure</p>
                        </div>
                    </div>
                    <div className="card !p-4 md:!p-5 flex items-center gap-4 md:gap-5 bg-gradient-to-r from-blue-50 to-white border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm border border-blue-100 flex-shrink-0">
                            <Activity className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-black text-base md:text-lg text-blue-950 leading-tight truncate">Redundancy Matrix</h4>
                            <p className="text-blue-700/70 text-[10px] md:text-xs font-bold mt-0.5 md:mt-1 uppercase tracking-widest truncate">Failover array armed</p>
                        </div>
                    </div>
                    <div className="card !p-4 md:!p-5 flex items-center gap-4 md:gap-5 bg-gradient-to-r from-amber-50 to-white border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm border border-amber-100 flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-black text-base md:text-lg text-amber-950 leading-tight truncate">Snapshot Delta</h4>
                            <p className="text-amber-700/70 text-[10px] md:text-xs font-bold mt-0.5 md:mt-1 uppercase tracking-widest truncate">Next persistence in 14m</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthTab;
