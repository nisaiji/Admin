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
        backgroundPrimary: "#E3E8F3",
        background: "#111315",
        background1: "#1A1A1A",
        background2: "#0F0F0F",
        background3: "#262626",
        background4: "#3e3e3e",
        background5: "#4a4a52",
        backgroundGray50: "#6868681A",
        backgroundGray15: "#68686826",
        // white shades
        whiteBackground: "#FFFFFF",
        whiteBackground1: "#FAFAFA",
        whiteBackground2: "#E9EEF2", //100%
        whiteBackground3: "#E9EEF280", //50%

        // other background
        backgroundOrange: "#F29E3832", //20%
        backgroundOrange1: "#FF793F",
        backgroundOrange2: "#F29E3808", //5%
        backgroundGreen: "#4CBC9A",
        backgroundDarkGreen: "#4CBC9A26",
        backgroundRed: "#FE4040",
        backgroundDarkRed: "#d91111",
        backgroundDarkRed2: "#FE404026",
        backgroundBlue: "#0A81D1",
        backgroundDarkBlue: "#0F4189",
        backgroundLightBlue: "#DBEAFE",
        backgroundDarkGray: "#2F3035",
        backgroundTableCell: "#1F2123",
        backgroundGrayDays: "#E9EEF226",

        // text colors
        textPrimary: "#E3E8F3",
        textBlack: "#000000",
        textOrange: "#FF793F",
        textOrange2: "#F29E38", //100%
        textBlue: "#0A81D1",
        textDarkBlue: "#0F4189",
        textGreen: "#4CBC9A",
        textRed: "#FE4040",
        textDarkRed: "#D91111",
        textGray: "#6b7280",
        textGray1: "#A9ACB2",
        textDarkGray: "#111827",
        textHoliday: " #FF9933",

        // borders colors
        borderWhite: "#E9EEF2",
        borderWhite2: "#E9EEF2",
        borderWhite3: "#6E6F8124",
        borderLine: "#2b2e4a80",
        borderLine2: "#2b2e4a40",
        borderGray: "#E3E8F380",
        borderGray2: "#C1C0CA",
        borderGray3: " #676565",
        borderBlue: "#0A81D1",
        borderGreen: "#4CBC9A",
        borderRed: "#FE4040",
        borderDarkRed: "#d91111",
        borderDarkBlue: "#0F4189",
        borderOrange: "#F29E3840",
        borderOrange1: "#FF793F",
        borderHoliday: " #FF9933",

        // gradient colors
        fromColor1: "#191E25",
        toColor1: "#1A1A1A",
      },
    },
  },
  plugins: [],
};
