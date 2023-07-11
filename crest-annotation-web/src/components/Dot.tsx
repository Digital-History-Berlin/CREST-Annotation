import React, { CSSProperties } from "react";
import { Box, styled } from "@mui/material";

interface IProps {
  color: string;
  disablePadding?: boolean;
  sx?: CSSProperties;
}

const defaultProps = {};

const DotBox = styled(Box)(({ theme }) => ({
  "&": {
    width: "14px",
    height: "14px",
    borderRadius: "7px",
    border: `1px solid ${theme.palette.divider}`,
  },
}));

const Dot = ({ color, disablePadding, sx }: IProps) => (
  <DotBox
    className="Dot"
    sx={{
      backgroundColor: color,
      mx: !disablePadding ? 2 : 0,
      ...sx,
    }}
  />
);

Dot.defaultProps = defaultProps;

export default Dot;
