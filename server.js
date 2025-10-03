const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from current directory

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize SQLite database
const db = new sqlite3.Database('./images.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        
        // Create images table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS images (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            mimetype TEXT NOT NULL,
            size INTEGER NOT NULL,
            upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            file_path TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('✅ Images table ready');
            }
        });
    }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueId = uuidv4();
        const extension = path.extname(file.originalname);
        const filename = `${uniqueId}${extension}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Check if file is an image
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Serve static files (HTML, CSS, JS)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'لم يتم رفع أي ملف' 
            });
        }

        const imageId = uuidv4();
        const imageData = {
            id: imageId,
            filename: req.file.filename,
            original_name: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            file_path: req.file.path
        };

        // Save image info to database
        db.run(`INSERT INTO images (id, filename, original_name, mimetype, size, file_path) 
                VALUES (?, ?, ?, ?, ?, ?)`,
            [imageData.id, imageData.filename, imageData.original_name, 
             imageData.mimetype, imageData.size, imageData.file_path],
            function(err) {
                if (err) {
                    console.error('Database error:', err.message);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'خطأ في حفظ البيانات' 
                    });
                }

                // Return the image URL
                const imageUrl = `${req.protocol}://${req.get('host')}/api/images/${imageData.id}`;
                
                console.log(`📸 Image uploaded: ${imageData.original_name} -> ${imageUrl}`);
                
                res.json({
                    success: true,
                    message: 'تم رفع الصورة بنجاح',
                    imageUrl: imageUrl,
                    imageId: imageData.id,
                    filename: imageData.filename,
                    originalName: imageData.original_name,
                    size: imageData.size
                });
            }
        );

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطأ في رفع الصورة' 
        });
    }
});

// Serve uploaded images
app.get('/api/images/:imageId', (req, res) => {
    const imageId = req.params.imageId;
    
    db.get('SELECT * FROM images WHERE id = ?', [imageId], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'خطأ في قاعدة البيانات' });
        }
        
        if (!row) {
            return res.status(404).json({ message: 'الصورة غير موجودة' });
        }
        
        const imagePath = row.file_path;
        
        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ message: 'ملف الصورة غير موجود' });
        }
        
        // Set appropriate headers
        res.setHeader('Content-Type', row.mimetype);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        
        // Send the file
        res.sendFile(path.resolve(imagePath));
    });
});

// Get image info endpoint
app.get('/api/images/:imageId/info', (req, res) => {
    const imageId = req.params.imageId;
    
    db.get('SELECT id, filename, original_name, mimetype, size, upload_date FROM images WHERE id = ?', 
           [imageId], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'خطأ في قاعدة البيانات' });
        }
        
        if (!row) {
            return res.status(404).json({ message: 'الصورة غير موجودة' });
        }
        
        res.json(row);
    });
});

// List all images endpoint (for debugging)
app.get('/api/images', (req, res) => {
    db.all('SELECT id, filename, original_name, mimetype, size, upload_date FROM images ORDER BY upload_date DESC', 
           [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'خطأ في قاعدة البيانات' });
        }
        
        const imagesWithUrls = rows.map(row => ({
            ...row,
            imageUrl: `${req.protocol}://${req.get('host')}/api/images/${row.id}`
        }));
        
        res.json(imagesWithUrls);
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        database: 'Connected'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'حجم الملف كبير جداً (الحد الأقصى 10 ميجابايت)'
            });
        }
    }
    
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        message: 'خطأ في الخادم'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Uploads directory: ${uploadsDir}`);
    console.log(`🗄️  Database: ./images.db`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});