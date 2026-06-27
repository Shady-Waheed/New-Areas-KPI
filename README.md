# New Areas KPI

A production-ready event management and KPI tracking web application built with React, Vite, Firebase, and Tailwind CSS. Inspired by Google Calendar's clean, modern interface.

## Features

- **Authentication** — Email/password login and registration with approval workflow
- **Role Management** — User, Host, and Admin roles stored in Firestore
- **Calendar** — FullCalendar with Month, Week, and Day views
- **Event Management** — Create, view, edit, and delete events with supervision tracking
- **Color-coded Events** — Blue (my supervision), Green (volunteer supervision), Gray (no supervisor)
- **Comments** — Hosts and Admins can comment on events
- **Notifications** — Real-time in-app notifications with FCM push support
- **User Management** — Approve accounts, change roles, disable users
- **Filters** — Filter events by person, area, church, activity code, and date
- **Dark Mode** — Full dark mode support
- **Responsive** — Mobile-friendly layout with collapsible sidebar

## Tech Stack

- React 19 + Vite
- Tailwind CSS 4
- Firebase (Auth, Firestore, Storage, Cloud Messaging)
- React Router 7
- FullCalendar React
- React Hook Form
- Zustand
- React Hot Toast
- Lucide React icons

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

Copy the environment template and fill in your Firebase config:

```bash
cp .env.example .env
```

Enable these Firebase services in your project console:

- **Authentication** → Email/Password
- **Cloud Firestore**
- **Storage**
- **Cloud Messaging** (for push notifications)

### 3. Deploy Firestore rules and indexes

```bash
npm install -g firebase-tools
firebase login
firebase use your-project-id
firebase deploy --only firestore,storage
```

### 4. Create initial admin user

1. Register through the app UI
2. In Firebase Console → Firestore, find your user document
3. Set `approved: true` and `role: "admin"`

### 5. Run the development server

```bash
npm run dev
```

### 6. Build for production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── calendar/     # FullCalendar integration
│   ├── comments/     # Comment list and form
│   ├── common/       # Button, Input, Modal, etc.
│   ├── events/       # Event forms, filters, details
│   ├── layout/       # Header, Sidebar, UserMenu
│   └── notifications/# Bell icon and notification panel
├── pages/          # Route pages
├── layouts/        # Auth and Dashboard layouts
├── hooks/          # Custom React hooks
├── store/          # Zustand state stores
├── services/       # Firebase service layer
├── firebase/       # Firebase config and messaging
├── types/          # JSDoc type definitions
├── utils/          # Constants, formatters, helpers
└── routes/         # Route guards and configuration
```

## Firestore Collections

| Collection      | Description                    |
|-----------------|--------------------------------|
| `users`         | User profiles and roles (no area — area is on events only) |
| `events`        | Calendar events                |
| `comments`      | Event comments                 |
| `notifications` | User notifications             |

## User Roles

| Role  | Permissions                                              |
|-------|----------------------------------------------------------|
| User  | View own events, create events, read comments on own events |
| Host  | View all events, manage users, comment on any event      |
| Admin | Full access including role changes                       |

## Event Start Notifications

Event start-time notifications run client-side while the app is open. For reliable background notifications, deploy a Firebase Cloud Function with a scheduled trigger.

## Seed Data

An example seed script is provided at `scripts/seedData.js`. It requires Firebase Admin SDK credentials:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json
node scripts/seedData.js
```

## License

Private — All rights reserved.
# New-Areas-KPI
