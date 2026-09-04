import { prisma } from '@/lib/prisma';

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

export const DEFAULT_BANNED_WORDS: Array<{ value: string; reason: string }> = [
  { value: 'lồn', reason: 'Từ tục' },
  { value: 'cặc', reason: 'Từ tục' },
  { value: 'buồi', reason: 'Từ tục' },
  { value: 'đĩ', reason: 'Từ tục' },
  { value: 'điếm', reason: 'Từ tục' },
  { value: 'đụ', reason: 'Từ tục' },
  { value: 'địt', reason: 'Từ tục' },
  { value: 'đéo', reason: 'Từ tục' },
  { value: 'đmm', reason: 'Từ tục' },
  { value: 'đcm', reason: 'Từ tục' },
  { value: 'vcl', reason: 'Từ tục' },
  { value: 'clgt', reason: 'Từ tục' },
  { value: 'cmm', reason: 'Từ tục' },
  { value: 'dmm', reason: 'Từ tục' },
  { value: 'fuck', reason: 'Từ tục' },
  { value: 'shit', reason: 'Từ tục' },
  { value: 'bitch', reason: 'Từ tục' },
  { value: 'asshole', reason: 'Từ tục' },
  { value: 'pussy', reason: 'Từ tục' },
  { value: 'dick', reason: 'Từ tục' },
  { value: 'whore', reason: 'Từ tục' },
  { value: 'slut', reason: 'Từ tục' },
  { value: 'porn', reason: 'Nội dung khiêu dâm' },
  { value: 'xxx', reason: 'Nội dung khiêu dâm' },
  { value: 'sex tape', reason: 'Nội dung khiêu dâm' },
  { value: 'khiêu dâm', reason: 'Nội dung khiêu dâm' },
  { value: 'sextoy', reason: 'Nội dung khiêu dâm' },
  { value: 'gái gọi', reason: 'Nội dung khiêu dâm' },
  { value: 'bán dâm', reason: 'Nội dung khiêu dâm' },
  { value: 'cờ bạc', reason: 'Cờ bạc / cá độ' },
  { value: 'cá độ', reason: 'Cờ bạc / cá độ' },
  { value: 'đánh bạc', reason: 'Cờ bạc / cá độ' },
  { value: 'casino', reason: 'Cờ bạc / cá độ' },
  { value: 'lô đề', reason: 'Cờ bạc / cá độ' },
  { value: 'ma túy', reason: 'Chất cấm' },
  { value: 'ma tuý', reason: 'Chất cấm' },
  { value: 'heroin', reason: 'Chất cấm' },
  { value: 'cocaine', reason: 'Chất cấm' },
  { value: 'cần sa', reason: 'Chất cấm' },
  { value: 'thuốc lắc', reason: 'Chất cấm' },
  { value: 'súng đạn', reason: 'Vũ khí' },
  { value: 'vũ khí', reason: 'Vũ khí' },
  { value: 'đa cấp', reason: 'Lừa đảo / đa cấp' },
  { value: 'ponzi', reason: 'Lừa đảo / đa cấp' },
  { value: 'lùa gà', reason: 'Lừa đảo' },
  { value: 'tín dụng đen', reason: 'Cho vay nặng lãi' },
  { value: 'nặng lãi', reason: 'Cho vay nặng lãi' },
  { value: 'rửa tiền', reason: 'Tội phạm tài chính' },
];

export async function ensureDefaultBannedWords(addedBy?: string) {
  await prisma.blacklist.createMany({
    data: DEFAULT_BANNED_WORDS.map((word) => ({
      id: crypto.randomUUID(),
      type: 'WORD' as any,
      value: word.value,
      reason: word.reason,
      addedBy: addedBy || null,
      isActive: true,
      updatedAt: new Date(),
    })),
    skipDuplicates: true,
  });
}

export async function findBannedWord(texts: Array<string | null | undefined>) {
  const haystack = normalize(texts.filter(Boolean).join('\n'));
  if (!haystack) return null;

  let words = await prisma.blacklist.findMany({
    where: { type: 'WORD' as any, isActive: true },
    select: { value: true },
  });
  if (words.length === 0) {
    await ensureDefaultBannedWords();
    words = await prisma.blacklist.findMany({
      where: { type: 'WORD' as any, isActive: true },
      select: { value: true },
    });
  }

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
