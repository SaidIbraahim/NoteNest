# NoteNest — Minimal SaaS Notes App

A minimal full-stack SaaS MVP where users can write and view private notes with a Pro plan upgrade system.

## Tech Stack

- **Frontend**: Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express (ESM)
- **Auth**: JWT (simple mock login)
- **Database**: Supabase (PostgreSQL)
- **Payments**: LemonSqueezy

## Features

- ✅ Email-only login (mock authentication)
- ✅ Private notes management
- ✅ Free plan (3 notes limit)
- ✅ Pro plan upgrade via LemonSqueezy
- ✅ Webhook-triggered plan upgrades
- ✅ Real-time plan enforcement

## Quick Start

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   Fill in your Supabase and LemonSqueezy credentials.

3. **Set up Supabase database**:
   Run the SQL schema in `supabase-schema.sql` in your Supabase SQL editor.

4. **Start development servers**:
   ```bash
   npm run dev
   ```

## Supabase Setup

Create these tables in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT now()
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

## LemonSqueezy Webhook

Set up a webhook endpoint pointing to: 
- **Development**: Use ngrok tunnel (see SETUP.md for details)
- **Production**: `https://your-domain.com/api/webhook`

Events supported:
- `subscription_created`
- `subscription_updated`
- `subscription_payment_success`
- `order_created`

## API Endpoints

- `POST /api/auth/login` - Mock login with email
- `GET /api/auth/me` - Get current user data
- `GET /api/notes` - Get user's notes
- `POST /api/notes` - Create new note (plan limits enforced)
- `DELETE /api/notes/:id` - Delete a note
- `GET /api/subscribe` - Get LemonSqueezy checkout URL
- `POST /api/webhook` - LemonSqueezy webhook handler
- `GET /health` - Server health check

## Project Structure

```
├── client/              # Vite frontend
│   ├── src/
│   │   ├── pages/        # Login & Notes pages
│   │   ├── contexts/     # Auth context
│   │   ├── services/     # API services
│   │   └── main.tsx
├── server/              # Express backend
│   ├── routes/          # API routes
│   ├── lib/             # Supabase client
│   ├── middleware/      # Auth & plan guards
│   └── index.ts
├── supabase-schema.sql  # Database schema
├── SETUP.md            # Detailed setup guide
└── README.md
```

## Demo

- **Free Plan**: Limited to 3 notes
- **Pro Plan**: Unlimited notes ($0.50/year for testing)
- **Payment Flow**: LemonSqueezy checkout → Webhook → Auto plan upgrade
- **Authentication**: Email-only mock login system

## Development

This project uses concurrent development with:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Database: Supabase PostgreSQL
- Webhooks: ngrok tunnel for local testing

See `SETUP.md` for detailed development setup instructions. 