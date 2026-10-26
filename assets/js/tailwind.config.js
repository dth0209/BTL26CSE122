        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'], },
                    colors: {
                        brand: {
                            50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0',
                            500: '#10b981', 600: '#059669', 700: '#047857', 
                            800: '#065f46', 900: '#064e3b',
                        }
                    },
                    borderRadius: { 'xl': '12px', '2xl': '16px', '3xl': '24px', '4xl': '32px', },
                    boxShadow: { 'soft': '0 8px 30px rgba(0, 0, 0, 0.04)', 'glow': '0 0 20px rgba(16, 185, 129, 0.2)' }
                }
            }
        }
