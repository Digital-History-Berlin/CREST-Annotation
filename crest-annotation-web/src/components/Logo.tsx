import { Box, BoxProps } from "@mui/material";
import logo from "../assets/crest.svg";

type IProps = {
  color?: string;
  size?: string | number;
  height?: string | number;
  width?: string | number;
} & Omit<BoxProps, "width" | "height">;

export const Logo = ({
  color = "#f6ecd6",
  size,
  width,
  height,
  ...other
}: IProps) => {
  return (
    <Box
      sx={{
        mask: `url(${logo}) no-repeat center`,
        height: size ?? height,
        width: size ?? width,
        background: color,
      }}
      {...other}
    />
  );
};
