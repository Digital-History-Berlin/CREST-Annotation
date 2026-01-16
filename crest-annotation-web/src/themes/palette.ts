import grey from "@mui/material/colors/grey";
import yellow from "@mui/material/colors/yellow";

const Palette = () => ({
  secondary: {
    light: grey[100],
    main: grey[200],
    dark: grey[300],
    contrastText: grey[600],
  },
  warning: {
    light: yellow[100],
    main: yellow[400],
    dark: yellow[700],
    contrastText: grey[900],
  },
});

export default Palette;
