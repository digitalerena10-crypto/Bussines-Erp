# 🚀 Railway Backend Deployment Guide (UPDATED)

This repository has a completely clean, standard two-folder architecture. You no longer need complicated root-level scripts to make Railway work!

## ☁️ Step-by-Step Backend Deployment

1. **Push your code to GitHub.** Ensure the `backend/` and `frontend/` folders are pushed successfully.
2. **Go to [Railway.app](https://railway.app)** -> New Project -> **Deploy from GitHub repo**.
3. **Select your repository.**
4. **⚠️ CRITICAL - Update Root Directory:** 
   Railway usually looks at the root of a repository. Since your backend is cleanly stored in its own folder, you must tell Railway where it is:
   - Go to your Railway service's **Settings** tab.
   - Scroll down to **Root Directory**.
   - Type `/backend` and save.
   *(This tells Railway to use the `backend/package.json` and `backend/railway.json` automatically!)*
5. **Add a Postgres Database:** Click **New** -> **Database** -> **Add PostgreSQL**. Railway will automatically insert a `DATABASE_URL` variable for you.

## 🔑 Required Backend Variables (MUST ADD)
Go to your **Backend Service** -> **Variables** tab and add these exactly:

| NAME | VALUE |
| :--- | :--- |
| `JWT_SECRET` | `your_secure_secret_string_here` |
| `JWT_REFRESH_SECRET` | `your_refresh_secret_string_here` |
| `CORS_ORIGIN` | Wait to add this! First follow the Vercel steps in `README.md` to get your Vercel URL, then paste it here (e.g., `https://my-erp.vercel.app`). **NO TRAILING SLASH!** |
| `CLOUDINARY_CLOUD_NAME`| Your Cloudinary Cloud Name (Highly Recommended for permanent uploads) |
| `CLOUDINARY_API_KEY` | Your Cloudinary API Key |
| `CLOUDINARY_API_SECRET`| Your Cloudinary API Secret |

> NOTE: Do not manually set `PORT`. Railway manages ports dynamically!

## 📡 Get Your Live API URL
1. Go to your backend's **Settings** tab.
2. Under **Domains**, click **Generate Domain**.
3. Copy this URL! You will use this exact URL as the `VITE_API_URL` variable inside Vercel for your frontend deployment.

*(For full Vercel Frontend deployment steps, see the main `README.md` file located at the root of the project!)*
