import React, { CSSProperties, ReactNode } from "react";
import {
  Box,
  Toolbar as MuiToolbar,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { ToolbarButton } from "./ToolbarButton";

interface IProps {
  title?: string;
  tabs?: ReactNode;
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
const Toolbar = ({ title, tabs, tools, actions, sx }: IProps) => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <div
      style={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      }}
    >
      <MuiToolbar sx={{ ...sx, overflow: "hidden" }}>
        {/* ensure exact placement of center box using flex */}
        <Stack direction="row" flex="1 0 0">
          <Box mr={8}>
            <ToolbarButton
              onClick={() => navigate("/")}
              sx={{ columnGap: theme.spacing(1) }}
            >
              <Logo size={32} color="#fff" />
              <Typography
                fontFamily="Times New Roman"
                variant="h5"
                color="#fff"
                noWrap
              >
                CREST
              </Typography>
            </ToolbarButton>
          </Box>
          {tabs}
        </Stack>
        <Box flex="1 0 0" display="flex" justifyContent="center">
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
