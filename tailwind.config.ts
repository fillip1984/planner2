import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      primary: "hsl(126, 30%, 59%)",
      secondary: "hsl(128, 16%, 52%)",
      black: "hsl(180, 40%, 14%)",
      grey: "hsl(212, 30%, 66%)",
      white: "hsl(240, 14%, 97%)",
      danger: "hsl(341, 73%, 66%)",
      // warning: "hsl(55, 92%, 58%)",
      warning: "hsl(37, 96%, 61%)",
      // info: "hsl(187, 62%, 66%)",
      // info: "hsl(222, 82%, 21%)",
      info: "hsl(195, 97%, 62%)",
      // success: "hsl(165, 74%, 57%)",
      // success: "hsl(164, 100%, 30%)",
      success: "hsl(117, 55%, 65%)",
    },
    extend: {},
  },
  plugins: [],
} satisfies Config;
