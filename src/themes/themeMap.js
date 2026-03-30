import coralTheme from "./coralTheme";
import mintTheme from "./mintTheme";
import nordicTheme from "./nordicTheme";
import oceanTheme from "./oceanBlueTheme";
import purpleTheme from "./purpleTheme";
import wineTheme from "./wineTheme";


const useThemeProvider = () => {
    
    const getThemeByID = (themeID) => {
        switch (themeID) {
            case 'wine':
                return wineTheme;
            case 'coral':
                return coralTheme;
            case 'mint':
                return mintTheme;
            case 'nordic':
                return nordicTheme;
            case 'ocean':
                return oceanTheme;
            case 'purple':
                return purpleTheme;
            default:
                return wineTheme;
        }
    };

    return {
        getThemeByID
    };
};

export default useThemeProvider;