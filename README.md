# Bugema University Online Library Portal

A full-stack library management system for Bugema University, featuring a responsive frontend and RESTful API backend with SQLite database.

## Features

### Frontend (Books & Resources Page)
- **Responsive Design**: Mobile-first CSS with breakpoints for tablet and desktop
- **Header**: Logo, navigation menu, global search bar, login/register button
- **Catalogue Search**: Unified search across all books and resources
- **E-Resources**: Dynamic grid of all electronic resources (e-books, journals, databases) fetched via API
- **Physical Book Request**: Search and reserve physical books with availability check
- **Interlibrary Loan**: Request resources not in the collection
- **Q&A Help Desk**: Submit questions to library staff
- **User Authentication**: Login/Register modals with library card authentication
- **Footer**: Quick links, contact info, social media icons, resources navigation

### Backend (Node.js + Express + SQLite)
- **RESTful API** with endpoints:
  - `GET /api/books` - List all physical books
  - `GET /api/books/:id` - Get book details
  - `GET /api/resources` - List all e-resources (e-books, journals, databases, reference)
  - `GET /api/resources/:id` - Get resource details
  - `GET /api/catalogue?q=query` - Unified search across books and resources
  - `POST /api/request` - Submit book reservation or interlibrary loan
  - `GET /api/requests/:userId` - Get user's requests
  - `POST /api/questions` - Submit help desk question
  - `GET /api/questions/:userId` - Get user's questions
  - `POST /api/log-access` - Log resource access for admin tracking
  - `POST /api/register` - Register new user (generates library card number)
  - `POST /api/login` - Authenticate with library card number
  - `GET /api/health` - Health check

- **Database Tables**:
  - `users` - Library members
  - `books` - Physical books inventory
  - `resources` - Electronic resources (e-books, journals, databases, reference)
  - `requests` - Book reservations and interlibrary loans
  - `questions` - Help desk inquiries
  - `access_logs` - Activity tracking for admin monitoring

- **Seed Data**:
  - 10 physical books (including "Database Systems by Elmasri & Navathe")
  - 10 e-books across various categories
  - 4 academic journals (JSTOR, ScienceDirect, etc.)
  - 6 academic databases (Academic Search Complete, IEEE Xplore, etc.)
  - 5 reference materials (Oxford English Dictionary, APA Manual, etc.)
  - 3 sample users (admin, student)

## Project Structure

```
LIB_APP/
├── server.js           # Node.js Express server with all API routes
├── app.js              # Frontend JavaScript (interactivity, API calls)
├── books.html          # Main Books & Resources page
├── styles.css          # Complete responsive stylesheet
├── package.json        # Node dependencies
├── library.db          # SQLite database (auto-created)
└── README.md           # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Steps

1. Navigate to the project directory:
```bash
cd "c:\Users\hp\OneDrive\LIB_APP\LIB_APP"
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm run dev
```
Or for production:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:5001/books.html
```

## Usage Guide

### For Library Visitors

1. **Browse Resources**: Click any dropdown section to explore the library's collections
2. **Search**: Use the global search bar (top right) or catalogue search to find resources
3. **Access E-Resources**: Click any resource card, then login/register to access
4. **Request Physical Books**: Go to "Order Through Library" → "Request a Book", search for a book, and submit a reservation
5. **Interlibrary Loan**: Request books not in our collection via the interlibrary loan form
6. **Ask for Help**: Use the Q&A / Help Desk section to submit questions

### Authentication

- **Register**: Click "Login / Register" → "Register here", fill in details
  - You'll receive a Library Card Number (format: LIB-XXXXXX)
  - Save this number for future logins

- **Login**: Use your Library Card Number and password
  - Example card: `LIB-100001`, password: `admin123` (for admin test user)

### Test Accounts

| Role       | Card Number | Email                          | Password  |
|------------|-------------|--------------------------------|-----------|
| Admin      | LIB-100001  | admin@bugemauniv.ac.ug         | admin123  |
| Student    | LIB-100002  | john.doe@students.bugemauniv.ac.ug | student123 |

## API Documentation

### Authentication
```
POST /api/register
Body: { email, password, fullName, phone, userType, department }
Response: { message, user: { id, libraryCardNumber, email, fullName, ... } }

POST /api/login
Body: { cardNumber, password }
Response: { message, user: { id, libraryCardNumber, fullName, ... } }
```

### Books
```
GET /api/books
GET /api/books/:id
```

### Resources
```
GET /api/resources?type=ebook|journal|database|dictionary|encyclopedia|guide
GET /api/resources/:id
```

### Catalogue
```
GET /api/catalogue?q=search+term
Returns: [{ type: 'book'|'ebook'|'journal', id, title, author, category, available }]
```

### Requests
```
POST /api/request
Body: { userId, type: 'book_reservation'|'interlibrary_loan', title, author, resourceType, resourceId, reason }
```

### Questions
```
POST /api/questions
Body: { userId, question, category }
```

## Database Schema

### users
- `id`, `library_card_number`, `email`, `password`, `full_name`, `phone`, `user_type`, `department`, `registered_at`, `last_login`

### books
- `id`, `title`, `author`, `isbn`, `publisher`, `publication_year`, `description`, `copies_total`, `copies_available`, `available`, `created_at`

### resources
- `id`, `title`, `type` (ebook/journal/database/dictionary/encyclopedia/guide), `author`, `description`, `access_url`, `publisher`, `volume_issue`, `publication_date`, `provider`, `is_available`, `created_at`

### requests
- `id`, `user_id`, `type`, `title`, `author`, `resource_type`, `resource_id`, `reason`, `status`, `request_date`, `response_date`, `notes`

### questions
- `id`, `user_id`, `question`, `category`, `status`, `created_at`, `response`, `responded_at`

### access_logs
- `id`, `user_id`, `action`, `resource_type`, `resource_id`, `ip_address`, `user_agent`, `timestamp`

## Admin Features

The system tracks all user activity in `access_logs`:
- User logins
- Resource access (e-books, journals, databases, reference)
- Book reservations
- Interlibrary loan requests
- Help desk questions

Admins can query the database to monitor usage patterns and user engagement.

## Responsive Breakpoints

- Desktop: > 1024px (full grid layouts)
- Tablet: 768px - 1024px (sidebar stacks)
- Mobile: < 768px (single column, stacked elements)

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Font Awesome 6.5.0
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Additional**: CORS enabled for API access

## Notes

- Database is recreated on each server restart (development mode)
- All passwords stored in plain text (not production-ready)
- PDF URLs are simulated; actual file serving would require additional setup
- Images use Font Awesome icons as placeholders

## Future Enhancements

- [ ] Admin dashboard for managing resources and viewing logs
- [ ] Real PDF viewer integration
- [ ] Email notifications for requests
- [ ] Book cover image uploads
- [ ] Advanced search filters
- [ ] User profile management
- [ ] Reservation history
- [ ] Citation export

---

**Bugema University Library** – Empowering Education Through Accessible Knowledge
