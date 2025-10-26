# 🚀 Nuvora - Quick Start Guide

Get Nuvora up and running in 5 minutes!

## Prerequisites ✓

- Node.js 18+ installed
- A Supabase account (free: https://supabase.com)
- Modern web browser

## Step 1: Clone & Install (2 min)

```bash
# Clone the repository
cd nuvora  # or your project folder name

# Install dependencies
npm install
```

## Step 2: Set Up Supabase (2 min)

### 2.1 Create Supabase Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in project details
4. Wait for database to initialize (~2 minutes)

### 2.2 Run Database Setup
1. Open your Supabase project dashboard
2. Go to SQL Editor (left sidebar)
3. Click "New Query"
4. Copy the entire SQL schema from `README.md` (Section: "Set up Supabase Database")
5. Click "Run" to execute

### 2.3 Get API Credentials
1. Go to Settings > API
2. Copy your:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key (starts with `eyJhbGciOiJIUz...`)

## Step 3: Configure Environment (30 sec)

```bash
# Create environment file
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Run Development Server (30 sec)

```bash
npm run dev
```

Open http://localhost:8080 in your browser! 🎉

## Step 5: Test the App (1 min)

1. Click "Create Account"
2. Enter email and password
3. Check your email for confirmation link
4. Click confirmation link
5. Log in and start tracking your mood!

---

## 🎯 What to Try First

### Track Your First Mood
1. Click on a mood emoji on the homepage
2. Select intensity (1-10)
3. Add notes (optional)
4. Click "Save Mood"

### Write a Reflection
1. Tap "Reflect" in bottom navigation
2. Choose a prompt or write your own
3. Write your thoughts
4. Click "Save Reflection"

### View Analytics
1. Tap "Analytics" in bottom navigation
2. See your mood trends and statistics
3. Try exporting your data (CSV button)

### Get Inspired
1. Tap "Quotes" in bottom navigation
2. Browse inspirational quotes
3. Click the heart to favorite
4. Share with friends

---

## 🔧 Common Issues & Fixes

### "Cannot connect to Supabase"
- ✓ Check `.env` file has correct credentials
- ✓ Verify Supabase project is running
- ✓ Check internet connection

### "Email confirmation not received"
- ✓ Check spam folder
- ✓ Verify email in Supabase dashboard (Authentication > Users)
- ✓ Disable email confirmation in Supabase (Settings > Authentication > Email Auth > Disable email confirmation) for testing

### "Build fails"
- ✓ Run `npm install` again
- ✓ Delete `node_modules` and run `npm install`
- ✓ Check Node.js version: `node --version` (should be 18+)

### "PWA not installing"
- ✓ Generate PWA icons: Open `generate-icons.html` in browser
- ✓ Download icon-192.png and icon-512.png
- ✓ Place in `public/` folder
- ✓ Rebuild: `npm run build`

---

## 📱 Install as PWA

### On Desktop (Chrome/Edge)
1. Open the app in browser
2. Click the install icon (➕) in address bar
3. Click "Install"

### On iOS (Safari)
1. Open the app in Safari
2. Tap Share button (box with arrow)
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"

### On Android (Chrome)
1. Open the app in Chrome
2. Tap the three dots menu
3. Tap "Add to Home Screen" or "Install App"
4. Tap "Install"

---

## 🚀 Deploy to Production

### Option 1: Vercel (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

Or use the Vercel dashboard:
1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables
5. Deploy!

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

Or use Netlify dashboard:
1. Push code to GitHub
2. Go to https://app.netlify.com
3. Import repository
4. Add environment variables
5. Deploy!

**📖 For detailed deployment instructions, see `DEPLOYMENT.md`**

---

## 📚 Next Steps

- **Customize**: Update colors in `tailwind.config.ts`
- **Add Features**: Explore the codebase in `src/`
- **Monitor**: Set up error tracking (Sentry)
- **Analytics**: Add usage analytics (Google Analytics, Plausible)
- **Optimize**: Implement code splitting for better performance

---

## 📖 Documentation

- **README.md**: Complete project documentation
- **DEPLOYMENT.md**: Detailed deployment guide
- **PROJECT_SUMMARY.md**: Comprehensive project overview
- **PRODUCTION_CHECKLIST.md**: Pre-deployment verification
- **ICON_GENERATION.md**: PWA icon creation guide

---

## 🆘 Need Help?

- Check the documentation files above
- Review [Supabase Docs](https://supabase.com/docs)
- Review [Vite Docs](https://vitejs.dev)
- Review [React Docs](https://react.dev)

---

## ✅ Verification Checklist

Before deploying, make sure:
- [ ] Supabase project is set up
- [ ] Database tables are created
- [ ] Environment variables are set
- [ ] App runs locally: `npm run dev`
- [ ] Production build works: `npm run build && npm run preview`
- [ ] PWA icons are generated
- [ ] You can register and login
- [ ] You can track moods
- [ ] Analytics show data
- [ ] Offline mode works

---

**You're all set! Happy mood tracking! 😊**

*Estimated total setup time: ~5-10 minutes*
