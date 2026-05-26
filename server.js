const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const JWT_SECRET = process.env.JWT_SECRET || "bugema_library_secure_secret_2025";

// SQLite setup
const db = new sqlite3.Database("./library.db", (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Helper for standardizing error responses
const handleError = (res, err, status = 500) => {
    console.error("Database Error:", err.message);
    return res.status(status).json({
        error: err.message,
        success: false,
        timestamp: new Date().toISOString()
    });
};

// ========== INITIALIZE DATABASE ==========
function initDatabase() {
    db.serialize(() => {
        // We no longer drop tables here so that data persists across server restarts.

        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            library_card_number TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            phone TEXT,
            user_type TEXT DEFAULT 'student',
            status TEXT DEFAULT 'active',
            department TEXT,
            registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )`, (err) => {
            if (err) console.error("Error creating users table:", err.message);
        });

        // Books (physical books)
        db.run(`CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            isbn TEXT,
            publisher TEXT,
            publication_year TEXT,
            description TEXT,
            category TEXT,
            copies_total INTEGER DEFAULT 1,
            copies_available INTEGER DEFAULT 1,
            available INTEGER DEFAULT 1,
            rating INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error("Error creating books table:", err.message);
        });

        // Resources (e-books, journals, databases, reference materials, research guides)
        db.run(`CREATE TABLE IF NOT EXISTS resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            author TEXT,
            description TEXT,
            access_url TEXT,
            publisher TEXT,
            volume_issue TEXT,
            publication_date TEXT,
            provider TEXT,
            category TEXT,
            is_available INTEGER DEFAULT 1,
            rating INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error("Error creating resources table:", err.message);
        });

        // Requests (book reservations & interlibrary loans)
        db.run(`CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            author TEXT,
            resource_type TEXT,
            resource_id INTEGER,
            reason TEXT,
            status TEXT DEFAULT 'pending',
            request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            response_date DATETIME,
            rating INTEGER,
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) console.error("Error creating requests table:", err.message);
        });

        // Questions (help desk)
        db.run(`CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            question TEXT NOT NULL,
            category TEXT NOT NULL,
            status TEXT DEFAULT 'open',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            response TEXT,
            responded_at DATETIME,
            rating INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) console.error("Error creating questions table:", err.message);
        });

        // Access logs
        db.run(`CREATE TABLE IF NOT EXISTS access_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            resource_type TEXT,
            resource_id INTEGER,
            ip_address TEXT,
            user_agent TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) console.error("Error creating access_logs table:", err.message);
            else {
                // Migration: Ensure rating column exists in both tables for existing databases
                db.run("ALTER TABLE books ADD COLUMN rating INTEGER", (err) => {
                    // Ignore error if column already exists
                });
                db.run("ALTER TABLE requests ADD COLUMN rating INTEGER", (err) => {
                    // Ignore error if column already exists
                });
                db.run("ALTER TABLE resources ADD COLUMN rating INTEGER", () => {
                    // Force re-seed of Admin to ensure bcrypt compatibility
                    const salt = bcrypt.genSaltSync(10);
                    const adminHash = bcrypt.hashSync('admin123', salt);

                    // Ensure the Admin user exists and has the 'admin' role
                    db.get("SELECT count(*) as count FROM users", (err, row) => {
                        if (err) return;
                        if (row && row.count === 0) {
                            seedData();
                        } else {
                            db.run(`UPDATE users SET password = ?, user_type = 'admin' WHERE email = 'admin@bugemauniv.ac.ug'`, [adminHash], () => {
                                console.log("Database verified. Admin credentials synchronized.");
                            });
                        }
                    });
                });
            }
        });
    });
}

