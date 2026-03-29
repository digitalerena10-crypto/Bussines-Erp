/**
 * Converts an array of objects to a CSV string and triggers a browser download.
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Desired filename without extension
 */
export const exportToCSV = (data, filename = 'export') => {
    if (!data || !data.length) {
        alert('No data to export');
        return;
    }

    // Get all unique keys from all objects to form the header
    const allKeys = data.reduce((keys, obj) => {
        Object.keys(obj).forEach(key => {
            if (!keys.includes(key)) keys.push(key);
        });
        return keys;
    }, []);

    // Create CSV header row
    const replacer = (key, value) => (value === null ? '' : value);
    let csv = data.map(row =>
        allKeys.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')
    );

    csv.unshift(allKeys.join(',')); // Add header row
    const csvContent = "data:text/csv;charset=utf-8," + csv.join('\r\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
};
