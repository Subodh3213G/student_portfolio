# Student Portfolio SaaS Instructions

## Setup Checklist

1. **Environment Variables**:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase URL and Anon Key.
   - Fill in your Google Generative AI API Key (for Resume Parser).

2. **Supabase Database Setup**:
   - Go to your Supabase Project Dashboard -> SQL Editor.
   - Open `supabase/schema.sql` from this repository.
   - Copy the content and run it in the Supabase SQL Editor.
   - This will create the `profiles`, `experiences`, `projects`, `educations` tables and set up Row Level Security (RLS) policies.
   - It also sets up a Trigger to automatically create a profile when a user signs up.

3. **Run the Project**:
   ```bash
   cd student-portfolio
   npm run dev
   ```

4. **Test Authentication**:
   - Go to `http://localhost:3000/signup`.
   - Create a new account.
   - Check Supabase `auth.users` and `public.profiles` to confirm user creation.

5. **Test Resume Parser**:
   - The API route is at `/api/resume/parse`.
   - You can test it using Postman or by implementing the frontend upload button in `src/app/dashboard/page.tsx`.

## Features Implemented
- **Authentication**: Login/Signup with Server Actions & Middleware.
- **Database Schema**: Comprehensive schema for student portfolios.
- **Whitelabel Public Profiles**: `/[username]` route with a clean layout (metadata optimized).
- **Dashboard**: Protected route structure.
- **Resume Parsing API**: Uses `pdf-parse` and Google Gemini AI to extract data.
