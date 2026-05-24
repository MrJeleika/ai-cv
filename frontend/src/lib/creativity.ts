export function creativityLabel(creativity: number): string {
  if (creativity < 20) return 'Very strict';
  if (creativity < 40) return 'Strict';
  if (creativity < 60) return 'Balanced';
  if (creativity < 80) return 'Creative';
  return 'Very creative';
}

export function creativityHint(creativity: number): string {
  if (creativity < 20) {
    return "Be strictly factual. Stick to numbers, hard outcomes, and the candidate's exact wording. No metaphors or stylistic flourishes.";
  }
  if (creativity < 40) {
    return 'Lean factual and concise. Quantify outcomes where possible. Plain language.';
  }
  if (creativity < 60) {
    return 'Balance specificity and readability. Quantify the important wins; rewrite the rest naturally.';
  }
  if (creativity < 80) {
    return "Allow tasteful rewrites of the candidate's bullets — sharper verbs, smoother phrasing — but preserve facts and numbers.";
  }
  return 'Rewrite freely for impact. Strong verbs, evocative phrasing. Never invent numbers or facts the candidate did not provide.';
}
