# UnMac | MAC Address Unblocker

This is a Next.js 15 application built with React, ShadCN UI, and Tailwind CSS.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Deployment

### Firebase App Hosting (Recommended)

UnMac is optimized for **Firebase App Hosting**, which provides seamless deployment for Next.js applications with Server-Side Rendering (SSR).

1.  Push your code to a GitHub repository.
2.  Go to the [Firebase Console](https://console.firebase.google.com/).
3.  Select **App Hosting** from the build menu.
4.  Click **Get Started** and connect your GitHub repository.
5.  Follow the prompts to create a backend. Firebase will automatically handle the build and deployment process.

### Manual Deployment via Firebase CLI

If you prefer using the Firebase CLI for static hosting (or experimental framework support):

1.  Install the Firebase CLI: `npm install -g firebase-tools`
2.  Initialize Firebase in your project: `firebase init hosting`
3.  Build the application: `npm run build`
4.  Deploy: `firebase deploy`

## Features

- **MAC Unblock Request:** Easy form to submit device details for unblocking.
- **AI Troubleshooting:** Smart assistant to help diagnose connectivity issues.
- **Trial System:** 15-minute free trial for new users.
- **Dashboard:** Real-time monitoring of unblock status and session countdown.
- **Responsive Design:** Fully optimized for mobile and desktop devices.
