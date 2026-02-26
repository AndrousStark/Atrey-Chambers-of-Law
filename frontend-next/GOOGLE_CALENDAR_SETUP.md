# Google Calendar Integration Setup Guide

This guide will help you connect your scheduling system to Google Calendar and send confirmation emails.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console
3. Vercel deployment (for environment variables)

## Step 1: Set Up Google Calendar API

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it (e.g., "Atrey Chambers Calendar")
4. Click "Create"

### 1.2 Enable Google Calendar API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

### 1.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External (unless you have Google Workspace)
   - App name: "Atrey Chambers"
   - User support email: your email
   - Developer contact: your email
   - Click "Save and Continue"
   - Scopes: Add `https://www.googleapis.com/auth/calendar`
   - Click "Save and Continue"
   - Test users: Add your email (for testing)
   - Click "Save and Continue"
4. Application type: "Web application"
5. Name: "Atrey Chambers Calendar Integration"
6. Authorized redirect URIs: Leave empty (we'll use service account instead)
7. Click "Create"
8. **Download the JSON file** - you'll need this!

### 1.4 Create a Service Account (Recommended for Server-Side)

For server-side integration without user interaction, use a Service Account:

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service account"
3. Name: "calendar-service"
4. Click "Create and Continue"
5. Role: "Editor" (or "Calendar Admin" if available)
6. Click "Continue" → "Done"
7. Click on the created service account
8. Go to "Keys" tab → "Add Key" → "Create new key"
9. Choose "JSON" → "Create"
10. **Download the JSON file** - this is your service account key!

### 1.5 Share Calendar with Service Account

1. Open [Google Calendar](https://calendar.google.com/)
2. Find your calendar (or create a new one for consultations)
3. Click the three dots next to your calendar → "Settings and sharing"
4. Under "Share with specific people", click "Add people"
5. Enter the service account email (found in the JSON file, looks like `calendar-service@project-id.iam.gserviceaccount.com`)
6. Permission: "Make changes to events"
7. Click "Send"

## Step 2: Set Up Email (Gmail SMTP)

### 2.1 Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled

### 2.2 Create App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Other (Custom name)"
3. Name it: "Vercel Schedule App"
4. Click "Generate"
5. **Copy the 16-character password** (you'll need this)

## Step 3: Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add the following variables:

### Required Variables:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----
GOOGLE_CALENDAR_ID=your-email@gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
ADMIN_EMAIL=abhishekatry@gmail.com
```

### How to get the values:

- **GOOGLE_SERVICE_ACCOUNT_EMAIL**: From the service account JSON file, field `client_email`
- **GOOGLE_PRIVATE_KEY**: From the service account JSON file, field `private_key` (keep the `\n` characters)
- **GOOGLE_CALENDAR_ID**: Your Gmail address or calendar ID (usually your email)
- **EMAIL_USER**: Your Gmail address
- **EMAIL_PASS**: The 16-character app password from Step 2.2
- **ADMIN_EMAIL**: Email where you want to receive notifications

### Important Notes:

- For `GOOGLE_PRIVATE_KEY`, copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Replace `\n` with actual newlines when pasting, or keep `\n` as-is (the code handles both)
- Make sure to add these to all environments (Production, Preview, Development)

## Step 4: Install Dependencies

The code will automatically install `googleapis` package. If you need to install manually:

```bash
cd frontend-next
npm install googleapis
```

## Step 5: Test the Integration

1. Deploy to Vercel
2. Fill out the schedule form on your website
3. Check:
   - Your Google Calendar for the new event
   - Your email inbox for the confirmation
   - The admin email for the notification

## Troubleshooting

### "Calendar not found" error
- Make sure you shared the calendar with the service account email
- Verify `GOOGLE_CALENDAR_ID` is correct

### "Invalid credentials" error
- Check that `GOOGLE_PRIVATE_KEY` includes the full key with newlines
- Verify the service account JSON was copied correctly

### Email not sending
- Verify `EMAIL_PASS` is the App Password (not your regular password)
- Check that 2-Factor Authentication is enabled
- Ensure `EMAIL_USER` is correct

### "Insufficient permissions" error
- Make sure the service account has "Editor" role in Google Cloud
- Verify the calendar is shared with the service account email

## Security Notes

- Never commit the service account JSON or app passwords to git
- Use Vercel environment variables for all secrets
- Regularly rotate your app passwords
- Consider using a dedicated calendar for consultations

