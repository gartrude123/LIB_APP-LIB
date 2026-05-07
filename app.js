// Bugema University Library Portal - Books & Resources Page
// Complete interactive frontend with authentication and resource management

document.addEventListener("DOMContentLoaded", async () => {
    // ============================================
    // PAGE BACKGROUND MANAGEMENT
    // ============================================
    const path = window.location.pathname;
    let bgImage = "";

    if (path.includes('books.html') || path.includes('collections.html') || path.includes('book.html') || path.includes('collection.html') || path.includes('rare-books.html') || path.includes('archives.html') || path.includes('publications.html')) {
        bgImage = "url('LIBpic2.jpg')";
        if (path.includes('collections.html') || path.includes('collection.html') || path.includes('rare-books.html') || path.includes('archives.html') || path.includes('publications.html')) document.body.classList.add('white-text-theme');
    } else if (path.includes('services.html') || path.includes('service.html')) {
        bgImage = "url('LIBpic3.jpg')";
    } else if (path.includes('about.html') || path.includes('contact.html') || path.includes('board.html') || path.includes('history.html') || path.includes('policies.html')) {
        bgImage = "url('back1.jpg')";
        document.body.classList.add('white-text-theme');
    }

    if (bgImage) {
        document.body.style.backgroundImage = bgImage;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundAttachment = "fixed";
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundPosition = "center";
    }

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    let currentUser = JSON.parse(localStorage.getItem('libraryUser')) || null;
    let allEbooks = [];
    let allCategories = [];
    let allJournals = [];
    let allDatabases = [];
    let allDictionaries = [];
    let allEncyclopedias = [];
    let allGuides = [];

    // ============================================
    // FETCH ALL DATA ON LOAD
    // ============================================
    async function fetchAllData() {
        try {
            const [categoriesRes, ebooksRes, journalsRes, databasesRes, dictRes, encRes, guidesRes] = await Promise.all([
                fetch('/api/ebook-categories'),
                fetch('/api/ebooks'),
                fetch('/api/journals'),
                fetch('/api/databases'),
                fetch('/api/reference-materials?type=dictionary'),
                fetch('/api/reference-materials?type=encyclopedia'),
                fetch('/api/research-guides')
            ]);

            allCategories = await categoriesRes.json();
            allEbooks = await ebooksRes.json();
            allJournals = await journalsRes.json();
            allDatabases = await databasesRes.json();
            allDictionaries = await dictRes.json();
            allEncyclopedias = await encRes.json();
            allGuides = await guidesRes.json();

            renderCategories(allCategories);
            renderEbooksGrid(allEbooks);
            renderJournals(allJournals);
            renderDatabases(allDatabases);
            renderDictionaries(allDictionaries);
            renderEncyclopedias(allEncyclopedias);
            renderGuides(allGuides);
        } catch (err) {
            console.error('API Error: Connection to backend failed. Falling back to mock data.', err);
            loadMockData();
        }
    }

    function loadMockData() {
        allCategories = [
            { id: 1, name: 'Computer Science', icon: 'fa-laptop-code' },
            { id: 2, name: 'Business & Economics', icon: 'fa-chart-line' },
            { id: 3, name: 'Mathematics', icon: 'fa-calculator' },
            { id: 4, name: 'Science', icon: 'fa-flask' },
            { id: 5, name: 'Engineering', icon: 'fa-cogs' },
            { id: 6, name: 'Social Sciences', icon: 'fa-users' },
            { id: 7, name: 'Humanities', icon: 'fa-book-open' },
            { id: 8, name: 'Health Sciences', icon: 'fa-heartbeat' },
            { id: 9, name: 'Religious Studies', icon: 'fa-pray' },
            { id: 10, name: 'Politics & Governance', icon: 'fa-landmark' },
            { id: 11, name: 'History', icon: 'fa-landmark' },
            { id: 12, name: 'Literature', icon: 'fa-feather-alt' }
        ];
        allEbooks = [
            { id: 1, title: 'Python for Everybody', author: 'Charles Severance', category: 'Computer Science', publication_date: '2024-01-15', cover_image: '', access_url: 'https://prestigebookshop.com/wp-content/uploads/2019/02/book-image-17871-642x1024.jpg' },
            { id: 2, title: 'Open Data Structures', author: 'Pat Morin', category: 'Computer Science', publication_date: '2023-06-20', cover_image: '', access_url: 'https://opendatastructures.org/ods-python.pdf' },
            { id: 3, title: 'Deep Learning', author: 'Ian Goodfellow', category: 'Computer Science', publication_date: '2024-03-10', cover_image: '', access_url: 'https://www.deeplearningbook.org/contents/intro.pdf' },
            { id: 11, title: 'Information Technology', author: 'Ahmed S. Khan', category: 'Computer Science', publication_date: '2023-10-12', cover_image: '', access_url: 'https://cdn.shopify.com/s/files/1/0026/0787/4084/products/information-technology-9789699157059-01_2048x2048.jpg?v=1529746141' }
        ];
        allJournals = [ // This was incorrectly nested inside allEbooks
            { id: 1, title: 'Journal of Computer Science Research', publisher: 'Academic Press', publication_date: '2024-01' },
            { id: 2, title: 'Business Review Quarterly', publisher: 'Business Publications', publication_date: '2024-02' }
        ];
        allDatabases = [
            { id: 1, title: 'ScienceDirect', provider: 'Elsevier' },
            { id: 2, title: 'JSTOR', provider: 'ITHAKA' }
        ];
        allDictionaries = [{ id: 1, title: 'Oxford English Dictionary', author: 'Oxford University Press' }];
        allEncyclopedias = [{ id: 1, title: 'Encyclopedia Britannica', author: 'Britannica Inc.' }];
        allGuides = [{ id: 1, title: 'Research Guide: How to Write Academic Papers', author: 'Library Staff' }];

        renderCategories(allCategories);
        renderEbooksGrid(allEbooks);
        renderJournals(allJournals);
        renderDatabases(allDatabases);
        renderDictionaries(allDictionaries);
        renderEncyclopedias(allEncyclopedias);
        renderGuides(allGuides);
    }

    // Handle URL hash for deep linking (e.g., from index.html links or footer)
    const handleHash = () => {
        if (window.location.hash) {
            const sectionId = window.location.hash.split('?')[0].substring(1);
            setTimeout(() => showSection(sectionId), 300);
        }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);

    // ============================================
    // AUTHENTICATION & SERVICE ACCESS CONTROL
    // ============================================
    // ============================================
    // MODAL MANAGEMENT
    // ============================================
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const ebookReaderModal = document.getElementById('ebookReaderModal');
    const successModal = document.getElementById('successModal');
    const notificationModal = document.getElementById('notificationModal');

    function openModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Utility to show button loading state
    function setBtnLoading(btn, isLoading, text = 'Processing...') {
        if (!btn) return;
        if (isLoading) {
            btn.dataset.originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `<i class="fa fa-spinner fa-spin"></i> ${text}`;
        } else {
            btn.disabled = false;
            btn.innerHTML = btn.dataset.originalText;
        }
    }

    function showSuccess(message) {
        document.getElementById('successMessage').textContent = message;
        openModal(successModal);
    }

    function showNotification(message) {
        document.getElementById('notificationMessage').textContent = message;
        openModal(notificationModal);
    }

    // Switch between modals
    document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        openModal(registerModal);
    });

    document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(registerModal);
        openModal(loginModal);
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(loginModal);
            closeModal(registerModal);
            closeModal(ebookReaderModal);
            closeModal(successModal);
            closeModal(notificationModal);
        });
    });

    document.getElementById('closeSuccessBtn')?.addEventListener('click', () => closeModal(successModal));
    document.getElementById('closeNotificationBtn')?.addEventListener('click', () => closeModal(notificationModal));

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) closeModal(loginModal); // Only close login modal if clicked outside
        if (e.target === registerModal) closeModal(registerModal); // Only close register modal if clicked outside
        if (e.target === ebookReaderModal) closeModal(ebookReaderModal); // Only close ebook reader modal if clicked outside
        if (e.target === successModal) closeModal(successModal); // Only close success modal if clicked outside
        if (e.target === notificationModal) closeModal(notificationModal); // Only close notification modal if clicked outside
    });

    // ============================================
    // AUTHENTICATION
    // ============================================
    function updateAuthUI() {
        const container = document.getElementById('auth-header-container');
        if (!container) return;

        if (currentUser) {
            container.innerHTML = `
                <div class="user-profile">
                    <span class="user-name"><i class="fa fa-user-circle"></i> ${currentUser.fullName.split(' ')[0]}</span>
                    <button class="btn btn-sm" id="logoutBtn"><i class="fa fa-sign-out-alt"></i> Logout</button>
                </div>
            `;
            document.getElementById('logoutBtn')?.addEventListener('click', () => {
                currentUser = null;
                localStorage.removeItem('libraryUser');
                updateAuthUI();
                showNotification('You have been logged out.');
            });
        } else {
            container.innerHTML = `
                <button class="btn login-btn" id="headerLoginBtn"><i class="fa fa-user"></i> Login</button>
            `;
            document.getElementById('headerLoginBtn')?.addEventListener('click', () => {
                openModal(loginModal);
            });
        }
    }

    // Initialize Auth UI
    updateAuthUI();

    // Function to check authentication and proceed or prompt login
    function ensureAuthenticatedAndProceed(serviceTarget) {
        if (!currentUser) {
            openModal(loginModal);
            // Store the intended service target in session storage
            sessionStorage.setItem('pendingServiceTarget', serviceTarget);
            return false;
        }
        return true;
    }

    // Function to handle redirection to service pages
    function redirectToService(serviceTarget) {
        let url = '';
        switch (serviceTarget) {
            case 'book-reservation': url = 'book reservation.html'; break;
            case 'borrow-return': url = 'borrowreturn.html'; break;
            case 'printing-photocopying': url = 'service application.html?service=printing'; break;
            case 'internet-access': url = 'service application.html?service=internet'; break;
            case 'advertisements': url = 'ads.html'; break;
            default:
                showNotification('Unknown service requested.');
                return;
        }
        window.location.href = url;
    }

    // Event listeners for service buttons on services.html
    if (path.includes('services.html')) {
        document.querySelectorAll('.access-service-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const serviceTarget = e.currentTarget.dataset.serviceTarget;

                if (serviceTarget === 'apply-card') {
                    // Special case for apply-card, directly open register modal
                    openModal(registerModal);
                    // Store a flag to know where the registration came from
                    sessionStorage.setItem('registeredFromServicesPage', 'true');
                    return;
                }

                if (ensureAuthenticatedAndProceed(serviceTarget)) {
                    redirectToService(serviceTarget);
                }
            });
        });
    }

    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const cardNumber = document.getElementById('loginCardNumber').value.trim();
        const email = document.getElementById('loginEmail').value.trim();

        setBtnLoading(submitBtn, true, 'Logging in...');
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardNumber, email })
            });

            const data = await response.json();

            if (response.ok) {
                currentUser = data.user;
                localStorage.setItem('libraryUser', JSON.stringify(currentUser));
                updateAuthUI();
                closeModal(loginModal);
                showSuccess(`Welcome back, ${currentUser.fullName}!`);

                const pendingServiceTarget = sessionStorage.getItem('pendingServiceTarget');
                if (pendingServiceTarget) {
                    sessionStorage.removeItem('pendingServiceTarget');
                    redirectToService(pendingServiceTarget);
                }

                e.target.reset();
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login API error:', err.message);
            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const user = registeredUsers.find(u => u.libraryCardNumber === cardNumber && u.email === email);
            if (user) {
                currentUser = user;
                localStorage.setItem('libraryUser', JSON.stringify(currentUser));
                updateAuthUI();
                closeModal(loginModal);
                showSuccess(`Welcome back, ${currentUser.fullName}!`);

                const pendingServiceTarget = sessionStorage.getItem('pendingServiceTarget');
                if (pendingServiceTarget) {
                    sessionStorage.removeItem('pendingServiceTarget');
                    redirectToService(pendingServiceTarget);
                }

                e.target.reset();
            } else {
                showNotification('Invalid credentials. Please check your card number and email.');
            }
        } finally {
            setBtnLoading(submitBtn, false);
        }
    });

    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const formData = {
            fullName: document.getElementById('regFullName').value,
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value,
            phone: document.getElementById('regPhone').value,
            userType: document.getElementById('regUserType').value,
            department: document.getElementById('regDepartment').value
        };

        setBtnLoading(submitBtn, true, 'Generating Card...');
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                currentUser = data.user;
                localStorage.setItem('libraryUser', JSON.stringify(currentUser));
                updateAuthUI();
                closeModal(registerModal);
                showSuccess(`Registration successful! Your library card number: ${data.user.libraryCardNumber}`);

                const registeredFromServicesPage = sessionStorage.getItem('registeredFromServicesPage');
                if (registeredFromServicesPage) {
                    sessionStorage.removeItem('registeredFromServicesPage');
                    showSuccess(`Registration successful! Your library card number: ${currentUser.libraryCardNumber}. You can now access services.`);
                    setTimeout(() => { window.location.href = 'services.html'; }, 2000); // Redirect after a short delay
                }

                e.target.reset();
            } else {
                throw new Error(data.error || 'Registration failed');
            }
        } catch (err) {
            // Always fall back to localStorage on any error (network or API error)
            console.log('Registration using fallback:', err.message);
            currentUser = {
                id: Date.now(),
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                userType: formData.userType,
                department: formData.department,
                libraryCardNumber: 'LIB-' + Math.floor(100000 + Math.random() * 900000)
            };
            localStorage.setItem('libraryUser', JSON.stringify(currentUser));
            localStorage.setItem('registeredUsers', JSON.stringify([...JSON.parse(localStorage.getItem('registeredUsers') || '[]'), currentUser]));
            updateAuthUI();
            closeModal(registerModal);

            const registeredFromServicesPage = sessionStorage.getItem('registeredFromServicesPage');
            if (registeredFromServicesPage) {
                sessionStorage.removeItem('registeredFromServicesPage');
                showSuccess(`Registration successful! Your library card number: ${currentUser.libraryCardNumber}. You can now access services.`);
                setTimeout(() => { window.location.href = 'services.html'; }, 2000); // Redirect after a short delay
            }
            showSuccess(`Registration successful! Your library card number: ${currentUser.libraryCardNumber}`);
            e.target.reset();
        } finally {
            setBtnLoading(submitBtn, false);
        }
    });

    // ============================================
    // DROPDOWN & NAVIGATION
    // ============================================
    window.showSection = function (sectionId) {
        const target = document.getElementById(sectionId);
        if (target) {
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-content').forEach(content => {
                if (content !== target) content.style.display = 'none';
            });
            target.style.display = 'block';
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    document.querySelectorAll('.dropdown-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const target = document.getElementById(targetId);
            document.querySelectorAll('.dropdown-content').forEach(content => {
                if (content !== target) content.style.display = 'none';
            });
            target.style.display = target.style.display === 'block' ? 'none' : 'block';
        });
    });

    // ============================================
    // CATEGORY DISPLAY
    // ============================================
    function ensureAuthenticated() {
        if (!currentUser) {
            openModal(registerModal);
            return false;
        }
        return true;
    }

    function renderCategories(categories) {
        const container = document.getElementById('resource-categories-list');
        container.innerHTML = categories.map(cat => `
            <div class="category-item" data-category="${cat.name}">
                <i class="fa ${cat.icon}"></i>
                <span>${cat.name}</span>
            </div>
        `).join('');

        container.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                const category = item.getAttribute('data-category');
                const filtered = allEbooks.filter(ebook => ebook.category === category);
                renderEbooksGrid(filtered);
                document.getElementById('ebooks-section').style.display = 'block';
                document.getElementById('journals-section').style.display = 'none';
                container.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        renderEbooksGrid(allEbooks);
        const firstCategory = container.querySelector('.category-item');
        if (firstCategory) firstCategory.classList.add('active');
    }

    // ============================================
    // E-BOOKS RENDERING
    // ============================================
    function renderEbooksGrid(ebooks) {
        const container = document.getElementById('ebooks-results');
        if (ebooks.length === 0) {
            container.innerHTML = '<div class="no-results"><i class="fa fa-book-open"></i><p>No e-books found.</p></div>';
            return;
        }

        container.innerHTML = ebooks.map(book => {
            // Use access_url as cover if it looks like an image and cover_image is missing
            const displayCover = book.cover_image || (book.access_url && book.access_url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? book.access_url : null);
            const hasCover = !!displayCover;
            const fallbackStyle = !hasCover ? `style="background: ${getBookCover(book.title, book.author)}"` : '';
            return `
            <div class="ebook-card" data-id="${book.id}">
                <div class="ebook-cover" ${fallbackStyle}>
                    ${hasCover ? `<img src="${displayCover}" alt="${book.title}">` : `<i class="fa fa-book" style="font-size: 3em; color: white; opacity: 0.5;"></i>`}
                </div>
                <div class="ebook-details">
                    <h4 class="ebook-title">${book.title}</h4>
                    <p class="ebook-author">${book.author}</p>
                    <p class="ebook-date">${formatDate(book.publication_date)}</p>
                </div>
            </div>
        `}).join('');

        container.querySelectorAll('.ebook-card').forEach(card => {
            card.addEventListener('click', () => {
                if (ensureAuthenticated()) {
                    const ebookId = parseInt(card.getAttribute('data-id'));
                    openEbookReader(ebookId);
                }
            });
        });
    }

    function getBookCover(title, author) {
        const colors = [
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
        ];
        const hash = title.charCodeAt(0) % colors.length;
        return colors[hash];
    }

    async function openEbookReader(ebookId) {
        let ebook;
        try {
            const response = await fetch(`/api/ebooks/${ebookId}`);
            ebook = await response.json();
            if (!response.ok) throw new Error(ebook.error);
        } catch (err) {
            ebook = allEbooks.find(b => b.id === ebookId);
            if (!ebook) { showNotification('E-book not found.'); return; }
        }

        document.getElementById('readerTitle').textContent = ebook.title;
        document.getElementById('readerAuthor').textContent = `By ${ebook.author}`;

        // Set the PDF Viewer Source
        const pdfFrame = document.getElementById('pdfFrame');
        if (pdfFrame) {
            // Using a simple iframe to display the PDF directly
            pdfFrame.src = ebook.access_url;
        }

        // Set the Read Online Link (External)
        const readOnlineLink = document.getElementById('readOnlineLink');
        if (readOnlineLink) {
            readOnlineLink.href = ebook.access_url;
        }

        // Set the Download Link
        const downloadLink = document.getElementById('downloadLink');
        if (downloadLink) {
            downloadLink.href = ebook.access_url;
            // Suggest a filename for the download
            downloadLink.setAttribute('download', `${ebook.title}.pdf`);
        }

        openModal(ebookReaderModal);
    }

    // ============================================
    // JOURNALS & DATABASES
    // ============================================
    function renderJournals(journals) {
        const container = document.getElementById('journals-list');
        container.innerHTML = journals.map(j => `
            <div class="resource-card-sm" data-id="${j.id}" data-type="journal">
                <h5>${j.title}</h5>
                <p class="meta">${j.publisher} | ${j.volume || ''} ${j.publication_date || ''}</p>
                <button class="btn btn-sm" onclick="handleResourceAccess(${j.id}, 'journal')">Access Journal</button>
            </div>
        `).join('');
    }

    function renderDatabases(databases) {
        const container = document.getElementById('databases-list');
        container.innerHTML = databases.map(d => `
            <div class="resource-card-sm" data-id="${d.id}" data-type="database">
                <h5>${d.title}</h5>
                <p class="meta">Provider: ${d.provider || 'N/A'}</p>
                <button class="btn btn-sm" onclick="handleResourceAccess(${d.id}, 'database')">Access Database</button>
            </div>
        `).join('');
    }

    function renderDictionaries(dicts) {
        const container = document.getElementById('dictionaries-list');
        if (dicts.length === 0) { container.innerHTML = '<p class="empty-message">No dictionaries available.</p>'; return; }
        container.innerHTML = dicts.map(item => `
            <div class="reference-card" data-id="${item.id}" data-type="dictionary">
                <div class="reference-icon"><i class="fa fa-book"></i></div>
                <div class="reference-details">
                    <h4>${item.title}</h4>
                    <button class="btn btn-sm" onclick="handleResourceAccess(${item.id}, 'dictionary')">Access</button>
                </div>
            </div>
        `).join('');
    }

    function renderEncyclopedias(encyclopedias) {
        const container = document.getElementById('encyclopedias-list');
        if (encyclopedias.length === 0) { container.innerHTML = '<p class="empty-message">No encyclopedias available.</p>'; return; }
        container.innerHTML = encyclopedias.map(item => `
            <div class="reference-card" data-id="${item.id}" data-type="encyclopedia">
                <div class="reference-icon"><i class="fa fa-book-open"></i></div>
                <div class="reference-details">
                    <h4>${item.title}</h4>
                    <button class="btn btn-sm" onclick="handleResourceAccess(${item.id}, 'encyclopedia')">Access</button>
                </div>
            </div>
        `).join('');
    }

    function renderGuides(guides) {
        const container = document.getElementById('guides-list');
        if (guides.length === 0) { container.innerHTML = '<p class="empty-message">No research guides available.</p>'; return; }
        container.innerHTML = guides.map(item => `
            <div class="reference-card" data-id="${item.id}" data-type="guide">
                <div class="reference-icon"><i class="fa fa-graduation-cap"></i></div>
                <div class="reference-details">
                    <h4>${item.title}</h4>
                    <button onclick="handleResourceAccess(${item.id}, 'guide')" class="btn btn-sm"><i class="fa fa-external-link-alt"></i> Open Guide</button>
                </div>
            </div>
        `).join('');
    }

    // Reference tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });

    // Journals toggle
    document.getElementById('showJournalsBtn')?.addEventListener('click', () => {
        document.getElementById('ebooks-section').style.display = 'none';
        document.getElementById('journals-section').style.display = 'block';
    });

    document.getElementById('backToEbooksBtn')?.addEventListener('click', () => {
        document.getElementById('ebooks-section').style.display = 'block';
        document.getElementById('journals-section').style.display = 'none';
    });

    // Resource access
    window.handleResourceAccess = async function (id, type) {
        if (!ensureAuthenticated()) return;

        let resource = null;

        if (type === 'journal') resource = allJournals.find(j => j.id === id);
        else if (type === 'database') resource = allDatabases.find(d => d.id === id);
        else if (type === 'dictionary') resource = allDictionaries.find(d => d.id === id);
        else if (type === 'encyclopedia') resource = allEncyclopedias.find(e => e.id === id);
        else if (type === 'guide') resource = allGuides.find(g => g.id === id);

        if (!resource) {
            try {
                const response = await fetch(`/api/resources/${id}`);
                if (response.ok) {
                    resource = await response.json();
                }
            } catch (error) {
                console.error(`Error fetching ${type} with ID ${id}:`, error);
            }
        }

        if (resource && resource.access_url) {
            window.open(resource.access_url, '_blank');
            // Log access
            fetch('/api/log-access', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    action: 'access_resource',
                    resourceType: type,
                    resourceId: id
                })
            });
        } else {
            showNotification(`Opening ${type} details...`);
        }
    };

    // ============================================
    // PHYSICAL BOOK REQUEST
    // ============================================
    let bookRequestFormVisible = false;
    document.getElementById('requestPhysicalBookBtn')?.addEventListener('click', () => {
        if (!ensureAuthenticated()) return;
        toggleBookRequestForm();
    });

    function toggleBookRequestForm() {
        const form = document.getElementById('book-request-form');
        bookRequestFormVisible = !bookRequestFormVisible;
        form.style.display = bookRequestFormVisible ? 'block' : 'none';
        if (bookRequestFormVisible) loadPhysicalBooks('');
    }

    document.getElementById('bookSearchInput')?.addEventListener('input', (e) => {
        loadPhysicalBooks(e.target.value.trim());
    });

    async function loadPhysicalBooks(query) {
        const resultsDiv = document.getElementById('bookSearchResults');
        resultsDiv.innerHTML = '<p>Loading books...</p>';
        try {
            const response = await fetch('/api/catalogue' + (query ? `?q=${encodeURIComponent(query)}` : ''));
            const books = await response.json();
            const physicalBooks = books.filter(book => book.type === 'book');
            resultsDiv.innerHTML = physicalBooks.map(book => `
                <div class="result-item" onclick="handleBookSelection(${book.id}, '${book.title}', ${book.available})">
                    <h5>${book.title}</h5>
                    <p>Author: ${book.author} | ${book.available ? 'Available' : 'Not Available'}</p>
                </div>
            `).join('');
        } catch (err) {
            resultsDiv.innerHTML = '<div class="result-item" onclick="handleBookSelection(1, \'Introduction to Computer Science\', true)"><h5>Introduction to Computer Science</h5><p>Author: John Smith | Available</p></div>';
        }
    }

    window.handleBookSelection = async function (bookId, title, available) {
        if (!ensureAuthenticated()) return;
        if (!available) { showNotification('Sorry, this book is currently not available.'); return; }
        if (!confirm(`Request "${title}" for pickup?`)) return;
        showSuccess(`Success! "${title}" has been reserved. You will receive an email at ${currentUser.email} as soon as it is ready for pickup (usually within 2 hours).`);
        loadPhysicalBooks('');
    };

    // ============================================
    // INTERLIBRARY LOAN
    // ============================================
    document.getElementById('interlibraryLoanBtn')?.addEventListener('click', () => {
        if (!ensureAuthenticated()) return;
        toggleLoanForm();
    });

    function toggleLoanForm() {
        const form = document.getElementById('loan-request-form');
        form.style.display = form.style.display === 'block' ? 'none' : 'block';
    }

    document.getElementById('loanForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!ensureAuthenticated()) return;
        const formData = {
            userId: currentUser.id,
            type: 'interlibrary_loan',
            title: document.getElementById('loanTitle').value,
            author: document.getElementById('loanAuthor').value,
            resourceType: document.getElementById('loanType').value,
            reason: document.getElementById('loanReason').value
        };
        showNotification('Interlibrary loan request submitted successfully!');
        e.target.reset();
        toggleLoanForm();
    });

    // ============================================
    // CATALOGUE SEARCH
    // ============================================
    document.getElementById('catalogueSearchBtn')?.addEventListener('click', () => {
        if (ensureAuthenticated()) {
            const query = document.getElementById('catalogueSearch').value;
            searchCatalogue(query);
        }
    });

    async function searchCatalogue(query) {
        const resultsDiv = document.getElementById('catalogue-results');
        resultsDiv.innerHTML = '<div class="loading"><i class="fa fa-spinner fa-spin"></i> Searching...</div>';
        try {
            const response = await fetch(`/api/catalogue?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            resultsDiv.innerHTML = results.map(item => `
                <div class="result-item"><h5>${item.title}</h5><button class="btn" onclick="handleCatalogueAction('${item.type}', ${item.id})">View Details</button></div>
            `).join('');
        } catch (err) {
            resultsDiv.innerHTML = allEbooks.filter(b => b.title.toLowerCase().includes(query.toLowerCase())).map(item => `
                <div class="result-item"><h5>${item.title}</h5><button class="btn" onclick="handleCatalogueAction('ebook', ${item.id})">View Details</button></div>
            `).join('');
        }
    }

    window.handleCatalogueAction = function (type, id) {
        if (!ensureAuthenticated()) return;
        if (type === 'ebook') {
            openEbookReader(id);
        } else if (type === 'book') {
            // For physical books, we need to fetch its details or have them available
            // For now, let's show a notification and suggest requesting it.
            // In a more advanced setup, this would open a dedicated physical book detail modal.
            fetch(`/api/books/${id}`)
                .then(response => response.json())
                .then(book => {
                    if (book) {
                        showNotification(`Viewing details for physical book: "${book.title}" by ${book.author}. Available: ${book.copies_available > 0 ? 'Yes' : 'No'}. You can request this book from the 'Order Through Library' section.`);
                    } else {
                        showNotification(`Physical book details not found for ID: ${id}.`);
                    }
                })
                .catch(error => {
                    console.error('Error fetching physical book details:', error);
                    showNotification(`Error retrieving physical book details for ID: ${id}.`);
                });
        } else {
            // For other resource types (journal, database, etc.), use handleResourceAccess
            handleResourceAccess(id, type);
        }
    };

    // ============================================
    // GLOBAL SEARCH
    // ============================================
    const globalSearchInput = document.getElementById('globalSearch');
    document.querySelector('.search-btn')?.addEventListener('click', performGlobalSearch);
    globalSearchInput?.addEventListener('keyup', (e) => { if (e.key === 'Enter') performGlobalSearch(); });

    function performGlobalSearch() {
        // Redirect to books.html if on another page
        if (!window.location.pathname.includes('books.html')) {
            const query = globalSearchInput.value.trim();
            if (!query) return;
            window.location.href = `books.html#catalogue-section?q=${encodeURIComponent(query)}`;
            return;
        }

        if (!ensureAuthenticated()) return;

        const query = globalSearchInput.value.trim();
        if (!query) return;

        document.getElementById('catalogue-section').style.display = 'block';
        document.getElementById('catalogueSearch').value = query;
        searchCatalogue(query);
    }

    // ============================================
    // HELP DESK
    // ============================================
    document.getElementById('submitQuestionBtn')?.addEventListener('click', async () => {
        const question = document.getElementById('questionText').value.trim();
        const category = document.getElementById('questionCategory').value;

        if (!question || !category) { showNotification('Please fill in all fields for your question.'); return; }
        if (!currentUser) { openModal(loginModal); return; }

        try {
            const response = await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, question: question, category: category })
            });

            if (response.ok) {
                document.getElementById('question-success').style.display = 'block';
                document.getElementById('questionText').value = '';
                document.getElementById('questionCategory').value = '';
                setTimeout(() => { document.getElementById('question-success').style.display = 'none'; }, 5000);
            } else {
                throw new Error('Failed to submit question');
            }
        } catch (err) {
            // Fallback: store question and simulate email feedback
            const questions = JSON.parse(localStorage.getItem('questions') || '[]');
            questions.push({ userId: currentUser.id, question, category, id: Date.now(), status: 'submitted' });
            localStorage.setItem('questions', JSON.stringify(questions));

            document.getElementById('question-success').innerHTML = `
                <p>Your question has been submitted successfully!</p>
                <p style="font-size:0.9em;color:#666;">You will receive feedback at ${currentUser.email} within 24 hours.</p>
            `;
            document.getElementById('question-success').style.display = 'block';
            document.getElementById('questionText').value = '';
            document.getElementById('questionCategory').value = '';
            setTimeout(() => { document.getElementById('question-success').style.display = 'none'; }, 5000);
        }
    });

    // ============================================
    // UTILITIES
    // ============================================
    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // ============================================
    // SERVICE-SPECIFIC PAGE LOGIC
    // ============================================

    // Book Reservation Page Logic (book reservation.html)
    if (path.includes('book reservation.html')) {
        document.getElementById('bookReservationForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentUser) { // Double check authentication
                showNotification('You must be logged in to reserve a book.');
                return;
            }
            const bookTitle = document.getElementById('bookTitle').value;
            const bookAuthor = document.getElementById('bookAuthor').value;
            const pickupDate = document.getElementById('pickupDate').value;
            const pickupTime = document.getElementById('pickupTime').value;

            // Simulate API call or local storage for reservation
            const reservationId = 'RES-' + Math.floor(Math.random() * 100000);
            const feedbackMessage = `Thank you, ${currentUser.fullName}! Your reservation for "${bookTitle}" by ${bookAuthor} (ID: ${reservationId}) is confirmed for pickup on ${pickupDate} at ${pickupTime}. Please rate our service (5/5).`;

            document.getElementById('reservationFeedback').innerHTML = `<p>${feedbackMessage}</p><button class="btn btn-primary" onclick="window.location.href='services.html'">Back to Services</button>`;
            document.getElementById('reservationFeedback').style.display = 'block';
            e.target.reset();
            showNotification('Book reservation submitted!');
        });
    }

    // Borrowing & Returns Page Logic (borrowreturn.html)
    if (path.includes('borrowreturn.html')) {
        document.getElementById('borrowReturnForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentUser) {
                showNotification('You must be logged in to use borrowing/return services.');
                return;
            }
            const transactionType = document.getElementById('transactionType').value;
            const bookIdentifier = document.getElementById('bookIdentifier').value;
            const feedbackRating = document.getElementById('feedbackRating').value;

            const feedbackMessage = `Thank you, ${currentUser.fullName}! Your ${transactionType} request for "${bookIdentifier}" has been processed. We appreciate your ${feedbackRating}/5 rating!`;

            document.getElementById('borrowReturnFeedback').innerHTML = `<p>${feedbackMessage}</p><button class="btn btn-primary" onclick="window.location.href='services.html'">Back to Services</button>`;
            document.getElementById('borrowReturnFeedback').style.display = 'block';
            e.target.reset();
            showNotification('Borrow/Return request submitted!');
        });
    }

    // Service Application Page Logic (service application.html)
    if (path.includes('service application.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const serviceType = urlParams.get('service');
        const serviceApplicationTitle = document.getElementById('serviceApplicationTitle');
        const serviceForm = document.getElementById('serviceForm');

        // Cost Summary Elements
        const selectedServiceText = document.getElementById('selectedService');
        const unitPriceText = document.getElementById('unitPrice');
        const quantityText = document.getElementById('quantity');
        const totalCostText = document.getElementById('totalCost');

        // Form Inputs
        const serviceRadios = document.querySelectorAll('input[name="service"]');
        const quantityInputs = {
            'Photocopying': document.getElementById('copies'),
            'Printing': document.getElementById('prints'),
            // Correcting key name to match radio value exactly
            'Book Binding': document.getElementById('bindings'),
            'Internet': document.getElementById('internetPlan')
        };

        // Empty Payment APIs
        const paymentAPIs = {
            async processMobileMoney(amount) {
                console.log(`Calling Mobile Money API for UGX ${amount}...`);
                return { success: true };
            },
            async processCentenaryBank(amount) {
                console.log(`Calling Centenary Bank API for UGX ${amount}...`);
                return { success: true };
            },
            async processAbsaBank(amount) {
                console.log(`Calling Absa Bank API for UGX ${amount}...`);
                return { success: true };
            }
        };

        function updateCostSummary() {
            const selected = document.querySelector('input[name="service"]:checked');
            if (!selected) return;

            const serviceName = selected.value;
            const price = parseInt(selected.dataset.price);
            let qty = 0;

            if (serviceName === 'Internet') {
                const plan = quantityInputs['Internet'];
                const selectedOption = plan.options[plan.selectedIndex];
                qty = selectedOption.text === 'Select Plan' ? '—' : selectedOption.text.split('(')[0].trim();
                const actualPrice = plan.value ? parseInt(plan.value) : 0;

                selectedServiceText.textContent = serviceName;
                unitPriceText.textContent = actualPrice.toLocaleString();
                quantityText.textContent = qty;
                totalCostText.textContent = actualPrice.toLocaleString();
            } else {
                const inputEl = quantityInputs[serviceName];
                qty = parseInt(inputEl.value) || 0;
                const total = price * qty;

                selectedServiceText.textContent = serviceName;
                unitPriceText.textContent = price.toLocaleString();
                quantityText.textContent = qty > 0 ? qty : '0';
                totalCostText.textContent = total.toLocaleString();
            }
        }

        // Helper to check radio and update summary
        function handleQuantityChange(e) {
            // Find which service this input belongs to
            const serviceName = Object.keys(quantityInputs).find(key => quantityInputs[key] === e.target);
            const radioToSelect = document.querySelector(`input[name="service"][value="${serviceName}"]`);

            if (radioToSelect) {
                radioToSelect.checked = true;
                updateCostSummary();
            }
        }

        // Pre-fill user data if available
        if (currentUser) {
            document.getElementById('fullName').value = currentUser.fullName;
            document.getElementById('libraryCardNumber').value = currentUser.libraryCardNumber;
            document.getElementById('email').value = currentUser.email;
            document.getElementById('phone').value = currentUser.phone || '';
        }

        // Pre-select service based on URL
        if (serviceType === 'printing') {
            document.getElementById('servicePrinting').checked = true;
        } else if (serviceType === 'internet') {
            document.getElementById('serviceInternet').checked = true;
        }

        // Add event listeners for auto-calculation
        serviceRadios.forEach(radio => radio.addEventListener('change', updateCostSummary));

        Object.values(quantityInputs).forEach(input => {
            if (input) {
                // Trigger calculation on typing (number inputs) or selecting (dropdowns)
                input.addEventListener('input', handleQuantityChange);
                // dropdowns often rely on 'change'
                input.addEventListener('change', handleQuantityChange);
            }
        });

        // Initial calculation
        updateCostSummary();

        serviceForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentUser) {
                showNotification('You must be logged in to apply for services.');
                return;
            }
            const selectedService = document.querySelector('input[name="service"]:checked')?.value || 'Unknown';
            const totalCost = document.getElementById('totalCost').textContent;

            let feedbackMessage = '';
            if (selectedService === 'Printing' || selectedService === 'Photocopying') {
                const receiptId = 'RCPT-' + Math.floor(Math.random() * 1000000);
                feedbackMessage = `
                    <div class="receipt-box" style="background: #fff; padding: 15px; border: 1px dashed #999; margin-bottom: 15px; font-family: monospace; text-align: left;">
                        <h4 style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px; color: #333;">OFFICIAL RECEIPT</h4>
                        <p><strong>ID:</strong> ${receiptId}</p>
                        <p><strong>SERVICE:</strong> ${selectedService.toUpperCase()}</p>
                        <p><strong>STATUS:</strong> PAID / PROCESSED</p>
                    </div>
                    <p>Your work will be ready for pickup in <strong>30 minutes</strong>. Total Paid: UGX ${totalCost}</p>`;
            } else if (selectedService === 'Internet') {
                feedbackMessage = `Thank you, ${currentUser.fullName}! Your internet access request is submitted. Total: UGX ${totalCost}. Details will be sent to your email.`;
            } else {
                feedbackMessage = `Thank you, ${currentUser.fullName}! Your service request for ${selectedService} (UGX ${totalCost}) has been submitted.`;
            }

            document.getElementById('serviceFeedback').innerHTML = `<p>${feedbackMessage}</p><button class="btn btn-primary" onclick="window.location.href='services.html'">Back to Services</button>`;
            document.getElementById('serviceFeedback').style.display = 'block';
            e.target.reset();
            showNotification('Service request submitted!');
        });
    }

    // Advertisements Page Logic (ads.html)
    if (path.includes('ads.html')) {
        if (!currentUser) { // Double check authentication
            showNotification('You must be logged in to view advertisements.');
            // Optionally redirect to services.html or index.html if not logged in
            setTimeout(() => { window.location.href = 'services.html'; }, 2000);
            return;
        }

        const advertisementsContent = document.getElementById('advertisementsContent');
        const emptyMessage = advertisementsContent.querySelector('.empty-message');

        // Simulate fetching advertisements
        // Mock: nothing new for now to test notification requirement
        const mockAdvertisements = [];

        if (mockAdvertisements.length > 0) {
            advertisementsContent.innerHTML = mockAdvertisements.map(ad => `
                <div class="card ad-card">
                    <h3>${ad.title}</h3>
                    <p>${ad.description}</p>
                    <small>Posted: ${formatDate(ad.date)}</small>
                </div>
            `).join('');
            emptyMessage.style.display = 'none';
        } else {
            emptyMessage.style.display = 'block';
            showNotification('Nothing new in advertisements at the moment.');
        }
    }

    // Auto-open E-Resources section
    document.getElementById('eresources-section').style.display = 'block';

    // Start data fetch last so UI remains responsive
    await fetchAllData();
});
