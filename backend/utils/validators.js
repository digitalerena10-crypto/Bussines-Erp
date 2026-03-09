/**
 * Input validation helpers
 */

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPassword = (password) => {
    // Minimum 8 characters, at least one uppercase, one lowercase, one number
    return password && password.length >= 8;
};

const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[\d\s-()]{7,15}$/;
    return phoneRegex.test(phone);
};

const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>]/g, '');
};

const isPositiveNumber = (value) => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
};

const isValidUUID = (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
};

/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {string[]} fields - Required field names
 * @returns {{ valid: boolean, missing: string[] }}
 */
const validateRequired = (body, fields) => {
    const missing = fields.filter(
        (field) => body[field] === undefined || body[field] === null || body[field] === ''
    );
    return { valid: missing.length === 0, missing };
};

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidPhone,
    sanitizeString,
    isPositiveNumber,
    isValidUUID,
    validateRequired,
};
