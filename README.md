# 🚀 Launchpad

**Turn any trend into a ready-to-sell digital product in under 5 minutes.**

Launchpad is a SaaS application that helps Whop creators capitalize on trending topics by instantly generating complete, ready-to-sell digital products with optimized Whop listings.

---

## ✨ Features

### Core Functionality
- **AI-Powered Generation**: Transform trending keywords into complete product launch kits
- **Instant Listings**: Automatically generate Whop-optimized listing copy
- **Markdown Export**: Download product content as Markdown files
- **One-Click Copy**: Copy Whop listings to clipboard instantly

### Monetization
- **Whop Integration**: Full subscription verification via Whop API
- **Paywall**: Professional paywall for non-subscribers
- **Webhook Support**: Real-time subscription updates
- **Usage Tracking**: Generation history and statistics

### User Management
- **Authentication**: Secure email/password auth via Supabase
- **User Dashboard**: Profile, stats, and generation history
- **Rate Limiting**: 10 requests/minute, 100/month
- **Session Management**: Persistent login sessions

### Security & Performance
- **Authentication Required**: All protected routes secured
- **Input Validation**: Comprehensive request validation
- **Error Boundaries**: Graceful error handling
- **Performance Optimized**: Image optimization, compression
- **Security Headers**: Full suite of security headers

---

## 🏗️ Architecture

```
Frontend (Next.js 16)
├── App Router
│   ├── /experiences/[experienceId] - Main app
│   ├── /dashboard - User dashboard
│   ├── /login - Authentication
│   └── /signup - Registration
├── Components
│   ├── Paywall - Subscription gate
│   ├── ErrorBoundary - Error handling
│   └── GenerationHistory - History display
└── State Management
    └── React Hooks + Supabase

Backend (API Routes)
├── /api/generate-kit - Product generation
├── /api/user-dashboard - Dashboard data
├── /api/check-subscription - Whop verification
├── /api/verify-access - Access guard
└── /api/whop-webhook - Subscription events

Database (Supabase PostgreSQL)
├── users - User profiles & stats
├── generations - Generation history
└── subscriptions - Whop subscriptions

External Services
├── OpenAI (GPT-4 Turbo) - Content generation
├── Whop API - Subscription verification
└── Supabase Auth - Authentication
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account
- OpenAI API account
- Whop Developer account

### Local Development

1. **Clone & Install**
   ```bash
   git clone <your-repo>
   cd whop-app
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Database Setup**
   - Create Supabase project
   - Run SQL migrations:
     - `supabase/migrations/001_create_subscriptions_table.sql`
     - `supabase/migrations/002_create_users_generations.sql`

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Visit: `http://localhost:3000`

---

## 📁 Project Structure

```
whop-app/
├── app/
│   ├── api/
│   │   ├── generate-kit/
│   │   ├── user-dashboard/
│   │   ├── check-subscription/
│   │   ├── verify-access/
│   │   └── whop-webhook/
│   ├── dashboard/
│   ├── experiences/[experienceId]/
│   ├── login/
│   └── signup/
├── components/
│   ├── Paywall.tsx
│   ├── ErrorBoundary.tsx
│   └── GenerationHistory.tsx
├── lib/
│   ├── supabase-client.ts
│   ├── supabase-server.ts
│   ├── whop-sdk.ts
│   ├── database-service.ts
│   └── subscription-service.ts
├── supabase/
│   └── migrations/
├── .env.example
├── DEPLOYMENT.md
├── TESTING.md
└── README.md
```

---

## 🔐 Environment Variables

See `.env.example` for all required variables:

- **OpenAI**: `OPENAI_API_KEY`
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Whop**: `WHOP_API_KEY`, `WHOP_WEBHOOK_SECRET`, `NEXT_PUBLIC_WHOP_APP_ID`, `NEXT_PUBLIC_WHOP_APP_URL`

---

## 🧪 Testing

See `TESTING.md` for comprehensive testing guide covering:
- Authentication flow
- Product generation
- Rate limiting
- Subscription verification
- API endpoints
- Database integrity

Run tests before deployment!

---

## 🚢 Deployment

See `DEPLOYMENT.md` for complete deployment guide:

1. Create Supabase project & run migrations
2. Set up Whop app & webhook
3. Deploy to Vercel
4. Configure environment variables
5. Run testing checklist

---

## 📊 API Reference

### `POST /api/generate-kit`
Generate product from trending keyword.

**Request:**
```json
{
  "trend": "AI Christmas carols"
}
```

**Response:**
```json
{
  "productName": "...",
  "productDescription": "...",
  "productContent": "...",
  "whopListingCopy": "...",
  "stats": {
    "totalGenerations": 42,
    "monthlyGenerations": 15
  }
}
```

**Rate Limits:**
- 10 requests/minute
- 100 requests/month

### `GET /api/user-dashboard`
Get user dashboard data.

**Response:**
```json
{
  "profile": { ... },
  "stats": { ... },
  "history": [ ... ]
}
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: OpenAI GPT-4 Turbo
- **Monetization**: Whop API
- **Deployment**: Vercel
- **Analytics**: Built-in tracking

---

## 🔒 Security

- ✅ Authentication required for all protected routes
- ✅ Subscription verification before generation
- ✅ Rate limiting (10/min, 100/month)
- ✅ Input validation & sanitization
- ✅ HMAC webhook signature verification
- ✅ Row Level Security (RLS) on database
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ Environment variable protection
- ✅ Error message sanitization

---

## 📈 Roadmap

- [ ] Redis for distributed rate limiting
- [ ] Advanced analytics dashboard
- [ ] Product templates library
- [ ] Batch generation
- [ ] Email notifications
- [ ] A/B testing for prompts

---

## 🤝 Contributing

This is a production SaaS application. For issues or feature requests:
1. Open an issue
2. Describe the problem/feature
3. Include reproduction steps

---

## 📄 License

Proprietary - All rights reserved

---

## 🙏 Acknowledgments

- **OpenAI** - GPT-4 Turbo API
- **Whop** - Creator monetization platform
- **Supabase** - Backend infrastructure
- **Vercel** - Deployment platform
- **Next.js** - React framework

---

## 📞 Support

- **Documentation**: See `DEPLOYMENT.md` and `TESTING.md`
- **Issues**: Create a GitHub issue
- **Questions**: Contact support

---

**Built with ❤️ for creators who want to launch products**

🚀 **Launchpad** - From Idea to Income. Optimized.
