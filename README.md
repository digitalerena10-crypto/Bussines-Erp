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
- **Database Architecture:** PostgreSQL
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
2. **Hardened RBAC Engine:** The database has been perfected to ensure `req.user` JWT payloads correctly authorize Super Admins for restricted `/api/admin/*` endpoints without throwing `403 Forbidden` errors.

---

## 🚀 A-to-Z Production Deployment Guide

This project is structured as a monorepo containing perfectly split `frontend/` and `backend/` directories. We use **Railway** for the Node.js API and **Vercel** for the React application.

### ☁️ Step 1: Deploy Backend to Railway

*Deploy the backend first to get the live API URL for your frontend.*

1. **Sign Up & Create Project:** Go to [Railway.app](https://railway.app/). Create a New Project -> **Deploy from GitHub repo**.
2. **Select Repository:** Choose your ERP repository.
3. **Configure Root Directory:** By default, Railway looks in the root folder. Go to your service's **Settings**, find **Root Directory**, and type `/backend`. This tells Railway to build the Node API from our clean folder.
4. **Provision Database (Optional if using Cloud):** Click **New** -> **Database** -> **Add PostgreSQL** if you want Railway to host your database.
5. **Set Environment Variables:** Go to the backend service's **Variables** tab and add exactly these keys:
   - `DATABASE_URL`: Add your Postgres connection string (Railway usually auto-links this).
   - `JWT_SECRET`: A secure random string (e.g., `super_secret_erp_key_2024`).
   - `JWT_REFRESH_SECRET`: Another secure random string.
   - `CORS_ORIGIN`: Leave this blank for now (We will add the Vercel URL here in Step 3!).
   - **Cloudinary Image Storage (Recommended):** Railway's local disk wipes randomly. To make uploads permanent, set these:
     - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name.
     - `CLOUDINARY_API_KEY`: Your Cloudinary API Key.
     - `CLOUDINARY_API_SECRET`: Your Cloudinary API Secret.
6. **Generate Domain:** Go to the backend **Settings** tab -> **Domains** -> click **Generate Domain**. Save this URL (e.g., `https://my-erp-backend.up.railway.app`).

### 🌍 Step 2: Deploy Frontend to Vercel

1. **Sign Up & Create Project:** Go to [Vercel.com](https://vercel.com/) -> **Add New** -> **Project**. Import your GitHub repository.
2. **Configure Framework & Root Directory:** 
   - Framework Preset: **Vite**
   - Root Directory: Click **Edit** and select the `frontend` directory.
3. **Set Environment Variables:** Expand the variables section BEFORE you click deploy, and add:
   - Name: `VITE_API_URL`
   - Value: `https://your-railway-url.railway.app/api` *(Paste your Railway domain and append `/api` to it!)*
   - Name: `VITE_RESOURCES_URL`
   - Value: `https://your-railway-url.railway.app` *(Just the Railway domain!)*
4. **Deploy:** Click **Deploy**. Vercel will build the React app and give you a live frontend URL (e.g., `https://my-erp-frontend.vercel.app`).

### 🔗 Step 3: Final Hookup (Connecting the Two)

1. Return to your **Railway** project dashboard and open your Backend service.
2. Go back to the **Variables** tab.
3. Add the Vercel URL you just created into the CORS configuration so the backend accepts its requests:
   - Name: `CORS_ORIGIN`
   - Value: `https://my-erp-frontend.vercel.app` *(Crucial: Ensure there is NO trailing slash!)*
4. Railway will automatically redeploy the backend with the new security rules.

**🎉 Congratulations! Your ERP system is fully live, secure, and production-ready.**