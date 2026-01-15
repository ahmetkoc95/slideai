# SlideAI - AI-Powered Presentation Generator

Transform your ideas into stunning presentations with the power of AI. SlideAI uses DeepSeek for intelligent content analysis and Gemini for visual enhancements to create professional slideshows in minutes.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-7-green) ![Vercel](https://img.shields.io/badge/Vercel-Ready-black)

## ✨ Features

- 🤖 **AI-Powered Content Generation** - DeepSeek analyzes your input and structures it into professional slides
- 🎨 **Intelligent Visual Design** - Gemini suggests graphics and generates background images
- ✏️ **Interactive Slide Editor** - Drag, drop, resize, and edit slide elements in real-time
- 🎭 **Beautiful Animations** - 14+ animation types (fadeIn, zoomIn, bounceIn, etc.)
- 📊 **Multiple Layouts** - Title, content, two-column, image-focused, and more
- 📤 **Export to PowerPoint** - Download your presentations as .pptx files
- 🎯 **Presentation Mode** - Full-screen slideshow with keyboard navigation
- 🔐 **Authentication** - Secure login with credentials or OAuth (Google, GitHub)
- 💾 **Database Storage** - Save and manage unlimited presentations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- API keys:
  - [DeepSeek API Key](https://platform.deepseek.com/)
  - [Gemini API Key](https://ai.google.dev/)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd slideai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and database URL

# Generate Prisma client and push database schema
npm run db:generate
npm run db:push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📦 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL with Prisma 7
- **Authentication:** NextAuth.js v5
- **AI Services:** 
  - DeepSeek API (content analysis)
  - Google Gemini API (visual suggestions)
- **Animations:** Framer Motion
- **Export:** pptxgenjs
- **Icons:** Lucide React

## 🌐 Deployment

### Deploy to Vercel (Recommended)

SlideAI is optimized for Vercel deployment with serverless functions.

**Quick Deploy:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Important:** Set these environment variables in Vercel:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your production URL
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `DEEPSEEK_API_KEY` - Your DeepSeek API key
- `GEMINI_API_KEY` - Your Gemini API key
- `ENABLE_SOCKET=false` - Disable Socket.io for serverless

📖 **Full deployment guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md)

### Database Options

- **Vercel Postgres** (recommended for Vercel deployments)
- **Supabase** - Free PostgreSQL with generous limits
- **Neon** - Serverless PostgreSQL
- **Railway** - Simple database hosting

## 🎯 Usage

### Creating a Presentation

1. **Register/Login** - Create an account or sign in
2. **New Presentation** - Click "New Presentation"
3. **Add Content** - Enter text, upload images, or add reference links
4. **Generate** - Let AI analyze and create slides
5. **Edit** - Customize slides in the interactive editor
6. **Present** - Enter full-screen presentation mode
7. **Export** - Download as PowerPoint (.pptx)

### Editing Slides

- **Add Elements** - Click toolbar buttons to add text, images, or shapes
- **Move Elements** - Drag elements around the canvas
- **Resize** - Drag element corners to resize
- **Edit Text** - Double-click text to edit inline
- **Change Background** - Use theme picker for colors
- **Animations** - Select animation types for each element

### Keyboard Shortcuts

- `Cmd/Ctrl + S` - Save presentation
- `Arrow Keys` - Navigate slides (in present mode)
- `Escape` - Exit presentation mode
- `Delete` - Delete selected element

## 🛠️ Development

### Project Structure

```
slideai/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # Dashboard page
│   │   └── editor/       # Slide editor
│   ├── components/       # React components
│   │   ├── ui/           # UI components
│   │   ├── editor/       # Editor components
│   │   └── slides/       # Slide components
│   ├── lib/              # Utilities and configs
│   │   ├── auth.ts       # NextAuth config
│   │   ├── prisma.ts     # Prisma client
│   │   ├── deepseek.ts   # DeepSeek integration
│   │   └── gemini.ts     # Gemini integration
│   └── types/            # TypeScript types
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
└── package.json
```

### Available Scripts

```bash
# Development
npm run dev                # Start Next.js dev server
npm run dev:socket        # Start with Socket.io server

# Build
npm run build             # Build for production
npm run start             # Start production server

# Database
npm run db:generate       # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Create migration
npm run db:studio        # Open Prisma Studio

# Linting
npm run lint             # Run ESLint
```

### Environment Variables

Create a `.env` file with these variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/slideai"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# AI API Keys
DEEPSEEK_API_KEY="your-deepseek-api-key"
GEMINI_API_KEY="your-gemini-api-key"

# Socket.io (optional)
ENABLE_SOCKET="true"

# OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## 🔒 Security

- Passwords hashed with bcrypt
- JWT-based session management
- Secure OAuth integration
- Environment variables for secrets
- CSRF protection via NextAuth
- SQL injection prevention via Prisma

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [DeepSeek](https://www.deepseek.com/) - AI content analysis
- [Google Gemini](https://ai.google.dev/) - AI visual suggestions
- [Prisma](https://www.prisma.io/) - Database ORM
- [Vercel](https://vercel.com/) - Hosting platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations

## 📞 Support

Need help? Check out:
- [Deployment Guide](./DEPLOYMENT.md)
- [Issue Tracker](https://github.com/your-username/slideai/issues)
- [Discussions](https://github.com/your-username/slideai/discussions)

---

**Built with ❤️ using Next.js, TypeScript, and AI**
