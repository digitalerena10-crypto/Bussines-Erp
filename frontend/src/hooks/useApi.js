import { useEffect, useState } from 'react';

/**
 * Custom hook for making API calls with loading/error states
 */
const useApi = (apiCall, dependencies = [], immediate = true) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    const execute = async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall(...args);
            setData(response.data);
            return response.data;
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'An error occurred';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, dependencies);

    return { data, loading, error, execute, setData };
};

export default useApi;
