# Poem writing app

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/manuel-viotors-projects/v0-poem-writing-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/sfmGZL4aFdO)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/manuel-viotors-projects/v0-poem-writing-app](https://vercel.com/manuel-viotors-projects/v0-poem-writing-app)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/sfmGZL4aFdO](https://v0.app/chat/sfmGZL4aFdO)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Supabase environment variables 🔧

This project uses Supabase for authentication, database, and storage.

You must configure a few environment variables for both the client (browser) and server (Node):

- NEXT_PUBLIC_SUPABASE_URL — the Supabase project URL (exposed to the browser)
- NEXT_PUBLIC_SUPABASE_ANON_KEY — the public anon key (exposed to the browser)
- SUPABASE_URL — same as the project URL (server-side)
- SUPABASE_ANON_KEY — the anon key for server-side usage (optional)
- SUPABASE_SERVICE_ROLE_KEY — the service role key used for administrative operations (required for creating users on the server)

Put these values in a `.env` during development or configure them in your hosting provider's environment settings.

An example `.env.example` is included in the repository — copy it to `.env` and fill in the values.

Note about Row-Level Security (RLS) and user creation
----------------------------------------------------

This project enables Row-Level Security on the `profiles` table and includes a policy that only allows inserts where `auth.uid() = id`. That protects user data but means the newly-created user (who isn't signed in yet) can't create their profile using the public/anon client.

During signup this app uses the server-side Admin (service-role) Supabase client to create the user account and write the initial `profiles` row — the admin client bypasses RLS and is required for that server-side flow. Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in your deployment environment so signup can create profiles successfully.

Error handling & developer logs
--------------------------------

This app avoids showing detailed internal or database errors to the user in the UI. Instead:

- Server / backend errors are logged to the server logs (console) for developers to inspect.
- Client code will log detailed errors to the browser console only while running in development mode (NODE_ENV=development).
- The user-facing UI always shows a short, generic message (e.g. "An unexpected error occurred. Please try again.") to avoid leaking sensitive internal info.

If you're debugging an issue locally, watch your terminal (dev server logs) or your browser console for the detailed error stack and payloads.

Developer overlay (dev only)
-----------------------------

This repository includes a small developer overlay that appears in the bottom-right when running in development (NODE_ENV=development). It exposes:

- Presence of critical server environment variables (boolean flags only — secrets are never shown)
- A live view of recent server-side errors and diagnostics captured in-memory (development only)

It is intended to make local debugging faster — the overlay is disabled in production and does not expose secrets.
