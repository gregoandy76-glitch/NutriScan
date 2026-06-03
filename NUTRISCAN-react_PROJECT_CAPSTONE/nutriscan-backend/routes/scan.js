const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const router = express.Router();

// Setup Multer untuk simpan gambar sementara di folder backend/uploads
const upload = multer({ dest: 'uploads/' }); 

router.post('/upload', upload.single('nutrition_image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Gambar tidak ditemukan' });
        }

        // 1. Siapkan data gambar untuk dikirim ke Flask
        const form = new FormData();
        form.append('image', fs.createReadStream(req.file.path));

        // 2. Kirim ke Flask AI (port 5000)
        const flaskResponse = await axios.post('http://localhost:5000/api/ocr', form, {
            headers: { ...form.getHeaders() }
        });

        // 3. Hapus gambar sementara di backend setelah dikirim ke Flask
        fs.unlinkSync(req.file.path); 

        // 4. Kirim hasil OCR Gemini kembali ke React
        res.json({
            success: true,
            data: flaskResponse.data
        });

    } catch (error) {
        console.error('Error dari Flask:', error.message);
        res.status(500).json({ success: false, message: 'Gagal menganalisis nutrisi' });
    }
});

module.exports = router;