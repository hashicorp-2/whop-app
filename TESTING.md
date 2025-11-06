# 🧪 Launchpad Testing Guide

## 🔗 Test Links (Local Development)

Once `npm run dev` is running, access:

### Main Routes

**🏠 Home Page:**
```
http://localhost:3000/
```
- Landing page with links to Dashboard
- Features overview
- Navigation to all sections

**📊 New Dashboard (Complete Flow):**
```
http://localhost:3000/dashboard
```
- Complete trend-to-product flow
- All new components integrated
- End-to-end user journey

**🔧 Legacy App:**
```
http://localhost:3000/experiences/test
```
- Original app interface
- Existing functionality preserved

**🔐 Authentication:**
```
http://localhost:3000/login
http://localhost:3000/signup
```

---

## 🧪 Testing the Complete Flow

### Step 1: Access Dashboard
1. Navigate to `http://localhost:3000/dashboard`
2. If not logged in, you'll be redirected to login

### Step 2: Set Your Goal
1. On first visit, Goal Intake Modal appears
2. Select a primary goal (Build App, Create Content, Sell Knowledge, Run Agency)
3. Click "Continue"

### Step 3: Explore Trends
1. Trend Radar loads personalized trends
2. Each trend shows:
   - Momentum score (color-coded)
   - Category & monetization window
   - Why it matters
   - Personalized product matches
3. Click a trend to select it

### Step 4: Generate Product Ideas
1. After selecting a trend, choose a product type
2. Click "Generate Product Ideas"
3. View Product Structure (left) and Marketing Playbook (right)
4. Option to regenerate if needed

### Step 5: Compile Blueprint
1. Click "Build Launch Blueprint"
2. Success modal appears
3. Blueprint displayed in tabbed interface:
   - Product tab: Overview, value, audience, pricing, launch hook
   - Marketing tab: All marketing angles
   - Visuals tab: Placeholder for generated assets
4. Export options: Download .MD or Export JSON

### Step 6: Deploy Campaign
1. Click "Deploy Campaign Now" from blueprint
2. Campaign assets generated:
   - Email templates (tab)
   - Social posts (tab)
   - Ad creatives (tab)
   - Visual prompts (tab)
3. Copy individual assets or regenerate sections

---

## 🔧 API Endpoints to Test

### Trends
```bash
# Get trends
GET http://localhost:3000/api/trends

# Refresh trends
POST http://localhost:3000/api/trends
Body: { "action": "refresh" }
```

### Personalization
```bash
# Personalize trends
POST http://localhost:3000/api/personalize-trends
Body: {
  "goal": "Build App",
  "trends": [...]
}
```

### Generate Ideas
```bash
POST http://localhost:3000/api/generate-ideas
Body: {
  "trendSummary": {...},
  "goal": "Build App",
  "productType": "App"
}
```

### Compile Blueprint
```bash
POST http://localhost:3000/api/compile-blueprint
Body: {
  "trend": {...},
  "productIdeas": {...},
  "marketingAssets": [...],
  "goal": "Build App",
  "productType": "App"
}
```

### Campaign Deployment
```bash
POST http://localhost:3000/api/campaign
Body: {
  "blueprint": {...}
}
```

### Metrics
```bash
GET http://localhost:3000/api/metrics
```

---

## 🐛 Troubleshooting

### Node.js Compatibility Issue

If you see:
```
dyld[1445]: Symbol not found: (__ZNSt3__122__libcpp_verbose_abortEPKcz)
```

**Solution:**
Your system has Node installed in two places:
- `/usr/local/bin/node` (broken - wrong libc++ version)
- `/Users/ogowemr/.nvm/versions/node/v24.11.0/bin/node` (working - via nvm)

**Fix:**
1. Make sure nvm Node is in PATH:
   ```bash
   export PATH="/Users/ogowemr/.nvm/versions/node/v24.11.0/bin:$PATH"
   ```

2. Or use nvm to activate:
```bash
   nvm use 24.11.0
   npm run dev
   ```

3. Or run directly with nvm Node:
   ```bash
   /Users/ogowemr/.nvm/versions/node/v24.11.0/bin/npm run dev
   ```

---

## ✅ Checklist

### Functionality
- [ ] Dashboard loads without errors
- [ ] Goal intake modal appears for new users
- [ ] Trends load and display correctly
- [ ] Trend selection works
- [ ] Product ideas generate successfully
- [ ] Blueprint compiles correctly
- [ ] Campaign assets generate
- [ ] Export functions work (JSON/MD)
- [ ] Copy-to-clipboard works
- [ ] Animations are smooth
- [ ] Error boundaries catch errors
- [ ] Empty states display correctly

### API Testing
- [ ] `/api/trends` returns trends
- [ ] `/api/personalize-trends` personalizes correctly
- [ ] `/api/generate-ideas` generates ideas
- [ ] `/api/compile-blueprint` compiles blueprint
- [ ] `/api/campaign` generates campaign assets
- [ ] `/api/metrics` returns metrics
- [ ] All endpoints handle errors gracefully

### UI/UX
- [ ] Responsive on mobile
- [ ] Colors match brand (Blue/Mint/Amber)
- [ ] Animations are smooth (Framer Motion)
- [ ] Loading states appear correctly
- [ ] Success modals show
- [ ] Error messages are clear

---

## 🚀 Quick Test Script

```bash
# Start dev server
npm run dev

# In another terminal, test endpoints:
curl http://localhost:3000/api/trends
curl -X POST http://localhost:3000/api/user-goals \
  -H "Content-Type: application/json" \
  -d '{"goals": ["Build App"], "primaryGoal": "Build App"}'
```

---

**Happy Testing! 🎉**
