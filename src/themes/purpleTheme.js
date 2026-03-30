// Modern purple-based e-commerce theme with dark & light modes
const purpleTheme = {
    // Primary colors
    primary: {
        light: '#9c27b020',
        main: '#9c27b0',
        dark: '#7b1fa2',
        gradient: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)'
    },
    
    secondary: {
        light: '#673ab7',
        main: '#512da8',
        dark: '#4527a0'
    },
    
    // Backgrounds
    background: {
        dark: {
            main: '#121212',
            card: '#1e1e1e',
            elevated: '#282828'
        },
        light: {
            main: '#ffffff',
            card: '#f9f6fd',
            elevated: '#f3eafb'
        }
    },

    // Text colors
    text: {
        dark: {
            primary: '#ffffff',
            secondary: '#e0e0e0',
            muted: '#9e9e9e',
            accent: '#ce93d8'
        },
        light: {
            primary: '#212121',
            secondary: '#424242',
            muted: '#757575',
            accent: '#7b1fa2'
        }
    },

    // Borders
    border: {
        dark: {
            light: '#9c27b030',
            main: '#424242',
            focus: '#9c27b0'
        },
        light: {
            light: '#9c27b020',
            main: '#e0e0e0',
            focus: '#9c27b0'
        }
    },

    // Accent colors
    accent: {
        info: '#2196f3',
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        highlight: '#ce93d8'
    }
};

export default purpleTheme;