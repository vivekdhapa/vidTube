/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yt: {
          bg: '#0f0f0f',
          surface: '#1a1a1a',
          hover: '#272727',
          border: '#3f3f3f',
          red: '#ff0000',
          blue: '#3ea6ff',
          text: '#f1f1f1',
          muted: '#aaaaaa',
        },
      },
    },
  },
  plugins: [],
}
