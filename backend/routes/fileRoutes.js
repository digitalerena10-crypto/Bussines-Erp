const express = require('express');
const router = express.Router();
const FileController = require('../controllers/fileController');
const upload = require('../middlewares/upload');
const authenticate = require('../middlewares/auth');

router.use(authenticate);

router.post('/upload', upload.single('file'), FileController.uploadFile);
router.get('/', FileController.getFiles);

module.exports = router;
