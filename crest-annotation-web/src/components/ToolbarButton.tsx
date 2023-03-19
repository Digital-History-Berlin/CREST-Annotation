import { Button, ToggleButton, styled } from "@mui/material";

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
