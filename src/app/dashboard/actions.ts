'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // 1. Update Profile (Base Info)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        title: formData.title,
        bio: formData.bio,
        skills: formData.skills, 
        avatar_url: formData.avatar_url,
      })
      .eq('id', user.id)

    if (profileError) throw profileError

    // Helper to format dates
    const formatDateForDB = (dateStr: string | null | undefined) => {
        if (!dateStr) return null;
        // Check if date is in DD/MM/YYYY format
        const ddmmyyyy = /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/;
        const match = dateStr.match(ddmmyyyy);
        if (match) {
            return `${match[3]}-${match[2]}-${match[1]}`; // YYYY-MM-DD
        }
        // Try parsing as standard date
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
             return d.toISOString().split('T')[0];
        }
        return null; // Invalid date, store as null to avoid DB errors
    }

    // 2. Update Experiences
    await supabase.from('experiences').delete().eq('user_id', user.id)
    
    if (formData.experiences && formData.experiences.length > 0) {
       const experiencesToInsert = formData.experiences.map((exp: any) => ({
         user_id: user.id,
         company: exp.company,
         position: exp.position,
         start_date: formatDateForDB(exp.start_date),
         end_date: formatDateForDB(exp.end_date),
         description: exp.description
       }))
       const { error: experror } = await supabase.from('experiences').insert(experiencesToInsert)
       if (experror) throw experror
    }

    // 3. Update Educations
    await supabase.from('educations').delete().eq('user_id', user.id)
    if (formData.educations && formData.educations.length > 0) {
        const educationsToInsert = formData.educations.map((edu: any) => ({
            user_id: user.id,
            school: edu.school,
            degree: edu.degree,
            field_of_study: edu.field_of_study,
            start_date: formatDateForDB(edu.start_date),
            end_date: formatDateForDB(edu.end_date)
        }))
        const { error: eduError } = await supabase.from('educations').insert(educationsToInsert)
        if (eduError) throw eduError
    }

    // 4. Update Projects
    await supabase.from('projects').delete().eq('user_id', user.id)
    if (formData.projects && formData.projects.length > 0) {
        const projectsToInsert = formData.projects.map((proj: any) => ({
            user_id: user.id,
            name: proj.name,
            description: proj.description,
            url: proj.url,
            tags: proj.technologies || []
        }))
        const { error: projError } = await supabase.from('projects').insert(projectsToInsert)
        if (projError) throw projError
    }

    revalidatePath('/dashboard')
    revalidatePath(`/${user.user_metadata.username}`) // Revalidate public profile
    return { success: true }

  } catch (error: any) {
    console.error('Error updating profile:', error)
    return { error: error.message }
  }
}
