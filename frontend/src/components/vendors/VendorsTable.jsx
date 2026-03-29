import { MapPin, Mail, Phone, Eye, Truck } from 'lucide-react';
import ActionButtons from '../common/ActionButtons';

const VendorsTable = ({ suppliers, purchaseOrders, products, onEdit, onDelete, onViewProfile }) => {
    const getSupplierStats = (supplierId) => {
        const orders = purchaseOrders.filter(o => o.supplier_id == supplierId);
        const totalPurchased = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
        const suppliedProducts = products.filter(p => p.supplier_id == supplierId).length;
        return { orderCount: orders.length, totalPurchased, suppliedProducts };
    };

    if (suppliers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 md:h-64 space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                    <Truck size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No vendors found</h3>
                <p className="text-gray-500 text-sm text-center">Add your first vendor to start tracking.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[750px]">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                    <tr>
                        <th className="px-4 md:px-6 py-4">Vendor</th>
                        <th className="px-4 md:px-6 py-4">Contact</th>
                        <th className="px-4 md:px-6 py-4 text-center">Orders</th>
                        <th className="px-4 md:px-6 py-4">Total Purchased</th>
                        <th className="px-4 md:px-6 py-4 text-center">Products</th>
                        <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {suppliers.map(supplier => {
                        const stats = getSupplierStats(supplier.id);
                        return (
                            <tr key={supplier.id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-4 md:px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center font-black text-orange-700 text-sm md:text-base shadow-sm shrink-0 hover:scale-105 transition-transform">
                                            {supplier.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 text-sm md:text-base truncate">{supplier.name}</p>
                                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5 mt-1">
                                                <MapPin className="w-3 h-3 shrink-0" />
                                                <span className="truncate max-w-[120px] md:max-w-xs">{supplier.address || 'No address'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 md:px-6 py-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded inline-flex border border-gray-100 md:bg-transparent md:border-transparent md:px-0 md:py-0">
                                            <Mail className="w-3.5 h-3.5 text-gray-400" /> <span className="truncate max-w-[120px]">{supplier.email || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded inline-flex border border-gray-100 md:bg-transparent md:border-transparent md:px-0 md:py-0">
                                            <Phone className="w-3.5 h-3.5 text-gray-400" /> <span>{supplier.phone || '-'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-center">
                                    <span className="inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-lg text-xs font-black bg-blue-50 text-blue-700 border border-blue-100">
                                        {stats.orderCount} POs
                                    </span>
                                </td>
                                <td className="px-4 md:px-6 py-4">
                                    <span className="font-black text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 text-sm md:text-base">
                                        ${stats.totalPurchased.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-center">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-violet-50 text-violet-700 border border-violet-100">
                                        {stats.suppliedProducts} Items
                                    </span>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => onViewProfile(supplier)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="View Profile">
                                            <Eye size={18} />
                                        </button>
                                        <ActionButtons onEdit={() => onEdit(supplier)} onDelete={() => onDelete(supplier.id)} />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default VendorsTable;
