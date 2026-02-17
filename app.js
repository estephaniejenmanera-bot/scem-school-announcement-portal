// Initialize Lucide icons
lucide.createIcons();

// State Management
let state = {
    currentUser: null,
    userRole: null,
    announcements: [],
    editingId: null,
    showForm: false,
    searchQuery: '',
    filterCategory: 'All Categories',
    sortBy: 'newest' // Added for dynamic sorting
};

// Load announcements from localStorage on init
function loadAnnouncements() {
    const saved = localStorage.getItem('announcements');
    if (saved) {
        state.announcements = JSON.parse(saved).map(ann => {
            // Ensure dates are properly handled
            ann.date = new Date(ann.date);
            if (ann.eventDate) ann.eventDate = new Date(ann.eventDate);
            return ann;
        });
    }
}

// Save announcements to localStorage
function saveAnnouncements() {
    localStorage.setItem('announcements', JSON.stringify(state.announcements));
}

// Helper to get current date
function getCurrentDate() {
    return new Date();
}

// Animate count up
function animateCount(element, target, duration = 1000) {
    let start = 0;
    const increment = target / (duration / 16); // ~60fps
    const animate = () => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            return;
        }
        element.textContent = Math.floor(start);
        requestAnimationFrame(animate);
    };
    animate();
}

