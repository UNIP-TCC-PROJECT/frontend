export function applyMask(raw: string, pattern: string): string {
  const hasAlphanumericPlaceholder = pattern.includes("X");
  const characters = hasAlphanumericPlaceholder
    ? raw.toUpperCase().replace(/[^A-Z0-9]/g, "")
    : raw.replace(/\D/g, "");

  let result = "";
  let characterIndex = 0;

  for (
    let patternIndex = 0;
    patternIndex < pattern.length && characterIndex < characters.length;
    patternIndex++
  ) {
    const patternCharacter = pattern[patternIndex];

    if (patternCharacter === "9") {
      if (!/\d/.test(characters[characterIndex])) {
        break;
      }

      result += characters[characterIndex];
      characterIndex++;
    } else if (patternCharacter === "X") {
      result += characters[characterIndex];
      characterIndex++;
    } else {
      result += patternCharacter;
    }
  }

  return result;
}
