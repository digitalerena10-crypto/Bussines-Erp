import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const SettingsModal = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        currency: 'USD',
        timezone: 'UTC',
        theme: 'System',
        notifications: true
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        // Mock save to local storage or API
        setTimeout(() => {
            localStorage.setItem('erp_settings', JSON.stringify(formData));
            setIsSaving(false);
            onSuccess();
        }, 600);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">System Currency</label>
                    <select name="currency" value={formData.currency} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white outline-none">
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="PKR">PKR (₨)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select name="timezone" value={formData.timezone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white outline-none">
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="EST">EST (Eastern Standard Time)</option>
                        <option value="PST">PST (Pacific Standard Time)</option>
                        <option value="IST">IST (Indian Standard Time)</option>
                        <option value="PKT">PKT (Pakistan Standard Time)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Theme Preference</label>
                    <select name="theme" value={formData.theme} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white outline-none">
                        <option value="System">System Default</option>
                        <option value="Light">Light Mode</option>
                        <option value="Dark">Dark Mode</option>
                    </select>
                </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                    <p className="text-xs text-gray-500">Receive alerts for low stock and new orders.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="notifications" checked={formData.notifications} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors">
                    Cancel
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg transition-colors flex justify-center items-center">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Preferences'}
                </button>
            </div>
        </form>
    );
};

export default SettingsModal;
