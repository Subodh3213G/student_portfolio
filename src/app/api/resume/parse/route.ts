import { NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
// @ts-ignore
// import pdf from 'pdf-parse'
const pdf = require('pdf-parse')

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    let text = ''
    try {
        // Robust module handling for pdf-parse (handles CJS/ESM interop issues)
        console.log('pdf import structure:', pdf)
        let parse = pdf
        // Sometimes it's wrapped in default, sometimes twice with Turbopack/Next.js
        if (typeof parse !== 'function' && parse?.default) {
             parse = parse.default
        }
        if (typeof parse !== 'function' && parse?.default) {
             // Second layer unwrap if needed
             parse = parse.default
        }

        if (typeof parse !== 'function') {
            console.error('Core PDF Parse library failed to load function. Structure:', JSON.stringify(pdf, null, 2))
            throw new Error('Internal PDF Library Error: Could not load parser function.')
        }

        console.log('Parser function loaded successfully.')
        const pdfData = await parse(buffer)
        text = pdfData.text

        if (!text || text.trim().length === 0) {
            throw new Error('PDF parsed but returned empty text.')
        }
        console.log('PDF parsed successfully. Length:', text.length)
    } catch (pdfError: any) {
        console.error('PDF Parse Error:', pdfError)
        return NextResponse.json({ error: 'PDF parsing failed: ' + pdfError.message }, { status: 500 })
    }

    // Define schema for extraction
    const schema = z.object({
      full_name: z.string().describe("The candidate's full name"),
      email: z.string().optional(),
      title: z.string().optional().describe("Current job title or professional headline"),
      bio: z.string().optional().describe("A short professional summary"),
      skills: z.array(z.string()).describe("List of technical and soft skills"),
      experiences: z.array(z.object({
        company: z.string(),
        position: z.string(),
        start_date: z.string().optional(), // Relaxed date validation
        end_date: z.string().optional(),
        description: z.string().describe("Summary of responsibilities and achievements"),
      })).optional(),
      projects: z.array(z.object({
        name: z.string(),
        description: z.string(),
        technologies: z.array(z.string()).optional(),
        url: z.string().optional(),
      })).optional(),
      educations: z.array(z.object({
        school: z.string(),
        degree: z.string().optional(),
        field_of_study: z.string().optional(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
      })).optional(),
    })

    // Call LLM (Gemini via AI SDK)
    console.log('Sending text to Gemini...')
    try {
        if (!text) {
             throw new Error('No text content available from PDF.')
        }
        const { object } = await generateObject({
          model: google('gemini-1.5-flash'),
          schema: schema,
          system: 'You are an expert resume parser. Your job is to extract structured JSON data from resume text. Be precise and handle different resume formats.',
          prompt: `Extract structured data from the following resume text:\n\n${text}`,
        })
        console.log('Gemini extraction successful.')
        return NextResponse.json(object)
    } catch (llmError: any) {
        console.error('LLM Extraction Error:', llmError)
        return NextResponse.json({ error: 'AI extraction failed: ' + llmError.message }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Unexpected Error parsing resume:', error)
    return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 })
  }
}
