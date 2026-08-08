import forms from "@tailwindcss/forms";
import containerQueries from "@tailwindcss/container-queries";

// Colors resolve to CSS variables (see styles/index.css) so the theme toggle can swap schemes.
// `<alpha-value>` keeps opacity modifiers like `bg-primary/10` working.
const role = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const COLOR_ROLES = [
  "primary", "on-primary", "primary-container", "on-primary-container",
  "primary-fixed", "primary-fixed-dim", "on-primary-fixed", "on-primary-fixed-variant",
  "secondary", "on-secondary", "secondary-container", "on-secondary-container",
  "secondary-fixed", "secondary-fixed-dim", "on-secondary-fixed", "on-secondary-fixed-variant",
  "tertiary", "on-tertiary", "tertiary-container", "on-tertiary-container",
  "tertiary-fixed", "tertiary-fixed-dim", "on-tertiary-fixed", "on-tertiary-fixed-variant",
  "error", "on-error", "error-container", "on-error-container",
  "background", "on-background", "surface", "on-surface",
  "surface-variant", "on-surface-variant", "surface-bright", "surface-dim", "surface-tint",
  "surface-container-lowest", "surface-container-low", "surface-container",
  "surface-container-high", "surface-container-highest",
  "outline", "outline-variant", "inverse-surface", "inverse-on-surface", "inverse-primary",
];

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: Object.fromEntries(COLOR_ROLES.map((n) => [n, role(n)])),
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        xs: "4px",
        base: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        gutter: "24px",
        xl: "40px",
        "2xl": "64px",
      },
      maxWidth: {
        "container-max": "1280px",
      },
      fontFamily: {
        display: ["Geist", "sans-serif"],
        "headline-lg": ["Geist", "sans-serif"],
        "headline-lg-mobile": ["Geist", "sans-serif"],
        "headline-md": ["Geist", "sans-serif"],
        "headline-sm": ["Geist", "sans-serif"],
        "label-md": ["Geist", "sans-serif"],
        "label-sm": ["Geist", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        display: ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "1", letterSpacing: "0.02em", fontWeight: "500" }],
        "label-sm": ["12px", { lineHeight: "1", fontWeight: "500" }],
      },
      keyframes: {
        "pulse-subtle": { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.6" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "none" } },
        indeterminate: { "0%": { left: "-40%" }, "100%": { left: "100%" } },
      },
      animation: {
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slide-up 240ms cubic-bezier(0.4, 0, 0.2, 1)",
        indeterminate: "indeterminate 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [forms, containerQueries],
};
