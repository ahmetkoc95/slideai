#!/bin/bash

# SlideAI Quick Deployment Script
# This script helps you prepare for Vercel deployment

set -e  # Exit on error

echo "🚀 SlideAI Deployment Preparation"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the project root?${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Installing dependencies...${NC}"
npm install

echo ""
echo -e "${BLUE}🔧 Step 2: Generating Prisma client...${NC}"
npm run db:generate

echo ""
echo -e "${BLUE}🏗️  Step 3: Testing production build...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo ""
    echo -e "${RED}❌ Build failed. Please fix errors before deploying.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Deployment preparation complete!${NC}"
echo ""
echo "======================================"
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1. Get your API keys:"
echo "   • DeepSeek: https://platform.deepseek.com/"
echo "   • Gemini: https://ai.google.dev/"
echo ""
echo "2. Set up a database:"
echo "   • Vercel Postgres (recommended)"
echo "   • Or Supabase/Neon/Railway"
echo ""
echo "3. Deploy to Vercel:"
echo "   • Install CLI: npm i -g vercel"
echo "   • Run: vercel --prod"
echo "   • Or import via Vercel dashboard"
echo ""
echo "4. Add environment variables in Vercel:"
echo "   • DATABASE_URL"
echo "   • NEXTAUTH_URL"
echo "   • NEXTAUTH_SECRET"
echo "   • DEEPSEEK_API_KEY"
echo "   • GEMINI_API_KEY"
echo "   • ENABLE_SOCKET=false"
echo ""
echo -e "${BLUE}📖 For detailed instructions, see:${NC}"
echo "   • VERCEL_CHECKLIST.md - Step-by-step guide"
echo "   • ENV_SETUP.md - Environment variables"
echo "   • DEPLOYMENT.md - Complete guide"
echo ""
echo -e "${GREEN}🎉 Good luck with your deployment!${NC}"
