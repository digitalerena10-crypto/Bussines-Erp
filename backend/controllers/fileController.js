const ApiError = require('../utils/ApiError');

// In-memory store for mock uploaded files
let uploadedFiles = [
    { id: '1', name: 'invoice_march.pdf', type: 'application/pdf', size: 102450, uploadedAt: '2024-03-01' },
    { id: '2', name: 'office_profile.jpg', type: 'image/jpeg', size: 450000, uploadedAt: '2024-03-05' }
];

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

            const newFile = {
                id: Date.now().toString(),
                name: req.file.originalname,
                type: req.file.mimetype,
                size: req.file.size,
                uploadedAt: new Date().toISOString(),
                url: `/uploads/${req.file.filename}`
            };

            uploadedFiles.unshift(newFile);

            res.status(201).json({
                success: true,
                message: 'File uploaded successfully',
                data: newFile
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
            res.json({
                success: true,
                data: uploadedFiles
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/files/:id
     */
    static async deleteFile(req, res, next) {
        try {
            const { id } = req.params;
            const initialLength = uploadedFiles.length;
            uploadedFiles = uploadedFiles.filter(f => f.id !== id);

            if (uploadedFiles.length === initialLength) {
                throw ApiError.notFound('File not found');
            }

            res.json({
                success: true,
                message: 'File deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = FileController;
