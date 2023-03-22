import React, { CSSProperties, ReactNode } from "react";
import { Security } from "@mui/icons-material";
import {
  Box,
  Toolbar as MuiToolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToolbarButton } from "./ToolbarButton";

interface IProps {
  title?: string;
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
const Toolbar = ({ title, tools, actions, sx }: IProps) => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <div
      style={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      }}
    >
      <MuiToolbar sx={sx}>
        <Box flex="1 0 0" display="flex" justifyContent="flex-start">
          <ToolbarButton
            onClick={() => navigate("/")}
            sx={{ columnGap: theme.spacing(1) }}
          >
            <Security />
            <Typography fontFamily="Times New Roman" variant="h5" noWrap>
              CREST
            </Typography>
          </ToolbarButton>
        </Box>
        <Box>
          {title && (
            <Typography variant="h4" noWrap component="div">
              {title}
            </Typography>
          )}
          {tools}
        </Box>
        <Box flex="1 0 0" display="flex" justifyContent="flex-end">
          {actions}
        </Box>
      </MuiToolbar>
    </div>
  );
};

Toolbar.defaultProps = defaultProps;

export default Toolbar;
