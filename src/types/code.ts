// ─── Code Snippet Types ────────────────────────────────────────────────────────

export interface CodeSettings {
  /** The raw code string entered by the user */
  codeContent: string;
  /** Language for syntax highlighting */
  codeLanguage: CodeLanguage;
  /** Shiki colour theme */
  codeTheme: CodeTheme;
  /** Font size in px for code rendering */
  codeFontSize: number;
  /** Whether to show line numbers */
  codeShowLineNumbers: boolean;
  /** Window title displayed in the title-bar */
  codeWindowTitle: string;
}

export const defaultCodeSettings: CodeSettings = {
  codeContent: "",
  codeLanguage: "typescript",
  codeTheme: "github-dark",
  codeFontSize: 14,
  codeShowLineNumbers: true,
  codeWindowTitle: "untitled",
};

// ─── Supported languages ──────────────────────────────────────────────────────

export type CodeLanguage =
  | "typescript"
  | "javascript"
  | "python"
  | "json"
  | "html"
  | "css"
  | "bash"
  | "go"
  | "rust"
  | "java"
  | "cpp"
  | "sql";

export interface CodeLanguageOption {
  value: CodeLanguage;
  label: string;
}

export const codeLanguageOptions: CodeLanguageOption[] = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "json", label: "JSON" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "bash", label: "Bash" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "sql", label: "SQL" },
];

// ─── Supported themes ─────────────────────────────────────────────────────────

export type CodeTheme =
  | "github-dark"
  | "github-light"
  | "dracula"
  | "nord"
  | "vitesse-dark"
  | "one-dark-pro"
  | "catppuccin-mocha"
  | "min-dark"
  | "slack-dark";

export interface CodeThemeOption {
  value: CodeTheme;
  label: string;
  /** Background colour for the swatch preview */
  bg: string;
}

export const codeThemeOptions: CodeThemeOption[] = [
  { value: "github-dark", label: "GitHub Dark", bg: "#24292e" },
  { value: "github-light", label: "GitHub Light", bg: "#ffffff" },
  { value: "dracula", label: "Dracula", bg: "#282a36" },
  { value: "nord", label: "Nord", bg: "#2e3440" },
  { value: "vitesse-dark", label: "Vitesse Dark", bg: "#121212" },
  { value: "one-dark-pro", label: "One Dark Pro", bg: "#282c34" },
  { value: "catppuccin-mocha", label: "Catppuccin Mocha", bg: "#1e1e2e" },
  { value: "min-dark", label: "Min Dark", bg: "#1f1f1f" },
  { value: "slack-dark", label: "Slack Dark", bg: "#222222" },
];
