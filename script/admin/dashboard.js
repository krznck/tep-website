// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.membersData = null;
        this.projectsData = null;
        this.currentTab = 'current';
        
        this.initializeDashboard();
    }

    initializeDashboard() {
        // Check authentication
        if (!this.checkAuth()) {
            window.location.href = './admin.html';
            return;
        }

        this.setupEventListeners();
        this.loadData();
        this.updateUI();
    }

    checkAuth() {
        const user = sessionStorage.getItem('adminUser');
        if (!user) return false;

        try {
            this.currentUser = JSON.parse(user);
            const loginTime = new Date(this.currentUser.loginTime);
            const now = new Date();
            const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);

            return hoursSinceLogin < 8;
        } catch (error) {
            return false;
        }
    }

    setupEventListeners() {
        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            sessionStorage.removeItem('adminUser');
            window.location.href = './admin.html';
        });

        // Download all changes button
        document.getElementById('downloadAllBtn').addEventListener('click', () => {
            this.downloadAllChanges();
        });

        // Reset data button
        document.getElementById('resetDataBtn').addEventListener('click', () => {
            this.resetToOriginal();
        });



        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e.target.dataset.section));
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Add buttons
        document.getElementById('addMemberBtn').addEventListener('click', () => this.openMemberModal());
        document.getElementById('addProjectBtn').addEventListener('click', () => this.openProjectModal());

        // Modal close buttons
        document.getElementById('closeMemberModal').addEventListener('click', () => this.closeMemberModal());
        document.getElementById('closeProjectModal').addEventListener('click', () => this.closeProjectModal());
        document.getElementById('cancelMemberEdit').addEventListener('click', () => this.closeMemberModal());
        document.getElementById('cancelProjectEdit').addEventListener('click', () => this.closeProjectModal());

        // Form submissions
        document.getElementById('memberForm').addEventListener('submit', (e) => this.saveMember(e));
        document.getElementById('projectForm').addEventListener('submit', (e) => this.saveProject(e));

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeMemberModal();
                this.closeProjectModal();
            }
        });
    }

    async loadData() {
        try {
            // Check if we have saved data in localStorage first
            const savedMembers = localStorage.getItem('tep_admin_members');
            const savedProjects = localStorage.getItem('tep_admin_projects');
            
            if (savedMembers) {
                this.membersData = JSON.parse(savedMembers);
                this.showInfoMessage('Loaded members from saved changes');
            } else {
                // Load members from original file
                const membersResponse = await fetch('./data/members.json');
                this.membersData = await membersResponse.json();
            }

            if (savedProjects) {
                this.projectsData = JSON.parse(savedProjects);
                this.showInfoMessage('Loaded projects from saved changes');
            } else {
                // Load projects from original file
                const projectsResponse = await fetch('./data/projects.json');
                this.projectsData = await projectsResponse.json();
            }

            this.renderMembers();
            this.renderProjects();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    updateUI() {
        // Update welcome message
        document.getElementById('welcomeMessage').textContent = 
            `Welcome, ${this.currentUser.username} (${this.currentUser.role})`;

        // Hide/show elements based on role
        if (this.currentUser.role === 'alumni') {
            document.getElementById('projectsBtn').style.display = 'none';
            document.getElementById('alumniTab').style.display = 'inline-block';
            this.switchTab('alumni');
        } else {
            document.getElementById('projectsBtn').style.display = 'inline-block';
            document.getElementById('alumniTab').style.display = 'inline-block';
        }
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(`${section}Section`).classList.add('active');
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        this.renderMembers();
    }

    renderMembers() {
        const membersList = document.getElementById('membersList');
        const members = this.membersData[this.currentTab] || [];
        
        if (members.length === 0) {
            membersList.innerHTML = '<p>No members found in this category.</p>';
            return;
        }

        membersList.innerHTML = members.map(member => `
            <div class="member-card">
                <div class="member-info">
                    <h3>${member.name}</h3>
                    <p><strong>Program:</strong> ${member.programName || 'N/A'}</p>
                    <p><strong>Degree:</strong> ${member.degreeLevel || 'N/A'}</p>
                    <p><strong>Year:</strong> ${member.yearOfStudy || 'N/A'}</p>
                    <p><strong>Description:</strong> ${member.description || 'No description available'}</p>
                </div>
                <div class="card-actions">
                    ${this.canEditMember() ? `
                        <button class="edit-btn" onclick="adminDashboard.editMember(${member.id}, '${this.currentTab}')">Edit</button>
                        <button class="delete-btn" onclick="adminDashboard.deleteMember(${member.id}, '${this.currentTab}')">Delete</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderProjects() {
        const projectsList = document.getElementById('projectsList');
        
        if (!this.canEditProjects()) {
            return;
        }

        projectsList.innerHTML = this.projectsData.map(project => `
            <div class="project-card">
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p><strong>Date:</strong> ${project.date || 'N/A'}</p>
                    <p><strong>Category:</strong> ${project.category || 'N/A'}</p>
                    <p><strong>Description:</strong> ${project.description || 'No description available'}</p>
                </div>
                <div class="card-actions">
                    <button class="edit-btn" onclick="adminDashboard.editProject(${project.id})">Edit</button>
                    <button class="delete-btn" onclick="adminDashboard.deleteProject(${project.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    canEditMember() {
        if (this.currentUser.role === 'student') return true;
        if (this.currentUser.role === 'alumni' && this.currentTab === 'alumni') return true;
        return false;
    }

    canEditProjects() {
        return this.currentUser.role === 'student';
    }

    openMemberModal(member = null, type = null) {
        if (!this.canEditMember()) {
            alert('You do not have permission to edit members in this category.');
            return;
        }

        const modal = document.getElementById('memberModal');
        const title = document.getElementById('memberModalTitle');
        const form = document.getElementById('memberForm');

        if (member) {
            title.textContent = 'Edit Member';
            this.populateMemberForm(member, type);
        } else {
            title.textContent = 'Add New Member';
            form.reset();
            document.getElementById('memberId').value = '';
            document.getElementById('memberType').value = this.currentTab;
        }

        modal.classList.add('show');
    }

    populateMemberForm(member, type) {
        document.getElementById('memberId').value = member.id;
        document.getElementById('memberType').value = type;
        document.getElementById('memberName').value = member.name || '';
        document.getElementById('memberPhoto').value = member.photo || '';
        document.getElementById('memberProgram').value = member.programName || '';
        document.getElementById('memberDegree').value = member.degreeLevel || 'Bachelor';
        document.getElementById('memberYear').value = member.yearOfStudy || '';
        document.getElementById('memberDescription').value = member.description || '';
    }

    closeMemberModal() {
        document.getElementById('memberModal').classList.remove('show');
    }

    openProjectModal(project = null) {
        if (!this.canEditProjects()) {
            alert('You do not have permission to edit projects.');
            return;
        }

        const modal = document.getElementById('projectModal');
        const title = document.getElementById('projectModalTitle');
        const form = document.getElementById('projectForm');

        if (project) {
            title.textContent = 'Edit Project';
            this.populateProjectForm(project);
        } else {
            title.textContent = 'Add New Project';
            form.reset();
            document.getElementById('projectId').value = '';
        }

        modal.classList.add('show');
    }

    populateProjectForm(project) {
        document.getElementById('projectId').value = project.id;
        document.getElementById('projectTitle').value = project.title || '';
        document.getElementById('projectDate').value = project.date || '';
        document.getElementById('projectDescription').value = project.description || '';
        document.getElementById('projectCategory').value = project.category || '';
        document.getElementById('projectImage').value = project.image || '';
    }

    closeProjectModal() {
        document.getElementById('projectModal').classList.remove('show');
    }

    saveMember(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const memberData = Object.fromEntries(formData.entries());
        const memberId = memberData.id;
        const memberType = memberData.type || this.currentTab;

        // Remove form-specific fields
        delete memberData.id;
        delete memberData.type;

        if (memberId) {
            // Edit existing member
            const members = this.membersData[memberType];
            const index = members.findIndex(m => m.id == memberId);
            if (index !== -1) {
                this.membersData[memberType][index] = { ...members[index], ...memberData };
            }
        } else {
            // Add new member
            const newId = Math.max(...this.membersData[memberType].map(m => m.id), 0) + 1;
            this.membersData[memberType].push({ id: newId, ...memberData });
        }

        this.renderMembers();
        this.closeMemberModal();
        
        // Save data to server
        this.saveDataToServer('members', this.membersData);
    }

    saveProject(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const projectData = Object.fromEntries(formData.entries());
        const projectId = projectData.id;

        // Remove form-specific fields
        delete projectData.id;

        if (projectId) {
            // Edit existing project
            const index = this.projectsData.findIndex(p => p.id == projectId);
            if (index !== -1) {
                this.projectsData[index] = { ...this.projectsData[index], ...projectData };
            }
        } else {
            // Add new project
            const newId = Math.max(...this.projectsData.map(p => p.id), 0) + 1;
            this.projectsData.push({ id: newId, ...projectData });
        }

        this.renderProjects();
        this.closeProjectModal();
        
        // Save data to server
        this.saveDataToServer('projects', this.projectsData);
    }

    editMember(id, type) {
        const member = this.membersData[type].find(m => m.id == id);
        if (member) {
            this.openMemberModal(member, type);
        }
    }

    deleteMember(id, type) {
        if (confirm('Are you sure you want to delete this member?')) {
            this.membersData[type] = this.membersData[type].filter(m => m.id != id);
            this.renderMembers();
            this.saveDataToServer('members', this.membersData);
        }
    }

    editProject(id) {
        const project = this.projectsData.find(p => p.id == id);
        if (project) {
            this.openProjectModal(project);
        }
    }

    deleteProject(id) {
        if (confirm('Are you sure you want to delete this project?')) {
            this.projectsData = this.projectsData.filter(p => p.id != id);
            this.renderProjects();
            this.saveDataToServer('projects', this.projectsData);
        }
    }

    saveDataToServer(dataType, data) {
        // Save to localStorage for persistence across sessions
        localStorage.setItem(`tep_admin_${dataType}`, JSON.stringify(data));
        
        // Show success message with download option
        this.showSuccessMessageWithDownload(
            `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} saved! 💾 Click to download updated file.`,
            dataType,
            data
        );
    }



    downloadJsonFile(dataType, data) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dataType}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showSuccessMessage(message) {
        // Create and show a temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 1rem;
            border-radius: 5px;
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        successDiv.textContent = message;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv);
            }
        }, 3000);
    }

    showSuccessMessageWithDownload(message, dataType, data) {
        // Create and show a clickable success message with download option
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message-download';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 1rem;
            border-radius: 5px;
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            cursor: pointer;
            border: 2px solid #fff;
            max-width: 300px;
        `;
        successDiv.innerHTML = `
            <div>${message}</div>
            <small style="display: block; margin-top: 5px; opacity: 0.9;">
                💾 Click here to download ${dataType}.json
            </small>
        `;
        
        successDiv.addEventListener('click', () => {
            this.downloadJsonFile(dataType, data);
        });
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv);
            }
        }, 8000);
    }

    showErrorMessage(message) {
        // Create and show a temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 1rem;
            border-radius: 5px;
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 5000);
    }

    showInfoMessage(message) {
        // Create and show a temporary info message
        const infoDiv = document.createElement('div');
        infoDiv.className = 'info-message';
        infoDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #17a2b8;
            color: white;
            padding: 1rem;
            border-radius: 5px;
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        infoDiv.textContent = message;
        
        document.body.appendChild(infoDiv);
        
        setTimeout(() => {
            if (document.body.contains(infoDiv)) {
                document.body.removeChild(infoDiv);
            }
        }, 4000);
    }

    downloadAllChanges() {
        // Download both members and projects if they have been modified
        const savedMembers = localStorage.getItem('tep_admin_members');
        const savedProjects = localStorage.getItem('tep_admin_projects');
        
        if (savedMembers) {
            this.downloadJsonFile('members', JSON.parse(savedMembers));
        }
        
        if (savedProjects && this.canEditProjects()) {
            this.downloadJsonFile('projects', JSON.parse(savedProjects));
        }
        
        if (!savedMembers && !savedProjects) {
            this.showInfoMessage('No changes to download');
        } else {
            this.showSuccessMessage('Downloaded all modified files');
        }
    }

    resetToOriginal() {
        if (confirm('Are you sure you want to reset all data to original? This will lose all your changes.')) {
            localStorage.removeItem('tep_admin_members');
            localStorage.removeItem('tep_admin_projects');
            this.loadData();
            this.showSuccessMessage('Data reset to original');
        }
    }


}

// Initialize dashboard when DOM is loaded
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});