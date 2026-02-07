# Student Portfolio Builder (with AI Resume Parsing)

🚀 **Live Demo:** [https://portfolio-student-gecdahod.vercel.app/](https://portfolio-student-gecdahod.vercel.app/)

A professional portfolio builder for students that automatically creates a personal website by parsing their existing PDF resume. Built with Next.js, Supabase, and Google Gemini AI.

## 🌟 Key Features

### 1. **AI-Powered Resume Parsing**
- Upload a PDF resume, and the system automatically extracts:
  - Personal Information (Name, Bio, Title, Contact)
  - Education History
  - Work Experience
  - Projects (including Technologies)
  - **Achievements & Certifications**
  - Skills
- Powered by **Google Gemini 1.5 Flash** for high-accuracy data extraction.
- Uses `pdf-parse` for text extraction.

### 2. **Professional Dashboard**
- **Dynamic Forms**: Edit and refine your parsed data manually, including new sections for Social Links (LinkedIn, LeetCode, GitHub) and Achievements.
- **Profile Photo**: Upload and store profile pictures securely using Supabase Storage.
- **Visual Feedback**: Real-time loading states and success notifications.

### 3. **Public Portfolio Page**
- Automatically generates a public link for every user (e.g., `/[username]`).
- Clean, responsive design built with Tailwind CSS.
- SEO-optimized with proper metadata.

### 4. **Authentication & Security**
- **Multi-Method Login**:
  - Secure Email/Password via **Supabase Auth**.
  - **Social Login**: Google and GitHub OAuth integration.
  - **Phone Authentication**: SMS OTP login powered by Twilio.
- **Middleware Protection**: Redirects unauthenticated users from the dashboard and logged-in users from login pages.
- **Row Level Security (RLS)**: Users can only edit their own data.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+ (App Router), Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage), Twilio (SMS Provider)
- **AI**: Vercel AI SDK + Google Gemini API
- **Deployment**: Vercel

## 🚀 How It Works

1.  **Sign Up**: Create an account to get your personal dashboard.
2.  **Upload Resume**: Drag and drop your PDF resume.
    - The backend reads the PDF (`pdf-parse`).
    - The text is sent to Google Gemini with a structured schema prompt.
    - Gemini returns a JSON object with your experience, education, and skills.
3.  **Review & Save**: The form auto-fills with the AI data. You can edit any details or add a profile photo.
4.  **Save Portfolio**: Clicking "Save" updates your Supabase database entries.
5.  **Share**: Your public profile is instantly available at your unique URL.

## 📦 Local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Subodh3213G/student_portfolio.git
    cd student-portfolio
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**:
    Create a `.env.local` file in the root with:
    ```env
    # Supabase (Get from Project Settings > API)
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

    # Google AI (Get from aistudio.google.com)
    GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) to see the app.
