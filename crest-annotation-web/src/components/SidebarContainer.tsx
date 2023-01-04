import React, { ReactNode } from "react";
import { Stack, Box, styled, IconButton, Typography } from "@mui/material";
import BackIcon from "@mui/icons-material/ChevronLeft";

interface IProps {
  title?: string;
  actions?: ReactNode;
  children?: ReactNode;
  onBack?: () => void;
}

const defaultProps = {};

const TitleBox = styled(Box)(({ theme }) => ({
  "&": {
    padding: 0,
    color: theme.palette.secondary.contrastText,
    backgroundColor: theme.palette.secondary.main,
    display: "flex",
    alignItems: "stretch",
    height: "40px",

    ".Title": {
      padding: theme.spacing(2),
      alignSelf: "center",
    },

    ".MuiIconButton-root": {
      padding: theme.spacing(0.5),
      borderRadius: 0,
    },
  },
}));

/**
 * Provides the container for components in one of the sidebars
 *
 * Renders a header and scrollable content.
 * All containers will equally share the available height.
 */
const SidebarContainer = ({ title, actions, children, onBack }: IProps) => {
  return (
    // stretch stack to available size
    // share equally between multiple stacks
    <Stack flex="1 1 0" sx={{ overflow: "hidden" }}>
      <TitleBox>
        {onBack && (
          <IconButton onClick={onBack}>
            <BackIcon />
          </IconButton>
        )}
        <Typography className="Title" variant="h6">
          {title}
        </Typography>
        <Box flexGrow={1} />
        {actions}
      </TitleBox>
      {/* make sure content always stretches over full height */}
      <Box flex="1" sx={{ overflow: "auto" }}>
        {children}
      </Box>
    </Stack>
  );
};

SidebarContainer.defaultProps = defaultProps;

export default SidebarContainer;
