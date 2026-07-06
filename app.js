// System Configuration Constants Middleware Link
const API_BASE_URL = "https://8yvggmh0i0.execute-api.eu-west-2.amazonaws.com";

// Global Identity Memory Cache Objects
let currentUser = { staff_email: "", staff_name: "", role: "", leave_balance: 21, dob: "" };
let pollIntervalTracker = null;

// MOBILE SIDEBAR HAMBURGER CONTROLLER TOGGLES
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebarNav');
    const overlay = document.getElementById('sidebarOverlay');
    const icon = document.getElementById('hamburgerIcon');
    
    if (sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        icon.className = "fa-solid fa-xmark"; 
    } else {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
        icon.className = "fa-solid fa-bars";
    }
}

// Router intercept click hook to clean up mobile sidebars automatically upon section shifts
function handleNavClick(targetTabId) {
    navigateToTab(targetTabId);
    if (window.innerWidth < 768) {
        toggleMobileSidebar(); 
    }
}

function switchAuthTab(targetTab) {
    const sInForm = document.getElementById('signInForm'); const sUpForm = document.getElementById('signUpForm');
    const tInBtn = document.getElementById('tabSignIn'); const tUpBtn = document.getElementById('tabSignUp');
    if (targetTab === 'signup') {
        sInForm.classList.add('hidden'); sUpForm.classList.remove('hidden');
        tUpBtn.className = "text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400 pb-1 text-sm";
        tInBtn.className = "text-slate-400 dark:text-slate-500 font-semibold pb-1 text-sm";
    } else {
        sUpForm.classList.add('hidden'); sInForm.classList.remove('hidden');
        tInBtn.className = "text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400 pb-1 text-sm";
        tUpBtn.className = "text-slate-400 dark:text-slate-500 font-semibold pb-1 text-sm";
    }
}

function navigateToTab(targetTabId) {
    document.querySelectorAll('.tab-view').forEach(view => view.classList.add('hidden'));
    document.getElementById(`view-${targetTabId}`).classList.remove('hidden');
    document.querySelectorAll('aside nav button').forEach(btn => {
        btn.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all";
    });
    const activeBtn = document.getElementById(`nav-${targetTabId}`);
    if (activeBtn) activeBtn.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/50";
    document.getElementById('userMenuDropdown').classList.add('hidden');
    document.getElementById('notifDropdown').classList.add('hidden');
    
    if (targetTabId === 'settings') initializeProfileFormFields();
}

function toggleUserDropdownMenu() { document.getElementById('userMenuDropdown').classList.toggle('hidden'); }
function toggleAlertMenu() { 
    document.getElementById('notifDropdown').classList.toggle('hidden'); 
    document.getElementById('notifBadge').classList.add('hidden');
}

function togglePasswordVisibility(fieldId) {
    const node = document.getElementById(fieldId);
    node.type = node.type === 'password' ? 'text' : 'password';
}

// REAL-TIME NOTIFICATIONS SYNC ENGINE
async function executeNotificationsSync() {
    if (!currentUser.staff_email) return;
    try {
        const res = await fetch(`${API_BASE_URL}/profile-services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'fetch_notifs', staff_email: currentUser.staff_email, role: currentUser.role })
        });
        const data = await res.json();
        const container = document.getElementById('notifItemsContainer');
        
        if (data.notifications && data.notifications.length > 0) {
            document.getElementById('notifBadge').classList.remove('hidden');
            container.innerHTML = data.notifications.map(n => `
                <div class="py-2.5 border-b last:border-0 dark:border-slate-700">
                    <p class="text-slate-700 dark:text-slate-200 font-medium leading-tight">${n.message}</p>
                    <span class="text-[9px] text-slate-400 block mt-0.5">${new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
            `).join('');
        } else {
            container.innerHTML = `<p class="text-slate-400 py-2 text-center">No new notifications tracked.</p>`;
            document.getElementById('notifBadge').classList.add('hidden');
        }
    } catch (err) { console.log("Failed to sync notifications."); }
}

async function executeNotificationsClear() {
    try {
        await fetch(`${API_BASE_URL}/profile-services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'clear_notifs', staff_email: currentUser.staff_email, role: currentUser.role })
        });
        executeNotificationsSync();
    } catch (err) { alert("Error clearing notification records."); }
}

