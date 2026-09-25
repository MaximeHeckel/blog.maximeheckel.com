import { z } from 'zod';

export const documentSchema = z
  .object({
    title: z.string(),
    url: z.string(),
    content: z.string(),
    similarity: z.number().finite().optional(),
  })
  .passthrough();

type Document = z.infer<typeof documentSchema>;

// UTF-8 bytes conservatively bound byte-level BPE tokens. This caps context
// without treating the old GPT-3 tokenizer as an exact Luna tokenizer.
export const MAX_CONTEXT_TOKEN_UPPER_BOUND = 12_000;
const encoder = new TextEncoder();
export const contextTokenUpperBound = (context: unknown) =>
  encoder.encode(JSON.stringify(context)).length;

function mergeOverlap(left: string, right: string): string | undefined {
  if (left.includes(right)) return left;
  if (right.includes(left)) return right;
  // Only merge substantial exact overlap; never slice unrelated code blocks.
  if (right.length < 80) return;
  let start = left.indexOf(right.slice(0, 80));
  while (start !== -1) {
    const overlap = left.slice(start);
    if (right.startsWith(overlap)) return left + right.slice(overlap.length);
    start = left.indexOf(right.slice(0, 80), start + 1);
  }
}

export function selectContext(
  documents: Document[],
  budget = MAX_CONTEXT_TOKEN_UPPER_BOUND
) {
  const ranked = [...documents].sort(
    (a, b) => (b.similarity ?? 0) - (a.similarity ?? 0)
  );
  const selected: Array<{ title: string; url: string; content: string }> = [];
  for (const document of ranked) {
    const candidate = {
      title: document.title,
      url: document.url,
      content: document.content.trim(),
    };
    if (!candidate.content) continue;
    let merged = false;
    for (let index = 0; index < selected.length; index++) {
      const existing = selected[index];
      if (existing.url !== candidate.url) continue;
      const content =
        mergeOverlap(existing.content, candidate.content) ??
        mergeOverlap(candidate.content, existing.content);
      if (content === undefined) continue;
      const updated = [...selected];
      updated[index] = { ...existing, content };
      if (contextTokenUpperBound(updated) <= budget)
        selected[index] = updated[index];
      merged = true;
      break;
    }
    if (!merged && contextTokenUpperBound([...selected, candidate]) <= budget) {
      selected.push(candidate);
    }
  }
  return selected;
}
