# Nuvora - Mood Journal & Daily Reflection PWA

<div align="center">
  <img src="public/icon.svg" alt="Nuvora Logo" width="120" height="120">
  <h3>Track your emotions, reflect daily, and foster personal growth</h3>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.4-purple)](https://vitejs.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
</div>

---

## 🌟 Features

### 📊 Mood Tracking
- **Multiple Daily Entries**: Log your mood multiple times throughout the day
- **Emoji-Based Selection**: Intuitive mood selection with expressive emojis
- **Color-Coded Categories**: Visual categorization (Happy, Sad, Anxious, Calm, etc.)
- **Intensity Levels**: Track mood intensity from 1-10
- **Notes & Context**: Add detailed notes to capture the full picture

### ✍️ Daily Reflection
- **Guided Prompts**: Thoughtful questions to encourage self-reflection
- **Smart Prompts**: AI-suggested prompts based on your mood patterns
- **Unlimited Entries**: Write as much or as little as you need
- **Rich Text Support**: Format your thoughts beautifully

### 💬 Inspirational Quotes
- **Curated Collection**: Handpicked quotes for motivation and inspiration
- **Favorites System**: Save quotes that resonate with you
- **Social Sharing**: Share quotes with friends and family
- **Daily Inspiration**: New quotes to brighten your day

### 📈 Analytics Dashboard
- **Mood Trends**: Visualize your emotional patterns over time
- **Insights & Statistics**: Understand your mood distribution
- **Streak Tracking**: See how consistent you've been with logging
- **Data Export**: Download your data in CSV/JSON format
- **Interactive Charts**: Beautiful visualizations with Recharts

### 👤 User Management
- **Secure Authentication**: Email/password with Supabase Auth
- **Profile Customization**: Personalize your profile
- **Theme Options**: Light and dark modes
- **Privacy Controls**: Manage your data retention preferences
- **Data Backup & Restore**: Never lose your journal entries

### 🔔 Reminders & Notifications
- **Daily Reminders**: Get notified to log your mood
- **Reflection Prompts**: Scheduled reminders for reflection time
- **Browser Notifications**: Stay on track with your journaling

### 📱 Progressive Web App
- **Offline Support**: Use the app even without internet
- **Auto-Sync**: Seamlessly sync when back online
- **Install on Mobile**: Add to home screen for app-like experience
- **Fast & Responsive**: Optimized performance with Vite

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase Account** (free tier works great)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nuvora.git
   cd nuvora
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Database**
   
   Run the following SQL in your Supabase SQL Editor:
   
   ```sql
   -- Create user_profiles table
   CREATE TABLE user_profiles (
     id UUID PRIMARY KEY REFERENCES auth.users(id),
     display_name TEXT,
     avatar_url TEXT,
     theme TEXT DEFAULT 'light',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create mood_entries table
   CREATE TABLE mood_entries (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     mood_emoji TEXT NOT NULL,
     mood_label TEXT NOT NULL,
     mood_category TEXT NOT NULL,
     mood_intensity INTEGER NOT NULL,
     notes TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create reflection_entries table
   CREATE TABLE reflection_entries (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     prompt TEXT NOT NULL,
     content TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create user_favorites table
   CREATE TABLE user_favorites (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     quote_id TEXT,
     type TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(user_id, quote_id, type)
   );

   -- Enable Row Level Security
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
   ALTER TABLE reflection_entries ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

   -- Create RLS Policies
   CREATE POLICY "Users can view own profile" ON user_profiles
     FOR SELECT USING (auth.uid() = id);
   
   CREATE POLICY "Users can update own profile" ON user_profiles
     FOR UPDATE USING (auth.uid() = id);
   
   CREATE POLICY "Users can insert own profile" ON user_profiles
     FOR INSERT WITH CHECK (auth.uid() = id);

   CREATE POLICY "Users can view own mood entries" ON mood_entries
     FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert own mood entries" ON mood_entries
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can update own mood entries" ON mood_entries
     FOR UPDATE USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can delete own mood entries" ON mood_entries
     FOR DELETE USING (auth.uid() = user_id);

   CREATE POLICY "Users can view own reflection entries" ON reflection_entries
     FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert own reflection entries" ON reflection_entries
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can update own reflection entries" ON reflection_entries
     FOR UPDATE USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can delete own reflection entries" ON reflection_entries
     FOR DELETE USING (auth.uid() = user_id);

   CREATE POLICY "Users can view own favorites" ON user_favorites
     FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert own favorites" ON user_favorites
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can delete own favorites" ON user_favorites
     FOR DELETE USING (auth.uid() = user_id);
   ```

5. **Generate PWA Icons**
   
   Open `generate-icons.html` in your browser and download the generated icons:
   - Save `icon-192.png` to `public/`
   - Save `icon-512.png` to `public/`

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:8080`

---

## 🏗️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom Components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: React Context + useReducer
- **Charts**: Recharts
- **PWA**: vite-plugin-pwa with Workbox
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner (Toast) + Browser Notification API
- **Date Handling**: date-fns

---

## 📁 Project Structure

```
nuvora/
├── public/               # Static assets
│   ├── icon.svg         # App icon (source)
│   ├── icon-192.png     # PWA icon 192x192
│   ├── icon-512.png     # PWA icon 512x512
│   └── favicon.ico      # Favicon
├── src/
│   ├── components/      # Reusable components
│   │   ├── mood/        # Mood-related components
│   │   ├── onboarding/  # First-time user flow
│   │   └── ui/          # UI primitives (buttons, cards, etc.)
│   ├── contexts/        # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # External service integrations
│   │   └── supabase/    # Supabase client & types
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   │   ├── Index.tsx    # Home/Dashboard
│   │   ├── Analytics.tsx
│   │   ├── Quotes.tsx
│   │   ├── Reflect.tsx
│   │   ├── Profile.tsx
│   │   ├── Settings.tsx
│   │   └── Auth.tsx
│   ├── services/        # Business logic services
│   │   ├── backupService.ts
│   │   ├── syncService.ts
│   │   └── notificationService.ts
│   ├── App.tsx          # App root component
│   └── main.tsx         # Entry point
├── .env.example         # Environment variables template
├── DEPLOYMENT.md        # Deployment guide
├── generate-icons.html  # PWA icon generator
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for:
- Vercel (recommended)
- Netlify
- Other hosting providers

Quick deploy to Vercel:
```bash
npm i -g vercel
vercel
```

---

## 🧪 Testing

### Run the production build locally
```bash
npm run build
npm run preview
```

### Check PWA functionality
1. Open Chrome DevTools
2. Go to Application tab
3. Check Manifest, Service Workers, and Cache Storage

---

## 📊 Features Checklist

- [x] User Authentication (Email/Password)
- [x] Mood Tracking with Multiple Daily Entries
- [x] Daily Reflection with Guided Prompts
- [x] Inspirational Quotes
- [x] Favorites System
- [x] Analytics Dashboard
- [x] Mood Trends Visualization
- [x] Streak Tracking
- [x] Data Export (CSV/JSON)
- [x] Data Backup & Restore
- [x] Theme Switching (Light/Dark)
- [x] Reminders & Notifications
- [x] Offline Support
- [x] Auto-Sync
- [x] PWA Installation
- [x] Profile Customization
- [x] Privacy Settings
- [x] Onboarding Flow
- [x] Mobile Responsive Design

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Icons and emojis from Unicode Emoji
- UI components inspired by Radix UI
- Charts powered by Recharts
- Backend infrastructure by Supabase
- Built with Vite and React

---

## 📞 Support

If you have any questions or run into issues:
- Check the [DEPLOYMENT.md](DEPLOYMENT.md) guide
- Review Supabase documentation
- Open an issue on GitHub

---

<div align="center">
  <p>Made with ❤️ for better emotional wellness</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
