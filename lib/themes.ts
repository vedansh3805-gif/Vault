export const themes = ["midnight", "aurora", "obsidian", "arctic", "light"] as const;
export type Theme = (typeof themes)[number];

export const themeDetails: Record<Theme, { name: string; description: string }> = {
  midnight: { name: "Midnight", description: "Deep navy security" },
  aurora: { name: "Aurora", description: "Vivid dark accents" },
  obsidian: { name: "Obsidian", description: "Pure black minimalism" },
  arctic: { name: "Arctic", description: "Cool and composed" },
  light: { name: "Light", description: "Clean professional" },
};
