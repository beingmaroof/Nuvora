# Nuvora Deployment Guide

This guide will help you deploy Nuvora to production using Vercel or Netlify.

## Prerequisites

1. **Supabase Project Setup**
   - Create a Supabase account at https://supabase.com
   - Create a new project
   - Note your project URL and anon key from Settings > API

2. **Database Setup**
   - The following tables should already be created (check SQL schema):
     - `user_profiles`
     - `mood_entries`
     - `reflection_entries`
     - `user_favorites`
   - Ensure Row Level Security (RLS) is enabled on all tables
   - Verify authentication is properly configured

3. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

## PWA Icons

Before deployment, generate PWA icons:

1. Use the provided `icon.svg` in the `public` folder
2. Generate 192x192 and 512x512 PNG versions:
   - Use an online converter like https://cloudconvert.com/svg-to-png
   - Or use ImageMagick: 
     ```bash
     convert -background none -resize 192x192 public/icon.svg public/icon-192.png
     convert -background none -resize 512x512 public/icon.svg public/icon-512.png
     ```
3. Replace the generated files in the `public` folder

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**
   - Push your code to GitHub
   - Go to https://vercel.com
   - Click "New Project"
   - Import your repository
   - Configure:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Or Deploy via CLI**
   ```bash
   vercel
   # Follow the prompts
   # Add environment variables when prompted
   ```

4. **Configure Custom Domain** (Optional)
   - In Vercel dashboard, go to Settings > Domains
   - Add your custom domain and follow DNS configuration

### Option 2: Deploy to Netlify

1. **Install Netlify CLI** (optional)
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy via Netlify Dashboard**
   - Push your code to GitHub
   - Go to https://app.netlify.com
   - Click "Add new site" > "Import an existing project"
   - Connect to your Git repository
   - Configure:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add environment variables in Site settings > Environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click "Deploy site"

3. **Or Deploy via CLI**
   ```bash
   netlify deploy --prod
   # Follow the prompts
   ```

4. **Configure Redirects for SPA**
   - Create `public/_redirects` file with:
     ```
     /*    /index.html   200
     ```

## Post-Deployment Checklist

1. **Test Core Features**
   - [ ] User registration and login
   - [ ] Mood tracking with offline support
   - [ ] Daily reflections
   - [ ] Analytics dashboard
   - [ ] Quotes and favorites
   - [ ] Profile and settings
   - [ ] Data export/backup
   - [ ] Theme switching

2. **Test PWA Features**
   - [ ] Install PWA on mobile device
   - [ ] Test offline functionality
   - [ ] Verify notifications work
   - [ ] Check icon and splash screen
   - [ ] Test app updates

3. **Performance**
   - [ ] Run Lighthouse audit (aim for >90 on all metrics)
   - [ ] Test on slow 3G connection
   - [ ] Verify images are optimized
   - [ ] Check bundle size

4. **Security**
   - [ ] Verify RLS policies in Supabase
   - [ ] Check CORS settings
   - [ ] Ensure HTTPS is enabled
   - [ ] Review authentication flow

## Supabase Configuration

### Authentication Settings

1. Go to Authentication > URL Configuration in Supabase
2. Add your deployment URL to:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/**`

### Email Templates

Customize email templates in Authentication > Email Templates:
- Confirm signup
- Reset password
- Magic Link

### RLS Policies

Ensure these policies are active (examples):

```sql
-- User profiles - Users can only read/update their own profile
CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Mood entries - Users can only access their own entries
CREATE POLICY "Users can view own mood entries" 
  ON mood_entries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries" 
  ON mood_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Similar policies for reflection_entries and user_favorites
```

## Monitoring & Maintenance

1. **Error Tracking**
   - Consider adding Sentry or similar for error tracking
   - Monitor Supabase logs for database errors

2. **Analytics**
   - Add Google Analytics or Plausible for usage tracking
   - Monitor user engagement metrics

3. **Updates**
   - The PWA will auto-update when you deploy new versions
   - Users will see a prompt to reload for updates

## Troubleshooting

### Build Fails
- Verify all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run lint`
- Ensure environment variables are set

### PWA Not Installing
- Verify manifest.json is valid
- Check that icons exist (192x192 and 512x512)
- Ensure HTTPS is enabled
- Test in Chrome DevTools > Application > Manifest

### Database Errors
- Verify RLS policies are correct
- Check Supabase project status
- Review authentication token validity

### Offline Mode Not Working
- Clear browser cache and service worker
- Verify service worker registration in DevTools
- Check Network tab for failed requests

## Support

For issues or questions:
- Check the GitHub repository
- Review Supabase documentation: https://supabase.com/docs
- Vite PWA Plugin docs: https://vite-pwa-org.netlify.app/

---

**Happy Deploying! 🚀**
