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
        this.webhookUrl = 'https://bardouni12.app.n8n.cloud/webhook/ugc-video';
        
        // Default values
        this.defaultValues = {
            userImageUrl: "https://i.pinimg.com/736x/0a/19/c8/0a19c8b707bba9c3af854c54e48337bc.jpg",
            productImageUrl: "https://felixgray.com/blog/wp-content/uploads/2019/08/Untitled-Session5394-1-e1603397892155.jpeg",
            productName: "ساعة ذكية",
            userName: "أحمد",
            email: "test@example.com",
            seed: 123456
        };
        
        this.init();
    }
    
    init() {
        this.populateDefaultValues();
        this.setupEventListeners();
        this.updateImagePreviews();
    }
    
    populateDefaultValues() {
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
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
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
        const requiredFields = this.form.querySelectorAll('input[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
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
    
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        // Convert FormData to regular object
        for (let [key, value] = formData) {
            data[key] = value.trim();
        }
        
        // Convert seed to number
        if (data.seed) {
            data.seed = parseInt(data.seed);
        }
        
        // Use default images if URLs are empty
        if (!data.userImageUrl) {
            data.userImageUrl = this.defaultValues.userImageUrl;
        }
        if (!data.productImageUrl) {
            data.productImageUrl = this.defaultValues.productImageUrl;
        }
        
        return data;
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
            // Get form data
            const data = this.getFormData();
            
            console.log('Submitting data:', data);
            
            // Submit to webhook
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (response.ok) {
                // Success
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
                
                console.error('HTTP Error:', response.status, response.statusText);
                this.showMessage('error', errorMessage);
            }
            
        } catch (error) {
            console.error('Network Error:', error);
            
            let errorMessage = 'حدث خطأ في الاتصال بالخادم';
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت';
            }
            
            this.showMessage('error', errorMessage);
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