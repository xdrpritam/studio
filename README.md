# UnMac | MAC Address Unblocker

This is a Next.js 15 application built with React, ShadCN UI, and Tailwind CSS.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Accessing the Admin Panel

Access to `/admin` is restricted via Firestore Security Rules. To grant yourself admin access:

1.  **Login** to the application.
2.  Navigate to `/admin`.
3.  Copy your **User UID** displayed on the Access Denied screen.
4.  Open the [Firebase Console](https://console.firebase.google.com/).
5.  Go to **Firestore Database**.
6.  Create a top-level collection named `roles_admin`.
7.  Add a document where the **Document ID** is your copied **UID**.
8.  Refresh the app. You will now see the "Admin" link in the navigation bar.

## Deployment

### Netlify (Recommended for ease of use)

1.  Push your code to GitHub.
2.  Connect the repository to Netlify.
3.  Netlify will automatically detect Next.js and use the included `netlify.toml` configuration.
4.  Deploy!

### Firebase App Hosting (Optimized for SSR)

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select **App Hosting** from the build menu.
3.  Connect your GitHub repository and follow the prompts.

## Features

- **MAC Unblock Request:** Easy form to submit device details for unblocking.
- **AI Troubleshooting:** Smart assistant to help diagnose connectivity issues.
- **Trial System:** 15-minute free trial for new users.
- **Dashboard:** Real-time monitoring of unblock status and session countdown.
- **Admin Panel:** Comprehensive overview of all user requests and inquiries.
- **Redeem Codes:** Dedicated voucher system for premium access activation.
