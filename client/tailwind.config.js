/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bakery: {
          50: '#FFF6E9',   // Warm cream background (user spec)
          100: '#FFFBF3',  // Soft vanilla card surface (user spec)
          200: '#EFE5D5',  // Gentle almond border
          300: '#E0CDAF',  // Cookie dough
          400: '#CCA978',  // Toasted golden crust
          500: '#B88444',  // Warm honey / caramel
          600: '#A06D31',  // Deep caramel
          700: '#784E1F',  // Rich hazelnut
          800: '#5A3816',  // Chocolate ganache
          900: '#3D240E',  // Dark espresso / chocolate
          950: '#261507',  // Deepest dark chocolate
        },
        cream: {
          DEFAULT: '#FFF6E9',
          light: '#FFFBF3',
          dark: '#F5EFE6',
        },
        caramel: {
          light: '#F59E0B',
          DEFAULT: '#C77B30',  // user spec: caramel/toffee
          dark: '#A06030',
        },
        chocolate: {
          light: '#78350F',
          DEFAULT: '#4A2C1A',  // user spec: chocolate brown for headings
          dark: '#270F02',
        },
        strawberry: {
          light: '#F48FA0',
          DEFAULT: '#E8647C',  // user spec: strawberry pink for buttons
          dark: '#D04A65',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(74, 44, 26, 0.10), 0 2px 6px -1px rgba(74, 44, 26, 0.06)',
        'warm-lg': '0 12px 40px -4px rgba(74, 44, 26, 0.14), 0 4px 12px -2px rgba(74, 44, 26, 0.08)',
        'warm-xl': '0 20px 60px -6px rgba(74, 44, 26, 0.18), 0 6px 20px -4px rgba(74, 44, 26, 0.10)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}
