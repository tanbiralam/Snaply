"use client";

import { createHighlighter, type Highlighter, type ThemedToken } from "shiki";
import type { CodeLanguage, CodeTheme } from "@/types";

// ─── Singleton highlighter (lazy-loaded) ──────────────────────────────────────

let highlighterPromise: Promise<Highlighter> | null = null;

// ponytail: start empty, load only the lang/theme actually used (on demand).
// Avoids pulling all 12 grammars + 9 themes on first tokenize.
function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    // Reset the cache on failure so a transient error doesn't permanently
    // wedge code mode — the next call retries instead of replaying the rejection.
    highlighterPromise = createHighlighter({ themes: [], langs: [] }).catch((err) => {
      highlighterPromise = null;
      throw err;
    });
  }
  return highlighterPromise;
}

// ─── Token output type ────────────────────────────────────────────────────────

export interface CodeToken {
  content: string;
  color: string;
}

export interface TokenizedCode {
  /** One array of tokens per line */
  lines: CodeToken[][];
  /** Background colour of the theme */
  bg: string;
  /** Default foreground colour of the theme */
  fg: string;
}

// ─── Main tokenizer function ──────────────────────────────────────────────────

export async function tokenizeCode(
  code: string,
  language: CodeLanguage,
  theme: CodeTheme
): Promise<TokenizedCode> {
  const highlighter = await getHighlighter();

  if (!highlighter.getLoadedLanguages().includes(language)) {
    await highlighter.loadLanguage(language);
  }
  if (!highlighter.getLoadedThemes().includes(theme)) {
    await highlighter.loadTheme(theme);
  }

  const result = highlighter.codeToTokens(code, {
    lang: language,
    theme: theme,
  });

  const bg = result.bg || "#1a1a2e";
  const fg = result.fg || "#e1e1e1";

  const lines: CodeToken[][] = result.tokens.map((lineTokens: ThemedToken[]) =>
    lineTokens.map((token) => ({
      content: token.content,
      color: token.color || fg,
    }))
  );

  return { lines, bg, fg };
}
