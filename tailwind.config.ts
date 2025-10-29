import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@shadcn/ui/dist/*.{js,ts}',
  ],
  theme: {
    extend: {},
  },
};

export default config;


