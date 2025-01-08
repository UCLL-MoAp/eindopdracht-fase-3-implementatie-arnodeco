/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        customBg: "#0E1124",
        custom2: "#913a41",
        customPurple: "#271C2E"
      }
    },
  },
  plugins: [],
}

