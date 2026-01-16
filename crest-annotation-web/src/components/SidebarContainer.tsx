import React, { PropsWithChildren, ReactNode } from "react";
import { Box, IconButton, Stack, Typography, styled } from "@mui/material";
import BackIcon from "@mui/icons-material/ChevronLeft";

interface IProps {
  title?: string;
  actions?: ReactNode;
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
const SidebarContainer = ({
  title,
  actions,
  children,
  onBack,
}: PropsWithChildren<IProps>) => {
  return (
    // stretch stack to available size
    // share equally between multiple stacks
    <Stack flex="1 1 0" sx={{ overflow: "hidden", width: "600px" }}>
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
      {/* use relative position to allow absolute in children */}
      <Box flex="1" sx={{ overflow: "auto", position: "relative" }}>
        {children}
      </Box>
    </Stack>
  );
};

SidebarContainer.defaultProps = defaultProps;

export default SidebarContainer;
