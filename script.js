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
        
        // Image mode tracking
        this.userImageMode = 'file'; // Default to file upload
        this.productImageMode = 'file'; // Default to file upload
        
        // Store uploaded image URLs
        this.uploadedUserImageUrl = null;
        this.uploadedProductImageUrl = null;
        
        // Webhook URL
        this.webhookUrl = 'https://n8n.chairi.dev/webhook/product-form';
        
        // Default values
        this.defaultValues = {
            userImageUrl: '',
            productImageUrl: ''
        };
        
        this.init();
    }
    
    init() {
        this.loadDefaultValues();
        this.setupEventListeners();
        this.setupImageTabs();
        // Set file upload as default for both images
        this.switchImageTab('user', 'file');
        this.switchImageTab('product', 'file');
        this.updateImagePreviews();
    }
    
    loadDefaultValues() {
        // Populate form with default values - check if elements exist first
        const userName = document.getElementById('userName');
        const email = document.getElementById('email');
        const productName = document.getElementById('productName');
        const userImageUrl = document.getElementById('userImageUrl');
        const productImageUrl = document.getElementById('productImageUrl');
        const seed = document.getElementById('seed');
        
        if (userName) userName.value = this.defaultValues.userName || '';
        if (email) email.value = this.defaultValues.email || '';
        if (productName) productName.value = this.defaultValues.productName || '';
        if (userImageUrl) userImageUrl.value = this.defaultValues.userImageUrl || '';
        if (productImageUrl) productImageUrl.value = this.defaultValues.productImageUrl || '';
        if (seed) seed.value = this.defaultValues.seed || '';
    }
    
    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Image URL changes for live preview
        document.getElementById('userImageUrl').addEventListener('input', (e) => {
            this.updateImagePreview('user', e.target.value);
        });
        
        document.getElementById('productImageUrl').addEventListener('input', (e) => {
            this.updateImagePreview('product', e.target.value);
        });
        
        // File input listeners
        document.getElementById('userImageFile').addEventListener('change', (e) => this.handleFileUpload(e, 'user'));
        document.getElementById('productImageFile').addEventListener('change', (e) => this.handleFileUpload(e, 'product'));
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }
    
    setupImageTabs() {
        // User image tabs
        const userUrlTab = document.getElementById('userUrlTab');
        const userUploadTab = document.getElementById('userUploadTab');
        const productUrlTab = document.getElementById('productUrlTab');
        const productUploadTab = document.getElementById('productUploadTab');
        
        if (userUrlTab) userUrlTab.addEventListener('click', () => this.switchImageTab('user', 'url'));
        if (userUploadTab) userUploadTab.addEventListener('click', () => this.switchImageTab('user', 'file'));
        
        // Product image tabs
        if (productUrlTab) productUrlTab.addEventListener('click', () => this.switchImageTab('product', 'url'));
        if (productUploadTab) productUploadTab.addEventListener('click', () => this.switchImageTab('product', 'file'));
    }

    switchImageTab(imageType, mode) {
        if (imageType === 'user') {
            this.userImageMode = mode;
            const urlTab = document.getElementById('userUrlTab');
            const fileTab = document.getElementById('userUploadTab');
            const urlContent = document.getElementById('userUrlContent');
            const fileContent = document.getElementById('userUploadContent');
            
            if (mode === 'url') {
                urlTab.className = 'flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white shadow-sm transition-colors duration-200';
                fileTab.className = 'flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200';
                urlContent.classList.remove('hidden');
                fileContent.classList.add('hidden');
            } else {
                fileTab.className = 'flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white shadow-sm transition-colors duration-200';
                urlTab.className = 'flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200';
                fileContent.classList.remove('hidden');
                urlContent.classList.add('hidden');
            }
        } else if (imageType === 'product') {
            this.productImageMode = mode;
            const urlTab = document.getElementById('productUrlTab');
            const fileTab = document.getElementById('productUploadTab');
            const urlContent = document.getElementById('productUrlContent');
            const fileContent = document.getElementById('productUploadContent');
            
            if (mode === 'url') {
                urlTab.className = 'flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white shadow-sm transition-colors duration-200';
                fileTab.className = 'flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200';
                urlContent.classList.remove('hidden');
                fileContent.classList.add('hidden');
            } else {
                fileTab.className = 'flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white shadow-sm transition-colors duration-200';
                urlTab.className = 'flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200';
                fileContent.classList.remove('hidden');
                urlContent.classList.add('hidden');
            }
        }
    }

    async handleFileUpload(event, mode) {
        const file = event.target.files[0];
        if (!file) return;
        
        console.log(`🔄 Starting file upload for ${mode} mode:`, file.name);
        
        if (!this.validateFile(file)) {
            return;
        }

        try {
            // Show immediate preview with local file
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewId = mode === 'user' ? 'userImagePreview' : 'productImagePreview';
                document.getElementById(previewId).src = e.target.result;
            };
            reader.readAsDataURL(file);
            
            // Show loading state
            this.showMessage('جاري رفع الصورة...', 'info');
            
            // Upload the image
            const imageUrl = await this.uploadImage(file, mode);
            
            if (imageUrl) {
                // Store the uploaded URL
                if (mode === 'user') {
                    this.uploadedUserImageUrl = imageUrl;
                    console.log('✅ User image uploaded successfully:', imageUrl);
                    console.log('📁 User image URL path:', imageUrl);
                } else if (mode === 'product') {
                    this.uploadedProductImageUrl = imageUrl;
                    console.log('✅ Product image uploaded successfully:', imageUrl);
                    console.log('📁 Product image URL path:', imageUrl);
                }
                
                // Update preview with the uploaded image URL
                this.updateImagePreview(mode, imageUrl);
                this.showMessage('تم رفع الصورة بنجاح!', 'success');
                
                console.log(`📊 Current uploaded URLs:`, {
                    userImage: this.uploadedUserImageUrl,
                    productImage: this.uploadedProductImageUrl
                });
            }
        } catch (error) {
            console.error(`❌ Error uploading ${mode} image:`, error);
            this.showMessage('حدث خطأ أثناء رفع الصورة', 'error');
        }
    }

    validateFile(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showMessage('يرجى اختيار ملف صورة صالح', 'error');
            return false;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showMessage('حجم الملف كبير جداً. يرجى اختيار صورة أصغر من 5 ميجابايت', 'error');
            return false;
        }

        return true;
    }
    
    updateImagePreviews() {
        // Update both image previews on load
        this.updateImagePreview('user', this.defaultValues.userImageUrl);
        this.updateImagePreview('product', this.defaultValues.productImageUrl);
    }
    
    updateImagePreview(type, url) {
        const previewElement = document.getElementById(`${type}ImagePreview`);
        const placeholderUrls = {
            user: 'https://via.placeholder.com/120x120/e5e7eb/6b7280?text=صورة+المستخدم',
            product: 'https://via.placeholder.com/200x150/e5e7eb/6b7280?text=صورة+المنتج'
        };
        
        if (url && this.isValidUrl(url)) {
            // Test if image loads successfully
            const img = new Image();
            img.onload = () => {
                previewElement.src = url;
                previewElement.classList.remove('opacity-50');
            };
            img.onerror = () => {
                previewElement.src = placeholderUrls[type];
                previewElement.classList.add('opacity-50');
            };
            img.src = url;
        } else {
            previewElement.src = placeholderUrls[type];
            previewElement.classList.remove('opacity-50');
        }
    }
    
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
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
        if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'يرجى إدخال بريد إلكتروني صحيح';
            }
        }
        
        // URL validation
        if ((fieldName === 'userImageUrl' || fieldName === 'productImageUrl') && value) {
            if (!this.isValidUrl(value)) {
                isValid = false;
                errorMessage = 'يرجى إدخال رابط صحيح';
            }
        }
        
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }
        
        return isValid;
    }
    
    showFieldError(field, message) {
        field.classList.add('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
        field.classList.remove('border-gray-300', 'focus:ring-primary-500', 'focus:border-primary-500');
        
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }
    
    clearFieldError(field) {
        field.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
        field.classList.add('border-gray-300', 'focus:ring-primary-500', 'focus:border-primary-500');
        
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
        
        // Validate user image
        if (this.userImageMode === 'url') {
            const userImageUrl = document.getElementById('userImageUrl');
            if (userImageUrl && userImageUrl.value.trim() && !this.isValidUrl(userImageUrl.value.trim())) {
                this.showFieldError(userImageUrl, 'يرجى إدخال رابط صالح للصورة');
                isValid = false;
            }
        } else {
            const userImageFile = document.getElementById('userImageFile');
            if (userImageFile && userImageFile.files.length === 0) {
                this.showFieldError(userImageFile, 'يرجى اختيار صورة للشخص');
                isValid = false;
            }
        }
        
        // Validate product image
        if (this.productImageMode === 'url') {
            const productImageUrl = document.getElementById('productImageUrl');
            if (productImageUrl && productImageUrl.value.trim() && !this.isValidUrl(productImageUrl.value.trim())) {
                this.showFieldError(productImageUrl, 'يرجى إدخال رابط صالح للصورة');
                isValid = false;
            }
        } else {
            const productImageFile = document.getElementById('productImageFile');
            if (productImageFile && productImageFile.files.length === 0) {
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
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
            this.submitText.textContent = 'جاري الإرسال...';
            this.submitIcon.classList.add('hidden');
            this.loadingSpinner.classList.remove('hidden');
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            this.submitText.textContent = 'اشترِ الآن';
            this.submitIcon.classList.remove('hidden');
            this.loadingSpinner.classList.add('hidden');
        }
    }
    
    showMessage(type, message) {
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
        
        // Scroll to top to show message
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    async getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        // Convert FormData to regular object
        for (let [key, value] of formData) {
            if (typeof value === 'string') {
                data[key] = value.trim();
            } else {
                data[key] = value;
            }
        }
        
        // Convert seed to number
        if (data.seed) {
            data.seed = parseInt(data.seed);
        }
        
        // Handle user image based on mode
        if (this.userImageMode === 'file') {
            // Use pre-uploaded URL if available, otherwise upload now
            if (this.uploadedUserImageUrl) {
                data.userImageUrl = this.uploadedUserImageUrl;
                console.log('✅ Using pre-uploaded user image:', this.uploadedUserImageUrl);
            } else {
                const fileInput = document.getElementById('userImageFile');
                if (fileInput.files[0]) {
                    console.log('📤 Uploading user image during submit...');
                    data.userImageUrl = await this.uploadImage(fileInput.files[0], 'user');
                } else {
                    data.userImageUrl = this.defaultValues.userImageUrl;
                }
            }
        } else {
            if (!data.userImageUrl) {
                data.userImageUrl = this.defaultValues.userImageUrl;
            }
        }
        
        // Handle product image based on mode
        if (this.productImageMode === 'file') {
            // Use pre-uploaded URL if available, otherwise upload now
            if (this.uploadedProductImageUrl) {
                data.productImageUrl = this.uploadedProductImageUrl;
                console.log('✅ Using pre-uploaded product image:', this.uploadedProductImageUrl);
            } else {
                const fileInput = document.getElementById('productImageFile');
                if (fileInput.files[0]) {
                    console.log('📤 Uploading product image during submit...');
                    data.productImageUrl = await this.uploadImage(fileInput.files[0], 'product');
                } else {
                    data.productImageUrl = this.defaultValues.productImageUrl;
                }
            }
        } else {
            if (!data.productImageUrl) {
                data.productImageUrl = this.defaultValues.productImageUrl;
            }
        }
        
        return data;
    }
    
    async uploadImage(file, imageType) {
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                console.log(`✅ ${imageType} image uploaded successfully:`, result.imageUrl);
                return result.imageUrl;
            } else {
                throw new Error(result.message || 'فشل في رفع الصورة');
            }
            
        } catch (error) {
            console.error(`❌ Error uploading ${imageType} image:`, error);
            this.showMessage('error', `خطأ في رفع صورة ${imageType === 'user' ? 'المستخدم' : 'المنتج'}: ${error.message}`);
            throw error;
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate form
        if (!this.validateForm()) {
            this.showMessage('error', 'يرجى تصحيح الأخطاء في النموذج');
            return;
        }
        
        // Set loading state
        this.setLoadingState(true);
        
        try {
            // Get form data (now async to handle file conversion)
            const data = await this.getFormData();
            
            console.log('🚀 Submitting to:', this.webhookUrl);
            console.log('📦 Data:', JSON.stringify(data, null, 2));
            
            // Submit to webhook
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                // Success
                console.log('✅ Success! Status:', response.status);
                this.showMessage('success');
                
                // Optional: Reset form after successful submission
                // this.form.reset();
                // this.populateDefaultValues();
                // this.updateImagePreviews();
            } else {
                // Handle HTTP errors
                let errorMessage = 'حدث خطأ في إرسال الطلب';
                
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = `خطأ: ${errorData.message}`;
                    }
                } catch (parseError) {
                    console.error('Error parsing error response:', parseError);
                }
                
                console.error('❌ HTTP Error:', response.status, response.statusText);
                this.showMessage('error', errorMessage);
            }
            
        } catch (error) {
            console.error('🔥 Network Error:', error.message);
            
            let errorMessage = 'حدث خطأ في الاتصال بالخادم';
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت';
            } else if (error.message.includes('CORS')) {
                errorMessage = 'خطأ في إعدادات الخادم (CORS). يرجى التحقق من إعدادات الخادم';
            } else if (error.message.includes('NetworkError')) {
                errorMessage = 'خطأ في الشبكة. يرجى التحقق من اتصال الإنترنت';
            }
            
            this.showMessage('error', errorMessage + ' - ' + error.message);
        } finally {
            // Remove loading state
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