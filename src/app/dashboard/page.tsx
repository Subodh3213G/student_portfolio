import Link from 'next/link'
import DashboardClient from './dashboard-client'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch existing profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, experiences(*), projects(*), educations(*), achievements(*)')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        {profile?.username && (
           <Link 
             href={`/${profile.username}`} 
             target="_blank"
             className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium"
           >
             View Public Profile
           </Link>
        )}
      </div>
      <div className="h-full flex-1 flex-col space-y-8 flex">
         <p className="text-muted-foreground">
            Welcome back! Upload your resume to auto-fill your portfolio, or edit it manually below.
         </p>
         <DashboardClient initialData={profile || {}} />
      </div>
    </div>
  )
}
