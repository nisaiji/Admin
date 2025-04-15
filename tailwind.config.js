/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
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
      colors: {
        // balck shades
        background: "#111315",
        background1: "#1A1A1A",
        background2: "#0F0F0F",
        background3: "#262626",
        background4: "#3e3e3e",

        // white shades
        whiteBackground: "#FFFFFF",
        whiteBackground1: "#FAFAFA",
        whiteBackground2: "#E9EEF2", //100%
        whiteBackground3: "#E9EEF280", //50%

        // other background
        backgroundOrange: "#F29E3832", //20%
        backgroundOrange1: "#FF793F",
        backgroundOrange2: "#F29E3808", //5%
        backgroundRed: "#FE4040",
        backgroundDarkRed: "#d91111",
        backgroundBlue: "#0A81D1",
        backgroundDarkBlue: "#0F4189",
        backgroundLightBlue: "#DBEAFE",
        
        // text colors
        textPrimary: "#E3E8F3",
        textBlack: "#000000",
        textOrange: "#FF793F",
        textOrange2: "#F29E38", //100%
        textBlue: "#0A81D1",
        textDarkBlue: "#0F4189",
        textRed: "#FE4040",
        textDarkRed: "#D91111",
        textGray: "#6b7280",
        textDarkGray: "#111827",
        
        // borders colors
        borderWhite: "#E9EEF2",
        borderWhite2: "#E9EEF2",
        borderWhite3: "#6E6F8124",
        borderGray: "#E3E8F380",
        borderBlue: "#0A81D1",
        borderRed: "#FE4040",
        borderDarkRed: "#d91111",
        borderDarkBlue: "#0F4189",
        borderOrange: "#F29E3840",
        borderOrange1: "#FF793F",

        // gradient colors
        fromColor1: "#191E25",
        toColor1: "#1A1A1A",

      },
    },
  },
  plugins: [],
};
