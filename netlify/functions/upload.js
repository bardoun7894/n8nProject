const multipart = require('lambda-multipart-parser');
const { v4: uuidv4 } = require('uuid');
const { getStore } = require('@netlify/blobs');
const path = require('path');
const fs = require('fs').promises;

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
        console.log('🔍 Parsing multipart form data...');
        // Parse multipart form data
        const result = await multipart.parse(event);

        if (!result.files || result.files.length === 0) {
            console.log('❌ No files found in request');
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
        console.log('📦 Received file:', {
            filename: file.filename,
            contentType: file.contentType,
            size: file.content.length
        });

        // Validate file type
        if (!file.contentType.startsWith('image/')) {
            console.log('❌ Invalid file type:', file.contentType);
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
            console.log('❌ File too large:', file.content.length);
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    message: 'حجم الملف كبير جداً (الحد الأقصى 10 ميجابايت)'
                })
            };
        }

        // Log environment variables (excluding sensitive data)
        console.log('🌍 Environment:', {
            hasURL: !!process.env.URL,
            hasDEPLOY_URL: !!process.env.DEPLOY_PRIME_URL,
            nodeEnv: process.env.NODE_ENV
        });

        // Generate a unique ID for the image
        const imageId = uuidv4();
        console.log('🆔 Generated image ID:', imageId);

        let imageUrl;

        // In development, save to local filesystem
        if (process.env.NODE_ENV === 'development') {
            try {
                // Create uploads directory if it doesn't exist
                const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
                await fs.mkdir(uploadsDir, { recursive: true });

                // Save file with UUID as name
                const ext = path.extname(file.filename);
                const filename = `${imageId}${ext}`;
                const filePath = path.join(uploadsDir, filename);
                
                await fs.writeFile(filePath, file.content);
                
                // Construct local URL
                const siteUrl = process.env.URL || 'http://localhost:8888';
                imageUrl = `${siteUrl}/uploads/${filename}`;
                
                console.log('💾 Saved file locally:', filePath);
                console.log('🔗 Local image URL:', imageUrl);
            } catch (err) {
                console.error('❌ Error saving file locally:', err);
                throw err;
            }
        } else {
            // In production, use Netlify Blobs
            try {
                console.log('📦 Getting blob store...');
                const store = getStore('images');

                console.log('💾 Saving to blob store...');
                await store.set(imageId, file.content, {
                    contentType: file.contentType,
                    cacheMode: 'public'
                });

                // Construct Netlify Blob URL
                const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL;
                if (!siteUrl) {
                    throw new Error('Missing required environment variable: URL or DEPLOY_PRIME_URL');
                }
                imageUrl = `${siteUrl}/.netlify/blobs/images/${imageId}`;
                
                console.log('🔗 Blob image URL:', imageUrl);
            } catch (err) {
                console.error('❌ Error saving to Netlify Blobs:', err);
                throw err;
            }
        }

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
        console.error('🔥 Upload error:', error);
        // Log the full error details
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        });

        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                message: 'خطأ في رفع الصورة: ' + error.message,
                error: {
                    name: error.name,
                    message: error.message,
                    code: error.code
                }
            })
        };
    }
};
