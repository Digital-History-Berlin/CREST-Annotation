import { TextField, TextFieldProps } from "@mui/material";

const colorSx = {
  color: "primary.contrastText",
};

const outlineSx = {
  ".MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.contrastText",
  },
};

export const ToolbarSelect = (props: TextFieldProps) => {
  return (
    <TextField
      select
      size="small"
      variant="outlined"
      sx={{
        mx: 1,
        width: 120,
        // enforce foreground color
        "& .MuiFormLabel-root": colorSx,
        "& .MuiFormLabel-root.Mui-focused": colorSx,
        "& .MuiInputBase-root": colorSx,
        "& .MuiSvgIcon-root": colorSx,
        // enforce border color
        ...outlineSx,
        "& .MuiOutlinedInput-root:hover": outlineSx,
        "& .MuiOutlinedInput-root.Mui-focused": outlineSx,
      }}
      {...props}
    />
  );
};