// AUTOMATED REGISTRATION VALIDATION ENGINE FOR ONBOARDING
function validateOnboardingForm() {
    const name = document.getElementById('auth_reg_name').value.trim();
    const email = document.getElementById('auth_reg_email').value.trim();
    const pass = document.getElementById('auth_reg_pass').value.trim();
    const dob = document.getElementById('auth_reg_dob').value;
    const submitBtn = document.getElementById('btnCompleteOnboarding');
    
    let isNameValid = false, isEmailValid = false, isPassValid = false, isDobValid = false;
    
    const errName = document.getElementById('err_reg_name');
    if (name.length > 0) {
        const words = name.split(/\s+/).filter(w => w.length > 0);
        const hasSymbols = /[0-9!@#$%^&*(),.?":{}|<>_]/.test(name);
        if (words.length < 2 || hasSymbols) {
            errName.innerText = "Must contain at least First and Last name. No numbers or symbols allowed.";
            errName.classList.remove('hidden');
        } else {
            errName.classList.add('hidden');
            isNameValid = true;
        }
    } else { errName.classList.add('hidden'); }

    const errEmail = document.getElementById('err_reg_email');
    if (email.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errEmail.innerText = "Invalid email structure (missing '@' or structural domain).";
            errEmail.classList.remove('hidden');
        } else {
            errEmail.classList.add('hidden');
            isEmailValid = true;
        }
    } else { errEmail.classList.add('hidden'); }

    const errPass = document.getElementById('err_reg_pass');
    if (pass.length > 0) {
        const hasUpper = /[A-Z]/.test(pass);
        const hasLower = /[a-z]/.test(pass);
        const hasNum = /[0-9]/.test(pass);
        const hasSpec = /[!@#$%^&*(),.?":{}|<>_]/.test(pass);
        if (pass.length < 8 || !hasUpper || !hasLower || !hasNum || !hasSpec) {
            errPass.innerText = "Requires min 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.";
            errPass.classList.remove('hidden');
        } else {
            errPass.classList.add('hidden');
            isPassValid = true;
        }
    } else { errPass.classList.add('hidden'); }

    const errDob = document.getElementById('err_reg_dob');
    if (dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 18) {
            errDob.innerText = "Registration rejected. Applicant must be 18 years or older.";
            errDob.classList.remove('hidden');
        } else {
            errDob.classList.add('hidden');
            isDobValid = true;
        }
    } else { errDob.classList.add('hidden'); }

    submitBtn.disabled = !(isNameValid && isEmailValid && isPassValid && isDobValid);
}

document.getElementById('auth_reg_name').addEventListener('input', validateOnboardingForm);
document.getElementById('auth_reg_email').addEventListener('input', validateOnboardingForm);
document.getElementById('auth_reg_pass').addEventListener('input', validateOnboardingForm);
document.getElementById('auth_reg_dob').addEventListener('input', validateOnboardingForm);

