import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      black: "hsl(180, 40%, 14%)",
      grey: "hsl(212, 30%, 66%)",
      white: "hsl(240, 14%, 97%)",
      danger: "hsl(341, 73%, 66%)",
      warning: "hsl(55, 92%, 58%)",
      info: "hsl(187, 62%, 66%)",
      success: "hsl(165, 74%, 57%)",
    },
    extend: {},
  },
  plugins: [],
} satisfies Config;
