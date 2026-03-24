/**
 * Text normalization utilities for accent-insensitive and case-insensitive matching.
 * Used across all fraud detection heuristics.
 */

/**
 * Remove Portuguese and common diacritics from a string.
 * á→a, ã→a, â→a, à→a, é→e, ê→e, í→i, ó→o, ô→o, õ→o, ú→u, ü→u, ç→c, ñ→n
 */
export function removeAccents(text: string): string {
  // biome-ignore lint/suspicious/noMisleadingCharacterClass: unicode range for combining diacritical marks
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Normalize text for comparison: lowercase, remove accents, collapse whitespace.
 * Alias: normalizeText (used by publicServicesDirectory.ts)
 */
export function normalizeText(text: string): string {
  return removeAccents(text.toLowerCase())
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Alias for normalizeText — used by heuristic modules.
 */
export function normalizeForMatching(text: string): string {
  return normalizeText(text);
}

/**
 * Check if a normalized haystack contains a normalized needle.
 */
export function normalizedIncludes(haystack: string, needle: string): boolean {
  return normalizeForMatching(haystack).includes(normalizeForMatching(needle));
}

/**
 * Check if text contains any of the given keywords (normalized matching).
 * Used by publicServicesDirectory.ts and other modules.
 */
export function containsAnyKeyword(text: string, keywords: string[]): boolean {
  const normalizedText = normalizeForMatching(text);
  return keywords.some((kw) =>
    normalizedText.includes(normalizeForMatching(kw)),
  );
}

/**
 * Count occurrences of a keyword in text (normalized matching).
 */
export function countOccurrences(text: string, keyword: string): number {
  const normalized = normalizeText(text);
  const normalizedKeyword = normalizeText(keyword);

  let count = 0;
  let index = 0;

  let pos = normalized.indexOf(normalizedKeyword, index);
  while (pos !== -1) {
    count++;
    index = pos + normalizedKeyword.length;
    pos = normalized.indexOf(normalizedKeyword, index);
  }

  return count;
}

/**
 * Detect proximity of two keywords within a configurable word window.
 * Returns true if both keywords appear within `windowSize` words of each other.
 */
export function detectProximity(
  text: string,
  keyword1: string,
  keyword2: string,
  windowSize = 5,
): boolean {
  const normalized = normalizeForMatching(text);
  const words = normalized.split(/\s+/);
  const norm1 = normalizeForMatching(keyword1);
  const norm2 = normalizeForMatching(keyword2);

  for (let i = 0; i < words.length; i++) {
    if (words[i].includes(norm1)) {
      for (
        let j = Math.max(0, i - windowSize);
        j <= Math.min(words.length - 1, i + windowSize);
        j++
      ) {
        if (j !== i && words[j].includes(norm2)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Detect compound expressions: checks if all parts of a compound phrase
 * appear within a configurable word window.
 */
export function detectCompoundExpression(
  text: string,
  parts: string[],
  windowSize = 5,
): boolean {
  if (parts.length < 2) return false;
  const normalized = normalizeForMatching(text);
  const words = normalized.split(/\s+/);
  const normParts = parts.map(normalizeForMatching);

  for (let i = 0; i < words.length; i++) {
    if (words[i].includes(normParts[0])) {
      const allFound = normParts.slice(1).every((part) => {
        for (
          let j = Math.max(0, i - windowSize);
          j <= Math.min(words.length - 1, i + windowSize);
          j++
        ) {
          if (words[j].includes(part)) return true;
        }
        return false;
      });
      if (allFound) return true;
    }
  }
  return false;
}
