export enum CoverLetterApproachEnum {
  story = 'story',
  direct = 'direct',
}

export type CoverLetterApproach = keyof typeof CoverLetterApproachEnum;

export const approachInstructions: Record<CoverLetterApproach, string> = {
  [CoverLetterApproachEnum.story]:
    'What it is: You tell a short, compelling story that shows your journey, motivation, or a defining moment in your career. Why it works: Humans connect to stories—they make you memorable. It also shows personality and passion.',
  [CoverLetterApproachEnum.direct]:
    'What it is: You explicitly match your skills and experience to the job requirements. You can combine it with story or problem-solving. Why it works: Shows you understand the role and can “hit the ground running.”',
};
