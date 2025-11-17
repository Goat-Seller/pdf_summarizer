import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { summarizePdfBase64 } from './gemini-pdf.js';

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: frontend_URL || 'http://localhost:5173'
};

app.use(cors(corsOptions));

// Use memory storage so we can validate file contents before writing to disk
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    fileFilter: (req, file, cb) => {
        // Basic mimetype check first
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(null, false);
    }
});

app.post('/pdfs', upload.single('pdf'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded or unsupported file type' });
        }

        const buffer = req.file.buffer;
        if (!buffer || buffer.length < 4) {
            return res.status(400).json({ error: 'Uploaded file is too small to be a valid PDF' });
        }

        // Check PDF magic bytes: files start with "%PDF"
        const header = buffer.subarray(0, 4).toString('utf8');
        if (!header.startsWith('%PDF')) {
            return res.status(400).json({ error: 'File is not a valid PDF (magic bytes mismatch)' });
        }

        console.log('Upload successful:', req.file.originalname);
        return res.json({ message: 'PDF received and validated', filename: req.file.originalname, size: req.file.size });
    } catch (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: 'Internal server error during file validation' });
    }
});

// Multer-specific error handler
app.use((err, req, res, next) => {
    if (err && err.code && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Max size is 10MB.' });
    }
    if (err && err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Summarize uploaded PDF using Gemini/GenAI
app.post('/summarize', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded or unsupported file type' });
        }

        const buffer = req.file.buffer;
        if (!buffer || buffer.length < 4) {
            return res.status(400).json({ error: 'Uploaded file is too small to be a valid PDF' });
        }

        const header = buffer.subarray(0, 4).toString('utf8');
        if (!header.startsWith('%PDF')) {
            return res.status(400).json({ error: 'File is not a valid PDF (magic bytes mismatch)' });
        }

        const base64 = buffer.toString('base64');
        const result = await summarizePdfBase64(base64);
        console.log('\n\nSummarization result:\n\n', result);
        return res.status(200).json({ filename: req.file.originalname, size: req.file.size, summary: result });
    } catch (err) {
        console.error('Summarize error:', err);
        return res.status(500).json({ error: 'Internal server error during summarization', detail: err.message });
    }
});