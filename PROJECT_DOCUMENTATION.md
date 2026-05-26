# Bugema University Online Library Portal - Technical Documentation

## 1. Project Overview
The **Bugema University Online Library Portal** is a comprehensive, full-stack web application designed to digitize library services and resource management. It provides students, faculty, and researchers with a seamless interface to explore academic materials, apply for library services, and manage their library accounts.

## 2. System Architecture
The application follows a standard Client-Server architecture:
*   **Frontend:** Built using HTML5, CSS3, and Vanilla JavaScript (ES6+). It features a responsive design that adapts to mobile, tablet, and desktop screens.
*   **Backend:** Powered by Node.js and Express.js, providing a RESTful API for data management.
*   **Database:** Utilizes SQLite3 for lightweight, file-based relational data storage, tracking users, resources, service requests, and access logs.

## 3. Key Features

### 3.1 Authentication & User Management
*   **Library Card Generation:** Users can register to receive a unique library card number (e.g., LIB-123456).
*   **Secure Access:** Most services (E-book reading, physical book reservation) require users to be logged in, ensuring security and accountability.
*   **Role-Based Security:** Distinct roles for 'student' and 'faculty' (admin), with restricted access to management tools.

### 3.2 Resource Exploration
*   **Unified Catalogue Search:** A global search bar that queries physical books, e-books, journals, and databases simultaneously.
*   **E-Resources Grid:** Categorized browsing of digital materials with 12 academic categories.
*   **Integrated E-Book Reader:** An in-browser viewer using Google Docs Viewer for a professional PDF experience, supporting full-screen reading and downloads.
*   **Reference Materials:** Dedicated sections for Dictionaries, Encyclopedias, and Research Guides (APA, MLA, etc.).

### 3.3 User Interaction & Feedback
*   **Service Requests:** Users can request physical books, interlibrary loans, and borrowing/returns directly through forms.
*   **Help Desk (Q&A):** A portal for users to submit questions to library staff and receive tracked responses.
*   **Star Rating System:** A reusable UI component that allows users to rate their experience after submitting requests or questions, stored in the database for quality monitoring.

### 3.4 Library Services & Billing Logic
*   **Service Application Form:** An interactive form for requesting Printing, Photocopying, Book Binding, and Internet access.
*   **Auto-Calculator:** A real-time billing engine implemented in `app.js`. It automatically calculates total costs based on unit prices and quantity inputs (e.g., number of copies or internet plans).
*   **Payment Integration:** Supports simulated payment gateways for Mobile Money, Centenary Bank, and Absa Bank, including empty API hooks for future expansion.

### 3.5 Special Collections
*   **Archives & Rare Books:** Dedicated sections for historical documents like the 1862 Holy Bible and original university charters.
*   **University Publications:** A portal for faculty research papers and student theses.

### 3.6 Contact & Communication
*   **WhatsApp Integration:** Direct "Click-to-Chat" functionality on the contact page for immediate support.

## 4. Admin Panel Functionalities
The portal includes a robust administrative suite restricted to users with 'faculty' or 'admin' roles.

### 4.1 System Dashboard & Monitoring
*   **Live Analytics:** Real-time statistics showing Total Users, Active Users Today, Collection Size (Physical), and Digital Asset counts.
*   **Access Logs:** A centralized feed monitoring recent user activities, including logins, resource access, and form submissions for auditing.

### 4.2 User Management
*   **Account Control:** Admins can view all registered users, create new accounts manually, and block/unblock users for policy violations or suspicious activity.
*   **Restricted Access:** Blocked users are automatically denied login capability via the backend authentication logic.

### 4.3 Resource Management (Inventory CRUD)
*   **Physical Collection:** Add, edit, or delete physical books. Manage metadata like ISBN, Publisher, and total/available copies.
*   **Digital Assets:** Manage E-books, Journals, and Databases. Update access URLs, providers, and descriptions.
*   **Catalogue Search Explorer:** A specialized admin search tool to quickly locate any resource in the inventory for management actions.

### 4.4 Service & Inquiry Fulfillment
*   **Request Management:** Centralized view of all service applications (Printing, etc.), book reservations, and loans. Admins can approve requests and add internal notes.
*   **Help Desk Resolution:** staff can view open questions, type responses, and close tickets. Responses are immediately visible to users and logged.
*   **Feedback Review:** Admins can monitor user satisfaction via the star ratings associated with fulfilled requests.

## 5. Technical Implementation Details

### 5.1 Billing Calculator Logic
The billing logic is managed by the `updateCostSummary()` function. It uses event listeners (`input` and `change`) to detect user interaction. 
*   **Printing/Photocopying:** Total = (Unit Price) * (Quantity).
*   **Internet:** Selects a flat-rate plan price based on duration (Day, Week, Month, Year).

### 5.2 Dynamic Backgrounds
The `app.js` script manages the visual theme of the site by detecting the current URL path. It automatically switches background images and adjusts text colors (e.g., `white-text-theme`) to ensure high readability across different sections.

## 6. File Structure
```text
LIB_APP/
├── server.js               # Express server & API Endpoints
├── app.js                  # Frontend Logic & State Management
├── styles.css              # Global Responsive Styles
├── admin-resources.html    # Admin: Inventory Management
├── admin-login.html        # Restricted entry for administrators
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

## 7. Database Schema

### 7.1 `users` Table
Stores member details, encrypted passwords (simulated), and library card numbers.

### 7.2 `resources` Table
Stores metadata for e-books, journals, and databases, including access URLs.

### 7.3 `requests` & `questions` Tables
Tracks service applications, reservations, loans, and help desk tickets, including status and user ratings.

### 7.4 `access_logs` Table
Stores timestamps and metadata for every significant user action for admin review.

## 8. Installation & Setup
1.  **Dependencies:** Run `npm install express sqlite3 cors` in the project folder.
2.  **Start Server:** Run `node server.js`.
3.  **Access:** Open `http://localhost:5001/index.html` in any modern web browser.

## 9. Conclusion
The Bugema University Online Library Portal is a scalable solution that bridges the gap between traditional library services and modern digital expectations. Its modular code structure allows for easy addition of new payment APIs, resource categories, and administrative tools.

---
**Documentation Prepared By:** Gemini Code Assist
**Date:** 2025
**Project:** Bugema University Online Library Portal