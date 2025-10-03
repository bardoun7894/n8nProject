const multipart = require('lambda-multipart-parser');
const { v4: uuidv4 } = require('uuid');

// In-memory storage for demo (in production, use external storage like AWS S3, Cloudinary, etc.)
// Note: Netlify Functions are stateless, so files won't persist between invocations
// You'll need to use external storage service

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
        };
    }

    try {
        // Parse multipart form data
        const result = await multipart.parse(event);

        if (!result.files || result.files.length === 0) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: 'لم يتم رفع أي ملف'
                })
            };
        }

        const file = result.files[0];

        // Validate file type
        if (!file.contentType.startsWith('image/')) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: 'فقط ملفات الصور مسموح بها'
                })
            };
        }

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024;
        if (file.content.length > maxSize) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: 'حجم الملف كبير جداً (الحد الأقصى 10 ميجابايت)'
                })
            };
        }

        // Convert buffer to base64
        const imageId = uuidv4();
        const base64Image = file.content.toString('base64');
        const dataUrl = `data:${file.contentType};base64,${base64Image}`;

        console.log(`📸 Image uploaded: ${file.filename}`);

        // Return the data URL (base64 encoded image)
        // In production, you should upload to cloud storage and return the URL
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                message: 'تم رفع الصورة بنجاح',
                imageUrl: dataUrl,
                imageId: imageId,
                filename: file.filename,
                originalName: file.filename,
                size: file.content.length
            })
        };

    } catch (error) {
        console.error('Upload error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                message: 'خطأ في رفع الصورة: ' + error.message
            })
        };
    }
};
