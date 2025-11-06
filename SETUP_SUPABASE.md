# 🚀 Supabase Setup Guide for Launchpad

## Current Status
Your `.env.local` file has placeholder values that need to be replaced with real Supabase credentials.

## Quick Setup (5 minutes)

### 1. Create Supabase Account & Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in or create a free account
3. Click **"New Project"**
4. Fill in:
   - **Name**: Launchpad (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Plan**: Free tier is perfect
5. Wait 2-3 minutes for initialization

### 2. Get Your Credentials

1. In your project dashboard, click **Settings** (gear icon) → **API**
2. Copy these values:

   **Project URL** (looks like):
   ```
   https://abcdefghijklmnop.supabase.co
   ```
   → This is your `NEXT_PUBLIC_SUPABASE_URL`

   **anon public key** (long string starting with `eyJ...`):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   **service_role key** (also long string):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   → This is your `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 3. Update .env.local

Open `/Users/ogowemr/whop-app/.env.local` and replace the placeholder values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

**Important:**
- Remove quotes around the URL if present
- No trailing slash on the URL
- Copy the keys exactly (they're very long)

### 4. Test Your Configuration

1. Open your Supabase URL in a browser:
   ```
   https://your-actual-project-id.supabase.co
   ```
   
2. You should see:
   - Supabase status page, OR
   - API documentation page
   
3. If it loads → ✅ Good!
   If it doesn't → Check if project is paused in dashboard

### 5. Restart Dev Server

After updating `.env.local`:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd ~/whop-app
npm run dev
```

### 6. Try Again

1. Go to http://localhost:3000/signup
2. Try creating an account
3. Should work now! 🎉

## Troubleshooting

### "Failed to fetch" Error
- Check Supabase URL format (must start with `https://` and end with `.supabase.co`)
- Verify project is active (not paused)
- Check internet connection
- Restart dev server after updating `.env.local`

### "Project paused" Error
- Go to Supabase Dashboard
- Check project status
- Resume if paused (free tier projects auto-pause after inactivity)

### CORS Issues
- Supabase should allow localhost:3000 by default
- If issues persist, check: Settings → API → CORS settings

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Check browser console for detailed error messages

## Free Tier Limits

- ✅ 500MB database storage
- ✅ 2GB bandwidth/month
- ✅ Unlimited API requests
- ✅ Perfect for development & small projects
