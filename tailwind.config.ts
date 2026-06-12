import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
      container: {
          center: true,
          padding: '2rem',
          screens: {
              '2xl': '1400px'
          }
      },
      extend: {
          colors: {
              border: 'hsl(var(--border))',
              input: 'hsl(var(--input))',
              ring: 'hsl(var(--ring))',
              background: 'hsl(var(--background))',
              foreground: 'hsl(var(--foreground))',
              primary: {
                  DEFAULT: 'hsl(var(--primary))',
                  foreground: 'hsl(var(--primary-foreground))',
                  hover: 'var(--accent-hover)'
              },
              secondary: {
                  DEFAULT: 'hsl(var(--secondary))',
                  foreground: 'hsl(var(--secondary-foreground))'
              },
              destructive: {
                  DEFAULT: 'hsl(var(--destructive))',
                  foreground: 'hsl(var(--destructive-foreground))'
              },
              warning: 'hsl(var(--warning))',
              muted: {
                  DEFAULT: 'hsl(var(--muted))',
                  foreground: 'hsl(var(--muted-foreground))'
              },
              accent: {
                  DEFAULT: 'hsl(var(--accent))',
                  foreground: 'hsl(var(--accent-foreground))'
              },
              popover: {
                  DEFAULT: 'hsl(var(--popover))',
                  foreground: 'hsl(var(--popover-foreground))'
              },
              card: {
                  DEFAULT: 'hsl(var(--card))',
                  foreground: 'hsl(var(--card-foreground))'
              },
              sidebar: {
                  DEFAULT: 'hsl(var(--sidebar-background))',
                  foreground: 'hsl(var(--sidebar-foreground))',
                  primary: 'hsl(var(--sidebar-primary))',
                  'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                  accent: 'hsl(var(--sidebar-accent))',
                  'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                  border: 'hsl(var(--sidebar-border))',
                  ring: 'hsl(var(--sidebar-ring))'
              }
          },
          /* --radius is 0.5rem: sm 4px, md 6px (buttons/inputs),
             lg 8px (cards), xl 12px (modals) — per ui-context.md */
          borderRadius: {
              xl: 'calc(var(--radius) + 4px)',
              lg: 'var(--radius)',
              md: 'calc(var(--radius) - 2px)',
              sm: 'calc(var(--radius) - 4px)'
          },
        keyframes: {
            'accordion-down': {
                from: { height: '0' },
                to: { height: 'var(--radix-accordion-content-height)' }
            },
            'accordion-up': {
                from: { height: 'var(--radix-accordion-content-height)' },
                to: { height: '0' }
            },
            'fade-in': {
                '0%': { opacity: '0', transform: 'translateY(10px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' }
            },
            'scale-in': {
                '0%': { transform: 'scale(0.95)', opacity: '0' },
                '100%': { transform: 'scale(1)', opacity: '1' }
            },
            'slide-up': {
                '0%': { opacity: '0', transform: 'translateY(20px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' }
            },
            'slide-down': {
                '0%': { opacity: '0', transform: 'translateY(-20px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' }
            },
            'shimmer': {
                '0%': { transform: 'translateX(-100%)' },
                '100%': { transform: 'translateX(100%)' }
            },
            'bounce-subtle': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-5px)' }
            },
            'pulse-soft': {
                '0%, 100%': { opacity: '1' },
                '50%': { opacity: '0.8' }
            }
        },
        animation: {
            'accordion-down': 'accordion-down 0.2s ease-out',
            'accordion-up': 'accordion-up 0.2s ease-out',
            'fade-in': 'fade-in 0.4s ease-out',
            'scale-in': 'scale-in 0.3s ease-out',
            'slide-up': 'slide-up 0.5s ease-out',
            'slide-down': 'slide-down 0.5s ease-out',
            'shimmer': 'shimmer 2s infinite',
            'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
            'pulse-soft': 'pulse-soft 2s ease-in-out infinite'
        },
          boxShadow: {
              '2xs': 'var(--shadow-2xs)',
              xs: 'var(--shadow-xs)',
              sm: 'var(--shadow-sm)',
              md: 'var(--shadow-md)',
              lg: 'var(--shadow-lg)',
              xl: 'var(--shadow-xl)',
              '2xl': 'var(--shadow-2xl)',
              card: 'var(--shadow-card)',
              modal: 'var(--shadow-modal)'
          },
          fontFamily: {
              sans: ['var(--font-sans)'],
              mono: ['var(--font-mono)']
          },
          /* Type scale from ui-context.md (sizes, line heights, tracking;
             weights applied via font-* utilities). 2xs is the 11px mono
             metadata size. */
          fontSize: {
              '2xs': ['11px', { lineHeight: '16px' }],
              xs: ['12px', { lineHeight: '16px' }],
              sm: ['14px', { lineHeight: '20px' }],
              base: ['16px', { lineHeight: '24px' }],
              lg: ['18px', { lineHeight: '26px', letterSpacing: '-0.005em' }],
              xl: ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
              '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
              '3xl': ['30px', { lineHeight: '38px', letterSpacing: '-0.02em' }],
              '5xl': ['48px', { lineHeight: '53px', letterSpacing: '-0.02em' }]
          },
          borderColor: {
              strong: 'var(--border-strong)'
          },
          /* Motion durations from the ui-context.md motion table. */
          transitionDuration: {
              '120': '120ms',
              '160': '160ms'
          },
          /* Layout sizes from ui-context.md. */
          maxWidth: {
              content: '1200px',
              hero: '680px'
          },
          /* Tool grid: 260px min cards, auto-fill (ui-context.md). */
          gridTemplateColumns: {
              tools: 'repeat(auto-fill, minmax(260px, 1fr))'
          }
      }
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
