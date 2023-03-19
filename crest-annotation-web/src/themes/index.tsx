import React, { PropsWithChildren, useMemo } from "react";
// material-ui
import { CssBaseline, StyledEngineProvider, ThemeOptions } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
// project import
import ComponentsOverrides from "./overrides";
import Palette from "./palette";
import Typography from "./typography";

const defaultProps = {};

const Theme = ({ children }: PropsWithChildren<void>) => {
  const typography = Typography(`'Public Sans', sans-serif`);
  const palette = Palette();

  const themeOptions = useMemo(
    () => ({
      direction: "ltr",
      mixins: {
        toolbar: {
          minHeight: 60,
          paddingTop: 8,
          paddingBottom: 8,
        },
      },
      typography: typography,
      palette: palette,
    }),
    [typography, palette]
  ) as ThemeOptions;

  const theme = createTheme(themeOptions);
  theme.components = ComponentsOverrides(theme);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

Theme.defaultProps = defaultProps;

export default Theme;
