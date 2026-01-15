# Environment Variables Setup Guide

## Quick Setup for Vercel

Copy these environment variables to your Vercel project settings:

### Required Variables

| Variable | Description | Example/Instructions |
|----------|-------------|---------------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@host:5432/dbname?sslmode=require` |
| `NEXTAUTH_URL` | Your app's URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | Generate: `openssl rand -base64 32` |
| `DEEPSEEK_API_KEY` | DeepSeek AI API key | Get from: https://platform.deepseek.com/ |
| `GEMINI_API_KEY` | Google Gemini API key | Get from: https://ai.google.dev/ |
| `ENABLE_SOCKET` | Disable Socket.io | Set to: `false` |

### Optional OAuth Variables

| Variable | Description | How to Get |
|----------|-------------|-----------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Same as above |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | [GitHub Settings](https://github.com/settings/developers) → OAuth Apps → New OAuth App |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | Same as above |

## How to Get API Keys

### DeepSeek API Key

1. Visit https://platform.deepseek.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)
6. Add billing information (pay-as-you-go)

**Pricing:** ~$0.14 per 1M input tokens, ~$0.28 per 1M output tokens

### Gemini API Key

1. Visit https://ai.google.dev/
2. Click "Get API Key" or "Get Started"
3. Log in with Google account
4. Go to API Keys section
5. Create a new API key
6. Copy the key

**Pricing:** Free tier available (60 requests per minute)

### NextAuth Secret

Generate a secure random string:

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Output example: `abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx==`

## Database Connection Strings

### Vercel Postgres
```
postgres://default:xxxxx@xxxx-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require
```

### Supabase
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxx.supabase.co:5432/postgres?sslmode=require
```

### Neon
```
postgres://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require
```

### Railway
```
postgresql://postgres:[PASSWORD]@[HOST].railway.app:[PORT]/railway?sslmode=require
```

### Local Development
```
postgresql://postgres:postgres@localhost:5432/slideai?schema=public
```

## Setting Environment Variables in Vercel

### Via Dashboard

1. Go to your project on Vercel
2. Click **Settings** tab
3. Click **Environment Variables** in sidebar
4. For each variable:
   - Enter **Key** (e.g., `DEEPSEEK_API_KEY`)
   - Enter **Value** (e.g., `sk-xxxxx`)
   - Select environments: Production, Preview, Development
   - Click **Save**
5. After adding all variables, click **Redeploy**

### Via CLI

```bash
# Set a single variable
vercel env add DEEPSEEK_API_KEY

# Pull environment variables
vercel env pull .env.local
```

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth client ID**
6. Application type: **Web application**
7. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-app.vercel.app/api/auth/callback/google
   ```
8. Copy **Client ID** and **Client Secret**
9. Add to Vercel environment variables

### GitHub OAuth

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **Application name:** SlideAI
   - **Homepage URL:** `https://your-app.vercel.app`
   - **Authorization callback URL:** `https://your-app.vercel.app/api/auth/callback/github`
4. Click **Register application**
5. Copy **Client ID**
6. Click **Generate a new client secret**
7. Copy **Client Secret**
8. Add to Vercel environment variables

## Environment-Specific Settings

### Development (.env.local)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/slideai"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-min-32-chars-abcdefg"
DEEPSEEK_API_KEY="sk-xxxxx"
GEMINI_API_KEY="xxxxx"
ENABLE_SOCKET="true"
```

### Production (Vercel)
```env
DATABASE_URL="postgres://vercel-connection-string"
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="production-secret-very-strong"
DEEPSEEK_API_KEY="sk-xxxxx"
GEMINI_API_KEY="xxxxx"
ENABLE_SOCKET="false"
```

## Troubleshooting

### Error: "Database connection failed"
- ✅ Check `DATABASE_URL` format
- ✅ Ensure `?sslmode=require` is included
- ✅ Verify database is running
- ✅ Check firewall rules allow Vercel IPs

### Error: "Invalid API key"
- ✅ Verify key is correct (no spaces)
- ✅ Check API key is active
- ✅ Ensure billing is set up (DeepSeek)
- ✅ Check API quotas not exceeded

### Error: "NextAuth configuration error"
- ✅ Verify `NEXTAUTH_URL` matches deployment URL
- ✅ Ensure `NEXTAUTH_SECRET` is at least 32 characters
- ✅ Check OAuth callback URLs are correct

### Error: "Missing environment variable"
- ✅ Verify variable is set in Vercel
- ✅ Check variable name spelling
- ✅ Redeploy after adding variables

## Security Best Practices

- ✅ Never commit `.env` files to git
- ✅ Use different API keys for dev and production
- ✅ Rotate secrets regularly
- ✅ Use strong `NEXTAUTH_SECRET` (32+ chars)
- ✅ Enable 2FA on API provider accounts
- ✅ Monitor API usage and costs
- ✅ Set spending limits on API accounts
- ✅ Use environment-specific database URLs

## Cost Monitoring

### DeepSeek API
- Monitor usage at: https://platform.deepseek.com/usage
- Set spending alerts
- Typical cost per presentation: ~$0.01-0.05

### Gemini API
- Monitor usage at: https://ai.google.dev/usage
- Free tier: 60 requests/minute
- Check rate limits

### Database
- Monitor connections in Vercel/provider dashboard
- Prisma uses connection pooling automatically
- Watch for connection leaks

---

**Ready to deploy?** Follow [VERCEL_CHECKLIST.md](./VERCEL_CHECKLIST.md) for step-by-step instructions!
