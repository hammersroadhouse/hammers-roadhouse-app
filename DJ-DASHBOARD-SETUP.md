# 🎸 Hammers Road House - DJ Dashboard Setup Guide

## Overview
The DJ Dashboard is a web-based interface that allows the DJ/host to view and manage song requests from listeners in real-time.

## Features
- ✅ View all song requests with album art
- ✅ Filter by status (Pending, Approved, Played)
- ✅ Approve pending requests
- ✅ Mark approved requests as played
- ✅ Delete any request
- ✅ Real-time stats (pending, approved, played counts)
- ✅ Auto-refreshes every 5 seconds

## Setup Instructions

### Step 1: Get Your Convex URL
1. Open `.a0/project-context.yaml` in your project
2. Find the `convex_url` field
3. Copy the URL (it looks like: `https://xxxxx.convex.cloud`)

### Step 2: Configure the Dashboard
1. Open `dj-dashboard.html` in a text editor
2. Find line 245: `const CONVEX_URL = "YOUR_CONVEX_URL";`
3. Replace `YOUR_CONVEX_URL` with your actual Convex URL from Step 1
4. Save the file

### Step 3: Deploy the Dashboard

**Option A: Simple File Serving**
1. Open `dj-dashboard.html` directly in your browser
2. Bookmark it for easy access

**Option B: Host on Netlify (Recommended)**
1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop `dj-dashboard.html`
3. Get your hosted URL instantly
4. Share this URL only with DJs/hosts

**Option C: Host on Vercel**
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel dj-dashboard.html`
3. Follow the prompts
4. Get your hosted URL

**Option D: Use GitHub Pages**
1. Create a new GitHub repository
2. Push `dj-dashboard.html` as `index.html`
3. Enable GitHub Pages in Settings
4. Access at: `https://yourusername.github.io/repo-name/`

## Usage

### Dashboard Interface

**Stats Cards (Top)**
- Shows counts for Pending, Approved, Played, and Total requests

**Filter Tabs**
- **All**: Show all requests
- **Pending**: Show only pending requests
- **Approved**: Show only approved requests
- **Played**: Show only played requests

**Request Cards**
Each card shows:
- Album artwork
- Song title and artist
- Album name and duration
- Who requested it
- Status badge (Pending/Approved/Played)
- Timestamp

**Actions**
- **Approve** (pending requests): Move to approved queue
- **Mark Played** (approved requests): Mark as played
- **Delete** (any request): Remove from database

### Workflow

1. **Listener submits request** → Shows as "Pending" in dashboard
2. **DJ approves** → Status changes to "Approved" (orange)
3. **DJ plays the song** → DJ clicks "Mark Played" → Status changes to "Played" (green)

## Security Notes

⚠️ **Important**: The dashboard has full access to your Convex backend. Only share the dashboard URL with trusted DJs/hosts.

**To add password protection:**
1. Host behind a password-protected service (Netlify with password, Vercel with auth)
2. Or add basic authentication to the HTML file
3. Or use Convex Auth to require DJ login (advanced)

## Troubleshooting

**"Error loading requests"**
- Check that your Convex URL is correct
- Ensure Convex is deployed (run `convex dev` in terminal)
- Check browser console for detailed errors

**Dashboard not updating**
- Refresh the page manually
- Check internet connection
- Verify Convex deployment is running

**Actions not working**
- Check browser console for errors
- Verify Convex functions are deployed
- Ensure you have the latest code

## Mobile App Integration

The mobile app (`screens/RequestScreen.tsx`) uses the same Convex backend:
- Listeners search Apple Music and submit requests
- Requests instantly appear in the DJ dashboard
- When DJ updates status, listeners see changes in "Your Requests" tab

## API Reference

**Convex Functions Used:**
- `api.requests.getAllRequests` - Fetch all requests
- `api.requests.updateRequestStatus` - Update request status
- `api.requests.deleteRequest` - Delete a request

## Customization

**Change auto-refresh interval:**
Line 380: `setInterval(loadRequests, 5000);`
Change `5000` (5 seconds) to your preferred interval in milliseconds

**Change colors:**
Modify the CSS variables in the `<style>` section
- Primary color: `#FF5722`
- Background: `#0F0F0F`
- Surface: `#1A1A1A`

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Convex deployment is running
3. Ensure mobile app can submit requests
4. Check that all Convex functions are synced

---

**Status**: ✅ Ready to use
**Last Updated**: 2024
