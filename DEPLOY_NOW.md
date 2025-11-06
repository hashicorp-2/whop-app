# 🚀 DEPLOY NOW - Quick Checklist

## ✅ Pre-Flight Check

Before deploying, make sure you have:

### 1. Environment Variables Ready
- [ ] Supabase URL: `https://your-project.supabase.co`
- [ ] Supabase Anon Key
- [ ] Supabase Service Role Key
- [ ] OpenAI API Key
- [ ] Whop API Key
- [ ] Whop App URL
- [ ] Whop Webhook Secret

### 2. Accounts Created
- [ ] Vercel account (free tier works)
- [ ] GitHub account
- [ ] Supabase project created
- [ ] Whop app registered
- [ ] OpenAI account with credits

### 3. Code Ready
- [ ] All code committed to git
- [ ] No `.env` files committed (checked in `.gitignore`)
- [ ] No API keys in code
- [ ] Build works locally (optional, but recommended)

---

## 🚀 5-Minute Deployment

### Step 1: Push to GitHub (2 min)
```bash
cd /Users/ogowemr/whop-app

# Check what's changed
git status

# Add all changes
git add .

# Commit
git commit -m "Ready for production deployment"

# Push (if you already have a repo)
git push origin main

# OR create new repo on GitHub first, then:
# git remote add origin https://github.com/YOUR_USERNAME/whop-app.git
# git push -u origin main
```

### Step 2: Deploy to Vercel (3 min)
1. Go to: https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repo
4. Configure:
   - Framework: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Click "Deploy" (skip env vars for now)
6. Wait for build to complete

### Step 3: Add Environment Variables (5 min)
1. Go to: **Project Settings** > **Environment Variables**
2. Add each variable (copy from `.env.local` or your notes):

**Required Variables:**
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
   - **Key:** Variable name (e.g., `OPENAI_API_KEY`)
   - **Value:** Your actual secret value
   - **Environment:** Select all (Production, Preview, Development)
4. Click "Save"

### Step 4: Redeploy (1 min)
1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Click **"Redeploy"**
4. Wait for build

### Step 5: Test (2 min)
Your app is live at: `https://your-project.vercel.app`

Test:
- [ ] Visit homepage
- [ ] Try login
- [ ] Check dashboard loads
- [ ] Test trend selection

---

## 🐛 If Build Fails

### Common Issues:

**1. "Module not found"**
```bash
# Fix: Make sure package.json is committed
git add package.json package-lock.json
git commit -m "Add dependencies"
git push
```

**2. "Missing environment variable"**
- Add the missing variable in Vercel Settings > Environment Variables
- Redeploy

**3. "Build timeout"**
- Check if you have large dependencies
- Optimize build
- Contact Vercel support if needed

---

## 📝 Post-Deployment

### 1. Update Whop Webhook
- Go to Whop Developer Dashboard
- Settings > Webhooks
- Update URL to: `https://your-project.vercel.app/api/webhooks/whop`

### 2. Test Everything
- [ ] Login works
- [ ] Product generation works
- [ ] Database saves data
- [ ] Webhooks receive events

### 3. Share Your App
- Copy your Vercel URL
- Share with beta users
- Get feedback

---

## 🎉 You're Live!

Your app is now accessible at:
**https://your-project.vercel.app**

---

## Need Help?

1. Check Vercel build logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Test API endpoints individually

**You've got this! 🚀**

