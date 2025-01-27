/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        customBg: "#1a1b2e",
        custom2: "#913a41",
        customPurple: "#271C2E"
      },
      spacing: {
        88: "22rem",
        132: "33rem",
      },
      screens: {
        '3xl': '1921px',
        '4xl': '2560px',
        '5xl': '3840px',
      },
      fontFamily: {
        mplusRegular: ["MPLUSRounded-Regular"],
        mplusBold: ["MPLUSRounded-Bold"],
      },
    },
  },
  plugins: [],
}

