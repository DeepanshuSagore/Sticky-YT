# StickyYT

StickyYT is a minimal full-stack YouTube tracking app to help you intentionally manage what you're watching.

## Stack

- Next.js App Router
- Next.js Route Handlers (API)
- MongoDB + Mongoose
- Firebase Authentication (Google Sign-In)
- Tailwind CSS
- Three.js (`@react-three/fiber`) for subtle animated background

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create environment variables:

```bash
cp .env.example .env.local
```

3. Fill `.env.local` with your MongoDB and Firebase values.
4. Start development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

## Firebase Setup Notes

- In Firebase Console, enable **Authentication > Google**.
- Create a service account key and copy:
  - `project_id` -> `FIREBASE_PROJECT_ID`
  - `client_email` -> `FIREBASE_CLIENT_EMAIL`
  - `private_key` -> `FIREBASE_PRIVATE_KEY` (keep escaped `\n` newlines)
- Add matching public web app config keys for `NEXT_PUBLIC_FIREBASE_*`.

## Features

- Landing page with premium dark/red styling and subtle 3D animated background
- Firebase auth (signup, login, logout, persisted sessions)
- Protected app routes
- Add YouTube videos by URL with automatic metadata extraction
- Dashboard focused on adding and deleting videos
- Dedicated `ME` section to view videos with Watching/Watch Later toggle
- Organize videos into:
  - `Currently Watching`
  - `Watch Later`
- Open videos directly in YouTube and use `Watched?` to clear them
- User-scoped MongoDB storage using verified Firebase tokens

## API Endpoints

- `GET /api/videos`
- `POST /api/videos`
- `PATCH /api/videos`
- `DELETE /api/videos`
- `GET /api/youtube?url=...`
- `POST /api/auth/session`
- `DELETE /api/auth/session`
# Sticky-YT
