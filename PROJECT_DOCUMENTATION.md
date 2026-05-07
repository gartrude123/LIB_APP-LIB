# Bugema University Online Library Portal - Technical Documentation

## 1. Project Overview
The **Bugema University Online Library Portal** is a comprehensive, full-stack web application designed to digitize library services and resource management. It provides students, faculty, and researchers with a seamless interface to explore academic materials, apply for library services, and manage their library accounts.

## 2. System Architecture
The application follows a standard Client-Server architecture:
*   **Frontend:** Built using HTML5, CSS3, and Vanilla JavaScript (ES6+). It features a responsive design that adapts to mobile, tablet, and desktop screens.
*   **Backend:** Powered by Node.js and Express.js, providing a RESTful API for data management.
*   **Database:** Utilizes SQLite3 for lightweight, file-based relational data storage, tracking users, resources, and service requests.

## 3. Key Features

### 3.1 Authentication & User Management
*   **Library Card Generation:** Users can register to receive a unique library card number (e.g., LIB-123456).
*   **Secure Access:** Most services (E-book reading, physical book reservation) require users to be logged in, ensuring security and accountability.

### 3.2 Resource Exploration
*   **Unified Catalogue Search:** A global search bar that queries physical books, e-books, journals, and databases simultaneously.
*   **E-Resources Grid:** Categorized browsing of digital materials with 12 academic categories.
*   **Integrated E-Book Reader:** An in-browser PDF viewer that allows users to read online or download materials.

### 3.3 Library Services & Billing Logic
*   **Service Application Form:** An interactive form for requesting Printing, Photocopying, Book Binding, and Internet access.
*   **Auto-Calculator:** A real-time billing engine implemented in `app.js`. It automatically calculates total costs based on unit prices and quantity inputs (e.g., number of copies or internet plans).
*   **Payment Integration:** Supports simulated payment gateways for Mobile Money, Centenary Bank, and Absa Bank, including empty API hooks for future expansion.

### 3.4 Special Collections
*   **Archives & Rare Books:** Dedicated sections for historical documents like the 1862 Holy Bible and original university charters.
*   **University Publications:** A portal for faculty research papers and student theses.

### 3.5 Contact & Communication
*   **WhatsApp Integration:** Direct "Click-to-Chat" functionality on the contact page for immediate support.
*   **Help Desk:** A Q&A system allowing users to submit technical or academic inquiries.

## 4. Technical Implementation Details

### 4.1 Billing Calculator Logic
The billing logic is managed by the `updateCostSummary()` function. It uses event listeners (`input` and `change`) to detect user interaction. 
*   **Printing/Photocopying:** Total = (Unit Price) * (Quantity).
*   **Internet:** Selects a flat-rate plan price based on duration (Day, Week, Month, Year).

### 4.2 Dynamic Backgrounds
The `app.js` script manages the visual theme of the site by detecting the current URL path. It automatically switches background images and adjusts text colors (e.g., `white-text-theme`) to ensure high readability across different sections.

## 5. File Structure
```text
LIB_APP/
├── server.js               # Express server & API Endpoints
├── app.js                  # Frontend Logic & State Management
├── styles.css              # Global Responsive Styles
├── index.html              # Landing Page
├── books.html              # Resource Discovery Hub
├── services.html           # Services Landing Page
├── service application.html# Interactive Billing & Application Form
├── about.html              # Company Information
├── contact.html            # Centered Contact Form with WhatsApp Link
├── collections.html        # Special Collections Hub
├── library.db              # SQLite Database file
└── [Sub-pages]             # board.html, history.html, policies.html, etc.
```

## 6. Database Schema

### 6.1 `users` Table
Stores member details, encrypted passwords (simulated), and library card numbers.

### 6.2 `resources` Table
Stores metadata for e-books, journals, and databases, including access URLs.

### 6.3 `requests` & `questions` Tables
Tracks service applications, physical book reservations, and help desk tickets.

## 7. Installation & Setup
1.  **Dependencies:** Run `npm install express sqlite3 cors` in the project folder.
2.  **Start Server:** Run `node server.js`.
3.  **Access:** Open `http://localhost:5000/index.html` in any modern web browser.

## 8. Conclusion
The Bugema University Online Library Portal is a scalable solution that bridges the gap between traditional library services and modern digital expectations. Its modular code structure allows for easy addition of new payment APIs, resource categories, and administrative tools.

---
**Documentation Prepared By:** Gemini Code Assist
**Date:** 2025
**Project:** Bugema University Online Library Portal