import { MapPin, Mail, Phone, Eye, Users } from 'lucide-react';
import ActionButtons from '../common/ActionButtons';

const CustomersTable = ({ customers, salesOrders, invoices, onEdit, onDelete, onViewProfile }) => {
    const getCustomerStats = (customerId) => {
        const orders = salesOrders.filter(o => o.customer_id == customerId);
        const custInvoices = invoices.filter(i => i.customer_id == customerId);
        const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
        const unpaidInvoices = custInvoices.filter(i => i.status === 'unpaid').length;
        return { orderCount: orders.length, totalSpent, invoiceCount: custInvoices.length, unpaidInvoices };
    };

    if (customers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 md:h-64 space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                    <Users size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No customers found</h3>
                <p className="text-gray-500 text-sm text-center">Add your first customer to get started.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[750px]">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                    <tr>
                        <th className="px-4 md:px-6 py-4">Customer</th>
                        <th className="px-4 md:px-6 py-4">Contact</th>
                        <th className="px-4 md:px-6 py-4 text-center">Orders</th>
                        <th className="px-4 md:px-6 py-4">Total Spent</th>
                        <th className="px-4 md:px-6 py-4 text-center">Invoices</th>
                        <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {customers.map(customer => {
                        const stats = getCustomerStats(customer.id);
                        return (
                            <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-4 md:px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center font-black text-primary-700 text-sm md:text-base shadow-sm shrink-0 hover:scale-105 transition-transform">
                                            {customer.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 text-sm md:text-base truncate">{customer.name}</p>
                                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5 mt-1">
                                                <MapPin className="w-3 h-3 shrink-0" />
                                                <span className="truncate max-w-[120px] md:max-w-xs">{customer.address || 'No address'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 md:px-6 py-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded inline-flex border border-gray-100 md:bg-transparent md:border-transparent md:px-0 md:py-0">
                                            <Mail className="w-3.5 h-3.5 text-gray-400" /> <span className="truncate max-w-[120px]">{customer.email || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded inline-flex border border-gray-100 md:bg-transparent md:border-transparent md:px-0 md:py-0">
                                            <Phone className="w-3.5 h-3.5 text-gray-400" /> <span>{customer.phone || '-'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-center">
                                    <span className="inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-lg text-xs font-black bg-blue-50 text-blue-700 border border-blue-100">
                                        {stats.orderCount}
                                    </span>
                                </td>
                                <td className="px-4 md:px-6 py-4">
                                    <span className="font-black text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 text-sm md:text-base">
                                        ${stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-sm font-bold text-gray-700">{stats.invoiceCount} Total</span>
                                        {stats.unpaidInvoices > 0 ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-red-50 text-red-600 border border-red-100">
                                                {stats.unpaidInvoices} Unpaid
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                All Paid
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => onViewProfile(customer)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="View Profile">
                                            <Eye size={18} />
                                        </button>
                                        <ActionButtons onEdit={() => onEdit(customer)} onDelete={() => onDelete(customer.id)} />
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

export default CustomersTable;
