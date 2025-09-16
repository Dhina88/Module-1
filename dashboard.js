function getProfileData() {
    try { return JSON.parse(localStorage.getItem('profileData') || '{}'); } catch { return {}; }
}

function getUserData() {
    try { return JSON.parse(localStorage.getItem('userData') || '{}'); } catch { return {}; }
}

function switchDashTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    const pane = document.getElementById(`dash-tab-${tab}`);
    if (btn) btn.classList.add('active');
    if (pane) pane.classList.add('active');
}

function renderJobs() {
    const jobs = [
        { title: 'Frontend Developer', company: 'TechNova', location: 'Kuala Lumpur', tags: ['React', 'TypeScript', 'UI'], id: 1 },
        { title: 'Backend Engineer', company: 'CloudBridge', location: 'Penang', tags: ['Node.js', 'Express', 'MongoDB'], id: 2 },
        { title: 'Data Analyst', company: 'InsightIQ', location: 'Remote', tags: ['SQL', 'Python', 'BI'], id: 3 },
        { title: 'Product Manager', company: 'BrightApps', location: 'Selangor', tags: ['Agile', 'Roadmap'], id: 4 }
    ];
    const list = document.getElementById('dashJobsList');
    list.innerHTML = jobs.map(j => `
        <div class="job-card">
            <h4>${j.title}</h4>
            <div class="job-meta">${j.company} · ${j.location}</div>
            <div class="job-tags">${j.tags.map(t => `<span class=\"job-tag\">${t}</span>`).join('')}</div>
            <button class="apply-btn" onclick="applyDashJob(${j.id})">Apply</button>
        </div>
    `).join('');
}

function renderProfile() {
    const p = getProfileData();
    if (!p || !p.firstName) {
        document.getElementById('dashProfile').innerHTML = '<p>Please complete your profile in the onboarding flow.</p>';
        return;
    }
    const university = p.university === 'other' ? (p.otherUniversity || 'Other University') : p.university;
    const html = `
        <div class="profile-info">
            <div class="profile-header">
                <div class="profile-avatar"><i class="fas fa-user"></i></div>
                <div class="profile-details">
                    <h4>${p.firstName} ${p.lastName}</h4>
                    <p>${p.email}</p>
                    <p>${p.phone}</p>
                </div>
            </div>
            <div class="profile-content">
                <div class="info-section">
                    <h5>Personal Information</h5>
                    <div class="info-grid">
                        <div class="info-item"><label>Date of Birth:</label><span>${p.dateOfBirth || ''}</span></div>
                        <div class="info-item"><label>Address:</label><span>${p.address || ''}</span></div>
                        <div class="info-item"><label>City:</label><span>${p.city || ''}</span></div>
                        <div class="info-item"><label>Country:</label><span>${p.country || ''}</span></div>
                    </div>
                </div>
                ${p.bio ? `<div class="info-section"><h5>Professional Summary</h5><p>${p.bio}</p></div>` : ''}
                ${p.skills ? `<div class="info-section"><h5>Skills</h5><div class="skills-tags">${p.skills.split(',').map(s=>`<span class=\"skill-tag\">${s.trim()}</span>`).join('')}</div></div>` : ''}
                <div class="info-section">
                    <h5><i class="fas fa-graduation-cap"></i> Education</h5>
                    <div class="education-info">
                        <div class="education-item">
                            <div class="education-header">
                                <h6>${university}</h6>
                                <span class="education-dates">${p.studyStart || ''} - ${p.graduationDate || ''}</span>
                            </div>
                            <p class="education-course">${p.course || ''}</p>
                            <p class="education-grade">Grade: ${p.grade || ''}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('dashProfile').innerHTML = html;
}

function renderHistory() {
    const history = [
        { title: 'Frontend Developer at TechNova', status: 'Applied', pill: 'status-applied', time: '2d ago' },
        { title: 'Backend Engineer at CloudBridge', status: 'Interview Scheduled', pill: 'status-interview', time: '1d ago' },
        { title: 'Data Analyst at InsightIQ', status: 'Offer Extended', pill: 'status-offer', time: 'Just now' }
    ];
    const container = document.getElementById('dashHistory');
    container.innerHTML = history.map(h => `
        <div class="history-item">
            <div class="history-title">${h.title}</div>
            <div class="history-status"><span class="status-pill ${h.pill}">${h.status}</span> · ${h.time}</div>
        </div>
    `).join('');
}

function startMockNotifications() {
    const panel = document.getElementById('notificationsPanel');
    const messages = [
        { title: 'Interview Reminder', text: 'Your interview with CloudBridge is tomorrow at 10:00 AM.' },
        { title: 'New Job Match', text: 'A new React role matches your profile.' },
        { title: 'Application Update', text: 'TechNova viewed your application.' }
    ];
    setInterval(() => {
        const m = messages[Math.floor(Math.random()*messages.length)];
        const n = document.createElement('div');
        n.className = 'notification';
        n.innerHTML = `<h5>${m.title}</h5><p>${m.text}</p><div class="time">${new Date().toLocaleTimeString()}</div>`;
        panel.appendChild(n);
        setTimeout(() => n.remove(), 10000);
    }, 8000);
}

function applyDashJob(id) {
    alert('Applied to job #' + id + ' successfully!');
}

function goLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionData');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const user = getUserData();
    document.getElementById('dashUserName').textContent = user.name || 'User';
    renderJobs();
    renderProfile();
    renderHistory();
    startMockNotifications();
});


