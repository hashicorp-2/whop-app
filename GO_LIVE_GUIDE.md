# 🚀 GO LIVE - Complete Deployment Guide

## Quick Start (5 Steps)

### Step 1: Prepare Your Environment Variables
You need these values ready before deploying:

```bash
# Get from Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Get from OpenAI Dashboard
OPENAI_API_KEY=sk-proj-your-key

# Get from Whop Developer Dashboard
WHOP_API_KEY=your-whop-key
NEXT_PUBLIC_WHOP_APP_URL=https://whop.com/marketplace/your-app
WHOP_WEBHOOK_SECRET=your-webhook-secret
```

### Step 2: Push Code to GitHub
```bash
cd /Users/ogowemr/whop-app

# Initialize git if not done
git init
git add .
git commit -m "Initial commit - Launchpad ready for production"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/whop-app.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Log In"
3. Click "Add New Project"
4. Import your GitHub repository
5. **Configure:**
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add ALL variables from Step 1
   - Set each to: Production, Preview, Development
7. Click "Deploy"

### Step 4: Wait for Build
- Build takes 2-5 minutes
- Watch the build logs
- If it fails, check the error and fix

### Step 5: Test Your Live Site
Your app will be at: `https://your-project.vercel.app`

Test:
- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard loads
- [ ] Trend selection works
- [ ] Product generation works

---

## Detailed Setup

### A. Supabase Setup

1. **Create Project:**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Name: `launchpad`
   - Password: Create strong password
   - Region: Choose closest to users
   - Wait 2-3 minutes

2. **Run Migrations:**
   - Go to SQL Editor
   - Run all SQL files from `supabase/migrations/` folder
   - Check Table Editor to verify tables exist

3. **Get Keys:**
   - Settings > API
   - Copy URL, anon key, service_role key

### B. Whop Setup

1. **Register App:**
   - Go to [dev.whop.com](https://dev.whop.com)
   - Create App
   - Save App ID

2. **Create Webhook:**
   - Settings > Webhooks
   - URL: `https://your-vercel-domain.vercel.app/api/webhooks/whop`
   - Events: Select all subscription events
   - Save webhook secret

3. **Create Listing:**
   - Create marketplace listing
   - Set pricing
   - Copy listing URL

### C. OpenAI Setup

1. **Get API Key:**
   - Go to [platform.openai.com](https://platform.openai.com)
   - API Keys section
   - Create new secret key
   - Copy immediately (won't show again)

2. **Add Credits:**
   - Billing section
   - Add payment method
   - Set usage limits

---

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables collected
- [ ] Code pushed to GitHub
- [ ] Supabase project created
- [ ] Whop app registered
- [ ] OpenAI API key ready
- [ ] Vercel account created

### Deployment
- [ ] Repository imported to Vercel
- [ ] Environment variables added
- [ ] Build successful
- [ ] Domain configured (optional)

### Post-Deployment
- [ ] Homepage loads
- [ ] Authentication works
- [ ] Database connected
- [ ] Product generation works
- [ ] Webhooks configured
- [ ] Error tracking setup

---

## Troubleshooting

### Build Fails
**Error:** "Missing environment variable"
- **Fix:** Add all required env vars in Vercel Settings

**Error:** "Module not found"
- **Fix:** Run `npm install` locally, commit `package-lock.json`

### App Doesn't Work
**Error:** "Failed to fetch" on login
- **Fix:** Check Supabase URL and keys are correct

**Error:** "OpenAI API error"
- **Fix:** Check API key is valid and has credits

### Database Issues
**Error:** "Invalid API key"
- **Fix:** Verify Supabase URL and keys match dashboard

**Error:** "Table not found"
- **Fix:** Run migrations in Supabase SQL Editor

---

## Custom Domain (Optional)

1. Go to Vercel Project > Settings > Domains
2. Add your domain
3. Follow DNS instructions
4. Wait for DNS propagation (5-30 minutes)

---

## Monitoring

### Set Up Logging
1. Vercel Dashboard > Logs
2. Monitor errors
3. Set up alerts

### Analytics
1. Install Vercel Analytics (optional)
2. Track user activity
3. Monitor performance

---

## Next Steps After Launch

1. **Test Everything:**
   - Login flow
   - Product generation
   - Payment flow
   - Webhooks

2. **Share Beta:**
   - Invite test users
   - Gather feedback
   - Fix issues

3. **Monitor:**
   - Watch error logs
   - Track usage
   - Optimize performance

4. **Iterate:**
   - Add features
   - Improve UX
   - Scale infrastructure

---

## Support Resources

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Whop API Docs](https://dev.whop.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

## 🎉 You're Live!

Your app is now accessible at: `https://your-project.vercel.app`

**Share it with the world!**

