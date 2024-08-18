/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      fontWeight: {
        "poppins-light": 300,
        "poppins-regular": 500,
        "poppins-bold": 700,
      },
    },
  },
  plugins: [],
};
