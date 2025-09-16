// Authentication and Session Management System
class AuthManager {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api'; // Backend API URL
        this.tokenKey = 'authToken';
        this.userKey = 'userData';
        this.sessionKey = 'sessionData';
        this.init();
    }

    init() {
        // Check if user is already logged in
        if (this.isLoggedIn()) {
            this.showDashboard();
        } else {
            this.showLogin();
        }
        
        // Set up form event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerFormElement');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Password confirmation validation
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => this.validatePasswordMatch());
        }

        // Profile form
        const profileForm = document.getElementById('profileFormElement');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileSubmit(e));
        }

        // Resume upload
        this.setupResumeUpload();
    }

    setupResumeUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('resumeFile');
        const uploadLink = document.querySelector('.upload-link');

        if (uploadArea && fileInput) {
            // Click to upload
            uploadArea.addEventListener('click', () => fileInput.click());
            if (uploadLink) {
                uploadLink.addEventListener('click', (e) => {
                    e.stopPropagation();
                    fileInput.click();
                });
            }

            // File selection
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

            // Drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileSelect({ target: { files } });
                }
            });
        }
    }

    // JWT Token Management
    generateJWT(payload) {
        // In a real application, this would be done on the server
        // For demo purposes, we'll create a simple token
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payloadEncoded = btoa(JSON.stringify(payload));
        const signature = btoa('demo-signature');
        return `${header}.${payloadEncoded}.${signature}`;
    }

    parseJWT(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            return JSON.parse(atob(parts[1]));
        } catch (error) {
            console.error('Error parsing JWT:', error);
            return null;
        }
    }

    // Authentication Methods
    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password'),
            rememberMe: formData.get('rememberMe') === 'on'
        };

        try {
            this.showLoading('loginFormElement');
            const response = await this.login(loginData);
            this.showMessage('Login successful!', 'success');
            this.showDashboard();
        } catch (error) {
            this.showMessage(error.message, 'error');
        } finally {
            this.hideLoading('loginFormElement');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Validate password match
        if (!this.validatePasswordMatch()) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        // Validate consent
        const termsConsent = document.getElementById('termsConsent').checked;
        const privacyConsent = document.getElementById('privacyConsent').checked;
        
        if (!termsConsent || !privacyConsent) {
            this.showMessage('You must agree to Terms & Conditions and Privacy Policy', 'error');
            return;
        }

        const registerData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            termsConsent,
            privacyConsent,
            marketingConsent: formData.get('marketingConsent') === 'on'
        };

        try {
            this.showLoading('registerFormElement');
            const response = await this.register(registerData);
            this.showMessage('Account created successfully! Please sign in.', 'success');
            this.showLogin();
        } catch (error) {
            this.showMessage(error.message, 'error');
        } finally {
            this.hideLoading('registerFormElement');
        }
    }

    async login(credentials) {
        // Simulate API call - in real app, this would call your backend
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Demo validation
                if (credentials.email === 'demo@example.com' && credentials.password === 'password123') {
                    const userData = {
                        id: 1,
                        name: 'Demo User',
                        email: credentials.email,
                        loginTime: new Date().toISOString()
                    };
                    
                    const token = this.generateJWT({
                        userId: userData.id,
                        email: userData.email,
                        exp: Math.floor(Date.now() / 1000) + (credentials.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60) // 30 days or 1 day
                    });

                    this.setSession(userData, token);
                    resolve({ user: userData, token });
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 1000);
        });
    }

    async register(userData) {
        // Simulate API call - in real app, this would call your backend
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Demo validation
                if (userData.email && userData.password && userData.name) {
                    resolve({ message: 'User registered successfully' });
                } else {
                    reject(new Error('Registration failed. Please check your information.'));
                }
            }, 1000);
        });
    }

    // Session Management
    setSession(userData, token) {
        localStorage.setItem(this.userKey, JSON.stringify(userData));
        localStorage.setItem(this.tokenKey, token);
        
        const sessionData = {
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            expiresAt: this.getTokenExpiration(token)
        };
        localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    }

    getSession() {
        const sessionData = localStorage.getItem(this.sessionKey);
        return sessionData ? JSON.parse(sessionData) : null;
    }

    updateLastActivity() {
        const sessionData = this.getSession();
        if (sessionData) {
            sessionData.lastActivity = new Date().toISOString();
            localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        }
    }

    isLoggedIn() {
        const token = localStorage.getItem(this.tokenKey);
        if (!token) return false;

        const payload = this.parseJWT(token);
        if (!payload) return false;

        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            this.logout();
            return false;
        }

        return true;
    }

    getTokenExpiration(token) {
        const payload = this.parseJWT(token);
        return payload && payload.exp ? new Date(payload.exp * 1000).toISOString() : null;
    }

    logout() {
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.sessionKey);
        this.showLogin();
    }

    // UI Management
    showLogin() {
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('registerForm').classList.remove('active');
        document.getElementById('dashboard').classList.add('hidden');
    }

    showRegister() {
        document.getElementById('registerForm').classList.add('active');
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('dashboard').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('registerForm').classList.remove('active');
        
        this.updateDashboardInfo();
    }

    updateDashboardInfo() {
        const userData = JSON.parse(localStorage.getItem(this.userKey) || '{}');
        const sessionData = this.getSession();
        
        document.getElementById('userName').textContent = userData.name || 'User';
        document.getElementById('lastLogin').textContent = new Date(sessionData?.loginTime || Date.now()).toLocaleString();
        document.getElementById('sessionExpiry').textContent = sessionData?.expiresAt ? 
            new Date(sessionData.expiresAt).toLocaleString() : 'Unknown';
        
        // Check profile completion status
        this.checkProfileCompletion();
    }

    checkProfileCompletion() {
        const profileData = this.getProfileData();
        const isProfileComplete = this.isProfileComplete(profileData);
        
        const profileStatus = document.getElementById('profileStatus');
        const profileForm = document.getElementById('profileForm');
        const profileDisplay = document.getElementById('profileDisplay');
        
        if (isProfileComplete) {
            profileStatus.textContent = 'Profile Complete';
            profileStatus.className = 'status-badge complete';
            profileForm.classList.add('hidden');
            profileDisplay.classList.remove('hidden');
            this.displayProfileData(profileData);
        } else {
            profileStatus.textContent = 'Profile Incomplete';
            profileStatus.className = 'status-badge incomplete';
            profileForm.classList.remove('hidden');
            profileDisplay.classList.add('hidden');
        }
    }

    isProfileComplete(profileData) {
        const requiredFields = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'address', 'city', 'country', 'university', 'course', 'grade', 'studyStart', 'graduationDate'];
        return requiredFields.every(field => profileData[field] && profileData[field].trim() !== '');
    }

    getProfileData() {
        return JSON.parse(localStorage.getItem('profileData') || '{}');
    }

    saveProfileData(profileData) {
        localStorage.setItem('profileData', JSON.stringify(profileData));
    }

    displayProfileData(profileData) {
        // Update profile display
        document.getElementById('displayName').textContent = `${profileData.firstName} ${profileData.lastName}`;
        document.getElementById('displayEmail').textContent = JSON.parse(localStorage.getItem(this.userKey) || '{}').email || '';
        document.getElementById('displayPhone').textContent = profileData.phone || '';
        document.getElementById('displayDOB').textContent = profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : '';
        document.getElementById('displayAddress').textContent = profileData.address || '';
        document.getElementById('displayCity').textContent = profileData.city || '';
        document.getElementById('displayCountry').textContent = profileData.country || '';
        
        // Update bio section
        const bioSection = document.getElementById('bioSection');
        const displayBio = document.getElementById('displayBio');
        if (profileData.bio && profileData.bio.trim()) {
            displayBio.textContent = profileData.bio;
            bioSection.style.display = 'block';
        } else {
            bioSection.style.display = 'none';
        }
        
        // Update skills section
        const skillsSection = document.getElementById('skillsSection');
        const displaySkills = document.getElementById('displaySkills');
        if (profileData.skills && profileData.skills.trim()) {
            const skills = profileData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
            displaySkills.innerHTML = skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
            skillsSection.style.display = 'block';
        } else {
            skillsSection.style.display = 'none';
        }
        
        // Update education section
        const educationSection = document.getElementById('educationSection');
        const displayUniversity = document.getElementById('displayUniversity');
        const displayCourse = document.getElementById('displayCourse');
        const displayGrade = document.getElementById('displayGrade');
        const displayEducationDates = document.getElementById('displayEducationDates');
        
        if (profileData.university && profileData.course) {
            // Get university name from value
            const universitySelect = document.getElementById('university');
            const universityName = universitySelect.querySelector(`option[value="${profileData.university}"]`)?.textContent || profileData.university;
            
            displayUniversity.textContent = universityName;
            displayCourse.textContent = profileData.course;
            displayGrade.textContent = `Grade: ${profileData.grade}`;
            
            // Format dates
            const startDate = profileData.studyStart ? new Date(profileData.studyStart).toLocaleDateString() : '';
            const endDate = profileData.graduationDate ? new Date(profileData.graduationDate).toLocaleDateString() : '';
            displayEducationDates.textContent = `${startDate} - ${endDate}`;
            
            educationSection.style.display = 'block';
        } else {
            educationSection.style.display = 'none';
        }
        
        // Update resume section
        const resumeData = this.getResumeData();
        const resumeSection = document.getElementById('resumeSection');
        const resumeFileName = document.getElementById('resumeFileName');
        if (resumeData.fileName) {
            resumeFileName.textContent = resumeData.fileName;
            resumeSection.style.display = 'block';
        } else {
            resumeSection.style.display = 'none';
        }
    }

    // Form Validation
    validatePasswordMatch() {
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (confirmPassword && password !== confirmPassword) {
            document.getElementById('confirmPassword').style.borderColor = '#dc3545';
            return false;
        } else {
            document.getElementById('confirmPassword').style.borderColor = '#e1e5e9';
            return true;
        }
    }

    // Profile Management Methods
    async handleProfileSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const profileData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            phone: formData.get('phone'),
            dateOfBirth: formData.get('dateOfBirth'),
            address: formData.get('address'),
            city: formData.get('city'),
            country: formData.get('country'),
            bio: formData.get('bio'),
            skills: formData.get('skills'),
            university: formData.get('university'),
            course: formData.get('course'),
            grade: formData.get('grade'),
            studyStart: formData.get('studyStart'),
            graduationDate: formData.get('graduationDate')
        };

        try {
            this.showLoading('profileFormElement');
            this.saveProfileData(profileData);
            this.showMessage('Profile saved successfully!', 'success');
            this.checkProfileCompletion();
        } catch (error) {
            this.showMessage('Error saving profile: ' + error.message, 'error');
        } finally {
            this.hideLoading('profileFormElement');
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            this.showMessage('Please select a valid file (PDF, DOC, or DOCX)', 'error');
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            this.showMessage('File size must be less than 5MB', 'error');
            return;
        }

        // Show file preview
        this.showFilePreview(file);
    }

    showFilePreview(file) {
        const filePreview = document.getElementById('filePreview');
        const fileName = document.querySelector('.file-name');
        const fileSize = document.querySelector('.file-size');
        const uploadBtn = document.getElementById('uploadBtn');
        const parseBtn = document.getElementById('parseBtn');

        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        
        filePreview.classList.remove('hidden');
        uploadBtn.disabled = false;
        parseBtn.disabled = false;

        // Store file for upload
        this.currentFile = file;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async uploadResume() {
        if (!this.currentFile) {
            this.showMessage('Please select a file first', 'error');
            return;
        }

        try {
            this.showMessage('Uploading resume...', 'success');
            
            // Simulate upload process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Save resume data
            const resumeData = {
                fileName: this.currentFile.name,
                fileSize: this.currentFile.size,
                uploadDate: new Date().toISOString(),
                fileType: this.currentFile.type
            };
            
            this.saveResumeData(resumeData);
            this.showMessage('Resume uploaded successfully!', 'success');
            
            // Update profile display if profile is complete
            const profileData = this.getProfileData();
            if (this.isProfileComplete(profileData)) {
                this.displayProfileData(profileData);
            }
            
        } catch (error) {
            this.showMessage('Error uploading resume: ' + error.message, 'error');
        }
    }

    async parseResume() {
        if (!this.currentFile) {
            this.showMessage('Please select a file first', 'error');
            return;
        }

        try {
            this.showMessage('Parsing resume... This may take a moment.', 'success');
            
            // Simulate parsing process
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Mock parsed data (in real app, this would come from a parsing service)
            const parsedData = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+1 (555) 123-4567',
                skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL'],
                experience: '5 years of software development experience',
                education: 'Bachelor of Computer Science'
            };
            
            // Auto-fill form with parsed data
            this.autoFillProfile(parsedData);
            this.showMessage('Resume parsed successfully! Please review and update the information.', 'success');
            
        } catch (error) {
            this.showMessage('Error parsing resume: ' + error.message, 'error');
        }
    }

    autoFillProfile(parsedData) {
        // Auto-fill form fields with parsed data
        const fields = {
            firstName: parsedData.name?.split(' ')[0] || '',
            lastName: parsedData.name?.split(' ').slice(1).join(' ') || '',
            phone: parsedData.phone || '',
            skills: parsedData.skills?.join(', ') || ''
        };

        Object.keys(fields).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && fields[fieldId]) {
                field.value = fields[fieldId];
            }
        });

        // Update bio with experience if available
        const bioField = document.getElementById('bio');
        if (bioField && parsedData.experience) {
            bioField.value = parsedData.experience;
        }
    }

    getResumeData() {
        return JSON.parse(localStorage.getItem('resumeData') || '{}');
    }

    saveResumeData(resumeData) {
        localStorage.setItem('resumeData', JSON.stringify(resumeData));
    }

    removeFile() {
        const filePreview = document.getElementById('filePreview');
        const uploadBtn = document.getElementById('uploadBtn');
        const parseBtn = document.getElementById('parseBtn');
        const fileInput = document.getElementById('resumeFile');

        filePreview.classList.add('hidden');
        uploadBtn.disabled = true;
        parseBtn.disabled = true;
        fileInput.value = '';
        this.currentFile = null;
    }

    downloadResume() {
        const resumeData = this.getResumeData();
        if (resumeData.fileName) {
            // In a real app, this would download the actual file
            this.showMessage('Download functionality would be implemented with backend integration', 'success');
        } else {
            this.showMessage('No resume available for download', 'error');
        }
    }

    editProfile() {
        const profileData = this.getProfileData();
        
        // Fill form with existing data
        Object.keys(profileData).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = profileData[fieldId] || '';
            }
        });

        // Show form and hide display
        document.getElementById('profileForm').classList.remove('hidden');
        document.getElementById('profileDisplay').classList.add('hidden');
        
        // Scroll to form
        document.getElementById('profileForm').scrollIntoView({ behavior: 'smooth' });
    }

    // Utility Methods
    showLoading(formId) {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Processing...';
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = originalText;
    }

    hideLoading(formId) {
        const form = document.getElementById(formId);
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = submitBtn.dataset.originalText;
        submitBtn.disabled = false;
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Insert message at the top of the profile section
        const profileSection = document.querySelector('.profile-section');
        if (profileSection) {
            profileSection.insertBefore(messageDiv, profileSection.firstChild);
            
            // Auto-remove message after 5 seconds
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }
    }
}

// Global Functions for HTML onclick events
function showLogin() {
    authManager.showLogin();
}

function showRegister() {
    authManager.showRegister();
}

function logout() {
    authManager.logout();
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function uploadResume() {
    if (authManager) {
        authManager.uploadResume();
    }
}

function parseResume() {
    if (authManager) {
        authManager.parseResume();
    }
}

function removeFile() {
    if (authManager) {
        authManager.removeFile();
    }
}

function downloadResume() {
    if (authManager) {
        authManager.downloadResume();
    }
}

function editProfile() {
    if (authManager) {
        authManager.editProfile();
    }
}

// Initialize the authentication manager when the page loads
let authManager;
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
    
    // Update last activity every 5 minutes
    setInterval(() => {
        if (authManager.isLoggedIn()) {
            authManager.updateLastActivity();
        }
    }, 5 * 60 * 1000);
});
