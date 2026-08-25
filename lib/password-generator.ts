export const PASSWORD_LIMITS = { min: 8, max: 128, default: 20 } as const;

export const CHARACTER_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*_-+=?",
} as const;

export type PasswordOptions = {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  avoidRepeated: boolean;
  avoidSequential: boolean;
};

export const defaultPasswordOptions: PasswordOptions = {
  length: PASSWORD_LIMITS.default,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
  avoidRepeated: false,
  avoidSequential: false,
};

const AMBIGUOUS_CHARACTERS = new Set(["O", "0", "I", "l", "1"]);

export class PasswordGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PasswordGenerationError";
  }
}

function secureRandomIndex(max: number): number {
  if (!Number.isInteger(max) || max < 1) {
    throw new PasswordGenerationError("A secure random choice needs at least one character.");
  }

  // Rejection sampling prevents modulo bias from influencing character selection.
  const ceiling = Math.floor(0x1_0000_0000 / max) * max;
  const value = new Uint32Array(1);
  do {
    globalThis.crypto.getRandomValues(value);
  } while (value[0] >= ceiling);
  return value[0] % max;
}

function securePick(characters: string): string {
  return characters[secureRandomIndex(characters.length)];
}

function removeAmbiguous(characters: string, excludeAmbiguous: boolean): string {
  return excludeAmbiguous
    ? [...characters].filter((character) => !AMBIGUOUS_CHARACTERS.has(character)).join("")
    : characters;
}

function hasSequentialRun(value: string): boolean {
  const normalized = value.toLowerCase();
  for (let index = 0; index <= normalized.length - 3; index += 1) {
    const first = normalized.charCodeAt(index);
    const second = normalized.charCodeAt(index + 1);
    const third = normalized.charCodeAt(index + 2);
    if (second === first + 1 && third === second + 1) return true;
    if (second === first - 1 && third === second - 1) return true;
  }
  return false;
}

function secureShuffle(characters: string[]): string[] {
  const shuffled = [...characters];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const replacement = secureRandomIndex(index + 1);
    [shuffled[index], shuffled[replacement]] = [shuffled[replacement], shuffled[index]];
  }
  return shuffled;
}

function validateOptions(options: PasswordOptions, enabledSets: string[]): void {
  if (!Number.isInteger(options.length) || options.length < PASSWORD_LIMITS.min || options.length > PASSWORD_LIMITS.max) {
    throw new PasswordGenerationError(`Choose a password length between ${PASSWORD_LIMITS.min} and ${PASSWORD_LIMITS.max}.`);
  }
  if (enabledSets.length === 0) {
    throw new PasswordGenerationError("Select at least one character type.");
  }
  if (options.length < enabledSets.length) {
    throw new PasswordGenerationError("The password is too short to include every enabled character type.");
  }
  const pool = enabledSets.join("");
  if (options.avoidRepeated && options.length > new Set(pool).size) {
    throw new PasswordGenerationError("This length needs more unique characters. Disable “avoid repeats” or enable another character type.");
  }
}

export function generatePassword(options: PasswordOptions): string {
  const enabledSets = Object.entries(CHARACTER_SETS)
    .filter(([key]) => options[key as keyof typeof CHARACTER_SETS])
    .map(([, characters]) => removeAmbiguous(characters, options.excludeAmbiguous))
    .filter(Boolean);

  validateOptions(options, enabledSets);
  const pool = enabledSets.join("");

  // Retrying the fully shuffled candidate keeps required categories while applying sequence rules globally.
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const selected = enabledSets.map((set) => securePick(set));
    while (selected.length < options.length) {
      const choices = options.avoidRepeated ? [...pool].filter((item) => !selected.includes(item)).join("") : pool;
      if (!choices) break;
      selected.push(securePick(choices));
    }
    if (selected.length !== options.length) continue;
    const candidate = secureShuffle(selected).join("");
    if (!options.avoidSequential || !hasSequentialRun(candidate)) return candidate;
  }

  throw new PasswordGenerationError("Those settings could not produce a password. Try allowing sequential characters.");
}

export function containsSequentialRun(value: string): boolean {
  return hasSequentialRun(value);
}
