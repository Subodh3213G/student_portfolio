'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from './actions'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Define interfaces for our state
interface Experience {
  id?: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
}

interface Project {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  url: string;
  github_url: string;
}

interface Education {
  id?: string;
  school: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
}

interface Achievement {
  id?: string;
  title: string;
  issuer: string;
  date: string; // Issue date
  description: string;
  url: string;
}

export default function DashboardClient({ initialData }: { initialData: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [profile, setProfile] = useState({
    full_name: initialData?.full_name || '',
    title: initialData?.title || '',
    bio: initialData?.bio || '',
    skills: initialData?.skills?.join(', ') || '',
    github_link: initialData?.social_links?.github || '',
    linkedin_link: initialData?.social_links?.linkedin || '',
    leetcode_link: initialData?.social_links?.leetcode || '',
    phone: initialData?.social_links?.phone || '',
    display_email: initialData?.social_links?.email || initialData?.email || '',
    avatar_url: initialData?.avatar_url || '',
  })

  // Arrays for complex fields
  const [experiences, setExperiences] = useState<Experience[]>(initialData?.experiences || [])
  const [projects, setProjects] = useState<Project[]>((initialData?.projects || []).map((p: any) => ({
    ...p,
    technologies: p.tags || p.technologies || [] // Map DB 'tags' to UI 'technologies'
  })))
  const [educations, setEducations] = useState<Education[]>(initialData?.educations || [])
  const [achievements, setAchievements] = useState<Achievement[]>(initialData?.achievements || [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    
    setParsing(true)
    const formData = new FormData()
    formData.append('file', e.target.files[0])

    try {
      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to parse resume')
      }
      
      const data = await response.json()
      
      // Merge parsed data into state
      setProfile(prev => ({
        ...prev,
        full_name: data.full_name || prev.full_name,
        title: data.title || prev.title,
        bio: data.bio || prev.bio,
        skills: data.skills?.join(', ') || prev.skills,
        // TODO: map email or specific social links if parsed
      }))
      
      if (data.experiences) setExperiences(data.experiences)
      if (data.projects) setProjects(data.projects)
      if (data.educations) setEducations(data.educations)
      if (data.achievements) setAchievements(data.achievements)
      
      console.log('Parsed Data:', data)
      alert('Resume parsed successfully! Please review the extracted data.')
    } catch (error) {
       console.error(error)
       alert('Error parsing resume. Please try again.')
    } finally {
       setParsing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = {
      ...profile,
      skills: profile.skills.split(',').map((s: string) => s.trim()),
      experiences,
      projects: projects.map(p => ({ ...p, technologies: Array.isArray(p.technologies) ? p.technologies : [] })),
      educations,
      achievements,
    }

    const result = await updateProfile(formData)
    
    setLoading(false)
    if (result.error) {
      alert('Error updating profile: ' + result.error)
    } else {
      alert('Profile updated successfully!')
      router.refresh()
    }
  }

  // Helper to add empty items
  const addExperience = () => {
    setExperiences([...experiences, { company: '', position: '', start_date: '', end_date: '', description: '' }])
  }
  const addProject = () => {
    setProjects([...projects, { name: '', description: '', technologies: [], url: '', github_url: '' }])
  }
  const addEducation = () => {
    setEducations([...educations, { school: '', degree: '', field_of_study: '', start_date: '', end_date: '' }])
  }
  const addAchievement = () => {
    setAchievements([...achievements, { title: '', issuer: '', date: '', description: '', url: '' }])
  }

  // Helper to remove items
  const removeExperience = (index: number) => setExperiences(experiences.filter((_, i) => i !== index))
  const removeProject = (index: number) => setProjects(projects.filter((_, i) => i !== index))
  const removeEducation = (index: number) => setEducations(educations.filter((_, i) => i !== index))
  const removeAchievement = (index: number) => setAchievements(achievements.filter((_, i) => i !== index))

  // Field change handlers
  const updateExperience = (index: number, field: string, value: string) => {
    const newExps = [...experiences]
    newExps[index] = { ...newExps[index], [field]: value }
    setExperiences(newExps)
  }
  const updateProject = (index: number, field: string, value: string | string[]) => {
      const newProjs = [...projects]
      if (field === 'technologies' && typeof value === 'string') {
          // Handle comma separated string
          // Only if user manually types tags. If we want array input, logic differs.
          // For simplicity let's assume raw string input that we split on save or use simple array methods
          // Actually let's assume it is just a string input for now in UI? No, interface says string[]
          // Let's treat it as string in UI for ease and split on change? No, let's keep it simple string in UI for now 
          // and let the component handle display. Wait, if it's string[] from parser, we need to join it for input.
          // Let's change the input to be text and split it.
      }
      // @ts-ignore
      newProjs[index] = { ...newProjs[index], [field]: value }
      setProjects(newProjs)
  }
   const updateEducation = (index: number, field: string, value: string) => {
    const newEdus = [...educations]
    newEdus[index] = { ...newEdus[index], [field]: value }
    setEducations(newEdus)
  }
   const updateAchievement = (index: number, field: string, value: string) => {
    const newAch = [...achievements]
    newAch[index] = { ...newAch[index], [field]: value }
    setAchievements(newAch)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Resume Upload Section */}
      <div className="bg-card text-card-foreground border rounded-lg p-6 shadow-sm">
         <h2 className="text-xl font-semibold mb-4">Auto-Fill from Resume</h2>
         <div className="flex items-center gap-4">
             <input 
               type="file" 
               accept=".pdf" 
               onChange={handleFileChange}
               className="block w-full text-sm text-slate-500
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-full file:border-0
                 file:text-sm file:font-semibold
                 file:bg-violet-50 file:text-violet-700
                 hover:file:bg-violet-100
               "
               disabled={parsing}
             />
             {parsing && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="animate-spin mr-2 h-4 w-4" /> Parsing with AI...</div>}
         </div>
         <p className="text-sm text-muted-foreground mt-2">Upload your PDF resume to automatically populate the fields below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
         {/* Personal Details */}
         <section className="bg-card border rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold">Personal Details</h3>
             
             {/* Avatar Upload */}
             <div className="flex items-center gap-6 mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-muted bg-muted flex items-center justify-center">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-muted-foreground text-xs">No Photo</span>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium mb-1">Profile Photo</label>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                            if (!e.target.files?.[0]) return
                            const file = e.target.files[0]
                            const supabase = createClient()
                            const fileExt = file.name.split('.').pop()
                            const fileName = `${Math.random()}.${fileExt}`
                            const filePath = `${fileName}`

                            alert('Uploading photo...') // Simple feedback

                            const { error: uploadError } = await supabase.storage
                                .from('avatars')
                                .upload(filePath, file)

                            if (uploadError) {
                                console.error(uploadError)
                                alert('Error uploading avatar: ' + uploadError.message)
                                return
                            }

                            const { data: { publicUrl } } = supabase.storage
                                .from('avatars')
                                .getPublicUrl(filePath)

                            setProfile(prev => ({ ...prev, avatar_url: publicUrl }))
                        }}
                        className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-violet-50 file:text-violet-700
                            hover:file:bg-violet-100"
                    />
                    <p className="text-xs text-muted-foreground">Recommended: Square image, max 2MB.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Full Name</label>
                   <input 
                     type="text" 
                     className="w-full rounded-md border p-2 bg-background" 
                     value={profile.full_name} 
                     onChange={e => setProfile({...profile, full_name: e.target.value})}
                     required
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Professional Title</label>
                   <input 
                     type="text" 
                     className="w-full rounded-md border p-2 bg-background" 
                     placeholder="e.g. Full Stack Developer"
                     value={profile.title} 
                     onChange={e => setProfile({...profile, title: e.target.value})}
                   />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium mb-1">Bio</label>
                   <textarea 
                     className="w-full rounded-md border p-2 bg-background min-h-[100px]" 
                     placeholder="Tell us about yourself..."
                     value={profile.bio} 
                     onChange={e => setProfile({...profile, bio: e.target.value})}
                   />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium mb-1">Skills (Comma separated)</label>
                   <input 
                     type="text" 
                     className="w-full rounded-md border p-2 bg-background" 
                     placeholder="React, Next.js, Node.js, Python"
                     value={profile.skills} 
                     onChange={e => setProfile({...profile, skills: e.target.value})}
                   />
                </div>
             </div>
          </section>

          {/* Contact & Social Links */}
          <section className="bg-card border rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold">Contact & Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Public Email</label>
                   <input 
                     type="email" 
                     className="w-full rounded-md border p-2 bg-background" 
                     value={profile.display_email} 
                     onChange={e => setProfile({...profile, display_email: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Phone Number</label>
                   <input 
                     type="tel" 
                     className="w-full rounded-md border p-2 bg-background" 
                     value={profile.phone} 
                     onChange={e => setProfile({...profile, phone: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                   <input 
                     type="url" 
                     className="w-full rounded-md border p-2 bg-background" 
                     placeholder="https://linkedin.com/in/..."
                     value={profile.linkedin_link} 
                     onChange={e => setProfile({...profile, linkedin_link: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">GitHub URL</label>
                   <input 
                     type="url" 
                     className="w-full rounded-md border p-2 bg-background" 
                     placeholder="https://github.com/..."
                     value={profile.github_link} 
                     onChange={e => setProfile({...profile, github_link: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">LeetCode URL</label>
                   <input 
                     type="url" 
                     className="w-full rounded-md border p-2 bg-background" 
                     placeholder="https://leetcode.com/..."
                     value={profile.leetcode_link} 
                     onChange={e => setProfile({...profile, leetcode_link: e.target.value})}
                   />
                </div>
            </div>
          </section>

         {/* Experiences */}
         <section className="bg-card border rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-semibold">Experience</h3>
               <button type="button" onClick={addExperience} className="flex items-center text-sm text-primary hover:underline">
                  <Plus className="h-4 w-4 mr-1" /> Add
               </button>
            </div>
            <div className="space-y-6">
               {experiences.map((exp, idx) => (
                  <div key={idx} className="bg-muted/30 p-4 rounded-md relative group">
                     <button 
                        type="button" 
                        onClick={() => removeExperience(idx)}
                        className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                        <Trash2 className="h-4 w-4" />
                     </button>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                           placeholder="Company" 
                           className="rounded-md border p-2 bg-background"
                           value={exp.company || ''}
                           onChange={e => updateExperience(idx, 'company', e.target.value)}
                        />
                        <input 
                           placeholder="Position" 
                           className="rounded-md border p-2 bg-background"
                           value={exp.position || ''}
                           onChange={e => updateExperience(idx, 'position', e.target.value)}
                        />
                        <input 
                           type="text" // using text for flexibility or date
                           placeholder="Start Date (DD-MM-YYYY)" 
                           className="rounded-md border p-2 bg-background"
                           value={exp.start_date}
                           onChange={e => updateExperience(idx, 'start_date', e.target.value)}
                        />
                         <input 
                           type="text"
                           placeholder="End Date (DD-MM-YYYY or Present)" 
                           className="rounded-md border p-2 bg-background"
                           value={exp.end_date}
                           onChange={e => updateExperience(idx, 'end_date', e.target.value)}
                        />
                        <textarea 
                           className="md:col-span-2 rounded-md border p-2 bg-background min-h-[80px]"
                           placeholder="Description of responsibilities..."
                           value={exp.description}
                           onChange={e => updateExperience(idx, 'description', e.target.value)}
                        />
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* Projects */}
         <section className="bg-card border rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-semibold">Projects</h3>
               <button type="button" onClick={addProject} className="flex items-center text-sm text-primary hover:underline">
                  <Plus className="h-4 w-4 mr-1" /> Add
               </button>
            </div>
            <div className="space-y-6">
               {projects.map((proj, idx) => (
                  <div key={idx} className="bg-muted/30 p-4 rounded-md relative group">
                     <button 
                        type="button" 
                        onClick={() => removeProject(idx)}
                        className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                        <Trash2 className="h-4 w-4" />
                     </button>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                           placeholder="Project Name" 
                           className="rounded-md border p-2 bg-background"
                           value={proj.name}
                           onChange={e => updateProject(idx, 'name', e.target.value)}
                        />
                         <input 
                           placeholder="Technologies (comma separated)" 
                           className="rounded-md border p-2 bg-background"
                           value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                           onChange={e => {
                               const val = e.target.value.split(',').map(t => t.trim())
                               updateProject(idx, 'technologies', val)
                           }}
                        />
                        <input 
                           placeholder="Live URL" 
                           className="rounded-md border p-2 bg-background"
                           value={proj.url}
                           onChange={e => updateProject(idx, 'url', e.target.value)}
                        />
                         {/* <input 
                           placeholder="GitHub URL" 
                           className="rounded-md border p-2 bg-background"
                           value={proj.github_url}
                           onChange={e => updateProject(idx, 'github_url', e.target.value)}
                        /> */}
                        <textarea 
                           className="md:col-span-2 rounded-md border p-2 bg-background min-h-[80px]"
                           placeholder="Project Description..."
                           value={proj.description}
                           onChange={e => updateProject(idx, 'description', e.target.value)}
                        />
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* Education */}
         <section className="bg-card border rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-semibold">Education</h3>
               <button type="button" onClick={addEducation} className="flex items-center text-sm text-primary hover:underline">
                  <Plus className="h-4 w-4 mr-1" /> Add
               </button>
            </div>
            <div className="space-y-6">
               {educations.map((edu, idx) => (
                  <div key={idx} className="bg-muted/30 p-4 rounded-md relative group">
                     <button 
                        type="button" 
                        onClick={() => removeEducation(idx)}
                        className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                        <Trash2 className="h-4 w-4" />
                     </button>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                           placeholder="School / University" 
                           className="rounded-md border p-2 bg-background"
                           value={edu.school}
                           onChange={e => updateEducation(idx, 'school', e.target.value)}
                        />
                        <input 
                           placeholder="Degree" 
                           className="rounded-md border p-2 bg-background"
                           value={edu.degree}
                           onChange={e => updateEducation(idx, 'degree', e.target.value)}
                        />
                         <input 
                           placeholder="Field of Study" 
                           className="rounded-md border p-2 bg-background"
                           value={edu.field_of_study}
                           onChange={e => updateEducation(idx, 'field_of_study', e.target.value)}
                        />
                         <div className="grid grid-cols-2 gap-2">
                             <input 
                                placeholder="Start" 
                                className="rounded-md border p-2 bg-background"
                                value={edu.start_date}
                                onChange={e => updateEducation(idx, 'start_date', e.target.value)}
                             />
                              <input 
                                placeholder="End" 
                                className="rounded-md border p-2 bg-background"
                                value={edu.end_date}
                                onChange={e => updateEducation(idx, 'end_date', e.target.value)}
                             />
                         </div>
                     </div>
                  </div>
               ))}
            </div>
         </section>

          {/* Achievements */}
          <section className="bg-card border rounded-lg p-6 space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Achievements & Certifications</h3>
                <button type="button" onClick={addAchievement} className="flex items-center text-sm text-primary hover:underline">
                   <Plus className="h-4 w-4 mr-1" /> Add
                </button>
             </div>
             <div className="space-y-6">
                {achievements.map((item, idx) => (
                   <div key={idx} className="bg-muted/30 p-4 rounded-md relative group">
                      <button 
                         type="button" 
                         onClick={() => removeAchievement(idx)}
                         className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                         <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <input 
                            placeholder="Title / Certificate Name" 
                            className="rounded-md border p-2 bg-background"
                            value={item.title}
                            onChange={e => updateAchievement(idx, 'title', e.target.value)}
                         />
                         <input 
                            placeholder="Issuer / Organization" 
                            className="rounded-md border p-2 bg-background"
                            value={item.issuer}
                            onChange={e => updateAchievement(idx, 'issuer', e.target.value)}
                         />
                         <div className="grid grid-cols-2 gap-2">
                            <input 
                               placeholder="Date (DD-MM-YYYY)" 
                               className="rounded-md border p-2 bg-background"
                               value={item.date}
                               onChange={e => updateAchievement(idx, 'date', e.target.value)}
                            />
                            <input 
                               placeholder="Credential URL" 
                               className="rounded-md border p-2 bg-background"
                               value={item.url}
                               onChange={e => updateAchievement(idx, 'url', e.target.value)}
                            />
                         </div>
                         <textarea 
                            className="md:col-span-2 rounded-md border p-2 bg-background min-h-[60px]"
                            placeholder="Description..."
                            value={item.description}
                            onChange={e => updateAchievement(idx, 'description', e.target.value)}
                         />
                      </div>
                   </div>
                ))}
             </div>
          </section>
          
          <div className="sticky bottom-4 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md font-semibold shadow-lg disabled:opacity-50"
            >
               {loading ? 'Saving...' : 'Save Portfolio'}
            </button>
         </div>

      </form>
    </div>
  )
}
