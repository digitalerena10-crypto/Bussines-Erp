import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, ListTree, ArrowRightLeft, Loader2, AlertCircle, Plus, Search, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/services/api';
import { exportToCSV } from '@/utils/exportUtils';
import Modal from '@/components/common/Modal';
import ProductForm from '@/components/forms/ProductForm';
import CategoryForm from '@/components/forms/CategoryForm';
import StockForm from '@/components/forms/StockForm';

// Extracted Components
import ProductsTable from '@/components/inventory/ProductsTable';
import CategoriesTable from '@/components/inventory/CategoriesTable';
import StockLedgerTable from '@/components/inventory/StockLedgerTable';

const Inventory = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    const { data: inventoryData, isLoading, error } = useQuery({
        queryKey: ['inventory-data'],
        queryFn: async () => {
            const [prodRes, catRes, invRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories'),
                api.get('/inventory')
            ]);
            return {
                products: prodRes.data.data || [],
                categories: catRes.data.data || [],
                inventory: invRes.data.data || []
            };
        },
        refetchInterval: 30000,
    });

    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);

    const deleteMutation = useMutation({
        mutationFn: ({ endpoint, id }) => api.delete(`${endpoint}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory-data'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
    });

    const handleExport = () => {
        if (!inventoryData) return;
        if (activeTab === 'products') exportToCSV(inventoryData.products, 'Products_Export');
        if (activeTab === 'categories') exportToCSV(inventoryData.categories, 'Categories_Export');
        if (activeTab === 'stock') exportToCSV(inventoryData.inventory, 'StockLedger_Export');
    };

    const filteredProducts = inventoryData?.products?.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const filteredCategories = inventoryData?.categories?.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const filteredInventory = inventoryData?.inventory?.filter(i =>
        i.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const tabs = [
        { id: 'products', label: 'Products', icon: Package },
        { id: 'categories', label: 'Categories', icon: ListTree },
        { id: 'stock', label: 'Stock Ledger', icon: ArrowRightLeft },
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 md:gap-3">
                        <Package className="w-6 h-6 md:w-8 md:h-8 text-primary-600" />
                        Inventory Control
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Manage global products, taxonomy, and physical node distribution.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={handleExport} className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2 whitespace-nowrap bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-4 md:px-5 py-2.5 font-bold shadow-sm transition-all active:scale-95 text-sm md:text-base">
                        <Download size={18} /> <span className="hidden sm:inline">Export Snapshot</span><span className="sm:hidden">Export</span>
                    </button>
                    <button
                        onClick={() => {
                            if (activeTab === 'products') { setEditingProduct(null); setIsProductModalOpen(true); }
                            if (activeTab === 'categories') { setEditingCategory(null); setIsCategoryModalOpen(true); }
                            if (activeTab === 'stock') setIsStockModalOpen(true);
                        }}
                        className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2 whitespace-nowrap bg-primary-600 text-white hover:bg-primary-700 rounded-xl px-4 md:px-5 py-2.5 font-bold shadow-md shadow-primary-500/20 transition-all active:scale-95 text-sm md:text-base"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Create {activeTab === 'products' ? 'Product' : activeTab === 'categories' ? 'Category' : 'Stock'}</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col gap-4">
                {/* Tabs */}
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
                                    layoutId="activeInventoryTab"
                                    className="absolute inset-0 bg-primary-600 rounded-xl shadow-md shadow-primary-500/20"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <tab.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 relative z-10 ${activeTab === tab.id ? 'text-white' : 'text-primary-600'}`} />
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Filter */}
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={`Search ${activeTab} by name or SKU/ID...`}
                        className="w-full pl-10 md:pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm md:text-base font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] md:min-h-[500px] overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4">
                        <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-primary-500 animate-spin" />
                        <p className="text-gray-500 font-bold text-sm md:text-base">Synchronizing with persistence layer...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4 max-w-md mx-auto text-center p-6 bg-red-50/50 rounded-2xl m-6 border border-red-100">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2">
                            <AlertCircle className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-red-900">Database Offline</h3>
                        <p className="text-red-700/80 font-medium text-sm md:text-base">The application cannot communicate with the primary database replica.</p>
                    </div>
                ) : (
                    <div>
                        {activeTab === 'products' && (
                            <ProductsTable
                                products={filteredProducts}
                                onEdit={(product) => {
                                    setEditingProduct({
                                        ...product,
                                        stock_quantity: product.quantity || 0
                                    });
                                    setIsProductModalOpen(true);
                                }}
                                onDelete={(id) => deleteMutation.mutate({ endpoint: '/products', id })}
                            />
                        )}

                        {activeTab === 'categories' && (
                            <CategoriesTable
                                categories={filteredCategories}
                                onEdit={(category) => { setEditingCategory(category); setIsCategoryModalOpen(true); }}
                                onDelete={(id) => deleteMutation.mutate({ endpoint: '/categories', id })}
                            />
                        )}

                        {activeTab === 'stock' && (
                            <StockLedgerTable inventory={filteredInventory} />
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <Modal isOpen={isProductModalOpen} onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }} title={editingProduct ? 'Update Product Profile' : 'Initialize New Product'} maxWidth="max-w-2xl">
                <ProductForm
                    key={editingProduct?.id || 'new'}
                    onSuccess={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
                    onCancel={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
                    categories={inventoryData?.categories || []}
                    suppliers={[]}
                    initialData={editingProduct}
                />
            </Modal>

            <Modal isOpen={isCategoryModalOpen} onClose={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }} title={editingCategory ? 'Update Taxonomy Node' : 'Initialize Category Node'} maxWidth="max-w-md">
                <CategoryForm
                    key={editingCategory?.id || 'new'}
                    onSuccess={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }}
                    onCancel={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }}
                    categories={inventoryData?.categories || []}
                    initialData={editingCategory}
                />
            </Modal>

            <Modal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} title="Execute Stock Transaction" maxWidth="max-w-xl">
                <StockForm onSuccess={() => setIsStockModalOpen(false)} onCancel={() => setIsStockModalOpen(false)} products={inventoryData?.products || []} />
            </Modal>
        </div>
    );
};

export default Inventory;
