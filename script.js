// Product Form JavaScript
class ProductForm {
    constructor() {
        this.form = document.getElementById('productForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.submitText = document.getElementById('submitText');
        this.submitIcon = document.getElementById('submitIcon');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.successMessage = document.getElementById('successMessage');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        
        // Store uploaded image URLs
        this.uploadedUserImageUrl = null;
        this.uploadedProductImageUrl = null;
        
        // Webhook URL - n8n Production Webhook
        this.webhookUrl = 'https://bardouni12.app.n8n.cloud/webhook/ugc-video';
        
        // API Base URL - Configure this for your backend server
        this.apiBaseUrl = window.location.origin;
        
        // Default values
        this.defaultValues = {
            productName: 'ساعة ذكية',
            userName: 'أحمد',
            email: 'test@example.com',
            seed: 123456
        };
        
        this.init();
    }
    
    init() {
        this.loadDefaultValues();
        this.setupEventListeners();
        this.setupImageUploads();
    }
    
    loadDefaultValues() {
        // Populate form with default values
        const userName = document.getElementById('userName');
        const email = document.getElementById('email');
        const productName = document.getElementById('productName');
        const seed = document.getElementById('seed');
        
        if (userName) userName.value = this.defaultValues.userName || '';
        if (email) email.value = this.defaultValues.email || '';
        if (productName) productName.value = this.defaultValues.productName || '';
        if (seed) seed.value = this.defaultValues.seed || '';
    }
    
    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }
    
