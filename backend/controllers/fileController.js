const ApiError = require('../utils/ApiError');

class FileController {
    /**
     * POST /api/files/upload
     */
    static async uploadFile(req, res, next) {
        try {
            if (!req.file) {
                throw ApiError.badRequest('No file uploaded');
            }

            console.log(`[Storage] File uploaded: ${req.file.filename} (${req.file.size} bytes)`);

            // In a real app, we would save metadata to the DB here.
            // For now, we return the file details.
            res.status(201).json({
                success: true,
                message: 'File uploaded successfully',
                data: {
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size,
                    url: `/uploads/${req.file.filename}`
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/files
     */
    static async getFiles(req, res, next) {
        try {
            // Return mock list of files for demonstration
            res.json({
                success: true,
                data: [
                    { id: '1', name: 'invoice_march.pdf', type: 'application/pdf', size: 102450, uploadedAt: '2024-03-01' },
                    { id: '2', name: 'office_profile.jpg', type: 'image/jpeg', size: 450000, uploadedAt: '2024-03-05' }
                ]
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = FileController;
