export const colors = {
  brand: {
    50: 'oklch(var(--brand-50))',
    500: 'oklch(var(--brand-500))',
    950: 'oklch(var(--brand-950))',
  },
  bg: 'oklch(var(--bg))',
  fg: 'oklch(var(--fg))',
} as const;

export const gradients = {
  brand: 'linear-gradient(90deg, oklch(var(--brand-500)) 0%, oklch(var(--brand-50)) 100%)',
} as const;

export const fonts = {
  sans: 'var(--font-sans)',
  mono: 'var(--font-mono)',
  display: 'var(--font-display)',
} as const;

export const radius = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
} as const;

export const shadows = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
} as const;

export const spacing = {
  1: 'var(--space-1)',
  2: 'var(--space-2)',
  3: 'var(--space-3)',
  4: 'var(--space-4)',
} as const;

export const animation = {
  easeInOut: 'var(--ease-in-out)',
  spring: 'var(--spring)',
} as const;


