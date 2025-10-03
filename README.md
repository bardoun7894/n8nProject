# Product Form - Professional UI for n8n Webhook

A modern, responsive Arabic-first product form built with HTML, TailwindCSS, and JavaScript that integrates with n8n webhook automation.

## Features

### 🎨 Design & UI
- **Modern SaaS Design**: Clean, professional interface inspired by Stripe/Apple
- **Arabic RTL Support**: Native right-to-left layout with Arabic typography
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Beautiful Animations**: Smooth transitions, hover effects, and loading states
- **Accessibility**: WCAG compliant with proper focus management and keyboard navigation

### 🖼️ Image Management
- **Live Image Previews**: Real-time preview updates as users type image URLs
- **Fallback Placeholders**: Elegant placeholder images when URLs are invalid or empty
- **Default Images**: Pre-populated with high-quality default images
- **Error Handling**: Graceful handling of broken or invalid image URLs

### ✅ Form Validation
- **Real-time Validation**: Instant feedback as users type
- **Arabic Error Messages**: User-friendly error messages in Arabic
- **Email Validation**: Proper email format checking
- **URL Validation**: Validates image URL formats
- **Required Field Checking**: Clear indication of mandatory fields

### 🔗 n8n Integration
- **Webhook Submission**: Direct POST to n8n webhook endpoint
- **JSON Payload**: Properly formatted data submission
- **Error Handling**: Comprehensive error handling with user feedback
- **Loading States**: Visual feedback during submission process

## Project Structure

```
n8nProject/
├── index.html          # Main HTML file with form structure
├── script.js           # JavaScript functionality and webhook integration
├── README.md           # Project documentation
└── .git/              # Git repository
```

## Default Data Structure

The form submits the following JSON structure to the n8n webhook:

```json
{
    "userImageUrl": "https://i.pinimg.com/736x/0a/19/c8/0a19c8b707bba9c3af854c54e48337bc.jpg",
    "productImageUrl": "https://felixgray.com/blog/wp-content/uploads/2019/08/Untitled-Session5394-1-e1603397892155.jpeg",
    "productName": "ساعة ذكية",
    "userName": "أحمد",
    "email": "test@example.com",
    "seed": 123456
}
```

## API Integration

### Webhook Endpoint
```
POST https://bardouni12.app.n8n.cloud/webhook/ugc-video
```

### Request Headers
```
Content-Type: application/json
```

### Response Handling
- **Success (200)**: Shows success message and maintains form data
- **Error (4xx/5xx)**: Displays appropriate error message in Arabic
- **Network Error**: Handles connection issues gracefully

## Technologies Used

- **HTML5**: Semantic markup with accessibility features
- **TailwindCSS**: Utility-first CSS framework via CDN
- **JavaScript (ES6+)**: Modern JavaScript with classes and async/await
- **Google Fonts**: Cairo (Arabic) and Inter (Latin) fonts
- **HeroIcons**: Beautiful SVG icons for UI elements

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Setup & Usage

1. **Clone or Download**: Get the project files
2. **Open in Browser**: Simply open `index.html` in any modern web browser
3. **Fill Form**: Complete the form fields (pre-filled with defaults)
4. **Submit**: Click "اشترِ الآن" (Buy Now) to submit to n8n webhook

## Customization

### Styling
- Modify TailwindCSS classes in `index.html`
- Adjust the gradient and color scheme in the `<style>` section
- Update fonts by changing Google Fonts imports

### Functionality
- Update webhook URL in `script.js` (line 15)
- Modify default values in the `defaultValues` object
- Add additional validation rules in the `validateField` method

### Localization
- Change text content in HTML for different languages
- Update error messages in JavaScript
- Modify `dir` and `lang` attributes for different text directions

## Security Considerations

- Form validates all inputs client-side and server-side validation should be implemented
- No sensitive data is logged or exposed
- HTTPS is used for all external resources and API calls
- Input sanitization is handled by the browser and should be reinforced server-side

## Performance

- Optimized image loading with error handling
- Minimal external dependencies
- Efficient DOM manipulation
- Debounced image preview updates

## Accessibility Features

- Semantic HTML structure
- Proper ARIA labels and roles
- Keyboard navigation support
- High contrast colors
- Screen reader friendly
- Focus management

## Future Enhancements

- [ ] File upload support for images
- [ ] Multi-language support
- [ ] Form data persistence in localStorage
- [ ] Advanced image cropping/editing
- [ ] Integration with more webhook services
- [ ] Offline support with service workers

## License

This project is open source and available under the MIT License.