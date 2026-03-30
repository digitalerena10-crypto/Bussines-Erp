import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const SettingsContext = createContext(null);

const CURRENCY_MAP = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    PKR: 'Rs',
    INR: '₹',
    JPY: '¥',
    CNY: '¥',
    AED: 'د.إ',
    SAR: '﷼',
    BDT: '৳',
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        // Fallback for usage outside provider
        return {
            settings: null,
            currencySymbol: '$',
            currencyCode: 'USD',
            companyName: 'ERP Corp',
            logoUrl: null,
            isLoading: false,
            refetch: () => {},
        };
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const { data: settings, isLoading, refetch } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await api.get('/admin/settings');
            return res.data.data;
        },
        enabled: !!localStorage.getItem('erp_token'),
        retry: 1,
        staleTime: 60000, // 1 minute — settings don't change often
        refetchOnWindowFocus: false,
    });

    const currencyCode = settings?.currency || 'USD';
    const currencySymbol = CURRENCY_MAP[currencyCode] || currencyCode;
    const companyName = settings?.company_name || 'ERP Corp';
    const logoUrl = settings?.logo_url || null;

    const value = {
        settings,
        currencySymbol,
        currencyCode,
        companyName,
        logoUrl,
        isLoading,
        refetch,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsContext;
