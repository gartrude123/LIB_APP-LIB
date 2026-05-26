# Quick Start Guide - Bugema University Library Portal

## Getting Started (3 steps)

### 1. Start the Server
```bash
cd "c:\Users\hp\OneDrive\LIB_APP\LIB_APP"
node server.js
```
You should see:
```
Bugema University Library Portal API running on http://localhost:5001
Connected to the SQLite database.
All tables created successfully
Seeding database...
Sample data seeded successfully
```

### 2. Open the Application
Open your browser and go to:
```
http://localhost:5001/books.html
```

### 3. Login or Register
- **Click** "Login / Register" button (top right)
- Use test account:
  - Card Number: `LIB-100001`
  - Password: `admin123`

OR Register a new account to get your own library card number.

## What You Can Do

### Browse Resources
1. Click **Catalogue** to search all books and resources
2. Click **E-Resources** to see the full grid of e-books, journals, databases
3. Resources are displayed as cards with title, author, type

### Request Physical Books
1. Open **Order Through Library** section
2. Click **Request a Book**
3. Search for a book (e.g., "Database Systems")
4. Click **Request This Book**
5. Confirmation message appears

### Interlibrary Loan
1. Open **Order Through Library**
2. Click **Request Interlibrary Loan**
3. Fill in resource details and reason
4. Submit

### Get Help
1. Scroll to **Q&A / Help Desk**
2. Type your question
3. Select category
4. Click **Send Question**

## Sample Data Included

**Physical Books** (10):
- Database Systems by Elmasri & Navathe
- Introduction to Algorithms by Cormen
- The Pragmatic Programmer by Hunt & Thomas
- Clean Code by Robert Martin
- Design Patterns by Gamma et al.
- Computer Networks by Tanenbaum
- Operating System Concepts by Silberschatz
- AI: A Modern Approach by Russell & Norvig
- Compilers by Aho et al.
- Software Engineering by Sommerville

**E-Books** (10):
- Introduction to Python Programming
- Advanced Data Structures
- Machine Learning Fundamentals
- Business Strategy Essentials
- And more...

**Journals** (4):
- Journal of Applied Psychology
- International Business Review
- Advanced Materials Research
- Journal of Educational Technology

**Databases** (6):
- Academic Search Complete (EBSCO)
- JSTOR
- ScienceDirect
- IEEE Xplore
- PubMed
- ProQuest Dissertations

**Reference** (5):
- Oxford English Dictionary
- Encyclopedia Britannica
- Merriam-Webster's Collegiate Dictionary
- APA Publication Manual
- MLA Handbook

## API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/books | List all physical books |
| GET | /api/resources | List all e-resources |
| GET | /api/catalogue?q=term | Search all resources |
| POST | /api/request | Submit reservation/loan |
| POST | /api/questions | Submit help question |
| POST | /api/register | Create account |
| POST | /api/login | Authenticate |
| GET | /api/health | Server status |

## Database

SQLite database (`library.db`) is auto-created and seeded with sample data on first run.

To reset the database:
1. Stop the server
2. Delete `library.db`
3. Restart server

## Troubleshooting

**Port 5000 already in use**
Change the port in server.js: `const PORT = process.env.PORT || 5001;` → `const PORT = 5002;`

**Images not loading**
The project uses Font Awesome icons instead of images for resources. No external image dependencies.

**Database errors**
Delete `library.db` and restart the server to recreate tables.

**CORS errors**
CORS is enabled in server.js for all origins (`app.use(cors())`).

## File Overview

| File | Purpose |
|------|---------|
| `books.html` | Main page with all sections and modals |
| `styles.css` | Complete responsive styling |
| `app.js` | Frontend logic, API calls, state management |
| `server.js` | Express server, database, all API routes |
| `package.json` | Dependencies (express, sqlite3, cors) |
| `README.md` | Full documentation |

## Next Steps

- Explore all sections on the Books & Resources page
- Try registering a new account
- Request a physical book
- Submit an interlibrary loan request
- Ask a question in the Help Desk
- Search the catalogue with various terms

---

**All endpoints are live and fully functional. The database includes the exact sample books you requested (e.g., "Database Systems by Elmasri & Navathe") and resources (e.g., "JSTOR", "Oxford English Dictionary").**
