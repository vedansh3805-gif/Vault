import { CHARACTER_SETS, type PasswordOptions } from "./password-generator";

export type StrengthLevel = "Weak" | "Fair" | "Good" | "Strong" | "Very Strong";

export type PasswordStrength = {
  level: StrengthLevel;
  score: number;
  entropy: number;
  label: string;
};

export function calculatePasswordStrength(password: string, options?: PasswordOptions): PasswordStrength {
  const source = options
    ? Object.entries(CHARACTER_SETS)
        .filter(([key]) => options[key as keyof typeof CHARACTER_SETS])
        .map(([, set]) => set)
        .join("")
    : password;
  const poolSize = Math.max(1, new Set(source).size);
  const entropy = password.length * Math.log2(poolSize);
  const score = entropy < 28 ? 1 : entropy < 45 ? 2 : entropy < 62 ? 3 : entropy < 80 ? 4 : 5;
  const level: StrengthLevel[] = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
  return { level: level[score - 1], score, entropy: Math.round(entropy), label: `${Math.round(entropy)} bits estimated entropy` };
}
