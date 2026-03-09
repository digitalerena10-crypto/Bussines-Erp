# Global ERP — Business Management System

A modern, scalable, and enterprise-grade **Enterprise Resource Planning (ERP)** software suite designed to streamline business operations across various departments including Inventory, Sales, Purchasing, HR, and Accounting.

---

## 🌟 Key Features & Modules

### 1. Dashboard & Business Intelligence
- Real-time aggregation of Total Revenue, Total Sales, Active Products, and Employee Count.
- Interactive **Recharts** displaying Monthly Revenue trends and Sales pipelines.
- Live stream of recent transactions and critical stock level alerts.

### 2. Inventory Management
- Centralized tracking of Products, Categories, and global Stock levels.
- Automated Low-stock alerts and integrated Supplier cataloging.

### 3. Sales & Customer Relations (CRM)
- Customer tracking with Purchase Histories and associated Branch mapping.
- End-to-end Sales Order processing and status tracking (Pending, Processing, Completed).

### 4. Procurement & Supply Chain
- Supplier management with individual contact persons and tax identification.
- Purchase Order system for recording incoming stock and tracking goods receiving.

### 5. Human Resources (HR) & Payroll
- Complete Employee profiles including departments, designations, and join dates.
- Monthly Payroll generation tracking base salaries, bonuses, and deductions.
- Daily digital Attendance tracking.

### 6. Financial Accounting
- Standardized Chart of Accounts (Assets, Liabilities, Equity, Revenue, Expenses).
- Double-entry Journal transaction logs.

### 7. Global Administration & Security (RBAC)
- **Role-Based Access Control:** Configurable Permissions across 'Super Admin' and 'Admin' roles.
- **Audit Logs:** Immutable tracking of major administrative system actions.
- System Health monitoring and dynamic global Settings management (Currency, Timezones).
- **JWT Authentication:** Secure user sessions relying on HTTP-only capabilities and refresh token mechanisms.

### 8. Media Manager
- Centralized UI for managing attachments, product images, and company documents.

---

## 💻 Tech Stack

### Frontend (User Interface)
- **Framework:** React.js (v18) + Vite
- **Styling:** Tailwind CSS + custom glassmorphism & enterprise design tokens
- **Animations:** Framer Motion (60fps page transitions & micro-interactions)
- **Data Fetching:** TanStack React Query (real-time polling, background sync, caching)
- **Routing:** React Router v7 (Early adoption/Future flags enabled)
- **Charting:** Recharts

### Backend (API Services)
- **Runtime:** Node.js + Express.js
- **Database Architecture:** PostgreSQL (Currently running in an in-memory `mockDb.js` engine for zero-setup local development)
- **Security:** Helmet, CORS, Express Rate Limit, bcryptjs, xss-clean, hpp
- **Process Management:** PM2 (Persistent Background Execution)

### Deployment
- **Containerization:** Docker & Docker Compose (Production ready configurations included in `/frontend/Dockerfile` & `/backend/Dockerfile`)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- **PM2** (Process Manager). You can install it globally via `npm install -g pm2` or run it using `npx pm2`.

### 1. Install Dependencies
You need to install dependencies for both the frontend and backend.
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start the Backend Server (via PM2)
The backend API runs on **Port 5000** and is managed persistently in the background by PM2.

```bash
cd backend
npx pm2 start server.js --name "erp-backend"
```

> **Note:** Because PM2 keeps the backend running in the background, attempting to run `npm run dev` in the backend folder will result in an `EADDRINUSE:::5000` error. If you need to stop PM2 to run it manually, use `npx pm2 stop erp-backend`.

**Useful PM2 Commands for Backend:**
- View live logs: `npx pm2 logs erp-backend`
- Restart server: `npx pm2 restart erp-backend`
- Stop server: `npx pm2 stop erp-backend`
- View all PM2 processes: `npx pm2 list`

### 3. Start the Frontend Server (UI)
The frontend connects to the backend API and serves the dashboard.

**Standard Development Mode:**
```bash
cd frontend
npm run dev
```
Navigate to the URL provided in the terminal (usually `http://localhost:5173` or `http://localhost:5174`).

*(Optional) Start Frontend in Background via PM2:*
If you prefer to run the frontend persistently in the background like the backend:
```bash
cd frontend
npm run build
npx pm2 serve dist 5173 --name "erp-frontend" --spa
```

### 4. Default Admin Credentials
Access the application in your browser and log in with:
- **Email:** `admin@company.com`
- **Password:** `password123`

---

## 🛡️ Security State & "Zero-Error" Policy
As of the latest build, the application has undergone a **Zero-Error Polish**. 
This guarantees:
1. **Silent Browser Consoles:** Complete resolution of all React Router deprecation warnings and missing image DOM errors.
2. **Hardened RBAC Engine:** The mocked database has been perfected to ensure `req.user` JWT payloads correctly authorize Super Admins for restricted `/api/admin/*` endpoints without throwing `403 Forbidden` errors.
