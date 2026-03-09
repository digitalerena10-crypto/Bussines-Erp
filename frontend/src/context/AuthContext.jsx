import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('erp_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const response = await api.get('/auth/me');
                    if (response.data.success) {
                        setUser(response.data.data);
                    }
                } catch (error) {
                    console.error('Failed to restore session:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [token]);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { tokens: newTokens, user: userData } = response.data.data;

        localStorage.setItem('erp_token', newTokens.accessToken);
        localStorage.setItem('erp_refresh_token', newTokens.refreshToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${newTokens.accessToken}`;

        setToken(newTokens.accessToken);
        setUser(userData);
        return userData;
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('erp_refresh_token');
            if (refreshToken) {
                await api.post('/auth/logout', { refreshToken });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('erp_token');
            localStorage.removeItem('erp_refresh_token');
            delete api.defaults.headers.common['Authorization'];
            setToken(null);
            setUser(null);
        }
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
