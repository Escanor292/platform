import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Thay thế toàn bộ viền/text Đen/Xám thô cứng thành Tông Xanh Than (Slate/Navy) mềm mại
        gray: {
          ...colors.slate,
          900: "#091428", // Deep Navy Blue (Thay thế đen tuyền)
          800: "#0f1f38",
        },
        green: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#10b981", // Emerald
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        blue: {
          50: "#eff6ff",
          100: "#dbeafe",
          600: "#2563eb", // Sapphire
          700: "#1d4ed8",
        },
        momo: "#a50064",
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
        'premium': '0 20px 60px -15px rgba(37, 99, 235, 0.1)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