// ONBOARD PROFILE REGISTRATION SUBMITTER
document.getElementById('signUpForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('btnCompleteOnboarding');
    
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Creating Account...`;
    submitBtn.disabled = true;
    
    const payload = {
        staff_name: document.getElementById('auth_reg_name').value.trim(),
        staff_email: document.getElementById('auth_reg_email').value.trim(),
        password: document.getElementById('auth_reg_pass').value.trim(),
        dob: document.getElementById('auth_reg_dob').value,
        role: document.querySelector('input[name="auth_reg_role"]:checked').value
    };
    try {
        const res = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        alert("Registration complete!");
        document.getElementById('signUpForm').reset();
        switchAuthTab('signin');
    } catch (err) { 
        alert(`Registration Error: ${err.message}`); 
    } finally {
        submitBtn.innerText = "Complete Onboarding";
        submitBtn.disabled = false;
    }
});

// INITIALIZE PORTAL DATA VIEWS
function initializeApplicationPortal(userRecord) {
    currentUser = userRecord;

    document.getElementById('userDisplayName').innerText = currentUser.staff_name;
    document.getElementById('userRoleBadge').innerText = currentUser.role;
    document.getElementById('displayLeaveBalance').innerText = currentUser.leave_balance;
    document.getElementById('navBarName').innerText = currentUser.staff_name;
    
    const initials = currentUser.staff_name.substring(0,2).toUpperCase();
    document.getElementById('avatarDisplayBadge').innerText = initials;
    document.getElementById('homeProfileAvatar').innerText = initials;

    if (currentUser.role === 'Leadership') {
        document.getElementById('leadershipAdminSection').classList.remove('hidden');
    } else {
        document.getElementById('leadershipAdminSection').classList.add('hidden');
    }

    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('portalDashboard').classList.remove('hidden');
    navigateToTab('home');

    executeNotificationsSync();
    pollIntervalTracker = setInterval(executeNotificationsSync, 8000);
}

// ACCOUNT ACCESS SIGN IN CONTROL
document.getElementById('signInForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        staff_email: document.getElementById('auth_login_email').value,
        password: document.getElementById('auth_login_pass').value
    };
    try {
        const res = await fetch(`${API_BASE_URL}/signin`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        localStorage.setItem('cc_user_session', JSON.stringify(data.user));
        initializeApplicationPortal(data.user);
    } catch (err) { alert(`Authentication Failed: ${err.message}`); }
});

// PERSISTENT RELOAD HOOK RECOVERY MATRIX
window.addEventListener('DOMContentLoaded', () => {
    const cachedSession = localStorage.getItem('cc_user_session');
    if (cachedSession) {
        initializeApplicationPortal(JSON.parse(cachedSession));
    }
});

function executeSessionLogout() {
    clearInterval(pollIntervalTracker);
    localStorage.removeItem('cc_user_session');
    currentUser = { staff_email: "", staff_name: "", role: "", leave_balance: 21, dob: "" };
    document.getElementById('signInForm').reset();
    document.getElementById('portalDashboard').classList.add('hidden');
    document.getElementById('authContainer').classList.remove('hidden');
    switchAuthTab('signin');
}

// PROFILE RE-INITIALIZATION FORM VALUES
function initializeProfileFormFields() {
    document.getElementById('edit_display_name').value = currentUser.staff_name;
    document.getElementById('edit_display_email').innerText = currentUser.staff_email;
    document.getElementById('edit_display_role').innerText = currentUser.role;
    document.getElementById('edit_display_dob').innerText = currentUser.dob;
    
    document.getElementById('edit_pass').value = "";
    document.getElementById('edit_pass_confirm').value = "";
    document.getElementById('confirmPassGroup').classList.add('hidden');
    document.getElementById('btnSaveChanges').disabled = true;
}

// DIRT-STATE CHECKER HOOK
function executeDirtyStateCheck() {
    const nameInput = document.getElementById('edit_display_name').value.trim();
    const passInput = document.getElementById('edit_pass').value.trim();
    const saveBtn = document.getElementById('btnSaveChanges');
    
    let nameChanged = (nameInput !== currentUser.staff_name && nameInput.length > 0);
    let passwordChanged = (passInput.length > 0);
    
    if (passwordChanged) {
        document.getElementById('confirmPassGroup').classList.remove('hidden');
    } else {
        document.getElementById('confirmPassGroup').classList.add('hidden');
        document.getElementById('edit_pass_confirm').value = "";
    }
    
    if (nameChanged || passwordChanged) {
        saveBtn.disabled = false;
    } else {
        saveBtn.disabled = true;
    }
}

document.getElementById('edit_display_name').addEventListener('input', executeDirtyStateCheck);
document.getElementById('edit_pass').addEventListener('input', executeDirtyStateCheck);
document.getElementById('edit_pass_confirm').addEventListener('input', executeDirtyStateCheck);

// PROCESS PROFILE EDITS SUBMISSIONS
document.getElementById('profileEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('edit_display_name').value.trim();
    const passInput = document.getElementById('edit_pass').value.trim();
    const confirmInput = document.getElementById('edit_pass_confirm').value.trim();
    
    if (/[0-9!@#$%^&*(),.?":{}|<>_]/.test(nameInput)) {
        alert("Validation Refused: Name strings must reject numbers or special characters.");
        return;
    }
    
    const payload = { action: 'update_profile', staff_email: currentUser.staff_email, staff_name: nameInput };
    
    if (passInput.length > 0) {
        if (passInput.length < 8 || !/[A-Z]/.test(passInput) || !/[0-9]/.test(passInput)) {
            alert("Security Policy Refused: Passwords must be at least 8 characters long, containing 1 uppercase letter and 1 number.");
            return;
        }
        if (passInput !== confirmInput) {
            alert("Validation Error: Passcode matching verification values do not match.");
            return;
        }
        payload.password = passInput;
    }
    
    try {
        const res = await fetch(`${API_BASE_URL}/profile-services`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        const banner = document.getElementById('successBanner');
        banner.classList.remove('translate-y-[-100px]', 'opacity-0');
        
        currentUser.staff_name = data.staff_name;
        localStorage.setItem('cc_user_session', JSON.stringify(currentUser));
        
        document.getElementById('userDisplayName').innerText = currentUser.staff_name;
        document.getElementById('navBarName').innerText = currentUser.staff_name;
        
        const initials = currentUser.staff_name.substring(0,2).toUpperCase();
        document.getElementById('avatarDisplayBadge').innerText = initials;
        document.getElementById('homeProfileAvatar').innerText = initials;
        
        setTimeout(() => {
            banner.classList.add('translate-y-[-100px]', 'opacity-0');
            navigateToTab('home');
        }, 2500);
    } catch (err) { alert(`Update Error: ${err.message}`); }
});

// CORE TRANSACTIONS DISPATCHERS
document.getElementById('transportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await fetch(`${API_BASE_URL}/log-transport`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ staff_name: currentUser.staff_name, staff_email: currentUser.staff_email, log_date: document.getElementById('t_date').value, amount: document.getElementById('t_amount').value })
        });
        alert("Entry submitted successfully!"); document.getElementById('transportForm').reset(); navigateToTab('home');
    } catch (err) { alert("API Connection error."); }
});

document.getElementById('loanForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await fetch(`${API_BASE_URL}/request-loan`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ staff_name: currentUser.staff_name, staff_email: currentUser.staff_email, request_type: document.getElementById('l_type').value, amount: document.getElementById('l_amount').value })
        });
        alert("Loan requested successfully."); document.getElementById('loanForm').reset(); navigateToTab('home');
    } catch (err) { alert("API Connection error."); }
});

document.getElementById('leaveForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_BASE_URL}/request-leave`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ staff_name: currentUser.staff_name, staff_email: currentUser.staff_email, leave_type: document.getElementById('leave_type').value, start_date: document.getElementById('leave_start').value, end_date: document.getElementById('leave_end').value, requested_days: document.getElementById('leave_days').value })
        });
        const data = await res.json(); if (!res.ok) throw new Error(data.error);
        alert("Leave request dispatched for verification."); document.getElementById('leaveForm').reset(); navigateToTab('home');
    } catch (err) { alert(`Error: ${err.message}`); }
});