// ========== SEED DATA ==========
function seedData() {
    console.log("Seeding database...");

    const salt = bcrypt.genSaltSync(10);
    // Seed Users (for testing)
    const users = [
        [1, 'LIB-100001', 'admin@bugemauniv.ac.ug', bcrypt.hashSync('admin123', salt), 'Library Admin', '+256700000001', 'admin', 'Library'],
        [2, 'LIB-100002', 'john.doe@students.bugemauniv.ac.ug', bcrypt.hashSync('student123', salt), 'John Doe', '+256700000002', 'student', 'Computer Science'],
        [3, 'LIB-100003', 'jane.smith@students.bugemauniv.ac.ug', bcrypt.hashSync('student123', salt), 'Jane Smith', '+256700000003', 'student', 'Information Technology'],
        [4, 'LIB-100004', 'mary.johnson@students.bugemauniv.ac.ug', bcrypt.hashSync('student123', salt), 'Mary Johnson', '+256700000004', 'student', 'Business Administration'],
        [5, 'LIB-100005', 'prof.brown@bugemauniv.ac.ug', bcrypt.hashSync('faculty123', salt), 'Prof. Brown', '+256700000005', 'faculty', 'Faculty of Science']
    ];

    users.forEach(([id, cardNum, email, password, name, phone, type, dept]) => {
        db.run(`INSERT OR IGNORE INTO users (id, library_card_number, email, password, full_name, phone, user_type, department)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [id, cardNum, email, password, name, phone, type, dept], function (err) {
            if (err) console.error("Error inserting user:", err.message);
        });
    });

    // Seed Physical Books - Academic, Religious, Political, Historical, Literature
    const books = [
        // Academic/Computer Science
        [1, 'Database Systems', 'Elmasri & Navathe', '978-0133970777', 'Pearson', '2016', 'Fundamentals of database systems with clear explanations.', 'academic', 10, 8],
        [2, 'Introduction to Algorithms', 'Thomas H. Cormen', '978-0262033848', 'MIT Press', '2009', 'Comprehensive guide to algorithms and data structures.', 'academic', 5, 3],
        [3, 'The Pragmatic Programmer', 'Andrew Hunt & David Thomas', '978-0201616224', 'Addison-Wesley', '1999', 'Your journey to mastery in software development.', 'academic', 7, 5],
        [4, 'Clean Code', 'Robert C. Martin', '978-0132350884', 'Prentice Hall', '2008', 'A handbook of agile software craftsmanship.', 'academic', 6, 4],
        [5, 'Design Patterns', 'Erich Gamma et al.', '978-0201633610', 'Addison-Wesley', '1994', 'Elements of reusable object-oriented software.', 'academic', 4, 2],
        [6, 'Computer Networks', 'Andrew S. Tanenbaum', '978-0132126953', 'Pearson', '2010', 'A comprehensive introduction to networking.', 'academic', 8, 6],
        [7, 'Operating System Concepts', 'Abraham Silberschatz', '978-1119456339', 'Wiley', '2018', 'Core concepts of modern operating systems.', 'academic', 9, 7],
        [8, 'Artificial Intelligence: A Modern Approach', 'Stuart Russell & Peter Norvig', '978-0136042594', 'Pearson', '2020', 'The leading textbook in artificial intelligence.', 'academic', 12, 10],
        [9, 'Compilers: Principles, Techniques, and Tools', 'Aho, Lam, Sethi, Ullman', '978-0321486813', 'Addison-Wesley', '2006', 'The classic dragon book on compiler design.', 'academic', 3, 1],
        [10, 'Software Engineering', 'Ian Sommerville', '978-0137035151', 'Pearson', '2015', 'A comprehensive textbook on software engineering.', 'academic', 6, 3],
        // Religious
        [11, 'The Holy Bible', 'Various', '978-0195289583', 'Oxford University Press', '1998', 'The sacred text of Christianity.', 'religious', 15, 12],
        [12, 'The Quran', 'Prophet Muhammad (PBUH)', '978-0199535951', 'Oxford University Press', '2008', 'The central religious text of Islam.', 'religious', 20, 15],
        [13, 'The Bhagavad Gita', 'Vyasa', '978-0140447903', 'Penguin Classics', '2000', 'A sacred Hindu scripture.', 'religious', 8, 6],
        [14, 'Torah: The Five Books of Moses', 'Moses', '978-0807408835', 'KTAV Publishing', '2001', 'The foundational text of Judaism.', 'religious', 5, 4],
        // Political
        [15, 'The Prince', 'Niccolò Machiavelli', '978-0143031911', 'Penguin Classics', '2009', 'The classic work on political power and statecraft.', 'political', 4, 3],
        [16, 'Democracy in America', 'Alexis de Tocqueville', '978-0143039603', 'Penguin Classics', '2000', 'A comprehensive analysis of American democracy.', 'political', 3, 2],
        [17, 'The Communist Manifesto', 'Karl Marx & Friedrich Engels', '978-0140447576', 'Penguin Classics', '2002', 'The political pamphlet that changed the world.', 'political', 6, 4],
        [18, 'Leviathan', 'Thomas Hobbes', '978-0140431957', 'Penguin Classics', '1982', 'Foundational work on social contract theory.', 'political', 3, 2],
        // Historical
        [19, 'A History of Africa', 'J.D. Fage & Roland Oliver', '978-1566431104', 'Ohio University Press', '1998', 'Comprehensive history of the African continent.', 'historical', 5, 3],
        [20, 'The World Trade Organization: A Very Short Introduction', 'Amrita Narlikar', '978-0199547532', 'Oxford University Press', '2007', 'Introduction to the WTO and global trade.', 'historical', 4, 3],
        [21, 'African Civilizations: An Archaeological Perspective', 'Graham Connah', '978-0521592234', 'Cambridge University Press', '1995', 'Exploring ancient African civilizations.', 'historical', 2, 1],
        // Literature
        [22, 'Things Fall Apart', 'Chinua Achebe', '978-0141186880', 'Penguin Classics', '2001', 'A novel about pre-colonial Africa and colonization.', 'literature', 10, 8],
        [23, 'Song of Lawino', 'Okot p\'Bitek', '978-9970021054', 'Heinemann', '1984', 'African poetry about cultural conflict.', 'literature', 6, 4],
        [24, 'The River Between', 'Ngũgĩ wa Thiong\'o', '978-0143038332', 'Penguin Classics', '2000', 'Novel about colonial Kenya and cultural clash.', 'literature', 5, 3]
    ];

    books.forEach(([id, title, author, isbn, publisher, year, desc, cat, total, available]) => {
        db.run(`INSERT OR IGNORE INTO books (id, title, author, isbn, publisher, publication_year, description, category, copies_total, copies_available, available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [id, title, author, isbn, publisher, year, desc, cat, total, available], function (err) {
                if (err) console.error("Error inserting book:", err.message);
            });
    });

    // Seed E-Books with real accessible URLs (open access)
    const ebooks_data = [ // Renamed to avoid conflict with previous 'ebooks' variable
        ['Python for Everybody', 'Charles Severance', '2024-01-15', 'A comprehensive guide to Python programming for beginners.', 'https://prestigebookshop.com/wp-content/uploads/2019/02/book-image-17871-642x1024.jpg', 'Computer Science'],
        ['Open Data Structures', 'Pat Morin', '2023-06-20', 'In-depth coverage of advanced data structures and algorithms.', 'https://opendatastructures.org/ods-python.pdf', 'Computer Science'],
        ['Deep Learning', 'Ian Goodfellow', '2024-03-10', 'Introduction to machine learning concepts and applications.', 'https://www.deeplearningbook.org/contents/intro.pdf', 'Computer Science'],
        ['Principles of Management', 'OpenStax', '2023-09-05', 'Core principles of management and business strategy.', 'https://openstax.org/books/principles-management/pages/1-introduction', 'Business & Economics'], // Link to chapter 1, not direct PDF
        ['Financial Accounting', 'OpenStax', '2024-02-28', 'Core principles of financial accounting and reporting.', 'https://openstax.org/books/financial-accounting/pages/1-introduction', 'Business & Economics'], // Link to chapter 1
        ['Calculus Volume 1', 'OpenStax', '2023-11-15', 'Comprehensive calculus textbook with clear explanations.', 'https://openstax.org/books/calculus-volume-1/pages/1-introduction', 'Mathematics'], // Link to chapter 1
        ['College Algebra', 'OpenStax', '2024-01-20', 'Fundamental concepts of algebra.', 'https://openstax.org/books/college-algebra/pages/1-introduction', 'Mathematics'], // Link to chapter 1
        ['University Physics Volume 1', 'OpenStax', '2023-08-12', 'Complete physics textbook with problem-solving approach.', 'https://openstax.org/books/university-physics-volume-1/pages/1-introduction', 'Science'], // Link to chapter 1
        ['Psychology 2e', 'OpenStax', '2024-04-01', 'Classic introduction to psychology principles.', 'https://openstax.org/books/psychology-2e/pages/1-introduction', 'Social Sciences'], // Link to chapter 1
        ['World History Volume 1', 'OpenStax', '2023-07-22', 'Global history from prehistoric times to present.', 'https://openstax.org/books/world-history-volume-1/pages/1-introduction', 'History'], // Link to chapter 1
        ['Information Technology', 'Ahmed S. Khan', '2023-10-12', 'Introduction to IT concepts and information systems.', 'https://cdn.shopify.com/s/files/1/0026/0787/4084/products/information-technology-9789699157059-01_2048x2048.jpg?v=1529746141', 'Computer Science']
    ];

    ebooks_data.forEach(([title, author, pub_date, desc, url, category]) => {
        db.run(`INSERT OR IGNORE INTO resources (title, type, author, publication_date, description, access_url, category) VALUES (?, 'ebook', ?, ?, ?, ?, ?)`,
            [title, author, pub_date, desc, url, category], function (err) {
                if (err) console.error("Error inserting ebook:", err.message);
            });
    });

    // Seed Academic Journals with real URLs (open access)
    const journals = [
        ['Journal of Applied Psychology', 'journal', 'American Psychological Association', '2024-03', 'Latest research in applied psychology', 'https://psycnet.apa.org/journals/apl/', 'academic'],
        ['International Business Review', 'journal', 'Elsevier', '2024-02', 'Business and management research', 'https://www.sciencedirect.com/journal/international-business-review', 'academic'],
        ['Advanced Materials Research', 'journal', 'Trans Tech Publications', '2024-01', 'Cutting-edge materials science', 'https://www.scientific.net/AMR', 'academic'],
        ['Journal of Educational Technology & Society', 'journal', 'ETS', '2024-04', 'Educational technology and innovation', 'https://www.j-ets.net/', 'academic'],
        ['African Journal of History and Culture', 'journal', 'Academic Journals', '2024-01', 'Historical research on African civilizations', 'https://academicjournals.org/journal/AJHC', 'historical'],
        ['Journal of Political Science Education', 'journal', 'Taylor & Francis', '2024-02', 'Analysis of political systems and governance', 'https://www.tandfonline.com/journals/upse20', 'political']
    ];

    journals.forEach(([title, type, author, pub_date, desc, url, category]) => {
        db.run(`INSERT OR IGNORE INTO resources (title, type, author, publication_date, description, access_url, category) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, type, author, pub_date, desc, url, category], function (err) {
                if (err) console.error("Error inserting journal:", err.message);
            });
    });

    // Seed Academic Databases with real URLs
    const databases = [
        ['Academic Search Complete', 'database', 'EBSCO', null, 'Multi-disciplinary database with full-text articles', 'https://search.ebscohost.com', 'EBSCO', 'academic'],
        ['JSTOR', 'database', 'Ithaka', null, 'Archival scholarly journal repository', 'https://www.jstor.org', 'Ithaka', 'academic'],
        ['ScienceDirect', 'database', 'Elsevier', null, 'Scientific and medical database', 'https://www.sciencedirect.com', 'Elsevier', 'academic'],
        ['IEEE Xplore', 'database', 'IEEE', null, 'Electrical engineering and computer science', 'https://ieeexplore.ieee.org', 'IEEE', 'academic'],
        ['PubMed', 'database', 'National Library of Medicine', null, 'Biomedical literature database', 'https://pubmed.ncbi.nlm.nih.gov', 'NLM', 'academic'],
        ['ProQuest Dissertations', 'database', 'ProQuest', null, 'Doctoral dissertations and theses', 'https://www.proquest.com/products/dissertations', 'ProQuest', 'academic'],
        ['World Digital Library', 'database', 'Library of Congress', null, 'Historical documents and artifacts from around the world', 'https://www.wdl.org', 'Library of Congress', 'historical'],
        ['Political Science Database', 'database', 'ProQuest', null, 'Political science and international relations research', 'https://www.proquest.com/government/political-science', 'ProQuest', 'political']
    ];

    databases.forEach(([title, type, author, pub_date, desc, url, provider, category]) => {
        db.run(`INSERT OR IGNORE INTO resources (title, type, author, description, access_url, provider, category) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, type, author, desc, url, provider, category], function (err) {
                if (err) console.error("Error inserting database:", err.message);
            });
    });

    // Seed Reference Materials - Dictionaries & Encyclopedias with real URLs
    const references = [
        ['Merriam-Webster Dictionary', 'dictionary', 'Merriam-Webster', '2023', 'Open collegiate dictionary and thesaurus', 'https://www.merriam-webster.com/', 'dictionary'], // Verified
        ['Encyclopedia Britannica', 'encyclopedia', 'Britannica Inc.', '2024', 'Latest edition with comprehensive articles', 'https://www.britannica.com', 'encyclopedia'],
        ['The Free Dictionary', 'dictionary', 'Farlex', '2023', 'Comprehensive online dictionary and encyclopedia', 'https://www.thefreedictionary.com/', 'dictionary'], // Verified
        ['Cambridge Dictionary', 'dictionary', 'Cambridge University Press', '2024', 'English dictionary and translator', 'https://dictionary.cambridge.org', 'dictionary'],
        ['Wikipedia', 'encyclopedia', 'Wikimedia Foundation', '2024', 'Free online encyclopedia', 'https://en.wikipedia.org', 'encyclopedia'],
        ['World Book Encyclopedia', 'encyclopedia', 'World Book', '2023', 'General knowledge encyclopedia', 'https://www.worldbookonline.com/wb/products?ed=all&db=all', 'encyclopedia'] // Link to product page, not direct encyclopedia
    ];

    references.forEach(([title, type, author, pub_date, desc, url, category]) => {
        db.run(`INSERT OR IGNORE INTO resources (title, type, author, publication_date, description, access_url, category) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, type, author, pub_date, desc, url, category], function (err) {
                if (err) console.error("Error inserting reference:", err.message);
            });
    });

    // Seed Research Guides (real URLs to library resources)
    const guides = [
        ['APA Citation Guide', 'guide', 'American Psychological Association', '2020', 'Official guide to APA style and citation', 'https://apastyle.apa.org/instructional-aids/tutorials-webinars', 'academic'], // Verified
        ['MLA Formatting', 'guide', 'Modern Language Association', '2021', 'MLA citation and formatting guide', 'https://style.mla.org/sample-papers/', 'academic'], // Verified
        ['Chicago Style Guide', 'guide', 'University of Chicago Press', '2017', 'Comprehensive style guide for writers', 'https://www.chicagomanualofstyle.org/tools_citationguide.html', 'academic'], // Verified
        ['Harvard Referencing', 'guide', 'Harvard University', '2023', 'Complete guide to Harvard citation style', 'https://guides.library.harvard.edu/cite', 'academic'], // More direct Harvard guide
        ['Research Methods', 'guide', 'SAGE Publications', '2022', 'Step-by-step guide to conducting research', 'https://methods.sagepub.com/', 'academic'], // Verified
        ['Writing a Thesis', 'guide', 'MIT Writing Center', '2023', 'How to write a successful thesis', 'https://writing.mit.edu/academic-writing/theses-and-dissertations', 'academic'], // More direct MIT guide
        ['Data Analysis with Python', 'guide', 'freeCodeCamp', '2024', 'Free tutorial on data analysis using Python', 'https://www.freecodecamp.org/learn/data-analysis-with-python/', 'academic'], // Verified
        ['Git and GitHub', 'guide', 'GitHub', '2024', 'Version control guide for beginners', 'https://docs.github.com/en/get-started', 'academic'] // Verified
    ];

    guides.forEach(([title, type, author, pub_date, desc, url, category]) => {
        db.run(`INSERT OR IGNORE INTO resources (title, type, author, publication_date, description, access_url, category) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, type, author, pub_date, desc, url, category], function (err) {
                if (err) console.error("Error inserting guide:", err.message);
            });
    });

    console.log("Sample data seeded successfully");
}

