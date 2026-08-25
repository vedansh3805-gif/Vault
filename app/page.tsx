"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { defaultPasswordOptions, generatePassword, type PasswordOptions } from "@/lib/password-generator";
import { calculatePasswordStrength } from "@/lib/password-strength";
import { themeDetails, themes, type Theme } from "@/lib/themes";

type IconName = "copy" | "check" | "eye" | "eyeOff" | "refresh" | "shield" | "chevron" | "lock" | "spark";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, React.ReactNode> = {
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>, check: <path d="m5 12 4 4L19 6" />,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>, eyeOff: <><path d="m3 3 18 18" /><path d="M10.6 6.3A10.5 10.5 0 0 1 12 6c6.5 0 10 6 10 6a18 18 0 0 1-3.1 3.7M6.2 6.2C3.6 8 2 12 2 12s3.5 6 10 6c.9 0 1.8-.1 2.6-.4" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14.9-3M4 5v4h4" /><path d="M4 13a8 8 0 0 0 14.9 3M20 19v-4h-4" /></>, shield: <path d="M12 3 4.5 6v5c0 4.7 3.1 8.7 7.5 10 4.4-1.3 7.5-5.3 7.5-10V6L12 3Z" />,
    chevron: <path d="m7 10 5 5 5-5" />, lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>, spark: <path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z" />,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const optionsMeta: { key: keyof Pick<PasswordOptions, "uppercase" | "lowercase" | "numbers" | "symbols">; label: string; detail: string }[] = [
  { key: "uppercase", label: "Uppercase", detail: "A–Z" }, { key: "lowercase", label: "Lowercase", detail: "a–z" }, { key: "numbers", label: "Numbers", detail: "0–9" }, { key: "symbols", label: "Symbols", detail: "! @ # …" },
];

