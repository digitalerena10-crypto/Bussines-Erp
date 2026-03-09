import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';

const JournalEntryForm = ({ onSuccess, onCancel }) => {
    const queryClient = useQueryClient();

    // Fetch Chart of Accounts to select from
    const { data: accounts = [], isLoading } = useQuery({
        queryKey: ['accounts'],
        queryFn: () => api.get('/accounts/accounts').then(res => res.data.data)
    });

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        reference: '',
        description: ''
    });

    const [lines, setLines] = useState([
        { id: 1, account_id: '', account_name: '', debit: '', credit: '', description: '' },
        { id: 2, account_id: '', account_name: '', debit: '', credit: '', description: '' }
    ]);

    const totals = useMemo(() => {
        let debit = 0;
        let credit = 0;
        lines.forEach(line => {
            debit += parseFloat(line.debit) || 0;
            credit += parseFloat(line.credit) || 0;
        });
        return { debit, credit, isBalanced: Math.abs(debit - credit) < 0.01 && debit > 0 };
    }, [lines]);

    const mutation = useMutation({
        mutationFn: (journalData) => api.post('/accounts/journals', journalData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            onSuccess();
        }
    });

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLineChange = (id, field, value) => {
        setLines(prev => prev.map(line => {
            if (line.id === id) {
                const updated = { ...line, [field]: value };
                if (field === 'account_id') {
                    const acc = accounts.find(a => a.id === value);
                    updated.account_name = acc ? acc.name : '';
                }
                // clear the other side if one is typed
                if (field === 'debit' && value !== '') updated.credit = '';
                if (field === 'credit' && value !== '') updated.debit = '';
                return updated;
            }
            return line;
        }));
    };

    const addLine = () => {
        setLines(prev => [...prev, { id: Date.now(), account_id: '', account_name: '', debit: '', credit: '', description: '' }]);
    };

    const removeLine = (id) => {
        if (lines.length <= 2) return;
        setLines(prev => prev.filter(line => line.id !== id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!totals.isBalanced) {
            alert('Debits must equal Credits.');
            return;
        }

        if (lines.some(l => !l.account_id)) {
            alert('All lines must have an account selected.');
            return;
        }

        mutation.mutate({
            ...formData,
            lines: lines.map(l => ({
                account_id: l.account_id,
                account_name: l.account_name,
                debit: parseFloat(l.debit) || 0,
                credit: parseFloat(l.credit) || 0,
                description: l.description
            }))
        });
    };

    if (isLoading) return <div className="p-6 flex justify-center"><Loader2 className="animate-spin text-primary-500" /></div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input required type="date" name="date" value={formData.date} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                    <input type="text" name="reference" value={formData.reference} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. ADJ-001" />
                </div>
                <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Memo / Description *</label>
                    <input required type="text" name="description" value={formData.description} onChange={handleFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Reason for journal entry..." />
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700 text-sm">Line Items</h3>
                    <button type="button" onClick={addLine} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        <Plus size={16} /> Add Line
                    </button>
                </div>

                <div className="p-4 space-y-3 max-h-[40vh] overflow-y-auto">
                    {/* Header Desktop */}
                    <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        <div className="col-span-4">Account</div>
                        <div className="col-span-3">Description</div>
                        <div className="col-span-2 text-right">Debit</div>
                        <div className="col-span-2 text-right">Credit</div>
                        <div className="col-span-1"></div>
                    </div>

                    {lines.map(line => (
                        <div key={line.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded border border-gray-100 sm:border-transparent">
                            <div className="col-span-4">
                                <label className="sm:hidden block text-xs text-gray-500 mb-1">Account</label>
                                <select required value={line.account_id} onChange={e => handleLineChange(line.id, 'account_id', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white">
                                    <option value="">Select Account</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                                </select>
                            </div>
                            <div className="col-span-3">
                                <label className="sm:hidden block text-xs text-gray-500 mb-1">Line Desc.</label>
                                <input type="text" value={line.description} onChange={e => handleLineChange(line.id, 'description', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="Optional" />
                            </div>
                            <div className="col-span-2 flex sm:block gap-2">
                                <div className="flex-1">
                                    <label className="sm:hidden block text-xs text-gray-500 mb-1">Debit</label>
                                    <input type="number" step="0.01" min="0" value={line.debit} onChange={e => handleLineChange(line.id, 'debit', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:border-blue-500" placeholder="0.00" />
                                </div>
                            </div>
                            <div className="col-span-2 flex sm:block gap-2">
                                <div className="flex-1">
                                    <label className="sm:hidden block text-xs text-gray-500 mb-1">Credit</label>
                                    <input type="number" step="0.01" min="0" value={line.credit} onChange={e => handleLineChange(line.id, 'credit', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:border-red-500" placeholder="0.00" />
                                </div>
                            </div>
                            <div className="col-span-1 flex justify-end">
                                <button type="button" onClick={() => removeLine(line.id)} disabled={lines.length <= 2} className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 rounded">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Totals */}
                <div className="bg-gray-50 border-t border-gray-200 p-4 pb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-sm font-bold text-gray-800">
                        <div className="col-span-7 sm:text-right pt-1 pb-1 pr-4">Totals:</div>
                        <div className={`col-span-2 text-right pt-1 pb-1 px-2 border-b-2 ${totals.isBalanced ? 'border-primary-500' : 'border-red-500 text-red-600'}`}>${totals.debit.toFixed(2)}</div>
                        <div className={`col-span-2 text-right pt-1 pb-1 px-2 border-b-2 ${totals.isBalanced ? 'border-primary-500' : 'border-red-500 text-red-600'}`}>${totals.credit.toFixed(2)}</div>
                        <div className="col-span-1"></div>
                    </div>
                    {!totals.isBalanced && totals.debit > 0 && totals.credit > 0 && (
                        <div className="text-right text-xs text-red-500 font-medium mt-1">Out of balance by ${Math.abs(totals.debit - totals.credit).toFixed(2)}</div>
                    )}
                </div>
            </div>

            {mutation.isError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                    {mutation.error.response?.data?.message || 'Failed to preserve journal entry.'}
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={mutation.isPending || !totals.isBalanced} className="flex-1 px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg transition-colors flex justify-center items-center disabled:opacity-50">
                    {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Journal Entry'}
                </button>
            </div>
        </form>
    );
};

export default JournalEntryForm;
