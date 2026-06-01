import type { Question } from "@/data/skillQuestions";

function permuteIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Randomize option order per question; updates `correct` index for the same session. */
export function shuffleSkillQuestions(questions: Question[]): Question[] {
  return questions.map((q) => {
    const n = q.options.length;
    if (n < 2) return { ...q };
    const perm = permuteIndices(n);
    const newOptions = perm.map((i) => q.options[i]);
    const newCorrect = perm.indexOf(q.correct);
    if (newCorrect < 0) return { ...q };
    return { ...q, options: newOptions, correct: newCorrect };
  });
}
