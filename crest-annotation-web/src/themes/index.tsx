import React, { useMemo } from "react";

// material-ui
import { CssBaseline, StyledEngineProvider, ThemeOptions } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// project import
import Typography from "./typography";
import ComponentsOverrides from "./overrides";

interface IProps {
  children?: React.ReactNode;
}

const defaultProps = {};

const Theme = ({ children }: IProps) => {
  const typography = Typography(`'Public Sans', sans-serif`);

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
    }),
    [typography]
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
