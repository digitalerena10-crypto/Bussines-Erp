import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, Save, FileText, Loader2 } from 'lucide-react';
import api from '../services/api';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    // Check if we passed a sales_order_id in state to auto-fill (optional)
    const initialSalesOrderId = location.state?.sales_order_id || '';

    // Fetch master data needed for the form
    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => api.get('/customers').then(res => res.data.data)
    });

    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => api.get('/products').then(res => res.data.data)
    });

    const { data: salesOrders = [] } = useQuery({
        queryKey: ['sales-orders'],
        queryFn: () => api.get('/sales/orders').then(res => res.data.data)
    });

    // Form State
    const [customerId, setCustomerId] = useState('');
    const [salesOrderId, setSalesOrderId] = useState(initialSalesOrderId);
    const [taxAmount, setTaxAmount] = useState('0');
    const [discountAmount, setDiscountAmount] = useState('0');
    const [shippingAmount, setShippingAmount] = useState('0');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([
        { id: Date.now(), product_id: '', description: '', quantity: 1, unit_price: 0 }
    ]);

    // Derived totals
    const totals = useMemo(() => {
        let subtotal = 0;

        items.forEach(item => {
            const rowSubtotal = (item.quantity * item.unit_price) || 0;
            subtotal += rowSubtotal;
        });

        const tax = Number(taxAmount) || 0;
        const discount = Number(discountAmount) || 0;
        const shipping = Number(shippingAmount) || 0;

        return {
            subtotal,
            grandTotal: subtotal + tax + shipping - discount
        };
    }, [items, taxAmount, discountAmount, shippingAmount]);

    // Handle auto-filling from sales order
    useEffect(() => {
        if (salesOrderId) {
            // Ideally we'd fetch the specific SO details to get items, 
            // but for this mock we just try to find it in the list to set the customer.
            const so = salesOrders.find(s => s.id === salesOrderId);
            if (so) {
                setCustomerId(so.customer_id);
            }
        }
    }, [salesOrderId, salesOrders]);

    // Mutations
    const invoiceMutation = useMutation({
        mutationFn: (newInvoice) => api.post('/sales/invoices', newInvoice),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales-invoices'] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            navigate('/sales');
        }
    });

    // Handlers
    const addItem = () => {
        setItems(prev => [...prev, { id: Date.now(), product_id: '', description: '', quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (id) => {
        if (items.length === 1) return; // Must have at least one item
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const handleItemChange = (id, field, value) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                // Auto-fill price and description if product changes
                if (field === 'product_id') {
                    const selectedProduct = products.find(p => p.id === value);
                    if (selectedProduct) {
                        updated.unit_price = selectedProduct.base_price;
                        updated.description = selectedProduct.name;
                    }
                }
                return updated;
            }
            return item;
        }));
    };

    const handleSaveInvoice = (e) => {
        e.preventDefault();

        // Validation
        if (!customerId) return alert("Please select a customer.");
        if (items.some(i => i.quantity <= 0)) return alert("Please ensure all items have a valid quantity.");
        if (items.some(i => !i.description && !i.product_id)) return alert("Please provide a product or description for all items.");

        const payload = {
            customer_id: customerId,
            sales_order_id: salesOrderId || null,
            branch_id: '1',
            tax_amount: Number(taxAmount) || 0,
            discount_amount: Number(discountAmount) || 0,
            shipping_amount: Number(shippingAmount) || 0,
            items: items.map(i => ({
                product_id: i.product_id || null,
                description: i.description || 'Custom Item',
                quantity: Number(i.quantity),
                unit_price: Number(i.unit_price)
            })),
            notes
        };

        invoiceMutation.mutate(payload);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
                    <p className="text-sm text-gray-500 mt-1">Generate a new invoice for a customer.</p>
                </div>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-6">
                {/* General Information */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">1. Invoice Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                            <select required value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white">
                                <option value="">-- Choose Customer --</option>
                                {customers?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link to Sales Order (Optional)</label>
                            <select value={salesOrderId} onChange={e => setSalesOrderId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white">
                                <option value="">-- None --</option>
                                {salesOrders?.filter(so => so.customer_id === customerId || !customerId).map(so => (
                                    <option key={so.id} value={so.id}>{so.order_number} (${Number(so.total_amount).toFixed(2)})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold text-gray-900">2. Description / Line Items</h2>
                        <button type="button" onClick={addItem} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                            <Plus size={16} /> Add Item
                        </button>
                    </div>

                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b border-gray-100 pb-2">
                        <div className="col-span-3">Product (Optional)</div>
                        <div className="col-span-4">Description</div>
                        <div className="col-span-2">Quantity</div>
                        <div className="col-span-2">Unit Price</div>
                        <div className="col-span-1 text-right">Total</div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start md:items-center bg-gray-50 p-3 md:p-0 md:bg-transparent rounded-lg relative">
                                {/* Product selector */}
                                <div className="col-span-1 md:col-span-3">
                                    <label className="md:hidden block text-xs font-medium text-gray-500 mb-1">Product</label>
                                    <select
                                        value={item.product_id}
                                        onChange={e => handleItemChange(item.id, 'product_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                                    >
                                        <option value="">Custom Item...</option>
                                        {products?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div className="col-span-1 md:col-span-4">
                                    <label className="md:hidden block text-xs font-medium text-gray-500 mb-1">Description *</label>
                                    <input type="text" required value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm" placeholder="Service or Item Description" />
                                </div>

                                <div className="col-span-1 md:col-span-2 flex gap-2 w-full">
                                    <div className="flex-1">
                                        <label className="md:hidden block text-xs font-medium text-gray-500 mb-1">Qty</label>
                                        <input type="number" min="0.01" step="0.01" required value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} className="w-[80px] px-3 py-2 border border-gray-200 rounded-md text-sm" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="md:hidden block text-xs font-medium text-gray-500 mb-1">Price</label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                            <input type="number" step="0.01" value={item.unit_price} onChange={e => handleItemChange(item.id, 'unit_price', e.target.value)} className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-md text-sm" />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-3 flex justify-between items-center md:justify-end gap-4 w-full md:w-auto">
                                    <div className="font-medium text-gray-900 text-right md:w-full">
                                        <label className="md:hidden block text-xs font-medium text-gray-500 mb-1 text-left">Line Total</label>
                                        ${(item.quantity * item.unit_price).toFixed(2)}
                                    </div>

                                    <button type="button" onClick={() => removeItem(item.id)} disabled={items.length === 1} className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors absolute top-2 right-2 md:static mt-6 md:mt-0 bg-white md:bg-transparent rounded-full md:rounded-none shadow-sm md:shadow-none border border-gray-200 md:border-none">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Invoice notes, payment instructions, etc..." rows={4} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 resize-none" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium text-gray-500 mb-2">
                                <span>Subtotal</span>
                                <span>${totals.subtotal.toFixed(2)}</span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Tax Amount (+)</label>
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                    <input type="number" step="0.01" value={taxAmount} onChange={e => setTaxAmount(e.target.value)} className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 text-sm text-right font-medium" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Shipping (+)</label>
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                    <input type="number" step="0.01" value={shippingAmount} onChange={e => setShippingAmount(e.target.value)} className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 text-sm text-right font-medium" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 pb-3 border-b border-gray-100">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Discount (-)</label>
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                    <input type="number" step="0.01" value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 text-sm text-right font-medium text-red-600" />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-1 text-lg font-bold text-gray-900">
                                <span>Grand Total</span>
                                <span>${totals.grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary & Actions */}
                <div className="flex justify-end gap-3 pt-6">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={invoiceMutation.isPending} className="px-6 py-2 text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2">
                        {invoiceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                        Save Invoice
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateInvoice;
