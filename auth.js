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
            uploadArea.addEventListener('click', (e) => {
                e.preventDefault();
                fileInput.click();
            });
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
        // Initialize dashboard content
        this.renderJobs();
        this.renderHistory();
        this.startMockNotifications();
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
        const tabsContainer = document.getElementById('tabsContainer');
        
        if (isProfileComplete) {
            profileStatus.textContent = 'Profile Complete';
            profileStatus.className = 'status-badge complete';
            profileForm.classList.add('hidden');
            profileDisplay.classList.remove('hidden');
            if (tabsContainer) tabsContainer.classList.remove('hidden');
            this.displayProfileData(profileData);
        } else {
            profileStatus.textContent = 'Profile Incomplete';
            profileStatus.className = 'status-badge incomplete';
            profileForm.classList.remove('hidden');
            profileDisplay.classList.add('hidden');
            if (tabsContainer) tabsContainer.classList.add('hidden');
        }
    }

    isProfileComplete(profileData) {
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'address', 'city', 'country', 'university', 'course', 'grade', 'studyStart', 'graduationDate'];
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
        document.getElementById('displayEmail').textContent = profileData.email || '';
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
            // Get university name from value or use other university
            let universityName;
            if (profileData.university === 'other' && profileData.otherUniversity) {
                universityName = profileData.otherUniversity;
            } else {
                const universitySelect = document.getElementById('university');
                universityName = universitySelect.querySelector(`option[value="${profileData.university}"]`)?.textContent || profileData.university;
            }
            
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
            email: formData.get('email'),
            phone: formData.get('phone'),
            dateOfBirth: formData.get('dateOfBirth'),
            address: formData.get('address'),
            city: formData.get('city'),
            country: formData.get('country'),
            bio: formData.get('bio'),
            skills: formData.get('skills'),
            university: formData.get('university'),
            otherUniversity: formData.get('otherUniversity'),
            course: formData.get('course'),
            grade: formData.get('grade'),
            studyStart: formData.get('studyStart'),
            graduationDate: formData.get('graduationDate'),
            experiences: this.collectExperiences()
        };

        try {
            this.showLoading('profileFormElement');
            this.saveProfileData(profileData);
            this.showMessage('Account created successfully! Redirecting to your dashboard...', 'success');
            this.checkProfileCompletion();
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1200);
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
        
        // Reset to step 1
        this.currentStep = 1;
        this.showStep(1);
        
        // Scroll to form
        document.getElementById('profileForm').scrollIntoView({ behavior: 'smooth' });
    }

    // Multi-step form functionality
    currentStep = 1;

    showStep(step) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        document.getElementById(`step${step}`).classList.add('active');
        
        // Update progress indicator
        document.querySelectorAll('.progress-step').forEach((progressStep, index) => {
            if (index + 1 <= step) {
                progressStep.classList.add('active');
            } else {
                progressStep.classList.remove('active');
            }
        });
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < 3) {
                this.currentStep++;
                this.showStep(this.currentStep);
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }

    validateCurrentStep() {
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#dc3545';
                isValid = false;
            } else {
                field.style.borderColor = '#e1e5e9';
            }
        });

        // Require resume uploaded on step 1
        if (this.currentStep === 1) {
            const resumeData = this.getResumeData();
            if (!resumeData.fileName) {
                this.showMessage('Please upload your resume before proceeding', 'error');
                isValid = false;
            }
        }

        // Require resume uploaded on step 1
        if (this.currentStep === 1) {
            const resumeData = this.getResumeData();
            if (!resumeData.fileName) {
                this.showMessage('Please upload your resume before proceeding', 'error');
                isValid = false;
            }
        }

        // Special validation for university
        if (this.currentStep === 2) {
            const university = document.getElementById('university').value;
            const otherUniversity = document.getElementById('otherUniversity').value;
            
            if (university === 'other' && !otherUniversity.trim()) {
                document.getElementById('otherUniversity').style.borderColor = '#dc3545';
                this.showMessage('Please specify your university name', 'error');
                isValid = false;
            }
        }

        if (!isValid) {
            this.showMessage('Please fill in all required fields', 'error');
        }

        return isValid;
    }

    // Dashboard: Tabs and Data
    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
        const pane = document.getElementById(`tab-${tab}`);
        if (btn) btn.classList.add('active');
        if (pane) pane.classList.add('active');
    }

    renderJobs() {
        const jobs = [
            { title: 'Frontend Developer', company: 'TechNova', location: 'Kuala Lumpur', tags: ['React', 'TypeScript', 'UI'], id: 1 },
            { title: 'Backend Engineer', company: 'CloudBridge', location: 'Penang', tags: ['Node.js', 'Express', 'MongoDB'], id: 2 },
            { title: 'Data Analyst', company: 'InsightIQ', location: 'Remote', tags: ['SQL', 'Python', 'BI'], id: 3 },
            { title: 'Product Manager', company: 'BrightApps', location: 'Selangor', tags: ['Agile', 'Roadmap'], id: 4 }
        ];
        const list = document.getElementById('jobsList');
        if (!list) return;
        list.innerHTML = jobs.map(j => `
            <div class=\"job-card\">
                <h4>${j.title}</h4>
                <div class=\"job-meta\">${j.company} · ${j.location}</div>
                <div class=\"job-tags\">${j.tags.map(t => `<span class=\\\"job-tag\\\">${t}</span>`).join('')}</div>
                <button class=\"apply-btn\" onclick=\"applyJob(${j.id})\">Apply</button>
            </div>
        `).join('');
    }

    renderHistory() {
        const history = [
            { title: 'Frontend Developer at TechNova', status: 'Applied', pill: 'status-applied', time: '2d ago' },
            { title: 'Backend Engineer at CloudBridge', status: 'Interview Scheduled', pill: 'status-interview', time: '1d ago' },
            { title: 'Data Analyst at InsightIQ', status: 'Offer Extended', pill: 'status-offer', time: 'Just now' }
        ];
        const container = document.getElementById('historyTimeline');
        if (!container) return;
        container.innerHTML = history.map(h => `
            <div class=\"history-item\">
                <div class=\"history-title\">${h.title}</div>
                <div class=\"history-status\"><span class=\"status-pill ${h.pill}\">${h.status}</span> · ${h.time}</div>
            </div>
        `).join('');
    }

    startMockNotifications() {
        if (this._notifInterval) return;
        let panel = document.getElementById('notificationsPanel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'notificationsPanel';
            panel.className = 'notifications-panel';
            document.body.appendChild(panel);
        }
        const messages = [
            { title: 'Interview Reminder', text: 'Your interview with CloudBridge is tomorrow at 10:00 AM.' },
            { title: 'New Job Match', text: 'A new React role matches your profile.' },
            { title: 'Application Update', text: 'TechNova viewed your application.' }
        ];
        this._notifInterval = setInterval(() => {
            const m = messages[Math.floor(Math.random()*messages.length)];
            const n = document.createElement('div');
            n.className = 'notification';
            n.innerHTML = `<h5>${m.title}</h5><p>${m.text}</p><div class=\"time\">${new Date().toLocaleTimeString()}</div>`;
            panel.appendChild(n);
            setTimeout(() => n.remove(), 10000);
        }, 8000);
    }

    collectExperiences() {
        const experiences = [];
        const experienceItems = document.querySelectorAll('.experience-item');
        
        experienceItems.forEach((item, index) => {
            const company = item.querySelector(`#exp${index + 1}Company`)?.value;
            const position = item.querySelector(`#exp${index + 1}Position`)?.value;
            const startDate = item.querySelector(`#exp${index + 1}StartDate`)?.value;
            const endDate = item.querySelector(`#exp${index + 1}EndDate`)?.value;
            const description = item.querySelector(`#exp${index + 1}Description`)?.value;
            
            if (company && position && startDate) {
                experiences.push({
                    company,
                    position,
                    startDate,
                    endDate: endDate || null,
                    description: description || ''
                });
            }
        });
        
        return experiences;
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

function switchTab(tab) {
    if (authManager) {
        authManager.switchTab(tab);
    }
}

function applyJob(id) {
    // Mock apply action
    alert('Applied to job #' + id + ' successfully!');
}

function nextStep() {
    if (authManager) {
        authManager.nextStep();
    }
}

function prevStep() {
    if (authManager) {
        authManager.prevStep();
    }
}

function toggleOtherUniversity() {
    const university = document.getElementById('university').value;
    const otherUniversityGroup = document.getElementById('otherUniversityGroup');
    const otherUniversityInput = document.getElementById('otherUniversity');
    
    if (university === 'other') {
        otherUniversityGroup.classList.remove('hidden');
        otherUniversityInput.required = true;
    } else {
        otherUniversityGroup.classList.add('hidden');
        otherUniversityInput.required = false;
        otherUniversityInput.value = '';
    }
}

function addExperience() {
    const container = document.getElementById('experienceContainer');
    const experienceCount = container.children.length + 1;
    
    const experienceHTML = `
        <div class="experience-item">
            <h4>Experience ${experienceCount}</h4>
            <div class="form-row">
                <div class="form-group">
                    <label for="exp${experienceCount}Company">Company/Organization *</label>
                    <input type="text" id="exp${experienceCount}Company" name="exp${experienceCount}Company" placeholder="Company name">
                    <i class="fas fa-building form-icon"></i>
                </div>
                <div class="form-group">
                    <label for="exp${experienceCount}Position">Position/Title *</label>
                    <input type="text" id="exp${experienceCount}Position" name="exp${experienceCount}Position" placeholder="Your position">
                    <i class="fas fa-user-tie form-icon"></i>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="exp${experienceCount}StartDate">Start Date *</label>
                    <input type="date" id="exp${experienceCount}StartDate" name="exp${experienceCount}StartDate">
                    <i class="fas fa-calendar-alt form-icon"></i>
                </div>
                <div class="form-group">
                    <label for="exp${experienceCount}EndDate">End Date</label>
                    <input type="date" id="exp${experienceCount}EndDate" name="exp${experienceCount}EndDate">
                    <i class="fas fa-calendar-check form-icon"></i>
                </div>
            </div>
            
            <div class="form-group">
                <label for="exp${experienceCount}Description">Job Description</label>
                <textarea id="exp${experienceCount}Description" name="exp${experienceCount}Description" rows="3" placeholder="Describe your responsibilities and achievements"></textarea>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', experienceHTML);
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