document.getElementById('appraisalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await fetch(`${API_BASE_URL}/submit-appraisal`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ staff_name: currentUser.staff_name, staff_email: currentUser.staff_email, job_title: document.getElementById('app_title').value, achievements: document.getElementById('app_wins').value, goals: document.getElementById('app_goals').value })
        });
        alert("Appraisal evaluations cataloged."); document.getElementById('appraisalForm').reset(); navigateToTab('home');
    } catch (err) { alert("API Connection error."); }
});

document.getElementById('adminReviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_BASE_URL}/review-loan`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_id: document.getElementById('adm_id').value, status: document.getElementById('adm_status').value, approved_amount: document.getElementById('adm_amount').value || 0 })
        });
        const data = await res.json(); if (!res.ok) throw new Error(data.error);
        alert("Loan action processed successfully."); document.getElementById('adminReviewForm').reset(); navigateToTab('home');
    } catch (err) { alert(`Review error: ${err.message}`); }
});

document.getElementById('adminLeaveReviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_BASE_URL}/review-leave`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leave_id: document.getElementById('adm_leave_id').value, status: document.getElementById('adm_leave_status').value })
        });
        const data = await res.json(); if (!res.ok) throw new Error(data.error);
        alert("Leave action processed successfully."); document.getElementById('adminLeaveReviewForm').reset(); navigateToTab('home');
    } catch (err) { alert(`Review error: ${err.message}`); }
});

// THEME TOGGLES
function executeThemeModification(selectedThemeValue) {
    const htmlNode = document.documentElement;
    if (selectedThemeValue === 'dark') { htmlNode.classList.add('dark'); localStorage.setItem('portalTheme', 'dark'); }
    else if (selectedThemeValue === 'light') { htmlNode.classList.remove('dark'); localStorage.setItem('portalTheme', 'light'); }
    else { localStorage.setItem('portalTheme', 'system'); evaluateSystemThemePreference(); }
}
function evaluateSystemThemePreference() {
    const htmlNode = document.documentElement; const cacheValue = localStorage.getItem('portalTheme') || 'system';
    if (document.getElementById('themeSelector')) document.getElementById('themeSelector').value = cacheValue;
    if (cacheValue === 'dark' || (cacheValue === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) { htmlNode.classList.add('dark'); }
    else { htmlNode.classList.remove('dark'); }
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (localStorage.getItem('portalTheme') === 'system') evaluateSystemThemePreference(); });
evaluateSystemThemePreference();
