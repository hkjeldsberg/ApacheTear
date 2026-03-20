import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        monokai: {
          bg: '#272822',
          'bg-light': '#3e3d32',
          'bg-lighter': '#49483e',
          fg: '#f8f8f2',
          'fg-muted': '#75715e',
          yellow: '#e6db74',
          green: '#a6e22e',
          blue: '#66d9ef',
          pink: '#f92672',
          purple: '#ae81ff',
          orange: '#fd971f',
        },
      },
      screens: {
        sm: '640px',
        md: '1024px',
        lg: '1440px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease',
      },
    },
  },
  plugins: [],
}

export default config
