// CSS color variables - these should match the values in index.css
// This allows TypeScript/JavaScript code to use the same color values
export const COLORS = {
  primary: '#1e293b',
  primaryLight: '#334155',
  primaryDark: '#0f172a',
  accent: '#334155',
  accentLight: '#475569',
  accentDark: '#1e293b',
} as const;

// Helper to get CSS variable value
export const getCSSVariable = (varName: string): string => {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
};

// Get default color from CSS variable or fallback to constant
export const getDefaultColor = (): string => {
  if (typeof window === 'undefined') return COLORS.accent;
  const cssColor = getCSSVariable('--color-accent');
  return cssColor || COLORS.accent;
};

// Get CSS variable string for inline styles
export const getCSSVar = (varName: string, fallback?: string): string => {
  return fallback ? `var(${varName}, ${fallback})` : `var(${varName})`;
};

