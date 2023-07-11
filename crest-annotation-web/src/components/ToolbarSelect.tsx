import { Select, styled } from "@mui/material";

export const ToolbarSelect = styled(Select)(({ theme }) => ({
  "&": {
    ".MuiSvgIcon-root": {
      fill: theme.palette.primary.contrastText,
    },
    color: theme.palette.primary.contrastText,
    ".MuiOutlinedInput-notchedOutline": {
      borderWidth: 0,
    },
  },
}));
