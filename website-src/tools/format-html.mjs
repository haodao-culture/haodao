import { format } from 'prettier';

// Strict whitespace handling preserves spacing around inline elements.
export function formatHtml(html) {
  return format(html, {
    parser: 'html',
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    endOfLine: 'lf',
    htmlWhitespaceSensitivity: 'strict',
    embeddedLanguageFormatting: 'off',
  });
}
