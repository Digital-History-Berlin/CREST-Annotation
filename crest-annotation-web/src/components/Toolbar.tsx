import React, { CSSProperties, ReactNode } from "react";
import {
  Box,
  Toolbar as MuiToolbar,
  Typography,
  useTheme,
} from "@mui/material";

interface IProps {
  tools?: ReactNode;
  actions?: ReactNode;
  sx?: CSSProperties;
}

const defaultProps = {};

/**
 * Default header and toolbar
 *
 * Combines header and toolbar and should be used as the _header_ component
 * in all views with default layout.
 */
const Toolbar = ({ tools, actions, sx }: IProps) => {
  const theme = useTheme();

  return (
    <div
      style={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      }}
    >
      <MuiToolbar sx={sx}>
        <Typography variant="h4" noWrap component="div">
          CREST
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box>{tools}</Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box>{actions}</Box>
      </MuiToolbar>
    </div>
  );
};

Toolbar.defaultProps = defaultProps;

export default Toolbar;
