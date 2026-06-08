/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Existing colors
        accent: '#3b82f6',
        dark: '#0f172a',
        light: '#f8fafc',
        
        // Custom WineSoft Theme Colors
        "on-primary": "#ffffff",
        "on-surface": "#0b1c30",
        "on-error-container": "#93000a",
        "surface-container": "#e5eeff",
        "on-background": "#0b1c30",
        "primary": "#780026",
        "surface-container-low": "#eff4ff",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#005c3f",
        "on-primary-container": "#ffadb6",
        "on-tertiary-container": "#64d7a5",
        "background": "#f8f9ff",
        "surface-tint": "#b32446",
        "secondary-fixed-dim": "#b4c5ff",
        "tertiary-fixed": "#85f8c4",
        "primary-fixed-dim": "#ffb2ba",
        "on-secondary-container": "#fefcff",
        "tertiary-fixed-dim": "#68dba9",
        "on-surface-variant": "#594143",
        "inverse-surface": "#213145",
        "outline": "#8c7072",
        "inverse-primary": "#ffb2ba",
        "error-container": "#ffdad6",
        "secondary": "#0051d5",
        "surface": "#f8f9ff",
        "on-primary-fixed-variant": "#910130",
        "surface-bright": "#f8f9ff",
        "secondary-container": "#316bf3",
        "error": "#ba1a1a",
        "inverse-on-surface": "#eaf1ff",
        "tertiary": "#00422c",
        "surface-dim": "#cbdbf5",
        "secondary-fixed": "#dbe1ff",
        "primary-fixed": "#ffd9dc",
        "on-primary-fixed": "#400010",
        "on-error": "#ffffff",
        "surface-container-high": "#dce9ff",
        "surface-variant": "#d3e4fe",
        "on-tertiary-fixed-variant": "#005137",
        "on-tertiary-fixed": "#002114",
        "on-secondary-fixed-variant": "#003ea8",
        "surface-container-highest": "#d3e4fe",
        "on-secondary": "#ffffff",
        "on-secondary-fixed": "#00174b",
        "surface-container-lowest": "#ffffff",
        "primary-container": "#9f1239",
        "outline-variant": "#e0bec1"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "section-margin": "2rem",
        "element-gap": "1rem",
        "touch-target": "2.75rem",
        "grid-gutter": "1.5rem",
        "container-padding": "1.5rem"
      },
      fontFamily: {
        "body-sm": ["Inter"],
        "headline-lg-mobile": ["Inter"],
        "headline-lg": ["Inter"],
        "headline-md": ["Inter"],
        "body-lg": ["Inter"],
        "headline-xl": ["Inter"],
        "body-md": ["Inter"],
        "label-sm": ["Inter"],
        "label-md": ["Inter"],
        "headline-sm": ["Inter"]
      },
      fontSize: {
        "body-sm": ["14px", { "lineHeight": "20px", "letterSpacing": "0", "fontWeight": "400" }],
        "headline-lg-mobile": ["28px", { "lineHeight": "34px", "fontWeight": "600" }],
        "headline-lg": ["30px", { "lineHeight": "38px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
        "headline-md": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "body-lg": ["18px", { "lineHeight": "28px", "letterSpacing": "0", "fontWeight": "400" }],
        "headline-xl": ["36px", { "lineHeight": "44px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "body-md": ["16px", { "lineHeight": "24px", "letterSpacing": "0", "fontWeight": "400" }],
        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "label-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0.02em", "fontWeight": "500" }],
        "headline-sm": ["20px", { "lineHeight": "28px", "letterSpacing": "0", "fontWeight": "600" }]
      }
    },
  },
  plugins: [],
}
