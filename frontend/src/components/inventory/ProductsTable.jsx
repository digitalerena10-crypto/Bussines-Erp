import { Package } from 'lucide-react';
import ActionButtons from '../common/ActionButtons';

const ProductsTable = ({ products, onEdit, onDelete }) => {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 md:h-64 space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                    <Package size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                <p className="text-gray-500 text-sm text-center">Create your first product to see it here.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[700px]">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-gray-100">
                    <tr>
                        <th className="px-4 md:px-6 py-4">Product Name</th>
                        <th className="px-4 md:px-6 py-4">SKU</th>
                        <th className="px-4 md:px-6 py-4 hidden md:table-cell">Category</th>
                        <th className="px-4 md:px-6 py-4">Price</th>
                        <th className="px-4 md:px-6 py-4">Stock</th>
                        <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {products.map(product => {
                        const quantity = Number(product.quantity || 0);
                        const minStock = Number(product.min_stock_level || 5);
                        let stockBadgeClass = 'bg-green-50 text-green-700 border-green-200';
                        if (quantity <= 0) stockBadgeClass = 'bg-red-50 text-red-700 border-red-200';
                        else if (quantity <= minStock) stockBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';

                        return (
                            <tr key={product.id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-4 md:px-6 py-4">
                                    <div className="font-bold text-gray-900 text-sm md:text-base">{product.name}</div>
                                    <div className="text-xs font-medium text-gray-500 bg-gray-100 inline-block px-1.5 py-0.5 rounded mt-1">{product.brand || 'No Brand'}</div>
                                    <div className="text-xs font-medium text-gray-400 mt-1 md:hidden">Cat: {product.category_name || '-'}</div>
                                </td>
                                <td className="px-4 md:px-6 py-4">
                                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                        {product.sku}
                                    </span>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-600 hidden md:table-cell">
                                    <span className="bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                                        {product.category_name || '-'}
                                    </span>
                                </td>
                                <td className="px-4 md:px-6 py-4">
                                    <div className="text-sm font-black text-gray-900 bg-gray-50 inline-block px-2.5 py-1 rounded-lg border border-gray-100">
                                        ${Number(product.base_price).toFixed(2)}
                                    </div>
                                </td>
                                <td className="px-4 md:px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black border ${stockBadgeClass}`}>
                                        <Package className="w-3 h-3 mr-1.5 opacity-70" />
                                        {quantity}
                                    </span>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-right">
                                    <ActionButtons onEdit={() => onEdit(product)} onDelete={() => onDelete(product.id)} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ProductsTable;