// Render Admin Announcements
function renderAdminAnnouncements() {
    const list = document.getElementById('adminAnnouncementsList');
    list.innerHTML = '';
    if (state.announcements.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i data-lucide="bell-off"></i>
                <p>No announcements yet</p>
                <p>Create a new one to get started</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    state.announcements.forEach(ann => {
        const card = document.createElement('div');
        card.className = 'announcement-card';
        card.innerHTML = `
            <div class="announcement-content">
                <div class="announcement-body">
                    <div class="announcement-badges">
                        <span class="badge badge-${ann.category.toLowerCase()}">${ann.category}</span>
                        <span class="badge general">${ann.audience}</span>
                    </div>
                    <h3 class="announcement-title">${ann.title}</h3>
                    <p class="announcement-text">${ann.content}</p>
                    <p class="announcement-date">
                        Posted: ${ann.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        ${ann.eventDate ? ` • Event: ${ann.eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}
                    </p>
                </div>
                <div class="announcement-actions">
                    <button class="btn-icon edit" onclick="editAnnouncement(${ann.id})">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteAnnouncement(${ann.id})">
                        <i data-lucide="trash"></i>
                    </button>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
    lucide.createIcons();
}

// Render Student Announcements
function renderStudentAnnouncements() {
    const list = document.getElementById('announcementsList');
    list.innerHTML = '';
    let filtered = state.announcements.filter(ann => {
        if (ann.audience === 'Faculty Only') return false;
        const matchesSearch = ann.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                              ann.content.toLowerCase().includes(state.searchQuery.toLowerCase());
        const matchesFilter = state.filterCategory === 'All Categories' || ann.category === state.filterCategory;
        return matchesSearch && matchesFilter;
    });

    // Sort filtered announcements
    filtered.sort((a, b) => {
        if (state.sortBy === 'newest') return b.date - a.date;
        if (state.sortBy === 'oldest') return a.date - b.date;
        if (state.sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
    });

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i data-lucide="bell-off"></i>
                <p>No announcements found</p>
                <p>${state.searchQuery || state.filterCategory !== 'All Categories' ? 'Try adjusting your search or filter' : 'No announcements yet'}</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    filtered.forEach((ann, index) => {
        const card = document.createElement('div');
        card.className = `student-announcement-card ${ann.category.toLowerCase() === 'urgent' ? 'urgent' : ''}`;
        const iconMap = {
            General: 'bell',
            Event: 'calendar',
            Academic: 'users',
            Urgent: 'bell-ring'
        };
        card.innerHTML = `
            <div class="announcement-layout">
                <div class="announcement-icon ${ann.category.toLowerCase()}">
                    <i data-lucide="${iconMap[ann.category]}"></i>
                </div>
                <div>
                    <h3 class="student-announcement-title">${ann.title}</h3>
                    <div class="student-announcement-meta">
                        <span class="badge badge-${ann.category.toLowerCase()}">${ann.category}</span>
                        <p class="announcement-date">
                            ${ann.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            ${ann.eventDate ? ` • Event: ${ann.eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}
                        </p>
                    </div>
                    <p class="student-announcement-text">${ann.content}</p>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
    lucide.createIcons();
}

// Update Statistics
function updateStatistics() {
    const total = state.announcements.length;
    const events = state.announcements.filter(a => a.category === 'Event').length;
    const urgent = state.announcements.filter(a => a.category === 'Urgent').length;
    const academic = state.announcements.filter(a => a.category === 'Academic').length;

    // Admin
    animateCount(document.getElementById('totalAnnouncements'), total);
    animateCount(document.getElementById('eventsCount'), events);
    animateCount(document.getElementById('urgentCount'), urgent);
    animateCount(document.getElementById('academicCount'), academic);

    // Student
    const studentTotal = state.announcements.filter(a => a.audience !== 'Faculty Only').length;
    const studentUrgent = state.announcements.filter(a => a.category === 'Urgent' && a.audience !== 'Faculty Only').length;
    const studentEvents = state.announcements.filter(a => a.category === 'Event' && a.audience !== 'Faculty Only').length;
    const studentAcademic = state.announcements.filter(a => a.category === 'Academic' && a.audience !== 'Faculty Only').length;

    animateCount(document.getElementById('studentTotalAnnouncements'), studentTotal);
    animateCount(document.getElementById('studentTotal'), studentTotal);
    animateCount(document.getElementById('studentUrgent'), studentUrgent);
    animateCount(document.getElementById('studentEvents'), studentEvents);
    animateCount(document.getElementById('studentAcademic'), studentAcademic);
}

// Toggle Form
function toggleForm() {
    state.showForm = !state.showForm;
    const form = document.getElementById('announcementForm');
    if (state.showForm) {
        form.classList.remove('hidden');
        document.querySelector('.btn-submit').textContent = 'Create';
        state.editingId = null;
        document.getElementById('formTitle').value = '';
        document.getElementById('formContent').value = '';
        document.getElementById('formCategory').value = 'General';
        document.getElementById('formAudience').value = 'All';
        document.getElementById('formDate').value = '';
    } else {
        form.classList.add('hidden');
    }
}

// Cancel Form
function cancelForm() {
    toggleForm();
}

// Submit Announcement
function submitAnnouncement() {
    const title = document.getElementById('formTitle').value.trim();
    const content = document.getElementById('formContent').value.trim();
    const category = document.getElementById('formCategory').value;
    const audience = document.getElementById('formAudience').value;
    const dateValue = document.getElementById('formDate').value;

    if (!title || !content) {
        alert('Title and content are required');
        return;
    }

    const now = getCurrentDate();
    if (state.editingId !== null) {
        const ann = state.announcements.find(a => a.id === state.editingId);
        ann.title = title;
        ann.content = content;
        ann.category = category;
        ann.audience = audience;
        ann.date = now;
        ann.eventDate = dateValue ? new Date(dateValue) : null;
    } else {
        const newAnn = {
            id: Date.now(),
            title,
            content,
            category,
            audience,
            date: now,
            eventDate: dateValue ? new Date(dateValue) : null
        };
        state.announcements.push(newAnn);
    }

    saveAnnouncements();
    toggleForm();
    renderAdminAnnouncements();
    updateStatistics();
}

// Edit Announcement
function editAnnouncement(id) {
    const ann = state.announcements.find(a => a.id === id);
    if (!ann) return;

    state.editingId = id;
    document.getElementById('formTitle').value = ann.title;
    document.getElementById('formContent').value = ann.content;
    document.getElementById('formCategory').value = ann.category;
    document.getElementById('formAudience').value = ann.audience;
    document.getElementById('formDate').value = ann.eventDate ? ann.eventDate.toISOString().split('T')[0] : '';
    document.querySelector('.btn-submit').textContent = 'Update';
    if (!state.showForm) toggleForm();
}

// Delete Announcement
function deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    state.announcements = state.announcements.filter(a => a.id !== id);
    saveAnnouncements();
    renderAdminAnnouncements();
    updateStatistics();
}

// Handle Search
function handleSearch() {
    state.searchQuery = document.getElementById('searchInput').value;
    renderStudentAnnouncements();
}

// Handle Filter
function handleFilter() {
    state.filterCategory = document.getElementById('filterSelect').value;
    renderStudentAnnouncements();
}

// Handle Sort
function handleSort() {
    state.sortBy = document.getElementById('sortSelect').value;
    renderStudentAnnouncements();
}

// Toggle Password
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.setAttribute('data-lucide', 'eye-off');
    } else {
        passwordInput.type = 'password';
        eyeIcon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons(); // refresh icon
}

// Logout
function logout() {
    state.currentUser = null;
    state.userRole = null;
    document.getElementById('adminDashboard').classList.add('hidden');
    document.getElementById('studentDashboard').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
}

// Login Handler
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value; // Not checked, as per spec

    const error = document.getElementById('errorMessage');
    error.classList.add('hidden');

    if (!email.endsWith('@gfis.edu.ph')) {
        error.textContent = 'Email must end with @gfis.edu.ph';
        error.classList.remove('hidden');
        return;
    }

    state.currentUser = email;
    if (email === 'admin@gfis.edu.ph') {
        state.userRole = 'admin';
        document.getElementById('adminUserEmail').textContent = email;
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        renderAdminAnnouncements();
        updateStatistics();
    } else {
        state.userRole = 'student';
        document.getElementById('studentUserEmail').textContent = email;
        
        // Extract name from email (before @)
        const namePart = email.split('@')[0];
        const studentName = namePart
            .split('.')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        
        document.getElementById('welcomeMessage').textContent = 
            `Welcome Back${studentName ? ', ' + studentName : ''}!`;
        
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('studentDashboard').classList.remove('hidden');
        renderStudentAnnouncements();
        updateStatistics();
    }
});

// Initial load
loadAnnouncements();
if (state.userRole === 'admin') {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    renderAdminAnnouncements();
    updateStatistics();
} else if (state.userRole === 'student') {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('studentDashboard').classList.remove('hidden');
    renderStudentAnnouncements();
    updateStatistics();
} else {
    // Default to login
    document.getElementById('loginPage').classList.remove('hidden');
}