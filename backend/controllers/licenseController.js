/**
 * License / Activation Key Controller
 * Pre-generated keys with 5 tiers: 10 Minutes, 1 Day, 15 Days, 1 Month, 3 Months, 1 Year
 * Each key is single-use.
 */

const MS_DAY = 86400000;

const LICENSE_KEYS = {
    // 10 Minute keys (for testing)
    'TEN-A1B2-C3D4-E5F6': { tier: '10 Minutes', duration: 600000, used: false },
    'TEN-G7H8-I9J0-K1L2': { tier: '10 Minutes', duration: 600000, used: false },
    'TEN-M3N4-O5P6-Q7R8': { tier: '10 Minutes', duration: 600000, used: false },
    'TEN-S9T0-U1V2-W3X4': { tier: '10 Minutes', duration: 600000, used: false },
    'TEN-Y5Z6-A7B8-C9D0': { tier: '10 Minutes', duration: 600000, used: false },

    // 1 Day keys
    'DAY-A1B2-C3D4-E5F6': { tier: '1 Day', duration: MS_DAY, used: false },
    'DAY-G7H8-I9J0-K1L2': { tier: '1 Day', duration: MS_DAY, used: false },
    'DAY-M3N4-O5P6-Q7R8': { tier: '1 Day', duration: MS_DAY, used: false },
    'DAY-S9T0-U1V2-W3X4': { tier: '1 Day', duration: MS_DAY, used: false },
    'DAY-Y5Z6-A7B8-C9D0': { tier: '1 Day', duration: MS_DAY, used: false },

    // 15 Day keys
    'HLF-A1B2-C3D4-E5F6': { tier: '15 Days', duration: MS_DAY * 15, used: false },
    'HLF-G7H8-I9J0-K1L2': { tier: '15 Days', duration: MS_DAY * 15, used: false },
    'HLF-M3N4-O5P6-Q7R8': { tier: '15 Days', duration: MS_DAY * 15, used: false },
    'HLF-S9T0-U1V2-W3X4': { tier: '15 Days', duration: MS_DAY * 15, used: false },
    'HLF-Y5Z6-A7B8-C9D0': { tier: '15 Days', duration: MS_DAY * 15, used: false },

    // 1 Month keys
    'MON-A1B2-C3D4-E5F6': { tier: '1 Month', duration: MS_DAY * 30, used: false },
    'MON-G7H8-I9J0-K1L2': { tier: '1 Month', duration: MS_DAY * 30, used: false },
    'MON-M3N4-O5P6-Q7R8': { tier: '1 Month', duration: MS_DAY * 30, used: false },
    'MON-S9T0-U1V2-W3X4': { tier: '1 Month', duration: MS_DAY * 30, used: false },
    'MON-Y5Z6-A7B8-C9D0': { tier: '1 Month', duration: MS_DAY * 30, used: false },

    // 3 Month keys
    'QTR-A1B2-C3D4-E5F6': { tier: '3 Months', duration: MS_DAY * 90, used: false },
    'QTR-G7H8-I9J0-K1L2': { tier: '3 Months', duration: MS_DAY * 90, used: false },
    'QTR-M3N4-O5P6-Q7R8': { tier: '3 Months', duration: MS_DAY * 90, used: false },
    'QTR-S9T0-U1V2-W3X4': { tier: '3 Months', duration: MS_DAY * 90, used: false },
    'QTR-Y5Z6-A7B8-C9D0': { tier: '3 Months', duration: MS_DAY * 90, used: false },

    // 1 Year keys
    'YER-A1B2-C3D4-E5F6': { tier: '1 Year', duration: MS_DAY * 365, used: false },
    'YER-G7H8-I9J0-K1L2': { tier: '1 Year', duration: MS_DAY * 365, used: false },
    'YER-M3N4-O5P6-Q7R8': { tier: '1 Year', duration: MS_DAY * 365, used: false },
    'YER-S9T0-U1V2-W3X4': { tier: '1 Year', duration: MS_DAY * 365, used: false },
    'YER-Y5Z6-A7B8-C9D0': { tier: '1 Year', duration: MS_DAY * 365, used: false },
};

class LicenseController {
    /**
     * POST /api/license/activate
     * Body: { key: "DAY-A1B2-C3D4-E5F6" }
     */
    static async activate(req, res, next) {
        try {
            const { key } = req.body;

            if (!key) {
                return res.status(400).json({ success: false, message: 'Activation key is required.' });
            }

            const normalizedKey = key.trim().toUpperCase();
            const license = LICENSE_KEYS[normalizedKey];

            if (!license) {
                return res.status(400).json({ success: false, message: 'Invalid activation key.' });
            }

            if (license.used) {
                return res.status(400).json({ success: false, message: 'This key has already been used.' });
            }

            // Mark key as consumed
            license.used = true;

            const expiresAt = Date.now() + license.duration;

            res.json({
                success: true,
                message: `${license.tier} license activated successfully!`,
                data: {
                    tier: license.tier,
                    duration: license.duration,
                    expiresAt,
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/license/deactivate
     * Clears the current license (client-side handles localStorage cleanup)
     */
    static async deactivate(req, res, next) {
        try {
            res.json({
                success: true,
                message: 'License deactivated successfully. The application will require a new activation key.',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/license/keys
     * Returns all keys and their status (admin tool)
     */
    static async getKeys(req, res, next) {
        try {
            const keys = Object.entries(LICENSE_KEYS).map(([key, info]) => ({
                key,
                tier: info.tier,
                used: info.used,
            }));
            res.json({ success: true, data: keys });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = LicenseController;

