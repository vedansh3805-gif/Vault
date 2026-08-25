import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "VAULT — Secure Password Generator", description: "Generate strong, cryptographically secure passwords locally in your browser. Fast, private, and free.", metadataBase: new URL("https://vault-password-generator.example"), openGraph: { title: "VAULT — Secure Password Generator", description: "Strong passwords, generated privately in your browser.", type: "website" }, twitter: { card: "summary", title: "VAULT — Secure Password Generator", description: "Strong passwords, generated privately in your browser." } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" suppressHydrationWarning><body>{children}</body></html>; }
