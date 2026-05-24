import axios from 'axios';
import { supabase } from './supabase';

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =========================================================================
// Profile
// =========================================================================

export interface ProfileLink {
  label: string;
  url: string;
}

export interface ProfileExperience {
  company: string;
  role: string;
  start: string;
  end: string;
  current?: boolean;
  bullets: string[];
}

export interface ProfileEducation {
  school: string;
  degree: string;
  start: string;
  end: string;
  note?: string;
}

export interface ProfilePersonalProject {
  name: string;
  url?: string;
  description?: string;
}

export interface Profile {
  user_id: string;
  full_name: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  links: ProfileLink[];
  summary: string | null;
  skills: string[];
  experience: ProfileExperience[];
  education: ProfileEducation[];
  personal_projects: ProfilePersonalProject[];
  onboarding_complete: boolean;
  updated_at: string;
}

export type ProfileUpdate = Partial<
  Omit<Profile, 'user_id' | 'updated_at' | 'onboarding_complete'>
>;

export const fetchProfile = async (): Promise<Profile> => {
  const { data } = await api.get<Profile>('/profile');
  return data;
};

export const updateProfile = async (
  patch: ProfileUpdate,
): Promise<Profile> => {
  const { data } = await api.put<Profile>('/profile', patch);
  return data;
};

export const completeOnboarding = async (): Promise<Profile> => {
  const { data } = await api.post<Profile>('/profile/complete');
  return data;
};

// =========================================================================
// Resumes
// =========================================================================

export interface CvExperience {
  company: string;
  title: string;
  period: string;
  subtitle?: string;
  bullets: string[];
}

export interface CvProject {
  name: string;
  tech?: string[];
  bullets: string[];
}

export interface CvEducation {
  school: string;
  degree: string;
  period: string;
  location?: string;
  coursework?: string;
}

export interface CvJson {
  summary: string;
  technicalStrengths?: string[];
  experience: CvExperience[];
  projects?: CvProject[];
  education?: CvEducation[];
}

export interface ResumeRow {
  id: string;
  user_id: string;
  target_role: string | null;
  company: string | null;
  job_description: string | null;
  cv_json: CvJson;
  created_at: string;
}

export const listResumes = async (limit = 50): Promise<ResumeRow[]> => {
  const { data } = await api.get<ResumeRow[]>('/resumes', {
    params: { limit },
  });
  return data;
};

export const getResume = async (id: string): Promise<ResumeRow> => {
  const { data } = await api.get<ResumeRow>(`/resumes/${id}`);
  return data;
};

export const saveResume = async (input: {
  target_role?: string;
  company?: string;
  job_description?: string;
  cv_json: CvJson;
}): Promise<ResumeRow> => {
  const { data } = await api.post<ResumeRow>('/resumes', input);
  return data;
};

export const deleteResume = async (id: string): Promise<void> => {
  await api.delete(`/resumes/${id}`);
};

export const downloadSavedResumePdf = async (id: string): Promise<void> => {
  const response = await api.get(`/resumes/${id}/pdf`, {
    responseType: 'blob',
  });
  triggerDownload(response.data, `cv-${id}.pdf`);
};

// =========================================================================
// Cover Letters
// =========================================================================

export interface CoverLetterRow {
  id: string;
  user_id: string;
  company: string | null;
  role: string | null;
  job_description: string | null;
  body_text: string | null;
  edited_text: string | null;
  created_at: string;
}

export const listCoverLetters = async (
  limit = 50,
): Promise<CoverLetterRow[]> => {
  const { data } = await api.get<CoverLetterRow[]>('/cover-letters', {
    params: { limit },
  });
  return data;
};

export const getCoverLetter = async (id: string): Promise<CoverLetterRow> => {
  const { data } = await api.get<CoverLetterRow>(`/cover-letters/${id}`);
  return data;
};

export const saveCoverLetter = async (input: {
  company?: string;
  role?: string;
  job_description?: string;
  body_text: string;
  edited_text?: string;
}): Promise<CoverLetterRow> => {
  const { data } = await api.post<CoverLetterRow>('/cover-letters', input);
  return data;
};

export const updateCoverLetter = async (
  id: string,
  patch: { body_text?: string; edited_text?: string },
): Promise<CoverLetterRow> => {
  const { data } = await api.patch<CoverLetterRow>(
    `/cover-letters/${id}`,
    patch,
  );
  return data;
};

export const deleteCoverLetter = async (id: string): Promise<void> => {
  await api.delete(`/cover-letters/${id}`);
};

export const downloadSavedCoverLetterPdf = async (
  id: string,
): Promise<void> => {
  const response = await api.get(`/cover-letters/${id}/pdf`, {
    responseType: 'blob',
  });
  triggerDownload(response.data, `cover-letter-${id}.pdf`);
};

// =========================================================================
// AI generation (existing backend endpoints)
// =========================================================================

export interface CoverLetterPreviewRequest {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  additionalComments?: string;
}

export const previewCoverLetterText = async (
  req: CoverLetterPreviewRequest,
): Promise<string> => {
  const { data } = await api.post<{ text: string }>(
    '/job/cover-letter/preview',
    req,
  );
  return data.text;
};

export const downloadCoverLetterPdf = async (
  req: CoverLetterPreviewRequest,
): Promise<void> => {
  const response = await api.post('/job/cover-letter', req, {
    responseType: 'blob',
  });
  triggerDownload(response.data, `cover-letter-${slugify(req.companyName)}.pdf`);
};

export const downloadCustomCoverLetterPdf = async (
  text: string,
  companyName: string,
): Promise<void> => {
  const response = await api.post(
    '/job/cover-letter/custom',
    { text, companyName },
    { responseType: 'blob' },
  );
  triggerDownload(response.data, `cover-letter-${slugify(companyName)}.pdf`);
};

export interface CvPreviewRequest {
  targetRole: string;
  jobDescription: string;
  additionalComments?: string;
}

export const previewCv = async (req: CvPreviewRequest): Promise<CvJson> => {
  const { data } = await api.post<CvJson>('/job/cv/preview', req);
  return data;
};

export const downloadCvPdf = async (req: CvPreviewRequest): Promise<void> => {
  const response = await api.post('/job/cv', req, { responseType: 'blob' });
  triggerDownload(
    response.data,
    `cv-${slugify(req.targetRole || 'general')}.pdf`,
  );
};

function triggerDownload(payload: BlobPart, filename: string) {
  const blob = new Blob([payload], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function slugify(s: string): string {
  return s.replace(/\s+/g, '-');
}
