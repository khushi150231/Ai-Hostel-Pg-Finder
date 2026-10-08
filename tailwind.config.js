/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#FBF9F6',   // warm cream / off-white
          100: '#F5EFEA',  // soft cream surface
          200: '#E8DED4',  // light sand
          300: '#D5C4B4',  // muted taupe
          400: '#AC8968',  // Warm Beige (Palette: #AC8968)
          500: '#93785B',  // Taupe/Brown (Palette: #93785B - secondary / borders)
          600: '#865D36',  // Warm Brown (Palette: #865D36 - primary buttons / active)
          700: '#6F4B29',  // Deep Warm Brown (hover / focus)
          800: '#55391F',  // Rich Espresso Brown
          900: '#3E362E',  // Dark Brown (Palette: #3E362E)
          950: '#2A241E',  // Deepest Dark Brown
        },
        accent: {
          50: '#FAF8F5',
          100: '#F3ECE5',
          200: '#E5D9CC',
          300: '#C8B5A2',
          400: '#AC8968',  // Warm Beige (Palette: #AC8968 - highlights / badges)
          500: '#A69080',  // Light Beige/Grey (Palette: #A69080 - muted text & secondary UI)
          600: '#93785B',  // Taupe/Brown (Palette: #93785B)
          700: '#865D36',  // Warm Brown (Palette: #865D36)
          800: '#5F4228',
          900: '#3E362E',  // Dark Brown (Palette: #3E362E)
        },
        dark: {
          950: '#231E19',  // Deepest Warm Black/Brown
          900: '#3E362E',  // Dark Brown (Palette: #3E362E - base dark background)
          850: '#463D34',  // Slightly elevated surface
          800: '#4E443A',  // Dark surface / card background
          700: '#5D5246',  // Elevated cards & borders
          600: '#6F6254',  // Subtle borders
          500: '#847565',  // Secondary icons / controls
          400: '#A69080',  // Light Beige/Grey (Palette: #A69080 - muted text)
          300: '#C2B1A2',  // Secondary text
          200: '#DED3C8',  // Light text
          100: '#EFE7DF',  // Off-white text
          50: '#FBF9F6',   // Warm off-white
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      opacity: {
        '6': '0.06',
        '8': '0.08',
        '12': '0.12',
        '15': '0.15',
        '25': '0.25',
      },
    },
  },
  plugins: [],
}
