# 📦 GitHub to Vercel - Step-by-Step Guide

## Part 1: Create GitHub Repository (If You Don't Have One)

### Option A: Create on GitHub Website
1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in:
   - **Repository name:** `whop-app` (or `launchpad`)
   - **Description:** "Launchpad - AI-powered product launch platform"
   - **Visibility:** Public or Private (your choice)
   - **DO NOT** check "Initialize with README" (you already have code)
4. Click **"Create repository"**
5. **Copy the repository URL** (you'll see it on the next page)
   - Example: `https://github.com/YOUR_USERNAME/whop-app.git`

### Option B: Create via GitHub CLI (if installed)
```bash
gh repo create whop-app --public --source=. --remote=origin --push
```

---

## Part 2: Push Your Code to GitHub

### If You DON'T Have a GitHub Repo Yet:

```bash
cd /Users/ogowemr/whop-app

# Check current status
git status

# Add all files (if not already added)
git add .

# Commit your changes
git commit -m "Ready for production deployment"

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/whop-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### If You ALREADY Have a GitHub Repo:

```bash
cd /Users/ogowemr/whop-app

# Check if remote exists
git remote -v

# If it shows your GitHub URL, just push:
git add .
git commit -m "Ready for production deployment"
git push origin main

# If no remote exists, add it:
git remote add origin https://github.com/YOUR_USERNAME/whop-app.git
git push -u origin main
```

---

## Part 3: Connect GitHub to Vercel

### Step 1: Sign Up/Login to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"** (recommended - easiest way)
4. Authorize Vercel to access your GitHub account

### Step 2: Import Repository
1. After logging in, you'll see your dashboard
2. Click **"Add New Project"** button (big button in the center)
3. You'll see a list of your GitHub repositories
4. **Find your repository** (`whop-app` or whatever you named it)
5. Click **"Import"** next to your repository

### Step 3: Configure Project
1. **Project Name:** Keep default or change (e.g., `launchpad`)
2. **Framework Preset:** Should auto-detect as **Next.js** ✅
3. **Root Directory:** Leave as `./` (default)
4. **Build Command:** Should show `npm run build` ✅
5. **Output Directory:** Should show `.next` ✅
6. **Install Command:** Should show `npm install` ✅

### Step 4: Add Environment Variables (IMPORTANT!)
**Before clicking Deploy**, click **"Environment Variables"** to expand it:

1. Click **"Add"** for each variable
2. Add these one by one:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
WHOP_API_KEY
NEXT_PUBLIC_WHOP_APP_URL
WHOP_WEBHOOK_SECRET
```

3. For each variable:
   - **Key:** The variable name (e.g., `OPENAI_API_KEY`)
   - **Value:** Your actual secret value (from `.env.local`)
   - **Environment:** Check all three boxes (Production, Preview, Development)

**OR** you can add them later in Settings, but it's easier now.

### Step 5: Deploy!
1. Click the big **"Deploy"** button
2. Wait 2-5 minutes for the build
3. Watch the build logs in real-time
4. When done, you'll see: ✅ **"Deployment successful"**

### Step 6: Get Your Live URL
1. After deployment, you'll see your live URL
2. It will be: `https://your-project-name.vercel.app`
3. Click it to visit your live app! 🎉

---

## Troubleshooting

### "Repository not found"
- Make sure you're logged into the correct GitHub account
- Make sure the repository exists and is accessible
- Try refreshing the Vercel page

### "Permission denied" when pushing
- Make sure you're authenticated with GitHub
- Try: `git push -u origin main --force` (only if safe)

### "Build failed"
- Check the build logs in Vercel
- Make sure all environment variables are set
- Check for TypeScript/compilation errors

### "Can't find repository"
- Make sure you clicked "Continue with GitHub" when signing up
- Go to Vercel Settings > Git and connect GitHub
- Refresh the import page

---

## Quick Reference

**Your GitHub repo URL format:**
```
https://github.com/YOUR_USERNAME/REPO_NAME.git
```

**Your Vercel deployment URL format:**
```
https://PROJECT_NAME.vercel.app
```

---

## Next Steps After Deployment

1. ✅ Test your live site
2. ✅ Update Whop webhook URL to your Vercel domain
3. ✅ Share with beta users
4. ✅ Monitor logs and errors

---

## 🎉 You're Done!

Your app is now live and will auto-deploy every time you push to GitHub!

