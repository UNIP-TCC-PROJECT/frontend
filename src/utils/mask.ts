/**
 * Formats a raw string against a pattern where "9" is a digit placeholder
 * and any other character is a literal to be inserted automatically.
 * Example: applyMask("11987654321", "(99) 99999-9999") -> "(11) 98765-4321"
 */
export function applyMask(raw: string, pattern: string): string {
  const digits = raw.replace(/\D/g, "");

  let result = "";
  let digitIndex = 0;

  for (let i = 0; i < pattern.length && digitIndex < digits.length; i++) {
    const patternChar = pattern[i];

    if (patternChar === "9") {
      result += digits[digitIndex];
      digitIndex++;
    } else {
      result += patternChar;
    }
  }

  return result;
}
