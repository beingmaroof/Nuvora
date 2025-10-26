# 🔍 Troubleshooting White Screen Issue

If you're seeing a blank white screen, follow these steps:

## Step 1: Check Browser Console

1. **Open Browser DevTools**
   - Press `F12` or `Ctrl+Shift+I` (Windows)
   - Or Right-click → "Inspect"

2. **Go to Console tab**
   - Look for RED error messages
   - Look for these specific messages:
     - `🚀 Nuvora App Starting...`
     - `📍 Root element:`
     - `✅ App rendered successfully`

3. **Take a screenshot** of any errors you see

## Step 2: Check Network Tab

1. In DevTools, click **"Network"** tab
2. Refresh the page (`Ctrl+R`)
3. Look for any files that failed to load (shown in red)
4. Check if `main.tsx` loaded successfully

## Step 3: Clear Browser Cache

1. Press `Ctrl+Shift+Delete`
2. Select:
   - ✅ Cached images and files
   - ✅ Cookies and other site data
3. Click "Clear data"
4. **Close the browser completely**
5. Reopen and go to http://localhost:8081

## Step 4: Check If Server is Running

1. Look at the terminal/command prompt
2. You should see:
   ```
   VITE v5.4.19  ready in XXX ms
   ➜  Local:   http://localhost:8081/
   ```
3. If not, the server crashed

## Step 5: Common Errors & Solutions

### Error: "Cannot find module"
**Solution**: Run `npm install` again

### Error: "Supabase" or "Database" errors
**Solution**: You need to set up the database first
- Open Supabase dashboard
- Run the SQL from `SETUP_DATABASE.sql`

### Error: Blank white screen with NO console errors
**Possible causes**:
1. **CSS not loading** - Check if Tailwind CSS is working
2. **JavaScript disabled** - Check browser settings
3. **Ad blocker** - Try disabling
4. **Browser compatibility** - Use Chrome, Firefox, or Edge

## Step 6: Try Different Browser

Sometimes the issue is browser-specific:
- Try Chrome
- Try Firefox
- Try Edge
- Try Incognito/Private mode

## Step 7: Restart Everything

```bash
# Stop the server (Ctrl+C in terminal)

# Clear node modules and reinstall
rm -rf node_modules
npm install

# Start fresh
npm run dev
```

## Step 8: Check What You Should See

When the app loads correctly, you should see:
- Purple gradient background
- "Nuvora" logo/title
- Login form with:
  - Email input
  - Password input
  - "Sign In" and "Create Account" tabs
  - Google sign-in button

## Step 9: Report the Issue

If nothing works, please share:
1. Screenshot of browser console (F12 → Console tab)
2. Screenshot of the blank white screen
3. Your browser name and version
4. Any error messages from terminal

---

## Quick Diagnostic Checklist

- [ ] Server is running on port 8081
- [ ] Browser console shows no errors
- [ ] Network tab shows all files loaded
- [ ] Cache cleared
- [ ] Tried different browser
- [ ] Supabase database is set up
- [ ] `.env` file exists with Supabase credentials

---

**If you see console errors starting with "🚀 Nuvora App Starting...", the app is loading!**
**If you DON'T see ANY console messages, JavaScript isn't running at all.**
