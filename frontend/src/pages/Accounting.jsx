import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calculator, BookOpen, Repeat, Loader2, AlertCircle, Plus, Search, FileBarChart, Download } from 'lucide-react';
import api from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { exportToCSV } from '@/utils/exportUtils';
import Modal from '@/components/common/Modal';
import ActionButtons from '@/components/common/ActionButtons';
import AccountForm from '@/components/forms/AccountForm';
import JournalEntryForm from '@/components/forms/JournalEntryForm';

const Accounting = () => {
    const [activeTab, setActiveTab] = useState('coa');
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const { currencySymbol } = useSettings();

    const { data, isLoading, error } = useQuery({
        queryKey: ['accounting-data'],
        queryFn: async () => {
            const [accRes, txRes] = await Promise.all([
                api.get('/accounting/accounts').catch(() => ({ data: { data: [] } })),
                api.get('/accounting/transactions').catch(() => ({ data: { data: [] } }))
            ]);
            return {
                accounts: accRes.data.data || [],
                transactions: txRes.data.data || []
            };
        },
        refetchInterval: 30000,
    });

    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);

    const deleteMutation = useMutation({
        mutationFn: ({ endpoint, id }) => api.delete(`${endpoint}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounting-data'] });
        }
    });

    const accData = data || { accounts: [], transactions: [] };

    const handleExport = () => {
        if (activeTab === 'coa') exportToCSV(accData.accounts, 'ChartOfAccounts_Export');
        if (activeTab === 'gl') exportToCSV(accData.transactions, 'GeneralLedger_Export');
        if (activeTab === 'reports') alert('Export not implemented for reports yet.');
    };

    const getFilteredData = (list) => {
        if (!searchTerm) return list;
        return list.filter(item => {
            const str = JSON.stringify(item).toLowerCase();
            return str.includes(searchTerm.toLowerCase());
        });
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 md:gap-3">
                        <Calculator className="w-6 h-6 md:w-8 md:h-8 text-teal-600" />
                        Financial Accounting
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Manage Chart of Accounts, Journal Entries, and generate Financial Reports.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={handleExport} className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2 whitespace-nowrap bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-4 md:px-5 py-2.5 font-bold shadow-sm transition-all active:scale-95 text-sm md:text-base">
                        <Download size={18} /> <span className="hidden sm:inline">Export Ledger</span><span className="sm:hidden">Export</span>
                    </button>
                    {activeTab !== 'reports' && (
                        <button
                            onClick={() => {
                                if (activeTab === 'coa') setIsAccountModalOpen(true);
                                if (activeTab === 'gl') setIsJournalModalOpen(true);
                            }}
                            className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2 whitespace-nowrap bg-teal-600 text-white hover:bg-teal-700 rounded-xl px-4 md:px-5 py-2.5 font-bold shadow-md shadow-teal-500/20 transition-all active:scale-95 text-sm md:text-base"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">{activeTab === 'coa' ? 'New Ledger Account' : 'New Journal Entry'}</span>
                            <span className="sm:hidden">{activeTab === 'coa' ? 'New Account' : 'New Entry'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm overflow-x-auto hide-scrollbar">
                <div className="flex items-center min-w-max">
                    <button onClick={() => setActiveTab('coa')} className={`flex items-center gap-2 px-6 py-3 text-sm md:text-base font-black rounded-xl transition-all duration-300 ${activeTab === 'coa' ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'}`}>
                        <BookOpen size={18} /> Chart of Accounts <span className="text-[10px] ml-1 bg-teal-100/50 text-teal-600 px-2 py-0.5 rounded-full">{accData.accounts.length}</span>
                    </button>
                    <button onClick={() => setActiveTab('gl')} className={`flex items-center gap-2 px-6 py-3 text-sm md:text-base font-black rounded-xl transition-all duration-300 ${activeTab === 'gl' ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'}`}>
                        <Repeat size={18} /> General Ledger <span className="text-[10px] ml-1 bg-teal-100/50 text-teal-600 px-2 py-0.5 rounded-full">{accData.transactions.length}</span>
                    </button>
                    <button onClick={() => setActiveTab('reports')} className={`flex items-center gap-2 px-6 py-3 text-sm md:text-base font-black rounded-xl transition-all duration-300 ${activeTab === 'reports' ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'}`}>
                        <FileBarChart size={18} /> Statements
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full max-w-lg">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={`Search ${activeTab === 'coa' ? 'accounts' : 'transactions'}...`} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm md:text-base font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all shadow-sm" />
                </div>
                <select className="w-full sm:w-auto bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm md:text-base font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm cursor-pointer appearance-none">
                    <option>Filter: All Classifications</option>
                    <option>Asset</option>
                    <option>Liability</option>
                    <option>Equity</option>
                    <option>Revenue</option>
                    <option>Expense</option>
                </select>
            </div>

            {/* Main Data Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] md:min-h-[500px] overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4">
                        <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-teal-500 animate-spin" />
                        <p className="text-gray-500 font-bold text-sm md:text-base">Synchronizing financial ledger...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4 max-w-md mx-auto text-center p-6 bg-red-50/50 rounded-2xl m-6 border border-red-100">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2"><AlertCircle className="w-6 h-6 md:w-8 md:h-8" /></div>
                        <h3 className="text-lg md:text-xl font-black text-red-900">Connection Terminated</h3>
                        <p className="text-red-700/80 font-medium text-sm md:text-base">The client cannot connect to the backend database server.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto w-full pb-4">
                        {activeTab === 'coa' && (
                            getFilteredData(accData.accounts).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4 text-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100"><BookOpen className="w-8 h-8 md:w-10 md:h-10 text-gray-400" /></div>
                                    <h3 className="text-lg md:text-xl font-black text-gray-900">Empty Chart of Accounts</h3>
                                    <p className="text-gray-500 text-sm md:text-base font-medium">Create your first ledger account to populate this view.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left min-w-[700px]">
                                    <thead className="bg-gray-50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider font-black border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 md:px-6 py-4">Account Reference</th>
                                            <th className="px-4 md:px-6 py-4">Account Description</th>
                                            <th className="px-4 md:px-6 py-4">Classification</th>
                                            <th className="px-4 md:px-6 py-4 text-right">Running Balance</th>
                                            <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {getFilteredData(accData.accounts).map(account => (
                                            <tr key={account.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-4 md:px-6 py-4 font-mono font-black text-teal-600 text-sm md:text-base group-hover:text-teal-700 cursor-pointer">
                                                    {account.account_code || account.code || '-'}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-bold text-gray-800">
                                                    {account.name}
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] md:text-xs font-black uppercase tracking-widest border ${account.type === 'Asset' ? 'bg-blue-50 text-blue-700 border-blue-100' : account.type === 'Liability' ? 'bg-red-50 text-red-700 border-red-100' : account.type === 'Equity' ? 'bg-purple-50 text-purple-700 border-purple-100' : account.type === 'Revenue' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                                        {account.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-right text-sm md:text-base font-black text-gray-900 bg-gray-50/50">
                                                    {currencySymbol}{parseFloat(account.current_balance || account.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-right">
                                                    <ActionButtons onDelete={() => deleteMutation.mutate({ endpoint: '/accounting/accounts', id: account.id })} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        )}

                        {activeTab === 'gl' && (
                            getFilteredData(accData.transactions).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4 text-center">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100"><Repeat className="w-8 h-8 md:w-10 md:h-10 text-gray-400" /></div>
                                    <h3 className="text-lg md:text-xl font-black text-gray-900">Empty General Ledger</h3>
                                    <p className="text-gray-500 text-sm md:text-base font-medium">Post a journal entry to populate the transaction ledger.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left min-w-[800px]">
                                    <thead className="bg-gray-50 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider font-black border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 md:px-6 py-4">Timestamp</th>
                                            <th className="px-4 md:px-6 py-4">Transaction Details</th>
                                            <th className="px-4 md:px-6 py-4">Source Reference</th>
                                            <th className="px-4 md:px-6 py-4 text-right">Debit (Dr)</th>
                                            <th className="px-4 md:px-6 py-4 text-right">Credit (Cr)</th>
                                            <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {getFilteredData(accData.transactions).map(tx => (
                                            <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-4 md:px-6 py-4 text-sm font-bold text-gray-500">
                                                    {new Date(tx.transaction_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm md:text-base font-bold text-gray-800">
                                                    {tx.description}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 font-mono font-black text-gray-600 text-sm md:text-base">
                                                    {tx.reference_type} #{tx.reference_id}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-right text-sm md:text-base font-black text-emerald-600 bg-emerald-50/30">
                                                    {tx.entry_type === 'Debit' ? `${currencySymbol}${parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-right text-sm md:text-base font-black text-red-600 bg-red-50/30">
                                                    {tx.entry_type === 'Credit' ? `${currencySymbol}${parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-right">
                                                    <ActionButtons onDelete={() => deleteMutation.mutate({ endpoint: '/accounting/transactions', id: tx.id })} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        )}

                        {activeTab === 'reports' && (
                            <div className="flex flex-col items-center justify-center p-8 md:p-12 h-64 md:h-96 space-y-6 text-center">
                                <div className="w-16 h-16 md:w-24 md:h-24 bg-teal-50 rounded-[2rem] flex items-center justify-center border border-teal-100/50 shadow-inner">
                                    <FileBarChart className="w-8 h-8 md:w-12 md:h-12 text-teal-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Financial Statements</h3>
                                    <p className="text-gray-500 font-medium md:text-lg mt-2 max-w-lg mx-auto">Generate real-time consolidated reports from the financial backend node.</p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-3 mt-4">
                                    <button className="px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:border-teal-200 transition-all text-gray-800 active:scale-95">Income Statement</button>
                                    <button className="px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:border-teal-200 transition-all text-gray-800 active:scale-95">Balance Sheet</button>
                                    <button className="px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:border-teal-200 transition-all text-gray-800 active:scale-95">Trial Balance</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} title="Initialize Ledger Account Node" maxWidth="max-w-md">
                <AccountForm onSuccess={() => setIsAccountModalOpen(false)} onCancel={() => setIsAccountModalOpen(false)} />
            </Modal>

            <Modal isOpen={isJournalModalOpen} onClose={() => setIsJournalModalOpen(false)} title="Execute Journal Entry" maxWidth="max-w-2xl">
                <JournalEntryForm onSuccess={() => setIsJournalModalOpen(false)} onCancel={() => setIsJournalModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Accounting;