// Initialize database on startup
initDatabase();

// ============================================
// AUTH ENDPOINTS
// ============================================

// Register a new user
app.post("/api/register", async (req, res) => {
    const { email, password, fullName, phone, userType, department } = req.body;
    if (!email || !password || !fullName) {
        return res.status(400).json({ error: "Email, password, and full name are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const libraryCardNumber = "LIB-" + Math.floor(100000 + Math.random() * 900000);

    db.run(
        `INSERT INTO users (library_card_number, email, password, full_name, phone, user_type, department) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [libraryCardNumber, email, hashedPassword, fullName, phone || '', userType || 'student', department || ''],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) return res.status(400).json({ error: "Registration failed: This email or card number is already in use." });
                return res.status(500).json({ error: err.message });
            }
            res.json({
                message: "Registration successful",
                user: {
                    id: this.lastID,
                    libraryCardNumber,
                    email,
                    fullName,
                    userType: userType || 'student',
                    department: department || ''
                }
            });
        }
    );
});

// Login user
app.post("/api/login", (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ error: "Identifier (card number or email) and password are required" });

    let query = `SELECT * FROM users WHERE (library_card_number = ? OR email = ?)`;
    db.get(query, [identifier, identifier], async (err, row) => {
        if (err) return handleError(res, err);

        if (!row) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        try {
            const isMatch = await bcrypt.compare(password, row.password);
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            if (row.status === 'blocked') {
                return res.status(403).json({ error: "Your account has been suspended. Please contact the administrator." });
            }
        } catch (authErr) {
            console.error("Auth Exception:", authErr.message);
            return res.status(500).json({ error: "Authentication system error. Please reset the database." });
        }

        const token = jwt.sign(
            { id: row.id, role: row.user_type },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        db.run("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [row.id]);
        db.run("INSERT INTO access_logs (user_id, action) VALUES (?, 'login')", [row.id]);

        res.json({
            message: "Login successful",
            token,
            user: {
                id: row.id,
                libraryCardNumber: row.library_card_number,
                email: row.email,
                fullName: row.full_name,
                userType: row.user_type,
                department: row.department,
                phone: row.phone
            }
        });
    });
});

// ============================================
// BOOKS ENDPOINT (Physical Books)
// ============================================

app.get("/api/books", (req, res) => {
    db.all(`SELECT * FROM books WHERE available = 1 ORDER BY title`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get("/api/books/:id", (req, res) => {
    db.get(`SELECT * FROM books WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Book not found" });
        res.json(row);
    });
});

// ============================================
// RESOURCES ENDPOINT (E-Books, Journals, Databases, Reference)
// ============================================

app.get("/api/ebooks", (req, res) => {
    const { categoryId } = req.query;
    let query = `SELECT r.*, r.category as category_name FROM resources r WHERE r.type = 'ebook' AND r.is_available = 1`;
    const params = [];

    if (categoryId) {
        query += " AND r.category = ?";
        params.push(categoryId);
    }

    query += " ORDER BY r.title";

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get("/api/ebook-categories", (req, res) => {
    const categories = [
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
    res.json(categories);
});

app.get("/api/ebooks/:id", (req, res) => {
    db.get(`SELECT * FROM resources WHERE id = ? AND type = 'ebook'`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "E-book not found" });
        res.json(row);
    });
});

app.get("/api/resources/:id", (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM resources WHERE id = ?`, [id], (err, row) => {
        if (err) return handleError(res, err);
        if (!row) return res.status(404).json({ error: "Resource not found" });
        res.json(row);
    });
});

app.get("/api/journals", (req, res) => {
    db.all(`SELECT * FROM resources WHERE type = 'journal' AND is_available = 1 ORDER BY title`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get("/api/databases", (req, res) => {
    db.all(`SELECT * FROM resources WHERE type = 'database' AND is_available = 1 ORDER BY title`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get("/api/reference-materials", (req, res) => {
    const { type } = req.query;
    let query = "SELECT * FROM resources WHERE is_available = 1 AND (type = 'dictionary' OR type = 'encyclopedia')";
    const params = [];
    if (type) {
        query += " AND type = ?";
        params.push(type);
    }
    query += " ORDER BY title";

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get("/api/research-guides", (req, res) => {
    db.all(`SELECT * FROM resources WHERE type = 'guide' AND is_available = 1 ORDER BY title`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ============================================
// CATALOGUE SEARCH (books + resources)
// ============================================

app.get("/api/catalogue", (req, res) => {
    const { q, prefix } = req.query;
    const searchParam = prefix === 'true' ? `${q || ''}%` : `%${q || ''}%`;

    const query = `
        SELECT 'book' as type, id, title, author, 'Physical Book' as category,
               CASE WHEN copies_available > 0 AND available = 1 THEN 1 ELSE 0 END as available,
               NULL as access_url,
               rating
        FROM books
        WHERE title LIKE ? OR author LIKE ?
        UNION ALL
        SELECT type, id, title, author,
               CASE
                   WHEN type = 'ebook' THEN 'E-Book'
                   WHEN type = 'journal' THEN 'Journal'
                   WHEN type = 'database' THEN 'Database'
                   WHEN type = 'dictionary' THEN 'Dictionary'
                   WHEN type = 'encyclopedia' THEN 'Encyclopedia'
                   WHEN type = 'guide' THEN 'Research Guide'
                   ELSE type
               END as category,
               is_available as available,
               access_url,
               rating
        FROM resources
        WHERE title LIKE ? OR author LIKE ?
        ORDER BY title
        LIMIT 50
    `;

    db.all(query, [searchParam, searchParam, searchParam, searchParam], (err, rows) => {
        if (err) {
            console.error('Catalogue search error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});
// ============================================
// REQUEST ENDPOINT (book reservations & interlibrary loans)
// ============================================

app.post("/api/request", (req, res) => {
    const { userId, type, title, author, resourceType, resourceId, reason } = req.body;

    if (!userId || !type || !title) {
        return res.status(400).json({ error: "User ID, request type, and title are required" });
    }

    db.run(
        `INSERT INTO requests (user_id, type, title, author, resource_type, resource_id, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [userId, type, title, author || '', resourceType || '', resourceId || null, reason || ''],
        function (err) {
            if (err) {
                console.error("Error creating request:", err);
                return res.status(500).json({ error: err.message });
            }

            // Log access
            db.run("INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES (?, 'create_request', ?, ?)",
                [userId, type, this.lastID]);

            res.json({ message: "Request submitted successfully", requestId: this.lastID });
        }
    );
});

app.get("/api/requests/:userId", (req, res) => {
    db.all(`SELECT * FROM requests WHERE user_id = ? ORDER BY request_date DESC`, [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ============================================
// QUESTIONS ENDPOINT (help desk)
// ============================================

app.post("/api/questions", (req, res) => {
    const { userId, question, category } = req.body;

    if (!userId || !question || !category) {
        return res.status(400).json({ error: "User ID, question, and category are required" });
    }

    db.run(
        `INSERT INTO questions (user_id, question, category, status) VALUES (?, ?, ?, 'open')`,
        [userId, question, category],
        function (err) {
            if (err) {
                console.error("Error submitting question:", err);
                return res.status(500).json({ error: err.message });
            }

            // Log access
            db.run("INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES (?, 'ask_question', 'help_desk', ?)",
                [userId, this.lastID]);

            res.json({ message: "Question submitted successfully", questionId: this.lastID });
        }
    );
});

app.get("/api/questions/:userId", (req, res) => {
    db.all(`SELECT * FROM questions WHERE user_id = ? ORDER BY created_at DESC`, [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ============================================
// ACCESS LOG
// ============================================

app.post("/api/log-access", (req, res) => {
    const { userId, action, resourceType, resourceId } = req.body;
    db.run(
        "INSERT INTO access_logs (user_id, action, resource_type, resource_id) VALUES (?, ?, ?, ?)",
        [userId || null, action, resourceType, resourceId || null]
    );
    res.json({ message: "Access logged" });
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ============================================
// ADMIN API ENDPOINTS
// ============================================

// Middleware to simulate admin check (In production, use JWT/Sessions)
const isAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "No token provided" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err || !['faculty', 'admin'].includes(decoded.role)) {
            return res.status(403).json({ error: "Access denied. Admin privileges required." });
        }
        req.user = decoded;
        next();
    });
};

// Get all users (Admin only)
app.get("/api/admin/users", isAdmin, (req, res) => {
    db.all("SELECT id, library_card_number, email, full_name, user_type, department, registered_at, last_login FROM users", [], (err, rows) => {
        if (err) return handleError(res, err);
        res.json(rows);
    });
});

// Get all access logs (Admin only)
app.get("/api/admin/logs", isAdmin, (req, res) => {
    db.all(`SELECT l.*, u.full_name FROM access_logs l LEFT JOIN users u ON l.user_id = u.id ORDER BY timestamp DESC LIMIT 100`, [], (err, rows) => {
        if (err) return handleError(res, err);
        res.json(rows);
    });
});

// Get all requests (Admin only)
app.get("/api/admin/requests", isAdmin, (req, res) => {
    db.all(`SELECT r.*, u.full_name as user_name FROM requests r JOIN users u ON r.user_id = u.id ORDER BY r.request_date DESC`, [], (err, rows) => {
        if (err) return handleError(res, err);
        res.json(rows);
    });
});

// Get specific request details (Admin only)
app.get("/api/admin/requests/:id", isAdmin, (req, res) => {
    db.get(`SELECT r.*, u.full_name as user_name FROM requests r JOIN users u ON r.user_id = u.id WHERE r.id = ?`, [req.params.id], (err, row) => {
        if (err) return handleError(res, err);
        if (!row) return res.status(404).json({ error: "Request not found" });
        res.json(row);
    });
});

// Update request status / Confirm Payment (Admin only)
app.put("/api/admin/requests/:id", isAdmin, (req, res) => {
    const { status, notes } = req.body;
    db.run("UPDATE requests SET status = ?, notes = ?, response_date = CURRENT_TIMESTAMP WHERE id = ?", [status || 'approved', notes || 'Confirmed by Admin', req.params.id], function (err) {
        if (err) return handleError(res, err);
        res.json({ message: "Request status updated and confirmed." });
    });
});

// Update rating for a request
app.put("/api/requests/:id/rate", (req, res) => {
    const { rating } = req.body;
    db.run("UPDATE requests SET rating = ? WHERE id = ?", [rating, req.params.id], function (err) {
        if (err) return handleError(res, err);
        res.json({ message: "Rating updated" });
    });
});

// Update rating for a resource
app.put("/api/resources/:id/rate", (req, res) => {
    const { rating } = req.body;
    db.run("UPDATE resources SET rating = ? WHERE id = ?", [rating, req.params.id], function (err) {
        if (err) return handleError(res, err);
        res.json({ message: "Rating updated" });
    });
});

// Update rating for a question
app.put("/api/questions/:id/rate", (req, res) => {
    const { rating } = req.body;
    db.run("UPDATE questions SET rating = ? WHERE id = ?", [rating, req.params.id], function (err) {
        if (err) return handleError(res, err);
        res.json({ message: "Rating updated" });
    });
});

// Get all help desk questions (Admin only)
app.get("/api/admin/questions", isAdmin, (req, res) => {
    db.all(`SELECT q.*, u.full_name as user_name FROM questions q JOIN users u ON q.user_id = u.id ORDER BY q.created_at DESC`, [], (err, rows) => {
        if (err) return handleError(res, err);
        res.json(rows);
    });
});

// Admin Stats Endpoint (Live counts)
app.get("/api/admin/stats", isAdmin, (req, res) => {
    const queries = {
        totalUsers: "SELECT COUNT(*) as count FROM users",
        activeToday: "SELECT COUNT(*) as count FROM access_logs WHERE action = 'login' AND date(timestamp) = date('now')",
        totalBooks: "SELECT COUNT(*) as count FROM books",
        totalResources: "SELECT COUNT(*) as count FROM resources"
    };

    const stats = {};
    const keys = Object.keys(queries);
    let completed = 0;

    keys.forEach(key => {
        db.get(queries[key], (err, row) => {
            stats[key] = row ? row.count : 0;
            completed++;
            if (completed === keys.length) {
                res.json(stats);
            }
        });
    });
});

// Resource management endpoints (Admin only)
app.get("/api/admin/books", isAdmin, (req, res) => {
    db.all("SELECT * FROM books ORDER BY title", [], (err, rows) => {
        if (err) return handleError(res, err);
        res.json(rows);
    });
});

app.get("/api/admin/resources", isAdmin, (req, res) => {
    db.all("SELECT * FROM resources ORDER BY title", [], (err, rows) => {
        if (err) return handleError(res, err);
        res.json(rows);
    });
});

// Respond to help desk questions (Admin only)
app.put("/api/admin/questions/:id", isAdmin, (req, res) => {
    const { response } = req.body;
    db.run("UPDATE questions SET response = ?, status = 'closed', responded_at = CURRENT_TIMESTAMP WHERE id = ?", [response, req.params.id], function (err) {
        if (err) return handleError(res, err);
        res.json({ message: "Response sent successfully" });
    });
});

// Resource CRUD operations
app.post("/api/admin/books", isAdmin, (req, res) => {
    const { title, author, isbn, publisher, year, category, quantity } = req.body;
    db.run(`INSERT INTO books (title, author, isbn, publisher, publication_year, category, copies_total, copies_available, available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [title, author, isbn, publisher, year, category, quantity, quantity], function (err) {
            if (err) return handleError(res, err);
            res.json({ message: "Book added successfully", id: this.lastID });
        });
});

// Update book details (Admin only)
app.put("/api/admin/books/:id", isAdmin, (req, res) => {
    const { title, author, isbn, publisher, year, category, quantity } = req.body;
    db.run(
        `UPDATE books SET title = ?, author = ?, isbn = ?, publisher = ?, publication_year = ?, category = ?, copies_total = ?, copies_available = ? WHERE id = ?`,
        [title, author, isbn, publisher, year, category, quantity, quantity, req.params.id],
        function (err) {
            if (err) return handleError(res, err);
            res.json({ message: "Book updated successfully" });
        }
    );
});

// Update resource details (Admin only)
app.put("/api/admin/resources/:id", isAdmin, (req, res) => {
    const { title, type, url, provider, category, description } = req.body;
    db.run(
        `UPDATE resources SET title = ?, type = ?, access_url = ?, provider = ?, category = ?, description = ? WHERE id = ?`,
        [title, type, url, provider, category, description, req.params.id],
        function (err) {
            if (err) return handleError(res, err);
            res.json({ message: "Resource updated successfully" });
        }
    );
});

app.delete("/api/admin/books/:id", isAdmin, (req, res) => {
    db.run("DELETE FROM books WHERE id = ?", [req.params.id], (err) => {
        if (err) return handleError(res, err);
        res.json({ message: "Book deleted successfully" });
    });
});

app.post("/api/admin/resources", isAdmin, (req, res) => {
    const { title, type, url, provider, category, description } = req.body;
    db.run(`INSERT INTO resources (title, type, access_url, provider, category, description, is_available) VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [title, type, url, provider, category, description], function (err) {
            if (err) return handleError(res, err);
            res.json({ message: "Resource added successfully", id: this.lastID });
        });
});

app.delete("/api/admin/resources/:id", isAdmin, (req, res) => {
    db.run("DELETE FROM resources WHERE id = ?", [req.params.id], (err) => {
        if (err) return handleError(res, err);
        res.json({ message: "Resource deleted successfully" });
    });
});

// Block user logic
app.put("/api/admin/users/:id/block", isAdmin, (req, res) => {
    const { reason } = req.body;
    db.run("UPDATE users SET status = 'blocked' WHERE id = ?", [req.params.id], (err) => {
        if (err) return handleError(res, err);
        db.run("INSERT INTO access_logs (user_id, action, notes) VALUES (?, 'user_blocked', ?)", [req.params.id, reason]);
        res.json({ message: "User has been blocked successfully" });
    });
});

// Unblock user logic
app.put("/api/admin/users/:id/unblock", isAdmin, (req, res) => {
    db.run("UPDATE users SET status = 'active' WHERE id = ?", [req.params.id], (err) => {
        if (err) return handleError(res, err);
        db.run("INSERT INTO access_logs (user_id, action, notes) VALUES (?, 'user_unblocked', 'Restored by Admin')", [req.params.id]);
        res.json({ message: "User access restored" });
    });
});

// ============================================
// ADVERTISEMENTS ENDPOINT
// ============================================
app.get("/api/advertisements", (req, res) => {
    // This is a placeholder. In a real application, these would come from a database.
    const ads = [
        {
            id: 1,
            title: "New E-Book Collection Released!",
            description: "Explore our latest additions to the Computer Science Department."
        }
    ];
    res.json(ads);
});
// Start server
const startServer = (port) => {
    const server = app.listen(port)
        .on('listening', () => {
            console.log(`Bugema University Library Portal API running on http://localhost:${port}`);
            console.log(`Open your browser and go to: http://localhost:${port}/index.html`);
        })
        .on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.warn(`Port ${port} is already in use. Trying port ${port + 1}...`);
                startServer(port + 1);
            } else {
                console.error('Server startup error:', err.message);
                process.exit(1);
            }
        });
};

const INITIAL_PORT = process.env.PORT || 5001;
startServer(Number(INITIAL_PORT));