    setupImageUploads() {
        // Setup user image upload
        const userImageInput = document.getElementById('userImageFile');
        if (userImageInput) {
            userImageInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Show loading state
                    this.showMessage('جاري رفع صورة المستخدم...', 'info');
                    
                    try {
                        // Upload the image
                        const imageUrl = await this.uploadImage(file);
                        if (imageUrl) {
                            // Store the URL
                            this.uploadedUserImageUrl = imageUrl;
                            // Update preview
                            this.updateImagePreview('user', imageUrl);
                            // Store URL in hidden input
                            const userImageUrlInput = document.getElementById('userImageUrl');
                            if (userImageUrlInput) userImageUrlInput.value = imageUrl;
                            
                            this.showMessage('تم رفع صورة المستخدم بنجاح!', 'success');
                        }
                    } catch (error) {
                        console.error('Error uploading user image:', error);
                        this.showMessage('حدث خطأ أثناء رفع صورة المستخدم', 'error');
                    }
                }
            });
        }
        
        // Setup product image upload
        const productImageInput = document.getElementById('productImageFile');
        if (productImageInput) {
            productImageInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Show loading state
                    this.showMessage('جاري رفع صورة المنتج...', 'info');
                    
                    try {
                        // Upload the image
                        const imageUrl = await this.uploadImage(file);
                        if (imageUrl) {
                            // Store the URL
                            this.uploadedProductImageUrl = imageUrl;
                            // Update preview
                            this.updateImagePreview('product', imageUrl);
                            // Store URL in hidden input
                            const productImageUrlInput = document.getElementById('productImageUrl');
                            if (productImageUrlInput) productImageUrlInput.value = imageUrl;
                            
                            this.showMessage('تم رفع صورة المنتج بنجاح!', 'success');
                        }
                    } catch (error) {
                        console.error('Error uploading product image:', error);
                        this.showMessage('حدث خطأ أثناء رفع صورة المنتج', 'error');
                    }
                }
            });
        }
    }
    
    async uploadImage(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const uploadUrl = `${this.apiBaseUrl}/api/upload`;
            
            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                return result.imageUrl;
            } else {
                throw new Error(result.message || 'فشل في رفع الصورة');
            }
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }
    
    updateImagePreview(type, url) {
        const previewContainer = document.getElementById(`${type}ImagePreview`);
        const previewImg = document.getElementById(`${type}PreviewImg`);
        
        if (!previewContainer || !previewImg) return;
        
        if (url) {
            previewImg.src = url;
            previewContainer.classList.remove('hidden');
        } else {
            previewContainer.classList.add('hidden');
        }
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Clear previous errors
        this.clearFieldError(field);
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'هذا الحقل مطلوب';
        }
        
        // Email validation
        if (field.name === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'يرجى إدخال بريد إلكتروني صحيح';
            }
        }
        
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }
        
        return isValid;
    }
    
    showFieldError(field, message) {
        field.classList.add('border-red-500');
        field.classList.remove('border-gray-300');
        
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }
    
    clearFieldError(field) {
        field.classList.remove('border-red-500');
        field.classList.add('border-gray-300');
        
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    }
    
    validateForm() {
        let isValid = true;
        const requiredFields = ['userName', 'email', 'productName'];
        
        // Clear previous errors
        this.clearAllErrors();
        
        // Validate required text fields
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field && !field.value.trim()) {
                this.showFieldError(field, 'هذا الحقل مطلوب');
                isValid = false;
            }
        });
        
        // Validate email format
        const email = document.getElementById('email');
        if (email && email.value.trim() && !this.isValidEmail(email.value.trim())) {
            this.showFieldError(email, 'يرجى إدخال بريد إلكتروني صالح');
            isValid = false;
        }
        
        // Validate images
        if (!this.uploadedUserImageUrl) {
            const userImageFile = document.getElementById('userImageFile');
            if (userImageFile) {
                this.showFieldError(userImageFile, 'يرجى اختيار صورة للشخص');
                isValid = false;
            }
        }
        
        if (!this.uploadedProductImageUrl) {
            const productImageFile = document.getElementById('productImageFile');
            if (productImageFile) {
                this.showFieldError(productImageFile, 'يرجى اختيار صورة للمنتج');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    clearAllErrors() {
        const fields = this.form.querySelectorAll('input');
        fields.forEach(field => this.clearFieldError(field));
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    setLoadingState(loading) {
        if (loading) {
            if (this.submitBtn) {
                this.submitBtn.disabled = true;
                this.submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
            }
            if (this.submitText) this.submitText.textContent = 'جاري الإرسال...';
            if (this.submitIcon) this.submitIcon.classList.add('hidden');
            if (this.loadingSpinner) this.loadingSpinner.classList.remove('hidden');
        } else {
            if (this.submitBtn) {
                this.submitBtn.disabled = false;
                this.submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            }
            if (this.submitText) this.submitText.textContent = 'أنشئ الفيديو الآن';
            if (this.submitIcon) this.submitIcon.classList.remove('hidden');
            if (this.loadingSpinner) this.loadingSpinner.classList.add('hidden');
        }
    }
    
    showMessage(message, type) {
        // Hide all messages first
        this.successMessage.classList.add('hidden');
        this.errorMessage.classList.add('hidden');
        
        if (type === 'success') {
            this.successMessage.classList.remove('hidden');
            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                this.successMessage.classList.add('hidden');
            }, 5000);
        } else if (type === 'error') {
            this.errorText.textContent = message;
            this.errorMessage.classList.remove('hidden');
            // Auto-hide error message after 8 seconds
            setTimeout(() => {
                this.errorMessage.classList.add('hidden');
            }, 8000);
        }
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        this.setLoadingState(true);
        
        try {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            
            // Add uploaded image URLs
            data.userImageUrl = this.uploadedUserImageUrl;
            data.productImageUrl = this.uploadedProductImageUrl;
            
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            this.showMessage('تم إرسال النموذج بنجاح!', 'success');
            this.form.reset();
            this.uploadedUserImageUrl = null;
            this.uploadedProductImageUrl = null;
            this.updateImagePreview('user', null);
            this.updateImagePreview('product', null);
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage('حدث خطأ أثناء إرسال النموذج', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductForm();
});

// Add some utility functions for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling for better UX
    const style = document.createElement('style');
    style.textContent = `
        html {
            scroll-behavior: smooth;
        }
        
        /* Enhanced focus styles for accessibility */
        input:focus, button:focus {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
        }
        
        /* Better hover effects */
        .image-preview {
            cursor: pointer;
        }
        
        /* Responsive improvements */
        @media (max-width: 640px) {
            .container {
                padding-left: 1rem;
                padding-right: 1rem;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            const form = e.target.closest('form');
            if (form) {
                const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"])'));
                const currentIndex = inputs.indexOf(e.target);
                const nextInput = inputs[currentIndex + 1];
                
                if (nextInput) {
                    e.preventDefault();
                    nextInput.focus();
                }
            }
        }
    });
});