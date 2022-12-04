import { styled, ToggleButtonGroup } from "@mui/material";

/**
 * Toggle button group optimized to be used inside the toolbar
 */
export default styled(ToggleButtonGroup)(({ theme }) => ({
  "& .MuiToggleButtonGroup-grouped": {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    color: theme.palette.primary.contrastText,

    border: 0,
    "&.Mui-selected": {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.light,
    },
    "&.Mui-disabled": {
      border: 0,
    },
    "&:not(:first-of-type)": {
      borderRadius: theme.shape.borderRadius,
    },
    "&:first-of-type": {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));
