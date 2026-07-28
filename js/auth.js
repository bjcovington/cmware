document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const avatarInput = document.getElementById('avatar-input');
    const avatarPreview = document.getElementById('avatar-preview');

    const DEFAULT_AVATAR_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#e0e0e0"/>
        <circle cx="50" cy="38" r="16" fill="#bdbdbd"/>
        <ellipse cx="50" cy="75" rx="26" ry="20" fill="#bdbdbd"/>
    </svg>`;

    // Check if already logged in
    const currentUser = localStorage.getItem('cmware_current_user');
    if (currentUser) {
        window.location.href = 'pages/dashboard.html';
        return;
    }

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.dataset.tab;
            loginForm.classList.toggle('active', target === 'login');
            signupForm.classList.toggle('active', target === 'signup');

            clearErrors();
        });
    });

    // Avatar upload preview
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                avatarPreview.innerHTML = `<img src="${event.target.result}" alt="Avatar">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Format phone number as user types
    const phoneInput = document.getElementById('signup-phone');
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) value = value.slice(0, 10);
        if (value.length >= 7) {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
        } else if (value.length >= 4) {
            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        } else if (value.length >= 1) {
            value = `(${value}`;
        }
        e.target.value = value;
    });

    // Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            showError('login-error', 'Please fill in all fields.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('cmware_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            showError('login-error', 'Invalid email or password.');
            return;
        }

        localStorage.setItem('cmware_current_user', JSON.stringify({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            company: user.company,
            avatar: user.avatar
        }));

        window.location.href = 'pages/dashboard.html';
    });

    // Signup
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        const firstName = document.getElementById('signup-firstname').value.trim();
        const lastName = document.getElementById('signup-lastname').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const phone = document.getElementById('signup-phone').value.trim();
        const company = document.getElementById('signup-company').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;

        if (!firstName || !lastName || !email || !phone || !password || !confirm) {
            showError('signup-error', 'Please fill in all fields.');
            return;
        }

        if (!isValidEmail(email)) {
            showError('signup-error', 'Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            showError('signup-error', 'Password must be at least 6 characters.');
            return;
        }

        if (password !== confirm) {
            showError('signup-error', 'Passwords do not match.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('cmware_users') || '[]');

        if (users.find(u => u.email === email)) {
            showError('signup-error', 'An account with this email already exists.');
            return;
        }

        const avatarImg = avatarPreview.querySelector('img');
        const avatar = avatarImg ? avatarImg.src : null;

        const newUser = {
            id: Date.now().toString(),
            firstName,
            lastName,
            email,
            phone,
            company,
            password,
            avatar,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('cmware_users', JSON.stringify(users));

        localStorage.setItem('cmware_current_user', JSON.stringify({
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            phone: newUser.phone,
            company: newUser.company,
            avatar: newUser.avatar
        }));

        window.location.href = 'pages/dashboard.html';
    });

    function showError(elementId, message) {
        document.getElementById(elementId).textContent = message;
    }

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
});
