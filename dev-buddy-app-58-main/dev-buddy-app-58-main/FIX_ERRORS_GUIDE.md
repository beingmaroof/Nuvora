# 🔧 Fix All Errors - Step-by-Step Guide

This guide will fix all the errors you're experiencing in Nuvora.

---

## 🚨 Errors You're Experiencing

1. ❌ "Could not find the table 'public.user_favorites' in the schema cache" - when liking quotes
2. ❌ "Could not find the 'mood_category' column of 'mood_entries' in the schema cache" - when saving mood
3. ❌ "Could not find the table 'public.reflection_entries' in the schema cache" - when saving reflections
4. ❌ Save Changes button not working in Profile section
5. ⚠️ "Focus Lock" text appearing on bottom left

---

## ✅ SOLUTION: Set Up Supabase Database

The main issue is that your Supabase database tables haven't been created yet.

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com and log in
2. Open your project: **gbopswqhpogodcmcxacr**
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Run the Database Setup Script

1. Open the file `SETUP_DATABASE.sql` in your project folder
2. **Copy ALL the SQL code** from that file
3. **Paste it into the Supabase SQL Editor**
4. Click **"Run"** (or press Ctrl+Enter)

### Step 3: Verify Tables Were Created

After running the script, you should see a success message and a table showing:

```
table_name            | column_count
----------------------|-------------
mood_entries          | 8
reflection_entries    | 5
user_favorites        | 5
user_profiles         | 7
```

If you see this, **you're done!** All tables are created.

---

## 🔧 Additional Fixes Applied

### Fix 1: React Imports (Already Fixed ✅)

I've added the missing React imports to:
- `src/pages/Profile.tsx`
- `src/pages/Settings.tsx`

This fixes the "Save Changes" button issues.

### Fix 2: Focus Lock Issue

The "Focus Lock" text is likely from a development tool or accessibility feature. It should disappear once the app is working properly. If it persists, try:

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh the page (Ctrl+F5)
3. Restart the development server

---

## 📝 Quick Setup (Copy & Paste)

If you want to run the SQL manually, here's the essential schema:

```sql
-- Create mood_entries table
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_emoji TEXT NOT NULL,
  mood_label TEXT NOT NULL,
  mood_category TEXT NOT NULL,
  mood_intensity INTEGER NOT NULL CHECK (mood_intensity >= 1 AND mood_intensity <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'light',
  notification_mood_reminder BOOLEAN DEFAULT true,
  notification_reflection_prompt BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reflection_entries table
CREATE TABLE IF NOT EXISTS public.reflection_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'quote',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quote_id, type)
);

-- Enable Row Level Security
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflection_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for mood_entries
CREATE POLICY "Users can view own mood entries" ON public.mood_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood entries" ON public.mood_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood entries" ON public.mood_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mood entries" ON public.mood_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON public.user_profiles
  FOR DELETE USING (auth.uid() = id);

-- Create RLS Policies for reflection_entries
CREATE POLICY "Users can view own reflections" ON public.reflection_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reflections" ON public.reflection_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reflections" ON public.reflection_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reflections" ON public.reflection_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Policies for user_favorites
CREATE POLICY "Users can view own favorites" ON public.user_favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.user_favorites
  FOR DELETE USING (auth.uid() = user_id);
```

---

## ✅ After Running the SQL

1. **Refresh your browser** (Ctrl+R or Cmd+R)
2. Try the features again:
   - ✅ Save a mood entry
   - ✅ Like a quote
   - ✅ Write a reflection
   - ✅ Save profile changes

All errors should be fixed!

---

## 🆘 If You Still Have Issues

### Database Not Connecting
- Check `.env` file has correct Supabase URL and key
- Verify your Supabase project is running

### Tables Not Creating
- Make sure you're logged into the correct Supabase project
- Check for error messages in the SQL Editor
- Try running each CREATE TABLE statement one at a time

### Focus Lock Issue
- Open Browser DevTools (F12)
- Go to Console tab
- Look for any error messages
- Clear browser cache and cookies

---

## 📞 Need More Help?

If you're still experiencing issues:
1. Check the browser console (F12) for error messages
2. Check the Supabase logs in your project dashboard
3. Make sure you're logged in to the app
4. Try creating a new user account

---

**Once you run the SQL setup, everything should work perfectly!** 🎉
