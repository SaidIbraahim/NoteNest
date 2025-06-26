# NoteNest Development Setup

Complete setup guide for the NoteNest SaaS application.

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- LemonSqueezy account (for payments)

## Quick Setup

### 1. Install Dependencies

```bash
# Install all dependencies (root + client + server)
npm run install:all

# Or install individually:
npm install          # Root dependencies
cd client && npm install   # Frontend dependencies
cd server && npm install   # Backend dependencies
```

### 2. Environment Setup

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Fill in your actual values in `.env`:
   - Supabase URL and Service Key
   - JWT Secret (generate a strong random string)
   - LemonSqueezy credentials

### 3. Database Setup ✅ COMPLETED
Set up your Supabase project:
- **Project ID**: `your_project_id`
- **URL**: `https://your_project_id.supabase.co`
- **Database Schema**: Create with `users` and `notes` tables

**You need to get your service key**:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/your_project_id/settings/api)
2. Copy the `service_role` key (not the `anon` key)
3. Add it to your `.env` file as `SUPABASE_SERVICE_KEY`

### 4. LemonSqueezy Setup

1. Create a product in LemonSqueezy
2. Get your checkout URL and webhook secret
3. Set up webhook endpoint: `https://your-domain.com/api/webhook`

### 5. Development

```bash
# Start both frontend and backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Database: Supabase (cloud)

### 6. Testing Webhooks

For local webhook testing, use ngrok:
1. Install ngrok: Download from https://ngrok.com
2. Start ngrok: `ngrok http 3000`
3. Update LemonSqueezy webhook URL to ngrok tunnel

## Project Structure

```
├── client/              # React frontend (Vite + TypeScript)
├── server/              # Express backend (Node.js + TypeScript)
├── supabase-schema.sql  # Database schema
├── env.example          # Environment template
└── README.md           # Project documentation
```

## Next Steps

1. Complete environment configuration
2. Test the application locally
3. Deploy to production (see README.md for deployment guide) 