export default function Home() {
  const [options, setOptions] = useState<PasswordOptions>(defaultPasswordOptions);
  const [password, setPassword] = useState(""); const [revealed, setRevealed] = useState(true); const [copied, setCopied] = useState(false); const [error, setError] = useState("");
  const [theme, setTheme] = useState<Theme>("midnight"); const [themeOpen, setThemeOpen] = useState(false); const [multiCount, setMultiCount] = useState<0 | 5 | 10 | 20>(0); const [batch, setBatch] = useState<string[]>([]);
  const create = useCallback((nextOptions = options): string | null => { try { const next = generatePassword(nextOptions); setPassword(next); setError(""); setCopied(false); return next; } catch (reason) { setError(reason instanceof Error ? reason.message : "We could not generate a password with these settings."); return null; } }, [options]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setPassword(generatePassword(defaultPasswordOptions)); }
      catch { setError("Your browser does not support secure password generation."); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem("vault-theme");
      if (saved && themes.includes(saved as Theme)) setTheme(saved as Theme);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; window.localStorage.setItem("vault-theme", theme); }, [theme]);
  useEffect(() => { const keyboard = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); create(); } }; window.addEventListener("keydown", keyboard); return () => window.removeEventListener("keydown", keyboard); }, [create]);
  const strength = useMemo(() => calculatePasswordStrength(password, options), [password, options]);
  const update = <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => setOptions((current) => ({ ...current, [key]: value }));
  const makeBatch = (count: 5 | 10 | 20) => { try { setBatch(Array.from({ length: count }, () => generatePassword(options))); setError(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not generate the set."); } };
  const regenerate = () => { const next = create(); if (next && multiCount) makeBatch(multiCount); };
  const copy = async (value = password) => { try { if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable"); await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setError("Clipboard access was unavailable. Select the password and copy it manually."); } };
  const selectTheme = (next: Theme) => { setTheme(next); setThemeOpen(false); };
  return <main className="site-shell">
    <nav className="nav" aria-label="Primary navigation"><a className="brand" href="#generator" aria-label="Vault home"><span className="brand-mark"><Icon name="shield" size={19} /></span><span>VAULT</span></a><div className="nav-links"><a href="#generator">Generator</a><a href="#privacy">Privacy</a><a href="#about">About</a></div><div className="theme-wrap"><button className="theme-button" onClick={() => setThemeOpen((open) => !open)} aria-label={`Select theme: ${themeDetails[theme].name}`} aria-expanded={themeOpen} aria-controls="theme-menu"><span className="theme-dot" /><span className="hide-mobile">{themeDetails[theme].name}</span><Icon name="chevron" size={15} /></button>{themeOpen && <div className="theme-menu" id="theme-menu" role="menu" aria-label="Choose a theme">{themes.map((item) => <button key={item} onClick={() => selectTheme(item)} className={item === theme ? "active" : ""} role="menuitem"><span className={`theme-swatch ${item}`} /><span><b>{themeDetails[item].name}</b><small>{themeDetails[item].description}</small></span>{item === theme && <Icon name="check" size={16} />}</button>)}</div>}</div></nav>
    <section className="hero" id="generator"><div className="eyebrow"><span className="pulse" /> Privacy-first security</div><h1>Stronger passwords,<br /><em>without compromise.</em></h1><p>Generate secure, unique passwords directly in your browser. Nothing is uploaded, stored, or tracked.</p></section>
    <section className="generator-card" aria-labelledby="generator-heading"><div className="card-heading"><div><span className="section-kicker">Password generator</span><h2 id="generator-heading">Create a secure password</h2></div><div className="secure-status"><Icon name="lock" size={14} /> Local only</div></div><div className="password-box"><output className={`password-output ${revealed ? "" : "masked"}`} aria-live="polite" aria-label={revealed ? "Generated password" : "Password hidden"}>{password ? (revealed ? password : "•".repeat(password.length)) : "Generating…"}</output><div className="password-actions"><button onClick={() => setRevealed((value) => !value)} aria-label={revealed ? "Hide password" : "Show password"} title={revealed ? "Hide password" : "Show password"}><Icon name={revealed ? "eyeOff" : "eye"} /></button><button onClick={() => copy()} aria-label="Copy password" className={copied ? "copied" : ""}>{copied ? <Icon name="check" /> : <Icon name="copy" />}<span className="copy-label">{copied ? "Copied" : "Copy"}</span></button></div></div><div className="strength-row"><div><span className="strength-title">Strength</span><strong>{strength.level}</strong><small>{strength.label} · {options.length} characters</small></div><div className="meter" aria-label={`Password strength: ${strength.level}`}><span style={{ width: `${strength.score * 20}%` }} /></div></div>
      <div className="control-section length-control"><div className="control-label"><label htmlFor="length">Password length</label><output>{options.length}</output></div><input id="length" type="range" min="8" max="128" value={options.length} onChange={(event) => update("length", Number(event.target.value))} /><div className="range-labels"><span>8</span><span>128</span></div></div><div className="control-section"><div className="control-label"><span>Character options</span><small>Use at least one character type.</small></div><div className="options-grid">{optionsMeta.map(({ key, label, detail }) => <label className={`option-toggle ${options[key] ? "checked" : ""}`} key={key}><input type="checkbox" checked={options[key]} onChange={(event) => update(key, event.target.checked)} /><span className="checkmark">{options[key] && <Icon name="check" size={14} />}</span><span><b>{label}</b><small>{detail}</small></span></label>)}</div></div>
      <details className="advanced"><summary><span><Icon name="spark" size={16} /> Advanced controls</span><Icon name="chevron" size={17} /></summary><div className="advanced-options"><label><input type="checkbox" checked={options.excludeAmbiguous} onChange={(event) => update("excludeAmbiguous", event.target.checked)} /><span><b>Exclude ambiguous characters</b><small>Removes O, 0, I, l, and 1.</small></span></label><label><input type="checkbox" checked={options.avoidRepeated} onChange={(event) => update("avoidRepeated", event.target.checked)} /><span><b>Avoid repeated characters</b><small>Every character appears only once.</small></span></label><label><input type="checkbox" checked={options.avoidSequential} onChange={(event) => update("avoidSequential", event.target.checked)} /><span><b>Avoid sequential characters</b><small>Blocks runs such as abc or 123.</small></span></label></div></details>{error && <p className="error-message" role="alert">{error}</p>}<button className="generate-button" onClick={regenerate}>Generate password</button><p className="privacy-line"><Icon name="shield" size={15} /> Generated locally in your browser. Never sent to a server.</p></section>
    <section className="batch-section" aria-labelledby="multiple-heading"><div><span className="section-kicker">Batch generator</span><h2 id="multiple-heading">Need more than one?</h2><p>Create a short set of distinct passwords. They stay only in this page session.</p></div><div className="batch-controls" aria-label="Batch size">{([5, 10, 20] as const).map((count) => <button key={count} onClick={() => { setMultiCount(count); makeBatch(count); }}>{count} passwords</button>)}</div>{batch.length > 0 && <div className="batch-list"><div className="batch-header"><span>{batch.length} freshly generated passwords</span><button onClick={() => copy(batch.join("\n"))}><Icon name="copy" size={15} /> Copy all</button></div>{batch.map((item, index) => <div className="batch-item" key={`${item}-${index}`}><code>{item}</code><span>{calculatePasswordStrength(item, options).level}</span><button onClick={() => copy(item)} aria-label={`Copy password ${index + 1}`}><Icon name="copy" size={16} /></button></div>)}</div>}</section>
    <section className="trust-grid" id="privacy"><article><span className="trust-icon"><Icon name="lock" /></span><h2>Private by design</h2><p>Passwords are created with your browser’s cryptographic random-number generator. They never leave your device.</p></article><article><span className="trust-icon"><Icon name="shield" /></span><h2>Clear security model</h2><p>No accounts, databases, trackers, or password analytics. You can inspect every part of the app.</p></article><article id="about"><span className="trust-icon"><Icon name="spark" /></span><h2>Made for focus</h2><p>Thoughtful defaults and flexible controls give you a strong password in seconds, without the clutter.</p></article></section><footer><span>© {new Date().getFullYear()} VAULT</span><span>Built for private, everyday security.</span></footer>
  </main>;
}
