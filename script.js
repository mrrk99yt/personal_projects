document.addEventListener("DOMContentLoaded", function () {
    
    // ==========================================
    // 1. GLOBAL CONFIGURATION & UI LOGIC
    // ==========================================
    const API = "http://localhost:5000";

    // Navbar Sticky Effect
    const navbar = document.getElementById("mainNav");
    if(navbar) {
        window.addEventListener("scroll", function () {
            if (window.scrollY > 20) {
                navbar.classList.add("shadow-md");
                navbar.style.padding = "10px 0";
            } else {
                navbar.classList.remove("shadow-md");
                navbar.style.padding = "20px 0";
            }
        });
    }

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === "#" || targetId.includes(".html")) return;
            
            const target = document.querySelector(targetId);
            if(target){
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });

                // Close mobile menu if open
                const navToggler = document.querySelector('.navbar-toggler');
                const navCollapse = document.querySelector('.navbar-collapse');
                if (navCollapse && navCollapse.classList.contains('show')) {
                    navToggler.click();
                }
            }
        });
    });

    // ==========================================
    // 2. AUTHENTICATION STATE & NAVBAR PHOTO
    // ==========================================
    
    // Page load hote hi check karo login status
    checkLoginState();

    function checkLoginState() {
        const savedUser = localStorage.getItem("username");
        const savedEmail = localStorage.getItem("userEmail");

        const authLinks = document.getElementById('authLinks');
        const userProfile = document.getElementById('userProfile');
        const nameDisplay = document.getElementById('dropdownUserName');
        
        if (savedUser) {
            // User Logged In Hai
            if(authLinks) authLinks.classList.add('d-none');
            if(userProfile) userProfile.classList.remove('d-none');
            
            // Naam Set Karo
            if(nameDisplay) nameDisplay.innerText = savedUser;

            // ✅ Photo Fetch Karo (Navbar ke liye)
            if(savedEmail) {
                fetchUserProfileImage(savedEmail);
            }

        } else {
            // User Logged Out Hai
            if(authLinks) authLinks.classList.remove('d-none');
            if(userProfile) userProfile.classList.add('d-none');
        }
    }

    // Helper: Server se Photo laane ka function
    async function fetchUserProfileImage(email) {
        try {
            const res = await fetch(API + '/user-details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });
            const data = await res.json();

            if (data.status === 'ok' && data.user.profilePicUrl) {
                const photoUrl = data.user.profilePicUrl;

                // 1. Navbar Icon (Small) Update
                const navImg = document.getElementById('navUserImage');
                const navIcon = document.getElementById('navUserIcon'); // Blue Icon
                if(navImg && navIcon) {
                    navImg.src = photoUrl;
                    navImg.classList.remove('d-none'); // Image dikhao
                    navIcon.classList.add('d-none');   // Default Icon chupao
                }

                // 2. Dropdown Icon (Large) Update
                const dropImg = document.getElementById('dropdownUserImage');
                const dropIcon = document.getElementById('dropdownUserIcon');
                if(dropImg && dropIcon) {
                    dropImg.src = photoUrl;
                    dropImg.classList.remove('d-none');
                    dropIcon.classList.add('d-none');
                }
            }
        } catch (err) {
            console.log("Profile image loading failed", err);
        }
    }

    // ==========================================
    // 3. HOME PAGE LOGIC (Login/Register/Contact)
    // ==========================================

    // --- A. LOGIN LOGIC ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const res = await fetch(API + '/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const result = await res.json();

                if (result.status === 'ok') {
                    alert("Welcome " + result.user);
                    
                    // Save User Data
                    localStorage.setItem("username", result.user);
                    localStorage.setItem("userEmail", email);

                    // Modal Band Karo
                    const modalEl = document.getElementById('authModal');
                    if(modalEl) {
                        const modal = bootstrap.Modal.getInstance(modalEl);
                        modal.hide();
                    }

                    // UI Update Karo (Refresh se clear data bhi load ho jayega)
                    location.reload(); 
                } else {
                    alert(result.message);
                }
            } catch (err) {
                console.error(err);
                alert("Server connection failed. Is Node running?");
            }
        });
    }

    // --- B. REGISTER LOGIC ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                ownerName: document.getElementById('regName').value,
                shopName: document.getElementById('regShop').value,
                email: document.getElementById('regEmail').value,
                license: document.getElementById('regLicense').value,
                password: document.getElementById('regPassword').value
            };

            try {
                const res = await fetch(API + '/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                alert(result.message);

                if (result.status === 'ok') {
                    // Switch to Login View
                    document.getElementById('registerContainer').classList.add('d-none');
                    document.getElementById('loginContainer').classList.remove('d-none');
                }
            } catch (err) {
                alert("Registration Failed.");
            }
        });
    }

    // --- C. SWITCH LOGIN/REGISTER VIEWS ---
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');

    if(showRegisterBtn && showLoginBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginContainer').classList.add('d-none');
            document.getElementById('registerContainer').classList.remove('d-none');
        });

        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('registerContainer').classList.add('d-none');
            document.getElementById('loginContainer').classList.remove('d-none');
        });
    }

    // --- D. CONTACT FORM ---
    const inquiryForm = document.getElementById('inquiryForm');
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                shopName: document.getElementById('shop').value,
                message: document.getElementById('message').value
            };

            try {
                const res = await fetch(API + '/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                alert(result.message);
                e.target.reset();
            } catch (err) {
                alert("Message failed to send.");
            }
        });
    }


    // ==========================================
    // 4. PROFILE PAGE LOGIC (Edit/Update/Photo)
    // ==========================================
    
    const profileForm = document.getElementById('profileForm');
    
    if (profileForm) {
        const userEmail = localStorage.getItem("userEmail");
        
        // 1. Load Data
        if (!userEmail) {
            alert("Please login first!");
            window.location.href = "index.html";
        } else {
            loadProfileData(userEmail);
        }

        // 2. Photo Preview (File Select karte hi dikhega)
        const fileInput = document.getElementById('fileInput');
        if(fileInput) {
            fileInput.addEventListener('change', function(e) {
                if(e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const imgDisplay = document.getElementById('profileImageDisplay');
                        const defaultIcon = document.getElementById('defaultProfileIcon');
                        
                        imgDisplay.src = e.target.result;
                        imgDisplay.classList.remove('d-none');
                        defaultIcon.classList.add('d-none');
                    }
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
        }

        // 3. Password Toggle (Eye Icon)
        const togglePassBtn = document.getElementById('togglePassword');
        const passInput = document.getElementById('pPassword');
        const eyeIcon = document.getElementById('eyeIcon');

        if(togglePassBtn) {
            togglePassBtn.addEventListener('click', function () {
                const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passInput.setAttribute('type', type);
                eyeIcon.classList.toggle('fa-eye');
                eyeIcon.classList.toggle('fa-eye-slash');
            });
        }

        // 4. Update Form Submit (FormData use karega)
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData();
            formData.append('email', document.getElementById('pEmail').value);
            formData.append('ownerName', document.getElementById('pOwner').value);
            formData.append('shopName', document.getElementById('pShop').value);
            formData.append('license', document.getElementById('pLicense').value);
            formData.append('password', document.getElementById('pPassword').value);

            if(fileInput && fileInput.files.length > 0) {
                formData.append('photo', fileInput.files[0]);
            }

            try {
                const res = await fetch(API + '/update-user', {
                    method: 'POST',
                    body: formData 
                });

                const result = await res.json();
                alert(result.message);

                if (result.status === 'ok') {
                    localStorage.setItem("username", document.getElementById('pOwner').value);
                    location.reload();
                }
            } catch (err) {
                alert("Update failed.");
            }
        });
    }

    // Helper: Fetch Data for Profile Page
    async function loadProfileData(email) {
        try {
            const res = await fetch(API + '/user-details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });
            const data = await res.json();

            if (data.status === 'ok') {
                const u = data.user;
                
                // Text Inputs
                document.getElementById('displayOwnerName').innerText = u.ownerName;
                document.getElementById('displayShopName').innerText = u.shopName;
                document.getElementById('pOwner').value = u.ownerName;
                document.getElementById('pShop').value = u.shopName;
                document.getElementById('pEmail').value = u.email;
                document.getElementById('pLicense').value = u.license || "";
                document.getElementById('pPassword').value = u.password;

                // Profile Image on Card
                const imgDisplay = document.getElementById('profileImageDisplay');
                const defaultIcon = document.getElementById('defaultProfileIcon');
                
                if (u.profilePicUrl) {
                    imgDisplay.src = u.profilePicUrl;
                    imgDisplay.classList.remove('d-none');
                    defaultIcon.classList.add('d-none');
                } else {
                    imgDisplay.classList.add('d-none');
                    defaultIcon.classList.remove('d-none');
                }
            }
        } catch (err) {
            console.error("Profile load error:", err);
        }
    }

    // ==========================================
    // 5. GLOBAL LOGOUT
    // ==========================================
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if(confirm("Are you sure you want to logout?")) {
                localStorage.clear(); // Saara data saaf
                window.location.href = "index.html"; 
            }
        });
    }
});

// Helper Function: Edit Mode Enable karne ke liye
function enableEdit() {
    document.querySelectorAll('#profileForm input').forEach(input => {
        if(input.id !== 'pEmail') { 
            input.disabled = false;
            input.classList.add('border-primary');
        }
    });
    
    document.getElementById('saveBtnContainer').classList.remove('d-none');
    document.getElementById('editBtn').classList.add('d-none');
    
    // Camera Icon show karo
    const camIcon = document.getElementById('cameraIcon');
    if(camIcon) camIcon.classList.remove('d-none');
    
    // Password Toggle Enable karo
    const passBtn = document.getElementById('togglePassword');
    if(passBtn) passBtn.disabled = false;
}