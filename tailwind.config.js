module.exports = {
    darkMode: 'class', // Hoặc 'media' nếu bạn muốn sử dụng media queries
    content: ["./src/**/*.{html,js,jsx,ts,tsx,css}"],
    theme: {
      extend: {},
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
    ],
  };
