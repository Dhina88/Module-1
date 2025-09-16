# Authentication & Onboarding Web Application

A modern, secure web application that implements comprehensive authentication and onboarding features with JWT token management and session handling.

## Features

### 🔐 Authentication
- **Login/Create Account**: Secure user authentication with form validation
- **JWT Token Management**: Secure token generation, storage, and validation
- **Session Management**: Automatic session tracking and timeout handling
- **Password Security**: Password visibility toggle and strength validation

### 📋 Onboarding
- **Terms & Conditions**: Comprehensive legal terms with user consent
- **Privacy Policy**: Detailed privacy policy with GDPR/CCPA compliance
- **Consent Management**: Required and optional consent checkboxes
- **User Agreement**: Clear acceptance of terms and privacy policies

### 🎨 User Experience
- **Modern UI**: Beautiful, responsive design with gradient backgrounds
- **Form Validation**: Real-time validation with user-friendly error messages
- **Loading States**: Visual feedback during authentication processes
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

### 🔒 Security Features
- **Secure Storage**: LocalStorage with token expiration handling
- **Session Tracking**: Last activity monitoring and automatic logout
- **Input Validation**: Client-side validation for all form inputs
- **Error Handling**: Comprehensive error handling and user feedback

## File Structure

```
├── index.html          # Main application page with login/register forms
├── styles.css          # Complete CSS styling and responsive design
├── auth.js            # JavaScript authentication and session management
├── terms.html         # Terms & Conditions page
├── privacy.html       # Privacy Policy page
└── README.md          # This documentation file
```

## Quick Start

1. **Clone or Download** the project files to your local machine
2. **Open** `index.html` in your web browser
3. **Test the Demo**:
   - Email: `demo@example.com`
   - Password: `password123`

## Demo Credentials

For testing purposes, use these credentials:
- **Email**: demo@example.com
- **Password**: password123

## Features Overview

### Login Form
- Email and password authentication
- "Remember me" functionality
- Password visibility toggle
- Form validation and error handling

### Registration Form
- Full name, email, and password fields
- Password confirmation validation
- Required consent checkboxes for Terms & Conditions and Privacy Policy
- Optional marketing consent checkbox
- Real-time form validation

### Dashboard
- Welcome message with user information
- Session status and expiration details
- Last login timestamp
- Secure logout functionality

### Session Management
- JWT token-based authentication
- Automatic session timeout (1 day default, 30 days with "Remember me")
- Last activity tracking
- Secure token storage and validation

## Technical Implementation

### JWT Authentication
- Client-side JWT token generation (demo purposes)
- Token expiration handling
- Secure token storage in localStorage
- Automatic token validation on page load

### Session Management
- Login time tracking
- Last activity monitoring
- Session expiration management
- Automatic logout on token expiry

### Form Validation
- Real-time password matching validation
- Required field validation
- Email format validation
- Consent requirement validation

### Security Considerations
- Passwords are not stored in plain text (demo implementation)
- JWT tokens include expiration timestamps
- Session data is securely stored
- Input validation prevents malicious data

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Customization

### Styling
The application uses CSS custom properties and modern CSS features. You can easily customize:
- Color scheme in `styles.css`
- Layout and spacing
- Typography and fonts
- Animation and transitions

### Functionality
- Modify JWT token expiration times in `auth.js`
- Add additional form fields in `index.html`
- Extend validation rules in the JavaScript
- Add backend API integration

## Production Deployment

For production use, consider:
1. **Backend Integration**: Replace demo authentication with real API calls
2. **HTTPS**: Ensure secure communication
3. **Server-side JWT**: Move JWT generation to backend
4. **Database**: Implement proper user data storage
5. **Security Headers**: Add appropriate security headers
6. **Rate Limiting**: Implement login attempt limiting

## License

This project is for educational and demonstration purposes. Please ensure compliance with applicable laws and regulations when using in production.

## Support

For questions or issues, please refer to the code comments or create an issue in the project repository.

---

**Note**: This is a frontend demonstration. In a production environment, authentication should be handled by a secure backend service with proper database integration and security measures.
