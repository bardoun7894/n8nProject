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
        
        // Webhook URL
        this.webhookUrl = 'https://bardouni12.app.n8n.cloud/webhook-test/ugc-video';
        
        // Default values
        this.defaultValues = {
            userImageUrl: "",
            productImageUrl: "",
            productName: "ساعة ذكية",
            userName: "أحمد",
            email: "test@example.com",
            seed: 123456
        };
        
        // Image input modes
        this.userImageMode = 'file'; // 'url' or 'file'
        this.productImageMode = 'file'; // 'url' or 'file'
        
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
        // Populate form with default values
        document.getElementById('userName').value = this.defaultValues.userName;
        document.getElementById('email').value = this.defaultValues.email;
        document.getElementById('productName').value = this.defaultValues.productName;
        document.getElementById('userImageUrl').value = this.defaultValues.userImageUrl;
        document.getElementById('productImageUrl').value = this.defaultValues.productImageUrl;
        document.getElementById('seed').value = this.defaultValues.seed;
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
        document.getElementById('userUrlTab').addEventListener('click', () => this.switchImageTab('user', 'url'));
        document.getElementById('userFileTab').addEventListener('click', () => this.switchImageTab('user', 'file'));
        
        // Product image tabs
        document.getElementById('productUrlTab').addEventListener('click', () => this.switchImageTab('product', 'url'));
        document.getElementById('productFileTab').addEventListener('click', () => this.switchImageTab('product', 'file'));
    }

    switchImageTab(imageType, mode) {
        if (imageType === 'user') {
            this.userImageMode = mode;
            const urlTab = document.getElementById('userUrlTab');
            const fileTab = document.getElementById('userFileTab');
            const urlInput = document.getElementById('userUrlInput');
            const fileInput = document.getElementById('userFileInput');
            
            if (mode === 'url') {
                urlTab.className = 'flex-1 py-2 px-4 text-sm font-medium rounded-md bg-white text-gray-900 shadow-sm';
                fileTab.className = 'flex-1 py-2 px-4 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900';
                urlInput.classList.remove('hidden');
                fileInput.classList.add('hidden');
            } else {
                fileTab.className = 'flex-1 py-2 px-4 text-sm font-medium rounded-md bg-white text-gray-900 shadow-sm';
                urlTab.className = 'flex-1 py-2 px-4 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900';
                fileInput.classList.remove('hidden');
                urlInput.classList.add('hidden');
            }
        } else if (imageType === 'product') {
            this.productImageMode = mode;
            const urlTab = document.getElementById('productUrlTab');
            const fileTab = document.getElementById('productFileTab');
            const urlInput = document.getElementById('productUrlInput');
            const fileInput = document.getElementById('productFileInput');
            
            if (mode === 'url') {
                urlTab.className = 'flex-1 py-2 px-4 text-sm font-medium rounded-md bg-white text-gray-900 shadow-sm';
                fileTab.className = 'flex-1 py-2 px-4 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900';
                urlInput.classList.remove('hidden');
                fileInput.classList.add('hidden');
            } else {
                fileTab.className = 'flex-1 py-2 px-4 text-sm font-medium rounded-md bg-white text-gray-900 shadow-sm';
                urlTab.className = 'flex-1 py-2 px-4 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900';
                fileInput.classList.remove('hidden');
                urlInput.classList.add('hidden');
            }
        }
    }

    handleFileUpload(event, imageType) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showMessage('error', 'يرجى اختيار ملف صورة صالح');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showMessage('error', 'حجم الملف كبير جداً. يرجى اختيار صورة أصغر من 5 ميجابايت');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewId = imageType === 'user' ? 'userImagePreview' : 'productImagePreview';
            document.getElementById(previewId).src = e.target.result;
        };
        reader.readAsDataURL(file);
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
            if (!field.value.trim()) {
                this.showFieldError(field, 'هذا الحقل مطلوب');
                isValid = false;
            }
        });
        
        // Validate email format
        const email = document.getElementById('email');
        if (email.value.trim() && !this.isValidEmail(email.value.trim())) {
            this.showFieldError(email, 'يرجى إدخال بريد إلكتروني صالح');
            isValid = false;
        }
        
        // Validate user image
        if (this.userImageMode === 'url') {
            const userImageUrl = document.getElementById('userImageUrl');
            if (userImageUrl.value.trim() && !this.isValidUrl(userImageUrl.value.trim())) {
                this.showFieldError(userImageUrl, 'يرجى إدخال رابط صالح للصورة');
                isValid = false;
            }
        } else {
            const userImageFile = document.getElementById('userImageFile');
            if (userImageFile.files.length === 0) {
                this.showFieldError(userImageFile, 'يرجى اختيار صورة للشخص');
                isValid = false;
            }
        }
        
        // Validate product image
        if (this.productImageMode === 'url') {
            const productImageUrl = document.getElementById('productImageUrl');
            if (productImageUrl.value.trim() && !this.isValidUrl(productImageUrl.value.trim())) {
                this.showFieldError(productImageUrl, 'يرجى إدخال رابط صالح للصورة');
                isValid = false;
            }
        } else {
            const productImageFile = document.getElementById('productImageFile');
            if (productImageFile.files.length === 0) {
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
            const fileInput = document.getElementById('userImageFile');
            if (fileInput.files[0]) {
                data.userImageUrl = await this.fileToBase64(fileInput.files[0]);
            } else {
                data.userImageUrl = this.defaultValues.userImageUrl;
            }
        } else {
            if (!data.userImageUrl) {
                data.userImageUrl = this.defaultValues.userImageUrl;
            }
        }
        
        // Handle product image based on mode
        if (this.productImageMode === 'file') {
            const fileInput = document.getElementById('productImageFile');
            if (fileInput.files[0]) {
                data.productImageUrl = await this.fileToBase64(fileInput.files[0]);
            } else {
                data.productImageUrl = this.defaultValues.productImageUrl;
            }
        } else {
            if (!data.productImageUrl) {
                data.productImageUrl = this.defaultValues.productImageUrl;
            }
        }
        
        return data;
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