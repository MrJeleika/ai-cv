import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

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

export interface CoverLetterCreate {
  company?: string;
  role?: string;
  job_description?: string;
  body_text: string;
  edited_text?: string;
}

export interface CoverLetterUpdate {
  edited_text?: string;
  body_text?: string;
}

@Injectable()
export class CoverLettersService {
  constructor(private readonly supabase: SupabaseService) {}

  async list(userId: string, limit = 50): Promise<CoverLetterRow[]> {
    const { data, error } = await this.supabase
      .service()
      .from('cover_letters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as CoverLetterRow[];
  }

  async get(userId: string, id: string): Promise<CoverLetterRow> {
    const { data, error } = await this.supabase
      .service()
      .from('cover_letters')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException('Cover letter not found');
    return data as CoverLetterRow;
  }

  async create(
    userId: string,
    input: CoverLetterCreate,
  ): Promise<CoverLetterRow> {
    const { data, error } = await this.supabase
      .service()
      .from('cover_letters')
      .insert({ ...input, user_id: userId })
      .select('*')
      .single();
    if (error) throw error;
    return data as CoverLetterRow;
  }

  async update(
    userId: string,
    id: string,
    patch: CoverLetterUpdate,
  ): Promise<CoverLetterRow> {
    const { data, error } = await this.supabase
      .service()
      .from('cover_letters')
      .update(patch)
      .eq('user_id', userId)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) throw new NotFoundException('Cover letter not found');
    return data as CoverLetterRow;
  }

  async remove(userId: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .service()
      .from('cover_letters')
      .delete()
      .eq('user_id', userId)
      .eq('id', id);
    if (error) throw error;
  }
}
