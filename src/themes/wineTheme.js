// Paleta de colores para distribuidora de vinos (Dark & Light Mode)
const wineTheme = {
    // Colores principales - iguales en ambos modos
    primary: {
        light: '#9a334d20',
        main: '#9a334d',
        dark: '#7a2639',
        gradient: 'linear-gradient(135deg, #9a334d 0%, #7a2639 100%)'
    },
    
    secondary: {
        light: '#7c3030',
        main: '#5e2121',
        dark: '#401616'
    },
    
    // Fondos
    background: {
        dark: {
            main: '#1f1e1eff',
            card: '#0a0a0aff',
            elevated: '#252525'
        },
        light: {
            main: '#ffffff',
            card: '#fffefdff',
            elevated: '#f5f0e8'
        }
    },

    // Textos
    text: {
        dark: {
            primary: '#ffffff',
            secondary: '#e0e0e0',
            muted: '#a0a0a0',
            accent: '#e6b899'
        },
        light: {
            primary: '#252525',
            secondary: '#3e3e3e',
            muted: '#6c6c6c',
            accent: '#8c2d40'
        }
    },

    // Bordes
    border: {
        dark: {
            light: '#9a334d30',
            main: '#3a3a3a',
            focus: '#9a334d'
        },
        light: {
            light: '#9a334d20',
            main: '#9a334d50',
            focus: '#9a334d'
        }
    },

    // Colores especiales para vinos
    wine: {
        red: '#a33240',
        burgundy: '#8c2d40',
        rosé: '#e5a59f',
        white: '#e6d9b8',
        gold: '#d4af37'
    } 
};

export default wineTheme;