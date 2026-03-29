import { ArrowRightLeft, MapPin } from 'lucide-react';

const StockLedgerTable = ({ inventory }) => {
    if (inventory.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 md:h-64 space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                    <ArrowRightLeft size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No stock records found</h3>
                <p className="text-gray-500 text-sm text-center">Add initial stock to see it here.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[600px]">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                    <tr>
                        <th className="px-4 md:px-6 py-4">Hardware Profile</th>
                        <th className="px-4 md:px-6 py-4">SKU / ID</th>
                        <th className="px-4 md:px-6 py-4">Node Location</th>
                        <th className="px-4 md:px-6 py-4">Quantity Available</th>
                        <th className="px-4 md:px-6 py-4 hidden sm:table-cell">Last Sync</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {inventory.map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors group">
                            <td className="px-4 md:px-6 py-4">
                                <div className="font-bold text-gray-900 text-sm md:text-base">{inv.product_name}</div>
                            </td>
                            <td className="px-4 md:px-6 py-4">
                                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                    {inv.sku}
                                </span>
                            </td>
                            <td className="px-4 md:px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="text-xs md:text-sm font-bold text-slate-700">{inv.branch_name}</span>
                                </div>
                            </td>
                            <td className="px-4 md:px-6 py-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black border ${Number(inv.quantity) <= Number(inv.min_stock_level) ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                    {inv.quantity} Units
                                </span>
                            </td>
                            <td className="px-4 md:px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                {inv.last_updated ? new Date(inv.last_updated).toLocaleDateString() : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StockLedgerTable;
