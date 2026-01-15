# Vercel Deployment Checklist ✅

## Pre-Deployment Checklist

### 1. API Keys Ready
- [ ] DeepSeek API Key obtained from https://platform.deepseek.com/
- [ ] Gemini API Key obtained from https://ai.google.dev/
- [ ] API keys tested and working

### 2. Database Setup
Choose one option:

**Option A: Vercel Postgres** (Recommended)
- [ ] Created Vercel Postgres database
- [ ] Copied connection string
- [ ] Database URL starts with `postgres://`

**Option B: External Provider**
- [ ] Signed up for Supabase/Neon/Railway
- [ ] Created PostgreSQL database
- [ ] Connection string includes SSL (`?sslmode=require`)

### 3. GitHub Repository
- [ ] Code pushed to GitHub repository
- [ ] Repository is public or connected to Vercel account
- [ ] All changes committed

### 4. Vercel Account
- [ ] Signed up at https://vercel.com
- [ ] Email verified
- [ ] Ready to import project

## Deployment Steps

### Step 1: Import Project to Vercel
- [ ] Navigate to https://vercel.com/new
- [ ] Select "Import Git Repository"
- [ ] Choose your SlideAI repository
- [ ] Click "Import"

### Step 2: Configure Build Settings
Vercel should auto-detect these settings:

- [ ] **Framework Preset:** Next.js ✓
- [ ] **Build Command:** `npm run vercel-build` (or leave default)
- [ ] **Output Directory:** `.next` ✓
- [ ] **Install Command:** `npm install` ✓

### Step 3: Add Environment Variables
In Vercel project settings, add these variables:

#### Required Variables
- [ ] `DATABASE_URL` = `postgres://your-connection-string`
- [ ] `NEXTAUTH_URL` = `https://your-app.vercel.app` (update after deploy)
- [ ] `NEXTAUTH_SECRET` = Generate with: `openssl rand -base64 32`
- [ ] `DEEPSEEK_API_KEY` = Your DeepSeek API key
- [ ] `GEMINI_API_KEY` = Your Gemini API key
- [ ] `ENABLE_SOCKET` = `false`

#### Optional OAuth Variables (if using)
- [ ] `GOOGLE_CLIENT_ID` = Your Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` = Your Google OAuth secret
- [ ] `GITHUB_CLIENT_ID` = Your GitHub OAuth client ID
- [ ] `GITHUB_CLIENT_SECRET` = Your GitHub OAuth secret

### Step 4: Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Check build logs for any errors

### Step 5: Update NEXTAUTH_URL
After first deployment:
- [ ] Copy your Vercel deployment URL (e.g., `https://slideai-xyz.vercel.app`)
- [ ] Update `NEXTAUTH_URL` environment variable to this URL
- [ ] Redeploy the application

## Post-Deployment Verification

### Test Core Features
- [ ] Homepage loads without errors
- [ ] Can access `/auth/register` page
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard page loads
- [ ] Can create new presentation
- [ ] AI generation works (tests DeepSeek API)
- [ ] Slides are generated with content
- [ ] Slide editor loads and is interactive
- [ ] Can edit slide text
- [ ] Can add new slides
- [ ] Presentation mode works (full-screen)
- [ ] Export to PPTX downloads file
- [ ] Logout works

### Check for Errors
- [ ] View Vercel logs: Dashboard > Logs
- [ ] No database connection errors
- [ ] No API key errors
- [ ] No timeout errors
- [ ] No 500 server errors

### Performance Check
- [ ] Page load time < 3 seconds
- [ ] AI generation completes within 30 seconds
- [ ] Images load properly
- [ ] No console errors in browser

## Common Issues & Solutions

### Issue: Build Fails
**Solution:**
```bash
# Test build locally first
cd /Users/user/Desktop/slideai
npm run build

# Check for errors and fix them
npm run lint
```

### Issue: Database Connection Error
**Symptoms:** "Can't reach database server" or "Connection refused"

**Solutions:**
- [ ] Verify `DATABASE_URL` is correct
- [ ] Ensure SSL is enabled: `?sslmode=require`
- [ ] Check database allows Vercel IP connections
- [ ] Confirm database is running

### Issue: API Timeout
**Symptoms:** "Function exceeded maximum timeout"

**Solutions:**
- [ ] Check if AI API calls are responding slowly
- [ ] Upgrade to Vercel Pro for 60s timeout (vs 10s on Hobby)
- [ ] Add timeout handling in API routes
- [ ] Consider background job processing for long tasks

### Issue: Environment Variables Not Working
**Symptoms:** "API key not found" or "Unauthorized"

**Solutions:**
- [ ] Verify all required env vars are set in Vercel
- [ ] Check for typos in variable names
- [ ] Ensure no extra spaces in values
- [ ] Redeploy after adding variables

### Issue: NextAuth Errors
**Symptoms:** "Configuration error" or "Redirect error"

**Solutions:**
- [ ] Verify `NEXTAUTH_URL` matches your deployment URL
- [ ] Ensure `NEXTAUTH_SECRET` is set and strong
- [ ] Check OAuth provider credentials (if using)
- [ ] Update OAuth callback URLs in provider settings

### Issue: Images Not Loading
**Symptoms:** Broken image icons or 404 errors

**Solutions:**
- [ ] Check image URLs are absolute paths
- [ ] Verify `next.config.ts` has correct image domains
- [ ] Ensure images are in `public/` folder for static assets
- [ ] Check CORS settings for external images

## Optional: Custom Domain

### Add Custom Domain
- [ ] Go to Vercel project > Settings > Domains
- [ ] Add your domain (e.g., `slideai.com`)
- [ ] Update DNS records as instructed by Vercel
- [ ] Wait for DNS propagation (up to 24 hours)
- [ ] Update `NEXTAUTH_URL` to use custom domain
- [ ] Update OAuth callback URLs to use custom domain

### SSL Certificate
- [ ] Vercel automatically provisions SSL certificate
- [ ] Verify HTTPS is working
- [ ] HTTP redirects to HTTPS

## Security Review

### Production Security Checklist
- [ ] Strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Database uses SSL connection
- [ ] API keys stored in environment variables only
- [ ] No sensitive data in client-side code
- [ ] CORS configured properly
- [ ] Rate limiting considered for API routes
- [ ] OAuth providers configured for production URLs

## Monitoring & Maintenance

### Set Up Monitoring
- [ ] Enable Vercel Analytics (free tier)
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Monitor database connections
- [ ] Check API usage and costs

### Regular Maintenance
- [ ] Review Vercel logs weekly
- [ ] Monitor AI API usage and costs
- [ ] Backup database regularly
- [ ] Update dependencies monthly
- [ ] Review and optimize performance

## Success Criteria

Your deployment is successful when:
- ✅ All test cases pass
- ✅ No errors in Vercel logs
- ✅ Users can register and login
- ✅ AI generates presentations
- ✅ Export functionality works
- ✅ Performance is acceptable
- ✅ Custom domain working (if applicable)

## Next Steps After Deployment

1. **Share Your App** 🎉
   - Share the URL with users
   - Gather feedback
   - Monitor usage

2. **Iterate & Improve**
   - Add new features based on feedback
   - Optimize performance
   - Fix bugs

3. **Scale as Needed**
   - Upgrade Vercel plan if needed
   - Add caching for AI responses
   - Implement rate limiting

---

**Need Help?**
- 📖 Full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 📚 Vercel Docs: https://vercel.com/docs
- 💬 Issues: Create an issue on GitHub

**Ready to deploy?** Follow the checklist above! 🚀
