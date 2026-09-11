/** @type {import('tailwindcss').Config} */
function withOpacity(varName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${varName}) / ${opacityValue})`;
    }
    return `rgb(var(${varName}))`;
  };
}

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "canvas-bg": withOpacity('--canvas-bg'),
        "canvas-bg-alt": withOpacity('--canvas-bg-alt'),
        "surface-card": withOpacity('--surface-card'),
        "surface-well": withOpacity('--surface-well'),
        "surface-dim": withOpacity('--surface-dim'),
        "surface-bright": withOpacity('--surface-bright'),
        "surface-container-lowest": withOpacity('--surface-container-lowest'),
        "surface-container-low": withOpacity('--surface-container-low'),
        "surface-container": withOpacity('--surface-container'),
        "surface-container-high": withOpacity('--surface-container-high'),
        "surface-container-highest": withOpacity('--surface-container-highest'),
        "border-subtle": withOpacity('--border-subtle'),
        "border-strong": withOpacity('--border-strong'),
        "text-primary": withOpacity('--text-primary'),
        "text-secondary": withOpacity('--text-secondary'),
        "text-muted": withOpacity('--text-muted'),
        "primary": withOpacity('--primary'),
        "primary-container": withOpacity('--primary-container'),
        "primary-surface": withOpacity('--primary-surface'),
        "primary-border": withOpacity('--primary-border'),
        "primary-saffron": withOpacity('--primary-saffron'),
        "primary-fixed": withOpacity('--primary-fixed'),
        "primary-fixed-dim": withOpacity('--primary-fixed-dim'),
        "on-primary": withOpacity('--on-primary'),
        "on-primary-container": withOpacity('--on-primary-container'),
        "secondary": withOpacity('--secondary'),
        "secondary-surface": withOpacity('--secondary-surface'),
        "secondary-border": withOpacity('--secondary-border'),
        "secondary-container": withOpacity('--secondary-container'),
        "on-secondary": withOpacity('--on-secondary'),
        "on-secondary-container": withOpacity('--on-secondary-container'),
        "tertiary": withOpacity('--tertiary'),
        "tertiary-container": withOpacity('--tertiary-container'),
        "on-tertiary": withOpacity('--on-tertiary'),
        "on-tertiary-container": withOpacity('--on-tertiary-container'),
        "outline": withOpacity('--outline'),
        "outline-variant": withOpacity('--outline-variant'),
        "error": withOpacity('--error'),
        "error-container": withOpacity('--error-container'),
        "on-error": withOpacity('--on-error'),
        "on-error-container": withOpacity('--on-error-container'),
        "zone-core": withOpacity('--zone-core'),
        "zone-core-bg": withOpacity('--zone-core-bg'),
        "zone-core-border": withOpacity('--zone-core-border'),
        "zone-regulated": withOpacity('--zone-regulated'),
        "zone-regulated-bg": withOpacity('--zone-regulated-bg'),
        "zone-regulated-border": withOpacity('--zone-regulated-border'),
        "zone-survey": withOpacity('--zone-survey'),
        "zone-survey-bg": withOpacity('--zone-survey-bg'),
        "zone-survey-border": withOpacity('--zone-survey-border'),
        "interactive-focus": withOpacity('--interactive-focus'),
        "accent-cyan": withOpacity('--accent-cyan'),
        "accent-cyan-bg": withOpacity('--accent-cyan-bg'),
        "accent-amber": withOpacity('--accent-amber'),
        "accent-violet": withOpacity('--accent-violet'),
        "slate-850": "#172033",
        sandstone: {
          50: '#fdfbf7',
          100: '#f7f1e6',
          200: '#ede0c8',
          300: '#dfc9a3',
          400: '#cdac7b',
          500: '#b88d55',
          600: '#9e7343',
          700: '#7f5936',
          800: '#67482f',
          900: '#563c29',
          950: '#301f14',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        'code-telemetry': ['JetBrains Mono', 'monospace'],
        'code-dossier': ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      boxShadow: {
        '2xs': '0 1px 1px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'glow-cyan': '0 0 0 1px rgb(var(--accent-cyan) / 0.25), 0 8px 24px -6px rgb(var(--accent-cyan) / 0.35)',
      },
      dropShadow: {
        'xs': '0 1px 1px rgba(0, 0, 0, 0.05)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      spacing: {
        '18': '4.5rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        zoomIn95: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideFromTop2: {
          '0%': { opacity: '0', transform: 'translateY(-0.5rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'in': 'fadeIn 0.2s ease-out',
        'zoom-in-95': 'zoomIn95 0.2s ease-out',
        'slide-in-from-top-2': 'slideFromTop2 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
