import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, RefreshCw, Database, CheckCircle2, AlertTriangle, Loader2, Shield, KeyRound, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Skeleton } from '@/components/common/SkeletonLoader';
import { useLicense } from '@/context/LicenseContext';

const SettingsTab = () => {
    const queryClient = useQueryClient();
    const { tier, remainingFormatted, deactivateLicense, isLicenseActive } = useLicense();
    
    const fileInputRef = useRef(null);
    const [logoPreview, setLogoPreview] = useState(null);
    
    const [formData, setFormData] = useState({
        company_name: '',
        company_email: '',
        company_phone: '',
        address: '',
        currency: 'USD',
        timezone: 'UTC'
    });
    const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });

    // Fetch Settings
    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await api.get('/admin/settings');
            return res.data.data;
        },
        retry: 1
    });

    // Populate form data when settings load
    useEffect(() => {
        if (settings) {
            setFormData({
                company_name: settings.company_name || 'Antigravity Enterprise',
                company_email: settings.company_email || 'support@antigravity.ai',
                company_phone: settings.company_phone || '+1 (555) 123-4567',
                address: settings.address || '123 Tech Avenue, SP',
                currency: settings.currency || 'USD',
                timezone: settings.timezone || 'UTC'
            });
            if (settings.logo_url) {
                setLogoPreview(settings.logo_url);
            }
        }
    }, [settings]);

    // Mutation for Settings
    const mutation = useMutation({
        mutationFn: async (newData) => {
            const res = await api.put('/admin/settings', newData);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['settings']);
            setSaveStatus({ type: 'success', message: 'Settings saved successfully!' });
            setTimeout(() => setSaveStatus({ type: '', message: '' }), 5000);
        },
        onError: (error) => {
            console.error('Settings save failed:', error);
            setSaveStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to save settings. Check connection.'
            });
        }
    });

    // Logo Upload Mutation
    const logoMutation = useMutation({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append('logo', file);
            const res = await api.post('/admin/upload-logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['settings']);
            setSaveStatus({ type: 'success', message: 'Logo uploaded successfully!' });
            setLogoPreview(data.data.logo_url);
            setTimeout(() => setSaveStatus({ type: '', message: '' }), 5000);
        },
        onError: (error) => {
            console.error('Logo upload failed:', error);
            setSaveStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to upload logo.'
            });
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSaveStatus({ type: '', message: '' });
        mutation.mutate(formData);
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSaveStatus({ type: '', message: '' });
            logoMutation.mutate(file);
        }
    };

    const handleDeactivate = async () => {
        if (window.confirm("Are you sure you want to delete the current activation key? The application will be locked immediately and require a new key.")) {
            await deactivateLicense();
            // Optional: force reload or redirect to login (context handles navigation usually, or App will redirect)
            window.location.reload(); 
        }
    };

    if (isLoading) {
        return <div className="p-8"><Skeleton className="h-96 w-full rounded-2xl" /></div>;
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 p-4">
            <div className="xl:col-span-2 space-y-6">
                <form onSubmit={handleSave} className="card shadow-md border border-gray-100 p-6 md:p-8">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b border-gray-100">
                        <Database className="w-6 h-6 text-primary-600" />
                        General Configuration
                    </h3>

                    {/* Status Banner */}
                    <AnimatePresence>
                        {saveStatus.message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, mb: 0 }}
                                animate={{ opacity: 1, height: 'auto', mb: 24 }}
                                exit={{ opacity: 0, height: 0, mb: 0 }}
                                className={`p-4 rounded-xl border flex items-center gap-3 ${saveStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}
                            >
                                {saveStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
                                <span className="font-bold text-sm tracking-wide">{saveStatus.message}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Company Name</label>
                            <input
                                type="text"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                className="input-field font-bold bg-gray-50 focus:bg-white transition-colors p-3 w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Support Email</label>
                            <input
                                type="email"
                                name="company_email"
                                value={formData.company_email}
                                onChange={handleChange}
                                className="input-field font-bold bg-gray-50 focus:bg-white transition-colors p-3 w-full"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Headquarters Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="input-field font-bold bg-gray-50 focus:bg-white transition-colors p-3 w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Global Currency</label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="input-field font-bold bg-gray-50 focus:bg-white transition-colors p-3 w-full appearance-none cursor-pointer"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="PKR">PKR (Rs)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">System Timezone</label>
                            <select
                                name="timezone"
                                value={formData.timezone}
                                onChange={handleChange}
                                className="input-field font-bold bg-gray-50 focus:bg-white transition-colors p-3 w-full appearance-none cursor-pointer"
                            >
                                <option value="UTC">UTC (Greenwich Mean Time)</option>
                                <option value="EST">EST (Eastern Standard Time)</option>
                                <option value="PST">PST (Pacific Standard Time)</option>
                                <option value="PKT">PKT (Pakistan Standard Time)</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex items-center gap-2 bg-primary-600 text-white px-8 py-3.5 rounded-xl font-black shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:shadow-primary-500/40 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none w-full sm:w-auto justify-center"
                        >
                            {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {mutation.isPending ? 'Syncing...' : 'Save Settings'}
                        </button>
                    </div>
                </form>

                {/* License Management Section */}
                <div className="card shadow-md border border-gray-100 p-6 md:p-8">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b border-gray-100">
                        <KeyRound className="w-6 h-6 text-primary-600" />
                        License Management
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Tier</p>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-black text-gray-900">{tier || 'None'}</span>
                                {isLicenseActive && <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">Active</span>}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Time Remaining</p>
                            <p className="text-lg font-black text-gray-900 font-mono">{remainingFormatted}</p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={handleDeactivate}
                            className="flex items-center gap-2 bg-white text-red-600 border border-red-200 px-6 py-2.5 rounded-xl font-bold hover:bg-red-50 transition-colors active:scale-95 w-full sm:w-auto justify-center"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Activation Key
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="card text-center py-10 shadow-sm border border-gray-100 relative overflow-hidden">
                    {/* Add loading overlay for logo upload */}
                    {logoMutation.isPending && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                        </div>
                    )}

                    <div className="w-24 h-24 md:w-32 md:h-32 bg-primary-50 rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-xl shadow-primary-500/10 mb-6 group cursor-pointer hover:scale-105 transition-all duration-300 relative overflow-hidden"
                         onClick={() => fileInputRef.current?.click()}>
                        {logoPreview ? (
                            <img src={logoPreview.startsWith('http') ? logoPreview : `${api.defaults.baseURL.replace('/api', '')}${logoPreview}`} alt="Company Logo" className="w-full h-full object-cover" />
                        ) : (
                            <RefreshCw className="w-8 h-8 md:w-10 md:h-10 text-primary-400 group-hover:rotate-180 transition-transform duration-700" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider">
                            Change
                        </div>
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                    />

                    <h4 className="font-black text-lg text-gray-900">Company Logo</h4>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-2 tracking-widest">Recommended: 512x512 PNG</p>
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={logoMutation.isPending}
                        className="mt-6 text-sm font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-6 py-2.5 rounded-xl transition-colors w-full sm:w-auto"
                    >
                        {logoMutation.isPending ? 'Uploading...' : 'Upload Image'}
                    </button>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-2xl overflow-hidden relative group">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-500 blur-3xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                    <Shield className="w-10 h-10 md:w-12 md:h-12 text-primary-400 mb-5 relative z-10" />
                    <h4 className="text-lg md:text-xl font-black leading-tight tracking-wide mb-3 relative z-10">Security Protocol Alpha</h4>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed relative z-10">All administrative modifications are logged cryptographically. Persistent unauthorized attempts trigger dynamic IP blackouts and Super Admin alerts.</p>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
