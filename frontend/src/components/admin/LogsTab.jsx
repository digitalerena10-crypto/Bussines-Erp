import { History, AlertTriangle } from 'lucide-react';
import { TableSkeleton } from '@/components/common/SkeletonLoader';

const LogsTab = ({ logs, isLoading, isError }) => {
    if (isError) {
        return (
            <div className="card p-8 md:p-12 text-center border border-red-100 bg-red-50/30 m-4">
                <AlertTriangle className="w-10 h-10 md:w-12 md:h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-red-900">Connection Error</h3>
                <p className="text-red-700 font-medium mt-2 max-w-md mx-auto text-sm md:text-base">Unable to fetch audit logs from the backend server. Please check your network connection or try restarting the backend service.</p>
            </div>
        );
    }

    return (
        <div className="card overflow-hidden !p-0 border border-gray-100 shadow-md sm:m-4 m-2">
            <div className="p-4 md:p-6 bg-white border-b border-gray-100 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                <h3 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-3">
                    <History className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
                    System Audit Trail
                </h3>
                <span className="bg-amber-50 border border-amber-200/60 text-amber-700 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-2 self-start sm:self-auto">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Live Feed
                </span>
            </div>
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[600px] md:min-w-full">
                    <thead className="bg-gray-50/80">
                        <tr>
                            <th className="px-4 md:px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Timestamp</th>
                            <th className="px-4 md:px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Administrator</th>
                            <th className="px-4 md:px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Action Executed</th>
                            <th className="px-4 md:px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Origin Resource</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {isLoading ? (
                            <tr><td colSpan="4" className="p-4 md:p-8"><TableSkeleton rows={8} /></td></tr>
                        ) : logs?.length > 0 ? (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                        <div className="text-xs md:text-sm font-bold text-gray-900">{new Date(log.created_at).toLocaleTimeString()}</div>
                                        <div className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">{new Date(log.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center font-black text-indigo-700 text-xs md:text-sm shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                                                {log.user_name?.charAt(0) || '?'}
                                            </div>
                                            <span className="text-xs md:text-sm font-black text-gray-700 whitespace-nowrap">{log.user_name || 'System Auto'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4">
                                        <span className="text-[10px] md:text-xs font-black uppercase tracking-wider bg-gray-100 text-gray-700 px-2 py-1 md:px-2.5 md:py-1 rounded-md border border-gray-200 whitespace-nowrap inline-block">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-[10px] md:text-sm font-black text-gray-500 uppercase tracking-widest truncate max-w-[150px] md:max-w-none">{log.resource || log.module || 'Unknown'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-10 md:p-20 text-center">
                                    <History className="w-10 h-10 md:w-12 md:h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-400 font-bold text-sm md:text-base">No security events recorded in the current window.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LogsTab;
