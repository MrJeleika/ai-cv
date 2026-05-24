import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface ResumeRow {
  id: string;
  user_id: string;
  target_role: string | null;
  company: string | null;
  job_description: string | null;
  cv_json: unknown;
  created_at: string;
}

export interface ResumeCreate {
  target_role?: string;
  company?: string;
  job_description?: string;
  cv_json: unknown;
}

@Injectable()
export class ResumesService {
  constructor(private readonly supabase: SupabaseService) {}

  async list(userId: string, limit = 50): Promise<ResumeRow[]> {
    const { data, error } = await this.supabase
      .service()
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as ResumeRow[];
  }

  async get(userId: string, id: string): Promise<ResumeRow> {
    const { data, error } = await this.supabase
      .service()
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException('Resume not found');
    return data as ResumeRow;
  }

  async create(userId: string, input: ResumeCreate): Promise<ResumeRow> {
    const { data, error } = await this.supabase
      .service()
      .from('resumes')
      .insert({ ...input, user_id: userId })
      .select('*')
      .single();
    if (error) throw error;
    return data as ResumeRow;
  }

  async remove(userId: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .service()
      .from('resumes')
      .delete()
      .eq('user_id', userId)
      .eq('id', id);
    if (error) throw error;
  }
}
