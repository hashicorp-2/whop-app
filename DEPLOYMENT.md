# 🚀 Deployment Guide

Complete step-by-step guide to deploy **Launchpad** to production.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Supabase project created
- [ ] Whop app registered
- [ ] OpenAI API account with credits
- [ ] Vercel account

---

## 1️⃣ Create Supabase Project

### Step 1: Create Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details:
   - Name: `money-printer`
   - Database Password: Create a strong password
   - Region: Choose closest to users
4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

### Step 2: Run Database Migrations
1. Open your project in Supabase Dashboard
2. Navigate to: **SQL Editor**
3. Run migration files in order:

**Migration 1: Create Subscriptions Table**
```sql
-- Copy from: supabase/migrations/001_create_subscriptions_table.sql
-- Paste into SQL Editor and click "Run"
```

**Migration 2: Create Users & Generations Tables**
```sql
-- Copy from: supabase/migrations/002_create_users_generations.sql
-- Paste into SQL Editor and click "Run"
```

4. Verify tables created:
   - Go to: **Table Editor**
   - Should see: `users`, `generations`, `subscriptions`

### Step 3: Get API Keys
1. Go to: **Project Settings** > **API**
2. Copy these values:
   - **URL**: `https://your-project-id.supabase.co`
   - **anon public** key
   - **service_role** key (keep secret!)

---

## 2️⃣ Set Up Whop App

### Step 1: Register App
1. Go to [Whop Developer Dashboard](https://dev.whop.com)
2. Click "Create App"
3. Fill in app details
4. Save your App ID

### Step 2: Generate API Key
1. Go to: **Settings** > **API**
2. Click "Generate API Key"
3. Copy and save the key securely

### Step 3: Create Webhook
1. Go to: **Settings** > **Webhooks**
2. Click "Create Webhook"
3. Configure:
   - **URL**: `https://your-domain.com/api/whop-webhook`
   - **Events**: Select all subscription events:
     - `subscription.created`
     - `subscription.updated`
     - `subscription.cancelled`
4. Generate Webhook Secret
5. Copy secret securely

### Step 4: Create App Listing
1. Create your Whop marketplace listing
2. Set price to $19/month
3. Copy the listing URL (for NEXT_PUBLIC_WHOP_APP_URL)

---

## 3️⃣ Deploy to Vercel

### Step 1: Import Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Select your GitHub repository
4. Click "Import"

### Step 2: Configure Project
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `./`
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`
5. Click "Deploy" (we'll add env vars next)

### Step 3: Add Environment Variables
1. Go to project **Settings** > **Environment Variables**
2. Add each variable:

#### Required Variables:

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-YOUR_REAL_KEY

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Whop
WHOP_API_KEY=your_whop_api_key
WHOP_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_WHOP_APP_ID=your_app_id
NEXT_PUBLIC_WHOP_APP_URL=https://whop.com/marketplace/your-app
```

3. **For each variable**:
   - Key: variable name
   - Value: actual secret value
   - Environment: Select all (Production, Preview, Development)
4. Click "Save"

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Click the three dots on latest deployment
3. Click "Redeploy"
4. Wait for build to complete

---

## 4️⃣ Update Whop Webhook URL

1. Go back to Whop Developer Dashboard
2. **Settings** > **Webhooks**
3. Edit your webhook
4. Update URL to: `https://your-vercel-domain.com/api/whop-webhook`
5. Save

---

## 5️⃣ Post-Deployment Testing

### Authentication Flow
- [ ] Visit `/login` - should render login form
- [ ] Create test account - should redirect to `/experiences/test`
- [ ] Paywall shown for non-subscribed user
- [ ] Logout works

### Subscription Verification
- [ ] Generate product (should show 403 if not subscribed)
- [ ] Paywall appears for non-subscribers
- [ ] "Subscribe on Whop" button works

### Product Generation
- [ ] Login with subscribed test user
- [ ] Generate product - should work
- [ ] Check generation history in database
- [ ] Stats increment correctly

### Webhook Testing
- [ ] Create test subscription in Whop
- [ ] Check Supabase `subscriptions` table updated
- [ ] Verify HMAC signature validation works

### Rate Limiting
- [ ] Generate 10 products rapidly (should work)
- [ ] Try 11th - should get 429 error
- [ ] Wait 1 minute - should work again

### Dashboard
- [ ] Visit `/dashboard` - should load
- [ ] Shows correct user data
- [ ] Generation history displays

---

## 🔒 Security Checklist

### Environment Variables
- [ ] All secrets stored in Vercel (never in code)
- [ ] `.env.local` added to `.gitignore`
- [ ] No API keys in GitHub commits
- [ ] Service role key only used server-side

### Database
- [ ] RLS policies enabled on all tables
- [ ] Users can only read their own data
- [ ] Service role used for admin operations

### API Security
- [ ] All endpoints require authentication
- [ ] Rate limiting active
- [ ] Input validation on all inputs
- [ ] Error messages don't leak secrets

### Webhooks
- [ ] HMAC signature verification working
- [ ] Webhook URL uses HTTPS
- [ ] Webhook secret stored securely

---

## 🐛 Troubleshooting

### Build Fails
- **Error**: "Missing environment variable"
  - **Fix**: Add all required env vars in Vercel

### Database Connection Fails
- **Error**: "Invalid API key"
  - **Fix**: Check Supabase URL and keys are correct

### Whop Webhook Not Working
- **Error**: "Invalid signature"
  - **Fix**: Verify webhook secret matches in both places

### Authentication Fails
- **Error**: "Session not found"
  - **Fix**: Check Supabase anon key is correct

### Rate Limiting Too Aggressive
- **Error**: Users hitting limits too fast
  - **Fix**: Adjust `RATE_LIMIT_MAX` in `/api/generate-kit/route.ts`

---

## 📊 Monitoring

### Set Up Logging
1. Enable Vercel Logs
2. Monitor error rates
3. Set up alerts for 5xx errors

### Analytics
1. Install Vercel Analytics (optional)
2. Track key metrics:
   - Daily active users
   - Generation success rate
   - Subscription conversions

### Database Monitoring
1. Supabase Dashboard > Logs
2. Monitor query performance
3. Watch for slow queries

---

## 🔄 Updates & Maintenance

### Updating Code
1. Push changes to GitHub
2. Vercel auto-deploys
3. Test in preview environment
4. Promote to production

### Database Migrations
1. Create new migration file
2. Test locally
3. Run in Supabase SQL Editor
4. Deploy code changes

### Scaling
- **Current**: Single server, in-memory rate limit
- **Scale to**: Multiple servers, Redis rate limit
- **Cost**: Optimize OpenAI usage
- **Database**: Add connection pooling

---

## 📞 Support

### Resources
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Whop API Docs](https://dev.whop.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

### Common Issues
- Check Vercel build logs
- Check Supabase logs
- Test endpoints individually
- Verify env vars are set correctly

---

## ✅ Deployment Complete!

Your app should now be live at: `https://your-project.vercel.app`

**Next Steps:**
1. Run through testing checklist
2. Share with beta users
3. Monitor for issues
4. Iterate based on feedback

**Congratulations! 🎉**
