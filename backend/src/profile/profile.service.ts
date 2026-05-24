import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

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

@Injectable()
export class ProfileService {
  constructor(private readonly supabase: SupabaseService) {}

  async get(userId: string): Promise<Profile> {
    const { data, error } = await this.supabase
      .service()
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (data) return data as Profile;

    // Trigger should auto-create on signup, but fall back to insert here in case
    // a user signed up before the trigger existed.
    const { data: inserted, error: insertErr } = await this.supabase
      .service()
      .from('profiles')
      .insert({ user_id: userId })
      .select('*')
      .single();
    if (insertErr) throw insertErr;
    return inserted as Profile;
  }

  async update(userId: string, patch: ProfileUpdate): Promise<Profile> {
    const { data, error } = await this.supabase
      .service()
      .from('profiles')
      .update(patch)
      .eq('user_id', userId)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) throw new NotFoundException('Profile not found');
    return data as Profile;
  }

  async complete(userId: string): Promise<Profile> {
    return this.update(userId, {
      // typescript: 'onboarding_complete' is intentionally not in ProfileUpdate
      // but we cast here for this single dedicated endpoint
      ...({ onboarding_complete: true } as object),
    } as ProfileUpdate);
  }
}
