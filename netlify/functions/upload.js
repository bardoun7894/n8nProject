const multipart = require('lambda-multipart-parser');
const { v4: uuidv4 } = require('uuid');
const { getStore } = require('@netlify/blobs');

// Upload images to Netlify Blobs and return a real, publicly accessible URL
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

        // Persist image in Netlify Blobs (public)
        const imageId = uuidv4();
        const store = getStore('images');

        await store.set(imageId, file.content, {
            contentType: file.contentType,
            cacheMode: 'public'
        });

        // Construct public URL to the stored blob
        const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || '';
        const imageUrl = `${siteUrl}/.netlify/blobs/images/${imageId}`;

        console.log(`📸 Image uploaded to blobs: ${file.filename} -> ${imageUrl}`);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                message: 'تم رفع الصورة بنجاح',
                imageUrl,
                imageId,
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
                message: 'خطأ في رفع الصورة: ' +  error.message
            })
        };
    }
};
