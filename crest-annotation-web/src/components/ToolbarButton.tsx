import { Button, Divider, ToggleButton, Tooltip, styled } from "@mui/material";

type ToolbarButtonProps = {
  tooltip: string;
  children: React.ReactNode;
  onClick: () => void;
};

type ToolbarToggleButtonProps = ToolbarButtonProps & {
  value: number;
  selected: boolean;
};

/**
 * Button optimized to be used inside the toolbar
 */
export const ToolbarButton = styled(Button)(({ theme }) => ({
  "&": {
    minWidth: 0,
    padding: theme.spacing(1),
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    color: theme.palette.primary.contrastText,

    border: 0,
    "&.Mui-selected": {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.light,
    },
    "&.Mui-disabled": {
      color: theme.palette.primary.light,
    },
    "& .MuiTooltip-tooltip": {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.text.primary,
      fontSize: theme.typography.pxToRem(12),
      fontWeight: theme.typography.fontWeightRegular,
      boxShadow: theme.shadows[1],
    },
    "& .MuiTooltip-arrow": {
      color: theme.palette.common.white,
    },
  },
}));

/**
 * Toggle button optimized to be used inside the toolbar
 */
export const ToolbarToggleButton = styled(ToggleButton)(({ theme }) => ({
  "&": {
    padding: theme.spacing(1),
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    color: theme.palette.primary.contrastText,

    border: 0,
    "&.Mui-selected": {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.light,
    },
    "&.Mui-disabled": {
      color: theme.palette.primary.light,
    },
  },
}));

export const ToolbarDivider = styled(Divider)(({ theme }) => ({
  "&": {
    backgroundColor: theme.palette.primary.contrastText,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: "1px",
  },
}));

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
  value,
  selected,
  ...props
}: ToolbarToggleButtonProps) => {
  return (
    <Tooltip title={tooltip} arrow placement={"bottom"}>
      <ToolbarToggleButton value={value} selected={selected} {...props}>
        {children}
      </ToolbarToggleButton>
    </Tooltip>
  );
};
