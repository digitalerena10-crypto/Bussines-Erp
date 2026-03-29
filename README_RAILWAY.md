# 🚀 Kinetic Vault ERP - Deployment Survival Guide

This document explains exactly how to fix the "Start and Crash" issue on Railway.

## 🛠 The Fix: Root Configuration
Your backend code is in the `/backend` subfolder. For Railway to find it, we added two files to your **ROOT** folder:
1.  **`railway.json`**: Tells Railway to use the Nixpacks builder and skip the Railpack error.
2.  **`package.json`**: Added a `start` script: `npm run migrate --prefix backend && npm start --prefix backend`.

## 🔑 Required Railway Variables (MUST ADD)
Go to your **Backend Service** -> **Variables** and add these EXACT names:

| NAME | VALUE |
| :--- | :--- |
| `DATABASE_URL` | Check the Postgres service and link it here. |
| `JWT_SECRET` | `s3cr3t_v4ult_k3y_for_3rp_2026` (Or any secret string) |
| `JWT_REFRESH_SECRET` | `r3fr3sh_v4ult_k3y_for_3rp_2026` |
| `CORS_ORIGIN` | `https://bussines-erp.vercel.app` (Your Vercel URL, **no trailing slash**) |
| `NODE_ENV` | `production` |

## 🚑 Troubleshooting "Crash on Start"
If you see `❌ Missing Required Keys`, it means you forgot to add one of the variables above.

If you see `❌ Migration failed`, check that your **PostgreSQL** service is "Active" (Green) in the Railway dashboard.

---

### 🌊 Force Sync Code to Railway
Run this one command in your terminal to ensure everything is clean:
```bash
git add .
git commit -m "fix: clean repo and production config v4"
git push origin main --force
```
