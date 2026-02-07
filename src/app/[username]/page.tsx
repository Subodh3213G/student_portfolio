import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { Mail, Phone, Linkedin, Github, Code, Globe } from 'lucide-react'

// Helper to generate Metadata
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('full_name, title').eq('username', username).single()

  if (!profile) return { title: 'Not Found' }

  return {
    title: `${profile.full_name} - ${profile.title || 'Portfolio'}`,
  }
}

export default async function PublicProfile({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, experiences(*), projects(*), educations(*), achievements(*)')
    .eq('username', username)
    .single()

  if (error || !profile) {
    // If not found, return 404
    notFound()
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 space-y-12">
      {/* Header / Hero */}
      <section className="text-center space-y-4">
        {profile.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={profile.avatar_url} 
            alt={profile.full_name} 
            className="mx-auto h-32 w-32 rounded-full object-cover border-4 border-background shadow-xl"
          />
        )}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{profile.full_name}</h1>
          <p className="text-xl text-muted-foreground mt-2">{profile.title}</p>
        </div>
        <div className="max-w-2xl mx-auto text-lg text-muted-foreground/80 leading-relaxed">
          {profile.bio}
        </div>
        
        {/* Social Links */}
        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          {profile.social_links?.email && (
            <a href={`mailto:${profile.social_links.email}`} className="p-2 border rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-primary" title="Email">
              <Mail className="h-5 w-5" />
            </a>
          )}
          {profile.social_links?.phone && (
            <a href={`tel:${profile.social_links.phone}`} className="p-2 border rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-primary" title="Phone">
              <Phone className="h-5 w-5" />
            </a>
          )}
          {profile.social_links?.linkedin && (
            <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 border rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-primary" title="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </a>
          )}
          {profile.social_links?.github && (
            <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer" className="p-2 border rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-primary" title="GitHub">
              <Github className="h-5 w-5" />
            </a>
          )}
          {profile.social_links?.leetcode && (
            <a href={profile.social_links.leetcode} target="_blank" rel="noopener noreferrer" className="p-2 border rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-primary" title="LeetCode">
              <Code className="h-5 w-5" />
            </a>
          )}
        </div>
      </section>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill: string) => (
              <span key={skill} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {profile.experiences && profile.experiences.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">Experience</h2>
          <div className="space-y-8">
            {profile.experiences.sort((a: any, b: any) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()).map((exp: any) => (
              <div key={exp.id} className="grid md:grid-cols-[200px_1fr] gap-4">
                <div className="text-sm text-muted-foreground">
                  {exp.start_date} - {exp.end_date || 'Present'}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{exp.position}</h3>
                  <div className="text-muted-foreground">{exp.company}</div>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {profile.projects && profile.projects.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">Projects</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {profile.projects.map((proj: any) => (
              <div key={proj.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold">{proj.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-4 h-20 overflow-hidden text-ellipsis">{proj.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {proj.tags && proj.tags.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      {tag}
                    </span>
                  ))}
                </div>
                {(proj.url || proj.github_url) && (
                   <div className="mt-4 flex gap-4 text-sm">
                      {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Live</a>}
                      {proj.github_url && <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub</a>}
                   </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {profile.educations && profile.educations.length > 0 && (
         <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Education</h2>
            <div className="space-y-4">
              {profile.educations.map((edu: any) => (
                <div key={edu.id}>
                    <h3 className="font-semibold">{edu.school}</h3>
                    <p className="text-muted-foreground">{edu.degree}, {edu.field_of_study}</p>
                    <p className="text-sm text-muted-foreground">{edu.start_date} - {edu.end_date}</p>
                </div>
              ))}
            </div>
         </section>
      )}

      {/* Achievements & Certifications */}
      {profile.achievements && profile.achievements.length > 0 && (
         <section>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Achievements & Certifications</h2>
            <div className="space-y-4">
              {profile.achievements.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).map((item: any) => (
                <div key={item.id} className="bg-card border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-1">
                        <div>
                             <h3 className="font-semibold text-lg">{item.title}</h3>
                             <p className="text-muted-foreground">{item.issuer}</p>
                        </div>
                        {item.date && <span className="text-sm text-muted-foreground whitespace-nowrap">{item.date}</span>}
                    </div>
                    {item.description && <p className="text-sm text-muted-foreground mb-2 whitespace-pre-line">{item.description}</p>}
                    {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline font-medium">
                            View Credential
                        </a>
                    )}
                </div>
              ))}
            </div>
         </section>
      )}

    </div>
  )
}
