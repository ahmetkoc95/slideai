# SlideAI Deployment Guide for Vercel

## 📋 Prerequisites

Before deploying to Vercel, ensure you have:

1. **API Keys Ready**
   - DeepSeek API Key: https://platform.deepseek.com/
   - Gemini API Key: https://ai.google.dev/

2. **GitHub Repository**
   - Push your code to GitHub
   - Vercel will connect to this repository

3. **Vercel Account**
   - Sign up at https://vercel.com

## 🚀 Deployment Steps

### Step 1: Prepare Database

#### Option A: Vercel Postgres (Recommended)
1. Go to Vercel Dashboard > Storage
2. Create a new Postgres database
3. Copy the connection string (starts with `postgres://`)
4. Use this as your `DATABASE_URL`

#### Option B: External PostgreSQL
Use any PostgreSQL provider:
- Supabase: https://supabase.com
- Neon: https://neon.tech
- Railway: https://railway.app

### Step 2: Configure Environment Variables in Vercel

Go to your Vercel project settings > Environment Variables and add:

```env
# Database
DATABASE_URL=postgres://your-connection-string

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# AI API Keys
DEEPSEEK_API_KEY=your-deepseek-api-key
GEMINI_API_KEY=your-gemini-api-key

# Socket.io (disabled for Vercel)
ENABLE_SOCKET=false

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Step 3: Deploy to Vercel

#### Method 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Method 2: Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect Next.js settings
4. Add environment variables
5. Click "Deploy"

### Step 4: Verify Deployment

After deployment, test these features:
- ✅ Homepage loads
- ✅ User registration works
- ✅ User login works
- ✅ Create new presentation
- ✅ AI generates slides
- ✅ Slide editor functions
- ✅ Export to PPTX works

## 🔧 Build Configuration

The project is configured with:

- `vercel.json` - Vercel-specific settings
- `next.config.ts` - Next.js optimizations
- `package.json` - Build scripts including Prisma generation
- Socket.io disabled for serverless compatibility

## 📊 Database Migrations

Vercel will automatically run:
```bash
prisma generate && prisma db push
```

This creates all database tables on first deploy.

## ⚙️ Environment-Specific Settings

### Local Development
```bash
# Use local database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/slideai
NEXTAUTH_URL=http://localhost:3000
ENABLE_SOCKET=true

# Run with Socket.io
npm run dev:socket
```

### Vercel Production
```bash
# Uses Vercel Postgres
DATABASE_URL=postgres://vercel-connection-string
NEXTAUTH_URL=https://your-app.vercel.app
ENABLE_SOCKET=false

# Standard Next.js (no Socket.io)
npm run build
npm run start
```

## 🐛 Troubleshooting

### Build Fails
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run lint
```

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure database accepts connections from Vercel IPs
- Check SSL mode: `?sslmode=require`

### API Timeout Errors
- AI API calls may take time
- Vercel Hobby plan: 10s timeout
- Vercel Pro plan: 60s timeout
- Consider upgrading if needed

### Missing Environment Variables
- Check Vercel Dashboard > Settings > Environment Variables
- Ensure all required variables are set
- Redeploy after adding variables

## 🔐 Security Checklist

Before going live:
- ✅ Set strong `NEXTAUTH_SECRET`
- ✅ Use production database (not localhost)
- ✅ Enable SSL on database connection
- ✅ Keep API keys in environment variables (never in code)
- ✅ Set up OAuth providers for production
- ✅ Review CORS settings if using custom domain

## 📈 Post-Deployment

### Custom Domain
1. Go to Vercel project > Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to use custom domain

### Monitoring
- View logs: Vercel Dashboard > Logs
- Monitor performance: Vercel Analytics
- Set up error tracking (e.g., Sentry)

### Database Management
```bash
# View database
npx prisma studio

# Run migrations
npx prisma migrate deploy
```

## 🎯 Performance Tips

1. **Enable Vercel Analytics** (free tier available)
2. **Use Vercel Image Optimization** (configured in `next.config.ts`)
3. **Monitor API response times** (AI calls can be slow)
4. **Consider caching** for repeated AI requests
5. **Upgrade to Pro** if you need longer function timeouts

## 📝 Important Notes

### Socket.io Limitations
Real-time collaboration is **disabled** on Vercel by default because:
- Vercel uses serverless functions (no persistent connections)
- WebSockets require stateful servers

**Alternatives:**
- Use polling for updates
- Deploy Socket.io separately (e.g., Railway, Render)
- Use Vercel Edge Functions with WebSocket support (experimental)

### Database Connection Pooling
Vercel serverless functions can exhaust database connections. Prisma automatically uses connection pooling with `@prisma/adapter-pg`.

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- SlideAI Issues: Check project README

---

**Ready to deploy?** Follow the steps above and your SlideAI app will be live! 🚀
