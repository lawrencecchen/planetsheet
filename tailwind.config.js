/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: require('./tailwind-radix-colors.js')
    },
  },
  plugins: [
    // require('@tailwindcss/forms'),
    require("tailwindcss-radix")(),
  ],
}
