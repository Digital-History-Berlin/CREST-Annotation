import React from "react";
import {
  Button,
  ButtonProps,
  Divider,
  ToggleButton,
  ToggleButtonProps,
  Tooltip,
  styled,
} from "@mui/material";

type ToolbarButtonProps = { tooltip: string } & ButtonProps;

type ToolbarToggleButtonProps = {
  tooltip: string;
} & ToggleButtonProps;

type ToolbarTabButtonProps = {
  tooltip: string;
} & ToggleButtonProps;

/**
 * Button optimized to be used inside the toolbar
 */
export const ToolbarButton = styled(Button)(({ theme }) => ({
  "&": {
    minWidth: 48,
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    justifyContent: "center",
    color: theme.palette.primary.contrastText,

    border: 0,
    "&.Mui-selected": {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.light,
    },
    "&.Mui-disabled": {
      color: theme.palette.primary.light,
      border: "none",
    },
  },
}));

/**
 * Toggle button optimized to be used inside the toolbar
 */
export const ToolbarToggleButton = styled(ToggleButton)(({ theme }) => ({
  "&": {
    minWidth: 48,
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    justifyContent: "center",
    color: theme.palette.primary.contrastText,

    border: 0,
    "&.Mui-selected": {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.light,
    },
    "&.Mui-disabled": {
      color: theme.palette.primary.light,
      border: "none",
    },
  },
}));

/**
 * Button optimized to be used inside the toolbar as a tab
 */
export const ToolbarTabButton = styled(ToggleButton)(({ theme }) => ({
  "&": {
    minWidth: 48,
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    justifyContent: "center",
    color: theme.palette.primary.contrastText,

    border: 0,
    "&.Mui-selected": {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.common.white,
    },
    "&.Mui-disabled": {
      color: theme.palette.primary.light,
      border: "none",
    },
  },
}));

export const ToolbarDivider = styled(Divider)(({ theme }) => ({
  "&": {
    backgroundColor: theme.palette.primary.light,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}));

ToolbarDivider.defaultProps = {
  orientation: "vertical",
  flexItem: true,
};

export const ToolbarButtonWithTooltip = ({
  tooltip,
  children,
  ...props
}: ToolbarButtonProps) => {
  return (
    <Tooltip title={tooltip} arrow placement={"bottom"}>
      <ToolbarButton {...props}>{children}</ToolbarButton>
    </Tooltip>
  );
};

export const ToolbarToggleButtonWithTooltip = ({
  tooltip,
  children,
  ...props
}: ToolbarToggleButtonProps) => {
  return (
    <Tooltip title={tooltip} arrow placement={"bottom"}>
      <ToolbarToggleButton {...props}>{children}</ToolbarToggleButton>
    </Tooltip>
  );
};

export const ToolbarTabButtonWithTooltip = ({
  tooltip,
  children,
  ...props
}: ToolbarTabButtonProps) => {
  return (
    <Tooltip title={tooltip} arrow placement={"bottom"}>
      <ToolbarTabButton {...props}>{children}</ToolbarTabButton>
    </Tooltip>
  );
};
