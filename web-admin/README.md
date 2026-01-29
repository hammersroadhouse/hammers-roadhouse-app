# 🎸 Hammers Road House - Admin Panel

A web-based admin control panel for managing your Hammers Road House app backend.

## Features

✅ **Real-time Dashboard**
- View total chat messages
- View total song requests
- Track active users (last 5 minutes)

✅ **Admin Controls**
- Clear all chat messages with one click
- Clear all song requests with one click
- Manual refresh button
- Auto-refresh every 5 seconds

✅ **Live Data Views**
- See all chat messages with timestamps
- See all song requests with song/artist info
- Sorted by most recent

## How to Use

### Option 1: Open Locally (Easiest)

1. Simply **double-click** the `index.html` file
2. It will open in your default browser
3. That's it! The admin panel is now running

### Option 2: Run with a Local Server

If your browser blocks the CDN imports (some security settings), use a local server:

**Using Python:**
```bash
# Python 3
cd web-admin
python -m http.server 8000

# Then open: http://localhost:8000
```

**Using Node.js:**
```bash
# Install http-server globally
npm install -g http-server

# Run server
cd web-admin
http-server -p 8000

# Then open: http://localhost:8000
```

**Using VS Code:**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

### Option 3: Deploy to the Web

Deploy to a hosting service for remote access:

**Vercel (Easiest):**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd web-admin
vercel
```

**Netlify:**
- Drag and drop the `web-admin` folder to [netlify.com/drop](https://app.netlify.com/drop)

**GitHub Pages:**
- Push to GitHub
- Enable GitHub Pages in repo settings
- Point to `web-admin` folder

## Admin Actions

### Clear All Chat Messages
1. Click "🗑️ Clear All Chat Messages"
2. Confirm the action
3. All chat messages will be deleted from the database
4. The chat will be empty for all users

### Clear All Requests
1. Click "🗑️ Clear All Requests"
2. Confirm the action
3. All song requests will be deleted
4. The request list will be empty for all users

### Refresh Data
- Click "🔄 Refresh Data" to manually refresh
- Data auto-refreshes every 5 seconds
- Auto-refresh pauses when tab is hidden (saves resources)

## Security Notes

⚠️ **Important:** This admin panel has **no authentication**. Anyone with access to the URL can:
- View all messages and requests
- Clear the chat
- Clear all requests

**Recommendations:**
1. **Don't deploy publicly** - Only run locally or on a private network
2. **Use password protection** - If deploying, add basic auth via your hosting service
3. **Restrict access** - Use firewall rules or VPN for remote access
4. **Add auth later** - Consider adding Convex authentication for production use

## Technical Details

- **Framework:** Vanilla JavaScript (no build step required)
- **Database:** Convex (https://resilient-warbler-266.convex.cloud)
- **Auto-refresh:** Every 5 seconds (pauses when tab hidden)
- **Convex API:** Uses ConvexHttpClient for queries/mutations

## Troubleshooting

**Admin panel won't load:**
- Check browser console for errors
- Make sure you have internet connection (CDN imports)
- Try running with a local server (Option 2)

**Data not loading:**
- Check Convex URL is correct in `admin.js`
- Verify Convex backend is running
- Check browser console for errors

**Clear buttons not working:**
- Check browser console for errors
- Verify Convex mutations exist
- Make sure you have internet connection

## File Structure

```
web-admin/
├── index.html      # Main HTML page
├── styles.css      # Styling (dark theme)
├── admin.js        # JavaScript logic + Convex client
└── README.md       # This file
```

## Support

For issues or questions, check the Convex dashboard:
- **Dashboard:** https://dashboard.convex.dev
- **Project:** Hammers Road House (radiolivestream907)

---

**Made for Hammers Road House** 🎸