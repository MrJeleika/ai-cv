import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { SkillsService } from './skills.service';
import {
  Profile,
  ProfileExperience,
  ProfileEducation,
  ProfileLink,
} from '../profile/profile.service';

export interface CoverLetterRequest {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  additionalComments?: string;
}

export interface CVRequest {
  targetRole: string;
  jobDescription: string;
  additionalComments?: string;
}

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private readonly skillsService: SkillsService) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  // =========================================================================
  // Cover letter
  // =========================================================================

  private buildCoverLetterPrompt(
    request: CoverLetterRequest,
    profile: Profile,
  ): string {
    const name = profile.full_name ?? 'the candidate';
    const title = profile.title ?? '';
    const skills = profile.skills.slice(0, 12).join(', ');
    const bullets = profile.experience
      .slice(0, 2)
      .flatMap((j) => j.bullets ?? [])
      .slice(0, 6)
      .map((b) => `- ${b}`)
      .join('\n');

    const baseInfo = `
ABOUT ${name.toUpperCase()}:
Current title: ${title}
Top skills: ${skills}
Key accomplishments:
${bullets || '(none provided yet)'}

JOB:
Position: ${request.jobTitle} at ${request.companyName}
Description: ${request.jobDescription}
`;

    const commentsSection = request.additionalComments
      ? `\nIMPORTANT — USE THIS:\n${request.additionalComments}\n(This should shape the whole letter.)`
      : '';

    return `${baseInfo}${commentsSection}

Write a brief cover letter for ${name} applying to "${request.jobTitle}" at ${request.companyName}. Constraints:
- No storytelling. Straightforward.
- Tone: professional, friendly, concise (strict but warm).
- Length: 2 short paragraphs, 6–8 sentences total max.
- No buzzwords (synergy, passion, cutting-edge, cross-functional, results-driven, proven ability, innovative, dynamic, leverage, excellence).
- If the description mentions "hybrid" or "onsite", add one sentence about enjoying working in-office.
- Hint at willingness to put in extra effort when needed, WITHOUT saying "overtime" or synonyms.
- Focus on how ${name} can help right now using their experience.
- No exclamation marks. Short sign-off.

Start with "Dear Hiring Manager,".
Sign off with:
Kind regards
${name.split(' ')[0]}`;
  }

  async generateCoverLetter(
    request: CoverLetterRequest,
    profile: Profile,
  ): Promise<string> {
    const prompt = this.buildCoverLetterPrompt(request, profile);
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'system',
          content:
            'Write concise, human cover letters: no storytelling, no buzzwords, friendly but strict tone, 1–2 short paragraphs, subtle humour only when natural. Avoid AI-sounding phrases.',
        },
        { role: 'user', content: prompt },
      ],
      max_completion_tokens: 400,
      temperature: 0.45,
    });
    return (
      completion.choices[0]?.message?.content ?? 'Unable to generate cover letter'
    );
  }

  // =========================================================================
  // CV
  // =========================================================================

  private buildCVPrompt(
    request: CVRequest,
    profile: Profile,
    skillsToInclude: string[],
  ): string {
    const yearsHint = inferYearsOfExperience(profile.experience);
    const linksList = (profile.links ?? [])
      .map((l: ProfileLink) => `${l.label}: ${l.url}`)
      .join('\n');

    const jobs = profile.experience
      .map((job: ProfileExperience) => {
        const period = `${job.start || ''} - ${job.current ? 'Present' : job.end || ''}`;
        const bullets = (job.bullets ?? []).map((b) => `• ${b}`).join('\n');
        return `\n${job.role || ''} at ${job.company || ''} (${period})\n${bullets}`;
      })
      .join('\n');

    const edu = profile.education
      .map(
        (e: ProfileEducation) =>
          `${e.degree || ''} — ${e.school || ''} (${e.start || ''} - ${e.end || ''})${e.note ? ' · ' + e.note : ''}`,
      )
      .join('\n');

    const projects = (profile.personal_projects ?? [])
      .map((p) => {
        const parts = [p.name];
        if (p.url) parts.push(p.url);
        if (p.description) parts.push(p.description);
        return `- ${parts.join(' — ')}`;
      })
      .join('\n');

    const baseInfo = `
CANDIDATE PROFILE
Name: ${profile.full_name ?? ''}
Email: ${profile.email ?? ''}
Phone: ${profile.phone ?? ''}
Location: ${profile.location ?? ''}
${linksList ? `Links:\n${linksList}\n` : ''}
Summary on file: ${profile.summary ?? '(none)'}

WORK EXPERIENCE${jobs}

EDUCATION
${edu || '(none)'}
${projects ? `\nPERSONAL PROJECTS\n${projects}\n` : ''}
TARGET JOB
Role: ${request.targetRole}
Job Description: ${request.jobDescription}
`;

    const commentsSection = request.additionalComments
      ? `\nSPECIAL FOCUS:\n${request.additionalComments}\n`
      : '';

    return `${baseInfo}${commentsSection}

Analyze the job description and generate a professional CV tailored for the "${request.targetRole}" position. Output one-page Harvard-style résumé content.

STRATEGY:
- Keep a consistent professional structure.
- Generate a summary that reflects roughly ${yearsHint} years of experience.
- Make the summary job-specific, in plain language. Avoid buzzwords ("proven ability", "cross-functional teams", "adept in Git", etc.).

SUMMARY (3 sentences):
- 1st sentence: candidate title + ${yearsHint}+ years experience + 2–3 most relevant technologies from the job posting.
- 2nd sentence: what the candidate has actually built (use experience + projects on file).
- 3rd sentence: strongest domain/skill focus, framed as delivery and quality.
- Do not mention the company name; do not copy the job description.

EXPERIENCE:
- Use the candidate's actual roles, companies and dates.
- For each role: produce a one-line italic subtitle that describes the company (e.g. "Consulting and development agency", "Decentralized finance startup"). Infer from context if not provided.
- Limit to 4–5 bullets per role; pick the most relevant to the target job.
- Bullets are concise outcome-focused statements with numbers when possible.

PROJECTS:
- Only include if the candidate listed personal projects above.
- For each project: name, a tech array (3–6 technologies most relevant), 1–3 bullets.

EDUCATION:
- Use the candidate's actual entries. Add a coursework line if the entry has a note field.

TECHNOLOGIES TO INCLUDE (in order of relevance for the target job):
${skillsToInclude.join(', ')}

Rules:
- ATS-friendly language. No colors, no markdown.
- Focus on quantifiable achievements matching job requirements.

IMPORTANT: Return ONLY the JSON object below, no markdown formatting, no code blocks, no additional text:

{
  "summary": "…",
  "technicalStrengths": ["Skill 1", "Skill 2", "..."],
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "period": "MM.YYYY - MM.YYYY",
      "subtitle": "One-line company description",
      "bullets": ["...", "..."]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "tech": ["Tech1", "Tech2"],
      "bullets": ["...", "..."]
    }
  ],
  "education": [
    {
      "school": "School Name",
      "location": "City, Country",
      "degree": "Degree Title",
      "period": "YYYY - YYYY",
      "coursework": "Optional coursework summary"
    }
  ]
}`;
  }

  async generateCV(
    request: CVRequest,
    profile: Profile,
  ): Promise<{
    summary: string;
    technicalStrengths: string[];
    experience: Array<{
      company: string;
      title: string;
      period: string;
      subtitle?: string;
      bullets: string[];
    }>;
    projects?: Array<{
      name: string;
      tech?: string[];
      bullets: string[];
    }>;
    education?: Array<{
      school: string;
      degree: string;
      period: string;
      location?: string;
      coursework?: string;
    }>;
  }> {
    const skillsToInclude = await this.skillsService.extractSkills(
      request.jobDescription,
      profile.skills ?? [],
      request.additionalComments,
    );

    const prompt = this.buildCVPrompt(request, profile, skillsToInclude);

    const completion = await this.openai.chat.completions.create({
      model: 'o3-2025-04-16',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert CV writer who creates professional, ATS-friendly resumes tailored to specific roles. Return ONLY valid JSON without any markdown formatting, code blocks, or additional text.',
        },
        { role: 'user', content: prompt },
      ],
      max_completion_tokens: 3000,
      temperature: 1,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('No CV content generated');

    const cleaned = stripCodeFence(raw.trim());
    const parsed = JSON.parse(cleaned);

    // Re-assert the computed skill order
    parsed.technicalStrengths = skillsToInclude;
    return parsed;
  }
}

function stripCodeFence(s: string): string {
  if (s.startsWith('```json')) {
    return s.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  }
  if (s.startsWith('```')) {
    return s.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return s;
}

function inferYearsOfExperience(exp: ProfileExperience[]): number {
  // Cheap heuristic: count years across entries. Doesn't need to be exact —
  // it's a hint for the prompt only.
  const years = exp.reduce((acc, j) => {
    const start = parseFirstYear(j.start);
    const end = j.current ? new Date().getFullYear() : parseFirstYear(j.end);
    if (!start || !end || end < start) return acc;
    return acc + (end - start);
  }, 0);
  return Math.max(1, Math.min(years, 30));
}

function parseFirstYear(s: string | undefined): number | null {
  if (!s) return null;
  const m = s.match(/(\d{4})/);
  return m ? Number(m[1]) : null;
}
