import { prisma } from '@/lib/prisma';

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

export async function findBannedWord(texts: Array<string | null | undefined>) {
  const haystack = normalize(texts.filter(Boolean).join('\n'));
  if (!haystack) return null;

  const words = await prisma.blacklist.findMany({
    where: { type: 'WORD' as any, isActive: true },
    select: { value: true },
  });

  return words.find((entry) => {
    const word = normalize(entry.value);
    return word.length > 0 && haystack.includes(word);
  })?.value ?? null;
}

export async function assertCleanContent(texts: Array<string | null | undefined>) {
  const hit = await findBannedWord(texts);
  if (!hit) return;
  const error = new Error(`Nội dung chứa từ bị cấm: “${hit}”`);
  (error as Error & { status?: number }).status = 400;
  throw error;
}
