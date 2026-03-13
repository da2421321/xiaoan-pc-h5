/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderWidth: {
        1: '1px',
      },
      colors: {
        primary: '#1890ff',
        success: '#52c41a',
        warning: '#fa8c16',
        error: '#ff4d4f',
        text: {
          primary: '#333',
          secondary: '#666',
          disabled: '#999',
        },
      },
      boxShadow: {
        custom: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}

