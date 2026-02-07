# Deploying Student Portfolio to Vercel

## Prerequisites
- A GitHub account (where your code is pushed).
- A Vercel account (you can sign up with GitHub).

## Steps

1. **Log in to Vercel**
   - Go to [vercel.com](https://vercel.com) and log in.

2. **Add New Project**
   - Click **"Add New..."** -> **"Project"**.
   - Select **"Import"** next to your `student_portfolio` repository.

3. **Configure Project**
   - **Framework Preset**: Next.js (should be auto-detected).
   - **Root Directory**: `student-portfolio` (Important: if your code is inside a subdirectory, select it. Based on your structure, your `package.json` is inside `student-portfolio/`).
     - *Check:* If your repo root has `student-portfolio` folder, you must edit the Root Directory setting to `student-portfolio`.

4. **Environment Variables (Crucial!)**
   You must add the secret keys for the app to work. Copy these from your local `.env.local` file:

   | Name | Value source |
   |------|--------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key |
   | `GOOGLE_GENERATIVE_AI_API_KEY` | Your Gemini API Key |

   *Click "Add" for each variable.*

5. **Deploy**
   - Click **"Deploy"**.
   - Wait for the build to complete.

## Troubleshooting
- If you see *PDF Parsing* errors in production:
  - Check the Function Logs in Vercel.
  - Ensure the API keys are correct.

## Post-Deployment
- Update your **Supabase Auth Settings**:
  - Go to Supabase -> Authentication -> URL Configuration.
  - Add your new Vercel domain (e.g., `https://student-portfolio-xyz.vercel.app`) to **Site URL** and **Redirect URLs**.
