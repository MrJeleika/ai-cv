import { Profile } from '../../lib/api';
import { PersonalSection } from './PersonalSection';
import { SkillsSection } from './SkillsSection';
import { ExperienceSection } from './ExperienceSection';
import { EducationSection } from './EducationSection';
import { PersonalProjectsSection } from './PersonalProjectsSection';
import { ReviewSection } from './ReviewSection';

export type SectionId =
  | 'personal'
  | 'skills'
  | 'experience'
  | 'education'
  | 'projects'
  | 'review';

interface ProfileSectionProps {
  id: SectionId;
  data: Profile;
  onPatch: (patch: Partial<Profile>) => void;
}

export function ProfileSection({ id, data, onPatch }: ProfileSectionProps) {
  switch (id) {
    case 'personal':
      return <PersonalSection data={data} onPatch={onPatch} />;
    case 'skills':
      return <SkillsSection data={data} onPatch={onPatch} />;
    case 'experience':
      return <ExperienceSection data={data} onPatch={onPatch} />;
    case 'education':
      return <EducationSection data={data} onPatch={onPatch} />;
    case 'projects':
      return <PersonalProjectsSection data={data} onPatch={onPatch} />;
    case 'review':
      return <ReviewSection data={data} />;
  }
}

export const SECTION_META: Record<
  SectionId,
  { label: string; icon: string; title: string; description: string }
> = {
  personal: {
    label: 'Personal',
    icon: 'person',
    title: 'Tell us about you.',
    description:
      'Basic identification. Appears in the header of every document you generate.',
  },
  skills: {
    label: 'Skills',
    icon: 'psychology',
    title: 'What can you do?',
    description:
      'A flat list — frameworks, languages, tools, methodologies. The AI selects relevant ones per posting.',
  },
  experience: {
    label: 'Experience',
    icon: 'work',
    title: 'Where have you worked?',
    description:
      'Add your most relevant roles. Bullets become the AI\'s starting material when tailoring résumés.',
  },
  education: {
    label: 'Education',
    icon: 'school',
    title: 'How were you trained?',
    description: 'Schools, degrees, distinctions. Optional but useful.',
  },
  projects: {
    label: 'Projects',
    icon: 'rocket_launch',
    title: 'What have you built on your own?',
    description:
      'Side projects, open-source work, hackathons. Optional — but a strong signal.',
  },
  review: {
    label: 'Review',
    icon: 'task_alt',
    title: 'Look it over.',
    description:
      'Confirm everything looks right. You can come back and edit any time.',
  },
};
