import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class SkillsService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Combine the user's own skill list with skills extracted from the job
   * description, then ask the LLM to produce a final ordered list (relevant
   * first). Falls back to user's skills on any error so generation never
   * breaks.
   */
  async extractSkills(
    jobDescription: string,
    userSkills: string[],
    comment?: string,
  ): Promise<string[]> {
    if (userSkills.length === 0 && !jobDescription) return [];

    try {
      const extracted = await this.extractFromJob(jobDescription);
      const merged = await this.rankAndMerge(
        jobDescription,
        userSkills,
        extracted,
        comment,
      );
      if (merged.length > 0) return merged;
    } catch (err) {
      console.error('Skill extraction failed; falling back to user list', err);
    }
    return [...userSkills];
  }

  private async extractFromJob(jobDescription: string): Promise<string[]> {
    if (!jobDescription.trim()) return [];
    const prompt = `
Analyze this job description and suggest relevant *technical* skills mentioned or strongly implied.

JOB DESCRIPTION:
${jobDescription}

Rules:
- Identify 1–8 specific technical skills (languages, frameworks, platforms, tools).
- Skip vague concepts ("REST API", "Authentication", "UI/UX") — only concrete technology names.
- Skip eslint/prettier-type tools.

Return ONLY a JSON array. Example: ["Python", "Docker", "AWS"]
`;
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert technical recruiter. Return only valid JSON without markdown formatting.',
        },
        { role: 'user', content: prompt },
      ],
      max_completion_tokens: 300,
      temperature: 1,
    });
    return parseJsonArray(completion.choices[0]?.message?.content);
  }

  private async rankAndMerge(
    jobDescription: string,
    userSkills: string[],
    extracted: string[],
    comment?: string,
  ): Promise<string[]> {
    const prompt = `
Combine the candidate's known skills with skills implied by the job description, then return the final ordered list (most-relevant first).

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S KNOWN SKILLS (must all be considered): ${userSkills.join(', ') || '(none)'}
SKILLS EXTRACTED FROM JOB DESCRIPTION: ${extracted.join(', ') || '(none)'}

${comment ? `SPECIAL FOCUS:\n${comment}\n` : ''}

Rules:
- Return ONLY concrete technologies (languages, frameworks, platforms). No abstract concepts.
- Prefer skills the candidate already has that also match the job; surface those first.
- Add skills from the extracted list that the candidate plausibly has based on their stack.
- Aim for 6–14 skills total.

Return ONLY a JSON array of strings. Example: ["TypeScript", "React", "Postgres"]
`;
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert programmer. Return only valid JSON without markdown formatting.',
        },
        { role: 'user', content: prompt },
      ],
      max_completion_tokens: 600,
      temperature: 1,
    });
    return parseJsonArray(completion.choices[0]?.message?.content);
  }
}

function parseJsonArray(raw: string | undefined): string[] {
  if (!raw) return [];
  let s = raw.trim();
  if (s.startsWith('```json')) s = s.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  else if (s.startsWith('```')) s = s.replace(/^```\s*/, '').replace(/\s*```$/, '');
  try {
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
